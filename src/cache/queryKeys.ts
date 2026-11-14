export type ContentVersions = {
  heroSlides: string | null;
  sponsors: string | null;
  gallery: string | null;
  trips: string | null;
  registrations: string | null;
  attendance: string | null;
  documents: string | null;
  announcements: string | null;
  events: string | null;
  membershipLevels: string | null;
  members: string | null;
  vehicles: string | null;
  notifications: string | null;
  upgrades: string | null;
  ratingCriteria: string | null;
  ratings: string | null;
  tripMedia: string | null;
  checkedAt?: string;
};

export const queryKeys = {
  root: ['keepers'] as const,
  versions: (userId: string) => ['keepers', userId, 'versions'] as const,
  me: (userId: string) => ['keepers', userId, 'me'] as const,
  home: (userId: string) => ['keepers', userId, 'home'] as const,
  trips: {
    all: (userId: string) => ['keepers', userId, 'trips'] as const,
    list: (userId: string, filter?: string) =>
      ['keepers', userId, 'trips', 'list', filter || 'all'] as const,
    calendar: (userId: string, from?: string, to?: string) =>
      ['keepers', userId, 'trips', 'calendar', from || '', to || ''] as const,
    detail: (userId: string, tripId: string) =>
      ['keepers', userId, 'trips', 'detail', tripId] as const,
    organized: (userId: string) =>
      ['keepers', userId, 'trips', 'organized'] as const,
    assigned: (userId: string) =>
      ['keepers', userId, 'trips', 'assigned'] as const,
  },
  members: {
    all: (userId: string) => ['keepers', userId, 'members'] as const,
    directory: (userId: string) =>
      ['keepers', userId, 'members', 'directory'] as const,
    detail: (userId: string, memberId: string) =>
      ['keepers', userId, 'members', 'detail', memberId] as const,
  },
  progress: {
    all: (userId: string) => ['keepers', userId, 'progress'] as const,
    summary: (userId: string) =>
      ['keepers', userId, 'progress', 'summary'] as const,
    history: (userId: string, filter = 'all') =>
      ['keepers', userId, 'progress', 'history', filter] as const,
    trip: (userId: string, tripId: string) =>
      ['keepers', userId, 'progress', 'trip', tripId] as const,
  },
  notifications: (userId: string) =>
    ['keepers', userId, 'notifications'] as const,
  documents: {
    all: (userId: string) => ['keepers', userId, 'documents'] as const,
    bySlug: (userId: string, slug: string) =>
      ['keepers', userId, 'documents', slug] as const,
  },
  events: (userId: string) => ['keepers', userId, 'events'] as const,
  ratings: {
    criteria: (userId: string) =>
      ['keepers', userId, 'ratings', 'criteria'] as const,
    upgrades: (userId: string, status = 'all') =>
      ['keepers', userId, 'ratings', 'upgrades', status] as const,
  },
} as const;
