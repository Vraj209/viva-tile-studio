# Made Around You: immersive journey

Implemented and checked locally on 29 September 2026. This replaces the bounded three-scene exploration documented in `made-around-you-verification.md`.

## Scope and design

Section 02 keeps its heading, brand typography, three asymmetric category previews, four audiences, anchor and enquiry integration. Surrounding sections, routes, navigation, forms and metadata were not redesigned. Existing unrelated workspace edits were retained.

Taste design read: a focused preservation redesign for homeowners and design professionals, using architectural editorial photography. DESIGN_VARIANCE 7, MOTION_INTENSITY 6, VISUAL_DENSITY 2. Existing Manrope, Cormorant Garamond and brand tokens remain the foundation. The requested full-viewport photography and discreet overlaid navigation take precedence over generic card or theme prescriptions.

## Behavior

- The clicked preview expands through a measured image-cover transform and viewport mask. The source photograph never stretches in one axis. Its already-loaded image remains painted until the first full scene is available.
- The exploration is rendered at body level. The overview is preserved behind the entry, then temporarily removed from layout and made inert. The document remains the only scroll container.
- All four categories contain four distinct rooms. The selected category starts a single rotated sequence containing every category exactly once. Each new category begins with a brief editorial introduction on its first full-screen interior.
- A full-viewport sticky stage follows ordinary document scrolling. Most of each scene's scroll distance holds one clear image; the final quarter introduces the next image. Desktop movement stays below one percent of image height, with a 2.5 percent cover allowance. Mobile omits parallax. There are no wheel/touch interception handlers or scroll snapping.
- Images mount near the current scene and remain cached for reverse navigation. Category navigation preloads its destination and makes a short fade, rather than rapidly scrolling through intermediate rooms. Individual images have loading and retry states.
- Mobile art direction uses inspected off-center crops that retain furniture and room depth. The first designer room has a separately generated portrait alternative depicting the same space. It is not counted as another scene.
- Back, Escape and browser Back return to the preserved overview scroll position and opener focus. Entry focus is on the visible Back control; hidden scenes and background siblings are inert. Tab wraps within the active journey, and focus leaves an outgoing scene before it becomes inert. Repeated close requests are guarded.
- Resizing preserves the logical position in the scene sequence. Reduced motion removes the expansion, parallax, image dissolve and category fade.
- Category-ending enquiry actions restore the site, populate its existing project/application fields and focus the name field. No enquiry is submitted automatically.

## Verification

| Check | Result |
| --- | --- |
| Production build, including TypeScript | Passed |
| ESLint | Passed |
| Existing tests | 33 passed |
| `git diff --check` | Passed |
| Asset manifest | 16 unique room images; all files exist; source and generation records linked |
| Desktop 1280 × 720 | Full-viewport composition, continuous home-to-workspace transition, category navigation and closing verified |
| Mobile 390 × 844 | Designer portrait source selected, natural progression and browser Back verified |
| Narrow mobile 320 × 740 | No horizontal overflow; category targets measured 53 × 48 pixels; office scenes and captions fit |
| Resize 320 × 740 to 1280 × 720 | Executive office remains the selected scene |
| Keyboard | Entry/settled Back focus, Escape and End-to-final-scene verified |
| Final enquiry | Hospitality / Commercial space correctly selected and name field focused; no submission |

Screenshots are in `work/made-around-you/fullscreen/`: `desktop-home.jpg`, `desktop-workspace.jpg`, `desktop-hospitality.jpg`, and `mobile-designer.jpg`.

Reduced-motion preference changes, slow/failed network conditions and a physical-device/browser matrix were reviewed in implementation but not emulated by the available UI test interface. Lighthouse was attempted against the production server, but its headless browser connection failed; no Lighthouse score or measured Core Web Vitals result is claimed. Browser inspection identified a Next Image parent-position warning after adding responsive picture sources; both picture wrappers now have explicit absolute positioning.

See [the full asset register](made-around-you-fullscreen-assets.md) for supplied product references, original outputs and complete built-in image-generation prompts. Generated rooms remain labeled as interior concepts; exact production surface details should be checked against the supplied samples.
