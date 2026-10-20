import surfaceStudiesPublication from "../../public/brochures/surface-studies/publication.json";

/** Exact owner-supplied artwork. Regenerate with scripts/prepare-brochure-products.py. */
export type BrochureHotspot = { x: number; y: number; width: number; height: number };

export type BrochureProduct = {
  id: string;
  brochureId: string;
  /** Printed design code, or a descriptive artwork label when no code is supplied. */
  name: string;
  collection: string;
  description: string;
  /** One-based brochure pages that depict this exact design. */
  pageNumbers: number[];
  texture: string;
  textureWidth: number;
  textureHeight: number;
  /** Confirmed product dimensions only; null until verified for the VAVI product. */
  format: string | null;
  sourcePdf: string;
  sourcePage: number;
  hotspot: BrochureHotspot;
  originalInterior?: { src: string; width: number; height: number; alt: string };
};

const publicationHotspots: Record<string, Record<string, BrochureHotspot>> = surfaceStudiesPublication.hotspots;

export const brochureProducts: BrochureProduct[] = [
  ...surfaceStudiesPublication.products,
  {
    "id": "artful-surfaces-01",
    "brochureId": "artful-surfaces",
    "name": "Golden cranes",
    "collection": "Artful Surfaces",
    "description": "Two white cranes before a golden mosaic sun reflected in water.",
    "pageNumbers": [
      1
    ],
    "texture": "/brochures/products/artful-surfaces-01.jpg",
    "textureWidth": 1770,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/artful-surfaces/catalogue.pdf",
    "sourcePage": 1,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "artful-surfaces-02",
    "brochureId": "artful-surfaces",
    "name": "Moonlit bluebird",
    "collection": "Artful Surfaces",
    "description": "A blue bird on dark branches before a pale mosaic moon.",
    "pageNumbers": [
      2
    ],
    "texture": "/brochures/products/artful-surfaces-02.jpg",
    "textureWidth": 1771,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/artful-surfaces/catalogue.pdf",
    "sourcePage": 2,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "artful-surfaces-03",
    "brochureId": "artful-surfaces",
    "name": "Alpine blossom",
    "collection": "Artful Surfaces",
    "description": "A snowy mountain and riverside cabin framed by pink blossoms.",
    "pageNumbers": [
      3
    ],
    "texture": "/brochures/products/artful-surfaces-03.jpg",
    "textureWidth": 1771,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/artful-surfaces/catalogue.pdf",
    "sourcePage": 3,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "artful-surfaces-04",
    "brochureId": "artful-surfaces",
    "name": "Moonlit Buddha",
    "collection": "Artful Surfaces",
    "description": "A seated Buddha beneath a fruit tree in a moonlit landscape.",
    "pageNumbers": [
      4
    ],
    "texture": "/brochures/products/artful-surfaces-04.jpg",
    "textureWidth": 1771,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/artful-surfaces/catalogue.pdf",
    "sourcePage": 4,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "artful-surfaces-05",
    "brochureId": "artful-surfaces",
    "name": "Golden garden",
    "collection": "Artful Surfaces",
    "description": "Purple flowers and a twisting tree in an ornate golden frame.",
    "pageNumbers": [
      5
    ],
    "texture": "/brochures/products/artful-surfaces-05.jpg",
    "textureWidth": 1771,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/artful-surfaces/catalogue.pdf",
    "sourcePage": 5,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "artful-surfaces-06",
    "brochureId": "artful-surfaces",
    "name": "Lakeside sunlight",
    "collection": "Artful Surfaces",
    "description": "A lakeside path, boat and cottage beneath a golden sun.",
    "pageNumbers": [
      6
    ],
    "texture": "/brochures/products/artful-surfaces-06.jpg",
    "textureWidth": 1771,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/artful-surfaces/catalogue.pdf",
    "sourcePage": 6,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "artful-surfaces-07",
    "brochureId": "artful-surfaces",
    "name": "Moonlit cottage",
    "collection": "Artful Surfaces",
    "description": "A cottage and garden path beneath a full moon.",
    "pageNumbers": [
      7
    ],
    "texture": "/brochures/products/artful-surfaces-07.jpg",
    "textureWidth": 1771,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/artful-surfaces/catalogue.pdf",
    "sourcePage": 7,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "artful-surfaces-08",
    "brochureId": "artful-surfaces",
    "name": "Jewel lotus",
    "collection": "Artful Surfaces",
    "description": "A cream lotus surrounded by colourful jewel-like mosaic patterns.",
    "pageNumbers": [
      8
    ],
    "texture": "/brochures/products/artful-surfaces-08.jpg",
    "textureWidth": 1771,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/artful-surfaces/catalogue.pdf",
    "sourcePage": 8,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "artful-surfaces-09",
    "brochureId": "artful-surfaces",
    "name": "Mountain swans",
    "collection": "Artful Surfaces",
    "description": "White swans among water lilies before pale green mountains.",
    "pageNumbers": [
      9
    ],
    "texture": "/brochures/products/artful-surfaces-09.jpg",
    "textureWidth": 1771,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/artful-surfaces/catalogue.pdf",
    "sourcePage": 9,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "artful-surfaces-10",
    "brochureId": "artful-surfaces",
    "name": "Golden profile",
    "collection": "Artful Surfaces",
    "description": "A dark sculptural face in profile against a golden circular background.",
    "pageNumbers": [
      10
    ],
    "texture": "/brochures/products/artful-surfaces-10.jpg",
    "textureWidth": 1771,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/artful-surfaces/catalogue.pdf",
    "sourcePage": 10,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "artful-surfaces-11",
    "brochureId": "artful-surfaces",
    "name": "Garden musician",
    "collection": "Artful Surfaces",
    "description": "A seated musician holding a stringed instrument in a green garden.",
    "pageNumbers": [
      11
    ],
    "texture": "/brochures/products/artful-surfaces-11.jpg",
    "textureWidth": 1771,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/artful-surfaces/catalogue.pdf",
    "sourcePage": 11,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "artful-surfaces-12",
    "brochureId": "artful-surfaces",
    "name": "Radha and Krishna",
    "collection": "Artful Surfaces",
    "description": "Krishna playing a flute beside Radha in a moonlit garden.",
    "pageNumbers": [
      12
    ],
    "texture": "/brochures/products/artful-surfaces-12.jpg",
    "textureWidth": 1771,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/artful-surfaces/catalogue.pdf",
    "sourcePage": 12,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "artful-surfaces-13",
    "brochureId": "artful-surfaces",
    "name": "Mosaic tiger",
    "collection": "Artful Surfaces",
    "description": "A close-up tiger portrait in golden mosaic textures.",
    "pageNumbers": [
      13
    ],
    "texture": "/brochures/products/artful-surfaces-13.jpg",
    "textureWidth": 1771,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/artful-surfaces/catalogue.pdf",
    "sourcePage": 13,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "artful-surfaces-14",
    "brochureId": "artful-surfaces",
    "name": "Bamboo crane",
    "collection": "Artful Surfaces",
    "description": "A white crane in a bamboo grove beside water lilies.",
    "pageNumbers": [
      14
    ],
    "texture": "/brochures/products/artful-surfaces-14.jpg",
    "textureWidth": 1771,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/artful-surfaces/catalogue.pdf",
    "sourcePage": 14,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "artful-surfaces-15",
    "brochureId": "artful-surfaces",
    "name": "Sunset drapery",
    "collection": "Artful Surfaces",
    "description": "White flowers and flowing pale drapery around a golden sunset.",
    "pageNumbers": [
      15
    ],
    "texture": "/brochures/products/artful-surfaces-15.jpg",
    "textureWidth": 1771,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/artful-surfaces/catalogue.pdf",
    "sourcePage": 15,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "new-poster-01",
    "brochureId": "new-poster",
    "name": "Birds in flight",
    "collection": "New Poster Collection",
    "description": "A woman in a multicoloured patchwork dress surrounded by flying birds.",
    "pageNumbers": [
      1
    ],
    "texture": "/brochures/products/new-poster-01.jpg",
    "textureWidth": 1770,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/new-poster/catalogue.pdf",
    "sourcePage": 1,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "new-poster-02",
    "brochureId": "new-poster",
    "name": "Circular composition",
    "collection": "New Poster Collection",
    "description": "Overlapping green, ochre and rust geometric shapes with circular motifs.",
    "pageNumbers": [
      2
    ],
    "texture": "/brochures/products/new-poster-02.jpg",
    "textureWidth": 1770,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/new-poster/catalogue.pdf",
    "sourcePage": 2,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "new-poster-03",
    "brochureId": "new-poster",
    "name": "Flowing florals",
    "collection": "New Poster Collection",
    "description": "Sculptural white flowers over flowing cream and grey marble-like textures.",
    "pageNumbers": [
      3
    ],
    "texture": "/brochures/products/new-poster-03.jpg",
    "textureWidth": 1770,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/new-poster/catalogue.pdf",
    "sourcePage": 3,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "new-poster-04",
    "brochureId": "new-poster",
    "name": "Woodland path",
    "collection": "New Poster Collection",
    "description": "A winding red and yellow path between dark trees, a cabin and two figures.",
    "pageNumbers": [
      4
    ],
    "texture": "/brochures/products/new-poster-04.jpg",
    "textureWidth": 1770,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/new-poster/catalogue.pdf",
    "sourcePage": 4,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "new-poster-05",
    "brochureId": "new-poster",
    "name": "Golden sail",
    "collection": "New Poster Collection",
    "description": "A sailboat and seabirds in warm golden light reflected on the water.",
    "pageNumbers": [
      5
    ],
    "texture": "/brochures/products/new-poster-05.jpg",
    "textureWidth": 1770,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/new-poster/catalogue.pdf",
    "sourcePage": 5,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "new-poster-06",
    "brochureId": "new-poster",
    "name": "Autumn moon",
    "collection": "New Poster Collection",
    "description": "Tall dark trees before a large orange moon and red rolling hills.",
    "pageNumbers": [
      6
    ],
    "texture": "/brochures/products/new-poster-06.jpg",
    "textureWidth": 1770,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/new-poster/catalogue.pdf",
    "sourcePage": 6,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "new-poster-07",
    "brochureId": "new-poster",
    "name": "Colourful canal",
    "collection": "New Poster Collection",
    "description": "A boat on a colourful canal between towers and bright autumn trees.",
    "pageNumbers": [
      7
    ],
    "texture": "/brochures/products/new-poster-07.jpg",
    "textureWidth": 1770,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/new-poster/catalogue.pdf",
    "sourcePage": 7,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "new-poster-08",
    "brochureId": "new-poster",
    "name": "Moonlit tiger",
    "collection": "New Poster Collection",
    "description": "A white tiger beneath a pale circular moon on an orange ground.",
    "pageNumbers": [
      8
    ],
    "texture": "/brochures/products/new-poster-08.jpg",
    "textureWidth": 1770,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/new-poster/catalogue.pdf",
    "sourcePage": 8,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "new-poster-09",
    "brochureId": "new-poster",
    "name": "Golden figures",
    "collection": "New Poster Collection",
    "description": "Three figures, a small deer and a bird among golden leaves and flowers.",
    "pageNumbers": [
      9
    ],
    "texture": "/brochures/products/new-poster-09.jpg",
    "textureWidth": 1770,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/new-poster/catalogue.pdf",
    "sourcePage": 9,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  },
  {
    "id": "new-poster-10",
    "brochureId": "new-poster",
    "name": "Feather study",
    "collection": "New Poster Collection",
    "description": "A single feather with pale and dark halves against a softly shaded ground.",
    "pageNumbers": [
      10
    ],
    "texture": "/brochures/products/new-poster-10.jpg",
    "textureWidth": 1770,
    "textureHeight": 3542,
    "format": null,
    "sourcePdf": "/brochures/new-poster/catalogue.pdf",
    "sourcePage": 10,
    "hotspot": {
      "x": 0,
      "y": 0,
      "width": 1,
      "height": 1
    }
  }
];

/** Reader indices are zero-based; the provenance records use printed page numbers. */
export function getBrochureProduct(brochureId: string, pageIndex: number): BrochureProduct | undefined {
  return brochureProducts.find((product) => product.brochureId === brochureId && product.pageNumbers.includes(pageIndex + 1));
}

/** Introductory/room pages place the same product differently from its sample page. */
export function getBrochureProductHotspot(product: BrochureProduct, pageIndex: number): BrochureHotspot {
  return publicationHotspots[product.id]?.[String(pageIndex + 1)] ?? product.hotspot;
}

export function getProductEnquiryHref(product: BrochureProduct, environment: "home" | "hotel" | "office"): string {
  const projectTypes = { home: "Residential", hotel: "Hospitality", office: "Commercial" };
  const params = new URLSearchParams({
    product: product.id,
    projectType: projectTypes[environment],
    application: "Feature wall",
  });
  return `/?${params.toString()}#enquiry`;
}
