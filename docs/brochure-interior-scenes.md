# Brochure interior scene assets

Generated on 2026-10-12 with Codex's built-in `image_gen` tool using the imagegen skill. These are architectural visualisation backgrounds, not photographs of installed Viva products. The UI must display **Interior visualisation**. Original product imagery must be rendered separately into the defined surface. No tile pattern, colour, texture or relief was generated in these room backgrounds.

All final files are 1536 × 1024, sRGB WebP, quality 91. Sharp performed format conversion only; it did not alter content or composite the product. Final files were visually inspected after conversion. The local source outputs were retained under `C:/Users/Vraj Panchal/.codex/generated_images/01a13213-cb89-7822-87e3-3354d642683e/`.

## Surface placement

Rectangles below use image pixel coordinates, with a top-left origin. Each recommended insertion rectangle is exactly 1:2 width:height, suitable for a 1200 × 2400 mm single slab. They are inset by a few pixels from the generated reveal to preserve the product's proportions and retain a natural architectural border. There is no furniture occlusion. The camera is square to the feature wall, so no perspective transform is required.

The same image wrapper must position both the background and original product image. Preserve the source product image's aspect ratio; do not distort or recolour it. Do not use crop-based `object-fit: cover` on product artwork. A single slab avoids inventing pattern repetition or grout spacing. Use the original product image itself for the detail view.

| Scene | Image path | Size | Pixel rectangle x,y,w,h | Normalized rectangle x,y,w,h |
|---|---|---:|---|---|
| Home | `/images/brochure-interiors/home.webp` | 208.7 KiB | 603, 43, 351, 702 | 0.392578125, 0.041992188, 0.228515625, 0.685546875 |
| Hotel | `/images/brochure-interiors/hotel.webp` | 219.2 KiB | 588, 23, 350, 700 | 0.382812500, 0.022460938, 0.227864583, 0.683593750 |
| Office | `/images/brochure-interiors/office.webp` | 160.0 KiB | 604, 51, 327, 654 | 0.393229167, 0.049804688, 0.212890625, 0.638671875 |

## Exact generation prompts

### Home

Final built-in source: `exec-dd801d42-dd04-4c6e-9d7c-14caf3fa9a3c.png`.

```text
Use case: photorealistic-natural
Asset type: premium architectural editorial background for an interior tile visualisation viewer.
Create ONE landscape 3:2 architectural interior photograph (1536x1024 ideal), a sophisticated contemporary living room with warm limestone floor, natural linen sectional at the FAR LEFT edge, dark walnut side furniture, a sculptural low coffee table kept entirely left, soft side daylight. Quiet European architectural magazine styling, realistic tactile materials, no people.
CRITICAL GEOMETRY: camera faces the back wall square-on, corrected verticals and horizontal lines, no angled perspective for the central back wall. A completely unobstructed BLANK PORTRAIT RECTANGULAR feature-wall panel is the principal subject. It should occupy x=40% to 66.67% of the image width and y=8% to 88% of the image height: physical height twice its width, like a 1200mm wide by 2400mm high slab. Exact straight vertical edges, horizontal top and bottom, no perspective distortion. The slot's entire inside face is flat uniform light warm off-white plaster without patterns. A very thin shadow reveal around the rectangle makes its four corners easy to identify. Do NOT put any object, seating, plant, light fixture, baseboard, or shadow over the panel itself. Nothing overlaps the panel. At the right of this blank rectangle, a plain plaster wall returns, with restrained interior context at the far right. The panel starts high on the wall and ends at floor level, in full view. Image must show enough room floor and sides for architectural scale. No artwork, no words, no logos, no watermark. Do not add any tile texture, pattern or marble veining to the blank panel. This image is only a room background; exact tile artwork will be inserted into that empty panel later.
```

### Hotel

Final built-in source: `exec-f4bf9b83-69ff-45eb-b4fb-25653240b777.png`.

