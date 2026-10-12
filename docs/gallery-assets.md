# Inspiration gallery asset preparation

Prepared exclusively from owner-supplied imagery in `data/landscape/` and `data/potraite/`: all six landscape-folder PNGs, followed by all fourteen portrait-folder PNGs, in numeric filename order. **20 gallery images from 20 distinct source files**. The gallery selection was updated at the owner's request on 12 October 2026. Images from `data/samples/` are excluded from the loop; their original and prepared files are retained.

The selected images were visually reviewed, have no byte-identical duplicates, and are included in full. Folder names do not determine display orientation: each image uses its actual dimensions.

Labels describe visible content, not verified product names, materials, collections, finishes or dimensions. Depicted depth, gold colouring, wood-like forms and stone-like backgrounds do not establish physical manufacture or measured relief. All selected images are labelled **Sample image**. No matching installed view is fabricated or associated merely by theme.

## Preparation

Run `node scripts/prepare-gallery-assets.mjs` from the repository root. Existing Sharp prepares WebP copies, the typed `src/lib/gallery-assets.ts` manifest and this register. Original files remain unchanged; their SHA-256 hashes are checked before and after preparation.

- Browse images fit within 640 × 640 px at WebP quality 84.
- Inspection images fit within 1600 × 1600 px at quality 92. Smaller originals are never enlarged.
- Original aspect ratios are retained, including mixed orientations within the supplied folders. No image is cropped or perspective-warped.
- No colour, exposure, white-balance or sharpening correction is applied. No generated detail, inferred relief, transparency isolation or surface retouching is used.
- Full inspection images load only when the inspection view is opened.

Total browse payload for all 20 images: **1,351,976 bytes**. All 70 prepared assets on disk, including retained assets excluded from the loop: **12,075,766 bytes**. Actual page transfer depends on lazy-loading and browser cache.

## Selected images

Crop coordinates are `left, top, width, height` in original source pixels. Browse and inspection dimensions are real output metadata; no dimensions express product size. URLs use `/images/gallery/<id>-browse.webp` and `<id>-inspect.webp`.

| Descriptive label | Source in data/ | Source px | Crop | Browse px / bytes | Inspection px / bytes |
| --- | --- | --- | --- | --- | --- |
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

Each entry lists its full path relative to `data/`. Every image currently in the two selected folders is included once.

| Source | Classification | Selection |
| --- | --- | --- |
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
