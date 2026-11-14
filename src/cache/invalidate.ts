import {QueryClient} from '@tanstack/react-query';
import {queryKeys} from './queryKeys';

export async function invalidateAfterTripMutation(
  queryClient: QueryClient,
  userId: string,
  tripId?: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({queryKey: queryKeys.trips.all(userId)}),
    queryClient.invalidateQueries({queryKey: queryKeys.home(userId)}),
    queryClient.invalidateQueries({queryKey: queryKeys.notifications(userId)}),
    queryClient.invalidateQueries({queryKey: queryKeys.progress.all(userId)}),
    tripId
      ? queryClient.invalidateQueries({
          queryKey: queryKeys.trips.detail(userId, tripId),
        })
      : Promise.resolve(),
  ]);
}

export async function invalidateAfterProfileMutation(
  queryClient: QueryClient,
  userId: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({queryKey: queryKeys.me(userId)}),
    queryClient.invalidateQueries({
      queryKey: queryKeys.members.all(userId),
    }),
    queryClient.invalidateQueries({queryKey: queryKeys.progress.all(userId)}),
  ]);
}

export async function invalidateAfterNotificationMutation(
  queryClient: QueryClient,
  userId: string,
) {
  await queryClient.invalidateQueries({
    queryKey: queryKeys.notifications(userId),
  });
}

export async function invalidateAfterMarshallMutation(
  queryClient: QueryClient,
  userId: string,
  tripId?: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.trips.organized(userId),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.trips.assigned(userId),
    }),
    queryClient.invalidateQueries({queryKey: queryKeys.trips.all(userId)}),
    queryClient.invalidateQueries({queryKey: queryKeys.home(userId)}),
    queryClient.invalidateQueries({queryKey: queryKeys.progress.all(userId)}),
    tripId
      ? queryClient.invalidateQueries({
          queryKey: queryKeys.trips.detail(userId, tripId),
        })
      : Promise.resolve(),
    queryClient.invalidateQueries({
      queryKey: ['keepers', userId, 'ratings'],
    }),
  ]);
}

export async function clearUserQueries(
  queryClient: QueryClient,
  userId: string,
) {
  await queryClient.cancelQueries({queryKey: ['keepers', userId]});
  queryClient.removeQueries({queryKey: ['keepers', userId]});
}
