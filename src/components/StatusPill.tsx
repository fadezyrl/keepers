import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, typography} from '../theme';
import {TripStatus} from '../types';
import {statusPillLabel} from '../utils/tripPresentation';

export function StatusPill({
  status,
  tone = 'light',
  label,
}: {
  status: TripStatus;
  tone?: 'light' | 'dark';
  label?: string;
}) {
  const dark = tone === 'dark';
  return (
    <View style={[styles.pill, dark && styles.pillDark]}>
      <Text style={[styles.text, dark && styles.textDark]}>
        {label || statusPillLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.black,
  },
  pillDark: {
    borderBottomColor: colors.ivory,
  },
  text: {
    ...typography.label,
    fontSize: 10,
    color: colors.black,
    letterSpacing: 2,
  },
  textDark: {
    color: colors.ivory,
  },
});
