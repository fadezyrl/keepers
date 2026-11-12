"""
Generate Keepers Adventures launcher icons from the client wordmark.
Produces Android mipmaps + adaptive layers and iOS AppIcon assets.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]

BLACK = (17, 17, 16, 255)  # #111110
TRANSPARENT = (0, 0, 0, 0)


def load_client_mark() -> Image.Image:
    """Official Keepers wordmark (light on transparent), tightly cropped."""
    path = ROOT / "assets" / "brand" / "logo-light.png"
    mark = Image.open(path).convert("RGBA")
    bbox = mark.getbbox()
    if bbox:
        mark = mark.crop(bbox)
    return mark


def render_emblem(
    size: int,
    *,
    background: tuple[int, int, int, int] | None,
    emblem_scale: float = 0.88,
) -> Image.Image:
    """
    Place the client Keepers wordmark on a square canvas.
    emblem_scale = max width relative to canvas. Height is capped so the
    wide wordmark stays sharp and as large as the square allows.
    """
    img = Image.new("RGBA", (size, size), background or TRANSPARENT)
    mark = load_client_mark()
    max_w = max(1, int(size * emblem_scale))
    max_h = max(1, int(size * 0.42))  # wide mark — keep readable height band
    scale = min(max_w / mark.width, max_h / mark.height)
    target_w = max(1, int(mark.width * scale))
    target_h = max(1, int(mark.height * scale))
    mark = mark.resize((target_w, target_h), Image.Resampling.LANCZOS)
    x = (size - target_w) // 2
    y = (size - target_h) // 2
    img.paste(mark, (x, y), mark)
    return img


def make_round_mask(size: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size - 1, size - 1), fill=255)
    return mask


def composite_launcher(size: int, round_mask: bool = False) -> Image.Image:
    base = Image.new("RGBA", (size, size), BLACK)
    # Fill the square with the official wordmark (same asset as in-app BrandLogo).
    emblem = render_emblem(size, background=None, emblem_scale=0.92)
    out = Image.alpha_composite(base, emblem)
    if round_mask:
        rounded = Image.new("RGBA", (size, size), TRANSPARENT)
        rounded.paste(out, (0, 0), make_round_mask(size))
        return rounded
    return out.convert("RGBA")


def save_png(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    # Flatten to RGB with black for non-transparent launcher icons when needed
    if path.name.startswith("ic_launcher") and "foreground" not in path.name and "monochrome" not in path.name:
        bg = Image.new("RGB", img.size, BLACK[:3])
        bg.paste(img, mask=img.split()[-1])
        bg.save(path, format="PNG", optimize=True)
    else:
        img.save(path, format="PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)} ({img.size[0]}x{img.size[1]})")


def generate_android() -> None:
    res = ROOT / "android" / "app" / "src" / "main" / "res"
    densities = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }

    for folder, size in densities.items():
        square = composite_launcher(size, round_mask=False)
        round_icon = composite_launcher(size, round_mask=True)
        save_png(square, res / folder / "ic_launcher.png")
        save_png(round_icon, res / folder / "ic_launcher_round.png")

    # Adaptive layers — 108dp baseline; xxxhdpi = 432px
    adaptive_sizes = {
        "mipmap-mdpi": 108,
        "mipmap-hdpi": 162,
        "mipmap-xhdpi": 216,
        "mipmap-xxhdpi": 324,
        "mipmap-xxxhdpi": 432,
    }
    for folder, size in adaptive_sizes.items():
        # Foreground: transparent canvas, emblem inside adaptive safe zone (~72%)
        foreground = render_emblem(size, background=None, emblem_scale=0.72)
        save_png(foreground, res / folder / "ic_launcher_foreground.png")

        # Monochrome: ivory mark on transparent for Android themed icons
        mono = render_emblem(size, background=None, emblem_scale=0.72)
        save_png(mono, res / folder / "ic_launcher_monochrome.png")

    # Solid background color resource
    values = res / "values"
    values.mkdir(parents=True, exist_ok=True)
    (values / "ic_launcher_background.xml").write_text(
        """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#111110</color>
