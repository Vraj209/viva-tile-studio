"""Render the two image-only catalogues and retain VAVI's original publication.

Requires Python 3, Pillow, pypdf and Poppler's pdftoppm. Run from any directory:
    python scripts/prepare-brochure-assets.py

Build Surface Studies first with node scripts/build-vavi-brochure.cjs. Its
publication, artwork and page order are never regenerated from the old PDF here.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import re
import shutil
import subprocess
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image, ImageDraw, ImageStat
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "brochures"
VAVI_PUBLICATION = OUTPUT / "surface-studies" / "publication.json"
LEGACY_CATALOGUE_IDS = frozenset({"artful-surfaces", "new-poster"})
CATALOGUES = [
    {
        "id": "artful-surfaces",
        "source": "f304a1b2-c8b1-48aa-b347-d8a0e969b56f.pdf",
        "title": "Artful Surfaces",
        "subtitle": "Nature, rendered in detail",
        "description": "A collection of decorative artwork, from luminous cranes and peacocks to botanical compositions.",
        "format": "Decorative collection",
    },
    {
        "id": "new-poster",
        "source": "Eton_NEW-POSTER-2X4.pdf",
        "title": "New Poster Collection",
        "subtitle": "A new perspective on walls",
        "description": "Expressive portraits, botanical details and sculptural compositions, collected as full-page decorative artwork.",
        "format": "Poster collection",
    },
]

# Descriptions identify visible content only, not confirmed product names.
PAGE_DESCRIPTIONS = {
    "artful-surfaces": [
        "Two white cranes before a golden mosaic sun reflected in water",
        "A blue bird on dark branches before a pale mosaic moon",
        "A snowy mountain and riverside cabin framed by pink blossoms",
        "A seated Buddha beneath a fruit tree in a moonlit landscape",
        "Purple flowers and a twisting tree in an ornate golden frame",
        "A lakeside path, boat and cottage beneath a golden sun",
        "A cottage and garden path beneath a full moon",
        "A cream lotus surrounded by colourful jewel-like mosaic patterns",
        "White swans among water lilies before pale green mountains",
        "A dark sculptural face in profile against a golden circular background",
        "A seated musician holding a stringed instrument in a green garden",
        "Krishna playing a flute beside Radha in a moonlit garden",
        "A close-up tiger portrait in golden mosaic textures",
        "A white crane in a bamboo grove beside water lilies",
        "White flowers and flowing pale drapery around a golden sunset",
    ],
    "new-poster": [
        "A woman in a multicoloured patchwork dress surrounded by flying birds",
        "Overlapping green, ochre and rust geometric shapes with circular motifs",
        "Sculptural white flowers over flowing cream and grey marble-like textures",
        "A winding red and yellow path between dark trees, a cabin and two figures",
        "A sailboat and seabirds in warm golden light reflected on the water",
        "Tall dark trees before a large orange moon and red rolling hills",
        "A boat on a colourful canal between towers and bright autumn trees",
        "A white tiger beneath a pale circular moon on an orange ground",
        "Three figures, a small deer and a bird among golden leaves and flowers",
        "A single feather with pale and dark halves against a softly shaded ground",
    ],
}


def load_vavi_publication() -> dict:
    """Fail before writing outputs if the replacement publication is unavailable."""
    if not VAVI_PUBLICATION.is_file():
        raise SystemExit("Build Surface Studies first: node scripts/build-vavi-brochure.cjs")
    publication = json.loads(VAVI_PUBLICATION.read_text(encoding="utf-8"))
    if (
        publication.get("brochure", {}).get("id") != "surface-studies"
        or not publication.get("products")
        or not isinstance(publication.get("hotspots"), dict)
    ):
        raise SystemExit("Surface Studies publication metadata is incomplete; rebuild it first.")
    assert_public_branding(publication)
    return publication


def assert_public_branding(value: object) -> None:
    """Source filenames remain private; public records use neutral provenance."""
    if re.search(r"evoke|eton", json.dumps(value, ensure_ascii=False), re.IGNORECASE):
        raise ValueError("Previous source branding must not be written into public metadata.")


def find_poppler() -> str:
    executable = shutil.which("pdftoppm")
    if executable:
        return executable
    bundled = (
        Path.home()
        / ".cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe"
    )
    if bundled.exists():
        return str(bundled)
    raise SystemExit("Install Poppler and add pdftoppm to PATH before preparing brochures.")


def inspect_source(path: Path) -> tuple[PdfReader, list[int]]:
    """Detect the known destructive UTF-8 transcoding before shipping blank pages."""
    reader = PdfReader(path)
    damaged_pages = []
    for number, page in enumerate(reader.pages, 1):
        xobjects = page.get("/Resources", {}).get("/XObject", {})
        for reference in xobjects.values():
            obj = reference.get_object()
            if obj.get("/Subtype") == "/Image" and obj.get("/Filter") == "/DCTDecode":
                # A JPEG must start FF D8. EF BF BD is the encoded replacement
                # character introduced when this source was read as UTF-8 text.
                if obj._data.startswith(b"\xef\xbf\xbd"):
                    damaged_pages.append(number)
                    break
    return reader, damaged_pages


def render_page(job: tuple) -> dict:
    executable, source, folder, temp_folder, number, long_edge, quality, title = job
    prefix = temp_folder / f"page-{number:03d}"
    completed = subprocess.run(
        [executable, "-f", str(number), "-l", str(number), "-singlefile", "-scale-to",
         str(long_edge), "-png", str(source), str(prefix)],
        capture_output=True, text=True, check=False,
    )
    if completed.returncode:
        raise RuntimeError(f"Could not render {source.name} page {number}: {completed.stderr}")
    with Image.open(prefix.with_suffix(".png")) as rendered:
        page = rendered.convert("RGB")
        if max(ImageStat.Stat(page).stddev) < 0.5:
            raise RuntimeError(f"{source.name} page {number} rendered blank; inspect the source.")
        page.save(folder / f"page-{number:03d}.webp", "WEBP", quality=quality, method=6)
        thumbnail = page.copy()
        thumbnail.thumbnail((360, 360), Image.Resampling.LANCZOS)
        thumbnail.save(folder / f"thumb-{number:03d}.webp", "WEBP", quality=80, method=6)
        width, height = page.size
    return {
        "src": f"/brochures/{folder.name}/page-{number:03d}.webp",
        "alt": f"{title}, page {number}. {PAGE_DESCRIPTIONS.get(folder.name, [f'Catalogue page {i}' for i in range(1, number + 1)])[number - 1]}.",
        "thumbnail": f"/brochures/{folder.name}/thumb-{number:03d}.webp",
        "width": width,
        "height": height,
    }


def make_contact_sheet(folder: Path, pages: list[dict]) -> None:
    """A local QA artifact, deliberately outside the public directory."""
    columns, cell_width, cell_height = 6, 190, 310
    sheet = Image.new("RGB", (columns * cell_width, ((len(pages) + columns - 1) // columns) * cell_height), "#efebe4")
    drawing = ImageDraw.Draw(sheet)
    for index, page in enumerate(pages):
        x, y = (index % columns) * cell_width, (index // columns) * cell_height
        with Image.open(ROOT / "public" / page["src"].lstrip("/")) as image:
            preview = image.convert("RGB")
            preview.thumbnail((174, 280))
            sheet.paste(preview, (x + (cell_width - preview.width) // 2, y + 8))
        drawing.text((x + 8, y + 292), f"Page {index + 1:02d}", fill="#30302d")
    folder.mkdir(parents=True, exist_ok=True)
    sheet.save(folder / "contact-sheet.jpg", quality=90)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--long-edge", type=int, default=1800)
    parser.add_argument("--quality", type=int, default=88)
    args = parser.parse_args()
    logging.getLogger("pypdf").setLevel(logging.ERROR)
    publication = load_vavi_publication()
    if {item["id"] for item in CATALOGUES} != LEGACY_CATALOGUE_IDS:
        raise SystemExit("This renderer may only publish the two image-only catalogues.")
    executable = find_poppler()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    temp_root = (ROOT / "tmp" / "pdfs").resolve()
    temp_root.mkdir(parents=True, exist_ok=True)
    publication_pdf = ROOT / "public" / publication["brochure"]["pdf"].lstrip("/")
    publication_bytes = publication_pdf.read_bytes()
    records = []
    manifest = [{
        "id": "surface-studies",
        "source": "VAVI Tile Studio original publication",
        "publication": "/brochures/surface-studies/publication.json",
        "sha256": hashlib.sha256(publication_bytes).hexdigest(),
        "sourceBytes": len(publication_bytes),
        "pageCount": publication["brochure"]["pageCount"],
    }]

    for catalogue in CATALOGUES:
        source = ROOT / "data" / "brouchers" / catalogue["source"]
        source_bytes = source.read_bytes()
        reader, damaged = inspect_source(source)
        page_count = len(reader.pages)
        first = reader.pages[0].mediabox
        record = {key: value for key, value in catalogue.items() if key != "source"}
        record.update({
            "pageCount": page_count,
            "width": float(first.width),
            "height": float(first.height),
            "cover": "",
            "pdf": "",
            "status": "unavailable" if damaged else "ready",
            "sourceIssue": (
                "The supplied PDF contains damaged image data and cannot be previewed. A replacement original is needed."
                if damaged else None
            ),
            "pages": [],
        })
        source_record = {
            "id": catalogue["id"],
            "source": f"Owner-supplied image-only catalogue: {catalogue['id']}",
            "sha256": hashlib.sha256(source_bytes).hexdigest(),
            "sourceBytes": len(source_bytes),
            "pageCount": page_count,
            "sourcePageDimensionsPt": [
                [float(page.mediabox.width), float(page.mediabox.height)] for page in reader.pages
            ],
            "corruptedImagePages": damaged,
            "replacementCharacterCount": source_bytes.count(b"\xef\xbf\xbd"),
        }
        if damaged:
            print(f"{catalogue['id']}: unavailable; damaged JPEG data on {len(damaged)}/{page_count} pages")
        else:
            folder = OUTPUT / catalogue["id"]
            folder.mkdir(parents=True, exist_ok=True)
            # Windows scanners can briefly retain PNG handles after encoding.
            # A best-effort cache cleanup must not invalidate finished assets.
            with tempfile.TemporaryDirectory(prefix="brochure-", dir=temp_root, ignore_cleanup_errors=True) as temporary:
                if not Path(temporary).resolve().is_relative_to(temp_root):
                    raise RuntimeError("Render temporary directory must remain inside tmp/pdfs.")
                jobs = [
                    (executable, source, folder, Path(temporary), number,
                     args.long_edge, args.quality, catalogue["title"])
                    for number in range(1, page_count + 1)
                ]
                with ThreadPoolExecutor(max_workers=4) as pool:
                    record["pages"] = list(pool.map(render_page, jobs))
            record["cover"] = record["pages"][0]["src"]
            record["width"] = record["pages"][0]["width"]
            record["height"] = record["pages"][0]["height"]
            record["pdf"] = f"/brochures/{catalogue['id']}/catalogue.pdf"
            shutil.copyfile(source, folder / "catalogue.pdf")
            make_contact_sheet(ROOT / "tmp" / "pdfs" / catalogue["id"], record["pages"])
            print(f"{catalogue['id']}: rendered all {page_count} pages")
        records.append(record)
        manifest.append(source_record)

    types = '''/** VAVI publication and supplied image-only catalogues; see docs/brochure-assets.md. */
import surfaceStudiesPublication from "../../public/brochures/surface-studies/publication.json";

export type BrochurePage = {
  src: string;
  alt: string;
  thumbnail: string;
  width: number;
  height: number;
};

export type Brochure = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  format: string;
  pageCount: number;
  /** Native page ratio. Each rendered page also carries its own dimensions. */
  width: number;
  height: number;
  cover: string;
  pdf: string;
  status: "ready" | "unavailable";
  sourceIssue: string | null;
  pages: BrochurePage[];
};

// Build Surface Studies with scripts/build-vavi-brochure.cjs before regenerating.
export const brochures: Brochure[] = [
  surfaceStudiesPublication.brochure as Brochure,
'''
    assert_public_branding(records)
    assert_public_branding(manifest)
    catalogue_entries = json.dumps(records, indent=2, ensure_ascii=False)[2:-2]
    (ROOT / "src/lib/brochures.ts").write_text(types + catalogue_entries + "\n];\n", encoding="utf-8")
    (OUTPUT / "manifest.json").write_text(json.dumps({
        "generator": "scripts/prepare-brochure-assets.py",
        "renderLongEdge": args.long_edge,
        "webpQuality": args.quality,
        "sources": manifest,
    }, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
