import test from "node:test";
import assert from "node:assert/strict";
import {
  deliverEnquiryNotification,
  handleNotificationRetry,
  isNotificationEmail,
  notificationConfiguration,
  retryEnquiryNotifications,
  SAFE_RETRY_WINDOW_MS,
  type NotificationJob,
  type NotificationPayload,
  type NotificationServices,
  type NotificationStore,
} from "../src/lib/enquiry-notifications";
import type { EnquiryRecord } from "../src/lib/enquiry-neon";

const now = Date.parse("2026-10-20T17:00:00.000Z");
const env = {
  RESEND_API_KEY: "re_test",
  ENQUIRY_NOTIFICATION_FROM: "inquiries@vavi.example",
  ENQUIRY_NOTIFICATION_TO: "owner@vavi.example",
};
const record: EnquiryRecord = {
  reference: "cb6d2e8a-a4bb-4db7-a875-bdd987bd98f7",
  receivedAt: new Date(now).toISOString(),
  name: "A Designer",
  email: "designer@example.test",
  idea: "A botanical wall for a reading room.",
  projectType: "Residential",
  application: "Feature wall",
  location: "Toronto",
  dimensions: "3 by 2 metres",
  company: "Example Studio",
  phone: "+1 555 0100",
  desiredDate: "2027-01-20",
  inspiration: null,
};

type Outcome = Parameters<NotificationStore["finish"]>[1];
type LogEvent = Parameters<NonNullable<NotificationServices["log"]>>[0];

function fixture(overrides: Partial<NotificationJob> = {}) {
  let clock = now;
  let nextAttempt = now;
  let leaseUntil = 0;
  let status: Outcome | "pending" | "sending" = "pending";
  let job: NotificationJob = {
    reference: record.reference,
    record: structuredClone(record),
    attempts: 0,
    first_attempt_at: null,
    payload: null,
    lease_token: "",
    ...overrides,
  };
  const events: string[] = [];
  const logs: LogEvent[] = [];
  const finishes: { outcome: Outcome; detail: string; retrySeconds: number }[] = [];
  const requests: { url: string; init: RequestInit; payload: NotificationPayload }[] = [];
  const failures = { claim: false, prepare: false, finish: false, finishSent: false };
  const store: NotificationStore = {
    async claim(reference) {
      events.push("claim");
      if (failures.claim) throw new Error("private database credentials must not be logged");
      if ((reference && reference !== job.reference) || status === "sent" || status === "needs_review" || clock < nextAttempt || clock < leaseUntil) return null;
      status = "sending";
      leaseUntil = clock + 300_000;
      job.attempts++;
      job.lease_token = `lease-${job.attempts}`;
      return structuredClone(job);
    },
    async prepare(claimed, payload) {
      events.push("prepare");
      if (failures.prepare) throw new Error("database unavailable while preparing");
      assert.equal(claimed.lease_token, job.lease_token);
      job.payload ??= structuredClone(payload);
      job.first_attempt_at ??= new Date(clock).toISOString();
      return structuredClone(job);
    },
    async finish(claimed, outcome, detail, retrySeconds = 60) {
      events.push(`finish:${outcome}`);
      if (failures.finish || (failures.finishSent && outcome === "sent")) throw new Error("database unavailable while acknowledging");
      assert.equal(claimed.lease_token, job.lease_token);
      finishes.push({ outcome, detail, retrySeconds });
      status = outcome;
      nextAttempt = clock + retrySeconds * 1000;
      leaseUntil = 0;
    },
  };
  let provider: (init: RequestInit) => Promise<Response> = async () => Response.json({ id: "email-123" });
  const services: NotificationServices = {
    env: { ...env },
    store,
    now: () => clock,
    log: (event) => logs.push(event),
    fetch: async (input, init) => {
      events.push("send");
      assert.ok(init);
      const payload = JSON.parse(String(init.body)) as NotificationPayload;
      requests.push({ url: String(input), init, payload });
      // A provider request must never precede a durable payload and attempt time.
      assert.deepEqual(payload, job.payload);
      assert.ok(job.first_attempt_at);
      return provider(init);
    },
  };
  return {
    store, services, events, logs, finishes, requests, failures,
    get job() { return job; },
    get status() { return status; },
    advance(ms: number) { clock += ms; },
    setProvider(value: typeof provider) { provider = value; },
    setJob(value: Partial<NotificationJob>) { job = { ...job, ...value }; },
  };
}

