import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  cancelTripRequest,
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
  signupRequest,
  updateProfileRequest,
} from '../api/keepersApi';
import {
  ApiError,
  clearTokens,
  loadStoredAccessToken,
  setTokens,
} from '../api/client';
import {DEMO_OTP} from '../config/demoAuth';
import {STORAGE_KEYS} from '../config/api';
import {
  announcements,
  appInfo,
  clubBrochure,
  clubProtocols,
  clubStory,
  events,
  safetyBriefing,
  team,
} from '../data/mock';
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
  demoOtp: string;
  bootstrap: () => Promise<void>;
  refreshAppData: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    partial: Partial<UserProfile> & {email: string; password: string},
  ) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (next: UserProfile) => Promise<void>;
  changePassword: (
    currentPassword: string,
    nextPassword: string,
  ) => Promise<void>;
  resetPassword: (email: string, nextPassword: string) => Promise<void>;
  verifyOtp: (code: string) => boolean;
  emailHasAccount: (email: string) => Promise<boolean>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  getTrip: (id: string) => Trip | undefined;
  filterTrips: (
    filter: TripFilter,
    query: string,
    date?: string | null,
  ) => Trip[];
  joinTrip: (id: string) => Promise<JoinResult>;
  cancelRegistration: (id: string) => Promise<CancelResult>;
  hasPermission: (code: string) => boolean;
  hasRole: (code: string) => boolean;
  events: typeof events;
  announcements: typeof announcements;
  team: typeof team;
  sponsors: Sponsor[];
  gallery: GalleryItem[];
  clubStory: typeof clubStory;
  heroSlides: HeroSlide[];
  members: ClubMember[];
  clubProtocols: typeof clubProtocols;
  safetyBriefing: typeof safetyBriefing;
  clubBrochure: typeof clubBrochure;
  appInfo: typeof appInfo;
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

