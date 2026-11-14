module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-gesture-handler|react-native-reanimated|react-native-screens|react-native-safe-area-context|react-native-svg|react-native-video|react-native-worklets|react-native-calendar-events|react-native-image-picker|@react-native-async-storage|@react-native-community|@tanstack)/)',
  ],
};
