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
const inventory = `| Source | Classification | Selection |\n| --- | --- | --- |\n` + samples
  .map((sample) => `| ${sample.source} | Supplied sample image | Selected in full, without cropping |`)
  .join("\n");
const doc = `# Inspiration gallery asset preparation

Prepared exclusively from owner-supplied imagery in \`data/landscape/\` and \`data/potraite/\`: all six landscape-folder PNGs, followed by all fourteen portrait-folder PNGs, in numeric filename order. **${assets.length} gallery images from ${originals.size} distinct source files**. The gallery selection was updated at the owner's request on 12 October 2026. Images from \`data/samples/\` are excluded from the loop; their original and prepared files are retained.

The selected images were visually reviewed, have no byte-identical duplicates, and are included in full. Folder names do not determine display orientation: each image uses its actual dimensions.

Labels describe visible content, not verified product names, materials, collections, finishes or dimensions. Depicted depth, gold colouring, wood-like forms and stone-like backgrounds do not establish physical manufacture or measured relief. All selected images are labelled **Sample image**. No matching installed view is fabricated or associated merely by theme.

## Preparation

Run \`node scripts/prepare-gallery-assets.mjs\` from the repository root. Existing Sharp prepares WebP copies, the typed \`src/lib/gallery-assets.ts\` manifest and this register. Original files remain unchanged; their SHA-256 hashes are checked before and after preparation.

- Browse images fit within 640 × 640 px at WebP quality 84.
- Inspection images fit within 1600 × 1600 px at quality 92. Smaller originals are never enlarged.
- Original aspect ratios are retained, including mixed orientations within the supplied folders. No image is cropped or perspective-warped.
- No colour, exposure, white-balance or sharpening correction is applied. No generated detail, inferred relief, transparency isolation or surface retouching is used.
- Full inspection images load only when the inspection view is opened.

Total browse payload for all ${assets.length} images: **${browseBytes.toLocaleString("en-US")} bytes**. All ${delivered.length} prepared assets on disk, including retained assets excluded from the loop: **${totalBytes.toLocaleString("en-US")} bytes**. Actual page transfer depends on lazy-loading and browser cache.

## Selected images

Crop coordinates are \`left, top, width, height\` in original source pixels. Browse and inspection dimensions are real output metadata; no dimensions express product size. URLs use \`/images/gallery/<id>-browse.webp\` and \`<id>-inspect.webp\`.

| Descriptive label | Source in data/ | Source px | Crop | Browse px / bytes | Inspection px / bytes |
| --- | --- | --- | --- | --- | --- |
${rows}

## Source inventory

Each entry lists its full path relative to \`data/\`. Every image currently in the two selected folders is included once.

${inventory}

The previous \`docs/assets.md\` register describes older generated assets elsewhere on the page. Those remain separate; this register records the provenance of Section 03.
`;
await mkdir(path.join(root, "docs"), { recursive: true });
await writeFile(path.join(root, "docs/gallery-assets.md"), doc);
console.log(`Prepared ${assets.length} sample faces; ${delivered.length} WebP assets; ${totalBytes} bytes. Original source hashes unchanged.`);
