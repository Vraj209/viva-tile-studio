# Inspiration gallery asset preparation

Prepared 27 September 2026 from owner-supplied imagery in `data/samples/`, `data/landscape/` and `data/potraite/`. The original twelve selected sample faces remain, followed by all six PNGs in `landscape/` and all fourteen PNGs in `potraite/`: **32 gallery images from 31 distinct source files**.

The earlier JPEG sources now live in `data/samples/`. The four-sample source still contributes two different faces, with its complete photograph available in inspection. The retained elephant file ending in `_1.jpeg` is byte-identical to the previously selected original and is used once. The twenty added images were visually reviewed, have no byte-identical duplicates, and are included in full. Folder names do not determine display orientation: each image uses its actual dimensions.

Labels describe visible content, not verified product names, materials, collections, finishes or dimensions. Depicted depth, gold colouring, wood-like forms and stone-like backgrounds do not establish physical manufacture or measured relief. New images remain **Sample image**; the two existing framed-panel photographs remain **Sample photograph**. No matching installed view is fabricated or associated merely by theme.

## Preparation

Run `node scripts/prepare-gallery-assets.mjs` from the repository root. Existing Sharp prepares WebP copies, the typed `src/lib/gallery-assets.ts` manifest and this register. Original files remain unchanged; their SHA-256 hashes are checked before and after preparation.

- Browse images fit within 640 × 640 px at WebP quality 84.
- Inspection images fit within 1600 × 1600 px at quality 92. Smaller originals are never enlarged.
- Original aspect ratios are retained, including mixed orientations within the supplied folders. No new PNG is cropped.
- Earlier extracted square faces preserve their photographed proportions. No perspective warping is applied.
- Existing framed-panel crops retain their photographic presentation, with the complete original photograph available in the expanded view.
- No colour, exposure, white-balance or sharpening correction is applied. No generated detail, inferred relief, transparency isolation or surface retouching is used.
- Supporting details are labelled crops of supplied images, not additional products or microscopic material evidence.
- Full inspection, source and detail assets load only when the inspection view is opened.

Total browse payload for all 32 images: **2,030,436 bytes**. All 70 prepared assets combined: **12,075,766 bytes**. Actual page transfer depends on lazy-loading and browser cache.

## Selected images

Crop coordinates are `left, top, width, height` in original source pixels. Browse and inspection dimensions are real output metadata; no dimensions express product size. URLs use `/images/gallery/<id>-browse.webp` and `<id>-inspect.webp`.

