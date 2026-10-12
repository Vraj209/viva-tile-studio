"""Extract exact brochure artwork and generate the product-to-page index.

Requires Pillow and pypdf. Source PDFs, brochure page renders and their generator
are never modified. No generated imagery or invented product dimensions enter
this index. Run with: python scripts/prepare-brochure-products.py
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
import logging
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public/brochures/products"
# Common native image bounds, visually checked against all 24 Evoke panels.
# Removes the grey brochure matte/drop shadow; keeps the complete panel border.
EVOKE_CROP = (9, 10, 392, 776)
SOURCES = {
    "evoke": "Eton__1200x2400mm_Evoke_Collection.pdf",
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
    return module.CATALOGUES, module.PAGE_DESCRIPTIONS


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


def evoke_hotspot(page) -> dict:
    placements = []

    def visit(operation, operands, matrix, text_matrix):
        if operation == b"Do":
            placements.append(matrix[:])

    page.extract_text(visitor_operand_before=visit)
    if len(placements) != 1:
        raise ValueError("Expected exactly one product image placement")
    a, b, c, d, e, f = placements[0]
    if b or c or a <= 0 or d <= 0:
        raise ValueError("Unexpected rotated or flipped product image")
    page_width, page_height = float(page.mediabox.width), float(page.mediabox.height)
    left, top, right, bottom = EVOKE_CROP
    return {
        "x": round((e + a * left / 400) / page_width, 8),
        "y": round((page_height - f - d + d * top / 785) / page_height, 8),
        "width": round(a * (right - left) / 400 / page_width, 8),
        "height": round(d * (bottom - top) / 785 / page_height, 8),
    }


def main():
    logging.getLogger("pypdf").setLevel(logging.ERROR)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    catalogues, descriptions = source_metadata()
    products = []
    provenance = []
    for catalogue in catalogues:
        brochure_id = catalogue["id"]
        source = ROOT / "data/brouchers" / SOURCES[brochure_id]
        reader = PdfReader(source)
        pages = [3, *range(5, 28)] if brochure_id == "evoke" else range(1, len(reader.pages) + 1)
        for page_number in pages:
            page = reader.pages[page_number - 1]
            if len(page.images) != 1:
                raise ValueError(f"Unexpected image count: {brochure_id} page {page_number}")
            embedded = page.images[0]
            native = embedded.image
            if brochure_id == "evoke":
                match = re.search(r"(104\d{2})", page.extract_text())
                if match is None:
                    raise ValueError(f"Missing Evoke product code on page {page_number}")
                code = match.group(1)
                product_id = f"evoke-{code}"
                name = f"Design {code}"
                page_numbers = [3, 4] if code == "10465" else [2, 14] if code == "10475" else [page_number]
                if native.size != (400, 785):
                    raise ValueError(f"Evoke extraction dimensions changed: {native.size}")
                # Lossless pixel crop, with no recolouring, scaling or retouching.
                texture = native.crop(EVOKE_CROP)
                target = OUTPUT / f"{product_id}.webp"
                texture.save(target, "WEBP", lossless=True, method=6, exact=True)
                with Image.open(target) as written:
                    if written.convert("RGBA").tobytes() != texture.convert("RGBA").tobytes():
                        raise ValueError(f"Lossless texture validation failed: {product_id}")
                hotspot = evoke_hotspot(page)
                description = descriptions[brochure_id][page_number - 1].split(": ", 1)[1]
            else:
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
                "format": "1200 × 2400 mm" if brochure_id == "evoke" else None,
                "sourcePdf": f"/brochures/{brochure_id}/catalogue.pdf",
                "sourcePage": page_number,
                "hotspot": hotspot,
            }
            if product_id == "evoke-10465":
                interior = reader.pages[3].images[0]
                interior_target = OUTPUT / "evoke-10465-original-interior.jpg"
                interior_target.write_bytes(original_jpeg(reader.pages[3]))
                record["originalInterior"] = {
                    "src": f"/brochures/products/{interior_target.name}",
                    "width": interior.image.width,
                    "height": interior.image.height,
                    "alt": "Supplied Evoke catalogue interior showing Design 10465 beside a timber entrance door and an ivory console table.",
                }
            products.append(record)
            provenance.append({
                "id": product_id, "source": f"data/brouchers/{source.name}",
                "sourceSha256": sha256(source), "sourcePage": page_number,
                "embeddedImage": embedded.name, "nativeWidth": native.width,
                "nativeHeight": native.height,
                "pixelCrop": list(EVOKE_CROP) if brochure_id == "evoke" else None,
                "texture": record["texture"], "textureSha256": sha256(target),
                "textureBytes": target.stat().st_size,
            })

    types = '''/** Exact owner-supplied artwork. Regenerate with scripts/prepare-brochure-products.py. */
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

export const brochureProducts: BrochureProduct[] = '''
    helpers = ''';

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
'''
    (ROOT / "src/lib/brochure-products.ts").write_text(
        types + json.dumps(products, ensure_ascii=False, indent=2) + helpers, encoding="utf-8"
    )
    (OUTPUT / "manifest.json").write_text(json.dumps({
        "generator": "scripts/prepare-brochure-products.py",
        "products": provenance,
    }, indent=2) + "\n", encoding="utf-8")

    # Small labelled sheet for visual QA, never shipped as an interior preview.
    sheet = Image.new("RGB", (7 * 150, 7 * 300), "#f2eee5")
    draw = ImageDraw.Draw(sheet)
    for index, record in enumerate(products):
        with Image.open(ROOT / "public" / record["texture"].lstrip("/")) as source_image:
            thumb = source_image.convert("RGB")
            thumb.thumbnail((136, 266), Image.Resampling.LANCZOS)
            left, top = (index % 7) * 150, (index // 7) * 300
            sheet.paste(thumb, (left + (150 - thumb.width) // 2, top))
            draw.text((left + 4, top + 270), record["id"], fill="black")
    qa = ROOT / "tmp/pdfs/brochure-products"
    qa.mkdir(parents=True, exist_ok=True)
    sheet.save(qa / "contact-sheet.jpg", quality=90)
    print(f"Prepared {len(products)} exact product textures across 51 brochure pages.")


if __name__ == "__main__":
    main()
