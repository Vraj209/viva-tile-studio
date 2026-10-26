import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";
import { handleEnquiry, type EnquiryServices } from "../src/lib/enquiry";
import {
  deliverEnquiryNotification,
  notificationStore,
  type NotificationPayload,
  type NotificationServices,
  type NotificationStore,
} from "../src/lib/enquiry-notifications";
import { getEnquiries, getEnquiry } from "../owner-app/src/lib/enquiries";

// This is an opt-in integration check against a disposable database branch.
// Every Resend request uses an injected test double; this script cannot send mail.
// Run after both migrations with the same isolated branch credentials:
// node --env-file=.env.notifications-test --conditions=react-server --import tsx scripts/verify-enquiry-notifications.mts
// The environment file must set ENQUIRY_NOTIFICATION_VERIFY_ISOLATED=true.

type Check = { name: string; status: "passed" | "failed" };
type ProviderRequest = { key: string; body: string; payload: NotificationPayload };
const checks: Check[] = [];
let activeCheck = "isolated database configuration";

async function check(name: string, run: () => Promise<void>) {
  activeCheck = name;
  try {
    await run();
    checks.push({ name, status: "passed" });
    console.log(`PASS: ${name}`);
  } catch (error) {
    checks.push({ name, status: "failed" });
    throw error;
  }
}

function providerDouble() {
  const requests: ProviderRequest[] = [];
  const accepted = new Map<string, { body: string; id: string }>();
  let rejectNext = false;
  const fetch: typeof globalThis.fetch = async (input, init) => {
    assert.equal(String(input), "https://api.resend.com/emails");
    assert.ok(init);
    assert.equal(init.method, "POST");
    const headers = new Headers(init.headers);
    assert.equal(headers.get("authorization"), "Bearer re_verification_only_not_a_credential");
    const key = headers.get("idempotency-key");
    assert.ok(key);
    assert.ok(key.startsWith("vavi-inquiry/"));
    assert.equal(typeof init.body, "string");
    const body = init.body as string;
    const payload = JSON.parse(body) as NotificationPayload;
    requests.push({ key, body, payload });
    if (rejectNext) {
      rejectNext = false;
      return Response.json({ name: "service_unavailable" }, { status: 503 });
    }
    const prior = accepted.get(key);
    if (prior) {
      assert.equal(body, prior.body, "A retried provider request must have identical bytes");
      return Response.json({ id: prior.id }, { headers: { "idempotent-replayed": "true" } });
    }
    const id = randomUUID();
    accepted.set(key, { body, id });
    return Response.json({ id });
  };
  return {
    fetch,
    requests,
    accepted,
    failNext() { rejectNext = true; },
  };
}

