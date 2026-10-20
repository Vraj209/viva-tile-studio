"""Extract only image streams from the privately retained source publication."""
import hashlib
import json
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data/brouchers/Eton__1200x2400mm_Evoke_Collection.pdf"
OUT = ROOT / "public/brochures/products"
CROP = (9, 10, 392, 776)


def main():
    reader = PdfReader(SOURCE)
    OUT.mkdir(parents=True, exist_ok=True)
    records = []
    for code, page_number in zip(range(10465, 10489), [3, *range(5, 28)]):
        page = reader.pages[page_number - 1]
        assert len(page.images) == 1
        native = page.images[0].image
        assert native.size == (400, 785)
        panel = native.crop(CROP)
        target = OUT / f"surface-studies-{code}.webp"
        panel.save(target, "WEBP", lossless=True, exact=True, method=6)
        with Image.open(target) as check:
            assert panel.convert("RGBA").tobytes() == check.convert("RGBA").tobytes()
        records.append({
            "id": f"surface-studies-{code}",
            "sourceSha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
            "sourcePage": page_number,
            "nativeWidth": 400,
            "nativeHeight": 785,
            "pixelCrop": list(CROP),
            "texture": f"/brochures/products/{target.name}",
            "textureSha256": hashlib.sha256(target.read_bytes()).hexdigest(),
            "textureBytes": target.stat().st_size,
        })
    room = reader.pages[3]
    images = [
        ref.get_object() for ref in room["/Resources"]["/XObject"].values()
        if ref.get_object().get("/Subtype") == "/Image"
    ]
    assert len(images) == 1 and images[0].get("/Filter") == "/DCTDecode"
    original_jpeg = images[0].get_data()
    assert original_jpeg.startswith(b"\xff\xd8")
    target = OUT / "surface-studies-10465-interior.jpg"
    target.write_bytes(original_jpeg)
    with Image.open(target) as check:
        assert check.size == (794, 1123)
    work = ROOT / "work/vavi-brochure"
    work.mkdir(parents=True, exist_ok=True)
    (work / "image-provenance.json").write_text(json.dumps({
        "privateSource": str(SOURCE.relative_to(ROOT)),
        "products": records,
        "interior": {"sha256": hashlib.sha256(original_jpeg).hexdigest(),
                     "sourcePage": 4, "width": 794, "height": 1123},
    }, indent=2), encoding="utf-8")
    print("Verified 24 lossless full-panel images and one unchanged interior JPEG.")


if __name__ == "__main__":
    main()
