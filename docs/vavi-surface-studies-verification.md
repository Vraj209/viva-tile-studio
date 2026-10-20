# Surface Studies verification

Verified 19 October 2026. This records local publication and website checks for **Surface Studies — VAVI Tile Studio**. The changes have not been deployed.

## Publication and visual review

- Reviewed all 32 actual PDF page renders, using four contact sheets and full-size inspection of representative cover, interior, product, selection-note and back-cover pages.
- No clipped text, overlapping elements, distorted panel proportions, visible previous branding or unexpected blank pages were found.
- The cover, section sequence, page layouts and supporting copy form an original VAVI publication. The colours, Cormorant Garamond / Manrope typography and shared logo align with the website.
- Corrected the contents to the actual chapter opener pages: Botanical studies **04**, Rhythm & geometry **13**, Ornament & contrast **22**; selection notes remain **31**. Reviewed the regenerated page 2 at full size and refreshed its contact sheet.
- Checked the final regenerated PDF's extracted text and metadata for the retired source brand names; no matches were found. Its title metadata is `Surface Studies | VAVI Tile Studio`.
- No source-brochure `1200` / `2400` dimensions or `handmade` claims were found in the new PDF text. Selection notes explicitly flag dimensions, finish, thickness, availability and installation suitability for confirmation.

The reviewed PDF renders are retained as `public/brochures/surface-studies/page-001.webp` through `page-032.webp`. The visual review sheets are `work/vavi-brochure/qa-sheet-1.jpg` through `qa-sheet-4.jpg`; temporary PNG renders were removed after review. Final PDFs are `public/brochures/surface-studies/catalogue.pdf` and `output/pdf/vavi-surface-studies.pdf`.

## Image fidelity and limits

Independently compared all **24** published panel textures with their original embedded PDF images after the documented matte-only crop `(9, 10, 392, 776)`. Every decoded RGBA pixel matches. The complete design and border remain, with no recolouring, sharpening, warping or generated replacement details.

The supplied Design 10465 interior JPEG is **byte-for-byte identical** to its original embedded stream. The original reference text was separate PDF text and is absent from the extracted photograph. The publication labels this as supplied interior imagery for visual reference, rather than a verified completed VAVI installation.

The available panel images are **383 × 766 pixels**, extracted from 400 × 785 streams; the supplied interior is **794 × 1123 pixels**. These source dimensions limit enlarged detail. Larger rendered brochure pages preserve crisp new typography but cannot recover photographic detail. A high-resolution print edition requires better source photographs.

## Automated checks

The main local verification run passed:

- All **59 tests**, with the process temporary directory directed into the writable workspace.
- TypeScript type checking.
- ESLint.
- The production Next.js build.

Both legacy Python generators also passed syntax and static contract checks. Their source lists permit only the two remaining image-only catalogues; their generated TypeScript imports the new VAVI publication and its page-specific hotspots. They no longer process the replaced first brochure.

The regression checks cover publication identity and product mappings, pending dimensions, clean public names and metadata, preserved image hashes, and brochure reader behaviour. The final contents correction was checked directly in the regenerated PDF rather than triggering unnecessary broad retesting.

## Browser verification

The main local browser verification exercised:

- The desktop brochure spread and the compact single-page layout at **319 CSS pixels** wide.
- Next-page interaction, jumping to page **32**, and end-of-publication bounds.
- A product hotspot and the retained Home / Hotel product visualization interactions.
- Product details with pending specifications.
- New Surface Studies PDF destinations in the website.
- The actual **Download PDF** action, which obtained the new publication.

The browser download, website PDF and final deliverable share SHA-256 `9cbe71507e58c96204d0fb5ee333cb1c42917891fded0751c99a0b6445ba4a5f`.

This verifies the local browser experience. Physical iOS and Android devices were not tested, and no live deployment is claimed.

## Temporary test artifacts

The test-run cache created by workspace `TEMP` was identified from its source maps and removed after verification.
