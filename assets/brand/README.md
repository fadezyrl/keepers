# Brand assets

## App icon

Generated launcher artwork lives here:

- `app-icon.png` — 1024×1024 master (deep black field + ivory BrandLogo emblem)
- `app-icon-foreground.png` — transparent adaptive-icon foreground master

Native installs are produced by:

```sh
python scripts/generate_app_icons.py
```

That script refreshes:

- Android `mipmap-*` launcher / round / adaptive foreground + monochrome layers
- Android `mipmap-anydpi-v26` adaptive icon XML
- iOS `Images.xcassets/AppIcon.appiconset`

## Wordmark logo (in-app)

Client vector exports live as:

- `logo-light.png` — ivory mark for dark / photo backgrounds
- `logo-dark.png` — black mark for light backgrounds
- `logo.png` — alias of the light mark

`BrandLogo` already uses these (`USE_IMAGE_LOGO = true`).

Refresh launcher icons after logo changes:

```sh
python scripts/generate_app_icons.py
```
