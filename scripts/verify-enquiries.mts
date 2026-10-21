import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { DeleteObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { enquiryAvailability, handleEnquiry } from "../src/lib/enquiry";
import { neonEnquiryConfiguration } from "../src/lib/enquiry-neon";

// Opt-in live verification: creates two synthetic enquiries and removes exactly those
// records and objects afterward. Load the target's credentials with --env-file.
async function verify() {
  const config = neonEnquiryConfiguration(process.env);
  assert.ok(config, "Neon database and storage configuration are required");
  const storageConfig = config.storage;
  assert.ok(storageConfig, "Private storage configuration is required for attachment verification");
  const sql = neon(config.databaseUrl);
  const storage = new S3Client({
    endpoint: storageConfig.endpoint,
    region: storageConfig.region,
    credentials: storageConfig,
    forcePathStyle: true,
  });
  const base = process.env.ENQUIRY_TEST_BASE_URL;
  const origin = base ? new URL(base).origin : "https://enquiry-verification.example";
  if (base) assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "HTTP checks only target a local app server");
  const testEmail = `enquiry-test-${randomUUID()}@example.com`;
  const fileBytes = "%PDF-1.4\nSynthetic enquiry integration check\n%%EOF";
  const references: string[] = [];

  try {
    const availability = base
      ? await (await fetch(`${origin}/api/enquiry`)).json()
      : enquiryAvailability();
    assert.deepEqual(availability, { available: true, uploadsAvailable: true });

    for (const withFile of [false, true]) {
      const form = new FormData();
      const fields = {
        name: "Synthetic integration check",
        email: testEmail,
        idea: "Automated Neon enquiry verification; remove after this test.",
        projectType: "Residential",
        application: "Feature wall",
        location: "Canada",
        dimensions: "2m x 3m",
        company: "Verification only",
        phone: "+1 202-555-0100",
        desiredDate: withFile ? "2027-04-12" : "",
      };
      for (const [key, value] of Object.entries(fields)) form.set(key, value);
      if (withFile) form.set("inspiration", new Blob([fileBytes], { type: "application/pdf" }), "test-concept.pdf");
      const request = new Request(`${origin}/api/enquiry`, {
        method: "POST", headers: { origin }, body: form,
      });
      const response = base ? await fetch(request) : await handleEnquiry(request, { buckets: new Map() });
      assert.equal(response.status, 201, "Submission must be durably accepted");
      const result = await response.json();
      assert.match(result.reference, /^[0-9a-f-]{36}$/);
      references.push(result.reference);
      const rows = await sql`SELECT *, desired_date::text AS date_text FROM public.project_enquiries WHERE reference = ${result.reference}`;
      assert.equal(rows.length, 1);
      const row = rows[0];
      for (const key of ["name", "email", "idea", "application", "location", "dimensions", "company", "phone"] as const) assert.equal(row[key], fields[key]);
      assert.equal(row.project_type, fields.projectType);
      assert.equal(row.date_text, fields.desiredDate || null);
      assert.ok(row.received_at);
      if (withFile) {
        assert.equal(row.inspiration_bucket, config.bucket);
        assert.match(row.request_hash, /^[a-f0-9]{64}$/);
        assert.equal(row.inspiration_key, `enquiries/${result.reference}/${row.request_hash}/inspiration.pdf`);
        assert.equal(row.inspiration_original_name, "test-concept.pdf");
        assert.equal(row.inspiration_mime, "application/pdf");
        assert.equal(row.inspiration_bytes, Buffer.byteLength(fileBytes));
        const object = await storage.send(new GetObjectCommand({ Bucket: config.bucket, Key: row.inspiration_key }));
        assert.equal(await object.Body?.transformToString(), fileBytes);
        assert.match(object.ContentDisposition ?? "", /^attachment;/);
        const anonymousUrl = `${storageConfig.endpoint.replace(/\/$/, "")}/${config.bucket}/${row.inspiration_key}`;
        const anonymous = await fetch(anonymousUrl);
        assert.ok([401, 403, 404].includes(anonymous.status), "Private attachment must reject anonymous reads");
        await anonymous.body?.cancel();
      } else {
        assert.equal(row.inspiration_key, null);
        assert.equal(row.inspiration_bucket, null);
      }
    }
    const [table] = await sql`SELECT relrowsecurity FROM pg_class WHERE oid = 'public.project_enquiries'::regclass`;
    assert.equal(table.relrowsecurity, true);
    const policies = await sql`SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'project_enquiries'`;
    assert.equal(policies.length, 0, "No browser-facing policies should expose enquiries");
    console.log("Verified: availability, two submissions, every stored field, private attachment bytes, anonymous denial, and database RLS.");
  } finally {
    try {
      // The random email identifies only this run, including a committed write whose
      // HTTP acknowledgement was lost. No customer records are selected or removed.
      const rows = await sql`SELECT reference, inspiration_key FROM public.project_enquiries WHERE email = ${testEmail}`;
      for (const row of rows) {
        if (row.inspiration_key) {
          assert.ok(row.inspiration_key.startsWith(`enquiries/${row.reference}/`));
          await storage.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: row.inspiration_key }));
        }
        await sql`DELETE FROM public.project_enquiries WHERE reference = ${row.reference} AND email = ${testEmail}`;
      }
      console.log(`Removed ${rows.length} synthetic enquiries and their attachments (${references.length} acknowledged).`);
    } finally { storage.destroy(); }
  }
}

verify().catch((error) => {
  // Do not log query payloads, credentials, or service response bodies.
  console.error(error instanceof assert.AssertionError ? `Verification failed: ${error.message}` : "Live enquiry verification failed; inspect connectivity and credentials.");
  process.exitCode = 1;
});
