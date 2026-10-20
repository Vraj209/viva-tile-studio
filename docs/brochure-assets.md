# Brochure asset provenance

## Current publication: Surface Studies

**Surface Studies — VAVI Tile Studio** replaces the first supplied brochure with an original 32-page publication. Its cover, typography, layouts, chapter sequence and concise supporting copy are new. Only the original tile artwork and one clean supplied interior are reused. The website cover, page viewer, thumbnails, download and product metadata share `public/brochures/surface-studies/publication.json`.

The visual system follows the website: paper `#eae4da`, stone `#d0c6ba`, ink `#1c1a1a`, forest `#303c32`, bronze `#92785e`; Cormorant Garamond and Manrope; and `public/images/logo-transparent.png`. Complete tile proportions, colours and design borders are preserved. The supplied Design 10465 interior is catalogue imagery, not independently verified photography of a completed VAVI installation.

| Current publication | Pages | Treatment |
| --- | ---: | --- |
| Surface Studies | 32 | Original VAVI publication; only source imagery is reused |
| Artful Surfaces | 15 | Supplied image-only pages, original order and complete artwork |
| New Poster Collection | 10 | Supplied image-only pages, original order and complete artwork |

Surface Studies includes an original cover, short introduction, supplied interior, three chapter openers, 24 individual design pages, selection notes and back cover. Its editorial chapters are **Botanical studies**, **Rhythm & geometry**, and **Ornament & contrast**. These headings describe the visible artwork and are not asserted manufacturer collection names. Every design remains individually selectable in the reader.

### Product facts and image limits

References 10465–10488 retain the existing website identification of the 24 distinct artworks. The old catalogue is an imagery source only. Its dimensions, fabrication copy, branding, logos and promotional language are not reused as VAVI claims. Current product records use `format: null`. Dimensions, finish, thickness and availability require confirmation for the selected VAVI product; the brochure flags that missing information.

The separate supplied technical datasheet has no confirmed SKU mapping. It does not establish that its generic specifications apply to these designs. See the private review in `docs/technical-clarifications.md` before adding technical claims.

The 24 panel images are 383 × 766 pixels, cropped losslessly from 400 × 785 embedded streams. Only the old grey matte and offset shadow are removed; the complete panel and design border remain. The supplied interior is an untouched 794 × 1123 JPEG. These are the highest-resolution sources available in the first PDF. Rendering larger pages improves new typography and layout but cannot add photographic detail. A high-resolution print edition needs better source photographs.

Generated website room backgrounds are not brochure source photography. They remain separately labelled visualizations in the existing product interaction.

### Current reproduction and regression safeguards

Build the first publication with `node scripts/build-vavi-brochure.cjs`. The builder owns `public/brochures/surface-studies/`, including the PDF, page images, thumbnails and `publication.json`. The JSON contains its brochure record, products and page-specific hotspots. Runtime TypeScript imports it directly, keeping images and clickable product regions aligned after a rebuild.

For the other two brochures, run `python scripts/prepare-brochure-assets.py` and `python scripts/prepare-brochure-products.py`. Both generators require a valid Surface Studies publication before writing outputs. They may process only Artful Surfaces and New Poster Collection. They import the VAVI publication into generated TypeScript and cannot render, copy or republish the replaced first brochure. They reject previous brand names in generated public metadata.

Public provenance uses neutral source labels and content hashes. Original source filenames and locations stay in private project records. The original public first PDF and its branded page renders are retired; do not copy them back into `public/`.

Before publishing, inspect every new page, compare reused image pixels against their sources, scan rendered pages and extracted PDF text for prior branding, verify the download, and exercise product selection, page turns and enquiries. Public files, JSON, alternative text and routes must not expose the retired source brand.

## Historical source record — superseded

**The remainder records the earlier 52-page reproduction for internal provenance only. Its first-brochure title, original page layout, product specification wording and generation instructions are superseded by Surface Studies above. Do not publish these source filenames or follow the old first-brochure reproduction workflow.**

The brochure reader uses the owner-supplied PDFs in `data/brouchers`. Each readable source page is rendered in its original order, at its original aspect ratio, without cropping, retouching, recolouring, or changing its printed content. The first actual page supplies each cover. The downloadable PDF is a byte-for-byte copy of the source.

