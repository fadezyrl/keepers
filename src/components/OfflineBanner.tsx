import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useApp} from '../context/AppContext';
import {spacing, typography, useThemeColors} from '../theme';

/** Subtle offline strip — does not block navigation or clear cache. */
export function OfflineBanner() {
  const {isOffline, authMode} = useApp();
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();

  if (!isOffline || authMode !== 'app') {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          paddingTop: Math.max(insets.top * 0.15, 2),
          backgroundColor: theme.dark ? '#3A342C' : '#E8E0D4',
        },
      ]}>
      <Text style={[styles.text, {color: theme.textMuted}]}>
        Offline · showing saved data
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  text: {
    ...typography.caption,
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
