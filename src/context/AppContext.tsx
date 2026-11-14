import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  cancelTripRequest,
  changePasswordRequest,
  deleteAccountRequest,
  fetchDirectory,
  fetchHome,
  fetchMe,
  fetchNotifications,
  fetchTrips,
  forgotPasswordRequest,
  joinTripRequest,
  loginRequest,
  mapMeToProfile,
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
  resetPasswordWithTokenRequest,
  signupRequest,
  updateProfileRequest,
} from '../api/keepersApi';
import {
  ApiError,
  clearTokens,
  loadStoredAccessToken,
  setTokens,
} from '../api/client';
import {
  cachePolicy,
  invalidateAfterNotificationMutation,
  invalidateAfterProfileMutation,
  invalidateAfterTripMutation,
  queryKeys,
  useCacheSession,
} from '../cache';
import {RESET_REDIRECT_URL} from '../config/linking';
import {STORAGE_KEYS} from '../config/api';
import {useNetworkStatus} from '../hooks/useNetworkStatus';
import {
  AppNotification,
  ClubMember,
  DisplayMode,
  GalleryItem,
  HeroSlide,
  Sponsor,
  Trip,
  TripFilter,
  TripStatus,
  UserProfile,
} from '../types';

const EMPTY_USER: UserProfile = {
  id: '',
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
  nationality: '',
  gender: '',
  emergencyContact: '',
  avatar: '',
  membership: 'Junior',
  completedTrips: 0,
  vehicle: {
    manufacturer: '',
    model: '',
    year: '',
    vin: '',
    image: '',
  },
  social: {
    instagram: '',
    facebook: '',
    tiktok: '',
  },
  notificationPrefs: {
    trips: true,
    events: true,
    club: true,
  },
  privacy: {
    showVehicle: true,
    showSocial: true,
  },
  roles: [],
  permissions: [],
};

type AuthMode = 'splash' | 'auth' | 'app';

type JoinResult = {ok: boolean; status?: TripStatus; message: string};
type CancelResult = {ok: boolean; status?: TripStatus; message: string};

interface AppContextValue {
  bootstrapped: boolean;
  authMode: AuthMode;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => Promise<void>;
  user: UserProfile;
  trips: Trip[];
  notifications: AppNotification[];
  unreadCount: number;
  isOffline: boolean;
  setOffline: (value: boolean) => void;
  recoveryAccessToken: string | null;
  setRecoveryAccessToken: (token: string | null) => void;
  bootstrap: () => Promise<void>;
  refreshAppData: () => Promise<void>;
  refreshNotificationsQuiet: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    partial: Partial<UserProfile> & {email: string; password: string},
  ) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  updateProfile: (next: UserProfile) => Promise<void>;
  changePassword: (
    currentPassword: string,
    nextPassword: string,
  ) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  completePasswordReset: (
    accessToken: string,
    nextPassword: string,
  ) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  getTrip: (id: string) => Trip | undefined;
  upsertLocalTrip: (trip: Trip) => void;
  removeLocalTrip: (tripId: string) => void;
  filterTrips: (
    filter: TripFilter,
    query: string,
    date?: string | null,
  ) => Trip[];
  joinTrip: (id: string, requirementIds?: string[]) => Promise<JoinResult>;
  cancelRegistration: (id: string) => Promise<CancelResult>;
  hasPermission: (code: string) => boolean;
  hasRole: (code: string) => boolean;
  sponsors: Sponsor[];
  gallery: GalleryItem[];
  heroSlides: HeroSlide[];
  members: ClubMember[];
}

const AppContext = createContext<AppContextValue | null>(null);

function asError(err: unknown, fallback: string): Error {
  if (err instanceof Error) {
    return err;
  }
  const apiErr = err as ApiError | undefined;
  if (apiErr?.message) {
    return new Error(apiErr.message);
  }
  return new Error(fallback);
}

function isNetworkError(err: unknown): boolean {
  if (!err || typeof err !== 'object') {
    return err instanceof TypeError;
  }
  const e = err as {message?: string; code?: string; name?: string};
  if (e.name === 'TypeError') {
    return true;
  }
  const msg = (e.message || '').toLowerCase();
  return (
    msg.includes('network') ||
    msg.includes('failed to fetch') ||
    msg.includes('network request failed')
  );
}

