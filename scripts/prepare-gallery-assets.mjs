import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "public/images/gallery");

// Crops are recorded in original pixels. No perspective correction, generated pixels,
// colour grading, sharpening, or upscaling is applied. Uncertain edges stay photographic.
const samples = [
  {
    id: "warm-curves", label: "Warm curves", source: "samples/419539f5-80b8-416a-90b3-4680bd43843a.jpeg",
    description: "Bands, spirals and fine lines in warm colour.",
    alt: "Square sample image of tightly curved orange, ochre and muted teal lines on a dark ground.",
  },
  {
    id: "angular-lines", label: "Angular lines", source: "samples/1c57ee0e-5f93-4d76-97a7-f61eda39e7a8.jpeg",
    crop: { left: 0, top: 0, width: 560, height: 574 }, sourceView: true,
    description: "Interlocking lines with a quiet, tonal palette.",
    alt: "Near-square brown and pale taupe sample with closely spaced angular maze-like lines.",
  },
  {
    id: "ochre-geometry", label: "Ochre geometry", source: "samples/5948f80d-9d17-4b54-a19b-2a9484011b90.jpeg",
    description: "Diamonds, stripes and an earthy colour contrast.",
    alt: "Portrait sample image of ochre, cream and deep green triangles and diamonds on black.",
  },
  {
    id: "elephant-outline", label: "Elephant outline", source: "samples/3f5c15d1-556e-41ea-b285-b62bffebab49.jpeg",
    description: "A simple line against soft, textured shapes.",
    alt: "Portrait cream and tan sample image with a continuous black outline of an elephant.",
    detail: { left: 4, top: 215, width: 282, height: 400 },
  },
  {
    id: "graphic-squares", label: "Graphic squares", source: "samples/02b074e8-c458-42a6-ac10-13c82ee85e27.jpeg",
    description: "A vivid repeat of framed squares and sharp lines.",
    alt: "Square sample image with repeating red, yellow, green, black and ivory geometric bands.",
  },
  {
    id: "diamond-lattice", label: "Diamond lattice", source: "samples/1c57ee0e-5f93-4d76-97a7-f61eda39e7a8.jpeg",
    crop: { left: 588, top: 603, width: 556, height: 558 }, sourceView: true,
    description: "Nested diamonds and small geometric motifs.",
    alt: "Near-square taupe and brown sample with outlined diamonds and small angular motifs.",
  },
  {
    id: "ivory-silhouettes", label: "Ivory silhouettes", source: "samples/abedabf6-02fd-45c1-89a0-4faf352626f8_1.jpeg",
    description: "Two elephant silhouettes on a speckled dark ground.",
    alt: "Portrait black sample image with a large cropped ivory elephant and a smaller elephant silhouette.",
  },
  {
    id: "acacia-silhouettes", label: "Acacia silhouettes", source: "samples/926cfa82-fb29-4558-bf30-6b8e24302dab.jpeg",
    description: "Dark tree canopies with soft sun-coloured shapes.",
    alt: "Portrait sample image of dark acacia trees and a small lion against cream, ochre and clay shapes.",
  },
  {
    id: "ochre-savannah", label: "Ochre savannah", source: "samples/dbed1847-8dbb-43c7-88a5-c46af035129f.jpeg",
    description: "Layered grasses and trees in an ochre landscape.",
    alt: "Wide sample image of dark acacia trees and tall grasses against layered golden and burnt-orange shapes.",
  },
  {
    id: "zebra-pair", label: "Zebra pair", source: "samples/ea875b0e-d3bc-4339-8fdb-f2893ea9c6c9.jpeg",
    description: "Contrasting stripes within a softly shaded scene.",
    alt: "Landscape sample image of two zebras standing together against a softly shaded brown and olive background.",
  },
  {
    id: "running-horses", label: "Running horses", source: "samples/56afcdae-6c3e-4c1f-9dcc-1ab988ebbb76.jpeg",
    category: "Sample photograph", sourceView: true,
    crop: { left: 119, top: 0, width: 1459, height: 899 },
    description: "A photographed panel of pale horses in motion.",
    alt: "Landscape photograph of a framed panel with pale horses, flowing manes and a light blue ground.",
    detail: { left: 495, top: 150, width: 530, height: 530 },
  },
  {
    id: "spotted-cat-acacia", label: "Spotted cat & acacia", source: "samples/308a53ee-b45f-4b7d-9ffe-11154282bc82.jpeg",
    category: "Sample photograph", sourceView: true,
    crop: { left: 26, top: 66, width: 814, height: 1479 },
    description: "A photographed panel with a tree and spotted cat.",
    alt: "Tall photograph of a framed cream and sand-coloured panel showing a spotted cat perched beside an acacia tree.",
    detail: { left: 81, top: 410, width: 626, height: 735 },
  },
  {
    id: "amber-butterfly", label: "Amber butterfly", source: "landscape/L_1.png",
    description: "An orange butterfly against a dark blue, textured ground.",
    alt: "Portrait sample image of an amber-orange butterfly with spread wings against a dark blue textured background.",
  },
  {
    id: "ivory-geometry", label: "Ivory geometry", source: "landscape/L_2.png",
    description: "Two cream panels with contrasting diamond and triangle patterns.",
    alt: "Square sample image showing two cream geometric panels with repeating diamond and triangle patterns.",
  },
  {
    id: "courtyard-fountain", label: "Courtyard fountain", source: "landscape/L_3.png",
    description: "A turquoise arched fountain framed by flowering branches.",
    alt: "Portrait sample image of a turquoise arched fountain surrounded by flowering branches.",
  },
  {
    id: "coastal-window", label: "Coastal window", source: "landscape/L_4.png",
    description: "Blue waves and golden conifers within a circular, wood-like frame.",
    alt: "Landscape sample image of blue waves and golden conifers within a circular frame resembling curling driftwood.",
  },
  {
    id: "white-tiger", label: "White tiger", source: "landscape/L_5.png",
    description: "A white tiger nestled among pale roses and gold-coloured foliage.",
    alt: "Landscape sample image of a white tiger among pale roses and curling gold-coloured foliage.",
  },
  {
    id: "floral-elephant", label: "Floral elephant", source: "landscape/L_6.png",
    description: "A white elephant in profile, surrounded by cream flowers and golden leaves.",
    alt: "Landscape sample image of a white elephant in profile surrounded by cream flowers and gold-coloured leaves.",
  },
  {
    id: "liquid-gold", label: "Liquid gold", source: "potraite/P_1.png",
    description: "A golden face with flowing splash shapes on a black ground.",
    alt: "Portrait sample image of a gold-coloured face surrounded by flowing liquid-like splashes against black.",
  },
  {
    id: "sunshine-owl", label: "Sunshine owl", source: "potraite/P_2.png",
    description: "A white owl on a branch, with a golden sun and flowing ochre landscape.",
    alt: "Portrait sample image of a white owl perched on a branch before a golden sun and flowing ochre landscape.",
  },
  {
    id: "woodland-muse", label: "Woodland muse", source: "potraite/P_3.png",
    description: "A serene face framed by curling wood-like forms and green leaves.",
    alt: "Portrait sample image of a serene face framed by curling wood-like forms and green leaves against a stone-like ground.",
  },
  {
    id: "island-footprint", label: "Island footprint", source: "potraite/P_4.png",
    description: "A footprint-shaped beach scene with palms, sea and a sailboat.",
    alt: "Portrait sample image of a footprint-shaped tropical beach scene containing palms, blue sea and a sailboat.",
  },
  {
    id: "savannah-elephant", label: "Savannah elephant", source: "potraite/P_5.png",
    description: "An elephant facing forward, with acacia trees in cream and ochre.",
    alt: "Portrait sample image of a front-facing elephant with acacia trees in a cream and ochre landscape.",
  },
  {
    id: "opal-lotus", label: "Opal lotus", source: "potraite/P_6.png",
    description: "An iridescent lotus with golden branches and butterflies on dark teal.",
    alt: "Portrait sample image of an iridescent lotus on a dark teal centre, framed by gold-coloured branches and butterflies.",
  },
  {
    id: "golden-krishna", label: "Golden Krishna", source: "potraite/P_7.png",
    description: "Child Krishna embracing a white calf beneath a golden arch.",
    alt: "Portrait sample image depicting child Krishna embracing a white calf beneath a gold-coloured arch.",
  },
  {
    id: "ocean-dolphins", label: "Ocean dolphins", source: "potraite/P_8.png",
    description: "Three blue dolphins above foaming waves and pale rocks.",
    alt: "Portrait sample image of three blue dolphins leaping above foaming waves and pale rocks.",
  },
  {
    id: "sunset-retreat", label: "Sunset retreat", source: "potraite/P_9.png",
    description: "A palm and thatched hut framed by a dark, flowing shape at sunset.",
    alt: "Portrait sample image of a palm and thatched hut within a dark organic shape against an orange sunset.",
  },
  {
    id: "coconut-hideaway", label: "Coconut hideaway", source: "potraite/P_10.png",
    description: "A tropical hut and palms nestled inside a split coconut on blue.",
    alt: "Portrait sample image of a thatched tropical hut and palms inside a split coconut against a blue background.",
  },
  {
    id: "peacock-scrolls", label: "Peacock scrolls", source: "potraite/P_11.png",
    description: "A teal and blue peacock with ornamental golden curls on mustard.",
    alt: "Tall sample image of a teal and blue peacock surrounded by ornamental gold-coloured curls on a mustard ground.",
  },
  {
    id: "shoreline-sunset", label: "Shoreline sunset", source: "potraite/P_12.png",
    description: "A small blue boat, bamboo and a wooden hut beneath a vivid sunset.",
    alt: "Tall sample image of a small blue boat on a beach with bamboo and a wooden hut beneath a vivid sunset.",
  },
  {
    id: "luminous-lotus", label: "Luminous lotus", source: "potraite/p_13.png",
    description: "Pale glowing lotus blooms within a curved, dark wood-like frame.",
    alt: "Tall sample image of pale glowing lotus blooms enclosed by a curved dark frame resembling wood.",
  },
  {
    id: "acacia-watch", label: "Acacia watch", source: "potraite/P_14.png",
    description: "A spotted cat perched beneath an acacia canopy in cream and tan.",
    alt: "Portrait sample image of a spotted cat perched on a tree beneath an acacia canopy in cream and tan.",
  },
];

