import {Trip} from '../types';
import {
  discoveryStatus,
  isCompletedAdventure,
  isTripCancelled,
} from './tripPresentation';

export type CalendarDotKind =
  | 'upcoming'
  | 'joined'
  | 'completed'
  | 'cancelled';

export const CALENDAR_LEGEND: Array<{
  kind: CalendarDotKind;
  label: string;
  color: string;
}> = [
  {kind: 'upcoming', label: 'Upcoming', color: '#111110'},
  {kind: 'joined', label: 'Joined', color: '#3D5A45'},
  {kind: 'completed', label: 'Completed', color: '#A9A49B'},
  {kind: 'cancelled', label: 'Cancelled', color: '#8B3A2F'},
];

export function calendarDotKind(trip: Trip): CalendarDotKind {
  if (isTripCancelled(trip)) return 'cancelled';
  if (isCompletedAdventure(trip)) return 'completed';

  const status = discoveryStatus(trip);
  if (
    status === 'confirmed' ||
    status === 'pending' ||
    status === 'waitlist' ||
    trip.status === 'registered' ||
    trip.status === 'pending' ||
    trip.status === 'waitlist'
  ) {
    return 'joined';
  }
  return 'upcoming';
}

export function dotsForTrips(trips: Trip[]): CalendarDotKind[] {
  const order: CalendarDotKind[] = [
    'upcoming',
    'joined',
    'completed',
    'cancelled',
  ];
  const present = new Set(trips.map(calendarDotKind));
  return order.filter(kind => present.has(kind));
}

export function sortCalendarDayTrips(trips: Trip[]): Trip[] {
  const rank = (trip: Trip) => {
    const kind = calendarDotKind(trip);
    if (kind === 'upcoming' || kind === 'joined') return 0;
    if (kind === 'completed') return 1;
    return 2;
  };
  return [...trips].sort((a, b) => {
    const byKind = rank(a) - rank(b);
    if (byKind !== 0) return byKind;
    const timeA = String(a.time || '99:99');
    const timeB = String(b.time || '99:99');
    return timeA.localeCompare(timeB);
  });
}
