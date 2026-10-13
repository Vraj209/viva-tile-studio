# Brochure page-turn continuity

Refined locally on 13 October 2026. The brochure artwork, viewer layout, product hotspots, PDF download, overview, zoom, keyboard controls, and scroll controls are retained.

## Rendering fixes

The previous reader began turns before destination images had decoded, replaced keyed page elements at the start and end of each turn, and used an empty back face on mobile. Its opening timeout could also expose unreadied pages after five seconds. In reduced-motion mode, the site's global `transition-duration: .01ms` rule introduced additional hidden frames when visibility changed through nested elements.

- `BrochurePageCache` holds decoded image objects with a ten-entry soft limit, pins the active working set, deduplicates requests, and retries failures. Only nearby pages are prefetched.
- Current and destination pages remain mounted under stable page keys. The reader awaits both cached image decoding and the actual resident DOM images before turning or jumping. Destination elements survive the landing.
- Slow or failed requests leave the current artwork visible. Readiness has no timeout that exposes an empty page. Errors offer retry through the existing navigation and access to the original PDF.
- Resizing from a single page to a spread prepares the facing page before committing the new layout. Opening cover travel retargets when the viewport changes.
- Reduced motion commits decoded pages atomically and explicitly disables visibility transitions in the page subtree.

## Motion and input

Desktop retains the existing curved, segmented sheet and its real front/back artwork. Paper turns take 500 ms and cover turns 560 ms, with restrained lighting and corrected back-face overlap cropping. Compact mode moves the complete outgoing artwork across the single-page viewport with a small tilt, revealing the prepared destination without an empty reverse face.

Pointer movement drives progress directly, including gestures that begin on product hotspots. Releasing commits or cancels using distance and recent velocity; settling takes 180–520 ms according to remaining distance. The browser's implicit touch capture transfers from the image to the arena without falsely canceling the gesture. Actual arena capture loss, pointer cancellation, blur, and tab hiding cancel an unfinished drag. Product clicks remain available after a turn settles. One pending navigation intent is retained during rapid input, preventing overlapping leaves or a long animation backlog.

## Verification

- All 54 unit tests pass, including nine cache tests for delayed decoding, deduplication, failures/retry, bounded retention, pinned pages, disposal, and invalid indices.
- TypeScript, ESLint, and the optimized Next.js build pass.
- Browser regression harness: `work/brochure-turns/verify.cjs`. Results and screenshots are written beside it. It uses local headless Edge via the bundled Playwright runtime.
- All nine browser scenarios pass. Checks cover desktop 1440×1000, mobile 390×844 with actual browser touch dispatch, repeated forward/back navigation, rapid clicks, drag progress and cancellation, product hotspots, zoom, overview selection, delayed loads beyond five seconds, failed-image retry, reduced motion, live preference changes, and interrupted responsive layout changes. A seven-second first-spread delay retains the decoded cover. All three brochures are exercised, including final-page bounds and endpaper.
- The frame monitor checks for missing/unready visible page images, uncovered reader surfaces, and overlapping turning layers. It also verifies that current image nodes survive delayed navigation.

Physical iOS/Android devices and Safari are not covered by the local Chromium checks. Source artwork and intentional white brochure backgrounds are unchanged.