test("a claimed saved inquiry sends the branded email with validated Reply-To and fixed dashboard links", async () => {
  const f = fixture();
  assert.equal(await deliverEnquiryNotification(record.reference, f.services), "sent");
  assert.deepEqual(f.events, ["claim", "prepare", "send", "finish:sent"]);
  assert.equal(f.requests.length, 1);
  const { url, init, payload } = f.requests[0];
  assert.equal(url, "https://api.resend.com/emails");
  assert.equal(init.method, "POST");
  assert.equal(init.redirect, "error");
  assert.equal(init.cache, "no-store");
  assert.ok(init.signal instanceof AbortSignal);
  const headers = new Headers(init.headers);
  assert.equal(headers.get("authorization"), "Bearer re_test");
  assert.equal(headers.get("content-type"), "application/json");
  assert.equal(headers.get("idempotency-key"), `vavi-inquiry/${record.reference}`);
  assert.equal(payload.from, "VAVI Tile Studio <inquiries@vavi.example>");
  assert.deepEqual(payload.to, ["owner@vavi.example"]);
  assert.equal(payload.reply_to, record.email);
  assert.equal(payload.subject, "New Inquiry — VAVI Tile Studio");
  assert.match(payload.html, /You’ve received a new inquiry\./);
  assert.match(payload.html, /View Inquiry Dashboard/);
  assert.ok((payload.html.match(/href="https:\/\/vavi-tile-studio-dashboard\.vercel\.app\/"/g) ?? []).length >= 2);
  assert.ok(payload.text.includes("https://vavi-tile-studio-dashboard.vercel.app/"));
  for (const value of [record.name, record.email, record.idea, record.phone, record.projectType, record.application, record.location, record.dimensions, record.company, "America/Toronto"]) {
    assert.ok(payload.html.includes(value));
    assert.ok(payload.text.includes(value));
  }
  assert.deepEqual(f.finishes, [{ outcome: "sent", detail: "email-123", retrySeconds: 60 }]);
  assert.deepEqual(f.logs, []);
});

test("provider failure keeps the saved inquiry and retries once with the same request identity", async () => {
  const f = fixture();
  f.setProvider(async () => Response.json({ message: "private provider response" }, { status: 503 }));
  assert.equal(await deliverEnquiryNotification(record.reference, f.services), "failed");
  assert.deepEqual(f.job.record, record);
  assert.equal(f.status, "failed");
  const original = f.requests[0];
  assert.equal(await deliverEnquiryNotification(record.reference, f.services), "idle");
  assert.equal(f.requests.length, 1, "backoff prevents an immediate retry");
  f.advance(60_000);
  f.setProvider(async () => Response.json({ id: "email-123" }));
  assert.equal(await deliverEnquiryNotification(record.reference, f.services), "sent");
  assert.equal(f.requests.length, 2);
  assert.equal(f.requests[1].init.body, original.init.body);
  assert.equal(new Headers(f.requests[1].init.headers).get("idempotency-key"), new Headers(original.init.headers).get("idempotency-key"));
  assert.deepEqual(f.logs, [{ reference: record.reference, code: "resend_http_503", status: "failed" }]);
  assert.ok(!JSON.stringify(f.logs).includes("private provider response"));
});

test("a retry preserves frozen sender, recipient, Reply-To and template despite configuration or record changes", async () => {
  const f = fixture();
  f.setProvider(async () => Response.json({}, { status: 503 }));
  await deliverEnquiryNotification(record.reference, f.services);
  const frozen = f.requests[0].init.body;
  f.advance(60_000);
  f.services.env = {
    RESEND_API_KEY: "re_replacement",
    ENQUIRY_NOTIFICATION_FROM: "different-sender@vavi.example",
    ENQUIRY_NOTIFICATION_TO: "different-owner@vavi.example",
    ENQUIRY_NOTIFICATION_TIMEZONE: "Asia/Tokyo",
  };
  f.setJob({ record: { ...record, name: "Changed name", idea: "Changed idea", email: "different@example.test" } });
  f.setProvider(async () => Response.json({ id: "email-123" }));
  assert.equal(await deliverEnquiryNotification(record.reference, f.services), "sent");
  assert.equal(f.requests[1].init.body, frozen);
  assert.equal(new Headers(f.requests[1].init.headers).get("authorization"), "Bearer re_replacement");
});

