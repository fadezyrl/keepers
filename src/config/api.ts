/**
 * Keepers mobile → Express API base URL from `.env` (via react-native-dotenv).
 *
 * Set `API_BASE_URL` in the project root `.env`:
 * - Production:       https://keepers-admin-portal.onrender.com/api
 * - Android emulator: http://10.0.2.2:4000/api
 * - iOS simulator:    http://127.0.0.1:4000/api
 * - Physical device:  http://<PC_LAN_IP>:4000/api
 */
import {API_BASE_URL as ENV_API_BASE_URL} from '@env';

const FALLBACK_API_BASE_URL =
  'https://keepers-admin-portal.onrender.com/api';

export const API_BASE_URL = (ENV_API_BASE_URL || FALLBACK_API_BASE_URL).replace(
  /\/$/,
  '',
);

export const STORAGE_KEYS = {
  accessToken: '@keepers/access_token',
  refreshToken: '@keepers/refresh_token',
  theme: '@keepers/theme',
  cacheUserId: '@keepers/cache_user_id',
  queryCachePrefix: '@keepers/rq/',
  /** Last successful sign-in email — prefilled after logout. */
  lastLoginEmail: '@keepers/last_login_email',
} as const;
