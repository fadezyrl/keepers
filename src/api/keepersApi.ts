import {apiRequest, apiUpload} from './client';
import {
  AppNotification,
  ClubMember,
  GalleryItem,
  HeroSlide,
  MemberProgress,
  MemberTripHistoryPage,
  MemberTripPerformance,
  MembershipLevel,
  Sponsor,
  Trip,
  UserProfile,
} from '../types';

function asMembership(value?: string | null): MembershipLevel {
  const v = (value || 'Junior').toLowerCase();
  if (v.startsWith('adv')) return 'Advanced';
  if (v.startsWith('int')) return 'Intermediate';
  return 'Junior';
}

export function mapMeToProfile(me: any): UserProfile {
  return {
    id: me.id,
    firstName: me.firstName || '',
    lastName: me.lastName || '',
    username: me.username || '',
    email: me.email || '',
    phone: me.phone || '',
    nationality: me.nationality || '',
    gender: me.gender || '',
    emergencyContact: me.emergencyContacts?.[0]?.phone || '',
    avatar: me.avatar || '',
    membership: asMembership(me.membership || me.membershipCode),
    completedTrips: me.completedTrips || 0,
    vehicle: {
      manufacturer: me.vehicle?.manufacturer || '',
      model: me.vehicle?.model || '',
      year: me.vehicle?.year || '',
      vin: me.vehicle?.vin || '',
      image: me.vehicle?.image || '',
    },
    social: {
      instagram: me.social?.instagram || '',
      facebook: me.social?.facebook || '',
      tiktok: me.social?.tiktok || '',
    },
    notificationPrefs: me.notificationPrefs || {
      trips: true,
      events: true,
      club: true,
      registrations: true,
      ratings: true,
    },
    privacy: me.privacy || {showVehicle: true, showSocial: true},
    roles: me.roles || [],
    permissions: me.permissions || [],
    status: me.status,
  };
}

/** Prefer civil YYYY-MM-DD; recover local calendar day from ISO datetimes. */
function mapTripDate(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const isoDay = value.match(/^(\d{4}-\d{2}-\d{2})/);
    // Bare date prefix is only safe when the value is not a shifted UTC midnight.
    if (isoDay && !/[T\s]\d{2}:/.test(value)) return isoDay[1];
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    return value.slice(0, 10);
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return String(value).slice(0, 10);
}

export function mapApiTrip(t: any): Trip {
  return {
    id: t.id,
    title: t.title,
    description: t.description || '',
    destination: t.destination,
    meetingPoint: t.meetingPoint || '',
    date: mapTripDate(t.date),
    time: t.time ? String(t.time).slice(0, 5) : '',
    difficulty: t.difficulty || 'Moderate',
    tripType: t.tripType || '',
    requiredMembership: asMembership(
      t.requiredMembership || t.requiredMembershipCode,
    ),
    minTripsRequired: t.minTripsRequired || 0,
    coverImage: t.coverImage || '',
    gallery: t.gallery || [],
    videos: Array.isArray(t.media)
      ? t.media
          .filter((m: any) => m?.media_type === 'video' && m?.public_url)
          .map((m: any) => m.public_url as string)
      : t.videos || [],
    mediaItems: Array.isArray(t.media)
      ? t.media
          .filter((m: any) => m?.id && m?.public_url)
          .map((m: any) => ({
            id: String(m.id),
            mediaType: (m.media_type === 'video' ? 'video' : 'image') as
              | 'image'
              | 'video',
            url: String(m.public_url),
            caption: m.caption ?? null,
          }))
      : undefined,
    maxParticipants: t.maxParticipants || 0,
    registeredCount: t.registeredCount || 0,
    pendingCount: t.pendingCount || 0,
    vehicleRequirements: t.vehicleRequirements || '',
    instructions: t.instructions || '',
    location: {
      label: t.location?.label || t.destination,
      latitude: t.location?.latitude || 0,
      longitude: t.location?.longitude || 0,
    },
    organizer: {
      name: t.organizer?.name || 'Organizer',
      role: t.organizer?.role || 'Marshall',
      avatar: t.organizer?.avatar || '',
      phone: t.organizer?.phone || '',
    },
    organizerId: t.organizerId || t.organizer?.id,
    createdBy: t.createdBy || undefined,
    participants: (t.participants || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      vehicle: p.vehicle,
      registrationId: p.registrationId || p.registration_id,
      registrationStatus: p.registrationStatus || p.registration_status,
      registeredAt: p.registeredAt || p.registered_at,
      readinessChecklist: Array.isArray(p.readinessChecklist)
        ? p.readinessChecklist.map((item: any) => ({
            id: String(item.id),
            code: String(item.code || ''),
            label: String(item.label || ''),
            selected: Boolean(item.selected),
            submittedAt: item.submittedAt
              ? String(item.submittedAt)
              : undefined,
          }))
        : undefined,
    })),
    status: t.status,
    publishStatus: t.publishStatus || undefined,
    myRegistration: t.myRegistration
      ? {
          id: t.myRegistration.id,
          status: t.myRegistration.status,
          registeredAt: t.myRegistration.registered_at || t.myRegistration.registeredAt,
        }
      : null,
    routeSummary: t.routeSummary || '',
  };
}

