import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  enquiryAvailability,
  handleEnquiry,
  validateEnquiry,
} from "../src/lib/enquiry";
import { MAX_UPLOAD_BYTES } from "../src/lib/enquiry-config";

const origin = "https://vavi.example";
const webhookEnv = {
  ENQUIRY_WEBHOOK_URL: "https://receiver.example/enquiries",
};
const neonEnv = {
  DATABASE_URL: "postgresql://test:example@ep-test-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  AWS_ACCESS_KEY_ID: "test-key",
  AWS_SECRET_ACCESS_KEY: "test-secret",
  AWS_ENDPOINT_URL_S3: "https://storage.example.test",
  AWS_REGION: "ap-southeast-1",
};
function form() {
  const data = new FormData();
  data.set("name", "A Designer");
  data.set("email", "designer@example.com");
  data.set("idea", "A botanical wall for a reading room.");
  return data;
}
function request(data = form(), headers: Record<string, string> = {}) {
  return new Request(`${origin}/api/enquiry`, {
    method: "POST",
    headers: { origin, ...headers },
    body: data,
  });
}
function services(extra: Parameters<typeof handleEnquiry>[1] = {}) {
  return { env: webhookEnv, buckets: new Map(), ...extra };
}

test("unconfigured and unsafe configurations are honestly unavailable", async () => {
  assert.deepEqual(enquiryAvailability({}), { available: false });
  assert.deepEqual(
    enquiryAvailability({ ENQUIRY_WEBHOOK_URL: "http://receiver.example" }),
    { available: false },
  );
  assert.deepEqual(
    enquiryAvailability({
      ENQUIRY_STORAGE_DIR: path.resolve("public", "uploads"),
    }),
    { available: false },
  );
  assert.equal(
    (await handleEnquiry(request(), services({ env: {} }))).status,
    503,
  );
});

test("origin checks reject cross-origin and missing-origin submissions", async () => {
  assert.equal(
    (
      await handleEnquiry(
        request(form(), { origin: "https://other.example" }),
        services(),
      )
    ).status,
    403,
  );
  const missing = request();
  missing.headers.delete("origin");
  assert.equal((await handleEnquiry(missing, services())).status, 403);
});

test("origin verification uses the actual Host when Next normalizes loopback URLs", async () => {
  const send = (origin: string, env: Record<string, string> = webhookEnv, host = "127.0.0.1:3000") => handleEnquiry(new Request("http://localhost:3000/api/enquiry", {
    method: "POST",
    headers: { host, origin, "x-forwarded-host": "untrusted.example" },
    body: form(),
  }), services({ env, fetch: async () => new Response(null, { status: 202 }) }));
  assert.equal((await send("http://127.0.0.1:3000")).status, 201);
  assert.equal((await send("http://localhost:3000")).status, 403);
  assert.equal((await send("https://untrusted.example")).status, 403);
  assert.equal((await send("https://vavi.example", { ...webhookEnv, ENQUIRY_ALLOWED_ORIGIN: "https://vavi.example" })).status, 201);
  assert.equal((await send("http://vavi.example", webhookEnv, "vavi.example")).status, 201);
  assert.equal((await send("http://vavi.example", webhookEnv, "vavi.example:80")).status, 201);
});

test("validation gives useful field errors and rejects duplicate or unsupported fields", async () => {
  const missing = new FormData();
  missing.set("email", "not-an-email");
  const result = await handleEnquiry(request(missing), services());
  assert.equal(result.status, 422);
  assert.deepEqual(Object.keys((await result.json()).errors).sort(), [
    "email",
    "idea",
    "name",
  ]);
  const duplicate = form();
  duplicate.append("name", "Unexpected second value");
  assert.equal(
    (await handleEnquiry(request(duplicate), services())).status,
    400,
  );
  const unknown = form();
  unknown.set("arbitraryField", "untrusted");
  assert.equal((await handleEnquiry(request(unknown), services())).status, 400);
});

test("honeypot rejects automated submissions without fake success", async () => {
  const data = form();
  data.set("website", "https://spam.example");
  assert.equal((await handleEnquiry(request(data), services())).status, 400);
});

