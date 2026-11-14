import {QueryClient} from '@tanstack/react-query';
import {CACHE_MAX_AGE_MS, cachePolicy} from './policies';

export function createKeepersQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: cachePolicy.moderate.staleTime,
        gcTime: CACHE_MAX_AGE_MS,
        retry: (failureCount, error) => {
          const code = (error as {code?: string})?.code || '';
          if (
            code === 'UNAUTHORIZED' ||
            code === 'FORBIDDEN' ||
            code === 'PENDING_APPROVAL' ||
            code === 'ACCESS_BLOCKED'
          ) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
        networkMode: 'offlineFirst',
      },
      mutations: {
        networkMode: 'online',
        retry: 0,
      },
    },
  });
}
