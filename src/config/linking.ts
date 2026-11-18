import {LinkingOptions} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/types';

export const APP_SCHEME = 'keepers';
export const RESET_PASSWORD_PATH = 'auth/reset-password';
export const RESET_REDIRECT_URL = `${APP_SCHEME}://${RESET_PASSWORD_PATH}`;

/**
 * Parse Supabase recovery tokens from a deep-link URL.
 * Supabase may deliver tokens in the hash fragment or query string.
 */
export function parseRecoveryParams(url: string): {
  accessToken?: string;
  refreshToken?: string;
  type?: string;
} {
  try {
    const normalized = url.replace(`${APP_SCHEME}://`, 'https://keepers.app/');
    const parsed = new URL(normalized);
    const hash = parsed.hash?.startsWith('#')
      ? parsed.hash.slice(1)
      : parsed.hash || '';
    const fromHash = new URLSearchParams(hash);
    const fromQuery = parsed.searchParams;

    return {
      accessToken:
        fromHash.get('access_token') ||
        fromQuery.get('access_token') ||
        undefined,
      refreshToken:
        fromHash.get('refresh_token') ||
        fromQuery.get('refresh_token') ||
        undefined,
      type: fromHash.get('type') || fromQuery.get('type') || undefined,
    };
  } catch {
    return {};
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
