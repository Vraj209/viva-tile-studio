"""Render owner-supplied PDF catalogues without changing their artwork or page order.

Requires Python 3, Pillow, pypdf and Poppler's pdftoppm. Run from any directory:
    python scripts/prepare-brochure-assets.py
"""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import shutil
import subprocess
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image, ImageDraw, ImageStat
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "brochures"
SOURCE_ORIGINS = {
    "new-poster": "https://drive.google.com/file/d/1_mAIgNT1YPAefgNc3TBGtkFJZmmC6xPf/view?usp=drivesdk",
}
CATALOGUES = [
    {
        "id": "evoke",
        "source": "Eton__1200x2400mm_Evoke_Collection.pdf",
        "title": "Evoke Collection",
        "subtitle": "Craft, colour & composition",
        "description": "Explore expressive surfaces, sculptural patterns and room settings from the Evoke collection.",
        "format": "1200 × 2400 mm",
    },
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

# Descriptions identify visible content only. Codes are transcribed from the
# Evoke PDF; the untitled artwork document does not contain product codes.
PAGE_DESCRIPTIONS = {
    "evoke": [
        "Cover with hands holding dried foliage against a pale blue background",
        "Introduction to handmade tiles with a decorative panel in an architectural setting",
        "Design 10465: layered terracotta leaves and small flowers",
        "Design 10465 shown beside a timber entrance door and an ivory console table",
        "Design 10466: gold and brown ornamental scrollwork",
        "Design 10467: terracotta discs on a blue textured ground",
        "Design 10468: gold floral medallions on a dark brown ground",
        "Design 10469: golden leaves and butterflies on a cream ground",
        "Design 10470: grey ornamental motifs and geometric textures",
        "Design 10471: gold botanical ornament on ivory",
        "Design 10472: blue and rust patchwork with ornamental details",
        "Design 10473: a gold circular medallion on black with patterned borders",
        "Design 10474: golden foliage on a pale textured ground",
        "Design 10475: curling branches and small blue flowers on beige",
        "Design 10476: intricate copper-coloured ornament over teal",
        "Design 10477: flowing brown and gold floral shapes",
        "Design 10478: pale botanical relief on a weathered grey ground",
        "Design 10479: gold medallions on blue and brown patchwork",
        "Design 10480: a cream ornamental panel with a rust-coloured border",
        "Design 10481: grey geometric shapes with fine linear textures",
        "Design 10482: beige patchwork with carved botanical motifs",
        "Design 10483: overlapping pale wooden bowl-like circles",
        "Design 10484: angular golden ornament on a black ground",
        "Design 10485: four long gold-coloured leaves on black",
        "Design 10486: layered cream and brown geometric forms",
        "Design 10487: a fine cream ornamental pattern on gold",
        "Design 10488: an intricate ivory scrolling botanical panel",
    ],
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
    executable = find_poppler()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    temp_root = (ROOT / "tmp" / "pdfs").resolve()
    temp_root.mkdir(parents=True, exist_ok=True)
    records, manifest = [], []

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
            "source": str(source.relative_to(ROOT)).replace("\\", "/"),
            "sha256": hashlib.sha256(source_bytes).hexdigest(),
            "sourceBytes": len(source_bytes),
            "pageCount": page_count,
            "sourcePageDimensionsPt": [
                [float(page.mediabox.width), float(page.mediabox.height)] for page in reader.pages
            ],
            "corruptedImagePages": damaged,
            "replacementCharacterCount": source_bytes.count(b"\xef\xbf\xbd"),
        }
        if catalogue["id"] in SOURCE_ORIGINS:
            source_record["sourceUrl"] = SOURCE_ORIGINS[catalogue["id"]]
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

    types = '''/** Generated from owner-supplied PDFs; see docs/brochure-assets.md. */
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

// Regenerate with: python scripts/prepare-brochure-assets.py
export const brochures: Brochure[] = '''
    (ROOT / "src/lib/brochures.ts").write_text(types + json.dumps(records, indent=2, ensure_ascii=False) + ";\n", encoding="utf-8")
    (OUTPUT / "manifest.json").write_text(json.dumps({
        "generator": "scripts/prepare-brochure-assets.py",
        "renderLongEdge": args.long_edge,
        "webpQuality": args.quality,
        "sources": manifest,
    }, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
