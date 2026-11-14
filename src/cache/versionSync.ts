import {QueryClient} from '@tanstack/react-query';
import {fetchContentVersions} from '../api/keepersApi';
import {ContentVersions, queryKeys} from './queryKeys';

function changed(
  prev: ContentVersions | undefined,
  next: ContentVersions,
  key: keyof ContentVersions,
) {
  if (!prev) return false;
  return prev[key] !== next[key];
}

/**
 * Fetches lightweight module versions and invalidates only modules that changed.
 * First successful check seeds the baseline without forcing a full refresh.
 */
export async function syncContentVersions(
  queryClient: QueryClient,
  userId: string,
): Promise<boolean> {
  if (!userId) return false;

  const appliedKey = [...queryKeys.versions(userId), 'applied'] as const;
  const baseline = queryClient.getQueryData<ContentVersions>(appliedKey);

  const next = await fetchContentVersions();
  queryClient.setQueryData(queryKeys.versions(userId), next);

  if (!baseline) {
    queryClient.setQueryData(appliedKey, next);
    return false;
  }

  let any = false;

  if (
    changed(baseline, next, 'heroSlides') ||
    changed(baseline, next, 'sponsors') ||
    changed(baseline, next, 'gallery') ||
    changed(baseline, next, 'trips') ||
    changed(baseline, next, 'registrations')
  ) {
    await queryClient.invalidateQueries({queryKey: queryKeys.home(userId)});
    any = true;
  }

  if (
    changed(baseline, next, 'trips') ||
    changed(baseline, next, 'registrations') ||
    changed(baseline, next, 'attendance') ||
    changed(baseline, next, 'tripMedia')
  ) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.trips.all(userId),
    });
    any = true;
  }

  if (
    changed(baseline, next, 'members') ||
    changed(baseline, next, 'vehicles') ||
    changed(baseline, next, 'membershipLevels')
  ) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.members.all(userId),
    });
    await queryClient.invalidateQueries({queryKey: queryKeys.me(userId)});
    any = true;
  }

  if (
    changed(baseline, next, 'attendance') ||
    changed(baseline, next, 'ratings') ||
    changed(baseline, next, 'upgrades') ||
    changed(baseline, next, 'ratingCriteria') ||
    changed(baseline, next, 'membershipLevels') ||
    changed(baseline, next, 'trips') ||
    changed(baseline, next, 'registrations')
  ) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.progress.all(userId),
    });
    any = true;
  }

  if (changed(baseline, next, 'notifications')) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.notifications(userId),
    });
    any = true;
  }

  if (changed(baseline, next, 'documents')) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.documents.all(userId),
    });
    any = true;
  }

  if (changed(baseline, next, 'events')) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.events(userId),
    });
    any = true;
  }

  if (
    changed(baseline, next, 'upgrades') ||
    changed(baseline, next, 'ratings') ||
    changed(baseline, next, 'ratingCriteria')
  ) {
    await queryClient.invalidateQueries({
      queryKey: ['keepers', userId, 'ratings'],
    });
    any = true;
  }

  queryClient.setQueryData(appliedKey, next);
  return any;
}

export function seedVersionBaseline(
  queryClient: QueryClient,
  userId: string,
  versions: ContentVersions,
) {
  queryClient.setQueryData(queryKeys.versions(userId), versions);
  queryClient.setQueryData(
    [...queryKeys.versions(userId), 'applied'],
    versions,
  );
}
