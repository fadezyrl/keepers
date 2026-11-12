import {apiRequest} from './client';
import {
  AppNotification,
  ClubMember,
  GalleryItem,
  HeroSlide,
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
    },
    privacy: me.privacy || {showVehicle: true, showSocial: true},
    roles: Array.isArray(me.roles) ? me.roles : [],
    permissions: Array.isArray(me.permissions) ? me.permissions : [],
    status: me.status || undefined,
  };
}

export function mapApiTrip(t: any): Trip {
  return {
    id: t.id,
    title: t.title,
    description: t.description || '',
    destination: t.destination,
    meetingPoint: t.meetingPoint || '',
    date: typeof t.date === 'string' ? t.date.slice(0, 10) : t.date,
    time: t.time ? String(t.time).slice(0, 5) : '',
    difficulty: t.difficulty || 'Moderate',
    tripType: t.tripType || '',
    requiredMembership: asMembership(t.requiredMembership || t.requiredMembershipCode),
    minTripsRequired: t.minTripsRequired || 0,
    coverImage: t.coverImage || '',
    gallery: t.gallery || [],
    maxParticipants: t.maxParticipants || 0,
    registeredCount: t.registeredCount || 0,
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
    participants: (t.participants || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      vehicle: p.vehicle,
    })),
    status: t.status,
    routeSummary: t.routeSummary || '',
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

export async function fetchTrips(params: {filter?: string; q?: string; from?: string; to?: string} = {}) {
  const qs = new URLSearchParams();
  if (params.filter) qs.set('filter', params.filter);
  if (params.q) qs.set('q', params.q);
  if (params.from) qs.set('from', params.from);
  if (params.to) qs.set('to', params.to);
  const data = await apiRequest<{items: any[]}>('/trips?' + qs.toString());
  return (data.items || []).map(mapApiTrip);
}

export async function fetchTrip(id: string) {
  const data = await apiRequest<any>(`/trips/${id}`);
  return mapApiTrip(data);
}

export async function joinTripRequest(id: string) {
  const data = await apiRequest<any>(`/trips/${id}/join`, {method: 'POST', body: '{}'});
  return mapApiTrip(data);
}

export async function cancelTripRequest(id: string) {
  const data = await apiRequest<any>(`/trips/${id}/cancel`, {method: 'POST', body: '{}'});
  return mapApiTrip(data);
}

export async function fetchDirectory(params: {q?: string; membership?: string} = {}) {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.membership) qs.set('membership', params.membership);
  const data = await apiRequest<{items: any[]}>(`/members/directory?${qs.toString()}`);
  return (data.items || []).map(
    (m): ClubMember => ({
      id: m.id,
      name: m.name || `${m.firstName} ${m.lastName}`.trim(),
      username: m.username,
      avatar: m.avatar || '',
      membership: asMembership(m.membership || m.membershipCode),
      vehicle: m.vehicle
        ? `${m.vehicle.manufacturer || ''} ${m.vehicle.model || ''}`.trim()
        : '',
      vehicleImage: m.vehicle?.image,
      joinedAt: m.createdAt || '',
      nationality: m.nationality,
      social: m.social,
    }),
  );
}

export async function fetchMember(id: string) {
  return apiRequest<any>(`/members/${id}`);
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
    }),
  );
}

export async function markNotificationReadRequest(id: string) {
  return apiRequest(`/content/notifications/${id}/read`, {method: 'POST', body: '{}'});
}

export async function markAllNotificationsReadRequest() {
  return apiRequest('/content/notifications/read-all', {method: 'POST', body: '{}'});
}

export async function fetchDocument(slug: string) {
  return apiRequest<any>(`/content/documents/${slug}`);
}

export async function createTripRequest(payload: Record<string, unknown>) {
  return apiRequest<any>('/trips', {
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

export async function fetchMyUpgradeRequests() {
  return apiRequest<any[]>('/ratings/upgrades?status=pending');
}

export async function forgotPasswordRequest(email: string) {
  return apiRequest('/auth/forgot-password', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({email}),
  });
}