export async function permanentlyDeleteTripRequest(tripId: string) {
  return apiRequest<{
    id: string;
    permanentlyDeleted: boolean;
    title?: string;
  }>(`/trips/${tripId}/permanent`, {
    method: 'DELETE',
  });
}

export function mapMemberDetail(m: any): ClubMember {
  const vehicle = m.vehicle || null;
  const ratings = m.ratings || null;
  const attendance = m.attendance || null;
  const progression = m.progressionHistory || null;

  return {
    id: m.id,
    name: m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim(),
    username: m.username,
    avatar: m.avatar || '',
    membership: asMembership(m.membership || m.membershipCode),
    membershipCode: m.membershipCode || undefined,
    gender: m.gender || undefined,
    vehicle: vehicle
      ? `${vehicle.manufacturer || ''} ${vehicle.model || ''}`.trim()
      : '',
    vehicleYear: vehicle?.year ? String(vehicle.year) : undefined,
    vehicleVin: vehicle?.vin ? String(vehicle.vin) : undefined,
    vehicleImage: vehicle?.image || m.vehicles?.[0]?.image,
    joinedAt: m.createdAt || '',
    nationality: m.nationality,
    bio: m.bio,
    social: m.social,
    roles: Array.isArray(m.roles) ? m.roles : [],
    ratings: ratings
      ? {
          ratingsReceived: Number(ratings.ratingsReceived || 0),
          overallAverage:
            ratings.overallAverage == null
              ? null
              : Number(ratings.overallAverage),
          categoryAverages: Array.isArray(ratings.categoryAverages)
            ? ratings.categoryAverages.map((c: any) => ({
                criterionId: c.criterionId,
                code: c.code,
                name: c.name,
                average: c.average == null ? null : Number(c.average),
                sampleSize: Number(c.sampleSize || 0),
              }))
            : [],
        }
      : undefined,
    attendance: attendance
      ? {
          total: Number(attendance.total || 0),
          completedTrips: Number(
            attendance.completedTrips ?? m.completedTrips ?? 0,
          ),
        }
      : undefined,
    progressionHistory: progression
      ? {
          junior: Number(progression.junior || 0),
          intermediate: Number(progression.intermediate || 0),
          advanced: Number(progression.advanced || 0),
          preMarshall: Number(progression.preMarshall || 0),
          marshall: Number(progression.marshall || 0),
        }
      : undefined,
  };
}

export async function loginRequest(email: string, password: string) {
  return apiRequest<{
    session: {access_token: string; refresh_token: string};
    user: any;
    accessBlocked?: boolean;
  }>('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({email, password}),
  });
}

export async function signupRequest(payload: Record<string, unknown>) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
}

export async function fetchMe() {
  return apiRequest<any>('/auth/me');
}

export async function fetchHome() {
  return apiRequest<{
    heroSlides: HeroSlide[];
    upcomingTrips: any[];
    sponsors: Sponsor[];
    gallery: GalleryItem[];
  }>('/content/home');
}

