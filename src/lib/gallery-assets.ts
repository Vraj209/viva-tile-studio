/** Prepared from owner-supplied data/ imagery. Labels describe visible content only. */
export type GalleryRelatedImage = {
  image: string;
  alt: string;
  label: string;
  width: number;
  height: number;
};

export type GalleryAsset = {
  id: string;
  label: string;
  category: "Sample image" | "Sample photograph";
  description: string;
  alt: string;
  thumbnail: string;
  image: string;
  /** Intrinsic browse-image dimensions; preserve this ratio on the sample object. */
  width: number;
  height: number;
  imageWidth: number;
  imageHeight: number;
  source: string;
  related: GalleryRelatedImage[];
};

// Regenerate with: node scripts/prepare-gallery-assets.mjs
export const galleryAssets: GalleryAsset[] = [
  {
    "id": "amber-butterfly",
    "label": "Amber butterfly",
    "category": "Sample image",
    "description": "An orange butterfly against a dark blue, textured ground.",
    "alt": "Portrait sample image of an amber-orange butterfly with spread wings against a dark blue textured background.",
    "thumbnail": "/images/gallery/amber-butterfly-browse.webp",
    "image": "/images/gallery/amber-butterfly-inspect.webp",
    "width": 512,
    "height": 640,
    "imageWidth": 1122,
    "imageHeight": 1402,
    "source": "data/landscape/L_1.png",
    "related": []
  },
  {
    "id": "ivory-geometry",
    "label": "Ivory geometry",
    "category": "Sample image",
    "description": "Two cream panels with contrasting diamond and triangle patterns.",
    "alt": "Square sample image showing two cream geometric panels with repeating diamond and triangle patterns.",
    "thumbnail": "/images/gallery/ivory-geometry-browse.webp",
    "image": "/images/gallery/ivory-geometry-inspect.webp",
    "width": 640,
    "height": 640,
    "imageWidth": 1254,
    "imageHeight": 1254,
    "source": "data/landscape/L_2.png",
    "related": []
  },
  {
    "id": "courtyard-fountain",
    "label": "Courtyard fountain",
    "category": "Sample image",
    "description": "A turquoise arched fountain framed by flowering branches.",
    "alt": "Portrait sample image of a turquoise arched fountain surrounded by flowering branches.",
    "thumbnail": "/images/gallery/courtyard-fountain-browse.webp",
    "image": "/images/gallery/courtyard-fountain-inspect.webp",
    "width": 512,
    "height": 640,
    "imageWidth": 1122,
    "imageHeight": 1402,
    "source": "data/landscape/L_3.png",
    "related": []
  },
  {
    "id": "coastal-window",
    "label": "Coastal window",
    "category": "Sample image",
    "description": "Blue waves and golden conifers within a circular, wood-like frame.",
    "alt": "Landscape sample image of blue waves and golden conifers within a circular frame resembling curling driftwood.",
    "thumbnail": "/images/gallery/coastal-window-browse.webp",
    "image": "/images/gallery/coastal-window-inspect.webp",
    "width": 640,
    "height": 480,
    "imageWidth": 1448,
    "imageHeight": 1086,
    "source": "data/landscape/L_4.png",
    "related": []
  },
  {
    "id": "white-tiger",
    "label": "White tiger",
    "category": "Sample image",
    "description": "A white tiger nestled among pale roses and gold-coloured foliage.",
    "alt": "Landscape sample image of a white tiger among pale roses and curling gold-coloured foliage.",
    "thumbnail": "/images/gallery/white-tiger-browse.webp",
    "image": "/images/gallery/white-tiger-inspect.webp",
    "width": 640,
    "height": 480,
    "imageWidth": 1448,
    "imageHeight": 1086,
    "source": "data/landscape/L_5.png",
    "related": []
  },
  {
    "id": "floral-elephant",
    "label": "Floral elephant",
    "category": "Sample image",
    "description": "A white elephant in profile, surrounded by cream flowers and golden leaves.",
    "alt": "Landscape sample image of a white elephant in profile surrounded by cream flowers and gold-coloured leaves.",
    "thumbnail": "/images/gallery/floral-elephant-browse.webp",
    "image": "/images/gallery/floral-elephant-inspect.webp",
    "width": 640,
    "height": 480,
    "imageWidth": 1448,
    "imageHeight": 1086,
    "source": "data/landscape/L_6.png",
    "related": []
  },
  {
    "id": "liquid-gold",
    "label": "Liquid gold",
    "category": "Sample image",
    "description": "A golden face with flowing splash shapes on a black ground.",
    "alt": "Portrait sample image of a gold-coloured face surrounded by flowing liquid-like splashes against black.",
    "thumbnail": "/images/gallery/liquid-gold-browse.webp",
    "image": "/images/gallery/liquid-gold-inspect.webp",
    "width": 512,
    "height": 640,
    "imageWidth": 1122,
    "imageHeight": 1402,
    "source": "data/potraite/P_1.png",
    "related": []
  },
  {
    "id": "sunshine-owl",
    "label": "Sunshine owl",
    "category": "Sample image",
    "description": "A white owl on a branch, with a golden sun and flowing ochre landscape.",
    "alt": "Portrait sample image of a white owl perched on a branch before a golden sun and flowing ochre landscape.",
    "thumbnail": "/images/gallery/sunshine-owl-browse.webp",
    "image": "/images/gallery/sunshine-owl-inspect.webp",
    "width": 512,
    "height": 640,
    "imageWidth": 1122,
    "imageHeight": 1402,
    "source": "data/potraite/P_2.png",
    "related": []
  },
  {
    "id": "woodland-muse",
    "label": "Woodland muse",
    "category": "Sample image",
    "description": "A serene face framed by curling wood-like forms and green leaves.",
    "alt": "Portrait sample image of a serene face framed by curling wood-like forms and green leaves against a stone-like ground.",
    "thumbnail": "/images/gallery/woodland-muse-browse.webp",
    "image": "/images/gallery/woodland-muse-inspect.webp",
    "width": 512,
    "height": 640,
    "imageWidth": 1122,
    "imageHeight": 1402,
    "source": "data/potraite/P_3.png",
    "related": []
  },
  {
    "id": "island-footprint",
    "label": "Island footprint",
    "category": "Sample image",
    "description": "A footprint-shaped beach scene with palms, sea and a sailboat.",
    "alt": "Portrait sample image of a footprint-shaped tropical beach scene containing palms, blue sea and a sailboat.",
    "thumbnail": "/images/gallery/island-footprint-browse.webp",
    "image": "/images/gallery/island-footprint-inspect.webp",
    "width": 512,
    "height": 640,
    "imageWidth": 1122,
    "imageHeight": 1402,
    "source": "data/potraite/P_4.png",
    "related": []
  },
  {
    "id": "savannah-elephant",
    "label": "Savannah elephant",
    "category": "Sample image",
    "description": "An elephant facing forward, with acacia trees in cream and ochre.",
    "alt": "Portrait sample image of a front-facing elephant with acacia trees in a cream and ochre landscape.",
    "thumbnail": "/images/gallery/savannah-elephant-browse.webp",
    "image": "/images/gallery/savannah-elephant-inspect.webp",
    "width": 512,
    "height": 640,
    "imageWidth": 1122,
    "imageHeight": 1402,
    "source": "data/potraite/P_5.png",
    "related": []
  },
  {
    "id": "opal-lotus",
    "label": "Opal lotus",
    "category": "Sample image",
    "description": "An iridescent lotus with golden branches and butterflies on dark teal.",
    "alt": "Portrait sample image of an iridescent lotus on a dark teal centre, framed by gold-coloured branches and butterflies.",
    "thumbnail": "/images/gallery/opal-lotus-browse.webp",
    "image": "/images/gallery/opal-lotus-inspect.webp",
    "width": 512,
    "height": 640,
    "imageWidth": 1122,
    "imageHeight": 1402,
    "source": "data/potraite/P_6.png",
    "related": []
  },
  {
    "id": "golden-krishna",
    "label": "Golden Krishna",
    "category": "Sample image",
    "description": "Child Krishna embracing a white calf beneath a golden arch.",
    "alt": "Portrait sample image depicting child Krishna embracing a white calf beneath a gold-coloured arch.",
    "thumbnail": "/images/gallery/golden-krishna-browse.webp",
    "image": "/images/gallery/golden-krishna-inspect.webp",
    "width": 512,
    "height": 640,
    "imageWidth": 1122,
    "imageHeight": 1402,
    "source": "data/potraite/P_7.png",
    "related": []
  },
  {
    "id": "ocean-dolphins",
    "label": "Ocean dolphins",
    "category": "Sample image",
    "description": "Three blue dolphins above foaming waves and pale rocks.",
    "alt": "Portrait sample image of three blue dolphins leaping above foaming waves and pale rocks.",
    "thumbnail": "/images/gallery/ocean-dolphins-browse.webp",
    "image": "/images/gallery/ocean-dolphins-inspect.webp",
    "width": 512,
    "height": 640,
    "imageWidth": 1122,
    "imageHeight": 1402,
    "source": "data/potraite/P_8.png",
    "related": []
  },
  {
    "id": "sunset-retreat",
    "label": "Sunset retreat",
    "category": "Sample image",
    "description": "A palm and thatched hut framed by a dark, flowing shape at sunset.",
    "alt": "Portrait sample image of a palm and thatched hut within a dark organic shape against an orange sunset.",
    "thumbnail": "/images/gallery/sunset-retreat-browse.webp",
    "image": "/images/gallery/sunset-retreat-inspect.webp",
    "width": 512,
    "height": 640,
    "imageWidth": 1122,
    "imageHeight": 1402,
    "source": "data/potraite/P_9.png",
    "related": []
  },
  {
    "id": "coconut-hideaway",
    "label": "Coconut hideaway",
    "category": "Sample image",
    "description": "A tropical hut and palms nestled inside a split coconut on blue.",
    "alt": "Portrait sample image of a thatched tropical hut and palms inside a split coconut against a blue background.",
    "thumbnail": "/images/gallery/coconut-hideaway-browse.webp",
    "image": "/images/gallery/coconut-hideaway-inspect.webp",
    "width": 512,
    "height": 640,
    "imageWidth": 1122,
    "imageHeight": 1402,
    "source": "data/potraite/P_10.png",
    "related": []
  },
  {
    "id": "peacock-scrolls",
    "label": "Peacock scrolls",
    "category": "Sample image",
    "description": "A teal and blue peacock with ornamental golden curls on mustard.",
    "alt": "Tall sample image of a teal and blue peacock surrounded by ornamental gold-coloured curls on a mustard ground.",
    "thumbnail": "/images/gallery/peacock-scrolls-browse.webp",
    "image": "/images/gallery/peacock-scrolls-inspect.webp",
    "width": 384,
    "height": 640,
    "imageWidth": 565,
    "imageHeight": 941,
    "source": "data/potraite/P_11.png",
    "related": []
  },
  {
    "id": "shoreline-sunset",
    "label": "Shoreline sunset",
    "category": "Sample image",
    "description": "A small blue boat, bamboo and a wooden hut beneath a vivid sunset.",
    "alt": "Tall sample image of a small blue boat on a beach with bamboo and a wooden hut beneath a vivid sunset.",
    "thumbnail": "/images/gallery/shoreline-sunset-browse.webp",
    "image": "/images/gallery/shoreline-sunset-inspect.webp",
    "width": 362,
    "height": 640,
    "imageWidth": 532,
    "imageHeight": 941,
    "source": "data/potraite/P_12.png",
    "related": []
  },
  {
    "id": "luminous-lotus",
    "label": "Luminous lotus",
    "category": "Sample image",
    "description": "Pale glowing lotus blooms within a curved, dark wood-like frame.",
    "alt": "Tall sample image of pale glowing lotus blooms enclosed by a curved dark frame resembling wood.",
    "thumbnail": "/images/gallery/luminous-lotus-browse.webp",
    "image": "/images/gallery/luminous-lotus-inspect.webp",
    "width": 384,
    "height": 640,
    "imageWidth": 565,
    "imageHeight": 941,
    "source": "data/potraite/p_13.png",
    "related": []
  },
  {
    "id": "acacia-watch",
    "label": "Acacia watch",
    "category": "Sample image",
    "description": "A spotted cat perched beneath an acacia canopy in cream and tan.",
    "alt": "Portrait sample image of a spotted cat perched on a tree beneath an acacia canopy in cream and tan.",
    "thumbnail": "/images/gallery/acacia-watch-browse.webp",
    "image": "/images/gallery/acacia-watch-inspect.webp",
    "width": 427,
    "height": 640,
    "imageWidth": 1024,
    "imageHeight": 1536,
    "source": "data/potraite/P_14.png",
    "related": []
  }
];