const hash = (buffer) => createHash("sha256").update(buffer).digest("hex");
const originals = new Map();
const assets = [];
const records = [];
const sourceViews = new Map();
await mkdir(outputDirectory, { recursive: true });

async function exportImage(source, filename, maxSize, quality, crop) {
  let pipeline = sharp(source).autoOrient();
  if (crop) pipeline = pipeline.extract(crop);
  const destination = path.join(outputDirectory, filename);
  const result = await pipeline
    .resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toFile(destination);
  return { image: `/images/gallery/${filename}`, width: result.width, height: result.height, bytes: result.size };
}

for (const sample of samples) {
  const source = path.join(root, "data", sample.source);
  const original = await readFile(source);
  originals.set(source, hash(original));
  const meta = await sharp(original).metadata();
  const thumbnail = await exportImage(original, `${sample.id}-browse.webp`, 640, 84, sample.crop);
  const inspection = await exportImage(original, `${sample.id}-inspect.webp`, 1600, 92, sample.crop);
  const related = [];
  if (sample.sourceView) {
    let sourceImage = sourceViews.get(sample.source);
    if (!sourceImage) {
      sourceImage = await exportImage(original, `${sample.id}-source.webp`, 1600, 92);
      sourceViews.set(sample.source, sourceImage);
    }
    related.push({ image: sourceImage.image, width: sourceImage.width, height: sourceImage.height, label: "Original photograph", alt: path.basename(sample.source).startsWith("1c57") ? "Original photograph of four separate taupe and brown geometric samples arranged in two rows." : sample.alt });
  }
  if (sample.detail) {
    const detail = await exportImage(original, `${sample.id}-detail.webp`, 1200, 92, sample.detail);
    related.push({ image: detail.image, width: detail.width, height: detail.height, label: "Image detail", alt: `Close crop from the supplied ${sample.label.toLowerCase()} image; the original image is also available.` });
  }
  assets.push({
    id: sample.id, label: sample.label, category: sample.category ?? "Sample image",
    description: sample.description, alt: sample.alt,
    thumbnail: thumbnail.image, image: inspection.image,
    width: thumbnail.width, height: thumbnail.height,
    imageWidth: inspection.width, imageHeight: inspection.height,
    source: `data/${sample.source}`, related,
  });
  records.push({ sample, meta, thumbnail, inspection });
}