function upsertTrip(list: Trip[], trip: Trip): Trip[] {
  const idx = list.findIndex(t => t.id === trip.id);
  if (idx === -1) {
    return [trip, ...list];
  }
  const next = [...list];
  next[idx] = trip;
  return next;
}

function applySessionToState(
  setters: {
    setUser: (u: UserProfile) => void;
    setTrips: (t: Trip[]) => void;
    setNotifications: (n: AppNotification[]) => void;
    setHeroSlides: (h: HeroSlide[]) => void;
    setSponsors: (s: Sponsor[]) => void;
    setGallery: (g: GalleryItem[]) => void;
    setMembers: (m: ClubMember[]) => void;
  },
  data: {
    me: any;
    trips: Trip[];
    notifications: AppNotification[];
    home: Awaited<ReturnType<typeof fetchHome>>;
    directory: ClubMember[];
  },
) {
  setters.setUser(mapMeToProfile(data.me));
  setters.setTrips(data.trips);
  setters.setNotifications(data.notifications);
  setters.setHeroSlides(data.home.heroSlides || []);
  setters.setSponsors(data.home.sponsors || []);
  setters.setGallery(data.home.gallery || []);
  setters.setMembers(data.directory);
}

export function AppProvider({children}: {children: React.ReactNode}) {
  const {
    queryClient,
    hydrated,
    activeUserId,
    setActiveUser,
    clearAccountCache,
    revalidateInBackground,
  } = useCacheSession();

  const [bootstrapped, setBootstrapped] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('splash');
  const [displayMode, setDisplayModeState] = useState<DisplayMode>('light');
  const [user, setUser] = useState<UserProfile>(EMPTY_USER);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [isOffline, setOffline] = useState(false);
  const [recoveryAccessToken, setRecoveryAccessTokenState] = useState<
    string | null
  >(null);

  const setters = useMemo(
    () => ({
      setUser,
      setTrips,
      setNotifications,
      setHeroSlides,
      setSponsors,
      setGallery,
      setMembers,
    }),
    [],
  );

  const setRecoveryAccessToken = useCallback((token: string | null) => {
    setRecoveryAccessTokenState(token);
    if (token) {
      setAuthMode('auth');
    }
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications],
  );

  const hasPermission = useCallback(
    (code: string) => (user.permissions || []).includes(code),
    [user.permissions],
  );

  const hasRole = useCallback(
    (code: string) => (user.roles || []).includes(code),
    [user.roles],
  );

  const hydrateFromQueryCache = useCallback(
    (userId: string): boolean => {
      const me = queryClient.getQueryData(queryKeys.me(userId));
      const nextTrips = queryClient.getQueryData<Trip[]>(
        queryKeys.trips.list(userId, 'all'),
      );
      const nextNotes = queryClient.getQueryData<AppNotification[]>(
        queryKeys.notifications(userId),
      );
      const home = queryClient.getQueryData<Awaited<ReturnType<typeof fetchHome>>>(
        queryKeys.home(userId),
      );
      const directory = queryClient.getQueryData<ClubMember[]>(
        queryKeys.members.directory(userId),
      );

      if (!me || !home) {
        return false;
      }

      applySessionToState(setters, {
        me,
        trips: nextTrips || [],
        notifications: nextNotes || [],
        home,
        directory: directory || [],
      });
      return true;
    },
    [queryClient, setters],
  );

  const loadSessionData = useCallback(
    async (knownUserId?: string | null) => {
      // Resolve user id: prefer known, else probe /me (uses network or throws)
      let userId = knownUserId || activeUserId || '';

      const me = await queryClient.fetchQuery({
        queryKey: userId
          ? queryKeys.me(userId)
          : (['keepers', 'bootstrap', 'me'] as const),
        queryFn: fetchMe,
        ...cachePolicy.sensitive,
      });

      const profile = mapMeToProfile(me);
      userId = profile.id;
      await setActiveUser(userId);

      // Re-key bootstrap me into user-scoped cache
      queryClient.setQueryData(queryKeys.me(userId), me);

      const [nextTrips, nextNotes, home, directory] = await Promise.all([
        queryClient.fetchQuery({
          queryKey: queryKeys.trips.list(userId, 'all'),
          queryFn: () => fetchTrips(),
          ...cachePolicy.frequent,
        }),
        queryClient.fetchQuery({
          queryKey: queryKeys.notifications(userId),
          queryFn: fetchNotifications,
          ...cachePolicy.frequent,
        }),
        queryClient.fetchQuery({
          queryKey: queryKeys.home(userId),
          queryFn: fetchHome,
          ...cachePolicy.moderate,
        }),
        queryClient.fetchQuery({
          queryKey: queryKeys.members.directory(userId),
          queryFn: () => fetchDirectory(),
          ...cachePolicy.moderate,
        }),
      ]);

      // Seed per-trip detail cache from list for instant detail screens
      nextTrips.forEach(trip => {
        const existing = queryClient.getQueryData(
          queryKeys.trips.detail(userId, trip.id),
        );
        if (!existing) {
          queryClient.setQueryData(
            queryKeys.trips.detail(userId, trip.id),
            trip,
          );
        }
      });

      applySessionToState(setters, {
        me,
        trips: nextTrips,
        notifications: nextNotes,
        home,
        directory,
      });
      setOffline(false);
      return userId;
    },
    [activeUserId, queryClient, setActiveUser, setters],
  );

  const silentRevalidate = useCallback(async () => {
    const userId = user.id || activeUserId;
    if (!userId || authMode !== 'app') {
      return;
    }
    try {
      await revalidateInBackground(userId);
      await loadSessionData(userId);
    } catch (err) {
      if (isNetworkError(err)) {
        setOffline(true);
      }
    }
  }, [
    activeUserId,
    authMode,
    loadSessionData,
    revalidateInBackground,
    user.id,
  ]);

  useNetworkStatus({
    onOfflineChange: setOffline,
    onReconnect: silentRevalidate,
  });

  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'active') {
        silentRevalidate();
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [silentRevalidate]);

  const refreshAppData = useCallback(async () => {
    try {
      const userId = user.id || activeUserId;
      if (userId) {
        await revalidateInBackground(userId);
      }
      await loadSessionData(userId);
    } catch (err) {
      if (isNetworkError(err)) {
        setOffline(true);
      }
      throw asError(err, 'Unable to refresh data.');
    }
  }, [
    activeUserId,
    loadSessionData,
    revalidateInBackground,
    user.id,
  ]);

  const bootstrap = useCallback(async () => {
    if (!hydrated) {
      return;
    }
    try {
      const theme = await AsyncStorage.getItem(STORAGE_KEYS.theme);
      if (theme === 'dark' || theme === 'light') {
        setDisplayModeState(theme);
      }

      const token = await loadStoredAccessToken();
      if (!token) {
        setAuthMode('auth');
        return;
      }

      const cachedUserId = activeUserId;
      const hadCache = cachedUserId
        ? hydrateFromQueryCache(cachedUserId)
        : false;

      if (hadCache) {
        // Instant UI from persistent cache; revalidate in background
        setAuthMode('app');
        setBootstrapped(true);
        loadSessionData(cachedUserId)
          .then(uid => revalidateInBackground(uid))
          .catch(err => {
            if (isNetworkError(err)) {
              setOffline(true);
            } else {
              const apiErr = err as ApiError;
              const code = (apiErr?.code || '').toUpperCase();
              if (
                code === 'UNAUTHORIZED' ||
                code === 'FORBIDDEN' ||
                code.includes('AUTH') ||
                code.includes('TOKEN')
              ) {
                clearTokens().then(() => {
                  clearAccountCache(cachedUserId);
                  setUser(EMPTY_USER);
                  setAuthMode('auth');
                });
              }
            }
          });
        return;
      }

      try {
        await loadSessionData(cachedUserId);
        setAuthMode('app');
        revalidateInBackground().catch(() => undefined);
      } catch (err) {
        if (isNetworkError(err)) {
          setOffline(true);
          setAuthMode('auth');
          return;
        }
        const apiErr = err as ApiError;
        const code = (apiErr?.code || '').toUpperCase();
        if (
          code === 'UNAUTHORIZED' ||
          code === 'FORBIDDEN' ||
          code.includes('AUTH') ||
          code.includes('TOKEN')
        ) {
          await clearTokens();
          await clearAccountCache(cachedUserId);
          setUser(EMPTY_USER);
        }
        setAuthMode('auth');
      }
    } catch {
      setAuthMode('auth');
    } finally {
      setBootstrapped(true);
    }
  }, [
    activeUserId,
    clearAccountCache,
    hydrateFromQueryCache,
    hydrated,
    loadSessionData,
    revalidateInBackground,
  ]);

  useEffect(() => {
    if (hydrated && !bootstrapped) {
      bootstrap();
    }
  }, [bootstrap, bootstrapped, hydrated]);

  const setDisplayMode = useCallback(async (mode: DisplayMode) => {
    setDisplayModeState(mode);
    await AsyncStorage.setItem(STORAGE_KEYS.theme, mode);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const data = await loginRequest(email.trim(), password);
        if (data.accessBlocked) {
          throw new Error(
            'Your account is pending approval. You will be notified once an admin activates membership.',
          );
        }
        await setTokens(
          data.session.access_token,
          data.session.refresh_token,
        );
        await AsyncStorage.setItem(
          STORAGE_KEYS.lastLoginEmail,
          email.trim().toLowerCase(),
        );
        const me = await fetchMe();
        const profile = mapMeToProfile(me);
        if ((profile.status || '').toLowerCase() === 'pending') {
          await clearTokens();
          throw new Error(
            'Your account is pending approval. You will be notified once an admin activates membership.',
          );
        }
        await setActiveUser(profile.id);
        queryClient.setQueryData(queryKeys.me(profile.id), me);

        const [nextTrips, nextNotes, home, directory] = await Promise.all([
          queryClient.fetchQuery({
            queryKey: queryKeys.trips.list(profile.id, 'all'),
            queryFn: () => fetchTrips(),
            ...cachePolicy.frequent,
          }),
          queryClient.fetchQuery({
            queryKey: queryKeys.notifications(profile.id),
            queryFn: fetchNotifications,
            ...cachePolicy.frequent,
          }),
          queryClient.fetchQuery({
            queryKey: queryKeys.home(profile.id),
            queryFn: fetchHome,
            ...cachePolicy.moderate,
          }),
          queryClient.fetchQuery({
            queryKey: queryKeys.members.directory(profile.id),
            queryFn: () => fetchDirectory(),
            ...cachePolicy.moderate,
          }),
        ]);

        applySessionToState(setters, {
          me,
          trips: nextTrips,
          notifications: nextNotes,
          home,
          directory,
        });
        setOffline(false);
        setAuthMode('app');
        revalidateInBackground(profile.id).catch(() => undefined);
      } catch (err) {
        if (isNetworkError(err)) {
          setOffline(true);
        }
        const apiErr = err as ApiError;
        if (
          apiErr?.code === 'PENDING_APPROVAL' ||
          apiErr?.code === 'ACCESS_BLOCKED'
        ) {
          throw new Error(
            'Your account is pending approval. You will be notified once an admin activates membership.',
          );
        }
        throw asError(err, 'Sign in failed. Please try again.');
      }
    },
    [queryClient, revalidateInBackground, setActiveUser, setters],
  );

  const signup = useCallback(
    async (
      partial: Partial<UserProfile> & {email: string; password: string},
    ) => {
      try {
        const username =
          partial.username ||
          `${partial.firstName || 'keeper'}.${partial.lastName || 'member'}`
            .toLowerCase()
            .replace(/\s+/g, '');

        await signupRequest({
          firstName: partial.firstName || '',
          lastName: partial.lastName || '',
          username,
          email: partial.email.trim(),
          password: partial.password,
          phone: partial.phone || '',
          nationality: partial.nationality || '',
          gender: partial.gender || '',
          emergencyContact: partial.emergencyContact || '',
          vehicle: partial.vehicle,
          social: partial.social,
          agreementAccepted: true,
        });

        await clearTokens();
        setAuthMode('auth');
        setUser(EMPTY_USER);
      } catch (err) {
        if (isNetworkError(err)) {
          setOffline(true);
        }
        throw asError(err, 'Signup failed. Please try again.');
      }
    },
    [],
  );

  const resetLocalSession = useCallback(() => {
    setUser(EMPTY_USER);
    setTrips([]);
    setNotifications([]);
    setHeroSlides([]);
    setSponsors([]);
    setGallery([]);
    setMembers([]);
    setAuthMode('auth');
  }, []);

  const refreshNotificationsQuiet = useCallback(async () => {
    const uid = user.id || activeUserId;
    if (!uid) return;
    try {
      const nextNotes = await queryClient.fetchQuery({
        queryKey: queryKeys.notifications(uid),
        queryFn: fetchNotifications,
        ...cachePolicy.frequent,
      });
      setNotifications(nextNotes);
    } catch {
      // Quiet refresh — ignore offline / auth races.
    }
  }, [activeUserId, queryClient, user.id]);

  const logout = useCallback(async () => {
    const uid = user.id || activeUserId;
    const email = (user.email || '').trim().toLowerCase();
    if (email) {
      await AsyncStorage.setItem(STORAGE_KEYS.lastLoginEmail, email);
    }
    try {
      const {deactivatePushDevicesRequest} = await import('../api/keepersApi');
      await deactivatePushDevicesRequest();
    } catch {
      // Best-effort token cleanup.
    }
    try {
      const {disconnectChatSocket} = await import('../chat/chatSocket');
      disconnectChatSocket();
    } catch {
      // Best-effort socket cleanup.
    }
    await clearTokens();
    await clearAccountCache(uid);
    resetLocalSession();
  }, [
    activeUserId,
    clearAccountCache,
    resetLocalSession,
    user.email,
    user.id,
  ]);

  const deleteAccount = useCallback(
    async (password: string) => {
      try {
        const uid = user.id || activeUserId;
        await deleteAccountRequest(password);
        await clearTokens();
        await clearAccountCache(uid);
        resetLocalSession();
      } catch (err) {
        if (isNetworkError(err)) {
          setOffline(true);
        }
        throw asError(err, 'Unable to delete account.');
      }
    },
    [activeUserId, clearAccountCache, resetLocalSession, user.id],
  );

  const updateProfile = useCallback(
    async (next: UserProfile) => {
      try {
        const updated = await updateProfileRequest({
          firstName: next.firstName,
          lastName: next.lastName,
          username: next.username,
          phone: next.phone,
          nationality: next.nationality,
          gender: next.gender,
          emergencyContact: next.emergencyContact,
          avatar: next.avatar,
          vehicle: next.vehicle,
          social: next.social,
          notificationPrefs: next.notificationPrefs,
          privacy: next.privacy,
        });
        // PATCH /members/me returns member detail; /auth/me shape is also supported
        const profile = mapMeToProfile({
          ...updated,
          avatar: updated.avatar || updated.avatarUrl || next.avatar || '',
          vehicle: updated.vehicle || next.vehicle,
        });
        setUser(profile);
        const uid = profile.id;
        queryClient.setQueryData(queryKeys.me(uid), updated);
        await invalidateAfterProfileMutation(queryClient, uid);
        setOffline(false);
      } catch (err) {
        if (isNetworkError(err)) {
          setOffline(true);
        }
        throw asError(err, 'Unable to update profile.');
      }
    },
    [queryClient],
  );

  const changePassword = useCallback(
    async (currentPassword: string, nextPassword: string) => {
      try {
        await changePasswordRequest(currentPassword, nextPassword);
      } catch (err) {
        if (isNetworkError(err)) {
          setOffline(true);
        }
        throw asError(err, 'Unable to change password.');
      }
    },
    [],
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      await forgotPasswordRequest(email.trim(), RESET_REDIRECT_URL);
    } catch (err) {
      if (isNetworkError(err)) {
        setOffline(true);
      }
      throw asError(err, 'Unable to send reset email.');
    }
  }, []);

  const completePasswordReset = useCallback(
    async (accessToken: string, nextPassword: string) => {
      try {
        await resetPasswordWithTokenRequest(accessToken, nextPassword);
        setRecoveryAccessToken(null);
      } catch (err) {
        if (isNetworkError(err)) {
          setOffline(true);
        }
        throw asError(err, 'Unable to reset password.');
      }
    },
    [setRecoveryAccessToken],
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? {...n, read: true} : n)),
      );
      const uid = user.id || activeUserId;
      if (uid) {
        queryClient.setQueryData<AppNotification[]>(
          queryKeys.notifications(uid),
          old => (old || []).map(n => (n.id === id ? {...n, read: true} : n)),
        );
      }
      markNotificationReadRequest(id)
        .then(() => {
          if (uid) {
            return invalidateAfterNotificationMutation(queryClient, uid);
          }
        })
        .catch(err => {
          if (isNetworkError(err)) {
            setOffline(true);
          }
        });
    },
    [activeUserId, queryClient, user.id],
  );

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
    const uid = user.id || activeUserId;
    if (uid) {
      queryClient.setQueryData<AppNotification[]>(
        queryKeys.notifications(uid),
        old => (old || []).map(n => ({...n, read: true})),
      );
    }
    markAllNotificationsReadRequest()
      .then(() => {
        if (uid) {
          return invalidateAfterNotificationMutation(queryClient, uid);
        }
      })
      .catch(err => {
        if (isNetworkError(err)) {
          setOffline(true);
        }
      });
  }, [activeUserId, queryClient, user.id]);

  const getTrip = useCallback(
    (id: string) => {
      const fromState = trips.find(t => t.id === id);
      if (fromState) return fromState;
      const uid = user.id || activeUserId;
      if (!uid) return undefined;
      return queryClient.getQueryData<Trip>(queryKeys.trips.detail(uid, id));
    },
    [activeUserId, queryClient, trips, user.id],
  );

  const upsertLocalTrip = useCallback(
    (trip: Trip) => {
      setTrips(prev => upsertTrip(prev, trip));
      const uid = user.id || activeUserId;
      if (uid) {
        queryClient.setQueryData(queryKeys.trips.detail(uid, trip.id), trip);
        queryClient.setQueryData<Trip[]>(
          queryKeys.trips.list(uid, 'all'),
          old => (old ? upsertTrip(old, trip) : [trip]),
        );
      }
    },
    [activeUserId, queryClient, user.id],
  );

  const removeLocalTrip = useCallback(
    (tripId: string) => {
      setTrips(prev => prev.filter(t => t.id !== tripId));
      const uid = user.id || activeUserId;
      if (uid) {
        queryClient.removeQueries({
          queryKey: queryKeys.trips.detail(uid, tripId),
        });
        queryClient.setQueryData<Trip[]>(
          queryKeys.trips.list(uid, 'all'),
          old => (old ? old.filter(t => t.id !== tripId) : old),
        );
        queryClient.setQueryData<Trip[]>(
          queryKeys.trips.organized(uid),
          old => (old ? old.filter(t => t.id !== tripId) : old),
        );
        queryClient.setQueryData<Trip[]>(
          queryKeys.trips.assigned(uid),
          old => (old ? old.filter(t => t.id !== tripId) : old),
        );
      }
    },
    [activeUserId, queryClient, user.id],
  );

  const filterTrips = useCallback(
    (filter: TripFilter, query: string, date?: string | null) => {
      const q = query.trim().toLowerCase();
      return trips.filter(trip => {
        const matchesQuery =
          !q ||
          trip.title.toLowerCase().includes(q) ||
          trip.destination.toLowerCase().includes(q) ||
          trip.difficulty.toLowerCase().includes(q) ||
          trip.organizer.name.toLowerCase().includes(q);

        if (!matchesQuery) {
          return false;
        }

        if (date && trip.date !== date) {
          return false;
        }

        if (filter === 'joined') {
          return (
            trip.status === 'registered' ||
            trip.status === 'pending' ||
            trip.status === 'waitlist'
          );
        }

        // 'all' — callers that need upcoming/past should use tripPresentation helpers
        return true;
      });
    },
    [trips],
  );

  const joinTrip = useCallback(
    async (id: string, requirementIds: string[] = []): Promise<JoinResult> => {
      try {
        const trip = await joinTripRequest(id, requirementIds);
        upsertLocalTrip(trip);
        const uid = user.id || activeUserId;
        if (uid) {
          await invalidateAfterTripMutation(queryClient, uid, id);
          try {
            const nextNotes = await queryClient.fetchQuery({
              queryKey: queryKeys.notifications(uid),
              queryFn: fetchNotifications,
              staleTime: 0,
            });
            setNotifications(nextNotes);
          } catch {
            // non-fatal
          }
        }
        setOffline(false);
        return {
          ok: true,
          status: trip.status,
          message:
            trip.status === 'waitlist'
              ? 'Trip is full. You have been added to the waiting list.'
              : trip.status === 'pending'
                ? 'Registration submitted and awaiting approval.'
                : 'Registration confirmed. See you on the trail.',
        };
      } catch (err) {
        if (isNetworkError(err)) {
          setOffline(true);
        }
        const apiErr = err as ApiError;
        return {
          ok: false,
          message: apiErr?.message || 'Unable to join this trip.',
        };
      }
    },
    [activeUserId, queryClient, upsertLocalTrip, user.id],
  );

  const cancelRegistration = useCallback(
    async (id: string): Promise<CancelResult> => {
      try {
        const trip = await cancelTripRequest(id);
        upsertLocalTrip(trip);
        const uid = user.id || activeUserId;
        if (uid) {
          await invalidateAfterTripMutation(queryClient, uid, id);
          try {
            const nextNotes = await queryClient.fetchQuery({
              queryKey: queryKeys.notifications(uid),
              queryFn: fetchNotifications,
              staleTime: 0,
            });
            setNotifications(nextNotes);
          } catch {
            // non-fatal
          }
        }
        setOffline(false);
        return {
          ok: true,
          status: trip.status,
          message: 'Registration cancelled',
        };
      } catch (err) {
        if (isNetworkError(err)) {
          setOffline(true);
        }
        const apiErr = err as ApiError;
        return {
          ok: false,
          message: apiErr?.message || 'Unable to cancel registration',
        };
      }
    },
    [activeUserId, queryClient, upsertLocalTrip, user.id],
  );

  const value = useMemo(
    () => ({
      bootstrapped,
      authMode,
      displayMode,
      setDisplayMode,
      user,
      trips,
      notifications,
      unreadCount,
      isOffline,
      setOffline,
      recoveryAccessToken,
      setRecoveryAccessToken,
      bootstrap,
      refreshAppData,
      refreshNotificationsQuiet,
      login,
      signup,
      logout,
      deleteAccount,
      updateProfile,
      changePassword,
      requestPasswordReset,
      completePasswordReset,
      markNotificationRead,
      markAllNotificationsRead,
      getTrip,
      upsertLocalTrip,
      removeLocalTrip,
      filterTrips,
      joinTrip,
      cancelRegistration,
      hasPermission,
      hasRole,
      sponsors,
      gallery,
      heroSlides,
      members,
    }),
    [
      bootstrapped,
      authMode,
      displayMode,
      setDisplayMode,
      user,
      trips,
      notifications,
      unreadCount,
      isOffline,
      recoveryAccessToken,
      bootstrap,
      refreshAppData,
      refreshNotificationsQuiet,
      login,
      signup,
      logout,
      deleteAccount,
      updateProfile,
      changePassword,
      requestPasswordReset,
      completePasswordReset,
      markNotificationRead,
      markAllNotificationsRead,
      getTrip,
      upsertLocalTrip,
      removeLocalTrip,
      filterTrips,
      joinTrip,
      cancelRegistration,
      hasPermission,
      hasRole,
      sponsors,
      gallery,
      heroSlides,
      members,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}
