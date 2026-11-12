"""Replace non-splash Keepers photos with generic stock activity shots."""

from __future__ import annotations

import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "assets" / "images"

# Keep splash.jpg untouched. Generic desert / mountain / night / off-road stock.
MAP = {
    "heroes/home.jpg": "photo-1544198365-f5d60b6d8190",
    "heroes/about.jpg": "photo-1469854523086-cc02fe5d8800",
    "heroes/auth.jpg": "photo-1509316785289-025f5b846b35",
    "trips/liwa.jpg": "photo-1542401886-65d6c61db217",
    "trips/hatta.jpg": "photo-1426604966848-d7adac402bff",
    "trips/fossil.jpg": "photo-1519681393784-d120267933ba",
    "trips/jebel.jpg": "photo-1464822759023-fed622ff2c3b",
    "trips/empty-quarter.jpg": "photo-1501785888041-af3ef285b470",
    "trips/night-drive.jpg": "photo-1419242902214-272b3f66ee7a",
    "events/meetup.jpg": "photo-1519677100203-a0e668c92439",
    "events/workshop.jpg": "photo-1485291571150-772bcfc10da5",
    "events/gala.jpg": "photo-1492684223066-81342ee5ff30",
    "gallery/01-home.jpg": "photo-1544198365-f5d60b6d8190",
    "gallery/02-auth.jpg": "photo-1509316785289-025f5b846b35",
    "gallery/03-hatta.jpg": "photo-1426604966848-d7adac402bff",
    "gallery/04-liwa.jpg": "photo-1542401886-65d6c61db217",
    "gallery/05-night.jpg": "photo-1419242902214-272b3f66ee7a",
    "gallery/06-jebel.jpg": "photo-1464822759023-fed622ff2c3b",
    "gallery/07-fossil.jpg": "photo-1519681393784-d120267933ba",
    "gallery/08-empty.jpg": "photo-1501785888041-af3ef285b470",
    "gallery/09-brand.jpg": "photo-1533473359331-0135ef1b58bf",
    "gallery/logo-on-vehicle.jpg": "photo-1519641471654-76ce0107ad1b",
    "vehicles/primary.jpg": "photo-1519641471654-76ce0107ad1b",
}

UA = {"User-Agent": "KeepersAdventuresAssetBot/1.0"}


def main() -> None:
    for rel, photo_id in MAP.items():
        out = ROOT / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        url = (
            f"https://images.unsplash.com/{photo_id}"
            f"?auto=format&fit=crop&w=1600&q=82"
        )
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = resp.read()
        out.write_bytes(data)
        print(f"wrote {rel} ({len(data)} bytes) <- {photo_id}")

    splash = ROOT / "heroes" / "splash.jpg"
    print(
        f"preserved splash.jpg ({splash.stat().st_size} bytes)"
        if splash.exists()
        else "WARNING: splash.jpg missing"
    )
    print(f"done {len(MAP)} files")


if __name__ == "__main__":
    main()