```text
Use case: photorealistic-natural
Asset type: premium architectural editorial room background for tile visualisation.
Create ONE 3:2 landscape photograph, ideally 1536x1024, of a refined boutique hotel lobby: warm travertine floor, rich bronze details, sculptural ivory lounge chair on the far LEFT, a low travertine table, a champagne bronze reception counter on the far RIGHT, gentle amber cove lighting with soft daylight. Calm, expensive, tactile materials; authentic architectural photography, carefully considered spacious arrangement.
CRITICAL: Back wall is square to the camera with corrected parallel verticals, not oblique. Center of the rear wall contains a very large single BLANK portrait plaster slab slot, full height from near ceiling to floor. The empty rectangle's physical aspect ratio is EXACTLY 1:2, twice as tall as wide, and is designed as a 1200x2400mm slab installation. In the landscape image roughly x=39% to 64%, y=5% to 80%. All four corners visible and no part behind furniture. Exact straight vertical edges and horizontal top/bottom. Completely plain light ivory panel inside, with a narrow bronze shadow reveal around the entire border. No wall lamp, object, table, sculpture, plant, deep shadow, or counter may overlap or stand in front of the blank panel. Keep reception desk entirely outside the panel area on the far right. Its entire blank face is usable later for inserting exact product photography. Hotel context only around the panel; floor in foreground, wide edges of architecture, warm alcoves at sides, no art, no pattern or marble texture within this blank rectangle. No people, logos, signage, watermark, or words. Natural perspective, restrained cinematic warm lighting, premium architectural magazine photograph.
```

Targeted built-in edit used to correct the panel's aspect ratio; the full room was preserved:

```text
Use case: precise-object-edit
Edit this hotel lobby image. Preserve the entire image, its composition, furniture, walls, travertine, bronze, lighting, camera and photographic realism. Change ONLY the width of the center blank ivory portrait wall panel and its narrow bronze frame. Current inner face is too narrow for a 1200mm x2400mm slab. WIDEN its face by about 13 percent, symmetrically. Keep exact same top edge at y19 and bottom edge at y729 in the 1536x1024 image. The corrected inner face must extend from x591 to x946, a width of 355pixels and height710pixels, exact physical aspect 1:2. Move the thin bronze vertical reveals accordingly into the neighbouring stone walls. It should remain one uniform ivory blank face with straight vertical/horizontal boundaries; no text, artwork, tile pattern or objects over it. Change nothing outside this small central panel-width adjustment.
```

### Office

Final built-in source: `exec-b494d32e-14d0-4023-aea9-3232b4a692b2.png`.

```text
Use case: photorealistic-natural
Asset type: premium architectural editorial room background for exact tile insertion.
Create ONE landscape 3:2 image, 1536x1024 ideally, of a sophisticated contemporary OFFICE RECEPTION. Natural pale oak architectural panelling, muted olive upholstered waiting bench at the far LEFT, large side windows, subtle matte black metal accents, a curving pale oak reception desk at the far RIGHT edge, a stone floor. Soft clean daylight, detailed natural materials, understated editorial architecture photography. Modern yet warm and lived in, with only a couple restrained accessories at far sides.
The back wall is perfectly square to the camera, no horizontal or vertical perspective tilt. In the center of back wall leave an oversized empty portrait panel with a thin dark shadow reveal. This panel must be EXACTLY TWICE AS TALL AS IT IS WIDE, representing a 1200mm x 2400mm tall tile slab, and at least 1/4 of image width. It should occupy about x=38% to 63%, y=5% to 80% of a 1536x1024 canvas. The four corners form an exact upright rectangle. The full face is plain flat uniform warm white plaster. No art, no texture, no tile pattern, no marble veining. Keep ALL furniture, objects, lamps, plants, shadows, baseboard details and the reception counter COMPLETELY outside this central blank face. Nothing in front of it, all four corners visible, floor level base. This empty panel will later receive the exact real product image as an untouched texture. Give us convincing architectural context around the blank panel: pale oak fluted or plain walls, daylight entrance, quiet office reception furniture at edges, generous foreground floor. No people, no text, no signage, no logos, no watermark. Capture like a premium architecture magazine with realistic scale and restrained decor.
```

