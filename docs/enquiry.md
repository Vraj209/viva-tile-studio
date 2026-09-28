# Project enquiry integration

The form is intentionally unavailable until a real delivery or private storage adapter is configured. `GET /api/enquiry` exposes only `{ "available": boolean }`. `POST /api/enquiry` accepts multipart form data and returns success only after completed Neon persistence, upstream HTTP 2xx acceptance or completed private filesystem persistence. Neon uses the existing server-side Next.js handler: the browser receives no database or bucket credentials, and enquiries do not use the AI Gateway.

## Configure one adapter

Set server-only environment variables in `.env.local` or the deployment's secret settings. Never prefix these variables with `NEXT_PUBLIC_`.

### Neon database and private object storage

Use the Postgres connection and storage credentials for the same Neon branch. `.env.example` lists the variables with empty credentials:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Application connection, using a valid `postgresql://` or `postgres://` URL; a pooled connection is appropriate. |
| `DATABASE_URL_UNPOOLED` | Direct connection for migrations; hosts containing `-pooler` are rejected by the migration runner. |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Server-only storage credentials. |
| `AWS_ENDPOINT_URL_S3` | HTTPS S3 endpoint for the selected branch. |
| `AWS_REGION` | Storage region. |
| `ENQUIRY_STORAGE_BUCKET` | Optional private bucket name, defaulting to `viva-tile-studio`. |

When `DATABASE_URL` is set, the app selects Neon and requires all four storage settings even for enquiries without attachments. Invalid Neon settings leave the form unavailable. Leave `ENQUIRY_WEBHOOK_URL` and `ENQUIRY_STORAGE_DIR` empty; a database connection combined with either legacy adapter is a configuration conflict, not a fallback.

Create the table before enabling submissions:

```sh
npm run db:migrate
```

The runner, `scripts/migrate-enquiries.mjs`, loads `.env.local` and applies `db/migrations/001_project_enquiries.sql` using `DATABASE_URL_UNPOOLED`. It creates `public.project_enquiries` with row-level security enabled and no anonymous policies. The server's privileged database credential can insert; do not expose it to visitors or add anonymous table access. On an app host, configure the same server-only variables and run the migration against the intended deployment database. Setting local credentials or running this migration does not deploy the Next.js app.

Each row contains the UUID `reference`, `received_at`, and the validated fields `name`, `email`, `idea`, `project_type`, `application`, `location`, `dimensions`, `company`, `phone` and nullable `desired_date`. An optional upload has nullable `inspiration_bucket`, `inspiration_key`, `inspiration_original_name`, `inspiration_mime` and `inspiration_bytes` metadata. File bytes remain in the private bucket under `enquiries/<reference>/inspiration.ext`, using the validated extension; no public URL is saved or returned.

For enquiries with an attachment, the handler uploads it first, then inserts the row. It returns HTTP 201 with a reference only after both succeed. An upload failure or database failure returns HTTP 502 without a reference and preserves the visitor's form data. A database failure can be ambiguous: the insert may have committed before the connection failed. The handler retains any uploaded private object for staff reconciliation instead of risking deletion of an accepted enquiry's attachment. A deliberate retry generates a new reference and may duplicate a previously committed enquiry. Review rows and objects before removing any unreferenced file; the adapter does not automatically delete uncertain uploads.

### Staff review and attachments

Neon persistence does not send email or staff notifications. Authorized staff can review recent enquiries in a restricted SQL session:

```sql
SELECT reference, received_at, name, email, idea,
       project_type, application, location, dimensions,
       company, phone, desired_date,
       inspiration_bucket, inspiration_key,
       inspiration_original_name, inspiration_mime, inspiration_bytes
FROM public.project_enquiries
ORDER BY received_at DESC
LIMIT 100;
```

Retrieve attachments using authenticated bucket access on the same branch and the stored bucket/key. Keep `viva-tile-studio` private; this app provides no public attachment endpoint or staff inbox. Review database rows and objects together when reconciling an uncertain write. Do not copy personal enquiry data into application logs, analytics or public issue trackers. Agree staff access and a retention process covering both rows and objects before launch.

### HTTPS webhook

```dotenv
ENQUIRY_WEBHOOK_URL=https://YOUR-APPROVED-RECEIVER/enquiries
ENQUIRY_WEBHOOK_TOKEN=YOUR-OPTIONAL-SECRET
ENQUIRY_ALLOWED_ORIGIN=https://YOUR-PUBLISHED-ORIGIN
```

