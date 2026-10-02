export type SpaceId = "home" | "design" | "hospitality" | "workspace";

export type SpaceScene = {
  title: string;
  room: string;
  image: string;
  mobileImage?: string;
  alt: string;
  position?: string;
  mobilePosition?: string;
};

export type SpaceWorld = {
  id: SpaceId;
  audience: string;
  label: string;
  chapter: string;
  invitation: string;
  poster: string;
  posterAlt: string;
  projectType: string;
  application: string;
  cta: string;
  scenes: [SpaceScene, SpaceScene, SpaceScene, SpaceScene];
};

// Every entry is a separate interior. Source samples and prompts are in the asset register.
export const spaceWorlds: Record<SpaceId, SpaceWorld> = {
  home: {
    id: "home", audience: "For Homeowners", label: "Homes", chapter: "Spaces for living.",
    invitation: "A space that feels unmistakably yours.",
    poster: "/images/worlds/home-living.webp", posterAlt: "A diamond lattice tile wall in a sunlit living room concept.",
    projectType: "Residential", application: "Feature wall", cta: "Tell Us About Your Space",
    scenes: [
      { room: "The living room", title: "A little more you.", image: "/images/worlds/home-living.webp", alt: "Living room concept with a diamond lattice tile wall, olive-grey sofa and soft daylight.", position: "50% 50%", mobilePosition: "82% 50%" },
      { room: "The bathroom", title: "A private retreat.", image: "/images/worlds/home-bathroom.webp", alt: "Sculptural bathroom concept featuring the supplied ivory geometric tile panels.", mobilePosition: "82% 50%" },
      { room: "The dining room", title: "Made for gathering.", image: "/images/worlds/home-dining.webp", alt: "Elegant dining interior concept with a warm patterned tile feature wall.", mobilePosition: "18% 50%" },
      { room: "The bedroom", title: "A softer end to the day.", image: "/images/worlds/home-bedroom.webp", alt: "Refined bedroom concept with a ochre geometric tile wall and layered natural materials.", mobilePosition: "76% 50%" },
    ],
  },
  workspace: {
    id: "workspace", audience: "Offices & Workspaces", label: "Workspaces", chapter: "Spaces for work.",
    invitation: "A place with a point of view.",
    poster: "/images/worlds/workspace.webp", posterAlt: "A workplace reception concept with a geometric tile wall.",
    projectType: "Commercial", application: "Commercial space", cta: "Discuss Your Project",
    scenes: [
      { room: "The reception", title: "An arrival with character.", image: "/images/worlds/workspace.webp", alt: "Office reception concept with a warm angular tile wall and timber detailing.", mobilePosition: "90% 50%" },
      { room: "The meeting room", title: "Room for good ideas.", image: "/images/worlds/workspace-meeting.webp", alt: "Meeting room concept with an angular tile wall, long table and natural light.", mobilePosition: "92% 50%" },
      { room: "The executive office", title: "A considered perspective.", image: "/images/worlds/workspace-executive.webp", alt: "Executive office concept with a geometric tile feature wall and a sculptural desk.", position: "50% 49%", mobilePosition: "42% 50%" },
      { room: "The workplace lounge", title: "Space to reconnect.", image: "/images/worlds/workspace-lounge.webp", alt: "Sophisticated workplace lounge concept with geometric tiles and relaxed seating.", position: "50% 49%", mobilePosition: "20% 50%" },
    ],
  },
  hospitality: {
    id: "hospitality", audience: "Hospitality & Hotels", label: "Hospitality", chapter: "Spaces to remember.",
    invitation: "An arrival that stays with you.",
    poster: "/images/worlds/hospitality-arrival.webp", posterAlt: "A hotel arrival concept with the supplied Warm curves tile panel.",
    projectType: "Hospitality", application: "Commercial space", cta: "Discuss Your Project",
    scenes: [
      { room: "The hotel arrival", title: "A lasting first impression.", image: "/images/worlds/hospitality-arrival.webp", alt: "Hotel arrival concept with a curved travertine desk and warm patterned tile panel.", mobilePosition: "22% 50%" },
      { room: "The restaurant", title: "An evening to linger over.", image: "/images/worlds/hospitality-restaurant.webp", alt: "Fine dining restaurant concept with a signature patterned tile wall.", position: "50% 47%", mobilePosition: "53% 47%" },
      { room: "The private suite", title: "Somewhere to stay awhile.", image: "/images/worlds/hospitality-suite.webp", alt: "Luxury hotel suite concept with patterned tile panels and carefully composed furnishings.", position: "50% 49%", mobilePosition: "53% 47%" },
      { room: "The spa", title: "A moment of stillness.", image: "/images/worlds/hospitality-spa.webp", alt: "Serene spa concept with a sculptural tile wall and gentle architectural light.", position: "50% 47%", mobilePosition: "52% 46%" },
    ],
  },
  design: {
    id: "design", audience: "For Designers & Architects", label: "Designers", chapter: "Spaces for your vision.",
    invitation: "Your vision, translated into architectural detail.",
    poster: "/images/worlds/design-room.webp", posterAlt: "An architectural room study framing intricate ivory geometric panels.",
    projectType: "Art & collaboration", application: "Feature wall", cta: "Discuss Your Design Vision",
    scenes: [
      { room: "The architectural salon", title: "A language of your own.", image: "/images/worlds/design-room.webp", mobileImage: "/images/worlds/design-room-mobile.webp", alt: "Architectural salon concept with ivory geometric tile panels framed by warm plaster.", mobilePosition: "50% 50%" },
      { room: "The sculptural entrance", title: "Let the surface lead.", image: "/images/worlds/design-entrance.webp", alt: "Sculptural entrance concept with ivory geometric tile panels as the focal point.", mobilePosition: "24% 50%" },
      { room: "The private library", title: "Detail with depth.", image: "/images/worlds/design-library.webp", alt: "Architectural library concept with ivory geometric tile panels and bespoke shelving.", mobilePosition: "27% 50%" },
      { room: "The design atelier", title: "Your vision, given space.", image: "/images/worlds/design-atelier.webp", alt: "Design atelier concept featuring ivory geometric tile panels in an editorial architectural setting.", mobilePosition: "35% 50%" },
    ],
  },
};

export const spaceOrder: SpaceId[] = ["home", "workspace", "hospitality", "design"];

/** Visit each category once, beginning with the visitor's chosen doorway. */
export function journeyFrom(start: SpaceId) {
  const offset = spaceOrder.indexOf(start);
  return [...spaceOrder.slice(offset), ...spaceOrder.slice(0, offset)].map((id) => spaceWorlds[id]);
}



