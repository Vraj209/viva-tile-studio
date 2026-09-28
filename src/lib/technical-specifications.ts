export type SpecificationRow = {
  label: string;
  value: string;
  note?: string;
  items?: readonly string[];
};

export type SpecificationGroup = {
  id: string;
  number: string;
  title: string;
  introduction?: string;
  rows: readonly SpecificationRow[];
  restriction?: string;
};

// Public, source-attributed copy only. Unresolved evidence and manufacturer
// questions belong in docs/technical-clarifications.md, never in this module.
export const technicalDetails = {
  construction: "Handmade, high-relief designer tiles.",
  bodies: "Ceramic and porcelain bodies are listed in the supplied datasheet.",
  formats: [
    "20 × 20 cm",
    "30 × 30 cm",
    "60 × 60 cm",
    "90 × 60 cm",
    "160 × 80 cm",
    "120 × 60 cm",
    "240 × 120 cm",
  ],
  thickness: "8–9 mm",
  thicknessNote:
    "Confirm whether this includes the relief profile for your selected product.",
  availability:
    "Confirm the available body, finish and collection for each format before ordering.",
  weight:
    "Weight depends on the selected size and is supplied in the packing list. Request product-specific weight and packing details before ordering.",
  origin: "Made in India.",
  waterAbsorption: [
    "Vitrified body: below 0.5%.",
    "High-density decorative ceramic body: below 3%.",
  ],
  hardness: "Mohs hardness: 5–6, as stated in the supplied datasheet.",
  exterior:
    "Exterior applications require project-specific confirmation of the selected product and installation system.",
  poolside:
    "The datasheet describes feature walls and water-feature backdrops near pools. Confirm splash, moisture and chemical exposure for the selected product.",
  poolRestriction: "Not recommended for use inside active pool tanks.",
  adhesive: "High-bond polymer-modified tile adhesive, Class C2TE.",
  grout:
    "Epoxy grout or non-shrink polymer grout. The source recommends a “minimum 2–3 mm” tile spacer; confirm the joint width for the selected tile and installation.",
  anchoring:
    "Mechanical anchoring / dry cladding is recommended in the source for high-rise exterior installations. A qualified project specialist must determine whether anchoring is required and specify the complete system.",
  installationNote:
    "These are recommendations from the supplied datasheet. Confirm the substrate, selected tile, exposure and complete installation system with a qualified project specialist; this information does not replace project-specific installation design.",
  care: "Clean with a soft brush or microfiber cloth and mild detergent. Confirm cleaner compatibility with the selected glaze and finish.",
} as const;

export const technicalDownload = {
  href: "/downloads/technical-datasheet.docx",
  filename: "technical-datasheet.docx",
  label: "Download Technical Datasheet (DOCX)",
  note: "Supplied source datasheet. Exterior-use conditions and supporting test references require confirmation. This document is not an independently verified specification.",
} as const;

export const specificationGroups: readonly SpecificationGroup[] = [
  {
    id: "materials-formats",
    number: "01",
    title: "Materials & Formats",
    rows: [
      { label: "Construction", value: technicalDetails.construction },
      { label: "Tile bodies", value: technicalDetails.bodies },
      {
        label: "Single-piece formats",
        value: "Sizes listed in the supplied datasheet:",
        items: technicalDetails.formats,
        note: technicalDetails.availability,
      },
      {
        label: "Thickness",
        value: technicalDetails.thickness,
        note: technicalDetails.thicknessNote,
      },
      { label: "Weight & packing", value: technicalDetails.weight },
      { label: "Country of origin", value: technicalDetails.origin },
    ],
  },
  {
    id: "performance-applications",
    number: "02",
    title: "Performance & Applications",
    rows: [
      {
        label: "Water absorption",
        value: technicalDetails.waterAbsorption.join(" "),
        note: "Source-stated values apply to the named bodies. Confirm the body and specification of the selected product; these are not a universal rating.",
      },
      { label: "Surface hardness", value: technicalDetails.hardness },
      {
        label: "Primary application",
        value: "Vertical wall cladding and high-relief feature surfaces.",
      },
      {
        label: "Slip rating",
        value:
          "Not applicable in the supplied datasheet. No floor-use suitability is established.",
      },
      { label: "Exterior use", value: technicalDetails.exterior },
      { label: "Poolside backdrops", value: technicalDetails.poolside },
      {
        label: "Household cleaners",
        value:
          "The source describes resistance to normal household cleaners and non-abrasive detergents.",
        note: "Confirm cleaner compatibility and exposure limits for the selected glaze. Acid compatibility requires confirmation.",
      },
    ],
    restriction: technicalDetails.poolRestriction,
  },
  {
    id: "installation-care",
    number: "03",
    title: "Installation & Care",
    introduction: technicalDetails.installationNote,
    rows: [
      { label: "Adhesive recommendation", value: technicalDetails.adhesive },
      { label: "Grout & joint spacing", value: technicalDetails.grout },
      { label: "Exterior anchoring", value: technicalDetails.anchoring },
      { label: "Routine care", value: technicalDetails.care },
    ],
  },
];

export const technicalFaqs: readonly (readonly [string, string])[] = [
  [
    "What sizes and thickness are listed?",
    `The supplied datasheet lists ${technicalDetails.formats.join(", ")} and a thickness of ${technicalDetails.thickness}. ${technicalDetails.availability} ${technicalDetails.thicknessNote}`,
  ],
  [
    "Are the tiles ceramic or porcelain?",
    `${technicalDetails.bodies} It separately states water absorption below 0.5% for vitrified body and below 3% for high-density decorative ceramic body. Confirm which body and value apply to your chosen product.`,
  ],
  [
    "Can the tiles be used outdoors?",
    `${technicalDetails.exterior} Tell us about the exposure, climate, body, finish and format so the requirements can be reviewed before ordering.`,
  ],
  [
    "Can I use the tiles near a pool or in a wet area?",
    `${technicalDetails.poolside} ${technicalDetails.poolRestriction} Other wet-area uses require confirmation of the product and installation system.`,
  ],
  [
    "Which adhesive, grout and joint spacing are recommended?",
    `The supplied datasheet recommends: ${technicalDetails.adhesive} ${technicalDetails.grout} Confirm the substrate, exposure and installation design with a qualified project specialist. High-rise exterior anchoring needs a separately specified system.`,
  ],
  ["How should the tiles be cleaned?", technicalDetails.care],
  ["Where can I find weight and packing information?", technicalDetails.weight],
];
