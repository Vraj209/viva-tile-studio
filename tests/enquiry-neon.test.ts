import test from "node:test";
import assert from "node:assert/strict";
import {
  neonEnquiryConfiguration,
  persistNeonEnquiry,
  type EnquiryRecord,
  type EnquiryNeonServices,
} from "../src/lib/enquiry-neon";
import type { Upload } from "../src/lib/enquiry";

const env = {
  DATABASE_URL: "postgresql://test:secret@ep-test.neon.tech/neondb?sslmode=require",
  AWS_ACCESS_KEY_ID: "test-access-key",
  AWS_SECRET_ACCESS_KEY: "test-secret-key",
  AWS_ENDPOINT_URL_S3: "https://storage.example.test",
  AWS_REGION: "us-east-2",
};
const config = neonEnquiryConfiguration(env)!;
const record: EnquiryRecord = {
  reference: "cb6d2e8a-a4bb-4db7-a875-bdd987bd98f7",
  receivedAt: "2026-09-27T17:00:00.000Z",
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
const upload: Upload = {
  bytes: Buffer.from("%PDF-1.4\nconcept"),
  mime: "application/pdf",
  extension: "pdf",
  originalName: "Botanical concept.pdf",
};
const withUpload: EnquiryRecord = {
  ...record,
  inspiration: {
    filename: "inspiration.pdf",
    originalName: upload.originalName,
    mime: upload.mime,
    bytes: upload.bytes.length,
  },
};

test("Neon configuration requires a valid database independently of optional uploads", () => {
  assert.equal(neonEnquiryConfiguration({}), null);
  for (const database of ["", "invalid", "https://db.example", "postgres://host/db"])
    assert.equal(
      neonEnquiryConfiguration({ ...env, DATABASE_URL: database }),
      null,
    );
  const databaseOnly = neonEnquiryConfiguration({ DATABASE_URL: env.DATABASE_URL });
  assert.equal(databaseOnly?.databaseUrl, env.DATABASE_URL);
  assert.equal(databaseOnly?.storage, null);
  assert.equal(config.bucket, "viva-tile-studio");
  assert.ok(config.storage);
  assert.equal(
    neonEnquiryConfiguration({ ...env, ENQUIRY_STORAGE_BUCKET: "other-private-bucket" })
      ?.bucket,
    "other-private-bucket",
  );
});

test("missing or unsafe storage settings disable only uploads", () => {
  for (const key of Object.keys(env).filter((key) => key !== "DATABASE_URL")) {
    const partial = neonEnquiryConfiguration({ ...env, [key]: "" });
    assert.equal(partial?.databaseUrl, env.DATABASE_URL);
    assert.equal(partial?.storage, null);
  }
  for (const endpoint of [
    "invalid",
    "http://storage.example.test",
    "https://user:password@storage.example.test",
    "https://storage.example.test?secret=example",
  ])
    assert.equal(
      neonEnquiryConfiguration({ ...env, AWS_ENDPOINT_URL_S3: endpoint })?.storage,
      null,
    );
  assert.equal(
    neonEnquiryConfiguration({ ...env, ENQUIRY_STORAGE_BUCKET: "../../public" })?.storage,
    null,
  );
});

test("every enquiry field is bound as a SQL parameter, including SQL-like user text", async () => {
  const submitted = {
    ...record,
    idea: "O'Brien'); DROP TABLE project_enquiries; --",
  };
  let inserts = 0;
  await persistNeonEnquiry(config, submitted, undefined, {
    sql: async (strings, ...parameters) => {
      inserts++;
      const query = strings.join("?");
      assert.match(query, /INSERT INTO public\.project_enquiries/);
      assert.ok(!query.includes(submitted.idea));
      assert.ok(!query.includes(submitted.email));
      assert.deepEqual(parameters, [
        submitted.reference,
        submitted.receivedAt,
        submitted.name,
        submitted.email,
        submitted.idea,
        submitted.projectType,
        submitted.application,
        submitted.location,
        submitted.dimensions,
        submitted.company,
        submitted.phone,
        submitted.desiredDate,
        null, null, null, null, null,
      ]);
    },
    putObject: async () => assert.fail("No object upload without an attachment"),
  });
  assert.equal(inserts, 1);
});

test("optional empty date becomes SQL NULL", async () => {
  await persistNeonEnquiry(config, { ...record, desiredDate: "" }, undefined, {
    sql: async (_strings, ...parameters) => assert.equal(parameters[11], null),
  });
});

test("database-only configuration persists an enquiry with no attachment", async () => {
  const databaseOnly = neonEnquiryConfiguration({ DATABASE_URL: env.DATABASE_URL })!;
  let inserts = 0;
  await persistNeonEnquiry(databaseOnly, record, undefined, {
    sql: async (_strings, ...parameters) => {
      inserts++;
      assert.equal(parameters[0], record.reference);
      assert.equal(parameters[3], record.email);
      assert.deepEqual(parameters.slice(12), [null, null, null, null, null]);
    },
    putObject: async () => assert.fail("No upload without storage configuration"),
  });
  assert.equal(inserts, 1);
});

test("database-only persistence rejects attachments before any transport", async () => {
  const databaseOnly = neonEnquiryConfiguration({ DATABASE_URL: env.DATABASE_URL })!;
  await assert.rejects(
    persistNeonEnquiry(databaseOnly, withUpload, upload, {
      sql: async () => assert.fail("No INSERT when an attachment cannot be stored"),
      putObject: async () => assert.fail("No upload without storage configuration"),
    }),
    /attachments are not configured/,
  );
});

test("uploads remain private and are confirmed before their database record is inserted", async () => {
  const events: string[] = [];
  const key = `enquiries/${record.reference}/inspiration.pdf`;
  await persistNeonEnquiry(config, withUpload, upload, {
    putObject: async (input, signal) => {
      events.push("upload");
      assert.equal(input.Bucket, "viva-tile-studio");
      assert.equal(input.Key, key);
      assert.equal(input.Body, upload.bytes);
      assert.equal(input.ContentType, "application/pdf");
      assert.equal(input.ContentLength, upload.bytes.length);
      assert.equal(input.ContentDisposition, 'attachment; filename="inspiration.pdf"');
      assert.equal(input.CacheControl, "private, no-store");
      assert.equal(input.ACL, undefined);
      assert.ok(signal instanceof AbortSignal);
    },
    sql: async (_strings, ...parameters) => {
      events.push("insert");
      assert.deepEqual(parameters.slice(12), [
        "viva-tile-studio", key, upload.originalName, upload.mime, upload.bytes.length,
      ]);
      assert.ok(!parameters.includes(env.AWS_SECRET_ACCESS_KEY));
      assert.ok(!parameters.includes(env.AWS_ENDPOINT_URL_S3));
    },
  });
  assert.deepEqual(events, ["upload", "insert"]);
});

test("a failed object upload prevents database insertion", async () => {
  const error = new Error("Object storage unavailable");
  await assert.rejects(
    persistNeonEnquiry(config, withUpload, upload, {
      putObject: async () => { throw error; },
      sql: async () => assert.fail("No INSERT after failed upload"),
    }),
    (received) => received === error,
  );
});

test("database errors propagate without retrying or deleting a possibly referenced upload", async () => {
  const events: string[] = [];
  const error = new Error("Response lost after possible commit");
  await assert.rejects(
    persistNeonEnquiry(config, withUpload, upload, {
      putObject: async () => { events.push("upload"); },
      sql: async () => { events.push("insert"); throw error; },
    }),
    (received) => received === error,
  );
  assert.deepEqual(events, ["upload", "insert"]);
  await assert.rejects(
    persistNeonEnquiry(config, record, undefined, { sql: async () => { throw error; } }),
    (received) => received === error,
  );
});

test("unsafe object paths and incomplete attachment records fail before transport", async () => {
  const services: EnquiryNeonServices = {
    sql: async () => assert.fail("No INSERT for invalid storage record"),
    putObject: async () => assert.fail("No upload for invalid storage record"),
  };
  await assert.rejects(
    persistNeonEnquiry(config, { ...withUpload, reference: "../private" }, upload, services),
    /Invalid enquiry storage record/,
  );
  await assert.rejects(
    persistNeonEnquiry(config, withUpload, { ...upload, extension: "../../pdf" }, services),
    /Invalid enquiry storage record/,
  );
  await assert.rejects(persistNeonEnquiry(config, record, upload, services));
  await assert.rejects(persistNeonEnquiry(config, withUpload, undefined, services));
});
