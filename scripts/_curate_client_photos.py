"""
Curate Keepers photography from client-data + sparse clean stock.

Rules (client feedback):
- Keep lasers splash hero (opening frame).
- Use client photos — do NOT wipe the pack for Unsplash.
- Do NOT put the personal Jeep everywhere; limit hero personal-car shots.
- Prefer group / activity / brand shots for trips, home, gallery.
- Stock only fills gaps; no rival-club flags.
"""

from __future__ import annotations

import shutil
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CLIENT = ROOT / "assets" / "client-data"
IMAGES = ROOT / "assets" / "images"

# --- Client source filenames ---
LASERS_SPLASH = "WhatsApp Image 2026-11-12 at 7.38.26 PM (3).jpeg"
SUNSET_CONVOY = "WhatsApp Image 2026-11-12 at 7.38.25 PM (1).jpeg"
NIGHT_OASIS = "WhatsApp Image 2026-11-12 at 7.38.25 PM.jpeg"
CAMEL_CONVOY = "WhatsApp Image 2026-11-12 at 7.38.26 PM (4).jpeg"
WADI_GROUP = "WhatsApp Image 2026-11-12 at 7.38.26 PM.jpeg"  # personal + group context
COASTAL_CONVOY = "WhatsApp Image 2026-11-12 at 7.38.27 PM.jpeg"
BEACH_PERSONAL = "WhatsApp Image 2026-11-12 at 7.38.26 PM (2).jpeg"  # limited use
DUNE_PERSONAL = "WhatsApp Image 2026-11-12 at 7.38.26 PM (1).jpeg"  # limited use
BRAND_STICKER = "WhatsApp Image 2026-11-12 at 9.28.26 PM.jpeg"
FLYER_WADI = "WhatsApp Image 2026-11-12 at 9.28.26 PM (1).jpeg"
FLYER_ANNOUNCE = "WhatsApp Image 2026-11-12 at 9.28.27 PM.jpeg"
FLYER_CHAPTER = "WhatsApp Image 2026-11-12 at 9.28.27 PM (1).jpeg"

# Destinations that come from client files (personal car only where noted).
CLIENT_MAP: dict[str, str] = {
    # Splash — lasers opening (keep)
    "heroes/splash.jpg": LASERS_SPLASH,
    # Home / about — group + brand community, not solo personal car
    "heroes/home.jpg": SUNSET_CONVOY,
    "heroes/about.jpg": FLYER_ANNOUNCE,
    "heroes/auth.jpg": NIGHT_OASIS,
    # Trips — activity variety; only one personal-led group shot
    "trips/liwa.jpg": CAMEL_CONVOY,
    "trips/hatta.jpg": NIGHT_OASIS,
    # Only ONE trip cover leans on the personal Jeep (group/wadi context).
    "trips/fossil.jpg": WADI_GROUP,
    # Events — Keepers flyers / community graphics
    "events/meetup.jpg": FLYER_CHAPTER,
    "events/workshop.jpg": FLYER_WADI,
    "events/gala.jpg": FLYER_ANNOUNCE,
    # Gallery — group / brand first; personal car only via fossil mirror + coastal once
    "gallery/01-home.jpg": SUNSET_CONVOY,
    "gallery/02-auth.jpg": NIGHT_OASIS,
    "gallery/03-hatta.jpg": CAMEL_CONVOY,
    "gallery/05-night.jpg": NIGHT_OASIS,
    "gallery/06-jebel.jpg": COASTAL_CONVOY,
    "gallery/07-fossil.jpg": WADI_GROUP,
    "gallery/09-brand.jpg": BRAND_STICKER,
    "gallery/logo-on-vehicle.jpg": BRAND_STICKER,
    # Profile vehicle — single dedicated personal-car slot
    "vehicles/primary.jpg": BEACH_PERSONAL,
}

# Remaining slots filled with clean generic stock (no rival flags).
STOCK_MAP: dict[str, str] = {
    "trips/jebel.jpg": "photo-1464822759023-fed622ff2c3b",
    "trips/empty-quarter.jpg": "photo-1501785888041-af3ef285b470",
    "trips/night-drive.jpg": "photo-1419242902214-272b3f66ee7a",
    "gallery/04-liwa.jpg": "photo-1542401886-65d6c61db217",
    "gallery/08-empty.jpg": "photo-1509316785289-025f5b846b35",
}

UA = {"User-Agent": "KeepersAdventuresAssetBot/1.0"}
MAX_SIDE = 1600


def save_jpeg(img: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    rgb = img.convert("RGB")
    w, h = rgb.size
    scale = min(1.0, MAX_SIDE / max(w, h))
    if scale < 1.0:
        rgb = rgb.resize(
            (int(w * scale), int(h * scale)),
            Image.Resampling.LANCZOS,
        )
    rgb.save(dest, "JPEG", quality=88, optimize=True)
    print(f"client -> {dest.relative_to(ROOT)} ({rgb.size[0]}x{rgb.size[1]})")


def write_client() -> None:
    for rel, src_name in CLIENT_MAP.items():
        src = CLIENT / src_name
        if not src.exists():
            raise FileNotFoundError(src)
        save_jpeg(Image.open(src), IMAGES / rel)


def write_stock() -> None:
    for rel, photo_id in STOCK_MAP.items():
        dest = IMAGES / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        url = (
            f"https://images.unsplash.com/{photo_id}"
            f"?auto=format&fit=crop&w=1600&q=82"
        )
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=60) as resp:
            dest.write_bytes(resp.read())
        print(f"stock  -> {dest.relative_to(ROOT)} <- {photo_id}")


def main() -> None:
    for sub in ("heroes", "trips", "events", "gallery", "vehicles"):
        (IMAGES / sub).mkdir(parents=True, exist_ok=True)

    write_client()
    write_stock()

    # Unused personal dune shot kept in pack but not mapped everywhere.
    unused = CLIENT / DUNE_PERSONAL
    print(
        f"note: personal dune shot reserved/unused for spread control: {unused.name}"
        if unused.exists()
        else "note: dune personal missing"
    )
    print(
        f"done — {len(CLIENT_MAP)} client slots, {len(STOCK_MAP)} stock fillers"
    )


if __name__ == "__main__":
    main()
