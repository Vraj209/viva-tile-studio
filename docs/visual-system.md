# VAVI visual system and storyboard

This is a reversible local design proposal for **“From imagination to a space that is yours.”** The source hierarchy is owner-approved factual material first, supplied draft copy second and external references for inspiration only. No visual brand or tile samples were supplied. Generated studies are used honestly as concepts while preserving a complete, readable visitor journey.

## Observations versus adaptations

### IDST color reference

The live [IDST services page](https://www.idst.ae/services) was inspected in the browser during this implementation. Computed body values were `rgb(208, 198, 186)` for the background and `rgb(28, 26, 26)` for the text, equivalent to **#d0c6ba** and **#1c1a1a**. Manrope was observed as its body typeface. These are the verified observations; they do not describe every element or state of IDST.

VAVI borrows the warm neutral / dark foreground relationship and the quiet sans-serif support. Its lighter paper, forest green, serif display face, botanical artwork and page composition are new adaptations, not extracted IDST identity. The separate provisional palette in the supplied brief remains preserved in the source archive; it is not mislabelled as the inspected palette.

### A24 object reference

The [Awwwards listing](https://www.awwwards.com/sites/a24) was followed to the live [A24 experience](https://a24.raviklaassens.com/). Desktop observations recorded during the implementation were an ivory background; a dominant, tilted central disc with other discs staggered to the right and into depth; compact top navigation (Films / Television / Index); and metadata to the left. Keyboard arrows changed the disc and its HTML caption. The interface documented Enter for opening and Space for flipping. At a 390 × 844 browser viewport, the live reference retained one dominant tilted disc with a smaller adjacent disc visible at the right, moved metadata into thin rows across the top and placed A24 / Films / Television / Index in a floating bottom navigation bar. This was viewport emulation, not a physical phone test.

VAVI adapts the hierarchy of a dominant object, supporting depth and readable adjacent metadata. Its hero has a shallow sample fan with one dominant botanical concept, with a limited pointer response on appropriate devices. It does not copy A24 branding, film imagery, content, disc controls or entire layout. The four-beat idea-to-space scroll narrative is a VAVI proposal required by the brief, not a claimed observation of A24.

### Commercial references

See `docs/source-audit.md` for the ten commercial sites, access limitations and content observations. No competitor imagery or customer project was reused. The useful shared principle is to connect an inspiration input with a qualified project conversation and make review/approval understandable.

## Semantic tokens

The implemented token definitions live in `src/app/globals.css`. The table records their provenance; source code is the authority if refinement subsequently changes a value.

| Token | Initial implemented value | Purpose | Provenance |
| --- | --- | --- | --- |
| `--stone` | `#d0c6ba` | Hero/header warm neutral | Verified IDST computed body background. |
| `--ink` | `#1c1a1a` | Principal text and line color | Verified IDST computed body text. |
| `--paper` | `#eae4da` | Main editorial page | VAVI adaptation, lighter than stone. Not extracted. |
| `--forest` | `#303c32` | Primary action, manifesto and footer | VAVI adaptation from the brief's proposed palette, related to the botanical art. Not extracted. |
| `--muted` | `#57534d` | Supporting text | VAVI adaptation, darkened during contrast refinement; evaluate on each background. |
| `--line` | `rgba(28,26,26,.23)` | Hairline dividers | VAVI opacity treatment derived from ink. |
| `--bronze` | `#92785e` | Reserved decorative accent | Supplied provisional palette. Not extracted. Not approved for ordinary small text. |
| `--gutter` | `5.6vw`; mobile 24px / 20px | Main alignment system | Creative-brief grid proposal, tuned by viewport. |

Computed contrast for opaque token pairs, using the standard sRGB relative-luminance calculation: ink/paper **13.70:1**, ink/stone **10.29:1**, paper/forest **9.14:1**, muted/paper **6.04:1**, muted/stone **4.53:1**. The muted token was darkened after the first review because its earlier stone pairing fell below 4.5:1. Bronze/paper is **3.28:1** and bronze/stone **2.46:1**; bronze should remain decorative. These calculations are not a complete rendered accessibility audit, particularly for overlays and image captions.

## Typography and composition

Cormorant Garamond regular and italic provide the expressive display treatment. Manrope Variable provides body copy, navigation, captions and form controls. Both installed packages carry SIL OFL 1.1; retained notices are in `docs/licenses/`. The serif choice is an editorial proposal because no owner title sample was available; no claim is made to reproduce unseen letterforms.

The page uses large fluid statements, considered line breaks, hairline rules, open space and square image framing. The hero's readable HTML proposition and primary enquiry link are visible immediately. The asymmetrical possibilities and gallery arrangements have coherent aligned edges beneath their unequal image sizes. Interior concepts alternate with flat artwork and cropped detail.

Mobile uses a single-column narrative, a dominant artwork, smaller supporting sample stack and normal document flow. At tablet sizes the static four-beat story may use two columns. The enhanced scroll story is limited to desktop at 1024px or wider without reduced motion. Typography and crops must be judged from actual rendered screenshots. The main paragraph styles were increased during the refinement pass to approximately 14–15px, with story paragraphs around 15–16px and the body default 16px. This is a deliberately more compact choice than the brief's suggested 16–18px starting point and should still be checked at 200% zoom. Quiet captions remain smaller.

## Concise storyboard

| Beat / section | Visitor question | Visual and content decision | Interaction / fallback |
| --- | --- | --- | --- |
| Arrival | What does VAVI create? | Brand headline, concise custom-design proposition, shallow fan with Midnight Garden dominant. | Immediate enquiry and possibilities anchors. HTML/image presentation remains readable without WebGL. Fine-pointer movement is restrained and nonessential. |
| Your idea | What can I bring? | The flat botanical image is a starting artwork, alongside photograph/sketch/unfinished-idea copy. | Caption exists as HTML. Static sequence without JavaScript, WebGL or enhanced-motion eligibility. |
| Your tile | How might it become a surface? | Same image on a thin, non-metallic neutral tile body, briefly turned to expose its edge. No claimed product relief. | One demand-rendered R3F scene. No printer simulation or essential dragging. |
| Your composition | How do pieces form a whole? | Nine pieces use nine UV windows into one artwork, preserving continuity. Layout explicitly illustrative. | Pieces separate briefly, then settle into a coordinated 3 × 3 surface; static CSS background windows show the same concept. |
| Your space | How could it belong in a room? | The same study transitions into the matching generated room, labelled Concept visualization. | The final room is an optimized image, not an unfinished 3D room. |
| Possibilities | Could it work for my project? | Residential, architectural/interior and branded commercial concepts; an application suitability caveat. | “Discuss a similar idea” carries context into optional enquiry fields. |
| Gallery | Show me the detail. | One large room, a labelled detail of the same art, one smaller independent commercial concept. No inflated project count. | Native dialog, close control, Escape behavior and restoration of the opening button's focus. Only actually available views are offered. |
| Process | What happens next? | All six supplied stages in a calm editorial index, with conditional digital concept and project-specific installation arrangements. | Every stage is readable without hover; no second pinned narrative. |
| Confidence | What needs review? | Conditional FAQ: art, unfinished ideas, professional collaboration, size/finish, wet/exterior use, time/cost and installation. | Native details/summary controls. |
| Enquiry | How do I begin? | Three required fields and optional context; the Midnight Garden artwork returns as a quiet detail. | Real server handler; honest unavailable state until delivery is configured; entered values survive errors. No simulated success. |

## Motion configuration and rendering boundaries

`src/lib/motion.ts` owns the shared progress type, media query, chapter thresholds and room reveal. GSAP owns scroll progress and caption transitions; `TileScene.tsx` reads that shared model into Three.js object transforms without per-frame React state updates. The scene uses an orthographic camera, one square source texture, flat art faces and non-metallic materials.

Desktop chapter boundaries are initially at progress 0.23, 0.49 and 0.78. The room reveal runs from 0.84 to 0.94. A `320svh` track contains a `100svh` sticky stage, giving roughly **2.2 viewport-heights of scroll travel** beyond the stage. ScrollTrigger uses natural scroll with a 0.45 scrub settling time. The stage provides visible gallery/enquiry shortcuts. Reverse scrolling reads the same shared progress rather than triggering a separate sequence.

The renderer is dynamically loaded behind a Client Component only on eligible desktop and as the story approaches. `frameloop="demand"`, a 1–1.5 device-pixel-ratio range, intersection visibility and tab visibility limit unnecessary work. A static poster is present until the first successful draw. Initial texture or renderer failure returns to the static normal-flow story. A failure or context loss after a successful draw retains the story track with synchronized image-based fallback, avoiding an abrupt scroll-position jump. Media-query changes dispose listeners and scene resources; GSAP uses scoped setup and reversion. None of these code paths substitutes for actual fallback and device testing.

Reduced motion removes the enhanced spatial sequence and prolonged sticky experience; all four images and captions remain in normal flow. Hero response is disabled. Eligible desktop visitors can also select “View without motion” to choose the static story manually. The enquiry, page anchors and semantic copy do not depend on animation.

## Evidence and release boundaries

Three generated WebP source images total about 0.65 MiB; the scene texture alone is about 234 KiB. Asset details and replacement guidance are in `docs/assets.md`. A complete runtime transfer budget and LCP/CLS/interaction profile must be measured, not inferred from those image bytes.

This document describes implementation and source provenance; it does not claim that all requested browser widths, keyboard flows, zoom, orientation, slow-loading or real-delivery tests have passed. Record those outcomes separately. The page remains a local proposal with owner confirmations listed in `docs/source-audit.md`, including manufacturing terms, relief, applications, geography, artwork permission, brand treatment, contact details and enquiry delivery.
