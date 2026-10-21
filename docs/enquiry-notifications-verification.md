# Inquiry notification verification — 20 October 2026

Implementation target: the public Next.js website and its existing Neon inquiry table, plus backward-compatible attachment downloads in the owner application. The owner recipient is `info@vavitilestudio.com`. The email uses VAVI paper/forest colors, escaped visitor details, a Toronto timestamp with its UTC offset, HTML and plain-text bodies, validated Reply-To, and the requested dashboard button and fallback URL.

## Executed checks

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

## Remaining live activation checks

No real email has been sent. The user supplied a valid Resend key under `RESEND_EMAIL_API_KEY` in the private `.env` file; it has also been configured as `RESEND_API_KEY` in private `.env.local`. An authenticated Resend API check succeeded, but the domain is `not_started` and all three required public DNS records are absent. See [the exact Cloudflare DNS setup](resend-dns-setup.md). The local sender/recipient values are configured as `info@vavitilestudio.com`; no credential was committed.

Production activation still requires the actual Resend credential and verified sending domain, applying the additive migration to the deployment's database, setting the server environment, deploying both applications (owner first for attachment-path compatibility), and configuring the authenticated retry scheduler. The test branch expires automatically at 22:00 America/Toronto on 21 October 2026. Existing production inquiries and hosting settings were unchanged.

Once configured, submit one approved synthetic inquiry, verify it in the authenticated owner dashboard, inspect the Resend delivery event and received message at the configured owner mailbox, check Reply-To and both links, and confirm that replaying the same submission key produces no second email. Follow [the setup and retry guide](enquiry-notifications.md).
