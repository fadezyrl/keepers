export const TRIP_CATEGORIES = [
  'Desert Drives',
  'Camping Drives',
  'Mountain Drives',
  'Trips & Events',
] as const;

export type TripCategory = (typeof TRIP_CATEGORIES)[number];

export const TRIP_CATEGORY_VISUAL: Record<
  TripCategory,
  {eyebrow: string; accent: string}
> = {
  'Desert Drives': {eyebrow: 'Sand & dunes', accent: '#D2CEC6'},
  'Camping Drives': {eyebrow: 'Overnight trails', accent: '#A9A49B'},
  'Mountain Drives': {eyebrow: 'High ground', accent: '#E5E1DA'},
  'Trips & Events': {eyebrow: 'Club gatherings', accent: '#F3F0EA'},
};

export function isTripCategory(value: unknown): value is TripCategory {
  return (
    typeof value === 'string' &&
    (TRIP_CATEGORIES as readonly string[]).includes(value)
  );
}
