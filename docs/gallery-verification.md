# Section 03: inspiration gallery refinement

This records the original gallery refinement. The subsequent scroll-control update and current verification results are documented in [gallery-scroll-verification.md](gallery-scroll-verification.md).

Implemented and checked 27 September 2026. Only the existing `ProjectGallery` section is replaced. Existing typography, palette, spacing tokens, heading and `#work` anchor are retained; surrounding sections and existing unrelated workspace changes are preserved.

## Reference observation and adaptations

The live [A24 gallery](https://a24.raviklaassens.com/) was inspected interactively in Chrome at desktop (1440 × 960) and mobile (390 × 844) viewport sizes before implementation.

Observed: one large, tilted front disc; the previous disc low/left and the next high/right on desktop; shallow overlap and objects moving together into a settled position. Active title/metadata changes with the object. ArrowRight and wheel input both advanced the selection. Hover produced a drawn outline around the front disc. Enter opened the selected film's separate detail page. At the narrow viewport, metadata became horizontal rows at the top, the active object stayed central, and only a small adjacent preview remained visible; navigation moved to the bottom. A tested mouse drag did not change the selected film, so no claim is made that the reference uses drag for browsing. The page documents Space to flip, but tile backs are not supplied here.

The implementation adapts that diagonal object rail and changing metadata to rectangular sample proportions using existing GSAP and CSS transforms. It deliberately has:

- Shallower object rotations and modest edge shadows, with no disc mask, hole, invented thickness, reflections or generated surfaces.
- Visible previous/next controls, numbered sample choices, arrow/Home/End keyboard navigation and horizontal pointer dragging as additional discoverable ways to browse.
- Normal vertical page scrolling rather than the reference's wheel-controlled full-screen gallery.
- A native inspection dialog rather than a separate detail page, with uncropped images, available source/detail photographs, Escape and focus restoration.
- No reverse-side flip, film content, autoplay or new WebGL renderer. Distant index choices briefly fade at their destination so intermediate unloaded images never appear as blank faces.

This is a DOM/GSAP adaptation of the observed interaction, not a pixel-identical or numerically timed reconstruction of its WebGL animation.

## Assets and loading

Twelve distinct faces from eleven supplied JPEGs replace the former three-card, two-concept gallery. See [gallery-assets.md](gallery-assets.md) for source classification, crop coordinates, sizes and descriptive labels. Selected imagery spans angular/curved patterns, elephant linework and silhouettes, tree/animal scenes and photographed relief panels. Rooms, the exact duplicate and weaker framed imagery were excluded. No matching installed views were found, so unrelated rooms are not associated with samples.

Originals remain untouched. Prepared browse WebPs are at most 640 px; inspection copies are at most 1600 px without enlargement. Prepared assets are served directly through `next/image` with `unoptimized` to avoid a second lossy conversion of already prepared WebPs. Browse dimensions reserve the actual photographed ratio. Only the selected sample and up to two neighbors on either side mount previews; the initial selection mounts three. Only the current inspection/source/detail image mounts while the dialog is open.

## Checks performed

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed after final component changes.
- Asset preparation validation: twelve unique IDs; all 31 manifest references resolve to 30 WebPs with matching intrinsic dimensions; source hashes unchanged.
- Interactive browser layout checks at 1440, 820, 390 and 320 px widths: no document horizontal overflow and active samples fully visible. Tablet secondary copy was removed from the stage to avoid an overlap with the previous sample.
- All twelve inspection images loaded successfully. Source-view switching was checked on Angular lines; portrait/framed inspection checked on Spotted cat & acacia. Inspection uses `object-fit: contain`.
- Previous/next, direct index selection, horizontal pointer drag at mobile width, ArrowLeft/ArrowRight, Home/End and Enter tested. Keyboard focus follows the selected sample, including distant jumps.
- Native modal Tab/Shift+Tab stayed within the dialog; Escape closed it and restored focus to the same selected sample. Scroll styles are restored on close.
- Scrolling over the stage changed page scroll position without changing the active sample.
- The manual **View without motion** path displayed exactly one flat sample and retained working arrow/End keyboard focus. OS `prefers-reduced-motion` uses this same synchronous motion branch plus CSS overrides; live OS preference switching was reviewed in code, not emulated by the available browser API.
- Fresh page load confirmed three loaded browse images and no mounted dialog/inspection image.
- Clean in-app browser: no console errors throughout gallery testing. The existing story outside this section logs a `THREE.Clock` deprecation warning. The user's Chrome extensions injected body attributes and caused a hydration warning there; it did not reproduce in the clean browser.

Viewport and pointer testing does not replace a physical iOS/Android touch-device or screen-reader audit.

## Changed files

- `src/components/ProjectGallery.tsx` and new `ProjectGallery.module.css`: section UI, controls and responsive styling.
- `src/lib/use-gallery-motion.ts`: scoped motion, pointer gestures, responsive positioning and cleanup.
- `src/components/GalleryInspection.tsx` and `GalleryInspection.module.css`: accessible lazy-mounted inspection.
- `src/lib/gallery-assets.ts`: structured sample manifest.
- `scripts/prepare-gallery-assets.mjs` and `public/images/gallery/`: reproducible presentation copies.
- `docs/gallery-assets.md` and this verification record.

Local visual evidence is saved under `work/gallery/`: source/prepared contact sheets, `gallery-desktop.png`, `gallery-inspection.png` and `gallery-mobile.png`. No dependencies were added.
