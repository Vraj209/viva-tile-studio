# Asset register

Recorded 24 September 2026. Pixel dimensions, format and byte sizes below were read from the actual delivered files with `sharp`; no image dimensions were inferred from filenames. All three images are sRGB WebP without alpha. **None is an owner-supplied asset or a photograph of a completed VAVI project. Owner approval is required before launch.**

| Actual delivered path / public URL | Pixels | Aspect ratio | Bytes | Classification and provenance | Intended role |
| --- | --- | --- | --- | --- | --- |
| `public/images/midnight-garden.webp` / `/images/midnight-garden.webp` | 1254 × 1254 | 1:1 | 239,524 | Original flat botanical artwork generated for this implementation with the built-in `image_gen` tool. A proposed design exploration, not a scan or photograph of a manufactured tile. | The recognizable visual thread in the hero, artwork beat, neutral tile concept, continuously mapped composition, gallery crop and enquiry detail. Also the single WebGL texture. |
| `public/images/garden-room.webp` / `/images/garden-room.webp` | 1536 × 1024 | 3:2 | 277,860 | Generated concept visualization derived from the Midnight Garden artwork. The same design is imagined across an illustrative 3 × 3 tile arrangement in an interior. | The story's final space beat, residential possibility and main gallery view. Must be labelled “Concept visualization.” |
| `public/images/terra-room.webp` / `/images/terra-room.webp` | 1536 × 1024 | 3:2 | 162,224 | Independently generated commercial interior concept using the built-in `image_gen` tool. “Terra Rhythm” is a proposed study name; this is not a completed branded installation. | Commercial possibility and smaller gallery study. Must be labelled “Concept visualization.” |

Combined compressed source-image bytes: **679,608 bytes (approximately 664 KiB / 0.65 MiB)**. The WebGL scene's only source texture is **239,524 bytes**. These figures exclude JavaScript, fonts, generated Next.js image variants and transfer overhead; they do not constitute a complete page-transfer or Core Web Vitals measurement. The requested initial 3 MB deferred-scene budget still needs to include the actual renderer and scene chunks when profiled.

## Classification and captions

- Midnight Garden artwork contains painted highlights and shadows. They must not be represented as evidence of raised surface relief. The code uses a flat artwork face on a neutral illustrative tile body.
- Garden Room is a visualization of the design in a setting; it provides no evidence of installed dimensions, finish, installation method or suitability.
- Terra Rhythm is one independent concept, not a customer project. No client, location, project date or outcome is invented.
- The gallery's close-up is deliberately the **same Midnight Garden artwork**, labelled as an artwork detail. It must not be counted as a third original design or used to inflate the portfolio.
- No tile samples, title samples, photographs, logos, videos, 3D models or product specification documents were supplied. The complete two source briefs are preserved in `data/`; see `docs/source-audit.md`.

## Replacement procedure

1. Obtain owner-approved originals and permissions. Record whether each item is artwork, a prototype photograph, a finished-tile photograph or a verified installed project.
2. Keep the same recognizable design across all four story beats. If replacing Midnight Garden, replace or recreate its matching room visualization too; confirm continuous artwork alignment across the grid.
3. Preserve original artwork proportions. Use an intentional crop only where its role is a labelled detail. Do not stretch art onto tile edges or derive displacement from image brightness.
4. Optimize images for their displayed size, update this register with actual dimensions/bytes/provenance, and update image references, aspect ratios, alt text and captions in `Hero`, `TileStory`, `TileScene`, `Possibilities` / `src/lib/content.ts`, `ProjectGallery` and `ProjectEnquiry`.
5. Verify the poster-to-canvas framing and the composition-to-room match cut after every replacement. Review desktop and mobile crops independently.
6. Only rename the gallery to “Selected work” once its images and captions document verified VAVI work.

## Fonts and non-image marks

`src/app/layout.tsx` imports locally bundled Fontsource packages: `@fontsource-variable/manrope/index.css`, `@fontsource/cormorant-garamond/latin-400.css`, and `@fontsource/cormorant-garamond/latin-400-italic.css`. No external font request is required by these imports. The installed packages' license files were inspected; each identifies **SIL Open Font License 1.1**. Exact notices are preserved in `docs/licenses/Manrope-OFL.txt` and `docs/licenses/Cormorant-Garamond-OFL.txt`. Retain these with redistributed builds/source that include the font software.

The VAVI wordmark and favicon are proposed text treatments created for this page, not supplied brand artwork. The generated social preview is typography-only, avoiding an implication that a concept image is approved project photography. Owner review of the proposed brand treatment remains outstanding.
