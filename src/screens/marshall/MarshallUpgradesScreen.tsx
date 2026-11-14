import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BackHeader, EmptyState, Screen} from '../../components';
import {useCachedUpgradeRequests} from '../../hooks/useCachedQueries';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MarshallUpgrades'>;

type UpgradeRequest = {
  id: string;
  member_first_name?: string;
  member_last_name?: string;
  member_username?: string;
  from_level_name?: string;
  to_level_name?: string;
  trip_title?: string;
  status?: string;
  created_at?: string;
};

export function MarshallUpgradesScreen({navigation}: Props) {
  const theme = useThemeColors();
  const upgradesQuery = useCachedUpgradeRequests();
  const items = (upgradesQuery.data || []) as UpgradeRequest[];
  const loading = upgradesQuery.isLoading && !upgradesQuery.data;
  const message =
    upgradesQuery.isError && !upgradesQuery.data
      ? upgradesQuery.error instanceof Error
        ? upgradesQuery.error.message
        : 'Unable to load upgrade requests.'
      : null;

  return (
    <Screen
      scroll
      onRefresh={async () => {
        await upgradesQuery.refetch();
      }}>
      <BackHeader onBack={() => navigation.goBack()} />
      <Text style={[styles.kicker, {color: theme.textMuted}]}>Marshall</Text>
      <Text style={[styles.title, {color: theme.text}]}>Upgrade requests</Text>
      <Text style={[styles.sub, {color: theme.textMuted}]}>
        Membership upgrade recommendations you have submitted, with Admin decision status.
      </Text>

      {loading ? (
        <Text style={[styles.sub, {color: theme.textMuted}]}>Loading…</Text>
      ) : null}

      {!loading && message ? (
        <Text style={[styles.sub, {color: theme.textMuted}]}>{message}</Text>
      ) : null}

      {!loading && !message && items.length === 0 ? (
        <EmptyState
          title="No upgrade requests"
          message="Recommendations you submit after rating members will appear here."
        />
      ) : null}

      {items.map(item => {
        const name =
          [item.member_first_name, item.member_last_name]
            .filter(Boolean)
            .join(' ') ||
          item.member_username ||
          'Member';
        return (
          <View
            key={item.id}
            style={[
              styles.card,
              {borderColor: theme.border, backgroundColor: theme.surface},
            ]}>
            <Text style={[styles.cardTitle, {color: theme.text}]}>{name}</Text>
            <Text style={[styles.meta, {color: theme.textMuted}]}>
              {(item.from_level_name || '—') + ' → ' + (item.to_level_name || '—')}
            </Text>
            {item.trip_title ? (
              <Text style={[styles.meta, {color: theme.textMuted}]}>
                {item.trip_title}
              </Text>
            ) : null}
            <Text style={[styles.status, {color: theme.text}]}>
              {(item.status || 'pending').toUpperCase()}
            </Text>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {...typography.label},
  title: {...typography.hero, fontSize: 28, marginTop: spacing.xs},
  sub: {
    ...typography.subtitle,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: {...typography.title, fontSize: 16},
  meta: {...typography.caption, marginTop: 4},
  status: {...typography.label, marginTop: spacing.sm, letterSpacing: 1},
});
