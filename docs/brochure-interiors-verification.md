# Brochure interior previews

Implemented 12 October 2026 on `/brochures`. This builds on the existing reader without replacing its opening, page-turn geometry, navigation or page assets.

## Product identity and imagery

- 49 distinct products are mapped to 51 catalogue pages. Only the Evoke cover has no product hotspot. Normal Evoke hotspots follow the exact PDF image placement; repeated introduction/interior pages have measured overrides.
- A selected product remains the same across Home, Hotel and Office. The original 10465 catalogue interior is its initial Home view.
- Generated room backgrounds have measured, unobstructed wall recesses. The browser draws the original product artwork over the recess at its native aspect ratio. No product artwork is generated, recoloured, stretched, repeated or artificially sharpened. These source designs are complete decorative panels, so a single panel is shown rather than inventing repeated motifs or grout divisions.
- New room scenes display **Interior visualisation**. The supplied interior displays **From the original brochure**. Neither is represented as a completed VAVI installation.
- Evoke's printed 1200 × 2400 mm format is retained. The two uncoded collections use descriptive artwork labels and do not acquire invented product codes, dimensions or performance claims.
- Source preparation, hashes and identity evidence are in `brochure-products.md`; room prompts and placement coordinates are in `brochure-interior-scenes.md`.

## Interaction and delivery

- Tile regions are keyboard-accessible buttons with a quiet hover/focus label; the label stays visible on phones and touch devices. Swiping across a tile still turns the brochure and suppresses the subsequent click.
- The interior viewer is lazy-loaded and uses a second native modal dialog. Each dialog owns a separate scroll-lock token. Closing restores the original tile trigger with `preventScroll`, leaving the reader and zoom pane mounted.
- Room controls, arrows, horizontal swipes and keyboard arrows switch environments. The last decoded scene remains beneath the incoming scene during a crossfade. A stalled image becomes retryable after 15 seconds.
- Room/detail controls zoom the installed surface. Product details exposes the original artwork, documented information and a link to the original PDF page.
- Product enquiries carry the stable product ID and environment through the existing enquiry route. The form resolves only known product IDs and adds the product identity to its existing idea field without overwriting user-entered text. No form submission is performed by the viewer.
- Only the selected product texture and room load initially. After decoding, one next room is warmed at low priority. Full brochure PDFs are not fetched by the viewer.
- Reduced-motion styles remove entrance, crossfade, zoom and control transitions. Mobile layouts retain visible environment, close, detail and enquiry controls.
- Separate 1024 × 1536 portrait room compositions at 700 px and below keep furniture and the full product visible; wider screens use 1536 × 1024 room compositions. The matching original interior retains its supplied composition.
- Covered reader pages and scene controls are inert while their respective overlays are open. Escape closes details first, then detail zoom, then the interior viewer; it does not close the underlying reader.

## Verification

Browser checks in Chromium at 1440 × 1000 and 390 × 844:

- Opened coded Evoke products and uncoded New Poster artwork; checked correct names, texture, collection and original PDF link.
- Switched Home/Hotel/Office using buttons and swipe; verified the underlying brochure page did not change.
- Checked detail zoom, layered Escape behaviour, details focus, and removal of covered controls from keyboard navigation.
- Opened a preview from an enlarged brochure and confirmed its page and exact `scrollTop: 549` position were unchanged after closing, with focus returned to the same product.
- Swiped across a full-page product and confirmed the brochure turned without opening a preview.
- Followed the enquiry link and confirmed product name, collection, source page, Commercial project type and Feature wall application in the existing form. Confirmed dialogs and scroll locks were removed after route navigation. No enquiry was submitted.
- Closed both viewers and confirmed focus returned to the selected brochure in the library.
- Inspected portrait compositions and Artful Surfaces artwork on mobile, with furniture visible around the selected slab. Verified all three collections and all three environment controls.
- Fixed the initial cached-image zero-height warning by providing intrinsic canvas dimensions before the dialog opens. No further warnings or errors were recorded during subsequent viewer checks.
- Changed viewport across the 700 px breakpoint with the viewer open, then closed it. The selected page stayed at page 2 and focus returned to the same product button after it moved between desktop/mobile page containers.

Automated checks include product/page coverage, unique identity, all texture hashes and dimensions, bounded source hotspots, room dimensions and surface proportions, and all product/environment enquiry URLs, alongside existing reader geometry and enquiry tests.

Final checks: `npm test` **45 passed**; `npm run typecheck`, `npm run lint` and `npm run build` passed. The existing filesystem enquiry test and Next.js compiler required execution outside the Windows sandbox; no application changes were made to bypass those checks. `/brochures` remains statically prerendered. No dependencies were added.

Physical iOS/Android devices, Safari and OS-level reduced-motion emulation were not tested. Evoke's native artwork is 383 × 766 pixels after lossless extraction; enlarging it cannot reveal detail absent from the supplied source. For uncoded artwork, depicted installation scale is illustrative until the studio confirms its physical format.
