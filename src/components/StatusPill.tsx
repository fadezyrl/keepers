import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, typography} from '../theme';
import {TripStatus} from '../types';

const labels: Record<TripStatus, string> = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  full: 'Full',
  registered: 'Registered',
  pending: 'Pending',
  waitlist: 'Waitlist',
};

export function StatusPill({
  status,
  tone = 'light',
}: {
  status: TripStatus;
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';
  return (
    <View style={[styles.pill, dark && styles.pillDark]}>
      <Text style={[styles.text, dark && styles.textDark]}>{labels[status]}</Text>
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
