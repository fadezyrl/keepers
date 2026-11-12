import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {spacing, typography, useThemeColors} from '../theme';
import {Icon} from './Icon';

interface BackHeaderProps {
  title?: string;
  onBack: () => void;
}

export function BackHeader({title = 'Back', onBack}: BackHeaderProps) {
  const theme = useThemeColors();

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack}
        hitSlop={10}
        style={({pressed}) => [styles.btn, pressed && {opacity: 0.7}]}>
        <Icon name="chevron-left" size={20} color={theme.text} />
        <Text style={[styles.label, {color: theme.text}]}>{title}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.label,
    letterSpacing: 1.8,
  },
});