async function verify() {
  assert.equal(process.env.ENQUIRY_NOTIFICATION_VERIFY_ISOLATED, "true", "Explicit isolated-database opt-in is required");
  assert.notEqual(process.env.NEON_BRANCH?.toLowerCase(), "production", "Production credentials must not be used");
  const databaseUrl = process.env.DATABASE_URL;
  assert.ok(databaseUrl, "An isolated DATABASE_URL is required");
  const sql = neon(databaseUrl, { fetchOptions: { cache: "no-store" } });
  const env = {
    DATABASE_URL: databaseUrl,
    RESEND_API_KEY: "re_verification_only_not_a_credential",
    ENQUIRY_NOTIFICATION_FROM: "inquiries@vavi-verification.example",
    ENQUIRY_NOTIFICATION_TO: "owner@vavi-verification.example",
    ENQUIRY_NOTIFICATION_TIMEZONE: "America/Toronto",
  };
  const store = notificationStore(databaseUrl);
  const provider = providerDouble();
  const logEvents: { reference: string; code: string; status: string }[] = [];
  const services: NotificationServices = { env, store, fetch: provider.fetch, log: (event) => logEvents.push(event) };
  const origin = "https://inquiry-notification-verification.example";
  const email = `notification-check-${randomUUID()}@example.test`;
  const references = new Set<string>();
  const savedObservations: { reference: string; inquiry: boolean; notification: boolean }[] = [];
  const fields = {
    name: "Synthetic notification verification",
    email,
    idea: "A reading room feature wall. Synthetic isolated test; remove after verification.",
    projectType: "Residential",
    application: "Feature wall",
    location: "Toronto, Canada",
    dimensions: "3 by 2 metres",
    company: "Verification only",
    phone: "+1 202-555-0100",
    desiredDate: "2027-04-12",
  };
  const newReference = () => {
    const reference = randomUUID();
    references.add(reference);
    return reference;
  };
  const submissionServices: EnquiryServices = {
    env: { DATABASE_URL: databaseUrl },
    onSaved: async (reference) => {
      const [row] = await sql`
        SELECT EXISTS(SELECT 1 FROM public.project_enquiries WHERE reference = ${reference} AND email = ${email}) AS inquiry,
               EXISTS(SELECT 1 FROM public.enquiry_notifications WHERE reference = ${reference}) AS notification
      `;
      savedObservations.push({ reference, inquiry: row.inquiry === true, notification: row.notification === true });
    },
  };
  async function submit(reference: string, changes: Partial<typeof fields> = {}) {
    assert.ok(references.has(reference));
    const form = new FormData();
    for (const [name, value] of Object.entries({ ...fields, ...changes })) form.set(name, value);
    return handleEnquiry(new Request(`${origin}/api/enquiry`, {
      method: "POST", headers: { Origin: origin, "Idempotency-Key": reference }, body: form,
    }), { ...submissionServices, buckets: new Map() });
  }
  async function saved(reference: string) {
    const response = await submit(reference);
    assert.equal(response.status, 201);
    const result = await response.json();
    assert.equal(result.saved, true);
    assert.equal(result.reference, reference);
    return result;
  }
  async function job(reference: string) {
    assert.ok(references.has(reference));
    const rows = await sql`
      SELECT status, attempts, provider_id, first_attempt_at, payload, last_error, lease_token,
             record->>'receivedAt' AS received_at
      FROM public.enquiry_notifications WHERE reference = ${reference}
    `;
    assert.equal(rows.length, 1);
    return rows[0];
  }
  async function makeDue(reference: string) {
    assert.ok(references.has(reference));
    const rows = await sql`
      UPDATE public.enquiry_notifications SET next_attempt_at = now() - interval '1 second'
      WHERE reference = ${reference} AND status = 'failed'
        AND EXISTS(SELECT 1 FROM public.project_enquiries WHERE reference = ${reference} AND email = ${email})
      RETURNING reference
    `;
    assert.equal(rows.length, 1);
  }

  let removed = 0;
  const historical = newReference();
  const primary = newReference();
  try {
    await check("historical inquiries have no notification job", async () => {
      await sql`
        INSERT INTO public.project_enquiries (reference, received_at, name, email, idea)
        VALUES (${historical}, '2020-01-01T00:00:00Z', ${fields.name}, ${email}, ${fields.idea})
      `;
      const [row] = await sql`SELECT count(*)::integer AS total FROM public.enquiry_notifications WHERE reference = ${historical}`;
      assert.equal(row.total, 0);
    });

    await check("invalid form cannot save or schedule a notification", async () => {
      const invalid = newReference();
      const count = savedObservations.length;
      assert.equal((await submit(invalid, { email: "invalid-address" })).status, 422);
      const [row] = await sql`SELECT count(*)::integer AS total FROM public.project_enquiries WHERE reference = ${invalid}`;
      assert.equal(row.total, 0);
      assert.equal(savedObservations.length, count);
    });

    await check("concurrent duplicate submissions commit one inquiry and one outbox job", async () => {
      await Promise.all([saved(primary), saved(primary), saved(primary)]);
      const [row] = await sql`
        SELECT (SELECT count(*)::integer FROM public.project_enquiries WHERE reference = ${primary}) AS inquiries,
               (SELECT count(*)::integer FROM public.enquiry_notifications WHERE reference = ${primary}) AS notifications
      `;
      assert.equal(row.inquiries, 1);
      assert.equal(row.notifications, 1);
      assert.equal(savedObservations.filter((item) => item.reference === primary).length, 3);
      assert.ok(savedObservations.every((item) => item.inquiry && item.notification), "Callbacks must observe committed inquiry and notification records");
      assert.equal(provider.requests.length, 0);
    });

    await check("reusing a submission key for different content returns conflict", async () => {
      const count = savedObservations.length;
      assert.equal((await submit(primary, { idea: "Different content using an existing key" })).status, 409);
      assert.equal(savedObservations.length, count);
      const [row] = await sql`SELECT idea FROM public.project_enquiries WHERE reference = ${primary} AND email = ${email}`;
      assert.equal(row.idea, fields.idea);
    });

    await check("owner dashboard list and details read the saved inquiry", async () => {
      // Exercise the real owner query/mapping functions with test authorization.
      // A real authenticated browser session remains a separate deployment check.
      const ownerServices = { authorize: async () => undefined, env: { DATABASE_URL: databaseUrl } };
      const listing = await getEnquiries({ q: email }, ownerServices);
      assert.ok(listing.items.some((item) => item.reference === primary));
      const detail = await getEnquiry(primary, ownerServices);
      assert.ok(detail);
      for (const [key, value] of Object.entries(fields)) {
        assert.equal(detail[key as keyof typeof detail], value);
      }
      const queued = await job(primary);
      assert.equal(detail.receivedAt, new Date(queued.received_at as string).toISOString());
      assert.equal(detail.inspiration, null);
    });

    await check("parallel notification workers make one provider request", async () => {
      const results = await Promise.all([
        deliverEnquiryNotification(primary, services),
        deliverEnquiryNotification(primary, services),
        deliverEnquiryNotification(primary, services),
      ]);
      assert.deepEqual(results.sort(), ["idle", "idle", "sent"]);
      assert.equal(provider.requests.length, 1);
      assert.equal(provider.accepted.size, 1);
      const [{ key, payload }] = provider.requests;
      assert.equal(key, `vavi-inquiry/${primary}`);
      assert.equal(payload.reply_to, email);
      assert.equal(payload.subject, "New Inquiry — VAVI Tile Studio");
      assert.deepEqual(payload.to, [env.ENQUIRY_NOTIFICATION_TO]);
      assert.match(payload.html, /You’ve received a new inquiry\./);
      assert.match(payload.html, /View Inquiry Dashboard/);
      assert.equal((payload.html.match(/href="https:\/\/dashboard\.vavitilestudio\.com\/"/g) ?? []).length, 2);
      assert.ok(payload.text.includes("https://dashboard.vavitilestudio.com/"));
      for (const value of [fields.name, email, fields.idea, fields.phone, fields.company, fields.projectType, fields.application, fields.location, fields.dimensions, "America/Toronto"]) {
        assert.ok(payload.text.includes(value));
      }
      assert.equal((await job(primary)).status, "sent");
      assert.equal(await deliverEnquiryNotification(primary, services), "idle");
      assert.equal(provider.requests.length, 1);
    });

    await check("provider failure preserves the inquiry and retries its frozen payload", async () => {
      const reference = newReference();
      await saved(reference);
      const start = provider.requests.length;
      provider.failNext();
      assert.equal(await deliverEnquiryNotification(reference, services), "failed");
      const failed = await job(reference);
      assert.equal(failed.status, "failed");
      assert.equal(failed.last_error, "resend_http_503");
      const [row] = await sql`SELECT count(*)::integer AS total FROM public.project_enquiries WHERE reference = ${reference} AND email = ${email}`;
      assert.equal(row.total, 1);
      assert.equal(await deliverEnquiryNotification(reference, services), "idle");
      await makeDue(reference);
      assert.equal(await deliverEnquiryNotification(reference, services), "sent");
      assert.equal(provider.requests.length - start, 2);
      assert.equal(provider.requests[start + 1].key, provider.requests[start].key);
      assert.equal(provider.requests[start + 1].body, provider.requests[start].body);
      assert.equal((await job(reference)).status, "sent");
    });

    await check("provider acceptance before a failed state write replays one provider message", async () => {
      const reference = newReference();
      await saved(reference);
      const start = provider.requests.length;
      const acceptedBefore = provider.accepted.size;
      let failSentWrite = true;
      const uncertainStore: NotificationStore = {
        ...store,
        async finish(claimed, outcome, detail, retrySeconds) {
          if (outcome === "sent" && failSentWrite) {
            failSentWrite = false;
            throw new Error("synthetic acknowledgement failure before database commit");
          }
          await store.finish(claimed, outcome, detail, retrySeconds);
        },
      };
      assert.equal(await deliverEnquiryNotification(reference, { ...services, store: uncertainStore }), "failed");
      assert.equal((await job(reference)).status, "failed");
      await makeDue(reference);
      assert.equal(await deliverEnquiryNotification(reference, services), "sent");
      assert.equal(provider.requests.length - start, 2);
      assert.equal(provider.accepted.size - acceptedBefore, 1);
      assert.equal(provider.requests[start + 1].key, provider.requests[start].key);
      assert.equal(provider.requests[start + 1].body, provider.requests[start].body);
    });

    await check("a committed sent state survives a lost database acknowledgement", async () => {
      const reference = newReference();
      await saved(reference);
      const start = provider.requests.length;
      let loseAck = true;
      const uncertainStore: NotificationStore = {
        ...store,
        async finish(claimed, outcome, detail, retrySeconds) {
          await store.finish(claimed, outcome, detail, retrySeconds);
          if (outcome === "sent" && loseAck) {
            loseAck = false;
            throw new Error("synthetic acknowledgement failure after database commit");
          }
        },
      };
      assert.equal(await deliverEnquiryNotification(reference, { ...services, store: uncertainStore }), "failed");
      assert.equal((await job(reference)).status, "sent", "The stale catch must not overwrite an acknowledged job");
      assert.equal(await deliverEnquiryNotification(reference, services), "idle");
      assert.equal(provider.requests.length - start, 1);
    });

    await check("expired ambiguous sends require review without contacting the provider", async () => {
      const reference = newReference();
      await saved(reference);
      const start = provider.requests.length;
      await sql`
        UPDATE public.enquiry_notifications SET first_attempt_at = now() - interval '24 hours'
        WHERE reference = ${reference}
          AND EXISTS(SELECT 1 FROM public.project_enquiries WHERE reference = ${reference} AND email = ${email})
      `;
      assert.equal(await deliverEnquiryNotification(reference, services), "needs_review");
      assert.equal((await job(reference)).status, "needs_review");
      assert.equal((await job(reference)).last_error, "idempotency_window_expired");
      assert.equal(provider.requests.length, start);
      assert.equal(await deliverEnquiryNotification(reference, services), "idle");
    });

    await check("expired leases recover and stale workers cannot overwrite the new lease", async () => {
      const reference = newReference();
      await saved(reference);
      const stale = await store.claim(reference);
      assert.ok(stale);
      await sql`
        UPDATE public.enquiry_notifications SET lease_expires_at = now() - interval '1 second'
        WHERE reference = ${reference} AND lease_token = ${stale.lease_token}::uuid
      `;
      const current = await store.claim(reference);
      assert.ok(current);
      assert.notEqual(current.lease_token, stale.lease_token);
      await store.finish(stale, "sent", "stale-worker-must-not-win");
      const stillLeased = await job(reference);
      assert.equal(stillLeased.status, "sending");
      assert.equal(stillLeased.lease_token, current.lease_token);
      assert.equal(stillLeased.provider_id, null);
      await store.finish(current, "failed", "synthetic-lease-recovery", 0);
      assert.equal(await deliverEnquiryNotification(reference, services), "sent");
    });

    await check("historical inquiry remains unqueued and outbox access stays private", async () => {
      const [historicalCount] = await sql`SELECT count(*)::integer AS total FROM public.enquiry_notifications WHERE reference = ${historical}`;
      assert.equal(historicalCount.total, 0);
      const [table] = await sql`SELECT relrowsecurity FROM pg_class WHERE oid = 'public.enquiry_notifications'::regclass`;
      assert.equal(table.relrowsecurity, true);
      const [policies] = await sql`SELECT count(*)::integer AS total FROM pg_policies WHERE schemaname = 'public' AND tablename = 'enquiry_notifications'`;
      assert.equal(policies.total, 0);
      assert.ok(logEvents.some((event) => event.code === "resend_http_503"));
      assert.ok(logEvents.some((event) => event.code === "idempotency_window_expired"));
      assert.ok(logEvents.every((event) => references.has(event.reference)));
      assert.ok(savedObservations.every((item) => item.inquiry && item.notification));
    });
  } finally {
    // Each reference was generated by this process, and the synthetic email is
    // an independent guard. The foreign key cascades only those outbox rows.
    for (const reference of references) {
      assert.match(reference, /^[0-9a-f-]{36}$/);
      const rows = await sql`
        DELETE FROM public.project_enquiries WHERE reference = ${reference} AND email = ${email}
        RETURNING reference
      `;
      removed += rows.length;
    }
    const [remaining] = await sql`SELECT count(*)::integer AS total FROM public.project_enquiries WHERE email = ${email}`;
    assert.equal(remaining.total, 0);
    const directory = new URL("../work/enquiry-notifications/", import.meta.url);
    await mkdir(directory, { recursive: true });
    await writeFile(new URL("live-report.json", directory), JSON.stringify({
      target: "isolated Neon database branch",
      verifiedAt: new Date().toISOString(),
      realEmailsSent: 0,
      checks,
      providerRequests: provider.requests.length,
      uniqueSimulatedEmails: provider.accepted.size,
      syntheticInquiriesRemoved: removed,
      authenticatedBrowserVerified: false,
    }, null, 2) + "\n");
    console.log(`PASS: synthetic cleanup (${removed} inquiries removed)`);
  }
  console.log(`PASS: ${checks.length} live database checks; 0 real emails sent`);
}

verify().catch(() => {
  // Never print query diagnostics, connection strings, provider payloads, or
  // unrelated customer records. The stage identifies the check to investigate.
  console.error(`FAIL: ${activeCheck}. No real email provider was contacted.`);
  process.exitCode = 1;
});
