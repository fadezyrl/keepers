import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BackHeader, EmptyState, Screen} from '../../components';
import {fetchMyUpgradeRequests} from '../../api/keepersApi';
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
  const [items, setItems] = useState<UpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchMyUpgradeRequests();
      setItems(Array.isArray(data) ? data : []);
      setMessage(null);
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as {message: string}).message)
          : 'Unable to load upgrade requests.';
      setItems([]);
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Screen scroll onRefresh={load}>
      <BackHeader onBack={() => navigation.goBack()} />
      <Text style={[styles.kicker, {color: theme.textMuted}]}>Marshall</Text>
      <Text style={[styles.title, {color: theme.text}]}>Upgrade requests</Text>
      <Text style={[styles.sub, {color: theme.textMuted}]}>
        Pending membership upgrade recommendations across drives.
      </Text>

      {loading ? (
        <Text style={[styles.sub, {color: theme.textMuted}]}>Loading…</Text>
      ) : items.length === 0 ? (
        <EmptyState
          title="No pending upgrades"
          message={
            message ||
            'There are no pending upgrade requests for marshall review right now.'
          }
        />
      ) : (
        items.map(item => (
          <View
            key={item.id}
            style={[
              styles.card,
              {borderColor: theme.border, backgroundColor: theme.surface},
            ]}>
            <Text style={[styles.name, {color: theme.text}]}>
              {`${item.member_first_name || ''} ${item.member_last_name || ''}`.trim() ||
                item.member_username ||
                'Member'}
            </Text>
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
        ))
      )}
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
  name: {...typography.title, fontSize: 16},
  meta: {...typography.caption, marginTop: 4},
  status: {...typography.label, marginTop: spacing.sm, letterSpacing: 1.4},
});
