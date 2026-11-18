import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  AppHeader,
  Avatar,
  BackHeader,
  EmptyState,
  Icon,
  LoadingState,
  Screen,
} from '../../components';
import {fetchDirectory} from '../../api/keepersApi';
import {useApp} from '../../context/AppContext';
import {RootStackParamList} from '../../navigation/types';
import {radii, spacing, typography, useThemeColors} from '../../theme';
import {ClubMember, MembershipLevel} from '../../types';

const FILTERS: Array<'All' | MembershipLevel> = [
  'All',
  'Junior',
  'Intermediate',
  'Advanced',
];

const TAB_BAR_HEIGHT = 64;
const TAB_BAR_MIN_OFFSET = 10;

function membershipCode(level: MembershipLevel): string {
  return level.toLowerCase();
}

function roleLabel(member: ClubMember): string {
  const roles = (member.roles || [])
    .map(r => (typeof r === 'string' ? r : r?.name || r?.code || ''))
    .filter(Boolean);
  if (roles.some(r => /super.?admin/i.test(String(r)))) return 'Super Admin';
  if (roles.some(r => /^admin$/i.test(String(r)))) return 'Admin';
  if (roles.some(r => /marshall/i.test(String(r)) && !/pre/i.test(String(r)))) {
    return 'Marshall';
  }
  if (roles.some(r => /pre.?marshall/i.test(String(r)))) return 'Pre-Marshall';
  return member.membership || 'Member';
}

export function MembersDirectoryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const {members} = useApp();
  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [level, setLevel] = useState<(typeof FILTERS)[number]>('All');
  const [remoteItems, setRemoteItems] = useState<ClubMember[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parentState = navigation.getParent()?.getState?.();
  const isTab =
    Array.isArray(parentState?.routeNames) &&
    parentState.routeNames.includes('Discover');

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQ(query.trim()), 300);
    return () => clearTimeout(handle);
  }, [query]);

  const runSearch = useCallback(async () => {
    // Server search only when querying — never mixes drives/gallery.
    if (!debouncedQ && level === 'All') {
      setRemoteItems(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await fetchDirectory({
        q: debouncedQ || undefined,
        membership: level === 'All' ? undefined : membershipCode(level),
      });
      setRemoteItems(items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to search members.',
      );
      setRemoteItems([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, level]);

  useEffect(() => {
    void runSearch();
  }, [runSearch]);

  const displayed = useMemo(() => {
    if (remoteItems) return remoteItems;
    if (level === 'All') return members;
    return members.filter(m => m.membership === level);
  }, [remoteItems, members, level]);

  const tabClearance = isTab
    ? TAB_BAR_HEIGHT + Math.max(insets.bottom, TAB_BAR_MIN_OFFSET) + spacing.md
    : spacing.xl;

  return (
    <Screen scroll padded={false} edges={['top']}>
      {isTab ? <AppHeader /> : <BackHeader onBack={() => navigation.goBack()} />}
      <View style={[styles.pad, {paddingBottom: tabClearance}]}>
        <Text style={[styles.kicker, {color: theme.textMuted}]}>Community</Text>
        <Text style={[styles.title, {color: theme.text}]}>Members</Text>
        <Text style={[styles.sub, {color: theme.textMuted}]}>
          Search Keepers members only — name, Marshall rank and membership.
        </Text>

        <View
          style={[
            styles.search,
            {borderColor: theme.border, backgroundColor: theme.surface},
          ]}>
          <Icon name="search" size={18} color={theme.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search members"
            placeholderTextColor={theme.textMuted}
            style={[styles.input, {color: theme.text}]}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.filters}>
          {FILTERS.map(item => {
            const active = level === item;
            return (
              <Pressable
                key={item}
                onPress={() => setLevel(item)}
                style={[
                  styles.filterChip,
                  {
                    borderColor: theme.border,
                    backgroundColor: active ? theme.inverse : theme.surface,
                  },
                ]}>
                <Text
                  style={[
                    styles.filterLabel,
                    {color: active ? theme.onInverse : theme.textMuted},
                  ]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? <LoadingState label="Searching members…" /> : null}
        {!loading && error ? (
          <EmptyState
            title="Search failed"
            message={error}
            actionLabel="Retry"
            onAction={() => void runSearch()}
          />
        ) : null}
        {!loading && !error && displayed.length === 0 ? (
          <EmptyState
            title="No members found"
            message="Try a different name or membership filter."
            actionLabel="Reset"
            onAction={() => {
              setQuery('');
              setLevel('All');
            }}
          />
        ) : null}

        {!loading && !error
          ? displayed.map(member => (
              <Pressable
                key={member.id}
                onPress={() =>
                  navigation.navigate('MemberProfile', {memberId: member.id})
                }
                style={({pressed}) => [
                  styles.banner,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}>
                <Avatar uri={member.avatar} size={64} />
                <View style={styles.bannerCopy}>
                  <Text style={[styles.name, {color: theme.text}]}>
                    {member.name}
                  </Text>
                  <Text style={[styles.meta, {color: theme.textMuted}]}>
                    {roleLabel(member)}
                    {member.username ? `  ·  @${member.username}` : ''}
                  </Text>
                  {member.vehicle ? (
                    <Text style={[styles.vehicle, {color: theme.textMuted}]}>
                      {member.vehicle}
                    </Text>
                  ) : null}
                </View>
                <Icon name="chevron-right" size={16} color={theme.textMuted} />
              </Pressable>
            ))
          : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: spacing.lg,
  },
  kicker: {...typography.label, letterSpacing: 2},
  title: {...typography.hero, fontSize: 30, marginTop: spacing.xs},
  sub: {
    ...typography.subtitle,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    marginBottom: spacing.md,
  },
  input: {flex: 1, paddingVertical: spacing.sm, fontSize: 14},
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterChip: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  filterLabel: {...typography.label, letterSpacing: 1.4},
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  bannerCopy: {flex: 1},
  name: {...typography.title, fontSize: 17},
  meta: {...typography.caption, marginTop: 4, letterSpacing: 1.1},
  vehicle: {...typography.caption, marginTop: 4},
});