export type ContentVersionsPayload = {
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

/** Lightweight module timestamps — prefer this over re-downloading full payloads. */
export async function fetchContentVersions() {
  return apiRequest<ContentVersionsPayload>('/content/versions');
}

export async function fetchSponsors(activeOnly = true) {
  return apiRequest<Sponsor[]>(
    `/content/sponsors?activeOnly=${activeOnly ? 'true' : 'false'}`,
  );
}

export async function fetchEvents() {
  const data = await apiRequest<
    Array<{
      id: string;
      title: string;
      description?: string;
      date: string;
      location?: string;
      image?: string;
      status?: string;
    }>
  >('/events');
  return (data || []).map(e => ({
    id: e.id,
    title: e.title,
    description: e.description || '',
    date: typeof e.date === 'string' ? String(e.date).slice(0, 10) : String(e.date),
    location: e.location || '',
    image: e.image || '',
  }));
}

export async function fetchTrips(
  params: {filter?: string; q?: string; from?: string; to?: string} = {},
) {
  const qs = new URLSearchParams();
  if (params.filter) qs.set('filter', params.filter);
  if (params.q) qs.set('q', params.q);
  if (params.from) qs.set('from', params.from);
  if (params.to) qs.set('to', params.to);
  const data = await apiRequest<{items: any[]}>('/trips?' + qs.toString());
  return (data.items || []).map(mapApiTrip);
}

export async function fetchCalendar(params: {from?: string; to?: string} = {}) {
  const qs = new URLSearchParams();
  if (params.from) qs.set('from', params.from);
  if (params.to) qs.set('to', params.to);
  const data = await apiRequest<{items: any[]}>(
    '/trips/calendar?' + qs.toString(),
  );
  return (data.items || []).map(mapApiTrip);
}

export async function fetchTrip(id: string) {
  const data = await apiRequest<any>(`/trips/${id}`);
  return mapApiTrip(data);
}

export async function fetchMyOrganizedTrips() {
  const data = await apiRequest<{items: any[]}>('/trips/mine/organized');
  return (data.items || []).map(row => ({
    ...mapApiTrip(row),
    accessMode: (row.accessMode || 'organizer') as 'organizer' | 'assigned',
  }));
}

export async function fetchMyAssignedTrips() {
  const data = await apiRequest<{items: any[]}>('/trips/mine/assigned');
  return (data.items || []).map(row => ({
    ...mapApiTrip(row),
    accessMode: 'assigned' as const,
  }));
}

export async function fetchReadinessRequirements() {
  const data = await apiRequest<{items: any[]}>('/trips/readiness-requirements');
  return (data.items || []).map(item => ({
    id: String(item.id),
    code: String(item.code || ''),
    label: String(item.label || ''),
    displayOrder: Number(item.displayOrder || 0),
  }));
}

export async function joinTripRequest(
  id: string,
  requirementIds: string[] = [],
) {
  const data = await apiRequest<any>(`/trips/${id}/join`, {
    method: 'POST',
    body: JSON.stringify({requirementIds}),
  });
  return mapApiTrip(data);
}

export async function cancelTripRequest(id: string) {
  const data = await apiRequest<any>(`/trips/${id}/cancel`, {
    method: 'POST',
    body: '{}',
  });
  return mapApiTrip(data);
}

export async function fetchDirectory(
  params: {q?: string; membership?: string} = {},
) {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.membership) qs.set('membership', params.membership);
  const data = await apiRequest<{items: any[]}>(
    `/members/directory?${qs.toString()}`,
  );
  return (data.items || []).map(mapMemberDetail);
}

export async function fetchMember(id: string) {
  const data = await apiRequest<any>(`/members/${id}`);
  return mapMemberDetail(data);
}

export async function fetchMyProgress() {
  return apiRequest<MemberProgress>('/members/me/progress');
}

export async function fetchMyTripHistory(params: {
  filter?: string;
  page?: number;
  limit?: number;
} = {}) {
  const qs = new URLSearchParams();
  if (params.filter) qs.set('filter', params.filter);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiRequest<MemberTripHistoryPage>(`/members/me/trips${suffix}`);
}

export async function fetchMyTripPerformance(tripId: string) {
  return apiRequest<MemberTripPerformance>(`/members/me/trips/${tripId}`);
}

