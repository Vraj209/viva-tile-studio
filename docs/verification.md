# Verification record

Recorded 24 September 2026. Local Windows development and production builds, Node.js 24.13.0, using the Codex in-app Chromium browser. This record distinguishes exercised behavior from implementation inspection and outstanding release checks. Nothing was published externally.

## Automated checks

The final application source passed:

| Check | Actual result |
| --- | --- |
| `npm run lint` | Pass, no ESLint findings. |
| `npm run typecheck` | Pass, no TypeScript errors. |
| `npm test` | 11 tests passed, 0 failed. |
| `npm run build` | Successful optimized Next.js production build. |

The enquiry tests cover required-field validation, unconfigured behavior, origin enforcement, upload restrictions, real temporary private persistence, mocked webhook acceptance/failure, and rate limiting. A mocked receiver does not verify an owner-operated destination. The build produces a static landing page and a dynamic Node.js enquiry route. A final production server was started on loopback port 3000 for review.

## Browser and server evidence

| Area | Observed result |
| --- | --- |
| Responsive composition | Inspected rendered screenshots at widths 360, 390, 768, 1024, 1440 and 1920. DOM width checks found no horizontal page overflow. Reviewed typography, fan scale, crops, header contrast, static story, enhanced story, gallery and form. |
| Mobile menu | Opened the menu, closed it with Escape and observed focus return to the menu button. |
| Gallery dialog | Opened the botanical concept, changed to its available original-art view, checked its image description, closed with Escape and observed focus return to the opening gallery control. |
| Contextual enquiry | A “Discuss a similar idea” link selected Home / Feature wall and opened the optional project-context disclosure. |
| Form validation | Empty submission with an available local adapter focused the required name field. |
| Unconfigured handler | Production `GET /api/enquiry` returned 200 with `available: false` and `Cache-Control: no-store`; a valid same-origin POST returned 503 with explicit not-sent wording and no reference. The UI displayed unavailable status and disabled submission. |
| Origin enforcement | Actual production POST requests with a different origin or no Origin header returned 403. |
| Successful browser submission | A separate local production instance used a private workspace test directory. A synthetic enquiry submitted through the browser displayed a confirmed reference. The corresponding JSON record was verified on disk. This was actual private persistence, not a browser response override. |
| Actual delivery failure | Another local production instance pointed its storage directory at an existing regular file. Browser submission displayed “We could not confirm receipt. Your information is still here; please try again later.” Entered fields remained and submission was re-enabled. No success reference was presented. |
| Four-beat WebGL story | Observed one canvas and all four HTML captions during forward scrolling. The same botanical art appeared on a thin neutral tile and as one continuous 3 × 3 mural, then transitioned to the matching room. Reverse scrolling returned from the room to the tile sequence. |
| Navigation during story | Used the visible gallery shortcut during the sticky section; it navigated to the gallery. Enquiry navigation remains available beside it. |
| Static story | Under 1024px, no canvas mounted and all four story cards remained in normal document flow. The manual “View without motion” control on desktop removed the canvas and sticky sequence, displayed all four cards, and could restore the enhanced story. |
| Server-rendered content | Actual HTTP HTML included meaningful page copy, all four story headings, navigation targets and 11 named form fields before client execution. This verifies server output; a fully JavaScript-disabled interactive browser session was not available. |

Synthetic enquiry fixtures and temporary test servers are outside the source deliverable. The final preview has no delivery adapter configured. It does not send enquiries to a real business recipient.

## Refinements made after inspection

- Reduced and repositioned the wide-desktop sample fan to keep its adjacent caption clear; removed an overlapping decorative orbit.
- Increased main paragraph sizes and used 16px mobile form controls.
- Darkened muted text to `#57534d`; computed contrast is 4.53:1 on stone and 6.04:1 on paper.
- Corrected a Canvas fallback effect that incorrectly marked a supported renderer as failed; the actual WebGL path was then exercised.
- Kept a stable scene stage and poster before the first frame, and protected late context-loss fallback from collapsing the story track.
- Added a visible manual motion control and keyboard-accessible shortcuts through the long story.
- Set a metadata base and corrected the local serif font alias.

## Asset and code budget

Final build file inventory:

| Files | Bytes |
| --- | ---: |
| Nine production JavaScript files, uncompressed | 1,651,618 |
| Same JavaScript files, individually gzip-compressed | 477,390 |
| Three source WebP images combined | 679,608 |
| Eleven emitted font/media files combined | 185,554 |
| Compressed JavaScript + all source images + all emitted media | **1,342,552** |

