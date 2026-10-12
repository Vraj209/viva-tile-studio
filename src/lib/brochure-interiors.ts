export type InteriorEnvironment = "home" | "hotel" | "office";

type InteriorComposition = {
  src: string;
  width: number;
  height: number;
  /** Unobstructed wall surface, measured in fractions of the room image. */
  surface: { x: number; y: number; width: number; height: number };
};

export type InteriorRoom = InteriorComposition & {
  label: string;
  title: string;
  mobile?: InteriorComposition;
};

/** The product itself is rendered from the original PDF image, never regenerated. */
export const interiorRooms: Record<InteriorEnvironment, InteriorRoom> = {
  home: {
    label: "Home", title: "A considered living room",
    src: "/images/brochure-interiors/home.webp", width: 1536, height: 1024,
    surface: { x: 603 / 1536, y: 43 / 1024, width: 351 / 1536, height: 702 / 1024 },
    mobile: { src: "/images/brochure-interiors/home-mobile.webp", width: 1024, height: 1536,
      surface: { x: 340 / 1024, y: 140 / 1536, width: 440 / 1024, height: 880 / 1536 } },
  },
  hotel: {
    label: "Hotel", title: "An arrival with character",
    src: "/images/brochure-interiors/hotel.webp", width: 1536, height: 1024,
    surface: { x: 588 / 1536, y: 23 / 1024, width: 350 / 1536, height: 700 / 1024 },
    mobile: { src: "/images/brochure-interiors/hotel-mobile.webp", width: 1024, height: 1536,
      surface: { x: 302 / 1024, y: 110 / 1536, width: 420 / 1024, height: 840 / 1536 } },
  },
  office: {
    label: "Office", title: "A welcoming reception",
    src: "/images/brochure-interiors/office.webp", width: 1536, height: 1024,
    surface: { x: 604 / 1536, y: 51 / 1024, width: 327 / 1536, height: 654 / 1024 },
    mobile: { src: "/images/brochure-interiors/office-mobile.webp", width: 1024, height: 1536,
      surface: { x: 302 / 1024, y: 130 / 1536, width: 420 / 1024, height: 840 / 1536 } },
  },
};
