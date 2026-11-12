import {useApp} from '../context/AppContext';
import {colors} from './colors';

export function useThemeColors() {
  const {displayMode} = useApp();
  const dark = displayMode === 'dark';

  return {
    dark,
    bg: dark ? colors.black : colors.ivory,
    bgMuted: dark ? '#1A1A18' : colors.cream,
    surface: dark ? '#1A1A18' : colors.white,
    text: dark ? colors.ivory : colors.black,
    textMuted: dark ? colors.greige : colors.stone,
    border: dark ? 'rgba(243,240,234,0.16)' : colors.greige,
    inverse: dark ? colors.ivory : colors.black,
    onInverse: dark ? colors.black : colors.ivory,
    brandBlack: colors.black,
    brandIvory: colors.ivory,
    cream: colors.cream,
    greige: colors.greige,
    stone: colors.stone,
    white: colors.white,
  };
}
