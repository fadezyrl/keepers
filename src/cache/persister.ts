import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister';
import {STORAGE_KEYS} from '../config/api';

export function queryCacheStorageKey(userId: string) {
  return `${STORAGE_KEYS.queryCachePrefix}${userId || 'guest'}`;
}

export function createKeepersPersister(userId: string) {
  return createAsyncStoragePersister({
    storage: AsyncStorage,
    key: queryCacheStorageKey(userId),
    throttleTime: 1000,
  });
}

export async function clearPersistedCache(userId?: string | null) {
  if (userId) {
    await AsyncStorage.removeItem(queryCacheStorageKey(userId));
    return;
  }
  const keys = await AsyncStorage.getAllKeys();
  const cacheKeys = keys.filter(k =>
    k.startsWith(STORAGE_KEYS.queryCachePrefix),
  );
  await Promise.all(cacheKeys.map(k => AsyncStorage.removeItem(k)));
}

export async function getCachedUserId(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.cacheUserId);
}

export async function setCachedUserId(userId: string | null) {
  if (userId) {
    await AsyncStorage.setItem(STORAGE_KEYS.cacheUserId, userId);
  } else {
    await AsyncStorage.removeItem(STORAGE_KEYS.cacheUserId);
  }
}