const typeDeclaration = `/** Prepared from owner-supplied data/ imagery. Labels describe visible content only. */
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
export const galleryAssets: GalleryAsset[] = `;
await writeFile(path.join(root, "src/lib/gallery-assets.ts"), typeDeclaration + JSON.stringify(assets, null, 2) + ";\n");

for (const [source, checksum] of originals) {
  if (hash(await readFile(source)) !== checksum) throw new Error(`Source changed: ${source}`);
}
const delivered = await readdir(outputDirectory);
const totalBytes = (await Promise.all(delivered.map((file) => stat(path.join(outputDirectory, file))))).reduce((sum, file) => sum + file.size, 0);
const browseBytes = records.reduce((sum, record) => sum + record.thumbnail.bytes, 0);
const rows = records.map(({ sample, meta, thumbnail, inspection }) => {
  const crop = sample.crop ? `${sample.crop.left}, ${sample.crop.top}, ${sample.crop.width}, ${sample.crop.height}` : "Full image";
  return `| ${sample.label} | \`${sample.source}\` | ${meta.width} × ${meta.height} | ${crop} | ${thumbnail.width} × ${thumbnail.height} / ${thumbnail.bytes.toLocaleString("en-US")} | ${inspection.width} × ${inspection.height} / ${inspection.bytes.toLocaleString("en-US")} |`;
}).join("\n");
const inventory = `| Source | Classification | Selection |\n| --- | --- | --- |\n` + [
  ["02b074e8", "Full-face geometric sample image", "Selected"],
  ["1c57ee0e", "Photograph of four separate square samples", "Two visually distinct faces selected; original grouping available in inspection"],
  ["308a53ee", "Photograph of a framed tall sample/panel", "Selected with photographic perspective retained"],
  ["3ec421bb", "Three framed landscape images", "Excluded: triptych framing and weaker image resolution"],
  ["3f5c15d1", "Full-face portrait sample image", "Selected; source detail available"],
  ["419539f5", "Full-face square sample image", "Selected"],
  ["56afcdae", "Photograph of a framed wide sample/panel", "Selected; source photo and detail available"],
  ["5948f80d", "Full-face portrait sample image", "Selected"],
  ["5efec184", "Framed landscape image with large mount", "Excluded: large mount and weaker sample-face relevance"],
  ["5f370bac", "Interior scene with blue elephant wall artwork", "Excluded from sample faces; no matching selected sample"],
  ["926cfa82", "Full-face portrait sample image", "Selected"],
  ["abedabf6…_1", "Full-face portrait sample image", "Selected once; retained file is identical to the previously selected original"],
  ["dbed1847", "Wide landscape sample image", "Selected"],
  ["ea875b0e", "Wide figurative sample image", "Selected"],
  ["fff21619", "Interior scene with spotted-cat wall artwork", "Excluded from sample faces; no matching selected sample"],
  ...samples.slice(12).map((sample) => [sample.source, "Supplied sample image", "Selected in full, without cropping"]),
].map((row) => `| ${row.join(" | ")} |`).join("\n");
const doc = `# Inspiration gallery asset preparation

Prepared 27 September 2026 from owner-supplied imagery in \`data/samples/\`, \`data/landscape/\` and \`data/potraite/\`. The original twelve selected sample faces remain, followed by all six PNGs in \`landscape/\` and all fourteen PNGs in \`potraite/\`: **${assets.length} gallery images from ${originals.size} distinct source files**.

The earlier JPEG sources now live in \`data/samples/\`. The four-sample source still contributes two different faces, with its complete photograph available in inspection. The retained elephant file ending in \`_1.jpeg\` is byte-identical to the previously selected original and is used once. The twenty added images were visually reviewed, have no byte-identical duplicates, and are included in full. Folder names do not determine display orientation: each image uses its actual dimensions.

Labels describe visible content, not verified product names, materials, collections, finishes or dimensions. Depicted depth, gold colouring, wood-like forms and stone-like backgrounds do not establish physical manufacture or measured relief. New images remain **Sample image**; the two existing framed-panel photographs remain **Sample photograph**. No matching installed view is fabricated or associated merely by theme.

## Preparation

Run \`node scripts/prepare-gallery-assets.mjs\` from the repository root. Existing Sharp prepares WebP copies, the typed \`src/lib/gallery-assets.ts\` manifest and this register. Original files remain unchanged; their SHA-256 hashes are checked before and after preparation.

- Browse images fit within 640 × 640 px at WebP quality 84.
- Inspection images fit within 1600 × 1600 px at quality 92. Smaller originals are never enlarged.
- Original aspect ratios are retained, including mixed orientations within the supplied folders. No new PNG is cropped.
- Earlier extracted square faces preserve their photographed proportions. No perspective warping is applied.
- Existing framed-panel crops retain their photographic presentation, with the complete original photograph available in the expanded view.
- No colour, exposure, white-balance or sharpening correction is applied. No generated detail, inferred relief, transparency isolation or surface retouching is used.
- Supporting details are labelled crops of supplied images, not additional products or microscopic material evidence.
- Full inspection, source and detail assets load only when the inspection view is opened.

Total browse payload for all ${assets.length} images: **${browseBytes.toLocaleString("en-US")} bytes**. All ${delivered.length} prepared assets combined: **${totalBytes.toLocaleString("en-US")} bytes**. Actual page transfer depends on lazy-loading and browser cache.

## Selected images

Crop coordinates are \`left, top, width, height\` in original source pixels. Browse and inspection dimensions are real output metadata; no dimensions express product size. URLs use \`/images/gallery/<id>-browse.webp\` and \`<id>-inspect.webp\`.

| Descriptive label | Source in data/ | Source px | Crop | Browse px / bytes | Inspection px / bytes |
| --- | --- | --- | --- | --- | --- |
${rows}

## Source inventory

The first fifteen entries refer to JPEG filenames in \`data/samples/\`; the remaining twenty entries list their full path relative to \`data/\`.

${inventory}

The previous \`docs/assets.md\` register describes older generated assets elsewhere on the page. Those remain separate; this register records the provenance of Section 03.
`;
await mkdir(path.join(root, "docs"), { recursive: true });
await writeFile(path.join(root, "docs/gallery-assets.md"), doc);
console.log(`Prepared ${assets.length} sample faces; ${delivered.length} WebP assets; ${totalBytes} bytes. Original source hashes unchanged.`);
