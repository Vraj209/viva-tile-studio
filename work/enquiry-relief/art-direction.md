# VAVI enquiry relief

Targeted evolution of the existing enquiry section. Preserve its forest palette, editorial type, content, form logic, and field order. Per the follow-up request, show the relief only at desktop widths (1024 px and above); tablet and mobile omit the image and its space.

Design settings: DESIGN_VARIANCE 6, MOTION_INTENSITY 3, VISUAL_DENSITY 3. Native CSS Modules; existing typography and reveal system. Static relief artwork gives depth through grazing light, fine ceramic joints, and raised arcs, without extra motion.

Asset: `public/images/enquiry/forest-relief.webp`.
Generated using the built-in imagegen tool, then encoded as WebP with Sharp. Decorative concept artwork, not a claim about a specific catalogue product.

## Verification

- Production build, TypeScript, and component ESLint passed.
- Existing responsive browser scenarios passed at 320, 390, 768, 1024, and 1440 px with collapsed and expanded forms.
- All nine existing footer-transition, keyboard, and motion checks passed; enquiry requests were mocked.
- Visually inspected desktop, narrow desktop, and mobile. The image stays decorative, lazy-loaded, and outside the form interaction layer.
- Desktop-only follow-up: checked image hidden at 390, 768, and 1023 px and visible at 1024 and 1440 px, with no horizontal overflow. Component lint passed.
- Saved preview: `work/enquiry-relief/preview.jpg`; responsive and transition reports are saved alongside it.

## Generation prompt

Use case: product-mockup.
Asset type: bespoke architectural ceramic relief artwork for the enquiry section of VAVI TileStudio, a luxury 3D tile studio website.
Create a photorealistic straight-on macro of a sculptural ceramic wall surface, portrait 4:5 composition. The entire frame is filled edge-to-edge by a two-column by three-row assembly of large square forest-green ceramic tiles. The same restrained repeated module has four broad nested quarter-circle relief ridges that meet adjacent modules in a carefully aligned continuous flowing architectural composition. Alternating rotations create a pair of elegant open arches, broad semicircles, and gentle V-shaped convergences. Geometric craftsmanship, not floral ornament. Broad solid ceramic ribs, subtle softened hand-finished edges, fine recessed dark joints between modules. Visible depth around 10 mm expressed through light, tactile fine-grain satin-matte fired ceramic with delicate glaze variation.
Color palette: entirely deep desaturated moss / forest green, average color close to #303c32, relief highlights muted sage #75836b, shadows #17281f. No pale cream, no white, no gold.
Light: beautiful warm raking gallery light from upper left creates precise directional shadows and fine illuminated edges, fairly subdued overall, rich tactile realism. Editorial architectural product photography, long lens, perfectly front-on orthographic composition, no perspective distortion, no surrounding room. Quiet and luxurious. Intricacy comes from true physical relief and light, not decorative flourishes.
Constraints: NO text, lettering, logos, monograms, caption, border, plants, furniture, loose objects, hands, people, fake UI, metallic shine or excessive tiny ribs. Not an icon, not a generic cube, not a tessellated vector illustration. This is a material texture photograph to be cropped inside a web layout.
