# Mobile ↔ API integration

The React Native app talks only to the Express API (`src/config/api.ts`).

- Android emulator: `http://10.0.2.2:4000/api`
- iOS simulator: `http://127.0.0.1:4000/api`
- Physical device: change host to your machine LAN IP

Tokens are stored in AsyncStorage (`access_token` / `refresh_token`). Theme preference is also AsyncStorage. Service-role keys are never shipped in the app.

## Auth

- Login / signup / logout → Express + Supabase Auth
- Forgot password → email reset link with deep link `keepers://auth/reset-password`
- Change password → `POST /auth/change-password` (reauth with current password)
- Delete account → `POST /auth/delete-account` with password confirmation
- No OTP / demo credentials

## Content

- Home / trips / directory / notifications / documents / legal → live API
- Trip details and member profiles fetch by id
- Trips calendar uses `/trips/calendar` (date filter hits backend range)
- Profile / vehicle photos: `react-native-image-picker` → `/content/media/upload`

## Marshall

- Settings → Marshall (role-gated)
- `GET /trips/mine/organized` for own drives
- Attendance / ratings / `GET /ratings/upgrades/mine`
- Drive participants → **Message** opens private Marshall↔Member chat

## Chat

- Inbox / thread screens; entry from AppHeader, Settings, Trip Details
- REST: `/chat/inbox`, `/chat/conversations/:id`, messages, attachments, delivered/read
- Realtime: Socket.IO on API origin (`API_BASE_URL` without `/api`), JWT + per-action ACL
- Media: private Supabase `chat` bucket; voice needs mic permission (Android + iOS)
- Deep links: `keepers://chat`, `keepers://chat/:conversationId`
- Push type `chat` suppressed while that device marks the conversation as viewing

## Splash

Approved splash visual unchanged; display hold **4800ms**.
