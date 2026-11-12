/**
 * Keepers mobile → Express API base URL.
 * Override with a Metro/babel env approach later if needed.
 * Android emulator: 10.0.2.2 maps to host localhost.
 * iOS simulator: localhost works.
 */
import {Platform} from 'react-native';

const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';

export const API_BASE_URL = `http://${DEV_HOST}:4000/api`;

export const STORAGE_KEYS = {
  accessToken: '@keepers/access_token',
  refreshToken: '@keepers/refresh_token',
  theme: '@keepers/theme',
} as const;