test("existing frozen template bytes are sent without regenerating email content", async () => {
  const payload: NotificationPayload = {
    from: "VAVI Tile Studio <original@vavi.example>", to: ["original-owner@vavi.example"],
    reply_to: record.email, subject: "Previously rendered subject", html: "<p>Previously rendered HTML</p>", text: "Previously rendered text",
  };
  const f = fixture({ payload, first_attempt_at: new Date(now - 60_000).toISOString() });
  assert.equal(await deliverEnquiryNotification(record.reference, f.services), "sent");
  assert.deepEqual(f.requests[0].payload, payload);
});

test("sent and currently leased jobs are not sent again", async () => {
  const f = fixture();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  f.setProvider(async () => { await gate; return Response.json({ id: "email-123" }); });
  const first = deliverEnquiryNotification(record.reference, f.services);
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(await deliverEnquiryNotification(record.reference, f.services), "idle");
  release();
  assert.equal(await first, "sent");
  assert.equal(await deliverEnquiryNotification(record.reference, f.services), "idle");
  assert.equal(f.requests.length, 1);
});

test("an unknown reference or an empty queue causes no provider call", async () => {
  const f = fixture();
  assert.equal(await deliverEnquiryNotification("5d3e6ae9-99a2-4ef7-abde-b352ce701d44", f.services), "idle");
  assert.equal(f.requests.length, 0);
  assert.equal(f.finishes.length, 0);
});

test("uncertain acceptance stops at the safe 23-hour boundary and requires review", async () => {
  for (const age of [SAFE_RETRY_WINDOW_MS, SAFE_RETRY_WINDOW_MS + 60_000]) {
    const f = fixture({ first_attempt_at: new Date(now - age).toISOString() });
    assert.equal(await deliverEnquiryNotification(record.reference, f.services), "needs_review");
    assert.equal(f.requests.length, 0);
    assert.equal(f.finishes[0].detail, "idempotency_window_expired");
    assert.equal(await deliverEnquiryNotification(record.reference, f.services), "idle");
  }
  const within = fixture({ first_attempt_at: new Date(now - SAFE_RETRY_WINDOW_MS + 1).toISOString() });
  assert.equal(await deliverEnquiryNotification(record.reference, within.services), "sent");
});

test("an old inquiry with no prior provider attempt can still be sent", async () => {
  const f = fixture({ record: { ...record, receivedAt: "2025-01-01T00:00:00.000Z" } });
  assert.equal(await deliverEnquiryNotification(record.reference, f.services), "sent");
  assert.equal(f.job.first_attempt_at, new Date(now).toISOString());
});

test("missing or invalid provider configuration queues a failure without sending", async () => {
  for (const invalid of [
    {},
    { ...env, RESEND_API_KEY: "" },
    { ...env, RESEND_API_KEY: "not-a-resend-key" },
    { ...env, ENQUIRY_NOTIFICATION_FROM: "VAVI <inquiries@vavi.example>" },
    { ...env, ENQUIRY_NOTIFICATION_TO: "one@vavi.example,two@vavi.example" },
    { ...env, ENQUIRY_NOTIFICATION_TO: "owner@vavi.example\r\nBcc: other@example.test" },
    { ...env, ENQUIRY_NOTIFICATION_TIMEZONE: "Not/A_Timezone" },
  ]) {
    const f = fixture();
    f.services.env = invalid;
    assert.equal(await deliverEnquiryNotification(record.reference, f.services), "failed");
    assert.equal(f.requests.length, 0);
    assert.equal(f.job.first_attempt_at, null);
    assert.equal(f.job.payload, null);
    assert.deepEqual(f.job.record, record);
    assert.deepEqual(f.finishes, [{ outcome: "failed", detail: "notification_configuration_missing", retrySeconds: 300 }]);
  }
});

