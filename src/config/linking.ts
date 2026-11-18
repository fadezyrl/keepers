import {LinkingOptions} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/types';

export const APP_SCHEME = 'keepers';
export const RESET_PASSWORD_PATH = 'auth/reset-password';

/**
 * HTTPS bridge hosted by the Admin Portal.
 * Supabase email links must redirect here (allow-listed in Supabase Auth).
 * The page forwards tokens into keepers://…?access_token=… (query, not hash).
 */
export const MOBILE_RESET_BRIDGE_URL =
  'https://keepers-admin-portal.vercel.app/auth/mobile-reset';

export const RESET_REDIRECT_URL = MOBILE_RESET_BRIDGE_URL;
export const APP_RESET_DEEP_LINK = `${APP_SCHEME}://${RESET_PASSWORD_PATH}`;

/**
 * Parse Supabase recovery tokens from a deep-link URL.
 * Tokens may arrive in the query string (preferred) or hash fragment.
 */
export function parseRecoveryParams(url: string): {
  accessToken?: string;
  refreshToken?: string;
  type?: string;
  error?: string;
  errorDescription?: string;
} {
  try {
    let working = url.trim();
    if (working.startsWith(`${APP_SCHEME}://`)) {
      working = working.replace(`${APP_SCHEME}://`, 'https://keepers.app/');
    }

    const parsed = new URL(working);
    const hash = parsed.hash?.startsWith('#')
      ? parsed.hash.slice(1)
      : parsed.hash || '';
    const fromHash = new URLSearchParams(hash);
    const fromQuery = parsed.searchParams;

    const accessToken =
      fromQuery.get('access_token') ||
      fromHash.get('access_token') ||
      undefined;
    const refreshToken =
      fromQuery.get('refresh_token') ||
      fromHash.get('refresh_token') ||
      undefined;
    const type = fromQuery.get('type') || fromHash.get('type') || undefined;
    const error = fromQuery.get('error') || fromHash.get('error') || undefined;
    const errorDescription =
      fromQuery.get('error_description') ||
      fromHash.get('error_description') ||
      undefined;

    return {accessToken, refreshToken, type, error, errorDescription};
  } catch {
    // Last-resort regex if URL parsing fails on exotic deep links
    const accessMatch = url.match(/access_token=([^&#]+)/);
    const typeMatch = url.match(/[?#&]type=([^&#]+)/);
    return {
      accessToken: accessMatch
        ? decodeURIComponent(accessMatch[1])
        : undefined,
      type: typeMatch ? decodeURIComponent(typeMatch[1]) : undefined,
    };
  }
}

export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [`${APP_SCHEME}://`],
  config: {
    screens: {
      Main: {
        screens: {
          Discover: 'home',
          Members: 'members',
          Gallery: 'gallery',
          Profile: 'settings',
        },
      },
      Trips: 'trips',
      TripDetails: 'trips/:tripId',
      Notifications: 'notifications',
      MyProgress: 'progress',
      MyTripPerformance: 'progress/trips/:tripId',
      MarshallUpgrades: 'marshall/upgrades',
      MemberProfile: 'members/:memberId',
      ChatInbox: 'chat',
      ChatThread: 'chat/:conversationId',
    },
  },
};
