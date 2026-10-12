# Brochure product provenance

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
