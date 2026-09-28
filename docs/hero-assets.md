# Hero concept assets

Updated 27 September 2026. The user requested original hero tile designs, equal tile dimensions, and smoother transitions. This revision replaces the hero's six supplied sample faces with six original AI-generated ceramic concepts. The existing gallery assets and source imagery in `data/` remain unchanged.

The typed manifest is [`src/lib/hero-samples.ts`](../src/lib/hero-samples.ts). Its order runs from supporting Ivory tides to the foreground Forest magnolia concept. Labels describe the artwork; they are not verified product, collection or finish names. Alt text identifies each image as an original tile concept. The images do not establish product availability, physical dimensions, or actual manufactured relief.

## Provenance and delivered dimensions

All six images were created individually with the built-in `image_gen.imagegen` tool. Each requested square art-tile face is full bleed and front-on, using matte ceramic texture, restrained shallow relief, and soft upper-left studio illumination. Native generator outputs are **1254 × 1254 PNG** despite the prompts requesting 1024 × 1024. Workspace originals are retained in [`public/images/hero/originals/`](../public/images/hero/originals/).

Sharp resized each original to **768 × 768** and encoded **WebP at quality 88**. No pixel retouching or recolouring was applied. Every manifest asset uses the same square intrinsic dimensions, so image aspect ratios no longer differ between hero tiles.

| Descriptive label | Public URL | Output px | WebP bytes | Workspace original | Native px | PNG bytes |
| --- | --- | --- | ---: | --- | --- | ---: |
| Ivory tides | `/images/hero/ivory-tides.webp` | 768 × 768 | 65,586 | `originals/ivory-tides.png` | 1254 × 1254 | 2,205,703 |
| Sage ginkgo | `/images/hero/sage-ginkgo.webp` | 768 × 768 | 143,904 | `originals/sage-ginkgo.png` | 1254 × 1254 | 2,918,494 |
| Mineral strata | `/images/hero/mineral-strata.webp` | 768 × 768 | 209,864 | `originals/mineral-strata.png` | 1254 × 1254 | 3,478,564 |
| Terracotta orbit | `/images/hero/terracotta-orbit.webp` | 768 × 768 | 120,804 | `originals/terracotta-orbit.png` | 1254 × 1254 | 2,777,524 |
| Celadon fan | `/images/hero/celadon-fan.webp` | 768 × 768 | 98,990 | `originals/celadon-fan.png` | 1254 × 1254 | 2,437,014 |
| Forest magnolia | `/images/hero/forest-magnolia.webp` | 768 × 768 | 98,564 | `originals/forest-magnolia.png` | 1254 × 1254 | 2,488,969 |

Combined compressed source payload: **737,712 bytes (approximately 720 KiB)**. This is the sum of the six delivered WebP assets, not a measurement of full-page transfer or Next.js image variants. The hero references only the WebP assets; provenance PNGs and JSON files are not part of its image payload.

## Exact generation prompts

The following records preserve the complete prompts and per-image file references:

- [Ivory tides and Sage ginkgo prompts](../public/images/hero/originals/ivory-sage-prompts.json)
- [Terracotta orbit and Mineral strata prompts](../public/images/hero/originals/terracotta-mineral-prompts.json)
- [Celadon fan and Forest magnolia prompts](../public/images/hero/originals/botanical-prompts.json)

These are original visual concepts generated for the revised hero. No supplied product image served as an edit target or image reference. The earlier supplied sample inventory remains documented in [`docs/gallery-assets.md`](gallery-assets.md).

## Asset verification

Verified each manifest public path against its workspace file and checked all delivered images with Sharp: six WebP assets exist, all are 768 × 768, and each corresponding original PNG is 1254 × 1254. Byte sizes above were read directly from filesystem metadata. Exact prompts remain unchanged in their original records.