This inventory includes the entire application JavaScript and all three images, not just the deferred scene. It is below the brief's initial approximately 3 MB scene budget. It does not measure browser transfer, caching, HTML/CSS overhead, image-optimizer variants, GPU cost or user timing. The source texture is 1254 × 1254, not 8K. The scene is dynamically imported, uses demand rendering and a capped 1–1.5 pixel ratio, and disposes its resources when unmounted.

**LCP ≤2.5s, CLS ≤0.1 and approximately 200ms interactions have not been measured.** No Lighthouse score or device benchmark is claimed. Measure the production host with an agreed desktop/mobile and network profile before launch.

## Limits and release checks

The following were not fully exercised and remain explicit release checks:

- OS-level `prefers-reduced-motion` emulation. The media-query branch was inspected and the same normal-flow static experience was exercised through the manual control, but these are not a substitute for testing the OS preference itself.
- A browser session with JavaScript disabled, forced WebGL unsupported mode, failed textures and an actual forced WebGL context-loss event. Their fallback code was reviewed; server-rendered HTML and manual static rendering were verified separately.
- Physical phone/tablet orientation changes, touch-device performance, Safari and Firefox.
- Slow-network throttling and interrupted image/scene downloads.
- True 200% browser zoom. Attempted keyboard zoom did not expose a verifiable changed layout through the available browser surface, so it is not recorded as a pass.
- A complete screen-reader audit and end-to-end Tab-order audit of every control. Focus restoration, Escape behavior, labels and selected keyboard flows were exercised, but this is not a full accessibility certification.
- An enquiry reaching an owner-operated receiver, upload malware handling, retention/access policy and staff notification/review arrangements.

The final production hero loaded with no captured console warnings or errors. The installed R3F / Three combination emitted a `THREE.Clock` deprecation warning when the renderer ran; no application code creates that deprecated clock. It did not prevent rendering. Re-check dependency compatibility during future upgrades. Browser console inspection is not a substitute for the unperformed device/performance checks above.

The owner confirmations in [the source audit](source-audit.md) and [README](../README.md) remain the release gate: manufacturing terminology, verified relief, approved applications, geography, imagery, fonts, contacts and actual enquiry delivery. The project intentionally remains `noindex, nofollow` until approved.

## Technical specifications update 27 September 2026

This update was implemented and checked in `D:/Agency/vivatiles`, with the local production review server on `http://127.0.0.1:3005`. It adds the Technical Specifications section between Process and FAQ, matching technical FAQs, navigation anchors, a source DOCX download and an internal manufacturer clarification document. No dependencies were added or upgraded. No external deployment or manufacturer email was sent.

### Changed files

- `src/lib/technical-specifications.ts` — typed public groups, attributed source values, qualifications, download metadata and shared technical FAQs.
- `src/lib/content.ts` — includes the seven technical FAQ entries and removes the two generic entries they replace.
- `src/components/TechnicalSpecifications.tsx` — server-rendered semantic description lists, visible pool restriction and real download/enquiry links.
- `src/components/TechnicalSpecifications.module.css` — responsive styling using the existing typefaces, colors and spacing.
- `src/app/page.tsx` — integrates the new section before FAQ.
- `src/components/SiteHeader.tsx` and `src/components/SiteFooter.tsx` — add Specifications anchors using existing navigation patterns.
- `src/components/FAQ.tsx` and `src/components/ProjectEnquiry.tsx` — advance the section numbering to 06 and 07.
- `public/downloads/technical-datasheet.docx` — genuine, unchanged source-file copy.
- `docs/technical-clarifications.md` — internal source review, discrepancies, publication policy, 12 manufacturer question groups, evidence requests and unsent email draft.
- `README.md` and this verification record — setup/source/download and validation handoff updates.

### Actual checks

