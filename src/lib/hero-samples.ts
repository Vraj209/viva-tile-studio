/** Original tile concepts; labels describe artwork, not verified product names. */
export type HeroSample = {
  id: string;
  label: string;
  src: string;
  /** All hero concepts share the same square intrinsic dimensions. */
  width: number;
  height: number;
  alt: string;
};

/** Composition order from the supporting samples to the foreground sample. */
export const heroSamples: HeroSample[] = [
  {
    id: "ivory-tides",
    label: "Ivory tides",
    src: "/images/hero/ivory-tides.webp",
    width: 768,
    height: 768,
    alt: "Original tile concept with sweeping sculptural waves and flowing ribs in warm ivory ceramic.",
  },
  {
    id: "sage-ginkgo",
    label: "Sage ginkgo",
    src: "/images/hero/sage-ginkgo.webp",
    width: 768,
    height: 768,
    alt: "Original tile concept with three finely veined ginkgo leaves in shallow relief on muted sage ceramic.",
  },
  {
    id: "mineral-strata",
    label: "Mineral strata",
    src: "/images/hero/mineral-strata.webp",
    width: 768,
    height: 768,
    alt: "Original tile concept with softly undulating horizontal mineral strata in warm grey and taupe ceramic.",
  },
  {
    id: "terracotta-orbit",
    label: "Terracotta orbit",
    src: "/images/hero/terracotta-orbit.webp",
    width: 768,
    height: 768,
    alt: "Original tile concept with nested circular arcs, a broad half-disc and fine grooves in dusty terracotta ceramic.",
  },
  {
    id: "celadon-fan",
    label: "Celadon fan",
    src: "/images/hero/celadon-fan.webp",
    width: 768,
    height: 768,
    alt: "Original tile concept with overlapping fluted Art Deco fan arches in pale celadon ceramic relief.",
  },
  {
    id: "forest-magnolia",
    label: "Forest magnolia",
    src: "/images/hero/forest-magnolia.webp",
    width: 768,
    height: 768,
    alt: "Original tile concept with two ivory magnolia blossoms and olive leaves in relief on deep forest-green ceramic.",
  },
];
