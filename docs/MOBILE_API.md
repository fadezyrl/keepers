# Mobile ↔ API integration

The React Native app talks only to the Express API (`src/config/api.ts`).

- Android emulator: `http://10.0.2.2:4000/api`
- iOS simulator: `http://127.0.0.1:4000/api`
- Physical device: change host to your machine LAN IP

Tokens are stored in AsyncStorage (`access_token` / `refresh_token`). Service-role keys are never shipped in the app.

## Role-aware Marshall UI

Members with roles `marshall`, `pre_marshall`, `admin`, or `super_admin` see **Marshall** under Settings, which opens:

- Marshall hub
- Create drive
- Drive participants + attendance
- Rate member (configurable criteria)
- Upgrade recommendation status

## Splash

Approved splash visual is unchanged; display hold extended to **4800ms**.
