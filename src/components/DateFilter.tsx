import React, {useMemo} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {spacing, typography, useThemeColors} from '../theme';
import {Trip} from '../types';

interface DateFilterProps {
  trips: Trip[];
  value: string | null;
  onChange: (date: string | null) => void;
}

function formatLabel(date: string) {
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function DateFilter({trips, value, onChange}: DateFilterProps) {
  const theme = useThemeColors();
  const dates = useMemo(() => {
    const unique = Array.from(new Set(trips.map(t => t.date))).sort();
    return unique;
  }, [trips]);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: theme.textMuted}]}>Date</Text>
        {value ? (
          <Pressable onPress={() => onChange(null)} hitSlop={8}>
            <Text style={[styles.clear, {color: theme.text}]}>Clear</Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        <Pressable
          onPress={() => onChange(null)}
          accessibilityRole="button"
          accessibilityState={{selected: !value}}
          style={[
            styles.option,
            !value && {borderBottomColor: theme.text},
          ]}>
          <Text
            style={[
              styles.label,
              {color: !value ? theme.text : theme.textMuted},
            ]}>
            Any
          </Text>
        </Pressable>
        {dates.map(date => {
          const active = value === date;
          return (
            <Pressable
              key={date}
              onPress={() => onChange(date)}
              accessibilityRole="button"
              accessibilityState={{selected: active}}
              style={[
                styles.option,
                active && {borderBottomColor: theme.text},
              ]}>
              <Text
                style={[
                  styles.label,
                  {color: active ? theme.text : theme.textMuted},
                ]}>
                {formatLabel(date)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={[styles.rule, {backgroundColor: theme.border}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.label,
  },
  clear: {
    ...typography.label,
  },
  row: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  option: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  label: {
    ...typography.label,
    letterSpacing: 1.6,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
  },
});