Targeted built-in edit used to correct the panel's aspect ratio; the full room was preserved:

```text
Use case: precise-object-edit
Edit only the width of the central empty white wall panel in this office reception. Preserve the room, furniture, wood panelling, lighting, materials, proportions and camera. The blank portrait face needs to be EXACTLY 1:2 width-to-height to hold a 1200x2400mm product slab. Keep its top at y50 and bottom at y708. Increase its width slightly from about314 pixels to329 pixels by moving the left and right shadow reveals equally outward, to x603 and x932. Exact upright rectangle, all corners square. Plain warm white blank panel inside. No pattern, texture or art. Only this very small ~5% width adjustment; absolutely no other change to the image.
```

## Portrait mobile adaptations

Created with the built-in image_gen tool from each desktop room as a visual reference. These are separate 1024 × 1536 compositions so a narrow viewport retains the sofa/chair and reception desk/sideboard. WebP conversion uses quality 91 and all three final assets were visually inspected. The same **Interior visualisation** label and exact original product rendering requirements apply.

Mobile placement uses the unobstructed wall area rather than conforming to an arbitrary generated frame. This allows exact 1:2 tile proportions at large scale without stretching artwork. Home's wider tile entirely covers the narrow placeholder frame; Hotel's tile covers the plain central wall and a small portion of adjacent stone; Office uses the plain central plaster. A restrained CSS edge shadow can supply the slab reveal. All placements end at the wall/floor junction and avoid furniture. Keep backgrounds and product surfaces in the same coordinate wrapper. When fitting a phone viewport, keep the product plus surrounding furniture visible.

| Scene | Image path | Size | Pixel rectangle x,y,w,h | Normalized rectangle x,y,w,h |
|---|---|---:|---|---|
| Home | `/images/brochure-interiors/home-mobile.webp` | 179.6 KiB | 340, 140, 440, 880 | 0.332031250, 0.091145833, 0.429687500, 0.572916667 |
| Hotel | `/images/brochure-interiors/hotel-mobile.webp` | 217.8 KiB | 302, 110, 420, 840 | 0.294921875, 0.071614583, 0.410156250, 0.546875000 |
| Office | `/images/brochure-interiors/office-mobile.webp` | 172.1 KiB | 302, 130, 420, 840 | 0.294921875, 0.084635417, 0.410156250, 0.546875000 |

### Home mobile prompt

Reference: desktop `home.webp`. Final built-in source: `exec-66f5b91f-d4cc-4306-a31c-abf3de03ed47.png`.

```text
Use case: precise-object-edit
Create a PORTRAIT 2:3 composition, 1024x1536, adapted from this architectural living room image for a mobile screen. Keep the exact visual language: limestone floor, linen sofa left, dark walnut shelving and sideboard, olive foliage, soft natural daylight. Re-compose with a taller room view and enough floor, showing recognizable parts of the SOFA at LEFT and the WALNUT SIDEBOARD and BRONZE LAMP at RIGHT in the portrait composition.
A centered blank ivory feature wall panel must be the main subject, camera square on, exact upright rectangle with thin reveal. Physical proportion must be EXACTLY 1:2, width400px and height800px; approximately x312,y340,width400,height800 in the1024x1536 image. Do not retain the old oversized panel from the landscape composition. Make this new panel entirely plain light ivory plaster, without any art or tile pattern. All four edges visible; blank face free of any furniture, plant, shadow, baseboard or ornament. Furniture should flank the panel without touching it: upholstered sofa occupies left edge x40-280 around y1000-1350, walnut sideboard at right x755-980 around y1050-1320. Keep their identifying shapes inside the frame rather than cropped outside. Floor level at panel base y1140. A little ceiling and tall wall at top. Architectural editorial photo, realistic luxury home, no people, text, logo or watermark. Frame with the understanding that around7% of each side may be cropped on narrow phones, so keep identifiable furniture within the inner86% image width. Output portrait, not landscape.
```

