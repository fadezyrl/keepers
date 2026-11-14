/** Cache freshness policies by data volatility (ms). */

export const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14; // 14 days persisted

export const cachePolicy = {
  /** Documents, terms/privacy, sponsors, membership level definitions */
  static: {
    staleTime: 1000 * 60 * 60 * 12,
    gcTime: CACHE_MAX_AGE_MS,
  },
  /** Home feed modules, gallery, directory listings */
  moderate: {
    staleTime: 1000 * 60 * 5,
    gcTime: CACHE_MAX_AGE_MS,
  },
  /** Trips, registrations, notifications, marshall activity */
  frequent: {
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  },
  /** Current profile, member detail, vehicle-linked private fields */
  sensitive: {
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 60 * 12,
  },
  /** Lightweight content version markers */
  versions: {
    staleTime: 1000 * 20,
    gcTime: 1000 * 60 * 60 * 24,
  },
} as const;