Leave `DATABASE_URL` and `ENQUIRY_STORAGE_DIR` unset. The owner must provide a real receiver. The request contains a multipart `enquiry` field holding JSON and, when present, an `inspiration` file. The JSON includes a UUID reference, receipt timestamp, all validated fields and upload metadata. An optional token is sent as `Authorization: Bearer ...`. The receiver must durably accept/store the lead before responding with a 2xx status; it is responsible for notifications, retention and restricted access. Redirects are rejected. The request times out at 12 seconds. Configure the receiver to handle UUID references as unique lead identifiers. A timeout can happen after acceptance: the interface accurately says receipt could not be confirmed, and does not silently retry. A deliberate second attempt creates a new reference and can duplicate a previously accepted lead; the receiver should provide operational deduplication when needed.

### Explicit private filesystem storage

```dotenv
ENQUIRY_STORAGE_DIR=C:\absolute\private\vavi-enquiries
```

Leave `DATABASE_URL` and `ENQUIRY_WEBHOOK_URL` unset. Use an absolute path **outside any web-served directory**, with a persistent writable volume in production. Paths with a `public` segment are rejected; runtime realpath checks also reject a link into this project's public folder. This adapter is suitable for self-hosting or local verification. Do not use an ephemeral serverless filesystem for real leads. Its presence is explicit opt-in: the app never selects it automatically. It persists enquiries without sending notifications; arrange a real operational process to review that directory before enabling it for visitors. Each accepted UUID directory contains `enquiry.json` and an optional `inspiration.jpg`, `.png`, `.webp` or `.pdf`. Writes use a private staging directory and atomic rename before success. Files request mode `0600`, directories `0700`; configure equivalent restricted ACLs on Windows. Do not expose the directory in a static server or publish it to source control.

Set exactly one adapter. Missing, malformed, or conflicting configuration reports unavailable. Configuration availability does not imply database, bucket or receiver health; runtime failures return an honest error and keep the entered information. Restart the app after changing environment values. Required field policy and project/application choices live in `src/lib/enquiry-config.ts` for owner review.

## Validation and protection

- Required: name, valid email and idea description. Optional: project type, application, location, dimensions, company, phone, desired date and one inspiration file. Server limits enforce field lengths, plain text and valid calendar dates. Duplicate or unknown fields are rejected.
- Uploads: maximum 5 MiB, JPEG/PNG/WebP/PDF only. The server checks the file signature, MIME declaration and extension together. Total multipart body is bounded to 5 MiB + 64 KiB while reading, including requests without Content-Length. SVG/HTML/executable uploads are refused. Signature verification is not malware scanning or a full file decoder; scan attachments with a trusted service before staff opens them, and never render them inline from this server. There is no public attachment endpoint.
- Check the hosting provider's request-size limit before launch. If it is lower than the application limit, lower `MAX_UPLOAD_BYTES` and its corresponding help/error copy, or use an approved private signed-upload flow; hosting may reject a request before this handler runs.
- Same-origin POST verification rejects a missing or mismatched `Origin`. By default, it uses the request URL's protocol and actual `Host` header, preserving a browser's loopback address when Next.js normalizes it to `localhost`. It does not trust `X-Forwarded-Host`. For reverse proxies, configure `ENQUIRY_ALLOWED_ORIGIN` as the exact published scheme and host so public origin checks remain deterministic. This is not a CORS API.
- An offscreen honeypot rejects automated fills. In-memory rate limiting allows five attempts per ten minutes and caps retained keys at 2,048, expiring old entries on requests. Without trusted proxy configuration, all visitors intentionally share a conservative bucket. Set `ENQUIRY_TRUST_PROXY=true` **only** when your ingress overwrites/sanitizes `X-Forwarded-For`; then its first address is used. Never trust client-supplied forwarding headers on an exposed origin. The limiter is per-process and resets on restart; production multi-instance deployments need a shared edge/Redis rate limiter, ingress body/read-time limits and appropriately configured forwarded headers. Adjust traffic policy before launch.
- No enquiry content, upload, email or phone is sent to analytics or written to console logs. Private fields do not appear in browser URLs. Disable request-body capture in any hosting observability integrations.

## Frontend behavior

The initial unavailable state and availability retry are explicit. Native labels, required fields, keyboard navigation, visible focus, pending/error/success announcements and a native optional-details accordion keep the form usable. Native HTML validation covers missing/invalid required fields before sending. Server errors focus the first affected field and open optional details if necessary. Network and validation errors preserve all field values and the selected file. Confirmed submission shows the returned reference. “Start another enquiry” is the only automatic reset action.

