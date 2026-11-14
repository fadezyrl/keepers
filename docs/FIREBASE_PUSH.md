# Mobile Firebase / FCM setup

## Android — ready for device verification

- Package: `com.keepers`
- `android/app/google-services.json` (project `keepers-68d3e`)
- Google Services Gradle plugin
- `@react-native-firebase/app` + `@react-native-firebase/messaging`
- `POST_NOTIFICATIONS` permission + `keepers_default` channel
- Token register/refresh/logout handled by `src/notifications/PushBootstrap.tsx`

Rebuild after native changes:

```bash
npx react-native run-android
```

## iOS — blocked until external config

1. Firebase Console → add iOS app with bundle id `com.keepers`
2. Add `ios/keepers/GoogleService-Info.plist`
3. Upload APNs key to Firebase
4. Xcode capabilities: Push Notifications, Background Modes → Remote notifications
5. `cd ios && pod install`
6. Real device test (not simulator)

## Deep links

| Destination | URL |
|-------------|-----|
| Trip | `keepers://trips/:tripId` |
| Notifications | `keepers://notifications` |
| Progress | `keepers://progress` |
| Marshall upgrades | `keepers://marshall/upgrades` |

## Preferences

Settings → Notification preferences. Account/admin notices are not silently disabled server-side for `admin` type.
