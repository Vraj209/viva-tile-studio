# Section 02 verification

Verified locally on 29 September 2026 using the Codex browser against the existing development server. Only Section 02 application code was replaced; navigation, other sections, and the enquiry implementation were retained.

## Implemented

- Server-rendered heading and three asymmetric architectural openings; the central designer opening is larger.
- Four destinations: homeowners, designers/architects, hospitality, and workspaces. Each has three narrative scenes.
- A scoped GSAP controller expands the selected image frame from its measured portal rectangle, moves its foreground edge, and reveals the story. The already-loaded preview remains visible until the first scene image loads or reports an error.
- On desktop at least 1024px wide and 740px high, the selected story has a bounded sticky stage and approximately one viewport of scroll travel. Previous/next controls and keyboard arrows share scene selection with scroll progress. The visitor can leave via Escape, Explore Another Space, the gallery link, or ordinary page scrolling.
- Smaller/shorter viewports and reduced-motion preference use all three scenes in normal vertical flow. No additional WebGL renderer or invented photo depth is used.
- Concept rooms are explicitly captioned. Exact sample/detail views use supplied images; generated rooms are interpretations, not evidence of exact manufacturing detail or completed installations.

## Checks performed

| Check | Result |
| --- | --- |
| `npm run lint` | Passed after final implementation |
| `npm run build`, including TypeScript | Passed after final implementation |
| `git diff --check` | Passed |
| Desktop 1200 × 900 | All scene controls, keyboard arrow progression, and all four destinations checked |
| Initial desktop composition 1440 × 1000 | Checked; no document horizontal overflow |
| Mobile 390 × 844 | Three scenes visible in normal flow, room imagery, copy, return control and business destination choice checked |
| Narrow viewport 320 × 740 | No document horizontal overflow |
| Short desktop 1024 × 700 | All three scenes and their copy remain visible; restoring desktop leaves one active scene |
| Natural scroll | Workspace advances to 02, then 03, then releases to following page content |
| Keyboard entry/exit | Return control receives immediate focus; Escape during entry completes the return and restores the opening button |
| Home enquiry | Residential / Feature wall |
| Designer enquiry | Art & collaboration / Feature wall |
| Hospitality enquiry | Hospitality / Commercial space |
| Workspace enquiry | Commercial / Commercial space |

Enquiry validation inspected the actual form selections after activating each link. No enquiry was submitted and no messages were sent.

## Evidence and limits

- Screenshots: `work/made-around-you/desktop-overview.png`, `desktop-design-scene.png`, and `mobile-home-story.png`.
- The browser's full-section screenshot includes its capture-time rendering of the existing fixed skip link; the normal viewport screenshots are the cleaner visual evidence.
- The shared vertical fallback was exercised through responsive changes. OS reduced-motion preference switching was reviewed in code, not directly emulated by the available browser interface.
- The cached-poster loading gate and image-error fallback were reviewed; throttled networking and forced image failure were not simulated.
- No Lighthouse/Core Web Vitals score or physical-device/browser-matrix coverage is claimed.
- During development, hot reload briefly encountered incomplete files; final reloads and the production build passed. The pre-existing Three.Clock deprecation belongs to the surrounding Three.js experience.

Reference inspiration: https://realevate.agency/raregems was read and visually inspected. Its oversized composition, architectural framing and visual pace informed this section; no competitor asset or brand treatment was copied.