| Descriptive label | Source in data/ | Source px | Crop | Browse px / bytes | Inspection px / bytes |
| --- | --- | --- | --- | --- | --- |
| Warm curves | `samples/419539f5-80b8-416a-90b3-4680bd43843a.jpeg` | 682 × 683 | Full image | 639 × 640 / 92,088 | 682 × 683 / 138,878 |
| Angular lines | `samples/1c57ee0e-5f93-4d76-97a7-f61eda39e7a8.jpeg` | 1144 × 1161 | 0, 0, 560, 574 | 560 × 574 / 62,334 | 560 × 574 / 93,994 |
| Ochre geometry | `samples/5948f80d-9d17-4b54-a19b-2a9484011b90.jpeg` | 545 × 803 | Full image | 434 × 640 / 66,764 | 545 × 803 / 135,346 |
| Elephant outline | `samples/3f5c15d1-556e-41ea-b285-b62bffebab49.jpeg` | 604 × 848 | Full image | 456 × 640 / 19,934 | 604 × 848 / 48,630 |
| Graphic squares | `samples/02b074e8-c458-42a6-ac10-13c82ee85e27.jpeg` | 1179 × 1175 | Full image | 640 × 638 / 108,668 | 1179 × 1175 / 363,134 |
| Diamond lattice | `samples/1c57ee0e-5f93-4d76-97a7-f61eda39e7a8.jpeg` | 1144 × 1161 | 588, 603, 556, 558 | 556 × 558 / 61,592 | 556 × 558 / 92,848 |
| Ivory silhouettes | `samples/abedabf6-02fd-45c1-89a0-4faf352626f8_1.jpeg` | 551 × 765 | Full image | 461 × 640 / 65,670 | 551 × 765 / 130,300 |
| Acacia silhouettes | `samples/926cfa82-fb29-4558-bf30-6b8e24302dab.jpeg` | 421 × 531 | Full image | 421 × 531 / 36,246 | 421 × 531 / 54,180 |
| Ochre savannah | `samples/dbed1847-8dbb-43c7-88a5-c46af035129f.jpeg` | 546 × 300 | Full image | 546 × 300 / 36,448 | 546 × 300 / 52,314 |
| Zebra pair | `samples/ea875b0e-d3bc-4339-8fdb-f2893ea9c6c9.jpeg` | 761 × 442 | Full image | 640 × 372 / 27,464 | 761 × 442 / 55,352 |
| Running horses | `samples/56afcdae-6c3e-4c1f-9dcc-1ab988ebbb76.jpeg` | 1599 × 899 | 119, 0, 1459, 899 | 640 × 394 / 33,348 | 1459 × 899 / 171,376 |
| Spotted cat & acacia | `samples/308a53ee-b45f-4b7d-9ffe-11154282bc82.jpeg` | 900 × 1600 | 26, 66, 814, 1479 | 352 × 640 / 67,904 | 814 × 1479 / 411,340 |
| Amber butterfly | `landscape/L_1.png` | 1122 × 1402 | Full image | 512 × 640 / 64,822 | 1122 × 1402 / 393,144 |
| Ivory geometry | `landscape/L_2.png` | 1254 × 1254 | Full image | 640 × 640 / 92,832 | 1254 × 1254 / 352,980 |
| Courtyard fountain | `landscape/L_3.png` | 1122 × 1402 | Full image | 512 × 640 / 88,622 | 1122 × 1402 / 442,362 |
| Coastal window | `landscape/L_4.png` | 1448 × 1086 | Full image | 640 × 480 / 75,376 | 1448 × 1086 / 372,190 |
| White tiger | `landscape/L_5.png` | 1448 × 1086 | Full image | 640 × 480 / 62,780 | 1448 × 1086 / 347,028 |
| Floral elephant | `landscape/L_6.png` | 1448 × 1086 | Full image | 640 × 480 / 61,312 | 1448 × 1086 / 378,038 |
| Liquid gold | `potraite/P_1.png` | 1122 × 1402 | Full image | 512 × 640 / 31,082 | 1122 × 1402 / 154,568 |
| Sunshine owl | `potraite/P_2.png` | 1122 × 1402 | Full image | 512 × 640 / 75,602 | 1122 × 1402 / 452,826 |
| Woodland muse | `potraite/P_3.png` | 1122 × 1402 | Full image | 512 × 640 / 88,344 | 1122 × 1402 / 469,206 |
| Island footprint | `potraite/P_4.png` | 1122 × 1402 | Full image | 512 × 640 / 56,752 | 1122 × 1402 / 381,882 |
| Savannah elephant | `potraite/P_5.png` | 1122 × 1402 | Full image | 512 × 640 / 73,970 | 1122 × 1402 / 417,304 |
| Opal lotus | `potraite/P_6.png` | 1122 × 1402 | Full image | 512 × 640 / 62,594 | 1122 × 1402 / 342,364 |
| Golden Krishna | `potraite/P_7.png` | 1122 × 1402 | Full image | 512 × 640 / 69,210 | 1122 × 1402 / 338,790 |
| Ocean dolphins | `potraite/P_8.png` | 1122 × 1402 | Full image | 512 × 640 / 58,360 | 1122 × 1402 / 345,690 |
| Sunset retreat | `potraite/P_9.png` | 1122 × 1402 | Full image | 512 × 640 / 73,380 | 1122 × 1402 / 420,304 |
| Coconut hideaway | `potraite/P_10.png` | 1122 × 1402 | Full image | 512 × 640 / 71,706 | 1122 × 1402 / 426,994 |
| Peacock scrolls | `potraite/P_11.png` | 565 × 941 | Full image | 384 × 640 / 54,476 | 565 × 941 / 152,148 |
| Shoreline sunset | `potraite/P_12.png` | 532 × 941 | Full image | 362 × 640 / 83,442 | 532 × 941 / 215,318 |
| Luminous lotus | `potraite/p_13.png` | 565 × 941 | Full image | 384 × 640 / 45,794 | 565 × 941 / 120,220 |
| Acacia watch | `potraite/P_14.png` | 1024 × 1536 | Full image | 427 × 640 / 61,520 | 1024 × 1536 / 477,156 |

