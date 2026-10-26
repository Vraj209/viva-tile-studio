# Inquiry owner notifications

The Neon enquiry adapter saves each validated inquiry and one notification job in the same database statement. Only after that succeeds does the website schedule a server-side Resend delivery. Visitors receive HTTP 201 with `saved: true`, a reference, and “Your enquiry has been saved.” An email failure does not remove the inquiry or turn a confirmed save into a visitor error. Inquiries remain available in the owner dashboard while a notification waits for retry.

This feature is implemented for the existing Neon adapter. The legacy HTTPS receiver remains responsible for its own notifications and deduplication. The explicit private filesystem adapter stores inquiries without sending email. No migration sends notifications for historical inquiries.

## Configure the website server

Use `.env.local` locally and the public website deployment's server environment in hosting. These values must never use a `NEXT_PUBLIC_` prefix. The dashboard and public website must point to the same Neon database and branch; notification provider credentials belong on the public website server, not in the browser.

| Variable | Required value |
| --- | --- |
| `DATABASE_URL` | The website's Postgres application connection, matching the owner dashboard database. A pooled connection is appropriate. |
| `DATABASE_URL_UNPOOLED` | Direct connection to the same database, used only for migrations. The migration runner rejects a `-pooler` host. |
| `RESEND_API_KEY` | Resend API key authorized to send email. |
| `ENQUIRY_NOTIFICATION_TO` | Owner/admin recipient, currently `info@vavitilestudio.com`. One bare mailbox only; no display name or comma-separated list. |
| `ENQUIRY_NOTIFICATION_FROM` | One bare sender mailbox on a domain verified in Resend. The application adds the display name `VAVI Tile Studio`. |
| `ENQUIRY_NOTIFICATION_TIMEZONE` | Optional IANA timezone; defaults to `America/Toronto`. The timestamp includes its name and the offset applicable at submission. |
| `CRON_SECRET` | At least 32 random characters, used as a bearer token for the hosted retry endpoint. |

Keep `ENQUIRY_WEBHOOK_URL` and `ENQUIRY_STORAGE_DIR` empty when using Neon. Optional attachment storage settings continue to work as described in [the enquiry integration guide](enquiry.md).

Before deploying code that accepts new inquiries, apply the migrations against the intended database:

```sh
npm run db:migrate
```

The command loads `.env.local` and applies the numbered SQL migrations in order. `001_project_enquiries.sql` creates the inquiry table. `002_enquiry_notifications.sql` adds `request_hash` and the private notification queue. Each migration is repeatable and runs in a transaction. Both tables have row-level security and no anonymous browser access. A missing queue migration prevents the atomic save; it cannot silently accept an inquiry without its notification job. Restart or redeploy the website after changing its environment. Local configuration and migration do not update a hosted deployment.

### Troubleshoot `notification_configuration_missing`

This code is logged before any request reaches Resend. It means the API key, sender, recipient, or timezone failed local configuration validation; a verified Resend domain does not resolve missing application settings.

In Vercel, configure these server variables for **Production on the public website project serving `www.vavitilestudio.com`**:

| Variable | Value |
| --- | --- |
| `RESEND_API_KEY` | The private Resend key with email-sending access. The application does **not** read `RESEND_EMAIL_API_KEY`. |
| `ENQUIRY_NOTIFICATION_FROM` | `info@vavitilestudio.com` |
| `ENQUIRY_NOTIFICATION_TO` | `info@vavitilestudio.com` |
| `ENQUIRY_NOTIFICATION_TIMEZONE` | Optional; use `America/Toronto` or another valid IANA timezone. |

Use bare email addresses without display names or address lists. Settings on the owner dashboard project, or only in Preview/Development, do not configure the production website. Redeploy the public website after saving environment changes so the new deployment receives them.

