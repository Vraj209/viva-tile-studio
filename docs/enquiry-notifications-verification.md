# Inquiry notification verification

Implementation target: the public Next.js website and its existing Neon inquiry table, plus backward-compatible attachment downloads in the owner application. The owner recipient is `info@vavitilestudio.com`. The email uses VAVI paper/forest colors, escaped visitor details, a Toronto timestamp with its UTC offset, HTML and plain-text bodies, validated Reply-To, and the requested dashboard button and fallback URL.

## Implementation checks — 20 October 2026

- Public website automated suite: 111 tests passed. Owner application: 19 tests passed. TypeScript and ESLint passed for the changed applications.
- Production builds passed for the public website and owner dashboard. On Windows the public build required execution outside the filesystem sandbox to create Next.js junctions.
- Applied both migrations twice on disposable Neon branch `dev-inquiry-notifications-20261020` (`br-bitter-hill-b3bjpxrx`), confirming repeatable schema setup. The production database was not migrated.
- Twelve real database integration checks passed: concurrent duplicate submissions, payload conflicts, save-before-schedule ordering, owner list/detail queries, concurrent worker claims, failure/retry, frozen provider payload, lost state acknowledgements before and after commit, expired retry windows, stale lease fencing, and private outbox/no historical backfill. All provider requests in these checks were test doubles; seven synthetic inquiries were removed afterward.
- Six browser scenarios passed against a local production build at `http://127.0.0.1:3110`: desktop and mobile form saves with loading/disabled controls; synchronous duplicate prevention; a lost-success-response retry with the same UUID; 390px and 600px email previews; and the published dashboard URL.
- Read back the three browser-created references on the test branch: each has exactly one inquiry and one notification job. Missing provider configuration left each job retryable with `notification_configuration_missing`; the visitor still saw the saved confirmation. These synthetic rows are confined to the disposable branch.
- The dashboard link reached `https://vavi-tile-studio-dashboard.vercel.app/login` with HTTP 200 and “Welcome back.” The real dashboard query functions read and mapped the synthetic inquiry correctly against the test database using their authorization test seam. A signed-in hosted dashboard session was not available for this check.
- No notification credentials or provider-send implementation appeared in the generated browser bundles.

Evidence:

- [Database integration report](../work/enquiry-notifications/live-report.json)
- [Browser report](../work/enquiry-notifications/browser-report.json)
- [Mobile email preview](../work/enquiry-notifications/email-390.png)
- [Desktop email preview](../work/enquiry-notifications/email-600.png)
- [Mobile saved confirmation](../work/enquiry-notifications/mobile-saved.png)
- [Lost-response retry confirmation](../work/enquiry-notifications/lost-response-retry-saved.png)

## Production configuration and retry — 26 October 2026

The production website had `RESEND_EMAIL_API_KEY`, which the application does not read, and lacked `ENQUIRY_NOTIFICATION_FROM` and `ENQUIRY_NOTIFICATION_TO`. This caused `notification_configuration_missing` before any Resend request despite the domain being verified.

- Added the user-approved credential as the Production secret `RESEND_API_KEY`; configured both sender and recipient as `info@vavitilestudio.com` on the public website project. No credential was committed.
- Redeployed unchanged application commit `ad27a6a87feaac99873b7028cc17c08780634b60`. Deployment `dpl_kyKd2qFejo8XQVtGuen9xjv4FphE` reached `READY` and received the public aliases.
- With explicit user approval, retried only reference `8b47797a-2ce9-4aab-974a-51822fb2bf4a`. The original saved form was replayed to production with the same idempotency key after its request fingerprint matched; it had no attachment. The endpoint returned HTTP 201, `saved: true`, and the same reference.
- Database readback confirmed exactly one inquiry and one notification job. The job has `status=sent`, `attempts=2`, `last_error=null`, provider ID `01a178be-837d-7807-921e-ee1e594db3ff`, and `sent_at=2026-10-26T15:05:14.027Z` (11:05:14 America/Toronto).
- Resend accepted the email and subsequently showed **Delivered** for the matching provider ID, recipient, and subject. Application `sent` means provider acceptance; Resend's later status confirms delivery to the recipient's mail server. The owner's mailbox was not opened, so inbox placement and reading have not been checked.

Optional mailbox verification remains for inbox placement, Reply-To, email content, and dashboard links. This retry did not establish an automatic retry scheduler or verify any other queued jobs. Follow [the setup and retry guide](enquiry-notifications.md).

## Historical activation boundary — 20 October 2026

At the implementation-check boundary, no real email had been sent. The supplied key was stored locally as `RESEND_EMAIL_API_KEY` and copied to the canonical `RESEND_API_KEY` in private `.env.local`. An authenticated Resend API check succeeded, but the domain was then `not_started` and the three required public DNS records were absent. The [Cloudflare DNS setup](resend-dns-setup.md) records that earlier setup work; it does not describe the verified domain's current state.

Those checks left production inquiries and hosting settings unchanged. The disposable test branch was configured to expire at 22:00 America/Toronto on 21 October 2026. The production configuration and single-reference retry above supersede the earlier activation boundary.
