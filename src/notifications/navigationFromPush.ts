import {Linking} from 'react-native';
import type {NavigationContainerRefWithCurrent} from '@react-navigation/native';
import type {RootStackParamList} from '../navigation/types';

type NavRef = NavigationContainerRefWithCurrent<RootStackParamList> | null;

let pendingDeepLink: string | null = null;
let navigationRef: NavRef = null;

export function setPushNavigationRef(ref: NavRef) {
  navigationRef = ref;
  if (ref && pendingDeepLink) {
    const link = pendingDeepLink;
    pendingDeepLink = null;
    navigateFromDeepLink(link);
  }
}

export function stashPendingDeepLink(link: string | null | undefined) {
  if (link) pendingDeepLink = link;
}

export function consumePendingDeepLink(): string | null {
  const link = pendingDeepLink;
  pendingDeepLink = null;
  return link;
}

function openTrip(tripId: string) {
  if (!navigationRef?.isReady()) return false;
  navigationRef.navigate('TripDetails', {tripId});
  return true;
}

export function navigateFromDeepLink(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const link = String(raw);

  try {
    if (!navigationRef?.isReady()) {
      stashPendingDeepLink(link);
      return false;
    }

    if (link.includes('/notifications') || link.endsWith('notifications')) {
      navigationRef.navigate('Notifications');
      return true;
    }

    const tripMatch = link.match(/trips\/([0-9a-fA-F-]{36})/);
    if (tripMatch?.[1]) {
      return openTrip(tripMatch[1]);
    }

    if (link.includes('/progress/trips/')) {
      const id = link.split('/progress/trips/')[1]?.split(/[?#]/)[0];
      if (id) {
        navigationRef.navigate('MyTripPerformance', {tripId: id});
        return true;
      }
    }

    if (link.includes('/progress')) {
      navigationRef.navigate('MyProgress');
      return true;
    }

    if (link.includes('/marshall/upgrades')) {
      navigationRef.navigate('MarshallUpgrades');
      return true;
    }

    if (link.includes('/settings') || link.includes('MemberProfile')) {
      navigationRef.navigate('Main', {screen: 'Profile'});
      return true;
    }

    if (link.includes('/home')) {
      navigationRef.navigate('Main', {screen: 'Discover'});
      return true;
    }

    // Fallback: try system linking for keepers:// routes
    if (link.startsWith('keepers://')) {
      Linking.openURL(link).catch(() => undefined);
      return true;
    }
  } catch {
    return false;
  }

  navigationRef?.navigate('Notifications');
  return true;
}

export function navigateFromRemoteMessage(remoteMessage: any): boolean {
  const data = remoteMessage?.data || {};
  const deepLink =
    data.deepLink ||
    data.screen ||
    (data.tripId ? `keepers://trips/${data.tripId}` : null) ||
    'keepers://notifications';
  return navigateFromDeepLink(deepLink);
}
