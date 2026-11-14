# Keepers Adventures — Release readiness

## Android release signing (required)

Release builds **must not** use the debug keystore.

1. Generate an upload keystore (once):
   ```bash
   cd android
   keytool -genkeypair -v -storetype PKCS12 \
     -keystore app/keepers-upload.keystore \
     -alias keepers-upload \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Copy `android/keystore.properties.example` → `android/keystore.properties` and fill passwords.
   `storeFile` is resolved from the `android/` root (e.g. `app/keepers-upload.keystore`).
3. `keystore.properties` and `*.keystore` (except `debug.keystore`) are gitignored.
4. **Back up** the keystore + passwords offline (password manager / secure vault). Losing them blocks Play Store updates.
5. Build:
   ```bash
   set GRADLE_USER_HOME=D:\g
   cd android
   gradlew.bat bundleRelease
   ```
6. Output: `android/app/build/outputs/bundle/release/app-release.aab`

If `keystore.properties` is missing, `assembleRelease` / `bundleRelease` fails fast by design.

### Temporary local upload keystore

A local upload keystore may exist for CI/dev release smoke tests. **Rotate passwords** before Play production and treat any shared temp password as compromised.

## Production API / env

| Variable | Where | Notes |
|----------|--------|--------|
| `API_BASE_URL` | mobile `.env` / CI secrets | HTTPS production Express API, e.g. `https://api.example.com/api` |
| Supabase URL + anon | backend only for client if needed | Service role **never** in the app |
| `DATABASE_URL` | backend `.env` | Server only |

Confirm password-reset emails: Supabase Auth → Email Templates → “Reset password” with redirect `keepers://auth/reset-password` (see `src/config/linking.ts`).

## iOS / TestFlight (blocked on Apple membership)

1. Open `ios/keepers.xcworkspace` in Xcode.
2. Signing & Capabilities → Team = client Apple Developer Team.
3. Unique Bundle ID matching App Store Connect.
4. Archive → Distribute → TestFlight once membership is active.
5. Deep link scheme `keepers://` is already used for password reset.

## Security checklist

- No demo credentials in the mobile login flow.
- Do not run `seed:demo` on production without `SEED_DEMO_PASSWORD`.
- Clear account cache on logout (TanStack Query persistence).
- Release APK/AAB signed with upload keystore only.