</resources>
""",
        encoding="utf-8",
    )
    print("wrote values/ic_launcher_background.xml")

    anydpi = res / "mipmap-anydpi-v26"
    anydpi.mkdir(parents=True, exist_ok=True)
    adaptive = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
    <monochrome android:drawable="@mipmap/ic_launcher_monochrome"/>
</adaptive-icon>
"""
    (anydpi / "ic_launcher.xml").write_text(adaptive, encoding="utf-8")
    (anydpi / "ic_launcher_round.xml").write_text(adaptive, encoding="utf-8")
    print("wrote mipmap-anydpi-v26 adaptive icons")


def generate_ios() -> None:
    appicon = ROOT / "ios" / "keepers" / "Images.xcassets" / "AppIcon.appiconset"
    # Remove legacy default icon if present without filename entries
    for existing in appicon.glob("*.png"):
        existing.unlink()
        print(f"removed {existing.relative_to(ROOT)}")

    specs = [
        ("fiona.g@example.net", 40),
        ("grace.l@example.com", 60),
        ("aaron.s@example.org", 58),
        ("nina.v@example.com", 87),
        ("paula.r@example.org", 80),
        ("paula.r@example.org", 120),
        ("laura.c@example.net", 120),
        ("james.b@example.com", 180),
        ("Icon-App-1024x1024@1x.png", 1024),
    ]

    contents = {
        "images": [
            {"filename": "fiona.g@example.net", "idiom": "iphone", "scale": "2x", "size": "20x20"},
            {"filename": "grace.l@example.com", "idiom": "iphone", "scale": "3x", "size": "20x20"},
            {"filename": "aaron.s@example.org", "idiom": "iphone", "scale": "2x", "size": "29x29"},
            {"filename": "nina.v@example.com", "idiom": "iphone", "scale": "3x", "size": "29x29"},
            {"filename": "paula.r@example.org", "idiom": "iphone", "scale": "2x", "size": "40x40"},
            {"filename": "paula.r@example.org", "idiom": "iphone", "scale": "3x", "size": "40x40"},
            {"filename": "laura.c@example.net", "idiom": "iphone", "scale": "2x", "size": "60x60"},
            {"filename": "james.b@example.com", "idiom": "iphone", "scale": "3x", "size": "60x60"},
            {
                "filename": "Icon-App-1024x1024@1x.png",
                "idiom": "ios-marketing",
                "scale": "1x",
                "size": "1024x1024",
            },
        ],
        "info": {"author": "xcode", "version": 1},
    }

    import json

    for filename, size in specs:
        icon = composite_launcher(size, round_mask=False)
        # App Store requires no alpha on 1024 marketing icon
        rgb = Image.new("RGB", (size, size), BLACK[:3])
        rgb.paste(icon, mask=icon.split()[-1])
        out = appicon / filename
        rgb.save(out, format="PNG", optimize=True)
        print(f"wrote {out.relative_to(ROOT)} ({size}x{size})")

    (appicon / "Contents.json").write_text(
        json.dumps(contents, indent=2) + "\n", encoding="utf-8"
    )
    print("updated AppIcon Contents.json")


def generate_master() -> None:
    brand = ROOT / "assets" / "brand"
    brand.mkdir(parents=True, exist_ok=True)
    master = composite_launcher(1024, round_mask=False)
    path = brand / "app-icon.png"
    rgb = Image.new("RGB", master.size, BLACK[:3])
    rgb.paste(master, mask=master.split()[-1])
    rgb.save(path, format="PNG", optimize=True)
    print(f"wrote {path.relative_to(ROOT)}")

    # Transparent foreground master for future edits
    fg = render_emblem(1024, background=None, emblem_scale=0.72)
    fg_path = brand / "app-icon-foreground.png"
    fg.save(fg_path, format="PNG", optimize=True)
    print(f"wrote {fg_path.relative_to(ROOT)}")


def main() -> None:
    generate_master()
    generate_android()
    generate_ios()
    print("done")


if __name__ == "__main__":
    main()
