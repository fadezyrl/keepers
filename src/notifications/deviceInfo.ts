import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INSTALLATION_KEY = '@keepers/installation_id';

function randomId() {
  return `keepers-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

let cachedId: string | null = null;

export const DeviceInfo = {
  getInstallationId(): string {
    if (cachedId) return cachedId;
    // Sync fallback; async hydrate happens on first register.
    cachedId = `${Platform.OS}-${randomId()}`;
    AsyncStorage.getItem(INSTALLATION_KEY)
      .then(existing => {
        if (existing) {
          cachedId = existing;
          return;
        }
        return AsyncStorage.setItem(INSTALLATION_KEY, cachedId as string);
      })
      .catch(() => undefined);
    return cachedId;
  },

  async ensureInstallationId(): Promise<string> {
    const existing = await AsyncStorage.getItem(INSTALLATION_KEY);
    if (existing) {
      cachedId = existing;
      return existing;
    }
    const next = `${Platform.OS}-${randomId()}`;
    cachedId = next;
    await AsyncStorage.setItem(INSTALLATION_KEY, next);
    return next;
  },

  getAppVersion(): string {
    try {
      // Avoid hard dependency on react-native-device-info.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const {version} = require('../../package.json');
      return String(version || '0.0.1');
    } catch {
      return '0.0.1';
    }
  },
};

export default DeviceInfo;
