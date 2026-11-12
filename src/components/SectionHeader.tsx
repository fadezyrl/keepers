import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, spacing, typography, useThemeColors} from '../theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'light' | 'dark';
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  tone = 'light',
}: SectionHeaderProps) {
  const theme = useThemeColors();
  const dark = tone === 'dark';
  const rule = dark ? 'rgba(243,240,234,0.2)' : theme.border;

  return (
    <View style={styles.wrap}>
      <View style={[styles.rule, {backgroundColor: rule}]} />
      <View style={styles.row}>
        <View style={styles.textCol}>
          <Text
            style={[
              styles.title,
              {color: dark ? colors.greige : theme.textMuted},
            ]}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, dark && styles.subtitleDark]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} hitSlop={8}>
            <Text
              style={[
                styles.action,
                {color: dark ? colors.ivory : theme.text},
              ]}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  textCol: {
    flex: 1,
    paddingRight: spacing.md,
  },
  title: {
    ...typography.section,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 6,
  },
  subtitleDark: {
    color: colors.textMutedOnDark,
  },
  action: {
    ...typography.label,
  },
});
