export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 72,
} as const;

/** Editorial product uses sharp geometry — avoid soft template radii. */
export const radii = {
  none: 0,
  sm: 0,
  md: 0,
  lg: 0,
  xl: 2,
  pill: 999,
} as const;
