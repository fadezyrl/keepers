import {PermissionsAndroid, Platform} from 'react-native';
import DeviceInfo from './deviceInfo';

type MessagingModule = typeof import('@react-native-firebase/messaging').default;

let messagingModule: MessagingModule | null = null;
let messagingUnavailable = false;

async function getMessaging(): Promise<MessagingModule | null> {
  if (messagingUnavailable) return null;
  if (messagingModule) return messagingModule;
  try {
    const mod = await import('@react-native-firebase/messaging');
    messagingModule = mod.default;
    return messagingModule;
  } catch {
    messagingUnavailable = true;
    return null;
  }
}

export async function requestPushPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        return false;
      }
    }

    const messaging = await getMessaging();
    if (!messaging) return false;

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return enabled;
  } catch {
    return false;
  }
}

export async function getFcmToken(): Promise<string | null> {
  try {
    const messaging = await getMessaging();
    if (!messaging) return null;
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }
    const token = await messaging().getToken();
    return token || null;
  } catch {
    return null;
  }
}

export function getDeviceMeta() {
  return {
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
    deviceId: DeviceInfo.getInstallationId(),
    appVersion: DeviceInfo.getAppVersion(),
  };
}

export async function onTokenRefresh(
  handler: (token: string) => void,
): Promise<() => void> {
  const messaging = await getMessaging();
  if (!messaging) return () => undefined;
  return messaging().onTokenRefresh(handler);
}

export async function onForegroundMessage(
  handler: (remoteMessage: any) => void,
): Promise<() => void> {
  const messaging = await getMessaging();
  if (!messaging) return () => undefined;
  return messaging().onMessage(handler);
}

export async function onNotificationOpened(
  handler: (remoteMessage: any) => void,
): Promise<() => void> {
  const messaging = await getMessaging();
  if (!messaging) return () => undefined;
  return messaging().onNotificationOpenedApp(handler);
}

export async function getInitialNotification(): Promise<any | null> {
  try {
    const messaging = await getMessaging();
    if (!messaging) return null;
    return messaging().getInitialNotification();
  } catch {
    return null;
  }
}

export function isFirebaseMessagingAvailable(): boolean {
  return !messagingUnavailable;
}
