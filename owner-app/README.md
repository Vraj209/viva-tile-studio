# VAVI Owner

A separate Next.js application for the VAVI team. The public landing page stays in the repository root; this folder has its own dependencies, lockfile, build, server, environment, and deployment. It reads the same `public.project_enquiries` table and private attachments used by the landing page.

## Run

```sh
cd owner-app
npm ci
npm run dev
```

Open http://127.0.0.1:3001. The landing page can run separately on port 3000. For a production server, use `npm run build` then `npm start`. Both local server commands bind to loopback.

## Features

- Search all stored inquiries by name, email, company, phone, location, project, idea, or reference.
- Filter by project type and received date, with server pagination and overall inquiry counts.
- Open complete project briefs, customer contact information, desired dates, dimensions, and attached inspiration.
- Download attachments through an authenticated server route. Storage URLs and keys are never returned to the browser.
- Managed Neon email/password login, password reset, email verification codes, account details, and sign-out.
- Approved email addresses and verified sessions are required on every database or file read. Public sign-up and admin APIs are not exposed by this application.

The inbox is read-only. Reload it with **Refresh** to see newly submitted inquiries; there is no automatic polling or workflow/status editing.

## Current local setup

Neon Auth was enabled on the existing inquiry database branch. `owner-app/.env.local` contains the local server connection settings and a generated cookie secret; it is ignored by Git. `OWNER_EMAILS` is deliberately empty because the owner email will be supplied later. The app shows its setup state and refuses data access until that is set.

No owner account has been created and no account email has been sent. No existing inquiry rows were changed.

For a new machine, copy `.env.example` to `.env.local` and fill in the server-only values:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Same Neon database and branch as the public form; use a server role allowed to read `public.project_enquiries`. |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION` | Credentials for the same private storage branch as the landing page. |
| `ENQUIRY_STORAGE_BUCKET` | Existing bucket; defaults to `viva-tile-studio`. |
| `NEON_AUTH_BASE_URL` | Managed Auth URL for this branch, including its database/auth path. |
| `NEON_AUTH_COOKIE_SECRET` | A randomly generated secret of at least 32 characters; keep it stable across owner-app instances. |
| `OWNER_EMAILS` | Comma-separated, exact email addresses allowed to read inquiries. No wildcards or email-domain grants. |
| `OWNER_APP_URL` | Owner application origin, recorded for setup/deployment reference. Reset requests use the current browser origin. |

No variable should be prefixed with `NEXT_PUBLIC_`. Each app loads its own environment; the owner app does not automatically load the repository root's files.

## Activate the first owner

1. Add the approved address to `OWNER_EMAILS` in `.env.local`, then restart the owner server. Keep other team members only if they should have full access to every inquiry.
2. Run this from `owner-app`, substituting the actual approved email and name:

   ```sh
   npm run owner:setup -- --email owner@example.com --name "Owner Name" --origin http://127.0.0.1:3001
   ```

   This command creates a managed identity with a random password that is never printed or stored by the script, then requests an email link to choose a password. **It sends account email when you run it.** It refuses an email not already approved in `OWNER_EMAILS`. For an existing identity or to retry email delivery, use `--reset-only` (no `--name` needed).
3. The owner follows the emailed reset link, chooses their password, and signs in. The app then offers a verification code by email if the address is not already verified.
4. After verification, open the inbox. Test sign-out, reload, and the full reset flow with the real mailbox.

Use `npm run owner:setup -- --help` for options. Accounts and sessions are managed by Neon Auth; the application never stores passwords in the inquiry table. To add another approved team member, add their email to the allowlist and run setup for that address. To revoke access, remove the address and restart/redeploy every owner-app instance; use Neon Auth to revoke sessions or disable the identity as needed. Every data read checks the live session, so provider revocations do not rely on the SDK's cached session cookie.

## Deploy independently

Create a separate hosting project with **Root Directory `owner-app`**, and its own owner-facing domain. Install with `npm ci` and build with `npm run build`. Do not deploy the repository root as the owner application.

Configure the owner's environment values on that project. Point its database and storage settings at the same branch used by the public landing page. Register the exact HTTPS owner-app origin in Neon Auth's trusted domains before issuing password setup/reset emails for it. Localhost is currently allowed for development.

Neon's shared email provider supports password reset links and verification codes for local setup. Configure custom SMTP and test delivery for production following the [Neon production checklist](https://neon.com/docs/auth/production-checklist). This app does not enable public account registration; other sites using the same Auth branch must enforce their own permissions.

The app emits noindex/noarchive and private responses. It has not been deployed publicly. Existing-session revocation specifically after a password reset is provider-controlled; verify the managed configuration rather than assuming it from this client implementation.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Authorization tests cover missing/expired/mismatched sessions, unverified or unapproved accounts, banned identities, impersonation, and disabled auth endpoints. Data tests cover authorization before I/O, bound search parameters, pagination, full detail mapping, private downloads, metadata constraints, size limits, and safe failures.

Verification performed during implementation:

- Owner app lint, TypeScript, production build, and 18 tests passed.
- Public landing-page lint, TypeScript, and all 45 existing tests passed.
- Live read-only database inspection confirmed all 17 inquiry columns, one inquiry, and one attachment. No customer content was printed or modified.
- Local HTTP checks confirmed an unconfigured attachment endpoint returns 503 without data, account APIs return 503, and public signup returns 404.
- Login, reset navigation, and setup states were inspected in the browser. See the implementation handoff for any outstanding live mailbox checks.

Real sign-in, email receipt, reset completion, authenticated browser data, and attachment download through a real session remain to be verified after the owner provides their email. Unit tests use controlled fixtures and do not substitute for that end-to-end check.