export async function updateProfileRequest(payload: Record<string, unknown>) {
  return apiRequest<any>('/members/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function fetchNotifications() {
  const data = await apiRequest<any[]>('/content/notifications');
  return (data || []).map(
    (n): AppNotification => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      timestamp: n.timestamp,
      read: n.read,
      data: n.data || {},
    }),
  );
}

export async function registerPushDeviceRequest(payload: {
  fcmToken: string;
  platform: 'android' | 'ios';
  deviceId?: string;
  appVersion?: string;
}) {
  return apiRequest('/content/notifications/devices/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deactivatePushDevicesRequest(payload?: {
  fcmToken?: string;
}) {
  return apiRequest('/content/notifications/devices/deactivate', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

export async function markNotificationReadRequest(id: string) {
  return apiRequest(`/content/notifications/${id}/read`, {
    method: 'POST',
    body: '{}',
  });
}

export async function markAllNotificationsReadRequest() {
  return apiRequest('/content/notifications/read-all', {
    method: 'POST',
    body: '{}',
  });
}

export type AppDocument = {
  id: string;
  slug: string;
  title: string;
  content: string;
  document_type?: string;
  file_url?: string | null;
  version?: string | null;
};

export async function fetchDocument(slug: string) {
  return apiRequest<AppDocument>(`/content/documents/${slug}`);
}

export async function createTripRequest(payload: Record<string, unknown>) {
  return apiRequest<any>('/trips', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTripRequest(
  tripId: string,
  payload: Record<string, unknown>,
) {
  const data = await apiRequest<any>(`/trips/${tripId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return mapApiTrip(data);
}

export async function attachTripMediaRequest(
  tripId: string,
  payload: {url: string; mediaType: 'image' | 'video'; caption?: string},
) {
  const data = await apiRequest<{media: any; trip: any}>(
    `/trips/${tripId}/media`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
  return {
    media: data.media,
    trip: data.trip ? mapApiTrip(data.trip) : null,
  };
}

export async function deleteTripMediaRequest(tripId: string, mediaId: string) {
  return apiRequest<{id: string; tripId: string; deleted: boolean}>(
    `/trips/${tripId}/media/${mediaId}`,
    {method: 'DELETE'},
  );
}

export async function reviewRegistrationRequest(
  registrationId: string,
  payload: {status: 'registered' | 'rejected' | 'waitlist' | 'cancelled' | 'pending'; notes?: string},
) {
  return apiRequest(`/trips/registrations/${registrationId}/review`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function markAttendanceRequest(
  tripId: string,
  body: {userId: string; attended?: boolean; notes?: string},
) {
  return apiRequest(`/trips/${tripId}/attendance`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchRatingCriteria() {
  return apiRequest<any[]>('/ratings/criteria');
}

export async function submitRatingRequest(payload: Record<string, unknown>) {
  return apiRequest('/ratings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchMyUpgradeRequests(status: string = 'all') {
  return apiRequest<any[]>(`/ratings/upgrades/mine?status=${encodeURIComponent(status)}`);
}

export async function forgotPasswordRequest(
  email: string,
  redirectTo = 'keepers://auth/reset-password',
) {
  return apiRequest('/auth/forgot-password', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({email, redirectTo}),
  });
}

export async function changePasswordRequest(
  currentPassword: string,
  nextPassword: string,
) {
  return apiRequest('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({currentPassword, nextPassword}),
  });
}

export async function resetPasswordWithTokenRequest(
  accessToken: string,
  password: string,
) {
  return apiRequest('/auth/reset-password', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({accessToken, password}),
  });
}

export async function deleteAccountRequest(password: string) {
  return apiRequest('/auth/delete-account', {
    method: 'POST',
    body: JSON.stringify({password}),
  });
}

export async function uploadMediaRequest(
  file: {uri: string; name: string; type: string},
  bucket: 'avatars' | 'vehicles' | 'trips' | 'gallery' | 'sponsors' | 'documents',
) {
  return apiUpload<{path: string; publicUrl: string; bucket: string}>(
    '/content/media/upload',
    file,
    {bucket},
  );
}
