import {Platform} from 'react-native';

/**
 * Installed application identity.
 * These values are the native release identifiers, not a UI placeholder:
 * - name: android/app/src/main/res/values/strings.xml (app_name)
 * - Android version: android/app/build.gradle (versionName)
 * - iOS version: MARKETING_VERSION in ios/keepers.xcodeproj/project.pbxproj
 */
export const APP_DISPLAY_NAME = 'Keepers Adventures';

export const ANDROID_VERSION_NAME = '1.0.0';

export const IOS_MARKETING_VERSION = '1.0';

export function getAppVersion(): string {
  return Platform.OS === 'ios' ? IOS_MARKETING_VERSION : ANDROID_VERSION_NAME;
}