test("configuration trims values and defaults to the labelled Toronto timezone", () => {
  assert.deepEqual(notificationConfiguration({ ...env, RESEND_API_KEY: " re_test ", ENQUIRY_NOTIFICATION_FROM: " inquiries@vavi.example " }), {
    apiKey: "re_test", from: "VAVI Tile Studio <inquiries@vavi.example>", to: "owner@vavi.example", timeZone: "America/Toronto",
  });
  assert.equal(isNotificationEmail("designer+project@example.test"), true);
});

test("malformed visitor Reply-To addresses never reach Resend", async () => {
  for (const email of ["", "Name <designer@example.test>", "one@example.test,two@example.test", "designer@example.test\r\nBcc: attacker@example.test", "a..b@example.test", "invalid", `${"a".repeat(250)}@example.test`]) {
    const f = fixture({ record: { ...record, email } });
    assert.equal(await deliverEnquiryNotification(record.reference, f.services), "needs_review");
    assert.equal(f.requests.length, 0);
    assert.equal(f.finishes[0].detail, "invalid_reply_to");
    assert.equal(f.job.payload, null);
  }
});

test("a conflicting idempotent payload needs review but a concurrent request remains retryable", async () => {
  for (const [name, expected] of [["invalid_idempotent_request", "needs_review"], ["concurrent_idempotent_requests", "failed"]] as const) {
    const f = fixture();
    f.setProvider(async () => Response.json({ name, message: "private response" }, { status: 409 }));
    assert.equal(await deliverEnquiryNotification(record.reference, f.services), expected);
    assert.equal(f.status, expected);
    assert.equal(f.finishes[0].detail, "resend_http_409");
    assert.deepEqual(f.logs, [{ reference: record.reference, code: "resend_http_409", status: expected }]);
  }
});

test("provider backoff respects Retry-After and caps excessively long delays", async () => {
  for (const [retryAfter, expected] of [["120", 120], ["999999", 3600], ["invalid", 60], ["-12", 60]] as const) {
    const f = fixture();
    f.setProvider(async () => Response.json({}, { status: 429, headers: { "Retry-After": retryAfter } }));
    assert.equal(await deliverEnquiryNotification(record.reference, f.services), "failed");
    assert.equal(f.finishes[0].retrySeconds, expected);
  }
  const repeated = fixture({ attempts: 3 });
  repeated.setProvider(async () => Response.json({}, { status: 503 }));
  await deliverEnquiryNotification(record.reference, repeated.services);
  assert.equal(repeated.finishes[0].retrySeconds, 480);
});

test("an HTTP success without a valid provider ID is an uncertain failure", async () => {
  for (const body of ["not-json", JSON.stringify({}), JSON.stringify({ id: "private\r\nvalue" })]) {
    const f = fixture();
    f.setProvider(async () => new Response(body, { status: 200 }));
    assert.equal(await deliverEnquiryNotification(record.reference, f.services), "failed");
    assert.equal(f.status, "failed");
    assert.equal(f.finishes[0].detail, "resend_http_200");
    assert.ok(f.job.payload);
  }
});

test("network errors and timeouts preserve payload and schedule retry without leaking exception details", async () => {
  for (const error of [new TypeError("secret transport exception"), new DOMException("secret timeout", "TimeoutError")]) {
    const f = fixture();
    f.setProvider(async () => { throw error; });
    assert.equal(await deliverEnquiryNotification(record.reference, f.services), "failed");
    assert.deepEqual(f.job.record, record);
    assert.ok(f.job.payload);
    assert.ok(f.job.first_attempt_at);
    assert.deepEqual(f.finishes, [{ outcome: "failed", detail: "notification_transport_or_state_failure", retrySeconds: 60 }]);
    assert.deepEqual(f.logs, [{ reference: record.reference, code: "notification_transport_or_state_failure", status: "failed" }]);
  }
});

test("failure to persist the provider payload prevents any provider request", async () => {
  const f = fixture();
  f.failures.prepare = true;
  assert.equal(await deliverEnquiryNotification(record.reference, f.services), "failed");
  assert.equal(f.requests.length, 0);
  assert.equal(f.job.first_attempt_at, null);
  assert.equal(f.job.payload, null);
  assert.equal(f.status, "failed");
});