Previously queued jobs that failed only configuration validation remain retryable: no provider request was made and their first-attempt time remains unset. After correcting the environment, invoke the [manual retry](#manual-retry) or authenticated [hosted retry endpoint](#hosted-retry-schedule) once the jobs are due (configuration failures wait five minutes). This repository configures no automatic retry scheduler, and redeployment alone does not drain the backlog. These setup steps do not establish that a live email was accepted or delivered; verify the resulting notification state and Resend event separately.

## Email content and submission identity

The notification subject is **New Inquiry — VAVI Tile Studio**. HTML and plain-text bodies contain the visitor's name, validated email, message, every supplied optional project/contact field, and an explicitly labelled submission timezone. Empty optional fields are omitted. If present, the inspiration filename is included; the private file is accessed through the dashboard. Visitor text is HTML-escaped.

The primary **View Inquiry Dashboard** button, visible fallback link, and plain-text link open [the owner dashboard](https://dashboard.vavitilestudio.com/). `Reply-To` contains only the validated visitor mailbox, so the owner can reply directly. The destination recipient and sender come from server configuration.

The form disables repeated clicks immediately and retains an idempotency key in memory for retries of identical fields and file bytes. Changed content or “Start another enquiry” creates a new key. The server accepts a UUID v4 `Idempotency-Key` header, stores its reference uniquely, and compares a SHA-256 fingerprint before confirming a retry. A key reused for different content returns HTTP 409. The saved inquiry and notification job are inserted together; competing identical requests cannot create a second job. Page reloads/new tabs and independent submissions have separate identities and are not treated as the same inquiry merely because their text happens to match.

The notification worker claims a job with a database lease. It persists the exact first email payload and uses `vavi-inquiry/<reference>` as the Resend idempotency key. Retries reuse that payload and key, even if the template or owner configuration changes later. The lease and provider key protect against competing workers and a lost provider acknowledgement. Resend's idempotency retention is finite, so automatic retries stop 23 hours after the first prepared send and require operator reconciliation. This is an at-least-once queue with duplicate safeguards; provider acceptance does not establish delivery to an inbox.

## Hosted retry schedule

Configure an authenticated hosted scheduler to call the public website every **five minutes**:

```http
GET /api/enquiry/notifications/retry
Authorization: Bearer <CRON_SECRET>
```

`POST` is also supported for an operator-triggered retry. The secret must match the website environment exactly; missing or invalid authorization returns HTTP 401. Use HTTPS and store the token in the scheduler's secret configuration. Do not place it in the URL or source control.

The endpoint processes up to **three due jobs** per invocation. Failed jobs use a bounded retry delay; jobs already sent, currently leased, not yet due, or marked `needs_review` are not resent. An abandoned lease expires after five minutes. The response contains only a processed count and statuses. An authorized HTTP 200 indicates that the batch was inspected; inspect its `results` values to identify failed or review-required jobs.

No hosted scheduler is created by this repository change. Choose a scheduler supported by the deployed account and ensure it permits a five-minute interval and the bearer header. Do not assume a particular Vercel plan supports that interval. Monitor failed and review-required jobs, and queue age/backlog; increase processing capacity if more than three jobs per interval need retrying.

## Manual retry

From the project root, with the same target database and provider settings in `.env.local`:

```sh
npm run enquiries:retry
```

This invokes the same bounded worker for up to three due jobs. It prints only aggregate counts/status, exits nonzero for missing configuration, failed jobs, review-required jobs, or an execution failure, and does not change jobs that are not due. An empty batch prints zero counts. The CLI uses local server credentials directly and does not need `CRON_SECRET`; the hosted HTTP endpoint does require it. Running the command is a real send attempt for eligible jobs, not a dry run.

## Delivery state and reconciliation

Inspect notification metadata through a restricted database session, without exporting visitor details:

```sql
SELECT reference, status, attempts, next_attempt_at, first_attempt_at,
       provider_id, sent_at, last_error
FROM public.enquiry_notifications
ORDER BY created_at DESC
LIMIT 100;
```

| Status | Meaning and next action |
| --- | --- |
| `pending` | Saved inquiry awaiting its first notification attempt. |
| `sending` | A worker holds a temporary lease. A crashed worker's lease can expire for retry. |
| `failed` | Delivery/configuration/state could not be confirmed; retain the inquiry and retry after `next_attempt_at`. Fix server configuration when indicated. |
| `sent` | Resend accepted the email and returned `provider_id`. This does **not** prove inbox delivery. Check Resend delivery/bounce events when investigating receipt. |
| `needs_review` | Automatic sending is stopped because the safe retry window expired, the stored reply address is invalid, or Resend rejected a mismatched idempotent request. Reconcile before taking further action. |

Application logs contain a reference, bounded failure code, and status. They do not include raw provider errors, credentials, recipient addresses, or the visitor's message. A database acknowledgement failure may leave an accepted email without a recorded `provider_id`; this is why uncertain sends are retried with the same payload/key within the safe window.

For a `needs_review` or uncertain job, first find the inquiry reference and its first-attempt time, provider ID (if recorded), and configured/stored recipient. In Resend Logs, reconcile the provider ID or the matching send event, recipient, timestamp, subject, and idempotency key where available. If the message was accepted, record the confirmed provider ID and resolved state through restricted operational access; do not resend it. If the message was rejected or no acceptance can be confirmed, determine the cause and approve a deliberate recovery before resetting or requeuing. Do not blindly clear the payload, first-attempt timestamp, or status: after the idempotency window, reusing a key can send another email. A pending send also retains its original recipient after the initial payload is prepared; changing an environment variable does not rewrite that stored request.

## Verification procedure

Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`. The inquiry tests cover validation, atomic inquiry/queue insertion, stable retries and conflicting content, save-before-schedule order, failure preservation, escaped email details, timezone handling, provider idempotency, and the authenticated retry endpoint. Provider test doubles establish these code paths but do not establish a live email delivery.

Before release, use an isolated database branch and an approved test recipient/sender to submit a full inquiry through the form, confirm `saved: true`, compare its row and owner-dashboard details, then inspect the real Resend event and received email. Check Reply-To, every supplied field, omitted empty fields, timezone, and both dashboard links. Repeat the same request key and verify one inquiry/job/message, then exercise a controlled provider failure and retry without losing the inquiry. Record the exact target and observed outcomes separately; this guide makes no claim that hosted deployment or inbox verification has been completed.
