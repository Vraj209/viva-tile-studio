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
