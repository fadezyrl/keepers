import {useEffect, useRef} from 'react';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {onlineManager} from '@tanstack/react-query';

type Options = {
  onOfflineChange?: (offline: boolean) => void;
  onReconnect?: () => void;
};

/**
 * Bridges NetInfo → TanStack onlineManager.
 * Calls onReconnect only on offline → online transitions.
 */
export function useNetworkStatus(options: Options = {}) {
  const offlineRef = useRef(options.onOfflineChange);
  const reconnectRef = useRef(options.onReconnect);
  offlineRef.current = options.onOfflineChange;
  reconnectRef.current = options.onReconnect;
  const wasOffline = useRef(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state: NetInfoState) => {
      const online = Boolean(
        state.isConnected && state.isInternetReachable !== false,
      );
      onlineManager.setOnline(online);
      const offline = !online;
      offlineRef.current?.(offline);

      if (online && wasOffline.current) {
        reconnectRef.current?.();
      }
      wasOffline.current = offline;
    });
    return () => unsub();
  }, []);
}
