/**
 * Keepers Adventures — luxury editorial palette
 * (aligned with the Keepers website visual identity)
 */
export const colors = {
  black: '#111110',
  ivory: '#F3F0EA',
  cream: '#E5E1DA',
  greige: '#D2CEC6',
  stone: '#A9A49B',
  white: '#FFFFFF',

  transparent: 'transparent',
  overlay: 'rgba(17, 17, 16, 0.55)',
  overlayHeavy: 'rgba(17, 17, 16, 0.78)',
  glass: 'rgba(17, 17, 16, 0.92)',
  glassBorder: 'rgba(243, 240, 234, 0.16)',

  // Semantic surfaces
  bg: '#F3F0EA',
  bgDark: '#111110',
  bgMuted: '#E5E1DA',
  surface: '#FFFFFF',
  border: '#D2CEC6',
  borderStrong: '#A9A49B',

  // Semantic text
  text: '#111110',
  textMuted: '#A9A49B',
  textSoft: '#D2CEC6',
  textOnDark: '#F3F0EA',
  textMutedOnDark: '#D2CEC6',
} as const;

export type ColorToken = keyof typeof colors;
