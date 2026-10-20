# Brochure product provenance

## Current identity and publication mapping

The product index retains **49 distinct designs** across Surface Studies, Artful Surfaces and New Poster Collection. Surface Studies is the original VAVI Tile Studio publication replacing the first brochure. Its product identity, current page numbers and hotspots come from `public/brochures/surface-studies/publication.json`; the website imports those records directly.

| Publication | Distinct designs | Identity |
| --- | ---: | --- |
| Surface Studies | 24 | Existing reference codes 10465–10488, displayed as “Design 10465” etc. |
| Artful Surfaces | 15 | Descriptive artwork labels; no manufacturer product codes are printed |
| New Poster Collection | 10 | Descriptive artwork labels; no manufacturer product codes are printed |

Surface Studies gives every design its own page. The supplied interior also maps to Design 10465. Chapter titles are editorial headings, not new manufacturer product names:

| Chapter | Design references, in order |
| --- | --- |
| Botanical studies | 10465, 10469, 10471, 10474, 10475, 10478, 10485, 10488 |
| Rhythm & geometry | 10467, 10472, 10479, 10481, 10482, 10483, 10484, 10486 |
| Ornament & contrast | 10466, 10468, 10470, 10473, 10476, 10477, 10480, 10487 |

Do not use old PDF page numbers for current navigation. `pageNumbers` is the one-based set of pages in the new publication; the reader passes a zero-based index. `getBrochureProduct` resolves this mapping. `getBrochureProductHotspot` uses `publication.hotspots[product.id][String(pageIndex + 1)]` when present, otherwise the product's standard hotspot. This lets the supplied interior and individual design page identify the same product at different visual positions.

The enquiry helper continues carrying the selected product ID, environment and “Feature wall” application. The page-turning engine is independent of the publication layout.

### Confirmed identity versus pending specifications

References 10465–10488 identify the exact artworks already indexed on the website. They are not evidence that source-manufacturer specifications apply to a VAVI product. The original first brochure is restricted to imagery: its former collection name, dimensions, fabrication claims and promotional text must not be reused.

All current Surface Studies product `format` values are `null`. Dimensions, finish, thickness and availability are pending confirmation, as stated in the brochure's selection notes. The other two image-only catalogues also establish no physical product dimensions. Their PDF canvas sizes and the poster filename are not tile specifications.

The separate technical datasheet lacks SKU scope. Product-specific performance, suitability, thickness, finish, manufacturing process and availability cannot be inferred from a depicted room or generic datasheet statements. See `docs/technical-clarifications.md` for the private evidence review.

### Exact artwork and image quality

- The 24 first-brochure panel streams are 400 × 785 pixels. The verified crop `(left=9, top=10, right=392, bottom=776)` removes only the grey matte and offset shadow, preserving the full design and border. Each 383 × 766 image is stored losslessly, without recolouring, sharpening, warping or image generation.
- The matching supplied Design 10465 interior is an unchanged 794 × 1123 JPEG. Its printed reference was separate PDF text, absent from the extracted image. It shows an entrance door and ivory console table, and is not claimed as a completed VAVI installation.
- The original introductory ravine scene matches Design 10475 but is not an interior. The new publication does not reproduce that designed page.
- Artful Surfaces and New Poster contain one complete JPEG artwork per page. Their 25 native image streams remain byte-for-byte copies at 1770/1771 × 3542 dimensions.

Native pixel dimensions limit enlarged detail. High-resolution page rendering does not increase source photographic detail; a high-resolution print edition needs larger originals. Generated gallery and room backgrounds are not source photographs for this brochure. Existing room visualizations remain labelled, with the exact selected artwork rendered separately at its correct aspect ratio.

### Build ownership and public provenance

`scripts/build-vavi-brochure.cjs` owns the first publication's images, products, page mappings and hotspots. Run it before either Python generator. `prepare-brochure-products.py` extracts only the two image-only catalogues, importing the first publication's products and hotspots into generated TypeScript. `prepare-brochure-assets.py` applies the same rule to the brochure array. Both fail if the VAVI publication is missing and reject prior branding in public metadata.

Public manifests use neutral source labels, current asset locations and hashes. Private source filenames and historical mappings remain outside `public/`. Contact sheets under `tmp/pdfs/brochure-products/` are local QA artifacts. Verify complete design coverage, hotspot alignment, native pixel equality, clean PDF metadata and product enquiry identity before publishing.

## Historical extraction record — superseded

**The remainder is private provenance for the previous first-brochure extraction. Its old IDs, page mappings, branding, source specification wording and extraction workflow are superseded by Surface Studies above. They must not be reintroduced into public assets or runtime code.**