Targeted built-in edit, before choosing the larger exact 1:2 rendered surface that covers this placeholder frame:

```text
Use case: precise-object-edit
Fix the central wall panel's geometry ONLY. Preserve this portrait living room image and furniture exactly. The current rectangle is extremely narrow, roughly1:3.7, and WRONG. Replace that thin tall panel with a much WIDER and SHORTER panel. Its inside face must be EXACTLY1:2 width-to-height. On this1024x1536 image, new left edge x325, right edge x705, top edge y260, bottom edge y1020. Width380pixels, height760pixels. Uniform blank ivory face with thin shadow reveal. Restore the old panel area above y260 as seamless matching plaster wall, and move side reveals outward. New panel must have half the height as its width ratio (twice as tall as wide). Do not alter sofa, floor, lamp, sideboard, ceiling, shelving, daylight or anything else. This geometry correction is essential, it must look like a1200x2400mm rectangle rather than a skinny column. No tile art, texture or text.
```

### Hotel mobile prompt

Reference: desktop `hotel.webp`. Final built-in source: `exec-ad712a3e-8b7c-4fce-a2a8-bf68743ce0cd.png`.

```text
Use case: precise-object-edit
Adapt the supplied hotel lobby into a portrait1024x1536 architectural photograph for a phone. Keep travertine stone, soft amber bronze cove lighting, ivory lounge chair on left, sculptural bronze reception desk on right. SHOW recognizable chair and reception desk within the portrait frame, arranged to flank a central wall, with enough foreground floor for spatial depth. Furniture should lie within x70-300 on left and x755-975 on right so a minor7percent side crop still leaves it visible.
IMPORTANT CHANGE: The central feature wall should be completely BLANK, UNFRAMED uniform light ivory plaster from x300 to740, y170 to1080. REMOVE the existing narrow bronze frame and panel outline. There is NO panel frame, recess outline, seam, artwork, mirror, pattern or texture on this central blank wall; make it plain plaster. A separate exact1:2 tile slab will be digitally rendered onto this plain wall later, so the source background must have no fixed panel boundaries. Camera square on with all verticals corrected. No furniture, lamp, plant, shadow or object in front of the center wall. Leave clear unobstructed uniform wall for later product insertion roughly x315,y250,width400,height800, with floor immediately beneath at y1050-1150. The purpose is a premium architectural editorial interior visualization. No people, text, signage, logo or watermark. Create portrait composition, not a stretched landscape.
```

### Office mobile prompt

Reference: desktop `office.webp`. Final built-in source: `exec-05af917c-489e-4005-a4a6-3cee0b25b562.png`.

```text
Use case: precise-object-edit
Re-compose the supplied office reception into a new PORTRAIT architectural photograph, image1024x1536, for a phone screen. Match original pale oak, muted olive waiting sofa, curved oak reception desk with laptop and black lamp, limestone floor and soft daylight. Include clearly recognizable sofa in lower LEFT, reception desk in lower RIGHT, and floor below, not only an empty wall. These furniture pieces remain visible if7percent is cropped from either side. Re-compose naturally rather than stretching original.
IMPORTANT: REMOVE the central narrow framed panel. Replace it with a BROAD BLANK PLASTER FEATURE WALL with NO outline, no frame, no pattern, no seams, no recess, no art. The blank uniform ivory wall should occupy the middle HALF of image width, x260-770, and y170-1110. Floor starts at its base. Keep architectural oak panelling only outside this broad central plaster area. This broad plain area will later receive an exact upright 1:2 product image, so no fixed panel frame should be drawn. Keep absolutely nothing in front of this empty wall: no desk, foliage, chairs, shadows or lamps across it. All furnishings flank it safely, sofa leftx70-245 and receptiondesk rightx785-980. Camera faces center wall squarely with parallel verticals. Premium quiet contemporary office, realistic materials, natural editorial photography. No people, words, logos, watermarks. PORTRAIT composition.
```



