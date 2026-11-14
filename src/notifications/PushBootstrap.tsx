import React, {useEffect, useRef} from 'react';
import {AppState, Platform} from 'react-native';
import {useApp} from '../context/AppContext';
import {showToast} from '../alerts';
import {
  deactivatePushDevicesRequest,
  registerPushDeviceRequest,
} from '../api/keepersApi';
import {DeviceInfo} from './deviceInfo';
import {
  consumePendingDeepLink,
  navigateFromDeepLink,
  navigateFromRemoteMessage,
} from './navigationFromPush';
import {
  getFcmToken,
  getInitialNotification,
  onForegroundMessage,
  onNotificationOpened,
  onTokenRefresh,
  requestPushPermission,
} from './pushService';

/**
 * Registers FCM tokens after auth and routes notification taps.
 * Never throws — permission denial / missing Firebase must not crash the app.
 */
export function PushBootstrap() {
  const {authMode, user, refreshNotificationsQuiet} = useApp();
  const registeredTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (authMode !== 'app' || !user.id) {
      return undefined;
    }

    let cancelled = false;
    const unsubscribers: Array<() => void> = [];

    const register = async (token: string) => {
      if (!token || cancelled) return;
      try {
        const deviceId = await DeviceInfo.ensureInstallationId();
        await registerPushDeviceRequest({
          fcmToken: token,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
          deviceId,
          appVersion: DeviceInfo.getAppVersion(),
        });
        registeredTokenRef.current = token;
      } catch {
        // Non-fatal: backend may be offline.
      }
    };

    const boot = async () => {
      try {
        const allowed = await requestPushPermission();
        if (!allowed || cancelled) return;

        const token = await getFcmToken();
        if (token) await register(token);

        unsubscribers.push(
          await onTokenRefresh(next => {
            void register(next);
          }),
        );

        unsubscribers.push(
          await onForegroundMessage(remoteMessage => {
            const title =
              remoteMessage?.notification?.title ||
              remoteMessage?.data?.title ||
              'Keepers';
            const body =
              remoteMessage?.notification?.body ||
              remoteMessage?.data?.body ||
              'You have a new update.';
            showToast({message: `${title}: ${body}`, type: 'info'});
            void refreshNotificationsQuiet?.();
          }),
        );

        unsubscribers.push(
          await onNotificationOpened(remoteMessage => {
            navigateFromRemoteMessage(remoteMessage);
            void refreshNotificationsQuiet?.();
          }),
        );

        const initial = await getInitialNotification();
        if (initial) {
          navigateFromRemoteMessage(initial);
        }

        const pending = consumePendingDeepLink();
        if (pending) navigateFromDeepLink(pending);
      } catch {
        // Swallow — push is optional.
      }
    };

    void boot();

    const appStateSub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        void refreshNotificationsQuiet?.();
      }
    });

    return () => {
      cancelled = true;
      unsubscribers.forEach(unsub => {
        try {
          unsub();
        } catch {
          // ignore
        }
      });
      appStateSub.remove();
    };
  }, [authMode, user.id, refreshNotificationsQuiet]);

  useEffect(() => {
    if (authMode !== 'app' && registeredTokenRef.current) {
      const token = registeredTokenRef.current;
      registeredTokenRef.current = null;
      void deactivatePushDevicesRequest({fcmToken: token}).catch(() => undefined);
    }
  }, [authMode]);

  return null;
}
