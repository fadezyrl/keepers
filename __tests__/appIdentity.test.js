const fs = require('fs');
const path = require('path');
const {
  ANDROID_VERSION_NAME,
  APP_DISPLAY_NAME,
  IOS_MARKETING_VERSION,
} = require('../src/config/appIdentity');

const root = path.join(__dirname, '..');

test('application name matches the Android app label', () => {
  const strings = fs.readFileSync(
    path.join(root, 'android/app/src/main/res/values/strings.xml'),
    'utf8',
  );
  const match = strings.match(/name="app_name">([^<]+)</);
  expect(match?.[1]).toBe(APP_DISPLAY_NAME);
});

test('Android version matches versionName', () => {
  const gradle = fs.readFileSync(
    path.join(root, 'android/app/build.gradle'),
    'utf8',
  );
  const match = gradle.match(/versionName\s+"([^"]+)"/);
  expect(match?.[1]).toBe(ANDROID_VERSION_NAME);
});

test('iOS version matches MARKETING_VERSION', () => {
  const project = fs.readFileSync(
    path.join(root, 'ios/keepers.xcodeproj/project.pbxproj'),
    'utf8',
  );
  const versions = [...project.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map(
    match => match[1].trim(),
  );
  expect(versions.length).toBeGreaterThan(0);
  versions.forEach(version => {
    expect(version).toBe(IOS_MARKETING_VERSION);
  });
});
