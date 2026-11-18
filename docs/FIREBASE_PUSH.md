# Mobile Firebase / FCM setup

## Identifiers

| Platform | Identifier | Firebase config |
|----------|------------|-----------------|
| Android | Package `com.keepers` | `android/app/google-services.json` |
| iOS | Bundle ID `com.keepers.adventures` | `ios/GoogleService-Info.plist` |

Firebase project: `keepers-68d3e`

## Android — ready for device verification

- Package: `com.keepers` (do not change)
- `android/app/google-services.json` (project `keepers-68d3e`)
- Google Services Gradle plugin
- `@react-native-firebase/app` + `@react-native-firebase/messaging`
- `POST_NOTIFICATIONS` permission + `keepers_default` channel
- Token register/refresh/logout handled by `src/notifications/PushBootstrap.tsx`

Rebuild after native changes:

```bash
npx react-native run-android
```

## iOS — project config (code)

- Bundle ID: `com.keepers.adventures`
- Firebase plist: `ios/GoogleService-Info.plist` (bundled by the Keepers target; do not use a duplicate under `ios/keepers/`)
- Push entitlement: `ios/keepers/keepers.entitlements` (`aps-environment`)
- Background mode: Remote notifications (`UIBackgroundModes` in `ios/keepers/Info.plist`)
- `@react-native-firebase/app` + `@react-native-firebase/messaging`
- Token register/refresh/logout: `src/notifications/PushBootstrap.tsx`

Rebuild after native changes:

```bash
cd ios && pod install
npx react-native run-ios
```

## iOS — still required outside the repo

1. App Store Connect app for `com.keepers.adventures`
2. Xcode Signing & Capabilities → select the client Apple Developer Team (Automatic signing)
3. Upload an APNs Auth Key (or certificate) to Firebase Console → Project settings → Cloud Messaging
4. Real-device push test (simulator cannot fully verify APNs delivery)

## Deep links

| Destination | URL |
|-------------|-----|
| Trip | `keepers://trips/:tripId` |
| Notifications | `keepers://notifications` |
| Progress | `keepers://progress` |
| Marshall upgrades | `keepers://marshall/upgrades` |

## Preferences

Settings → Notification preferences. Account/admin notices are not silently disabled server-side for `admin` type.
