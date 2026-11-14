import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing, typography, useThemeColors} from '../theme';
import type {AlertTone} from './types';

type Props = {
  visible: boolean;
  message: string;
  tone?: AlertTone;
  onHide: () => void;
  duration?: number;
};

export function ToastHost({
  visible,
  message,
  tone = 'info',
  onHide,
  duration = 2600,
}: Props) {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (!visible) return undefined;
    opacity.setValue(0);
    translate.setValue(12);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(translate, {
          toValue: 8,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(({finished}) => {
        if (finished) onHide();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, message, duration, onHide, opacity, translate]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        styles.toast,
        {
          top: insets.top + spacing.sm,
          backgroundColor: theme.dark ? colors.glass : colors.black,
          borderColor: theme.dark ? colors.glassBorder : colors.black,
          opacity,
          transform: [{translateY: translate}],
        },
      ]}>
      <Text
        style={[
          styles.text,
          {color: theme.dark ? colors.ivory : colors.ivory},
        ]}>
        {tone === 'error' ? 'Error · ' : tone === 'success' ? '' : ''}
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    ...typography.body,
    fontSize: 14,
    textAlign: 'center',
  },
});
