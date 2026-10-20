"""Extract the two image-only catalogues and retain VAVI's product mapping.

Requires Pillow and pypdf. Build Surface Studies first with
node scripts/build-vavi-brochure.cjs; that publication owns the first brochure's
images, products and hotspots. Run with: python scripts/prepare-brochure-products.py
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
import logging
import sys
from pathlib import Path

from PIL import Image, ImageDraw
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public/brochures/products"
SOURCES = {
    "artful-surfaces": "f304a1b2-c8b1-48aa-b347-d8a0e969b56f.pdf",
    "new-poster": "Eton_NEW-POSTER-2X4.pdf",
}
NAMES = {
    "artful-surfaces": [
        "Golden cranes", "Moonlit bluebird", "Alpine blossom", "Moonlit Buddha",
        "Golden garden", "Lakeside sunlight", "Moonlit cottage", "Jewel lotus",
        "Mountain swans", "Golden profile", "Garden musician", "Radha and Krishna",
        "Mosaic tiger", "Bamboo crane", "Sunset drapery",
    ],
    "new-poster": [
        "Birds in flight", "Circular composition", "Flowing florals", "Woodland path",
        "Golden sail", "Autumn moon", "Colourful canal", "Moonlit tiger",
        "Golden figures", "Feather study",
    ],
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def source_metadata():
    spec = importlib.util.spec_from_file_location(
        "brochure_source", ROOT / "scripts/prepare-brochure-assets.py"
    )
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    # Loading source metadata should not leave Python cache files in the repo.
    previous_cache_policy = sys.dont_write_bytecode
    sys.dont_write_bytecode = True
    try:
        spec.loader.exec_module(module)
    finally:
        sys.dont_write_bytecode = previous_cache_policy
    if {item["id"] for item in module.CATALOGUES} != module.LEGACY_CATALOGUE_IDS:
        raise SystemExit("This extractor may only publish the two image-only catalogues.")
    return module, module.load_vavi_publication()


def original_jpeg(page) -> bytes:
    """ImageFile.data may re-encode JPEGs; use the actual PDF image stream."""
    images = [
        reference.get_object()
        for reference in page["/Resources"]["/XObject"].values()
        if reference.get_object().get("/Subtype") == "/Image"
    ]
    if len(images) != 1 or images[0].get("/Filter") != "/DCTDecode":
        raise ValueError("Expected one unchanged DCTDecode source JPEG")
    data = images[0].get_data()
    if not data.startswith(b"\xff\xd8"):
        raise ValueError("Invalid original JPEG stream")
    return data


def main():
    logging.getLogger("pypdf").setLevel(logging.ERROR)
    source_module, publication = source_metadata()
    catalogues, descriptions = source_module.CATALOGUES, source_module.PAGE_DESCRIPTIONS
    OUTPUT.mkdir(parents=True, exist_ok=True)
    products = []
    provenance = []
    for product in publication["products"]:
        texture_path = ROOT / "public" / product["texture"].lstrip("/")
        provenance.append({
            "id": product["id"],
            "source": "Owner-supplied first brochure imagery",
            "publication": "/brochures/surface-studies/publication.json",
            "pageNumbers": product["pageNumbers"],
            "nativeWidth": product["textureWidth"],
            "nativeHeight": product["textureHeight"],
            "texture": product["texture"],
            "textureSha256": sha256(texture_path),
            "textureBytes": texture_path.stat().st_size,
        })
    for catalogue in catalogues:
        brochure_id = catalogue["id"]
        source = ROOT / "data/brouchers" / SOURCES[brochure_id]
        reader = PdfReader(source)
        pages = range(1, len(reader.pages) + 1)
        for page_number in pages:
            page = reader.pages[page_number - 1]
            if len(page.images) != 1:
                raise ValueError(f"Unexpected image count: {brochure_id} page {page_number}")
            embedded = page.images[0]
            native = embedded.image
            product_id = f"{brochure_id}-{page_number:02d}"
            name = NAMES[brochure_id][page_number - 1]
            page_numbers = [page_number]
            # Preserve the complete source JPEG stream byte-for-byte.
            target = OUTPUT / f"{product_id}.jpg"
            target.write_bytes(original_jpeg(page))
            texture = native
            hotspot = {"x": 0, "y": 0, "width": 1, "height": 1}
            description = descriptions[brochure_id][page_number - 1]
            record = {
                "id": product_id,
                "brochureId": brochure_id,
                "name": name,
                "collection": catalogue["title"],
                "description": description[0].upper() + description[1:] + ".",
                "pageNumbers": page_numbers,
                "texture": f"/brochures/products/{target.name}",
                "textureWidth": texture.width,
                "textureHeight": texture.height,
                "format": None,
                "sourcePdf": f"/brochures/{brochure_id}/catalogue.pdf",
                "sourcePage": page_number,
                "hotspot": hotspot,
            }
            products.append(record)
            provenance.append({
                "id": product_id,
                "source": f"Owner-supplied image-only catalogue: {brochure_id}",
                "sourceSha256": sha256(source), "sourcePage": page_number,
                "embeddedImage": embedded.name, "nativeWidth": native.width,
                "nativeHeight": native.height,
                "pixelCrop": None,
                "texture": record["texture"], "textureSha256": sha256(target),
                "textureBytes": target.stat().st_size,
            })

    types = '''/** Exact owner-supplied artwork; VAVI publication metadata owns its current layout. */
import surfaceStudiesPublication from "../../public/brochures/surface-studies/publication.json";

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
  /** Confirmed VAVI product dimensions only; null until verified. */
  format: string | null;
  sourcePdf: string;
  sourcePage: number;
  hotspot: BrochureHotspot;
  originalInterior?: { src: string; width: number; height: number; alt: string };
};

export const brochureProducts: BrochureProduct[] = [
  ...surfaceStudiesPublication.products,
'''
    helpers = '''
];

const publicationHotspots: Record<string, Record<string, BrochureHotspot>> =
  surfaceStudiesPublication.hotspots;

/** Reader indices are zero-based; product records use current publication pages. */
export function getBrochureProduct(brochureId: string, pageIndex: number): BrochureProduct | undefined {
  return brochureProducts.find((product) => product.brochureId === brochureId && product.pageNumbers.includes(pageIndex + 1));
}

/** The publication owns page-specific placements, including its supplied interior. */
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
'''
    source_module.assert_public_branding(products)
    source_module.assert_public_branding(provenance)
    product_entries = json.dumps(products, ensure_ascii=False, indent=2)[2:-2]
    (ROOT / "src/lib/brochure-products.ts").write_text(types + product_entries + helpers, encoding="utf-8")
    (OUTPUT / "manifest.json").write_text(json.dumps({
        "generator": "scripts/prepare-brochure-products.py",
        "products": provenance,
    }, indent=2) + "\n", encoding="utf-8")

    # Small labelled sheet for visual QA, never shipped as an interior preview.
    all_products = publication["products"] + products
    rows = (len(all_products) + 6) // 7
    sheet = Image.new("RGB", (7 * 150, rows * 300), "#f2eee5")
    draw = ImageDraw.Draw(sheet)
    for index, record in enumerate(all_products):
        with Image.open(ROOT / "public" / record["texture"].lstrip("/")) as source_image:
            thumb = source_image.convert("RGB")
            thumb.thumbnail((136, 266), Image.Resampling.LANCZOS)
            left, top = (index % 7) * 150, (index // 7) * 300
            sheet.paste(thumb, (left + (150 - thumb.width) // 2, top))
            draw.text((left + 4, top + 270), record["id"], fill="black")
    qa = ROOT / "tmp/pdfs/brochure-products"
    qa.mkdir(parents=True, exist_ok=True)
    sheet.save(qa / "contact-sheet.jpg", quality=90)
    print(f"Prepared {len(products)} image-only catalogue textures; retained {len(publication['products'])} VAVI publication designs.")


if __name__ == "__main__":
    main()
