# Made Around You asset register

Prepared 29 September 2026 for Section 02 only. Generated room images are explicitly concept visualizations, never photographs of completed VAVI projects. Existing supplied samples keep their source classification. No product availability, size, finish, performance or installation suitability is established by a room visualization.

## New workspace room concepts

The designer room is separately recorded in [the designer asset register](made-around-you-design-asset.md), including its complete built-in imagegen prompt. Its runtime path is `public/images/worlds/design-room.webp`. The unchanged source is `data/landscape/L_2.png`.

| Public URL | Pixels | Bytes | Source and classification |
| --- | --- | --- | --- |
| `/images/worlds/workspace.webp` | 1536 x 1024 | 354,876 | Original office reception concept generated with the built-in image_gen tool, using the supplied Angular lines sample as a pattern reference. |
| `/images/worlds/workspace-meeting.webp` | 1536 x 1024 | 397,484 | Original neighboring collaboration room concept generated with the same tool and sample, with the first office image also supplied as an architectural continuity reference. |

Both original PNG outputs are preserved under `work/made-around-you/workspace-originals/`. Complete prompts, exact source references, preparation metadata and filenames are in `work/made-around-you/workspace-originals/workspace-prompts.json`. Only the optimized runtime images are published under `public/images/worlds/`. Sharp converted the PNG outputs to quality-86 WebP without cropping, color correction, sharpening or content edits. Combined workspace source WebP payload: 752,360 bytes. Browser transfer depends on Next.js variants and progressive image loading.

The referenced sample is `/images/gallery/angular-lines-inspect.webp` (560 x 574 px), a crop of the top-left tile in the owner-supplied four-sample photograph `data/samples/1c57ee0e-5f93-4d76-97a7-f61eda39e7a8.jpeg`. The complete original photograph remains available as `/images/gallery/angular-lines-source.webp`. See `docs/gallery-assets.md` for source crop coordinates and classification. This reference is photographic evidence of the supplied sample, not a verified installation.

Visual review confirmed a recognizable warm taupe/brown angular pattern, an unobscured principal tile wall, level eye-height framing, timber threshold edges, and compatible lighting/materials between the two office concepts. Generation can approximate or alter fine linework, sample proportions in perspective and invented tile layouts. Therefore use the unchanged supplied image for all exact sample/detail inspection, and label rooms **Concept visualization**. Never imply that the room is a documented installation or exact production proof; do not derive physical relief from these images.

Suggested crops: reception overview `object-position: 50% 48%`; narrow opening `50% 44%`; meeting overview `50% 46%`. Main geometric wall occupies approximately x=370..1160, y=54..700 of the reception original and x=249..1290, y=57..710 of the meeting original. Crops should retain enough furniture or doorway to establish scale. Avoid aggressive zoom or image warping. The portrait sample inspection is best contained at its native ratio rather than filled across a wide scene.

## Existing images available for the remaining journeys

| Public URL / source | Appropriate use | Honest label and limitation |
| --- | --- | --- |
| `/images/garden-room.webp` | Residential wide view and a restrained approach toward its botanical wall. | **Concept visualization**. Previously generated, 1536 x 1024; no completed-project claim. |
| `/images/midnight-garden.webp` | Recognizable source artwork/detail corresponding to Garden Room. | **Artwork concept**. Generated flat artwork, 1254 x 1254; painted shading is not proof of physical relief. |
| `/images/terra-room.webp` | Hospitality arrival/reception and a restrained wall-detail crop. | **Concept visualization**. Previously generated, 1536 x 1024; not a customer project or a separate lounge. |
| `/images/gallery/ivory-geometry-inspect.webp` | Designers' full supplied reference and proportional detail crop. | **Supplied sample image**. Unaltered owner-supplied imagery from `data/landscape/L_2.png`; depicted relief does not establish physical manufacture. |
| `/images/worlds/design-room.webp` | Designers' final spatial interpretation. | **Concept visualization**. Generated architectural setting using the supplied Ivory geometry sample as a pattern reference; see `docs/made-around-you-design-asset.md` for the original, prompt and preparation record. |
| `/images/gallery/angular-lines-source.webp` | Provenance reference for the office pattern; not a scene in the implemented journey. | **Supplied sample photograph**. Four different samples, not a finished installation. |
| `/images/gallery/angular-lines-inspect.webp` | The office journey's final detail. | **Supplied sample image**. Exact unchanged crop from the photograph; no inferred manufacturing process or additional detail. |
| `data/samples/5f370bac-8969-45cc-a638-3d630ce5ab6c.jpeg` | Optional elephant lounge inspiration. | **Supplied interior reference**. Visually appears as a full mural without visible tile joints; installation/product provenance unverified. Not used as verified tile evidence. |
| `data/samples/fff21619-312a-4f62-8cfa-a6e0b484064d.jpeg` | Optional spotted-cat lounge inspiration. | **Supplied interior reference**. The image appears framed above a sofa; no matching selected tile sample or verified installation evidence. |
| `data/footer image.png`, already served as `/images/footer.png` | Existing bathroom scene, if needed as another clearly labeled visualization. | **Supplied room visualization**. No verified installation or exact matching product supplied. Keep project suitability conditional. |

The supplied `data/brouchers/Eton_NEW-POSTER-2X4.pdf` could not provide additional usable imagery: all 10 pages fail JPEG decoding with the available Poppler and pypdf readers (invalid xref/flate/JPEG data). The original was not modified.

## Implemented sequence and authenticity boundaries

The scene manifest in `src/lib/space-worlds.ts` is the source of truth for the implemented order, descriptions, image positions and captions.

- Homeowners: Garden Room wide atmosphere (`50% 47%`) -> Midnight Garden artwork detail (`50% 42%`) -> Garden Room full spatial invitation (`65% 50%`), with `Tell Us About Your Space`. The artwork detail is labeled a design exploration, not a photographed material texture.
- Designers & Architects: full supplied Ivory geometry image, contained at its native ratio -> proportional detail crop of the same supplied image (`48% 46%`) -> separate `design-room.webp` architectural concept using that pattern reference, with `Discuss Your Design Vision`. Physical finish is confirmed through project review; the sequence does not imply a filmed manufacturing transformation.
- Hospitality & Hotels: Terra Room arrival -> closer composition of the same reception (`72% 55%`) -> the same geometric wall as a concept detail (`50% 20%`), with `Discuss Your Project`. Captions explicitly distinguish the closer view and wall detail. These are views of one reception concept, not separate verified spaces or an invented lounge.
- Offices & Workspaces: new workspace reception -> new neighboring collaboration-room concept -> unchanged supplied Angular lines sample contained at its native ratio, with `Discuss Your Project`. Both rooms are labeled `Concept visualization · supplied pattern reference`; the final exact sample uses `Supplied sample image · Angular lines`.

No competitor imagery was downloaded. All source files and surrounding sections remain untouched by asset preparation.
