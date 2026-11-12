"""One-off: import client-data photos + extract logo PNGs for Keepers."""

from __future__ import annotations

import io
import shutil
from pathlib import Path

import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CLIENT = ROOT / "assets" / "client-data"
BRAND = ROOT / "assets" / "brand"
IMAGES = ROOT / "assets" / "images"

# Photography curation lives in scripts/_curate_client_photos.py
# (client pack + limited personal-car use). This map is unused for photos.
PHOTO_MAP: dict[str, str] = {}


def ensure_dirs() -> None:
    for sub in (
        "heroes",
        "trips",
        "events",
        "gallery",
        "vehicles",
        "team",
    ):
        (IMAGES / sub).mkdir(parents=True, exist_ok=True)
    BRAND.mkdir(parents=True, exist_ok=True)


def copy_photos() -> None:
    """Delegate photo curation — do not blanket-map personal car everywhere."""
    import runpy

    print("photos -> running _curate_client_photos.py")
    runpy.run_path(str(Path(__file__).with_name("_curate_client_photos.py")), run_name="__main__")


def render_pdf_page(pdf_path: Path, scale: float = 6.0) -> Image.Image:
    doc = pymupdf.open(pdf_path)
    page = doc[0]
    mat = pymupdf.Matrix(scale, scale)
    pix = page.get_pixmap(matrix=mat, alpha=True)
    return Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGBA")


def trim_transparent(img: Image.Image, pad: int = 16) -> Image.Image:
    bbox = img.getbbox()
    if not bbox:
        return img
    left, top, right, bottom = bbox
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(img.width, right + pad)
    bottom = min(img.height, bottom + pad)
    return img.crop((left, top, right, bottom))


def extract_logos() -> None:
    # Prefer stickers PDF — usually cleaner single mark
    stickers = CLIENT / "Keepers_Stickers_Vector_No_Slogan.pdf"
    flag = CLIENT / "Keepers_Flag_60x40cm_No_Slogan.pdf"

    for label, pdf in (("stickers", stickers), ("flag", flag)):
        raw = render_pdf_page(pdf, scale=8.0)
        preview = BRAND / f"_preview_{label}.png"
        raw.save(preview)
        print(f"preview {label}: {preview.name} {raw.size}")

    # Use stickers as primary logo source, trim empty canvas
    logo = trim_transparent(render_pdf_page(stickers, scale=10.0), pad=24)
    # If still huge canvas with tiny mark, try content bbox again after
    # converting near-white to transparent for light marks on white.
    logo_path = BRAND / "logo.png"
    logo.save(logo_path)
    print(f"logo -> {logo_path.relative_to(ROOT)} {logo.size}")

    # Light + dark variants for BrandLogo tones:
    # dark bg screens need light mark; light bg need dark mark.
    # If PDF mark is black on transparent, invert for dark tone.
    dark = logo.copy()
    pixels = dark.load()
    assert pixels is not None
    for y in range(dark.height):
        for x in range(dark.width):
            r, g, b, a = pixels[x, y]
            if a < 8:
                continue
            # Invert dark ink to ivory for dark backgrounds
            lum = (r + g + b) / 3
            if lum < 200:
                pixels[x, y] = (243, 240, 234, a)
    dark_path = BRAND / "logo-light.png"
    dark.save(dark_path)
    print(f"logo-light -> {dark_path.relative_to(ROOT)} {dark.size}")

    # Keep original as dark-ink mark for light backgrounds
    shutil.copy2(logo_path, BRAND / "logo-dark.png")
    print("logo-dark -> assets/brand/logo-dark.png")


def main() -> None:
    ensure_dirs()
    copy_photos()
    extract_logos()
    print("done")


if __name__ == "__main__":
    main()