test("upload validation checks content signature, declared MIME, extension and maximum size", async () => {
  const mismatch = form();
  mismatch.set(
    "inspiration",
    new Blob(["<script>bad</script>"], { type: "image/png" }),
    "tile.png",
  );
  assert.ok((await validateEnquiry(mismatch)).errors.inspiration);
  const wrongMime = form();
  wrongMime.set(
    "inspiration",
    new Blob(["%PDF-1.4\n"], { type: "image/png" }),
    "idea.png",
  );
  assert.ok((await validateEnquiry(wrongMime)).errors.inspiration);
  const wrongExtension = form();
  wrongExtension.set(
    "inspiration",
    new Blob(["%PDF-1.4\n"], { type: "application/pdf" }),
    "idea.exe",
  );
  assert.ok((await validateEnquiry(wrongExtension)).errors.inspiration);
  const oversized = form();
  oversized.set(
    "inspiration",
    new Blob([new Uint8Array(MAX_UPLOAD_BYTES + 1)], { type: "image/png" }),
    "large.png",
  );
  assert.ok((await validateEnquiry(oversized)).errors.inspiration);
  const valid = form();
  valid.set(
    "inspiration",
    new Blob(["%PDF-1.4\nconcept"], { type: "application/pdf" }),
    "concept.pdf",
  );
  assert.equal((await validateEnquiry(valid)).upload?.mime, "application/pdf");
});

test("total streamed body size is bounded even without a content-length header", async () => {
  const huge = new FormData();
  huge.set("idea", "x".repeat(MAX_UPLOAD_BYTES + 70 * 1024));
  const req = request(huge);
  req.headers.delete("content-length");
  assert.equal((await handleEnquiry(req, services())).status, 413);
});

test("webhook acceptance is required; payload has contextual fields and optional artwork", async () => {
  const data = form();
  data.set("location", "Toronto");
  data.set(
    "inspiration",
    new Blob(["%PDF-1.4\nconcept"], { type: "application/pdf" }),
    "concept.pdf",
  );
  const deliver: typeof fetch = async (_input, init) => {
    assert.ok(init?.body instanceof FormData);
    const delivered = init.body;
    const record = JSON.parse(String(delivered.get("enquiry")));
    assert.equal(record.email, "designer@example.com");
    assert.equal(record.location, "Toronto");
    assert.equal(record.inspiration.filename, "inspiration.pdf");
    assert.ok(delivered.get("inspiration") instanceof Blob);
    return new Response(null, { status: 202 });
  };
  const accepted = await handleEnquiry(
    request(data),
    services({ fetch: deliver }),
  );
  assert.equal(accepted.status, 201);
  assert.match((await accepted.json()).reference, /^[0-9a-f-]{36}$/);
  const failure = await handleEnquiry(
    request(),
    services({ fetch: async () => new Response(null, { status: 503 }) }),
  );
  assert.equal(failure.status, 502);
  assert.equal((await failure.json()).reference, undefined);
});

test("upstream network errors never become successful submissions", async () => {
  const response = await handleEnquiry(
    request(),
    services({
      fetch: async () => {
        throw new Error("private transport detail");
      },
    }),
  );
  assert.equal(response.status, 502);
  assert.ok(!(await response.text()).includes("private transport detail"));
});

test("explicit filesystem adapter persists record and artwork in a private location", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "vavi-enquiry-test-"));
  try {
    const data = form();
    data.set(
      "inspiration",
      new Blob(["%PDF-1.4\nconcept"], { type: "application/pdf" }),
      "../../original.pdf",
    );
    const response = await handleEnquiry(
      request(data),
      services({ env: { ENQUIRY_STORAGE_DIR: directory } }),
    );
    assert.equal(response.status, 201);
    const { reference } = await response.json();
    assert.deepEqual(await readdir(directory), [reference]);
    const record = JSON.parse(
      await readFile(path.join(directory, reference, "enquiry.json"), "utf8"),
    );
    assert.equal(record.inspiration.originalName, "original.pdf");
    assert.equal(
      await readFile(
        path.join(directory, reference, "inspiration.pdf"),
        "utf8",
      ),
      "%PDF-1.4\nconcept",
    );
  } finally {
    // directory is the exact absolute mkdtemp return, under the OS temporary directory.
    assert.ok(
      path.resolve(directory).startsWith(path.resolve(os.tmpdir()) + path.sep),
    );
    await rm(directory, { recursive: true, force: true });
  }
});