## Source inventory

The first fifteen entries refer to JPEG filenames in `data/samples/`; the remaining twenty entries list their full path relative to `data/`.

| Source | Classification | Selection |
| --- | --- | --- |
| 02b074e8 | Full-face geometric sample image | Selected |
| 1c57ee0e | Photograph of four separate square samples | Two visually distinct faces selected; original grouping available in inspection |
| 308a53ee | Photograph of a framed tall sample/panel | Selected with photographic perspective retained |
| 3ec421bb | Three framed landscape images | Excluded: triptych framing and weaker image resolution |
| 3f5c15d1 | Full-face portrait sample image | Selected; source detail available |
| 419539f5 | Full-face square sample image | Selected |
| 56afcdae | Photograph of a framed wide sample/panel | Selected; source photo and detail available |
| 5948f80d | Full-face portrait sample image | Selected |
| 5efec184 | Framed landscape image with large mount | Excluded: large mount and weaker sample-face relevance |
| 5f370bac | Interior scene with blue elephant wall artwork | Excluded from sample faces; no matching selected sample |
| 926cfa82 | Full-face portrait sample image | Selected |
| abedabf6…_1 | Full-face portrait sample image | Selected once; retained file is identical to the previously selected original |
| dbed1847 | Wide landscape sample image | Selected |
| ea875b0e | Wide figurative sample image | Selected |
| fff21619 | Interior scene with spotted-cat wall artwork | Excluded from sample faces; no matching selected sample |
| landscape/L_1.png | Supplied sample image | Selected in full, without cropping |
| landscape/L_2.png | Supplied sample image | Selected in full, without cropping |
| landscape/L_3.png | Supplied sample image | Selected in full, without cropping |
| landscape/L_4.png | Supplied sample image | Selected in full, without cropping |
| landscape/L_5.png | Supplied sample image | Selected in full, without cropping |
| landscape/L_6.png | Supplied sample image | Selected in full, without cropping |
| potraite/P_1.png | Supplied sample image | Selected in full, without cropping |
| potraite/P_2.png | Supplied sample image | Selected in full, without cropping |
| potraite/P_3.png | Supplied sample image | Selected in full, without cropping |
| potraite/P_4.png | Supplied sample image | Selected in full, without cropping |
| potraite/P_5.png | Supplied sample image | Selected in full, without cropping |
| potraite/P_6.png | Supplied sample image | Selected in full, without cropping |
| potraite/P_7.png | Supplied sample image | Selected in full, without cropping |
| potraite/P_8.png | Supplied sample image | Selected in full, without cropping |
| potraite/P_9.png | Supplied sample image | Selected in full, without cropping |
| potraite/P_10.png | Supplied sample image | Selected in full, without cropping |
| potraite/P_11.png | Supplied sample image | Selected in full, without cropping |
| potraite/P_12.png | Supplied sample image | Selected in full, without cropping |
| potraite/p_13.png | Supplied sample image | Selected in full, without cropping |
| potraite/P_14.png | Supplied sample image | Selected in full, without cropping |

The previous `docs/assets.md` register describes older generated assets elsewhere on the page. Those remain separate; this register records the provenance of Section 03.
