# Material Atelier hero

Revised 27 September 2026 at the user's request: replace the hero imagery with original generated tile concepts, give every tile the same dimensions, and smooth the transitions between selections. The hero headline, supporting copy, both calls to action, identity, palette and bottom links remain unchanged. Existing unrelated workspace changes were preserved.

## Presentation and assets

The hero now presents six original generated ceramic tile design concepts. Each delivered WebP face is exactly 768 × 768 pixels. They are creative concepts rather than photographs of the supplied products; the captions and accessible descriptions identify them accordingly. Generation prompts, preserved originals, asset paths, dimensions and preparation details are recorded in [hero-assets.md](hero-assets.md).

All six tile faces and their stationary interaction regions share the same CSS size: 36% of the stage width on desktop and 34% at viewport widths of 768 px or less, with a 1:1 aspect ratio. Position, angle and depth distinguish the samples; there is no per-tile size or animated scale. The foreground concept loads eagerly at high priority. Supporting faces retain normal lazy loading.

The visual scene uses `transform-style: preserve-3d` and a 1400 px perspective. Small resting depth offsets establish the composition, and the browser continuously sorts the moving planes as their depth changes. The separate interaction layer keeps fixed hit regions independent of the animated faces.

## Interaction

- The initial composition is server-rendered and visible. Supporting samples settle once with a 750 ms entrance, 45 ms stagger and 60 ms delay; the foreground image is visible immediately. There is no idle animation or render loop.
- One interruptible GSAP timeline moves all samples together. A selection takes 720 ms and a return takes 780 ms. Lateral position and rotation use `power3.out`; a separate simultaneous depth tween uses `sine.inOut`, so lateral movement leads the depth exchange. The selected face rotates toward −1°, while neighboring samples move slightly aside and recede.
- Every new selection starts from the current rendered poses. There is no preliminary recognition phase, animated scaling or abrupt visual `z-index` change. Static interaction regions retain fixed stacking order to prevent movement-induced hover flicker.
- Hover selects a sample; leaving the stage restores the composition. Keyboard focus provides equivalent selection, with Arrow keys, Home, End and Escape. Focus remains visible after Escape, and browser modifier shortcuts remain available.
- Touch taps select a sample; tapping the selected sample again returns it. Narrow screens also have six direct numbered choices. The number row preserves its own arrow-key focus sequence.
- OS reduced-motion preferences and the manual Pause motion control use the same immediate selection branch: lateral position and rotation retain their resting values, and selection changes depth without a tween. CSS removes shadow transitions in both cases. Live preference changes are handled, and all observers, media listeners and GSAP animations are cleaned up on unmount.
- The no-JavaScript presentation retains all six images and a gallery link; inactive transparent controls and hints are hidden with noscript styles.

## Current revision validation

- `npm run lint` and `npm run build` passed after the final code changes. The production build also completed TypeScript validation.
- All six generated WebP images loaded. Each source is 768 × 768 pixels; the combined WebP payload is 737,712 bytes. At a 1440 × 1000 viewport, all six faces had identical computed dimensions of 218.719 × 218.719 CSS pixels.
- Every selected tile stayed inside the stage at 820 × 1050, 390 × 844 and 320 × 900: six selections at each size, for 18 settled states. Every base tile remained square and equally sized, with no horizontal document overflow. This testing caught and corrected edge clipping in the two side positions.
- Animation sampling at approximately 110 ms intervals showed continuous translation, rotation and depth progression through a selection; visual `z-index` remained `auto`. Interrupting a selection after 170 ms continued from the current poses. Rapid successive selections settled with exactly one active tile.
- All six stationary hit regions had exposed clickable areas. Pointer selection, keyboard Enter, arrows, Home and Escape were exercised. A stationary pointer no longer takes selection back from keyboard navigation when the page scrolls or resizes.
- Narrow-screen numbered choices selected the requested concepts; clicking an already selected choice cleared the selection. Manual Pause motion retained resting lateral position and rotation and applied the selected depth immediately.
- The final clean in-app browser reload loaded all six faces and reported no new console errors. Temporary viewport overrides were reset, and the preview was returned to the top of the page.

Current revision evidence: `work/hero/hero-originals-desktop.png`. The small floating control on its right edge belongs to the Chrome extension, not the site.

## Earlier revision validation

The following checks were completed for the preceding hero revision, which used the supplied gallery images with their original proportions and a different motion sequence:

- `npm run lint`, `npm run typecheck`, `npm run build` and `git diff --check` passed. The diff check reported only existing Windows line-ending notices.
- The previous manifest contained six distinct IDs and six existing images; Sharp verified their intrinsic dimensions and compressed payload.
- Chrome inspection covered 1920 × 1080, 1920 × 900, 1440 × 1000, 820 × 1050, 390 × 844 and 320 × 900. There was no horizontal overflow. All six earlier surfaces were visible, and selected samples remained inside the stage.
- The earlier fixed desktop hit regions had exposed selectable areas. Pointer exchanges, rapid consecutive selections and stage-leave deselection were exercised.
- Keyboard selection, six-sample traversal, Home/End, Escape with retained focus, and mobile number-row arrow navigation were exercised. All six earlier tablet selections remained inside the stage.
- Mobile direct-choice selection and repeated-click deselection passed. Manual motion-off selection retained the earlier resting transforms and reported zero-duration shadow transitions.
- All six previous hero images loaded. The clean in-app browser reported no console errors during those checks. Chrome's existing extension UI may appear in its screenshots.

Earlier revision evidence: `work/hero/hero-desktop.png`, `work/hero/hero-reveal.png`, and `work/hero/hero-mobile.png`. These screenshots predate the generated imagery and revised motion.

## Limits

The browser tooling provided viewport resizing and pointer/keyboard actions, but no native touch or OS media emulation. Physical iOS/Android touch, live OS preference switching, screen-reader output and a JavaScript-disabled browser session were not directly tested. The manual motion-off branch was exercised as described above.

The generated hero faces are original visual concepts; they do not establish product availability, measured physical dimensions or a manufactured finish. Supplied product imagery remains available separately in the inspiration gallery.

## Implementation files

- `src/components/Hero.tsx`: server-rendered hero content and atelier placement.
- `src/components/HeroAtelier.tsx` and `HeroAtelier.module.css`: equally sized square samples, preserved 3D scene, stationary interaction layer, accessible controls, focus and touch state, captions and fallback.
- `src/lib/use-hero-motion.ts`: composition, entrance, interruptible selection and return timeline, resizing and motion preferences.
- `src/lib/hero-samples.ts`: typed manifest of six original generated concepts with uniform intrinsic dimensions.
- `public/images/hero/`: generated concept WebP assets; original outputs and generation records are preserved under `originals/`.

No dependencies were added and no deployment was performed for this revision.
