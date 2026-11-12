import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Avatar,
  BackHeader,
  EmptyState,
  Icon,
  Screen,
} from '../../components';
import {useApp} from '../../context/AppContext';
import {RootStackParamList} from '../../navigation/types';
import {radii, spacing, typography, useThemeColors} from '../../theme';
import {MembershipLevel} from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'MembersDirectory'>;

const FILTERS: Array<'All' | MembershipLevel> = [
  'All',
  'Junior',
  'Intermediate',
  'Advanced',
];

export function MembersDirectoryScreen({navigation}: Props) {
  const theme = useThemeColors();
  const {members} = useApp();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<(typeof FILTERS)[number]>('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter(m => {
      const matchesLevel = level === 'All' || m.membership === level;
      if (!matchesLevel) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        m.name.toLowerCase().includes(q) ||
        m.username.toLowerCase().includes(q) ||
        m.membership.toLowerCase().includes(q) ||
        m.vehicle.toLowerCase().includes(q)
      );
    });
  }, [members, query, level]);

  return (
    <Screen scroll>
      <BackHeader onBack={() => navigation.goBack()} />
      <Text style={[styles.kicker, {color: theme.textMuted}]}>Community</Text>
      <Text style={[styles.title, {color: theme.text}]}>Members</Text>
      <Text style={[styles.sub, {color: theme.textMuted}]}>
        Browse registered Keepers members by name or membership level.
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

      {filtered.length === 0 ? (
        <EmptyState
          title="No members found"
          message="Try a different search or membership filter."
          actionLabel="Reset"
          onAction={() => {
            setQuery('');
            setLevel('All');
          }}
        />
      ) : (
        filtered.map(member => (
          <Pressable
            key={member.id}
            onPress={() =>
              navigation.navigate('MemberProfile', {memberId: member.id})
            }
            style={({pressed}) => [
              styles.row,
              {borderBottomColor: theme.border, opacity: pressed ? 0.75 : 1},
            ]}>
            <Avatar uri={member.avatar} size={52} />
            <View style={{flex: 1}}>
              <Text style={[styles.name, {color: theme.text}]}>
                {member.name}
              </Text>
              <Text style={[styles.meta, {color: theme.textMuted}]}>
                {member.membership}
              </Text>
            </View>
            <Icon name="chevron-right" size={16} color={theme.textMuted} />
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {...typography.label},
  title: {...typography.hero, fontSize: 26, marginTop: spacing.xs},
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  name: {...typography.title, fontSize: 16},
  meta: {...typography.caption, marginTop: 3, letterSpacing: 1.2},
});