| Site label | Original file | Pages | Source page size | State |
| --- | --- | ---: | --- | --- |
| Evoke Collection | `Eton__1200x2400mm_Evoke_Collection.pdf` | 27 | 595 × 842 pt | All pages available |
| Artful Surfaces | `f304a1b2-c8b1-48aa-b347-d8a0e969b56f.pdf` | 15 | 850 × 1701 pt | All pages available |
| New Poster Collection | `Eton_NEW-POSTER-2X4.pdf` | 10 | 850 × 1701 pt | All pages available; intact source restored |

“Evoke Collection” and its 1200 × 2400 mm product format are printed in the source. “Artful Surfaces” is an editorial label describing an untitled, image-only document, not an asserted manufacturer collection name. “New Poster Collection” is derived from its supplied filename; its ten image-only pages have no printed title or specifications. The poster's filename suggests a 2 × 4 format, but no physical product dimensions are asserted without printed source evidence. Page dimensions above describe the PDF canvas, not tile dimensions. All three source documents are portrait; no landscape spread has been split or discarded.

## Restored poster source

The initially supplied local poster PDF was corrupted: 8,120,291 occurrences of the UTF-8 replacement-character sequence `EF BF BD`, invalid cross-reference offsets, and destroyed JPEG signatures on all ten pages. Its sole Git revision (`b5ef122`) contained the same damaged bytes. It could not be rendered faithfully.

The owner then supplied [the original Google Drive folder](https://drive.google.com/drive/folders/11akQJlixE9y0OP5a66-0CaoXyzyRRsrX?usp=sharing). Its intact [Eton_NEW-POSTER-2X4.pdf](https://drive.google.com/file/d/1_mAIgNT1YPAefgNc3TBGtkFJZmmC6xPf/view?usp=drivesdk) was downloaded as binary PDF data and replaced the corrupted repository copy. The restored source is **20,064,834 bytes**, SHA-256 `f3ac6521b48b50f45a5a9dd6b84a2fa1b9e96c8495253fb1680859b9d66617f3`. All ten image streams now begin with valid JPEG signatures and all ten pages render correctly.

All three catalogue records are now `status: "ready"`, with real first-page cover artwork, complete page arrays and original downloadable PDFs. No substitute artwork has been used. The metadata contract retains the unavailable state for future invalid sources; the preparation script detects damaged JPEG markers and refuses blank renders.

## Reproduction

Run `python scripts/prepare-brochure-assets.py`. Required dependencies are Python, Pillow, pypdf and Poppler's `pdftoppm`; these are available in the Codex bundled runtime. The script searches `PATH` first and then the standard bundled Poppler location. Optional flags: `--long-edge 1800 --quality 88`.

The generator produces:

- `public/brochures/<id>/page-001.webp` etc.: all actual pages, 1800 px on the long edge, WebP quality 88.
- `public/brochures/<id>/thumb-001.webp` etc.: 360 px thumbnails for a page index.
- `public/brochures/<id>/catalogue.pdf`: original intact PDF for download.
- `public/brochures/manifest.json`: SHA-256 provenance, source sizes, all page dimensions and corruption evidence.
- `src/lib/brochures.ts`: typed metadata and meaningful descriptions of each page's visible content; Evoke product codes are transcribed from the PDF text layer.
- `tmp/pdfs/<id>/contact-sheet.jpg`: local visual QA sheets, excluded from the public output.

The script rejects blank rendered pages and detects the damaged JPEG marker before rendering. Rendering uses Poppler, preserving the original PDF layout and colour conversion. Intermediate PNGs are created in a temporary subdirectory of `tmp/pdfs` and removed after successful rendering when Windows file locks permit cleanup.

## Verification

All 52 pages were rendered and visually inspected in contact sheets. The three actual covers and representative detail pages were also checked at full size. Output pages retain the complete printed artwork, borders, titles and product identifiers. Evoke produces 1272 × 1800 px pages; Artful Surfaces and New Poster produce 900 × 1800 px pages. There are 52 full-size WebP pages, 52 thumbnails and three original PDFs. The reader should load pages as needed; original PDFs are served only when explicitly requested.
