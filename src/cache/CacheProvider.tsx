import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {QueryClientProvider} from '@tanstack/react-query';
import {
  persistQueryClientRestore,
  persistQueryClientSubscribe,
} from '@tanstack/react-query-persist-client';
import {QueryClient} from '@tanstack/react-query';
import {CACHE_MAX_AGE_MS} from './policies';
import {createKeepersQueryClient} from './queryClient';
import {
  clearPersistedCache,
  createKeepersPersister,
  getCachedUserId,
  setCachedUserId,
} from './persister';
import {clearUserQueries} from './invalidate';
import {syncContentVersions} from './versionSync';

type CacheSessionValue = {
  hydrated: boolean;
  activeUserId: string | null;
  queryClient: QueryClient;
  setActiveUser: (userId: string | null) => Promise<void>;
  clearAccountCache: (userId?: string | null) => Promise<void>;
  revalidateInBackground: (userId?: string | null) => Promise<void>;
};

const CacheSessionContext = createContext<CacheSessionValue | null>(null);

export function useCacheSession() {
  const ctx = useContext(CacheSessionContext);
  if (!ctx) {
    throw new Error('useCacheSession must be used within CacheProvider');
  }
  return ctx;
}

function persistOptionsFor(userId: string | null) {
  const id = userId || 'guest';
  const persister = createKeepersPersister(id);
  const buster = `keepers-v1-${id}`;
  const dehydrateOptions = {
    shouldDehydrateQuery: (query: {
      state: {status: string};
      queryKey: unknown;
    }) => {
      if (query.state.status !== 'success') return false;
      const key = query.queryKey;
      if (!Array.isArray(key) || key[0] !== 'keepers') return false;
      if (!userId) return false;
      return key[1] === userId;
    },
  };
  return {
    persister,
    maxAge: CACHE_MAX_AGE_MS,
    buster,
    dehydrateOptions,
  };
}

export function CacheProvider({children}: {children: React.ReactNode}) {
  const [queryClient] = useState(() => createKeepersQueryClient());
  const [activeUserId, setActiveUserIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [ready, setReady] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  const attachPersister = useCallback(
    async (userId: string | null) => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
      const options = persistOptionsFor(userId);
      try {
        await persistQueryClientRestore({
          queryClient,
          persister: options.persister,
          maxAge: options.maxAge,
          buster: options.buster,
        });
      } catch {
        // Corrupt or empty cache — continue with empty client
      }
      unsubRef.current = persistQueryClientSubscribe({
        queryClient,
        persister: options.persister,
        buster: options.buster,
        dehydrateOptions: options.dehydrateOptions,
      });
      setHydrated(true);
    },
    [queryClient],
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      const id = await getCachedUserId();
      if (!alive) return;
      setActiveUserIdState(id);
      await attachPersister(id);
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, [attachPersister]);

  const setActiveUser = useCallback(
    async (userId: string | null) => {
      if (userId === activeUserId) {
        await setCachedUserId(userId);
        return;
      }
      if (activeUserId && activeUserId !== userId) {
        await clearUserQueries(queryClient, activeUserId);
      }
      await setCachedUserId(userId);
      setActiveUserIdState(userId);
      // Avoid remounting the tree; only mark unhydrated when leaving a user
      if (activeUserId) {
        setHydrated(false);
      }
      await attachPersister(userId);
    },
    [activeUserId, attachPersister, queryClient],
  );

  const clearAccountCache = useCallback(
    async (userId?: string | null) => {
      const id = userId ?? activeUserId;
      if (id) {
        await clearUserQueries(queryClient, id);
        await clearPersistedCache(id);
      } else {
        queryClient.clear();
        await clearPersistedCache();
      }
      await setCachedUserId(null);
      setActiveUserIdState(null);
      await attachPersister(null);
    },
    [activeUserId, attachPersister, queryClient],
  );

  const revalidateInBackground = useCallback(
    async (userId?: string | null) => {
      const id = userId ?? activeUserId;
      if (!id) return;
      try {
        await syncContentVersions(queryClient, id);
      } catch {
        // offline or transient — keep cached UI
      }
    },
    [activeUserId, queryClient],
  );

  const value = useMemo(
    () => ({
      hydrated: hydrated && ready,
      activeUserId,
      queryClient,
      setActiveUser,
      clearAccountCache,
      revalidateInBackground,
    }),
    [
      hydrated,
      ready,
      activeUserId,
      queryClient,
      setActiveUser,
      clearAccountCache,
      revalidateInBackground,
    ],
  );

  if (!ready) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CacheSessionContext.Provider value={value}>
        {children}
      </CacheSessionContext.Provider>
    </QueryClientProvider>
  );
}