test("rate limiting is bounded, ignores untrusted forwarding headers and expires", async () => {
  const buckets = new Map();
  const env = { ...webhookEnv };
  const send = (time: number, ip: string) =>
    handleEnquiry(request(form(), { "x-forwarded-for": ip }), {
      env,
      buckets,
      now: () => time,
      fetch: async () => new Response(null, { status: 202 }),
    });
  for (let n = 0; n < 5; n++)
    assert.equal((await send(1000, `192.0.2.${n}`)).status, 201);
  assert.equal((await send(1000, "192.0.2.99")).status, 429);
  assert.equal(buckets.size, 1);
  assert.equal((await send(601001, "192.0.2.99")).status, 201);
});

test("invalid calendar dates are rejected", async () => {
  const data = form();
  data.set("desiredDate", "2027-02-30");
  assert.ok((await validateEnquiry(data)).errors.desiredDate);
  data.set("desiredDate", "0000-01-01");
  assert.ok((await validateEnquiry(data)).errors.desiredDate);
});

test("Neon availability requires complete configuration and rejects conflicting adapters", () => {
  assert.deepEqual(enquiryAvailability(neonEnv), { available: true });
  assert.deepEqual(enquiryAvailability({ DATABASE_URL: neonEnv.DATABASE_URL }), { available: false });
  assert.deepEqual(enquiryAvailability({ ...neonEnv, DATABASE_URL: "not-a-url" }), { available: false });
  assert.deepEqual(enquiryAvailability({ ...neonEnv, ...webhookEnv }), { available: false });
  assert.deepEqual(enquiryAvailability({ ...neonEnv, ENQUIRY_STORAGE_DIR: path.resolve("private-enquiries") }), { available: false });
  assert.deepEqual(enquiryAvailability({ ...neonEnv, AWS_ENDPOINT_URL_S3: "http://storage.example.test" }), { available: false });
});

test("Neon submission passes validated fields and attachment to persistence before confirming receipt", async () => {
  const data = form();
  data.set("location", "Canada");
  data.set("company", "Test studio");
  data.set("desiredDate", "2027-04-12");
  data.set("inspiration", new Blob(["%PDF-1.4\nconcept"], { type: "application/pdf" }), "concept.pdf");
  let saved = false;
  const result = await handleEnquiry(request(data), services({
    env: neonEnv,
    persistNeon: async (config, record, upload) => {
      assert.equal(config.kind, "neon");
      assert.equal(config.bucket, "viva-tile-studio");
      assert.equal(record.name, "A Designer");
      assert.equal(record.location, "Canada");
      assert.equal(record.company, "Test studio");
      assert.equal(record.desiredDate, "2027-04-12");
      assert.equal(record.inspiration?.originalName, "concept.pdf");
      assert.equal(upload?.bytes.toString(), "%PDF-1.4\nconcept");
      saved = true;
    },
  }));
  assert.equal(saved, true);
  assert.equal(result.status, 201);
  const body = await result.json();
  assert.match(body.reference, /^[0-9a-f-]{36}$/);
  assert.deepEqual(Object.keys(body).sort(), ["message", "reference"]);
});

test("Neon write failures return an honest error without credentials or false confirmation", async () => {
  const result = await handleEnquiry(request(), services({
    env: neonEnv,
    persistNeon: async () => { throw new Error(`private error: ${neonEnv.DATABASE_URL}`); },
  }));
  assert.equal(result.status, 502);
  const body = await result.json();
  assert.equal(body.reference, undefined);
  assert.ok(!JSON.stringify(body).includes("postgresql://"));
});

test("invalid Neon enquiries never reach database or storage", async () => {
  let writes = 0;
  const data = form();
  data.set("email", "invalid");
  const result = await handleEnquiry(request(data), services({
    env: neonEnv,
    persistNeon: async () => { writes++; },
  }));
  assert.equal(result.status, 422);
  assert.equal(writes, 0);
});