| Check | Result |
| --- | --- |
| Actual DOCX content | Read complete XML body and package inventory: 44 paragraphs; no tables, notes, comments or embedded reports. Differences from the checklist, including ambiguous minimum joint spacing and extra unsupported claims, are recorded internally. |
| Original preservation | Original SHA-256 remained `BBDDCF13F8118CB1132D66BF9285D10450754800C162048E1F873FAA44022847`. |
| Source content comparison | Independent second content review found the seven metric sizes, thickness, body-specific absorption, Mohs label, application restrictions and recommendations consistent with the source and publication policy. |
| Lint | `npm run lint` passed. |
| Types | `npm run typecheck` passed. |
| Existing tests | `npm test`: 11 passed, 0 failed. |
| Production build | `npm run build` passed; page remains statically rendered. |
| Download over HTTP | `/downloads/technical-datasheet.docx` returned 200 with the DOCX MIME type, 16,705 bytes and the same SHA-256 as the original. |
| Actual browser download | Clicked the labelled download link; browser saved `technical-datasheet.docx`. Its hash matched the original. |
| Internal document isolation | Requests to `/docs/technical-clarifications.md` and `/technical-clarifications.md` returned 404. The internal document is outside `public/` and is not imported by application components. |
| Server-rendered content | Production HTML contains all seven sizes, 8–9 mm, separate absorption values, Mohs 5–6, C2TE and the exact active-pool-tank restriction without needing client rendering. |
| Public wording | Reviewed public source and rendered HTML for unsupported absolute resistance/compliance claims, local filesystem paths and internal notes; none were introduced. The unchanged source download deliberately retains its original claims, with a visible qualification beside its link. No FAQ structured data exists to update. |
| Responsive browser inspection | Inspected the new section/actions at 360, 390, 1024 and 1440 CSS-pixel widths in the in-app Chromium browser. No horizontal page overflow; mobile rows stack and all seven formats remain readable. Desktop and mobile screenshots reviewed. |
| Navigation and enquiry | Header Specifications link reached the new section. Mobile menu Specifications link reached it and closed the menu. Request Project-Specific Specifications reached the existing enquiry section. The unconfigured form correctly reports unavailable status. |
| Keyboard interaction | Navigated between download/enquiry controls using keyboard input and opened the pool-use FAQ with Enter; the expanded answer includes the exact pool-tank restriction. Existing visible focus styles are inherited. |
| Console | No captured JavaScript errors. The existing `THREE.Clock` dependency deprecation warning appeared when scrolling past the optional story; it is unrelated to the new server-rendered specifications. |
| Diff hygiene | `git diff --check` passed. |

### Remaining limits

No faithful PDF conversion was completed: the bundled renderer could not find LibreOffice (`soffice.exe`). The genuine DOCX is supplied, with no PDF label or fabricated conversion. The content comparison does not claim a visual audit of the original DOCX's pagination.

Manufacturer evidence remains outstanding for the withheld claims and qualified scopes. No technical certification is independently verified. The enquiry destination still needs owner configuration before live submissions can be received. Physical-device/browser coverage, performance targets and accessibility checks not exercised in the earlier record remain unclaimed; this targeted update did not repeat the entire site's previous interaction suite.

## Dropdown theme update 27 September 2026

The two enquiry selects now use the existing paper, stone and forest palette, thin borders, matching chevrons and distinct selected/focused options. The optional-fields disclosure, FAQ disclosures and mobile navigation share the same interaction colors and circular expand controls. Only styles were changed; native select semantics, controlled values, form submission and dynamic project context remain intact.

- `npm run build`, `npm run lint` and `npm run typecheck` passed.
- Inspected both open select menus in Chromium at 1440px and 390px, and a long project-context value at 360px. Long selections wrap with the chevron visible, menu rows remain readable and the page has no horizontal overflow.
- Checked arrow-key selection, typeahead selection, Enter, Escape and returned focus. The existing project-context link still fills Home / Feature wall and opens the optional fields.
- Checked FAQ opening with Enter, mobile navigation keyboard focus and Escape focus restoration.
- The enhanced native option menu is feature-gated with `@supports (appearance: base-select)`. Unsupported browsers retain native menus with themed closed controls; Safari, Firefox and physical devices were not exercised. The date control keeps its native calendar.

Implementation follows the progressive enhancement described in [MDN's customizable select documentation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select).

## Searchable project country update 27 September 2026

Project location is now an optional country combobox, with 249 locally bundled ISO countries and territories. Search covers English names, alpha-2/alpha-3 codes, common aliases and accent-insensitive text. Source references are recorded in `src/lib/countries.ts`. No dependency or runtime country service was added.

The paper/forest menu supports arrow keys, Enter selection, Escape, an explicit clear button, result counts and an empty-result message. It restores the committed choice when an unfinished search is dismissed. The selected country name uses the existing `location` submission field; only one named field is rendered. Server-error focus targets the visible combobox, and starting another enquiry clears the controlled country state.

- Production build, lint and type checks passed. All 21 tests passed, including 10 country-inventory/search tests.
- Chromium browser checks covered the full list, name/code filtering, pointer and keyboard selection, keyboard clearing, empty results, Escape, outside blur and selected-option scrolling.
- Inspected desktop and 390px / 360px mobile widths. At 360 × 640 the open menu remained within the viewport and the page had no horizontal overflow. Both control buttons have 44px minimum width.
- Reviewed native FormData wiring and reset integration in code. No live enquiry was submitted. Physical mobile keyboard and screen-reader combinations, Safari and Firefox remain untested.

The combobox uses the keyboard and focus conventions from the [WAI-ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