test("lost success acknowledgement retries the exact provider payload and key", async () => {
  const f = fixture();
  f.failures.finishSent = true;
  assert.equal(await deliverEnquiryNotification(record.reference, f.services), "failed");
  assert.equal(f.status, "failed");
  assert.equal(f.requests.length, 1);
  const original = f.requests[0];
  f.advance(60_000);
  f.failures.finishSent = false;
  assert.equal(await deliverEnquiryNotification(record.reference, f.services), "sent");
  assert.equal(f.requests.length, 2);
  assert.equal(f.requests[1].init.body, original.init.body);
  assert.equal(new Headers(f.requests[1].init.headers).get("idempotency-key"), new Headers(original.init.headers).get("idempotency-key"));
});

test("failed state updates remain recoverable after the lease expires", async () => {
  const f = fixture();
  f.failures.finish = true;
  assert.equal(await deliverEnquiryNotification(record.reference, f.services), "failed");
  assert.equal(f.status, "sending");
  assert.equal(await deliverEnquiryNotification(record.reference, f.services), "idle");
  f.advance(300_000);
  f.failures.finish = false;
  assert.equal(await deliverEnquiryNotification(record.reference, f.services), "sent");
  assert.equal(f.requests.length, 2);
  assert.equal(f.requests[1].init.body, f.requests[0].init.body);
});

test("claim errors and missing database configuration fail without exposing private exceptions", async () => {
  const f = fixture();
  f.failures.claim = true;
  assert.equal(await deliverEnquiryNotification(record.reference, f.services), "failed");
  assert.equal(f.requests.length, 0);
  assert.equal(f.finishes.length, 0);
  assert.deepEqual(f.logs, [{ reference: record.reference, code: "notification_transport_or_state_failure", status: "failed" }]);
  assert.equal(await deliverEnquiryNotification(undefined, { env: {}, log: f.services.log }), "failed");
  assert.equal(f.logs[1].reference, "queue");
});

test("unauthorized retry requests cannot claim or send any notification", async () => {
  const secret = "a-secure-cron-secret-with-at-least-32-characters";
  for (const [configured, authorization] of [[undefined, undefined], [undefined, "Bearer undefined"], ["short", "Bearer short"], [secret, undefined], [secret, "Bearer wrong"], [secret, `Bearer ${"x".repeat(secret.length)}`]]) {
    const f = fixture();
    f.services.env = { ...env, CRON_SECRET: configured };
    const request = new Request("https://vavi.example/api/enquiry/notifications/retry", { headers: authorization ? { Authorization: authorization } : {} });
    const result = await handleNotificationRetry(request, f.services);
    assert.equal(result.status, 401);
    assert.equal(result.headers.get("cache-control"), "no-store");
    assert.deepEqual(await result.json(), { error: "Unauthorized" });
    assert.deepEqual(f.events, []);
    assert.deepEqual(f.requests, []);
  }
});

test("the authenticated retry endpoint sends due work and stops at an empty queue", async () => {
  const f = fixture();
  const secret = "a-secure-cron-secret-with-at-least-32-characters";
  f.services.env = { ...env, CRON_SECRET: secret };
  const request = new Request("https://vavi.example/api/enquiry/notifications/retry", { method: "POST", headers: { Authorization: `Bearer ${secret}` } });
  const result = await handleNotificationRetry(request, f.services);
  assert.equal(result.status, 200);
  assert.equal(result.headers.get("cache-control"), "no-store");
  assert.deepEqual(await result.json(), { processed: 1, results: ["sent"] });
  assert.equal(f.requests.length, 1);
  assert.equal(f.events.filter((event) => event === "claim").length, 2);
});

test("retry processing is bounded to three jobs per invocation", async () => {
  let claimed = 0;
  let sent = 0;
  const store: NotificationStore = {
    async claim() {
      claimed++;
      return { reference: record.reference, record, attempts: 1, first_attempt_at: null, payload: null, lease_token: `lease-${claimed}` };
    },
    async prepare(job, payload) { return { ...job, payload, first_attempt_at: new Date(now).toISOString() }; },
    async finish(_job, outcome) { assert.equal(outcome, "sent"); sent++; },
  };
  const results = await retryEnquiryNotifications({ env, store, now: () => now, fetch: async () => Response.json({ id: "email-123" }) });
  assert.deepEqual(results, ["sent", "sent", "sent"]);
  assert.equal(claimed, 3);
  assert.equal(sent, 3);
});
