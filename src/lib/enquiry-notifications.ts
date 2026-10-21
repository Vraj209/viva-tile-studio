import { randomUUID, timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import type { EnquiryRecord } from "./enquiry-neon";
import { renderEnquiryEmail } from "./enquiry-email";

type Environment = Record<string, string | undefined>;
export type NotificationPayload = {
  from: string; to: string[]; reply_to: string; subject: string; html: string; text: string;
};
export type NotificationJob = {
  reference: string; record: EnquiryRecord; attempts: number;
  first_attempt_at: string | null; payload: NotificationPayload | null;
  lease_token: string;
};
type Outcome = "sent" | "failed" | "needs_review";
export type NotificationStore = {
  claim(reference?: string): Promise<NotificationJob | null>;
  prepare(job: NotificationJob, payload: NotificationPayload): Promise<NotificationJob>;
  finish(job: NotificationJob, outcome: Outcome, detail: string, retrySeconds?: number): Promise<void>;
};
export type NotificationServices = {
  env?: Environment; store?: NotificationStore; fetch?: typeof fetch;
  now?: () => number;
  log?: (event: { reference: string; code: string; status: string }) => void;
};

// Resend retains idempotency keys for 24h. Stop an hour early if acceptance is
// uncertain, including crashes after sending but before recording success.
export const SAFE_RETRY_WINDOW_MS = 23 * 60 * 60 * 1000;

export function notificationStore(databaseUrl: string): NotificationStore {
  // Create a fresh timeout per query, including work following the provider call.
  const sql = () => neon(databaseUrl, { fetchOptions: { signal: AbortSignal.timeout(8_000) } });
  return {
    async claim(reference) {
      const token = randomUUID();
      const rows = await sql()`
        UPDATE public.enquiry_notifications SET status = 'sending',
          lease_token = ${token}, lease_expires_at = now() + interval '5 minutes',
          attempts = attempts + 1
        WHERE reference = (
          SELECT reference FROM public.enquiry_notifications
          WHERE (${reference ?? null}::uuid IS NULL OR reference = ${reference ?? null}::uuid)
            AND status IN ('pending', 'failed', 'sending')
            AND next_attempt_at <= now()
            AND (lease_expires_at IS NULL OR lease_expires_at <= now())
          ORDER BY next_attempt_at, created_at
          FOR UPDATE SKIP LOCKED LIMIT 1
        )
        RETURNING reference, record, attempts, first_attempt_at, payload, lease_token
      `;
      return (rows[0] as NotificationJob | undefined) ?? null;
    },
    async prepare(job, payload) {
      const rows = await sql()`
        UPDATE public.enquiry_notifications SET
          payload = COALESCE(payload, ${JSON.stringify(payload)}::jsonb),
          first_attempt_at = COALESCE(first_attempt_at, now())
        WHERE reference = ${job.reference} AND lease_token = ${job.lease_token}::uuid
          AND status = 'sending' AND lease_expires_at > now()
        RETURNING reference, record, attempts, first_attempt_at, payload, lease_token
      `;
      if (!rows[0]) throw new Error("notification_lease_lost");
      return rows[0] as NotificationJob;
    },
    async finish(job, outcome, detail, retrySeconds = 60) {
      await sql()`
        UPDATE public.enquiry_notifications SET status = ${outcome},
          provider_id = CASE WHEN ${outcome} = 'sent' THEN ${detail} ELSE provider_id END,
          sent_at = CASE WHEN ${outcome} = 'sent' THEN now() ELSE sent_at END,
          last_error = CASE WHEN ${outcome} = 'sent' THEN NULL ELSE ${detail} END,
          next_attempt_at = now() + (${retrySeconds} * interval '1 second'),
          lease_token = NULL, lease_expires_at = NULL
        WHERE reference = ${job.reference} AND lease_token = ${job.lease_token}::uuid
      `;
    },
  };
}

// One mailbox only: reject address lists, display names, and header injection.
export function isNotificationEmail(value: string) {
  return value.length <= 254 && /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/.test(value);
}

export function notificationConfiguration(env: Environment) {
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.ENQUIRY_NOTIFICATION_FROM?.trim() ?? "";
  const to = env.ENQUIRY_NOTIFICATION_TO?.trim() ?? "";
  const timeZone = env.ENQUIRY_NOTIFICATION_TIMEZONE?.trim() || "America/Toronto";
  if (!apiKey || !/^re_[A-Za-z0-9_-]+$/.test(apiKey) || !isNotificationEmail(from) || !isNotificationEmail(to))
    return null;
  try { new Intl.DateTimeFormat("en-CA", { timeZone }).format(); }
  catch { return null; }
  return { apiKey, from: `VAVI Tile Studio <${from}>`, to, timeZone };
}

export async function deliverEnquiryNotification(reference?: string, services: NotificationServices = {}) {
  const env = services.env ?? process.env;
  const log = services.log ?? ((event) => console.error("[enquiry-notification]", event));
  let job: NotificationJob | null = null;
  let store: NotificationStore | undefined;
  try {
    if (!services.store && !env.DATABASE_URL) throw new Error("notification_database_missing");
    store = services.store ?? notificationStore(env.DATABASE_URL!);
    job = await store.claim(reference);
    if (!job) return "idle" as const;
    const config = notificationConfiguration(env);
    if (!config) {
      await store.finish(job, "failed", "notification_configuration_missing", 300);
      log({ reference: job.reference, code: "notification_configuration_missing", status: "failed" });
      return "failed" as const;
    }
    if (job.first_attempt_at && (services.now ?? Date.now)() - new Date(job.first_attempt_at).getTime() >= SAFE_RETRY_WINDOW_MS) {
      await store.finish(job, "needs_review", "idempotency_window_expired");
      log({ reference: job.reference, code: "idempotency_window_expired", status: "needs_review" });
      return "needs_review" as const;
    }
    if (!isNotificationEmail(job.record.email)) {
      await store.finish(job, "needs_review", "invalid_reply_to");
      log({ reference: job.reference, code: "invalid_reply_to", status: "needs_review" });
      return "needs_review" as const;
    }
    // Persist the exact first request before sending. Config/template changes
    // cannot change the payload under an already-used Resend idempotency key.
    job = await store.prepare(job, job.payload ?? {
      from: config.from, to: [config.to], reply_to: job.record.email,
      ...renderEnquiryEmail(job.record, config.timeZone),
    });
    const result = await (services.fetch ?? fetch)("https://api.resend.com/emails", {
      method: "POST", redirect: "error", cache: "no-store",
      headers: {
        Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json",
        "Idempotency-Key": `vavi-inquiry/${job.reference}`,
      },
      body: JSON.stringify(job.payload), signal: AbortSignal.timeout(10_000),
    });
    const body = await result.json().catch(() => null) as { id?: unknown; name?: unknown } | null;
    if (result.ok && typeof body?.id === "string" && /^[a-zA-Z0-9-]{1,100}$/.test(body.id)) {
      await store.finish(job, "sent", body.id);
      return "sent" as const;
    }
    // Only bounded codes/statuses go into logs; never raw provider responses,
    // tokens, recipients, or the visitor's message.
    const code = `resend_http_${result.status}`;
    const outcome = body?.name === "invalid_idempotent_request" ? "needs_review" : "failed";
    const retryAfter = Number(result.headers.get("retry-after"));
    const delay = Math.min(3600, Math.max(60 * 2 ** Math.min(job.attempts - 1, 6), Number.isFinite(retryAfter) ? retryAfter : 0));
    await store.finish(job, outcome, code, delay);
    log({ reference: job.reference, code, status: outcome });
    return outcome;
  } catch {
    // A failed acknowledgement is ambiguous. Reuse the stored payload/key on
    // retry; if updating state also fails, the lease expires for recovery.
    if (job && store) {
      await store.finish(job, "failed", "notification_transport_or_state_failure", 60).catch(() => {});
    }
    log({ reference: job?.reference ?? reference ?? "queue", code: "notification_transport_or_state_failure", status: "failed" });
    return "failed" as const;
  }
}

export async function retryEnquiryNotifications(services: NotificationServices = {}) {
  const results: string[] = [];
  const started = Date.now();
  // Bounded batch fits a serverless invocation. Other workers use SKIP LOCKED.
  for (let index = 0; index < 3; index++) {
    // Leave enough time for one worst-case claim/prepare/send/ack sequence.
    if (Date.now() - started > 20_000) break;
    const result = await deliverEnquiryNotification(undefined, services);
    if (result === "idle") break;
    results.push(result);
  }
  return results;
}

export async function handleNotificationRetry(request: Request, services: NotificationServices = {}) {
  const env = services.env ?? process.env;
  const secret = env.CRON_SECRET;
  const actual = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret ?? ""}`;
  const authorized = secret && secret.length >= 32 && Buffer.byteLength(actual) === Buffer.byteLength(expected)
    && timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
  const headers = { "Cache-Control": "no-store" };
  if (!authorized) return Response.json({ error: "Unauthorized" }, { status: 401, headers });
  const results = await retryEnquiryNotifications(services);
  return Response.json({ processed: results.length, results }, { headers });
}
