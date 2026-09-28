# Logo asset

`public/images/logo-transparent.png` is a lossless, 891 × 1015 RGBA PNG prepared from `data/logo.png`. The source file was not modified.

- Keeps the original emblem, VAVI lettering, and complete TILE STUDIO line.
- Removes the wall background, external cast shadows, and both lines below TILE STUDIO.
- Preserves source RGB pixels without redrawing, recoloring, stretching, or rearranging the artwork. The mask follows edges and retains the pale tile faces and internal illustration rather than deleting every background-colored pixel.
- Adds a 14-pixel transparent margin and a subpixel alpha transition along the edges.
- Source SHA-256: `ae3646256c462ef6df2fddd43bf7ed68348e62a8849a1a60e6bfbd73dde40a4b`.

`src/lib/brand.ts` centralizes the path, intrinsic dimensions, and accessible name. `BrandLogo` supplies it to `SiteHeader`, `SiteFooter`, and `Process` (Section 04). Favicon metadata and the Open Graph preview also use the processed asset. The header logo remains present above the mobile menu.

## Verification

- All 319,634 visible pixels retain their original source RGB values; 584,731 pixels are fully transparent and 25,193 have partial alpha. The entire 14-pixel margin is transparent.
- Inspected full-resolution composites on the actual paper, stone, and forest backgrounds. The original dark green and bronze colors remain naturally subdued on the forest footer; no recoloring filters or background boxes were added.
- Inspected desktop and mobile header, open mobile menu, Section 04, and footer in the local browser. Checked 1440, 1040, 390, and 320 CSS-pixel widths, natural aspect ratios, complete lettering, image loading, home/section links, and absence of horizontal overflow.
- Confirmed all three page-logo images and favicon reference the shared PNG; inspected the generated social preview. No old logo remains in these placements.
- `npm run lint`, `npm run typecheck`, and `npm run build` passed. No browser console errors appeared during the final checks.
- Browser verification used the local Chromium preview; physical devices and other browser engines were not tested.

Preparation intermediates, pixel verification, and screenshots are saved under `work/logo/`.

## Website depth treatment

The requested 3D presentation uses two alpha-aware `drop-shadow` layers on the shared `.brand-logo` class in `src/app/globals.css`: a close relief edge and a softer shadow cast down and right, matching the source's upper-left lighting. The shadows follow the emblem, lettering, and individual tiles rather than the rectangular image bounds. Depth scales for header, Section 04, footer, and mobile sizes; the underlying artwork, image proportions, links, and layout dimensions remain unchanged. No tilt, motion, recoloring, or additional background was introduced.

This treatment applies to the three website placements. The transparent PNG itself, favicon, and generated social preview retain their original baked-in material details. Depth-treatment browser screenshots are under `work/logo-depth/`.

Verified the depth treatment at desktop (1040px) and mobile (390px) widths, including the light Section 04, dark footer, and small mobile header lettering. All three logos load with their original dimensions and `object-fit: contain`; no horizontal overflow or browser console errors were observed. The production build and TypeScript compilation passed.
