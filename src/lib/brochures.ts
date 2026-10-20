import surfaceStudiesPublication from "../../public/brochures/surface-studies/publication.json";

/** Publication metadata; see docs/brochure-assets.md for source and build details. */
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
  surfaceStudiesPublication.brochure as Brochure,
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
