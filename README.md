# Keepers Adventures 4x4

Premium React Native mobile app for the Keepers Adventures exclusive off-road club.

## Stack

- React Native 0.88
- React Navigation (native stack + bottom tabs)
- Local demo data + AsyncStorage persistence
- Monochrome Keepers brand system

## Run

```sh
npm install
npm start
npm run android
# or
npm run ios
```

### Demo credentials

| Field | Value |
|---|---|
| Email | `jovany@keepers.ae` |
| Password | `keepers123` |
| OTP | `4821` |

Auth, profile, trip registrations and notifications persist locally on device.

## Architecture

```
src/
  theme/          Brand colors, typography, spacing
  components/     Reusable premium UI primitives
  context/        App state (auth, trips, notifications)
  data/           Demo content + image registry
  navigation/     Auth stack, tabs, root stack
  screens/        Auth, Home, Trips, Settings, About + supporting flows
  utils/          Form validation + helpers
assets/
  brand/          Drop official logo.png here
  images/         Local image assets (optional)
```

## Brand palette

Luxury editorial identity (aligned with Keepers website):

- Deep Black `#111110`
- Warm Ivory `#F3F0EA`
- Soft Cream `#E5E1DA`
- Warm Greige `#D2CEC6`
- Stone Grey `#A9A49B`
- White `#FFFFFF`

## Assets

Client logo + photography are local:

- `assets/brand/logo-light.png` / `logo-dark.png` → `BrandLogo` + launcher icons
- `assets/images/{heroes,trips,events,gallery,vehicles}/` → `src/data/images.ts`

Re-import from `assets/client-data` with:

```sh
python scripts/_import_client_assets.py
python scripts/generate_app_icons.py
```
