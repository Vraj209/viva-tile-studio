# Made Around You — full-screen scene register

Prepared 29 September 2026. This register covers the 16 separate interiors used by Section 02 in [the scene manifest](../src/lib/space-worlds.ts): four scenes per category, with no room reused as a second scene through cropping. The journey order is Homes → Workspaces → Hospitality → Designers, rotated to begin with the selected category. Thirteen scenes are new; the two existing workplace scenes and existing designer salon are retained.

All scenes are **Concept visualizations** generated with the built-in image_gen tool using the supplied tile images listed below. They depict fictional interiors, not completed installations or exact product photography. Generated fine linework, joins, apparent scale, lighting and relief can differ from the source; use the unchanged supplied samples for exact design inspection and project specification.

## Runtime inventory

Files live under `public/images/worlds/`; URLs below are the actual runtime paths. Pixel dimensions and byte counts were read from the final WebP files. Each of the 16 primary images below has a distinct SHA-256 hash and was visually reviewed as a different complete room.

| Category / scene | Runtime URL | Reference | Pixels | Bytes | Prompt record |
| --- | --- | --- | --- | ---: | --- |
| Homes / living room | `/images/worlds/home-living.webp` | DL | 1672 × 941 | 412,140 | [Living](../work/made-around-you/fullscreen/home/living-prompt.json) |
| Homes / bathroom | `/images/worlds/home-bathroom.webp` | IG | 1672 × 941 | 273,430 | [Home](../work/made-around-you/fullscreen/home/prompts.json) |
| Homes / dining room | `/images/worlds/home-dining.webp` | WC | 1672 × 941 | 329,068 | [Home](../work/made-around-you/fullscreen/home/prompts.json) |
| Homes / bedroom | `/images/worlds/home-bedroom.webp` | OG | 1672 × 941 | 286,616 | [Home](../work/made-around-you/fullscreen/home/prompts.json) |
| Workspaces / reception | `/images/worlds/workspace.webp` | AL | 1536 × 1024 | 354,876 | [Existing workplace](../work/made-around-you/workspace-originals/workspace-prompts.json) |
| Workspaces / meeting room | `/images/worlds/workspace-meeting.webp` | AL | 1536 × 1024 | 397,484 | [Existing workplace](../work/made-around-you/workspace-originals/workspace-prompts.json) |
| Workspaces / executive office | `/images/worlds/workspace-executive.webp` | AL | 1672 × 941 | 401,250 | [Business](../work/made-around-you/fullscreen/business/prompts.json) |
| Workspaces / lounge | `/images/worlds/workspace-lounge.webp` | AL | 1672 × 941 | 417,916 | [Business](../work/made-around-you/fullscreen/business/prompts.json) |
| Hospitality / hotel arrival | `/images/worlds/hospitality-arrival.webp` | WC | 1672 × 941 | 375,226 | [Arrival](../work/made-around-you/fullscreen/design/hospitality-arrival.prompt.txt) |
| Hospitality / restaurant | `/images/worlds/hospitality-restaurant.webp` | WC | 1672 × 941 | 359,012 | [Business, revised](../work/made-around-you/fullscreen/business/prompts.json) |
| Hospitality / private suite | `/images/worlds/hospitality-suite.webp` | IG | 1672 × 941 | 311,094 | [Business](../work/made-around-you/fullscreen/business/prompts.json) |
| Hospitality / spa | `/images/worlds/hospitality-spa.webp` | DL | 1672 × 941 | 357,148 | [Business](../work/made-around-you/fullscreen/business/prompts.json) |
| Designers / architectural salon | `/images/worlds/design-room.webp` | IG | 1536 × 1024 | 175,500 | [Existing salon](made-around-you-design-asset.md#final-prompt) |
| Designers / sculptural entrance | `/images/worlds/design-entrance.webp` | IG | 1672 × 941 | 237,436 | [Entrance](../work/made-around-you/fullscreen/design/design-entrance.prompt.txt) |
| Designers / private library | `/images/worlds/design-library.webp` | IG | 1672 × 941 | 370,170 | [Library](../work/made-around-you/fullscreen/design/design-library.prompt.txt) |
| Designers / design atelier | `/images/worlds/design-atelier.webp` | IG | 1672 × 941 | 264,672 | [Atelier](../work/made-around-you/fullscreen/design/design-atelier.prompt.txt) |

Combined primary WebP payload: **5,323,038 bytes**. Browser transfer depends on progressive loading, responsive Next.js image variants and cache. Scene crops are display-only `object-position` settings recorded in the manifest; they do not create additional scenes.

### Mobile art direction

The designer salon has a dedicated portrait alternative of the same room. It preserves the complete ivory panel pair, doorway sequence, bench and foreground depth in a tall viewport. This is a responsive derivative, not a seventeenth scene.

| Responsive alternative | Runtime URL | References | Pixels | Bytes | Records |
| --- | --- | --- | --- | ---: | --- |
| Designer salon / mobile | `/images/worlds/design-room-mobile.webp` | Existing `design-room.webp` as the room reference; IG as the product reference | 941 × 1672 | 144,922 | [Prompt](../work/made-around-you/fullscreen/design/design-room-mobile.prompt.txt), [metadata](../work/made-around-you/fullscreen/design/design-room-mobile.metadata.json) |

The 16 primary images plus this alternative occupy **5,467,960 bytes**. Its original PNG is `work/made-around-you/fullscreen/design/design-room-mobile.png`; the built-in image_gen tool recomposed the existing salon for portrait using the original `data/landscape/L_2.png` product reference.

Mobile `object-position` values in [the manifest](../src/lib/space-worlds.ts) were adjusted after actual **390 × 844** inspection. Many deliberately move off-center to retain furniture, doorways, windows or a staircase alongside the tile surface. These values supersede initial generation-metadata crop suggestions. See [mobile art-direction notes](../work/made-around-you/fullscreen/design/mobile-art-direction.md) for the designer and hotel-arrival rationale. Cropping reveals part of an existing installation without changing its source image or adding a scene.

## Supplied tile references

Names are descriptive gallery labels, not verified collection or material specifications. Original source files remain unchanged. The [gallery register](gallery-assets.md) documents preparation of the inspection images.

| Code / descriptive label | Inspected reference | Owner-supplied origin | Reference preparation |
| --- | --- | --- | --- |
| IG / Ivory geometry | [ivory-geometry-inspect.webp](../public/images/gallery/ivory-geometry-inspect.webp) | [data/landscape/L_2.png](../data/landscape/L_2.png) | Complete 1254 × 1254 image of the two tall panels; no crop. Original PNG was also supplied directly for the home bathroom and designer scenes. |
| WC / Warm curves | [warm-curves-inspect.webp](../public/images/gallery/warm-curves-inspect.webp) | [419539f5-80b8-416a-90b3-4680bd43843a.jpeg](../data/samples/419539f5-80b8-416a-90b3-4680bd43843a.jpeg) | Complete 682 × 683 image; no crop. |
| OG / Ochre geometry | [ochre-geometry-inspect.webp](../public/images/gallery/ochre-geometry-inspect.webp) | [5948f80d-9d17-4b54-a19b-2a9484011b90.jpeg](../data/samples/5948f80d-9d17-4b54-a19b-2a9484011b90.jpeg) | Complete 545 × 803 image; no crop. |
| AL / Angular lines | [angular-lines-inspect.webp](../public/images/gallery/angular-lines-inspect.webp) | [1c57ee0e-5f93-4d76-97a7-f61eda39e7a8.jpeg](../data/samples/1c57ee0e-5f93-4d76-97a7-f61eda39e7a8.jpeg) | Top-left face from the four-sample photograph, crop x=0, y=0, width=560, height=574; no perspective warping. |
| DL / Diamond lattice | [diamond-lattice-inspect.webp](../public/images/gallery/diamond-lattice-inspect.webp) | [1c57ee0e-5f93-4d76-97a7-f61eda39e7a8.jpeg](../data/samples/1c57ee0e-5f93-4d76-97a7-f61eda39e7a8.jpeg) | Bottom-right face from the same photograph, crop x=588, y=603, width=556, height=558; no perspective warping. |

The existing meeting-room generation additionally used the generated reception as an architectural continuity reference. Its tile reference remained AL.

## Originals, preparation and review

Complete prompts and generated-source locations are linked per scene above. Original PNGs are preserved beside the new prompt records in `work/made-around-you/fullscreen/home/`, `design/` and `business/`. Existing workplace PNGs remain in `work/made-around-you/workspace-originals/`; the existing salon original is `work/made-around-you/design-room.png`.

Post-generation preparation uses Sharp PNG-to-WebP conversion only, with no content edits, compositing, cropping, resizing, colour adjustment or sharpening. Quality is 86, effort 6, except the three new designer scenes, hotel arrival and portrait salon derivative, which use quality 87, effort 6. Additional preparation metadata: [Home](../work/made-around-you/fullscreen/home/metadata.json), [Living](../work/made-around-you/fullscreen/home/living-metadata.json), [Designers](../work/made-around-you/fullscreen/design/metadata.json), [Arrival](../work/made-around-you/fullscreen/design/hospitality-arrival.metadata.json), and [Business](../work/made-around-you/fullscreen/business/prompts.json).

Visual review found recognizable supplied colour palettes and principal motif arrangements throughout the set. Ivory scenes retain tall panel compositions; Ochre geometry retains its portrait bands and diamond; Angular lines and Diamond lattice retain their respective repeated linework. Fine motif details and generated relief are approximate, and repeated wall layouts do not establish real product sizes or installation specifications.

The first restaurant output spread Warm curves across a wider wall. It was regenerated to show two complete approximately square copies with the original principal motif arrangement. The accepted output uses the same runtime URL; its [revision record](../work/made-around-you/fullscreen/business/restaurant-revision.json), superseded prompt and original `hospitality-restaurant-v1.png` remain in the business archive.

`home-living.webp` replaces `garden-room.webp` in this journey, and `hospitality-arrival.webp` replaces `terra-room.webp`. The older generated rooms and flat sample/detail crops are not scenes in the final 16-image sequence. Their original files and any uses elsewhere on the website remain intact.
