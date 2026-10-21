# VAVI Tile Studio

A complete local landing-page implementation built around **“From imagination to a space that is yours.”** It follows one recognizable botanical design from artwork to tile, a continuous composition and an interior concept, then carries that artwork into the project enquiry.

The page includes a readable hero, four-beat transformation, three application narratives, an accessible inspiration gallery, all six supplied process stages, source-attributed technical specifications, conditional FAQs and a real server-side enquiry handler. This is a reviewable local implementation; it has **not been published externally**.

## Run locally

The separate owner application is in [`owner-app/`](owner-app/README.md). It has its own login, password reset, inquiry inbox, and deployment. Run `cd owner-app` then `npm run dev` to open it on port 3001. Owner email approval and first-account activation are described in its README.

Use Node.js 20.9 or later; this project was built with Node.js 24.13.0. From the project folder:

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000) or [127.0.0.1:3000](http://127.0.0.1:3000). The development and production start scripts bind to the local loopback interface. Install from the included `package-lock.json`; `npm ci` requires registry access on first setup.

For a local production build:

```sh
npm run build
npm run start
```

Stop the development server first if it is using port 3000. To use another port, append `-- --port 3001` to the dev or start command. None of these commands deploys the site.

Configuration is optional for browsing the page. To configure enquiries, copy `.env.example` to `.env.local`, edit the server-only values and restart the server. A valid `DATABASE_URL` enables enquiries once the tables have been migrated; use the same database in the public deployment and owner dashboard. Private S3 storage is optional and enables inspiration attachments. Successful submissions appear in the dashboard after the database write completes. The Neon adapter queues a Resend owner notification with each new inquiry; configure its sender, recipient, API key, and hosted retry schedule using the [notification guide](docs/enquiry-notifications.md). Configure the public deployment's server environment as well as local settings.

## Stack

Installed versions were checked against the npm registry during setup and are captured in the lockfile:

| Package | Version |
| --- | --- |
| Next.js, App Router | 16.3.6 |
| React / React DOM | 19.3.0 |
| React Three Fiber | 9.8.1 |
| Three.js | 0.186.1 |
| GSAP | 3.15.0 |
| `@gsap/react` | 2.1.2 |

TypeScript is used throughout. Manrope Variable and Cormorant Garamond are bundled locally through Fontsource. Their SIL OFL notices are retained in [docs/licenses](docs/licenses/).

## Sources and visual assumptions

The initial implementation received only two text briefs, with no visual assets or technical document. The complete original wording is preserved without edits in:

- [Business copy and commercial references](data/vavi-original-website-copy.txt)
- [Creative and engineering brief](data/vavi-original-creative-and-engineering-brief.txt)

The destination project later supplied images, a poster PDF and `data/Technical datasheet.docx`. The 27 September technical update uses the actual datasheet for attributed product information; the existing imagery remains labelled concept artwork. The original phrase **“custom 3D printed tiles”** remains in the brief archive, while the datasheet describes handmade high-relief tiles. The specifications attribute that description to the datasheet without inferring additive manufacturing, an exact production process or a verified relief depth. The relationship between those descriptions remains a manufacturer question.

Three images were generated for this implementation and are presented as design explorations or concept visualizations. Midnight Garden is flat artwork; painted shading is not verified tile relief. Its interior is an illustrative room. Terra Rhythm is a separate commercial concept. Neither room is presented as a completed VAVI installation. The gallery detail is explicitly a crop of the same botanical artwork, not an additional project.

| Documentation | Contents |
| --- | --- |
| [Source audit](docs/source-audit.md) | Actual initial inventory, source checksums, ten commercial reference observations, content mapping and owner confirmations. |
| [Visual system](docs/visual-system.md) | Verified IDST values versus VAVI adaptations, A24 desktop/mobile observations, typography, storyboard, contrast calculations and motion boundaries. |
| [Asset register](docs/assets.md) | Actual paths, resolution, ratios, bytes, provenance, role and replacement instructions. |
| [Generation prompts](docs/generation-prompts.md) | Recorded prompts and provenance for the generated design studies. |
| [Enquiry integration](docs/enquiry.md) | Adapter contracts, validation, uploads, privacy boundaries, spam controls and actual HTTP checks. |
| [Owner email notifications](docs/enquiry-notifications.md) | Resend environment setup, atomic inquiry/notification persistence, duplicate safeguards, retry scheduling and operator reconciliation. |
| [Verification](docs/verification.md) | Build/check outcomes, browser QA evidence and testing limitations. |
| [Technical clarifications](docs/technical-clarifications.md) | Internal publication policy, source discrepancies, manufacturer questions, evidence requests and an unsent email draft. Never publish this file. |

## Project map

```text
src/app/
  page.tsx                 Complete visitor journey
  layout.tsx               Fonts, metadata and noindex setting
  globals.css              Semantic tokens and responsive page styling
  opengraph-image.tsx       Provisional typography-only social preview
  api/enquiry/route.ts      Dynamic Node.js enquiry endpoint
src/components/
  SiteHeader.tsx           Desktop navigation and mobile menu
  Hero.tsx                 Server-rendered proposition, imagery and CTAs
  HeroMotion.tsx           Restrained CSS sample-fan enhancement
  TileStory.tsx            Static story, motion controls and GSAP progress
  TileScene.tsx            One scoped React Three Fiber renderer
  Possibilities.tsx        Residential, professional and commercial entries
  ProjectGallery.tsx       Concept gallery and native detail dialog
  Process.tsx              All six supplied process stages
  TechnicalSpecifications.tsx  Source-attributed technical groups and download
  FAQ.tsx                  Conditional project guidance
  ProjectEnquiry.tsx       Accessible form and actual submission states
  SiteFooter.tsx           Useful page navigation and brand close
src/lib/
  content.ts               Application, process and FAQ copy
  technical-specifications.ts  Shared typed specifications and technical FAQs
  motion.ts                Shared progress model and scene timing
  enquiry-config.ts        Field policy, choices and upload limits
  enquiry.ts               Server validation and delivery/private storage
public/images/             Three optimized, generated WebP studies
public/downloads/          Genuine source DOCX download
data/                      Original briefs, supplied assets and technical DOCX
docs/                      Provenance, integration and verification notes
tests/enquiry.test.ts       Enquiry contract and integration tests
```

The hero uses a CSS sample fan, not a second WebGL renderer. Only the signature story mounts a canvas, and only on eligible desktop with motion enabled. GSAP controls one shared progress model; R3F reads it into scene transforms. The mural uses nine UV windows into one continuous artwork rather than nine repeated copies. A matching image provides the final room reveal.

Mobile, reduced-motion and disabled-JavaScript visitors get the four-beat static sequence. Eligible desktop visitors can also select **“View without motion.”** Essential copy, headings, navigation and imagery are server-renderable. Scene errors and context loss have image-based fallbacks. The form explains its JavaScript requirement. Consult the verification record for what was actually exercised in browsers.

## Technical specifications and download

The `#specifications` section sits after the process and before the FAQ. Its server-rendered description lists and technical FAQ entries share `src/lib/technical-specifications.ts`. Header, mobile menu and footer navigation link to the section; the project-specific specifications action opens the existing enquiry section. Successful delivery requires a configured enquiry adapter.

`public/downloads/technical-datasheet.docx` is a byte-identical copy of the original `data/Technical datasheet.docx` (16,705 bytes; SHA-256 `BBDDCF13F8118CB1132D66BF9285D10450754800C162048E1F873FAA44022847`). It is served at `/downloads/technical-datasheet.docx`. A visible note beside the download identifies the source document and its unresolved exterior conditions and test references. The original remains untouched. No PDF was produced because a reliable bundled LibreOffice converter was unavailable; the genuine DOCX is the download.

Published values are source-attributed, not independently verified. Both absorption values retain their body labels; hardness is labelled Mohs, with no inferred PEI class. Exterior suitability, formats, relief thickness, installation systems and poolside exposure require product-specific confirmation. The active-pool-tank restriction is visible in the section. Absolute UV/frost assurances and affirmative lead/cadmium, fire, environmental and certification claims are withheld from newly authored website copy. The original download still contains those unresolved source statements.

Keep manufacturer questions and the unsent email in `docs/technical-clarifications.md`; they are not public assets. When replacing the source, preserve an archived original, review all affected public values/FAQs and qualifications, and verify that the download is the actual approved artifact. Do not remove qualifications simply because a manufacturer repeats a claim without its relevant evidence and scope.

## Connect enquiries

The handler accepts multipart form data at `POST /api/enquiry`. Required fields are name, email and the idea; additional context and one file are optional. The form submits directly without an availability banner or preflight gate. `GET /api/enquiry` returns `available` and `uploadsAvailable` booleans; the frontend uses this response to show the optional upload field. Submission success requires actual receiver acceptance or completed private persistence.

Choose **exactly one** adapter in `.env.local`:

1. **Neon database with optional private storage:** Set `DATABASE_URL` to the branch's Postgres connection string, using the same database as the owner dashboard. Set the direct connection in `DATABASE_URL_UNPOOLED`, then run `npm run db:migrate` to create `public.project_enquiries` and its notification queue. These database settings are enough to save enquiries without files. To enable attachments, also set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3` (HTTPS) and `AWS_REGION` for that branch. `ENQUIRY_STORAGE_BUCKET` defaults to `viva-tile-studio`. The server returns HTTP 201 with `saved: true` after atomically inserting the enquiry and notification job and, when supplied, storing its attachment in the private bucket. Configure Resend and retries using the [notification guide](docs/enquiry-notifications.md); email failure preserves the saved inquiry. No AI Gateway is needed for enquiries.
2. **HTTPS webhook:** Leave `DATABASE_URL` unset. Set `ENQUIRY_WEBHOOK_URL` to an owner-approved receiver and optionally set `ENQUIRY_WEBHOOK_TOKEN`. The receiver must accept/store the lead before returning 2xx. The payload contains an `enquiry` JSON form field and optional `inspiration` file. Redirects are rejected and delivery has a 12-second timeout.
3. **Private filesystem:** Leave `DATABASE_URL` unset. Set `ENQUIRY_STORAGE_DIR` to an explicit absolute path outside any web-served directory. Use persistent private storage and appropriate permissions. Do not use ephemeral serverless storage or commit enquiry records.

Without a valid adapter, or with conflicting adapters, the server rejects submissions. Setting a valid `DATABASE_URL` selects Neon; missing or invalid storage settings disable attachments only. A file submitted without usable storage receives HTTP 422 with an `inspiration` field error before anything is saved. Clear both legacy adapter variables when using Neon. The Neon adapter supports Resend owner notifications; the private filesystem adapter requires a separate staff review process, and the HTTPS receiver owns its notifications. Runtime persistence errors keep the visitor's entered information and report that receipt could not be confirmed. Configuration availability alone is not a database, bucket, receiver, or email-provider health check.

For deployment, configure the same server-only secrets for the intended branch and run the migration against its direct connection before accepting enquiries. The migration command loads `.env.local`; it does not deploy the app. [Integration documentation](docs/enquiry.md) includes staff queries, authenticated attachment access and reconciliation of uncertain database writes.

Uploads are limited to one JPEG, PNG, WebP or PDF up to 5 MiB. The server checks signature, MIME, extension and size and provides no public attachment endpoint. A honeypot, same-origin POST check and conservative in-process rate limiter are included. Multi-instance production use needs a shared limiter and a suitable ingress configuration; the attachment signature check is not malware scanning. [Integration documentation](docs/enquiry.md) covers these operational limits and the private retention/access decisions required before launch.

Set `ENQUIRY_ALLOWED_ORIGIN` to the exact public origin when deploying behind a reverse proxy. Leave `ENQUIRY_TRUST_PROXY=false` unless the trusted ingress overwrites/sanitizes `X-Forwarded-For`. Do not expose any of these secrets through `NEXT_PUBLIC_` variables. No personal enquiry fields or uploads are included in analytics.

Set `SITE_URL` to the actual approved origin for absolute metadata URLs. `src/app/layout.tsx` intentionally emits **noindex, nofollow** until owner signoff. The social preview uses provisional typography; no approved VAVI logo or imagery was supplied. Setting a domain does not authorize publication or remove the noindex setting automatically.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

The enquiry suite recorded **11 passing tests**, covering validation, unconfigured behavior, origin checks, upload restrictions, real temporary private persistence, simulated webhook acceptance/failure and rate limiting. A test receiver is not a configured live business recipient. Actual server/browser checks and their limits are recorded in [docs/verification.md](docs/verification.md) and [docs/enquiry.md](docs/enquiry.md).

The requested LCP ≤2.5s, CLS ≤0.1 and approximately 200ms interactions remain **measurement targets**, not claimed passes. The complete production JavaScript inventory, individually gzip-compressed, plus all three source WebP images and all emitted font/media files totals **1,342,552 bytes** (about 1.34 MB). This conservative file inventory is below the initial 3 MB deferred-scene budget, but is not a measured initial transfer or runtime performance result. See [verification](docs/verification.md) for the breakdown and profile the chosen production host and agreed device/network conditions before launch.

## Owner release checklist

- [ ] Confirm **manufacturing terminology** and approve the public description of the actual process.
- [ ] Supply evidence for **physical surface relief** before depicting or claiming it.
- [ ] Confirm **approved applications**, substrates, finishes, sizes and installation requirements.
- [ ] Decide **launch geography** and handling of enquiries by location; no territory or address was invented.
- [ ] Approve **image provenance** and concept labels, or replace studies with permitted product/project assets.
- [ ] Review **font permission and brand treatment**; retain the included font licenses.
- [ ] Supply verified **contact details** and actual privacy/legal/social destinations where required.
- [ ] Configure and verify **enquiry delivery**, private retention/access and staff receipt with a real end-to-end enquiry.

Review the completed browser/performance evidence, approve final copy and explicitly authorize external publication before changing indexing or deploying.
