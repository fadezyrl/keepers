import {MemberTripHistoryItem, Trip, TripStatus} from '../types';

export type DiscoveryStatus =
  | 'available'
  | 'almost_full'
  | 'fully_booked'
  | 'registration_closed'
  | 'cancelled'
  | 'completed'
  | 'confirmed'
  | 'pending'
  | 'waitlist';

export function tripPublishStatus(trip: Trip): string {
  return (trip.publishStatus || '').toLowerCase();
}

export function isTripCancelled(trip: Trip): boolean {
  const pub = tripPublishStatus(trip);
  return pub === 'cancelled' || trip.status === 'cancelled';
}

/** Club Past Trips: genuinely completed drives only — never cancelled. */
export function isCompletedAdventure(trip: Trip): boolean {
  if (isTripCancelled(trip)) return false;
  const pub = tripPublishStatus(trip);
  return pub === 'completed' || trip.status === 'completed';
}

/** Discoverable upcoming drives (exclude completed + cancelled). */
export function isUpcomingDiscoverable(trip: Trip): boolean {
  if (isCompletedAdventure(trip) || isTripCancelled(trip)) return false;
  const pub = tripPublishStatus(trip);
  if (pub === 'draft') return false;
  return true;
}

export function spotsRemaining(trip: Trip): number {
  return Math.max(0, (trip.maxParticipants || 0) - (trip.registeredCount || 0));
}

export function isTripFull(trip: Trip): boolean {
  if (trip.status === 'full') return true;
  const max = trip.maxParticipants || 0;
  if (max <= 0) return false;
  return (trip.registeredCount || 0) >= max;
}

export function formatCapacity(trip: Trip): string {
  const registered = trip.registeredCount || 0;
  const max = trip.maxParticipants || 0;
  return `${registered} of ${max}`;
}

export function formatSpotsLeft(trip: Trip): string {
  const left = spotsRemaining(trip);
  if (left <= 0) return 'No places remaining';
  if (left === 1) return '1 spot left';
  return `${left} spots left`;
}

export function discoveryStatus(trip: Trip): DiscoveryStatus {
  if (isTripCancelled(trip)) return 'cancelled';
  if (isCompletedAdventure(trip)) return 'completed';

  if (trip.status === 'registered') return 'confirmed';
  if (trip.status === 'pending') return 'pending';
  if (trip.status === 'waitlist') return 'waitlist';

  const pub = tripPublishStatus(trip);
  if (pub && pub !== 'published' && pub !== '') {
    return 'registration_closed';
  }

  if (isTripFull(trip)) return 'fully_booked';

  const max = trip.maxParticipants || 0;
  const left = spotsRemaining(trip);
  if (max > 0 && left <= Math.max(2, Math.ceil(max * 0.15))) {
    return 'almost_full';
  }
  return 'available';
}

export function discoveryStatusLabel(status: DiscoveryStatus): string {
  switch (status) {
    case 'available':
      return 'Trips Available';
    case 'almost_full':
      return 'Almost Full';
    case 'fully_booked':
      return 'Fully Booked';
    case 'registration_closed':
      return 'Registration Closed';
    case 'cancelled':
      return 'Cancelled';
    case 'completed':
      return 'Trip Finished';
    case 'confirmed':
      return 'Confirmed';
    case 'pending':
      return 'Pending Approval';
    case 'waitlist':
      return 'Waitlist';
    default:
      return 'Trips Available';
  }
}

export function canJoinTrip(trip: Trip): boolean {
  if (isCompletedAdventure(trip) || isTripCancelled(trip)) return false;
  if (
    trip.status === 'registered' ||
    trip.status === 'pending' ||
    trip.status === 'waitlist'
  ) {
    return false;
  }
  if (isTripFull(trip)) return false;
  const pub = tripPublishStatus(trip);
  if (pub && pub !== 'published' && pub !== '') return false;
  return true;
}

/** Member-facing status for personal history rows. */
export function myTripStatusLabel(item: MemberTripHistoryItem): string {
  switch (item.attendanceStatus) {
    case 'attended':
      return 'Completed';
    case 'absent':
      return 'Absent';
    case 'cancelled':
      return 'Cancelled';
    case 'waitlist':
      return 'Waitlist';
    case 'rejected':
      return 'Not Approved';
    case 'upcoming':
      if (item.registrationStatus === 'pending') return 'Pending Approval';
      if (item.registrationStatus === 'waitlist') return 'Waitlist';
      return 'Confirmed';
    default:
      if (item.registrationStatus === 'pending') return 'Pending Approval';
      if (item.registrationStatus === 'cancelled') return 'Cancelled';
      if (item.registrationStatus === 'registered') return 'Confirmed';
      return item.registrationStatus || item.status || 'Registered';
  }
}

export function isMyTripUpcoming(item: MemberTripHistoryItem): boolean {
  return (
    item.attendanceStatus === 'upcoming' ||
    (item.attendanceStatus === 'registered' &&
      item.status !== 'completed' &&
      item.status !== 'cancelled') ||
    item.attendanceStatus === 'waitlist' ||
    (item.registrationStatus === 'pending' && item.status === 'published')
  );
}

/** Attended only — absent must never count as a completed adventure. */
export function isMyTripCompletedAdventure(item: MemberTripHistoryItem): boolean {
  return item.attendanceStatus === 'attended' || item.attended === true;
}

export function isMyTripOtherHistory(item: MemberTripHistoryItem): boolean {
  return !isMyTripUpcoming(item) && !isMyTripCompletedAdventure(item);
}

export function formatTripDate(date: string, time?: string | null) {
  // Parse civil date parts locally — never rely on Date('YYYY-MM-DD') UTC parsing.
  const [y, m, d] = String(date)
    .slice(0, 10)
    .split('-')
    .map(Number);
  if (!y || !m || !d) {
    return time ? `${date} · ${time}` : date;
  }
  const t = time ? String(time).slice(0, 5) : '';
  const [hh, mm] = t ? t.split(':').map(Number) : [12, 0];
  const local = new Date(y, m - 1, d, hh || 0, mm || 0, 0);
  if (Number.isNaN(local.getTime())) {
    return time ? `${date} · ${time}` : date;
  }
  if (time) {
    return local.toLocaleString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return local.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Compact card date: "Nov 10, 09:00 AM" */
export function formatTripCardDate(date: string, time?: string | null) {
  const [y, m, d] = String(date)
    .slice(0, 10)
    .split('-')
    .map(Number);
  if (!y || !m || !d) {
    return time ? `${date}, ${time}` : date;
  }
  const t = time ? String(time).slice(0, 5) : '';
  const [hh, mm] = t ? t.split(':').map(Number) : [0, 0];
  const local = new Date(y, m - 1, d, hh || 0, mm || 0, 0);
  if (Number.isNaN(local.getTime())) {
    return time ? `${date}, ${time}` : date;
  }
  const month = local.toLocaleString('en-US', {month: 'short'});
  const day = local.getDate();
  if (!time) {
    return `${month} ${day}`;
  }
  const hour24 = local.getHours();
  const minute = String(local.getMinutes()).padStart(2, '0');
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  const hour = String(hour12).padStart(2, '0');
  return `${month} ${day}, ${hour}:${minute} ${ampm}`;
}

export function statusPillLabel(status: TripStatus): string {
  switch (status) {
    case 'upcoming':
      return 'Available';
    case 'full':
      return 'Fully Booked';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'registered':
      return 'Confirmed';
    case 'pending':
      return 'Pending Approval';
    case 'waitlist':
      return 'Waitlist';
    default:
      return String(status);
  }
}