Prepared 12 October 2026. The product index maps **49 distinct designs to 51 of the 52 supplied brochure pages**. Only the Evoke cover has no selectable product. The brochure page images, original ordering and downloadable PDFs are unchanged.

## Coverage and identity

| Brochure | Distinct designs | Selectable pages | Product identity |
| --- | ---: | --- | --- |
| Evoke Collection | 24 | 2-27 | Printed codes 10465-10488. Page 3 and room page 4 both show 10465; introduction page 2 and sample page 14 both show 10475. |
| Artful Surfaces | 15 | 1-15 | One complete artwork per page. Names are descriptive labels; no manufacturer product codes are printed. |
| New Poster Collection | 10 | 1-10 | One complete artwork per page. Names are descriptive labels; no manufacturer product codes are printed. |

The stable IDs are `evoke-10465` through `evoke-10488`, `artful-surfaces-01` through `artful-surfaces-15`, and `new-poster-01` through `new-poster-10`. `Artful Surfaces` is the site's editorial document label. `New Poster Collection` follows the supplied filename. Neither is evidence of an official manufacturer collection name.

Evoke prints **1200 x 2400 mm** with its coded panels. The two uncoded brochures do not establish physical product dimensions: their records use `format: null`. Their PDF canvas size and the `2X4` filename are not treated as product specifications. A depicted room cannot establish product availability, thickness, finish, physical relief, installation suitability or tested performance.

## Exact artwork preparation

Run `python scripts/prepare-brochure-products.py` with Pillow and pypdf. The script imports the existing brochure metadata and descriptions, reads each original embedded image and writes `src/lib/brochure-products.ts`. The asset-level manifest at `public/brochures/products/manifest.json` records source PDF SHA-256, page, embedded-image name, native dimensions, crop bounds, output hash and bytes for every product.

- The 24 native Evoke panel streams are 400 x 785 pixels. The same visually verified crop `(left=9, top=10, right=392, bottom=776)` removes only the grey brochure matte and offset shadow. Each resulting **383 x 766** image includes the complete panel and its design border, is saved as lossless WebP, and is verified pixel-for-pixel against that exact source crop after reopening. No recolouring, sharpening, upscaling, warping or image generation is applied. Their source resolution limits the amount of detail visible when enlarged.
- Artful Surfaces and New Poster each contain one complete JPEG artwork per page. All **25 original JPEG streams are copied byte-for-byte**, preserving their 1770/1771 x 3542 native dimensions and complete compositions. The source filenames and page numbers, rather than approximate visual similarity to other gallery assets, establish each mapping.
- The existing gallery room library is excluded from this mapping: its scenes were generated from different tile references and would not depict the exact selected brochure designs.

The index contains source-native artwork, so full-size JPEGs may be several megabytes each. Load only the selected product and use responsive image delivery where appropriate. The complete collection is not a preload list.

## Supplied interior priority

Evoke page 4 is a matching interior for **10465**. Its native **794 x 1123 JPEG** is copied unchanged to `evoke-10465-original-interior.jpg`; the printed product code is separate PDF text and therefore is not burned into this extracted room image. This is a supplied catalogue interior, not independently verified photography of a completed VAVI installation. It shows an entrance door and console table; the old bathroom/washbasin description has been corrected in the brochure metadata and generator.

The introduction on Evoke page 2 visually matches **10475**: the cream curling branches, blue leaf tips, blue-and-cream flowers and complete motif positions correspond to page 14. Its staging is an outdoor ravine, not a room, so it is mapped as a clickable product region but is not registered as an interior scene. No other matching original interior is present in these brochures.

## Hotspots and enquiry identity

The normal Evoke hotspot is calculated from the PDF image transformation matrix and the exact pixel crop. It covers only the panel, excluding the printed product code, collection heading and size. All uncoded artwork pages are full-bleed product images, so their hotspot spans the page. Introduction page 2 and interior page 4 have separate visually measured regions returned by `getBrochureProductHotspot`.

`getBrochureProduct(brochureId, pageIndex)` takes the reader's zero-based index and resolves the record whose one-based `pageNumbers` includes it. The enquiry helper carries the stable product ID as `product`, the selected environment as Residential/Hospitality/Commercial, and `application=Feature wall`. Product identification therefore survives navigation without inferring a name from visible text.

All 49 prepared textures were visually checked together in the generated contact sheet. Evoke 10465, 10475, 10467 and 10488, the supplied 10465 room, and representative full-page artwork were also inspected at larger size. The generator validates source image counts, printed Evoke codes, expected native Evoke dimensions and lossless output pixel equality. Original product artwork and generated room imagery remain separately identifiable in the implementation.
