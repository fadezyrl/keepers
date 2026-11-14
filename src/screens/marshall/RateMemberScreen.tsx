import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {showAlert} from '../../alerts';
import {BackHeader, BusyOverlay, Button, Screen} from '../../components';
import {submitRatingRequest} from '../../api/keepersApi';
import {invalidateAfterMarshallMutation, useCacheSession} from '../../cache';
import {useApp} from '../../context/AppContext';
import {useCachedRatingCriteria} from '../../hooks/useCachedQueries';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'RateMember'>;

type Criterion = {
  id: string;
  code: string;
  name: string;
  description?: string;
};

type UpgradeOption = '' | 'Intermediate' | 'Advanced';

export function RateMemberScreen({navigation, route}: Props) {
  const theme = useThemeColors();
  const {user} = useApp();
  const {queryClient, activeUserId} = useCacheSession();
  const {tripId, memberId, memberName} = route.params;
  const criteriaQuery = useCachedRatingCriteria();
  const criteria = useMemo<Criterion[]>(
    () =>
      (criteriaQuery.data || []).map((c: any) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        description: c.description,
      })),
    [criteriaQuery.data],
  );
  const [scores, setScores] = useState<Record<string, number>>({});
  const [upgradeTo, setUpgradeTo] = useState<UpgradeOption>('');
  const loading = criteriaQuery.isLoading && !criteria.length;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(
    criteriaQuery.isError && !criteria.length
      ? criteriaQuery.error instanceof Error
        ? criteriaQuery.error.message
        : 'Unable to load rating criteria.'
      : null,
  );

  useEffect(() => {
    if (!criteria.length) return;
    setScores(prev => {
      const next = {...prev};
      let changed = false;
      criteria.forEach(c => {
        if (next[c.id] == null) {
          next[c.id] = 3;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [criteria]);

  const onSubmit = async () => {
    if (!criteria.length) {
      setError('No rating criteria available.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await submitRatingRequest({
        tripId,
        memberId,
        scores: criteria.map(c => ({
          criterionId: c.id,
          code: c.code,
          score: scores[c.id] || 3,
        })),
        recommendUpgradeTo: upgradeTo || undefined,
      });
      const uid = user.id || activeUserId;
      if (uid) {
        await invalidateAfterMarshallMutation(queryClient, uid, tripId);
      }
      showAlert({
        type: 'success',
        title: 'Rating submitted',
        message: `${memberName} has been rated.`,
        buttonText: 'Done',
        onClose: () => navigation.goBack(),
      });
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as {message: string}).message)
          : 'Unable to submit rating.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <BackHeader onBack={() => navigation.goBack()} />
      <Text style={[styles.kicker, {color: theme.textMuted}]}>Marshall</Text>
      <Text style={[styles.title, {color: theme.text}]}>Rate member</Text>
      <Text style={[styles.sub, {color: theme.textMuted}]}>
        Score {memberName} after this drive. Optional upgrade recommendation below.
      </Text>

      {loading ? (
        <Text style={[styles.sub, {color: theme.textMuted}]}>Loading criteria…</Text>
      ) : (
        criteria.map(item => (
          <View
            key={item.id}
            style={[styles.block, {borderColor: theme.border}]}>
            <Text style={[styles.criterion, {color: theme.text}]}>{item.name}</Text>
            {item.description ? (
              <Text style={[styles.desc, {color: theme.textMuted}]}>
                {item.description}
              </Text>
            ) : null}
            <View style={styles.scoreRow}>
              {[1, 2, 3, 4, 5].map(n => {
                const active = (scores[item.id] || 0) === n;
                return (
                  <Pressable
                    key={n}
                    onPress={() =>
                      setScores(prev => ({...prev, [item.id]: n}))
                    }
                    style={[
                      styles.scoreBtn,
                      {
                        borderColor: theme.border,
                        backgroundColor: active ? theme.inverse : theme.surface,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.scoreLabel,
                        {color: active ? theme.onInverse : theme.text},
                      ]}>
                      {n}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))
      )}

      <Text style={[styles.fieldLabel, {color: theme.textMuted}]}>
        Recommend upgrade (optional)
      </Text>
      <View style={styles.chips}>
        {(['', 'Intermediate', 'Advanced'] as UpgradeOption[]).map(option => {
          const active = upgradeTo === option;
          const label = option || 'None';
          return (
            <Pressable
              key={label}
              onPress={() => setUpgradeTo(option)}
              style={[
                styles.chip,
                {
                  borderColor: theme.border,
                  backgroundColor: active ? theme.inverse : theme.surface,
                },
              ]}>
              <Text
                style={[
                  styles.chipLabel,
                  {color: active ? theme.onInverse : theme.textMuted},
                ]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <Text style={[styles.error, {color: theme.text}]}>{error}</Text>
      ) : null}

      <Button
        label="Submit rating"
        onPress={onSubmit}
        loading={saving}
        disabled={loading || !criteria.length}
        style={{marginTop: spacing.md, marginBottom: spacing.xxl}}
      />
      <BusyOverlay visible={saving} message="Submitting rating…" />
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
  block: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  criterion: {...typography.title, fontSize: 16},
  desc: {...typography.caption, marginTop: 4},
  scoreRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  scoreBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  scoreLabel: {...typography.title, fontSize: 15},
  fieldLabel: {
    ...typography.label,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipLabel: {...typography.label, letterSpacing: 1.2},
  error: {...typography.caption, marginTop: spacing.sm},
});
