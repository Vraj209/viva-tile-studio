# Section 03: scroll-driven gallery

Follow-up to `gallery-verification.md`, implemented 27 September 2026. This update changes control of the existing gallery; it does not replace the gallery or its animation.

## Implementation

- The original GSAP `paint()` transforms are unchanged: tile positions, depth, rotations, scale, opacity and layering use the same fractional sample position. The existing neighboring-selection settle, distant-selection fade, caption transition and hover shadows are retained.
- GSAP ScrollTrigger reads normal document scroll progress and retargets that position with a 0.22-second settle. There is no autoplay, integer snapping, wheel interception or programmatic page scrolling. Returning to the same scroll position returns to the same pose.
- A native sticky panel starts 24 px below the viewport top, after the heading and tile stage are in view. Its height reserves real layout space within `#work`, and it releases into Process at the end. Nominal desktop travel is 2,640 px; mobile travel is 1,320 px. Resizing mid-sequence preserves enough remaining travel for the remaining samples. The original composition dimensions, typography, imagery and other section styles are unchanged.
- Pinning requires the heading and stage to fit. Very short viewports retain normal document flow and a shorter three-transition preview; all twelve samples remain available through the original manual controls. On screens where the sample index extends below the viewport, it becomes fully visible as the panel releases.
- Arrows, numbered choices, neighboring tile selection and horizontal dragging retain control. A manual choice becomes the current point in the sequence; subsequent scrolling continues from that point toward the endpoints, without scrolling the page automatically. GSAP receives the actual painted value on takeover to avoid a stale tween start.
- Inspection suspends scroll updates and holds a snapshot of the selected sample. Existing dialog focus, Escape, photograph switching and scroll locking remain intact.
- Reduced motion starts with a flat, stable manual gallery and no added runway. Switching off motion partway through keeps only already-travelled space, so the panel can release immediately without collapsing underneath the visitor. Resize and font measurements also account for the existing story's changing height above the gallery.
- All twelve small browse faces now remain mounted. An observer warms them before arrival to avoid empty intermediate faces during fast scrubbing. Full inspection photographs are still mounted only when opened. No image assets or dependencies were added or changed.

## Verification

The existing local development server at `http://127.0.0.1:3000` was verified with bundled Playwright and headless Chrome. The agent-browser CLI was unavailable, so the bundled browser automation runtime was used.

Passed checks:

- Slow wheel scrolling produces continuous fractional movement; stopping settles the pose and does not advance it further.
- Fast forward and reverse wheel scrolling, natural release, and viewport re-entry at the same scroll position.
- Visible tile images load; no horizontal page overflow or browser console errors in the tested gallery scenarios.
- Manual arrows, numbered choice, horizontal drag, immediate scroll takeover, keyboard selection, inspection during settling, Escape, focus restoration and dialog scroll locking.
- Native touch pan via Chrome's touch input emulation; page scrolling is not trapped by dragging.
- Desktop 1440 × 960 and 1440 × 800; mobile 390 × 844; short mobile 320 × 568 and landscape 844 × 390.
- Reduced motion at initial load and while the gallery is pinned; stable manual selection remains available.
- Portrait-to-landscape and back, desktop height/width changes, and the manual motion toggle retain the current pose and release without unnecessary future runway. Hover changes only the existing face shadow, not tile transforms.
- Reload initializes the gallery to the browser's actual restored scroll position; revisiting the earlier document position produces the same earlier pose. The existing page's upstream hydration can adjust native document scroll restoration, which this gallery does not override.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `npm test` (33 tests).

Browser regression code and visual evidence are saved under `work/gallery-scroll/`: `verify.cjs`, JSON reports and viewport screenshots. Final reports are in `verification-final-desktop`, `verification-final-mobile`, `verification-final-responsive`, and `verification-handoffs-final`. The browser checks use actual wheel/touch inputs and rendered geometry; they are not a physical iOS/Safari or Android-device audit.

## Scope

Source changes are limited to `src/lib/use-gallery-motion.ts`, `src/components/ProjectGallery.tsx`, and `src/components/ProjectGallery.module.css`. Existing workspace changes, hero, footer and all other sections were preserved.
