# Brochure experience verification

Verified locally on 12 October 2026 at `/brochures`.

## Implemented experience

- Server-rendered route with dedicated metadata and desktop, mobile and footer navigation.
- Original covers as CSS 3D objects with board thickness, spine, page edges, lighting and a restrained hover lift.
- The selected cover travels from its gallery position into a fullscreen native dialog. It opens around the spine into the first spread. The flight takes 580 ms and the hardcover turn 820 ms.
- Internal sheets use 14 connected strips, front/back textures, spine-anchored curvature and changing light and shadow. Geometry updates DOM transforms outside React's render cycle; there is no continuous idle animation.
- Scroll gestures, arrow/PageUp/PageDown keys, previous/next buttons, dragging and touch swipes navigate. Trackpad momentum is limited to one turn per gesture. Home/End and the page selector allow direct jumps.
- Desktop shows original pages in spreads. Widths at or below 700 px show one original page at a time. Resizing during an animation settles to the intended destination.
- Page overview with thumbnails, enlarged inspection and original PDF downloads. Page dimensions and all source artwork remain uncropped.
- Native modal focus isolation, Escape handling, focus restoration and the shared token-based Lenis scroll lock. Zoom receives keyboard focus and returns it when closed.
- Reduced-motion preferences remove the travel/curl animation. Image decoding is awaited for the opening spread with a bounded five-second fallback, per-page loading/error states and direct original-PDF access.

## Checks

- `npm run build`: passed; `/brochures` is statically prerendered.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: 40 passed, including 7 new geometry/sequence tests. The Windows sandbox initially rejected an existing enquiry test's temporary filesystem write; the suite passed outside the sandbox without modifying that test or implementation.
- In-app Chromium browser: 1440 × 1000 desktop, 1024 × 800 navigation breakpoint and 390 × 844 mobile layouts inspected.
- Opened Evoke Collection and Artful Surfaces; checked original images load, correct initial pages, forward/backward turns, wheel navigation, drag gesture, page overview, last-page bounds, direct selection, zoom focus, Escape, and restored gallery focus and document scrolling.
- Changed from desktop to mobile during an interior turn; the reader settled on the correct page with no leftover strips or disabled navigation.
- Verified interior-turn geometry in the live DOM: 14 strips with differing angles and continuous rising positions. Confirmed zero browser errors/warnings in the test session.
- Verified mobile Brochures navigation and the unavailable-source dialog.
- After source recovery, verified the third catalogue on desktop and mobile: real cover, first spread, page turning, ten thumbnails, final page 10 with Next disabled, and a completed browser download of the intact original. All three catalogues now have working previews and downloads. Kept the mobile download label on one line beside the longer third title.
- Physical iOS/Android devices, Safari and OS-level reduced-motion emulation have not been exercised; responsive browser inspection and implementation review are not hardware tests.

## Source recovery

The user supplied an intact original of the ten-page New Poster Collection through their shared Google Drive folder. The replacement is 20,064,834 bytes and has valid JPEG image streams on all ten pages. This resolves the binary corruption in the earlier local source. The three originals contain 52 pages in total: Evoke Collection (27), Artful Surfaces (15), and New Poster Collection (10).

See `brochure-assets.md` for provenance, reproduction and the automatic replacement workflow. No dependencies were added and no deployment was performed.
