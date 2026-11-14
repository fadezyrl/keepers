import {useInfiniteQuery, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  fetchDocument,
  fetchEvents,
  fetchMember,
  fetchMyAssignedTrips,
  fetchMyOrganizedTrips,
  fetchMyProgress,
  fetchMyTripHistory,
  fetchMyTripPerformance,
  fetchMyUpgradeRequests,
  fetchRatingCriteria,
  fetchTrip,
  fetchTrips,
  fetchCalendar,
} from '../api/keepersApi';
import {cachePolicy, queryKeys, useCacheSession} from '../cache';
import {MemberHistoryFilter, Trip} from '../types';

function useUserId() {
  const {activeUserId} = useCacheSession();
  return activeUserId || '';
}

export function useCachedTrip(tripId: string, initial?: Trip) {
  const userId = useUserId();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.trips.detail(userId, tripId),
    queryFn: () => fetchTrip(tripId),
    enabled: Boolean(userId && tripId),
    initialData: initial,
    ...cachePolicy.frequent,
    placeholderData: () => {
      const lists = queryClient.getQueriesData<Trip[]>({
        queryKey: queryKeys.trips.all(userId),
      });
      for (const [, data] of lists) {
        const found = data?.find(t => t.id === tripId);
        if (found) return found;
      }
      return undefined;
    },
  });
}

export function useCachedTripsList(filter?: string, enabled = true) {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.trips.list(userId, filter),
    queryFn: () => fetchTrips({filter}),
    enabled: Boolean(userId) && enabled,
    ...cachePolicy.frequent,
  });
}

export function useCachedCalendar(from?: string, to?: string, enabled = true) {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.trips.calendar(userId, from, to),
    queryFn: () => fetchCalendar({from, to}),
    enabled: Boolean(userId && from && to) && enabled,
    // Month grids should feel instant on revisit; background refresh is enough.
    staleTime: cachePolicy.moderate.staleTime,
    gcTime: cachePolicy.moderate.gcTime,
  });
}

export function usePrefetchCalendarMonth() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return (from: string, to: string) => {
    if (!userId || !from || !to) return;
    void queryClient.prefetchQuery({
      queryKey: queryKeys.trips.calendar(userId, from, to),
      queryFn: () => fetchCalendar({from, to}),
      staleTime: cachePolicy.moderate.staleTime,
    });
  };
}

export function useCachedMember(memberId: string) {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.members.detail(userId, memberId),
    queryFn: () => fetchMember(memberId),
    enabled: Boolean(userId && memberId),
    ...cachePolicy.sensitive,
  });
}

export function useCachedDocument(slug: string) {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.documents.bySlug(userId, slug),
    queryFn: () => fetchDocument(slug),
    enabled: Boolean(userId && slug),
    ...cachePolicy.static,
  });
}

export function useCachedEvents() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.events(userId),
    queryFn: fetchEvents,
    enabled: Boolean(userId),
    ...cachePolicy.moderate,
  });
}

export function useCachedOrganizedTrips(enabled = true) {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.trips.organized(userId),
    queryFn: fetchMyOrganizedTrips,
    enabled: Boolean(userId) && enabled,
    ...cachePolicy.frequent,
  });
}

export function useCachedAssignedTrips() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.trips.assigned(userId),
    queryFn: fetchMyAssignedTrips,
    enabled: Boolean(userId),
    ...cachePolicy.frequent,
  });
}

export function useCachedRatingCriteria() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.ratings.criteria(userId),
    queryFn: fetchRatingCriteria,
    enabled: Boolean(userId),
    ...cachePolicy.static,
  });
}

export function useCachedUpgradeRequests(status = 'all') {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.ratings.upgrades(userId, status),
    queryFn: () => fetchMyUpgradeRequests(status),
    enabled: Boolean(userId),
    ...cachePolicy.frequent,
  });
}

export function useCachedMyProgress() {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.progress.summary(userId),
    queryFn: fetchMyProgress,
    enabled: Boolean(userId),
    ...cachePolicy.sensitive,
    refetchOnMount: 'always',
  });
}

export function useCachedMyTripHistory(filter: MemberHistoryFilter = 'all') {
  const userId = useUserId();
  return useInfiniteQuery({
    queryKey: queryKeys.progress.history(userId, filter),
    queryFn: ({pageParam}) =>
      fetchMyTripHistory({filter, page: pageParam, limit: 20}),
    initialPageParam: 1,
    getNextPageParam: last =>
      last.pagination.hasMore ? last.pagination.page + 1 : undefined,
    enabled: Boolean(userId),
    ...cachePolicy.frequent,
  });
}

export function useCachedMyTripPerformance(tripId: string) {
  const userId = useUserId();
  return useQuery({
    queryKey: queryKeys.progress.trip(userId, tripId),
    queryFn: () => fetchMyTripPerformance(tripId),
    enabled: Boolean(userId && tripId),
    ...cachePolicy.sensitive,
  });
}

export function seedTripCache(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
  trip: Trip,
) {
  queryClient.setQueryData(queryKeys.trips.detail(userId, trip.id), trip);
}
