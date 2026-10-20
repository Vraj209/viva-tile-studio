# Chapters 04–06: material, detail, clarity

## Design direction

Targeted evolution of the existing VAVI landing page for architects, designers,
and homeowners. Preserve Cormorant Garamond, Manrope, the forest accent, square
architectural framing, chapter numbering, and the existing enquiry destinations.
The brief explicitly calls for contrasting chapter tones, so the sequence moves
from warm limestone through deep forest to pale ceramic.

- **04 / Collaboration:** a warm limestone surface and a large atelier still life
  introduce the six stages of developing an idea into tile.
- **05 / Specifications:** an ivory relief specimen overlaps the chapter seam;
  a deep forest archive groups the original technical information in native
  disclosures, keeping all qualifications and the source download available.
- **06 / Questions:** a pale ceramic reading surface, a smaller architectural
  aperture, and generous spacing make the FAQ a calm transition into enquiry.

Design-taste settings: `DESIGN_VARIANCE: 7`, `MOTION_INTENSITY: 4`,
`VISUAL_DENSITY: 3`. These reflect the existing editorial brand, with stronger
tonal distinction and restrained image motion. Native CSS Modules provide the
visual treatment; the existing GSAP motion layer supplies soft entrances and
subtle image movement within fixed frames. Reduced motion keeps the content
static. Mobile layouts stack without pinning or horizontal scrolling.

## Atelier study — section 04 / Process

- Tool: built-in `image_gen.imagegen` (no CLI or API-key workflow).
- Final asset: `public/images/chapters/atelier-study.webp`.
- Purpose: a conceptual editorial material study supporting the consultation and process chapter. It is not a documentary photograph of a supplied product or completed project.
- References: `public/images/hero/ivory-tides.webp` and `public/images/hero/sage-ginkgo.webp`, both inspected before generation.
- Treatment: warm limestone and ivory ceramic, sculptural relief, raking daylight, asymmetrical close composition.
- Optimization: 1200 × 800 WebP, 121,904 bytes (119 KiB), encoded with Sharp at quality 82 / effort 6 for responsive web delivery.
- Visual verification: generated original and final WebP inspected. The ceramic relief, sample thickness, raking shadows, limestone pores, unmarked paper, and pencil remain clear; no text, watermark, or people are present.

### Exact generation prompt

```text
Use case: photorealistic-natural
Asset type: editorial landscape still-life photograph for the Process chapter of VAVI Tile Studio, a luxury architectural tile website.
Primary request: a thoughtful architect's material study, showing ivory sculptural relief ceramic tile samples on a warm limestone work surface. Quietly communicate creative consultation, care, and the selection of beautiful materials.
Input images: Image 1 is a material reference for flowing ivory relief and chalky ceramic texture; Image 2 is a reference for botanical relief craftsmanship and restrained sage tone. Create a new photograph inspired by their tactile quality; this is conceptual illustration, not proof of a manufactured product.
Scene/backdrop: a warm, minimally styled architecture atelier table made of pale honed limestone, with subtle natural pores.
Subject: one large square ivory ceramic sample with soft sculptural wave relief at a slight diagonal, a smaller simple ivory relief sample partially tucked under it, and a single natural-wood drawing pencil near one edge of an unmarked off-white sketch paper. The ceramic relief should look physically dimensional, not printed.
Style/medium: premium architectural magazine photography, natural material realism, restrained and refined, no glossy CGI appearance.
Composition/framing: landscape 3:2 ratio, close oblique overhead view, tactile ceramic sample filling most of the frame, asymmetric crop and generous breathing space along one edge, elegantly layered sample edges with convincing thickness and shadows.
Lighting/mood: strong raking late-afternoon daylight across the table, soft-edged but rich natural shadows, luminous cream highlights, intimate contemplative atelier atmosphere.
Color palette: limestone beige, warm chalk ivory, subtle taupe shadows; predominantly warm neutral.
Materials/textures: fine ceramic grain, honed limestone, sculptural flowing relief, tiny believable imperfections, rich detail without artificial oversharpening.
Constraints: no text, no logos, no watermark, no people, no hands, no plants or decorative vases, no visible writing or lettering, no catalogue grid, no border.
```