export function AppProvider({children}: {children: React.ReactNode}) {
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

  const loadSessionData = useCallback(async () => {
    const [me, nextTrips, nextNotes, home, directory] = await Promise.all([
      fetchMe(),
      fetchTrips(),
      fetchNotifications(),
      fetchHome(),
      fetchDirectory(),
    ]);
    setUser(mapMeToProfile(me));
    setTrips(nextTrips);
    setNotifications(nextNotes);
    setHeroSlides(home.heroSlides || []);
    setSponsors(home.sponsors || []);
    setGallery(home.gallery || []);
    setMembers(directory);
    setOffline(false);
  }, []);

  const refreshAppData = useCallback(async () => {
    try {
      await loadSessionData();
    } catch (err) {
      if (isNetworkError(err)) {
        setOffline(true);
      }
      const apiErr = err as ApiError;
      if (apiErr?.code === 'UNAUTHORIZED' || apiErr?.code === 'FORBIDDEN') {
        await clearTokens();
        setAuthMode('auth');
        setUser(EMPTY_USER);
      }
      throw asError(err, 'Unable to refresh data.');
    }
  }, [loadSessionData]);

  const bootstrap = useCallback(async () => {
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

      try {
        await loadSessionData();
        setAuthMode('app');
      } catch (err) {
        if (isNetworkError(err)) {
          setOffline(true);
          // Keep token; show auth only if we have no session data yet
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
          setUser(EMPTY_USER);
        }
        setAuthMode('auth');
      }
    } catch {
      setAuthMode('auth');
    } finally {
      setBootstrapped(true);
    }
  }, [loadSessionData]);

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
        const me = await fetchMe();
        const profile = mapMeToProfile(me);
        if ((profile.status || '').toLowerCase() === 'pending') {
          await clearTokens();
          throw new Error(
            'Your account is pending approval. You will be notified once an admin activates membership.',
          );
        }
        setUser(profile);
        const [nextTrips, nextNotes, home, directory] = await Promise.all([
          fetchTrips(),
          fetchNotifications(),
          fetchHome(),
          fetchDirectory(),
        ]);
        setTrips(nextTrips);
        setNotifications(nextNotes);
        setHeroSlides(home.heroSlides || []);
        setSponsors(home.sponsors || []);
        setGallery(home.gallery || []);
        setMembers(directory);
        setOffline(false);
        setAuthMode('app');
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
    [],
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

  const logout = useCallback(async () => {
    await clearTokens();
    setUser(EMPTY_USER);
    setTrips([]);
    setNotifications([]);
    setHeroSlides([]);
    setSponsors([]);
    setGallery([]);
    setMembers([]);
    setAuthMode('auth');
  }, []);

  const deleteAccount = useCallback(async () => {
    await clearTokens();
    setUser(EMPTY_USER);
    setTrips([]);
    setNotifications([]);
    setHeroSlides([]);
    setSponsors([]);
    setGallery([]);
    setMembers([]);
    setAuthMode('auth');
  }, []);

  const updateProfile = useCallback(async (next: UserProfile) => {
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
      setUser(mapMeToProfile(updated));
      setOffline(false);
    } catch (err) {
      if (isNetworkError(err)) {
        setOffline(true);
      }
      throw asError(err, 'Unable to update profile.');
    }
  }, []);

  const changePassword = useCallback(
    async (_currentPassword: string, _nextPassword: string) => {
      throw new Error(
        'Use the forgot password email flow to reset your password.',
      );
    },
    [],
  );

  const resetPassword = useCallback(
    async (email: string, _nextPassword?: string) => {
      try {
        await forgotPasswordRequest(email.trim());
      } catch (err) {
        if (isNetworkError(err)) {
          setOffline(true);
        }
        throw asError(err, 'Unable to send reset email.');
      }
    },
    [],
  );

  const verifyOtp = useCallback((code: string) => {
    const trimmed = code.trim();
    if (/^\d{4,}$/.test(trimmed)) {
      return true;
    }
    return trimmed === DEMO_OTP;
  }, []);

  const emailHasAccount = useCallback(async (email: string) => {
    try {
      await forgotPasswordRequest(email.trim());
      return true;
    } catch (err) {
      if (isNetworkError(err)) {
        setOffline(true);
        throw asError(err, 'Network unavailable.');
      }
      // Do not leak whether the account exists; treat as submitted.
      return true;
    }
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? {...n, read: true} : n)),
    );
    markNotificationReadRequest(id).catch(err => {
      if (isNetworkError(err)) {
        setOffline(true);
      }
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
    markAllNotificationsReadRequest().catch(err => {
      if (isNetworkError(err)) {
        setOffline(true);
      }
    });
  }, []);

  const getTrip = useCallback(
    (id: string) => trips.find(t => t.id === id),
    [trips],
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

        return true;
      });
    },
    [trips],
  );

  const joinTrip = useCallback(async (id: string): Promise<JoinResult> => {
    try {
      const trip = await joinTripRequest(id);
      setTrips(prev => upsertTrip(prev, trip));
      try {
        const nextNotes = await fetchNotifications();
        setNotifications(nextNotes);
      } catch {
        // non-fatal
      }
      setOffline(false);
      return {
        ok: true,
        status: trip.status,
        message:
          trip.status === 'waitlist'
            ? 'Trip is full. You have been added to the waiting list.'
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
  }, []);

  const cancelRegistration = useCallback(
    async (id: string): Promise<CancelResult> => {
      try {
        const trip = await cancelTripRequest(id);
        setTrips(prev => upsertTrip(prev, trip));
        try {
          const nextNotes = await fetchNotifications();
          setNotifications(nextNotes);
        } catch {
          // non-fatal
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
    [],
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
      demoOtp: DEMO_OTP,
      bootstrap,
      refreshAppData,
      login,
      signup,
      logout,
      deleteAccount,
      updateProfile,
      changePassword,
      resetPassword,
      verifyOtp,
      emailHasAccount,
      markNotificationRead,
      markAllNotificationsRead,
      getTrip,
      filterTrips,
      joinTrip,
      cancelRegistration,
      hasPermission,
      hasRole,
      events,
      announcements,
      team,
      sponsors,
      gallery,
      clubStory,
      heroSlides,
      members,
      clubProtocols,
      safetyBriefing,
      clubBrochure,
      appInfo,
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
      bootstrap,
      refreshAppData,
      login,
      signup,
      logout,
      deleteAccount,
      updateProfile,
      changePassword,
      resetPassword,
      verifyOtp,
      emailHasAccount,
      markNotificationRead,
      markAllNotificationsRead,
      getTrip,
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
