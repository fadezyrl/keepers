import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {spacing, typography, useThemeColors} from '../theme';
import {TripFilter} from '../types';

const options: {key: TripFilter; label: string}[] = [
  {key: 'all', label: 'All Trips'},
  {key: 'joined', label: 'Joined Trips'},
];

interface FilterChipsProps {
  value: TripFilter;
  onChange: (value: TripFilter) => void;
}

export function FilterChips({value, onChange}: FilterChipsProps) {
  const theme = useThemeColors();

  return (
    <View style={[styles.row, {borderBottomColor: theme.border}]}>
      {options.map(option => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="tab"
            accessibilityState={{selected: active}}
            style={[
              styles.chip,
              active && {borderBottomColor: theme.text},
            ]}>
            <Text
              style={[
                styles.label,
                {
                  color: active ? theme.text : theme.textMuted,
                  fontWeight: active ? '500' : '400',
                },
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
  },
  chip: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: 'transparent',
    marginBottom: -StyleSheet.hairlineWidth,
  },
  label: {
    ...typography.label,
    letterSpacing: 2,
  },
});
