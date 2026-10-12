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
  /** Printed dimensions only; null when the source does not establish a size. */
  format: string | null;
  sourcePdf: string;
  sourcePage: number;
  hotspot: BrochureHotspot;
  originalInterior?: { src: string; width: number; height: number; alt: string };
};

export const brochureProducts: BrochureProduct[] = [
  {
    "id": "evoke-10465",
    "brochureId": "evoke",
    "name": "Design 10465",
    "collection": "Evoke Collection",
    "description": "Layered terracotta leaves and small flowers.",
    "pageNumbers": [
      3,
      4
    ],
    "texture": "/brochures/products/evoke-10465.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 3,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    },
    "originalInterior": {
      "src": "/brochures/products/evoke-10465-original-interior.jpg",
      "width": 794,
      "height": 1123,
      "alt": "Supplied Evoke catalogue interior showing Design 10465 beside a timber entrance door and an ivory console table."
    }
  },
  {
    "id": "evoke-10466",
    "brochureId": "evoke",
    "name": "Design 10466",
    "collection": "Evoke Collection",
    "description": "Gold and brown ornamental scrollwork.",
    "pageNumbers": [
      5
    ],
    "texture": "/brochures/products/evoke-10466.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 5,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10467",
    "brochureId": "evoke",
    "name": "Design 10467",
    "collection": "Evoke Collection",
    "description": "Terracotta discs on a blue textured ground.",
    "pageNumbers": [
      6
    ],
    "texture": "/brochures/products/evoke-10467.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 6,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10468",
    "brochureId": "evoke",
    "name": "Design 10468",
    "collection": "Evoke Collection",
    "description": "Gold floral medallions on a dark brown ground.",
    "pageNumbers": [
      7
    ],
    "texture": "/brochures/products/evoke-10468.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 7,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10469",
    "brochureId": "evoke",
    "name": "Design 10469",
    "collection": "Evoke Collection",
    "description": "Golden leaves and butterflies on a cream ground.",
    "pageNumbers": [
      8
    ],
    "texture": "/brochures/products/evoke-10469.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 8,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10470",
    "brochureId": "evoke",
    "name": "Design 10470",
    "collection": "Evoke Collection",
    "description": "Grey ornamental motifs and geometric textures.",
    "pageNumbers": [
      9
    ],
    "texture": "/brochures/products/evoke-10470.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 9,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10471",
    "brochureId": "evoke",
    "name": "Design 10471",
    "collection": "Evoke Collection",
    "description": "Gold botanical ornament on ivory.",
    "pageNumbers": [
      10
    ],
    "texture": "/brochures/products/evoke-10471.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 10,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10472",
    "brochureId": "evoke",
    "name": "Design 10472",
    "collection": "Evoke Collection",
    "description": "Blue and rust patchwork with ornamental details.",
    "pageNumbers": [
      11
    ],
    "texture": "/brochures/products/evoke-10472.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 11,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10473",
    "brochureId": "evoke",
    "name": "Design 10473",
    "collection": "Evoke Collection",
    "description": "A gold circular medallion on black with patterned borders.",
    "pageNumbers": [
      12
    ],
    "texture": "/brochures/products/evoke-10473.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 12,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10474",
    "brochureId": "evoke",
    "name": "Design 10474",
    "collection": "Evoke Collection",
    "description": "Golden foliage on a pale textured ground.",
    "pageNumbers": [
      13
    ],
    "texture": "/brochures/products/evoke-10474.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 13,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10475",
    "brochureId": "evoke",
    "name": "Design 10475",
    "collection": "Evoke Collection",
    "description": "Curling branches and small blue flowers on beige.",
    "pageNumbers": [
      2,
      14
    ],
    "texture": "/brochures/products/evoke-10475.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 14,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10476",
    "brochureId": "evoke",
    "name": "Design 10476",
    "collection": "Evoke Collection",
    "description": "Intricate copper-coloured ornament over teal.",
    "pageNumbers": [
      15
    ],
    "texture": "/brochures/products/evoke-10476.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 15,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10477",
    "brochureId": "evoke",
    "name": "Design 10477",
    "collection": "Evoke Collection",
    "description": "Flowing brown and gold floral shapes.",
    "pageNumbers": [
      16
    ],
    "texture": "/brochures/products/evoke-10477.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 16,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10478",
    "brochureId": "evoke",
    "name": "Design 10478",
    "collection": "Evoke Collection",
    "description": "Pale botanical relief on a weathered grey ground.",
    "pageNumbers": [
      17
    ],
    "texture": "/brochures/products/evoke-10478.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 17,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10479",
    "brochureId": "evoke",
    "name": "Design 10479",
    "collection": "Evoke Collection",
    "description": "Gold medallions on blue and brown patchwork.",
    "pageNumbers": [
      18
    ],
    "texture": "/brochures/products/evoke-10479.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 18,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10480",
    "brochureId": "evoke",
    "name": "Design 10480",
    "collection": "Evoke Collection",
    "description": "A cream ornamental panel with a rust-coloured border.",
    "pageNumbers": [
      19
    ],
    "texture": "/brochures/products/evoke-10480.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 19,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10481",
    "brochureId": "evoke",
    "name": "Design 10481",
    "collection": "Evoke Collection",
    "description": "Grey geometric shapes with fine linear textures.",
    "pageNumbers": [
      20
    ],
    "texture": "/brochures/products/evoke-10481.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 20,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10482",
    "brochureId": "evoke",
    "name": "Design 10482",
    "collection": "Evoke Collection",
    "description": "Beige patchwork with carved botanical motifs.",
    "pageNumbers": [
      21
    ],
    "texture": "/brochures/products/evoke-10482.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 21,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10483",
    "brochureId": "evoke",
    "name": "Design 10483",
    "collection": "Evoke Collection",
    "description": "Overlapping pale wooden bowl-like circles.",
    "pageNumbers": [
      22
    ],
    "texture": "/brochures/products/evoke-10483.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 22,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10484",
    "brochureId": "evoke",
    "name": "Design 10484",
    "collection": "Evoke Collection",
    "description": "Angular golden ornament on a black ground.",
    "pageNumbers": [
      23
    ],
    "texture": "/brochures/products/evoke-10484.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 23,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10485",
    "brochureId": "evoke",
    "name": "Design 10485",
    "collection": "Evoke Collection",
    "description": "Four long gold-coloured leaves on black.",
    "pageNumbers": [
      24
    ],
    "texture": "/brochures/products/evoke-10485.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 24,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10486",
    "brochureId": "evoke",
    "name": "Design 10486",
    "collection": "Evoke Collection",
    "description": "Layered cream and brown geometric forms.",
    "pageNumbers": [
      25
    ],
    "texture": "/brochures/products/evoke-10486.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 25,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10487",
    "brochureId": "evoke",
    "name": "Design 10487",
    "collection": "Evoke Collection",
    "description": "A fine cream ornamental pattern on gold.",
    "pageNumbers": [
      26
    ],
    "texture": "/brochures/products/evoke-10487.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 26,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
  {
    "id": "evoke-10488",
    "brochureId": "evoke",
    "name": "Design 10488",
    "collection": "Evoke Collection",
    "description": "An intricate ivory scrolling botanical panel.",
    "pageNumbers": [
      27
    ],
    "texture": "/brochures/products/evoke-10488.webp",
    "textureWidth": 383,
    "textureHeight": 766,
    "format": "1200 × 2400 mm",
    "sourcePdf": "/brochures/evoke/catalogue.pdf",
    "sourcePage": 27,
    "hotspot": {
      "x": 0.25878627,
      "y": 0.14439976,
      "width": 0.48138047,
      "height": 0.68096678
    }
  },
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
  if (product.id === "evoke-10475" && pageIndex === 1) {
    return { x: 0.32, y: 0.356, width: 0.36, height: 0.51 };
  }
  if (product.id === "evoke-10465" && pageIndex === 3) {
    return { x: 0.336, y: 0.03, width: 0.518, height: 0.774 };
  }
  return product.hotspot;
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