Application links can dispatch this event and then navigate to `#enquiry`:

```ts
window.dispatchEvent(new CustomEvent('vavi:application', {
  detail: { projectType: 'Residential', application: 'Feature wall' },
}));
```

An incoming `?projectType=Residential&application=Feature%20wall#enquiry` URL also selects context. These values are bounded and rendered as text. Do not put personal information in query strings.

## Verification

Run `npx tsx --test tests/enquiry.test.ts` (or the project's test script). Tests exercise unconfigured states, origin checks, field validation, duplicate/unknown fields, honeypot, content-type/signature/extension/size limits, streamed size limits, successful and failed webhooks, actual private filesystem persistence, rate-limit expiry, untrusted proxy headers and invalid dates. Webhook tests use a local test double to verify acceptance behavior; they do not prove a real deployment receiver is configured. Before launch, run one actual enquiry through the selected integration, verify receipt and staff visibility, and verify an upstream failure retains entered information in the browser. Remove local verification records afterward.

For Neon integration verification, use an isolated branch with matching database and bucket credentials. Apply the migration, submit an enquiry without a file and one with a valid file, then verify each database row and the attachment bytes through authenticated storage access. Verify that anonymous attachment access fails, and that invalid credentials or a failed write do not return a success reference. Test the failure path with a test double or the isolated branch. Check that database-plus-legacy adapter settings leave availability false. These steps are a verification procedure, not a claim that a deployed site has passed them; record executed checks and their target separately.

Owner confirmations: form hierarchy, actual delivery recipient, private retention/access policy, a reviewed privacy notice and desired spam-control policy. No placeholder privacy/legal link is shown to visitors.

### Neon integration checks — 27 September 2026

Applied `001_project_enquiries.sql` twice on a temporary branch of `damp-tree-75169454` to verify repeatable setup, then applied it to `production`. Live checks first exercised the handler on that branch, then `GET/POST /api/enquiry` through the locally running production build at `http://127.0.0.1:3101` using the production Neon credentials:

- Availability returned `{ "available": true }`; submissions with and without a PDF returned HTTP 201 and distinct references.
- Read back and compared every submitted field, the optional date, timestamp, and attachment metadata from `public.project_enquiries`.
- Downloaded the private attachment with credentials and compared its bytes. Anonymous access was denied; response headers force attachment download.
- Confirmed database row-level security is enabled with no browser-facing policies.
- Removed all four synthetic records and their two attachments across the test and production branches.
- All 33 automated tests, TypeScript checking, ESLint, and the production build passed. This verifies real HTTP/database/storage behavior; it is not a new browser UI test or a hosted app deployment.

The opt-in live check creates two synthetic records and cleans them up. Prefer a temporary branch and load its environment file explicitly:

```sh
node --env-file=.env.neon-enquiry-test --import tsx scripts/verify-enquiries.mts
```

Set `ENQUIRY_TEST_BASE_URL` to a running local app's origin to exercise its HTTP endpoint; otherwise the script calls the same handler directly. The app server and script must use credentials for the same Neon branch. The temporary file is gitignored; do not commit credentials.

### Earlier unconfigured-server HTTP checks — 24 September 2026

Verified against the running production build at `http://localhost:3001`, with no enquiry transport configured:

| Request / assertion | Observed result |
| --- | --- |
| `GET /api/enquiry` | HTTP 200, `{ "available": false }`, `Cache-Control: no-store` |
| Valid same-origin multipart `POST /api/enquiry` | HTTP 503, “Online enquiries are not connected yet. Your idea has not been sent.” No success reference. |
| Cross-origin multipart POST | HTTP 403 |
| Multipart POST without an Origin header | HTTP 403 |
| `GET /` | HTTP 200 with meaningful server-rendered content |
| Raw HTML with all script elements removed | Hero H1, all four transformation headings, process stages, enquiry heading and all eleven form fields remain present |
| Internal navigation and CTA anchors | Every referenced target exists: `main`, `top`, `work`, `possibilities`, `process`, `enquiry`, `story`, `faq` |
| Illustration disclosure | “Concept visualization” remains in the server-rendered text |

These are actual HTTP/HTML assertions, not a claim of a browser session with JavaScript disabled. No live recipient was configured or contacted by these checks. The successful private-storage and failed-transport paths are covered by the integration tests above; browser flow verification is documented with the full-page QA results. A second review of the handler found no additional issue requiring an application change; shared production throttling, ingress limits, attachment scanning, retention, and receiver configuration remain the documented deployment responsibilities.
