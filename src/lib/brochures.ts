/** Generated from owner-supplied PDFs; see docs/brochure-assets.md. */
export type BrochurePage = {
  src: string;
  alt: string;
  thumbnail: string;
  width: number;
  height: number;
};

export type Brochure = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  format: string;
  pageCount: number;
  /** Native page ratio. Each rendered page also carries its own dimensions. */
  width: number;
  height: number;
  cover: string;
  pdf: string;
  status: "ready" | "unavailable";
  sourceIssue: string | null;
  pages: BrochurePage[];
};

// Regenerate with: python scripts/prepare-brochure-assets.py
export const brochures: Brochure[] = [
  {
    "id": "evoke",
    "title": "Evoke Collection",
    "subtitle": "Craft, colour & composition",
    "description": "Explore expressive surfaces, sculptural patterns and room settings from the Evoke collection.",
    "format": "1200 × 2400 mm",
    "pageCount": 27,
    "width": 1272,
    "height": 1800,
    "cover": "/brochures/evoke/page-001.webp",
    "pdf": "/brochures/evoke/catalogue.pdf",
    "status": "ready",
    "sourceIssue": null,
    "pages": [
      {
        "src": "/brochures/evoke/page-001.webp",
        "alt": "Evoke Collection, page 1. Cover with hands holding dried foliage against a pale blue background.",
        "thumbnail": "/brochures/evoke/thumb-001.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-002.webp",
        "alt": "Evoke Collection, page 2. Introduction to handmade tiles with a decorative panel in an architectural setting.",
        "thumbnail": "/brochures/evoke/thumb-002.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-003.webp",
        "alt": "Evoke Collection, page 3. Design 10465: layered terracotta leaves and small flowers.",
        "thumbnail": "/brochures/evoke/thumb-003.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-004.webp",
        "alt": "Evoke Collection, page 4. Design 10465 shown beside a timber entrance door and an ivory console table.",
        "thumbnail": "/brochures/evoke/thumb-004.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-005.webp",
        "alt": "Evoke Collection, page 5. Design 10466: gold and brown ornamental scrollwork.",
        "thumbnail": "/brochures/evoke/thumb-005.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-006.webp",
        "alt": "Evoke Collection, page 6. Design 10467: terracotta discs on a blue textured ground.",
        "thumbnail": "/brochures/evoke/thumb-006.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-007.webp",
        "alt": "Evoke Collection, page 7. Design 10468: gold floral medallions on a dark brown ground.",
        "thumbnail": "/brochures/evoke/thumb-007.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-008.webp",
        "alt": "Evoke Collection, page 8. Design 10469: golden leaves and butterflies on a cream ground.",
        "thumbnail": "/brochures/evoke/thumb-008.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-009.webp",
        "alt": "Evoke Collection, page 9. Design 10470: grey ornamental motifs and geometric textures.",
        "thumbnail": "/brochures/evoke/thumb-009.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-010.webp",
        "alt": "Evoke Collection, page 10. Design 10471: gold botanical ornament on ivory.",
        "thumbnail": "/brochures/evoke/thumb-010.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-011.webp",
        "alt": "Evoke Collection, page 11. Design 10472: blue and rust patchwork with ornamental details.",
        "thumbnail": "/brochures/evoke/thumb-011.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-012.webp",
        "alt": "Evoke Collection, page 12. Design 10473: a gold circular medallion on black with patterned borders.",
        "thumbnail": "/brochures/evoke/thumb-012.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-013.webp",
        "alt": "Evoke Collection, page 13. Design 10474: golden foliage on a pale textured ground.",
        "thumbnail": "/brochures/evoke/thumb-013.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-014.webp",
        "alt": "Evoke Collection, page 14. Design 10475: curling branches and small blue flowers on beige.",
        "thumbnail": "/brochures/evoke/thumb-014.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-015.webp",
        "alt": "Evoke Collection, page 15. Design 10476: intricate copper-coloured ornament over teal.",
        "thumbnail": "/brochures/evoke/thumb-015.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-016.webp",
        "alt": "Evoke Collection, page 16. Design 10477: flowing brown and gold floral shapes.",
        "thumbnail": "/brochures/evoke/thumb-016.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-017.webp",
        "alt": "Evoke Collection, page 17. Design 10478: pale botanical relief on a weathered grey ground.",
        "thumbnail": "/brochures/evoke/thumb-017.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-018.webp",
        "alt": "Evoke Collection, page 18. Design 10479: gold medallions on blue and brown patchwork.",
        "thumbnail": "/brochures/evoke/thumb-018.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-019.webp",
        "alt": "Evoke Collection, page 19. Design 10480: a cream ornamental panel with a rust-coloured border.",
        "thumbnail": "/brochures/evoke/thumb-019.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-020.webp",
        "alt": "Evoke Collection, page 20. Design 10481: grey geometric shapes with fine linear textures.",
        "thumbnail": "/brochures/evoke/thumb-020.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-021.webp",
        "alt": "Evoke Collection, page 21. Design 10482: beige patchwork with carved botanical motifs.",
        "thumbnail": "/brochures/evoke/thumb-021.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-022.webp",
        "alt": "Evoke Collection, page 22. Design 10483: overlapping pale wooden bowl-like circles.",
        "thumbnail": "/brochures/evoke/thumb-022.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-023.webp",
        "alt": "Evoke Collection, page 23. Design 10484: angular golden ornament on a black ground.",
        "thumbnail": "/brochures/evoke/thumb-023.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-024.webp",
        "alt": "Evoke Collection, page 24. Design 10485: four long gold-coloured leaves on black.",
        "thumbnail": "/brochures/evoke/thumb-024.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-025.webp",
        "alt": "Evoke Collection, page 25. Design 10486: layered cream and brown geometric forms.",
        "thumbnail": "/brochures/evoke/thumb-025.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-026.webp",
        "alt": "Evoke Collection, page 26. Design 10487: a fine cream ornamental pattern on gold.",
        "thumbnail": "/brochures/evoke/thumb-026.webp",
        "width": 1272,
        "height": 1800
      },
      {
        "src": "/brochures/evoke/page-027.webp",
        "alt": "Evoke Collection, page 27. Design 10488: an intricate ivory scrolling botanical panel.",
        "thumbnail": "/brochures/evoke/thumb-027.webp",
        "width": 1272,
        "height": 1800
      }
    ]
  },
  {
    "id": "artful-surfaces",
    "title": "Artful Surfaces",
    "subtitle": "Nature, rendered in detail",
    "description": "A collection of decorative artwork, from luminous cranes and peacocks to botanical compositions.",
    "format": "Decorative collection",
    "pageCount": 15,
    "width": 900,
    "height": 1800,
    "cover": "/brochures/artful-surfaces/page-001.webp",
    "pdf": "/brochures/artful-surfaces/catalogue.pdf",
    "status": "ready",
    "sourceIssue": null,
    "pages": [
      {
        "src": "/brochures/artful-surfaces/page-001.webp",
        "alt": "Artful Surfaces, page 1. Two white cranes before a golden mosaic sun reflected in water.",
        "thumbnail": "/brochures/artful-surfaces/thumb-001.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/artful-surfaces/page-002.webp",
        "alt": "Artful Surfaces, page 2. A blue bird on dark branches before a pale mosaic moon.",
        "thumbnail": "/brochures/artful-surfaces/thumb-002.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/artful-surfaces/page-003.webp",
        "alt": "Artful Surfaces, page 3. A snowy mountain and riverside cabin framed by pink blossoms.",
        "thumbnail": "/brochures/artful-surfaces/thumb-003.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/artful-surfaces/page-004.webp",
        "alt": "Artful Surfaces, page 4. A seated Buddha beneath a fruit tree in a moonlit landscape.",
        "thumbnail": "/brochures/artful-surfaces/thumb-004.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/artful-surfaces/page-005.webp",
        "alt": "Artful Surfaces, page 5. Purple flowers and a twisting tree in an ornate golden frame.",
        "thumbnail": "/brochures/artful-surfaces/thumb-005.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/artful-surfaces/page-006.webp",
        "alt": "Artful Surfaces, page 6. A lakeside path, boat and cottage beneath a golden sun.",
        "thumbnail": "/brochures/artful-surfaces/thumb-006.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/artful-surfaces/page-007.webp",
        "alt": "Artful Surfaces, page 7. A cottage and garden path beneath a full moon.",
        "thumbnail": "/brochures/artful-surfaces/thumb-007.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/artful-surfaces/page-008.webp",
        "alt": "Artful Surfaces, page 8. A cream lotus surrounded by colourful jewel-like mosaic patterns.",
        "thumbnail": "/brochures/artful-surfaces/thumb-008.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/artful-surfaces/page-009.webp",
        "alt": "Artful Surfaces, page 9. White swans among water lilies before pale green mountains.",
        "thumbnail": "/brochures/artful-surfaces/thumb-009.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/artful-surfaces/page-010.webp",
        "alt": "Artful Surfaces, page 10. A dark sculptural face in profile against a golden circular background.",
        "thumbnail": "/brochures/artful-surfaces/thumb-010.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/artful-surfaces/page-011.webp",
        "alt": "Artful Surfaces, page 11. A seated musician holding a stringed instrument in a green garden.",
        "thumbnail": "/brochures/artful-surfaces/thumb-011.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/artful-surfaces/page-012.webp",
        "alt": "Artful Surfaces, page 12. Krishna playing a flute beside Radha in a moonlit garden.",
        "thumbnail": "/brochures/artful-surfaces/thumb-012.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/artful-surfaces/page-013.webp",
        "alt": "Artful Surfaces, page 13. A close-up tiger portrait in golden mosaic textures.",
        "thumbnail": "/brochures/artful-surfaces/thumb-013.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/artful-surfaces/page-014.webp",
        "alt": "Artful Surfaces, page 14. A white crane in a bamboo grove beside water lilies.",
        "thumbnail": "/brochures/artful-surfaces/thumb-014.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/artful-surfaces/page-015.webp",
        "alt": "Artful Surfaces, page 15. White flowers and flowing pale drapery around a golden sunset.",
        "thumbnail": "/brochures/artful-surfaces/thumb-015.webp",
        "width": 900,
        "height": 1800
      }
    ]
  },
  {
    "id": "new-poster",
    "title": "New Poster Collection",
    "subtitle": "A new perspective on walls",
    "description": "Expressive portraits, botanical details and sculptural compositions, collected as full-page decorative artwork.",
    "format": "Poster collection",
    "pageCount": 10,
    "width": 900,
    "height": 1800,
    "cover": "/brochures/new-poster/page-001.webp",
    "pdf": "/brochures/new-poster/catalogue.pdf",
    "status": "ready",
    "sourceIssue": null,
    "pages": [
      {
        "src": "/brochures/new-poster/page-001.webp",
        "alt": "New Poster Collection, page 1. A woman in a multicoloured patchwork dress surrounded by flying birds.",
        "thumbnail": "/brochures/new-poster/thumb-001.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/new-poster/page-002.webp",
        "alt": "New Poster Collection, page 2. Overlapping green, ochre and rust geometric shapes with circular motifs.",
        "thumbnail": "/brochures/new-poster/thumb-002.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/new-poster/page-003.webp",
        "alt": "New Poster Collection, page 3. Sculptural white flowers over flowing cream and grey marble-like textures.",
        "thumbnail": "/brochures/new-poster/thumb-003.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/new-poster/page-004.webp",
        "alt": "New Poster Collection, page 4. A winding red and yellow path between dark trees, a cabin and two figures.",
        "thumbnail": "/brochures/new-poster/thumb-004.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/new-poster/page-005.webp",
        "alt": "New Poster Collection, page 5. A sailboat and seabirds in warm golden light reflected on the water.",
        "thumbnail": "/brochures/new-poster/thumb-005.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/new-poster/page-006.webp",
        "alt": "New Poster Collection, page 6. Tall dark trees before a large orange moon and red rolling hills.",
        "thumbnail": "/brochures/new-poster/thumb-006.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/new-poster/page-007.webp",
        "alt": "New Poster Collection, page 7. A boat on a colourful canal between towers and bright autumn trees.",
        "thumbnail": "/brochures/new-poster/thumb-007.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/new-poster/page-008.webp",
        "alt": "New Poster Collection, page 8. A white tiger beneath a pale circular moon on an orange ground.",
        "thumbnail": "/brochures/new-poster/thumb-008.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/new-poster/page-009.webp",
        "alt": "New Poster Collection, page 9. Three figures, a small deer and a bird among golden leaves and flowers.",
        "thumbnail": "/brochures/new-poster/thumb-009.webp",
        "width": 900,
        "height": 1800
      },
      {
        "src": "/brochures/new-poster/page-010.webp",
        "alt": "New Poster Collection, page 10. A single feather with pale and dark halves against a softly shaded ground.",
        "thumbnail": "/brochures/new-poster/thumb-010.webp",
        "width": 900,
        "height": 1800
      }
    ]
  }
];
