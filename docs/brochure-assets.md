# Brochure asset provenance

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
