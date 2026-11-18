import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  BackHeader,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from '../../components';
import {useCachedMyProgress} from '../../hooks/useCachedQueries';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MyProgress'>;

function formatAvg(value: number | null | undefined) {
  if (value == null) return '—';
  return value.toFixed(1);
}

function upgradeLabel(status: string) {
  switch (status) {
    case 'pending_admin':
      return 'Pending Admin review';
    case 'awaiting_recommendation':
      return 'Ready for Marshall recommendation';
    case 'approved':
      return 'Upgrade approved';
    case 'rejected':
      return 'Last request declined';
    default:
      return 'No recommendation yet';
  }
}

export function MyProgressScreen({navigation}: Props) {
  const theme = useThemeColors();
  const query = useCachedMyProgress();
  const data = query.data;

  const progressPct = useMemo(() => {
    const ratio = data?.progression.progressRatio;
    if (ratio == null) return null;
    return Math.round(ratio * 100);
  }, [data?.progression.progressRatio]);

  if (query.isLoading && !data) {
    return (
      <Screen>
        <BackHeader onBack={() => navigation.goBack()} />
        <LoadingState label="Loading your progress..." />
      </Screen>
    );
  }

  if (query.isError && !data) {
    return (
      <Screen>
        <BackHeader onBack={() => navigation.goBack()} />
        <ErrorState
          title="Progress unavailable"
          message="We could not load your adventure progress."
          actionLabel="Retry"
          onAction={() => {
            void query.refetch();
          }}
        />
      </Screen>
    );
  }

  if (!data) {
    return (
      <Screen>
        <BackHeader onBack={() => navigation.goBack()} />
        <EmptyState
          title="No progress yet"
          message="Join a drive to start building your Keepers history."
        />
      </Screen>
    );
  }

  const {stats, performance, progression} = data;
  const next = progression.nextLevel;

  return (
    <Screen
      scroll
      onRefresh={async () => {
        await query.refetch();
      }}>
      <BackHeader onBack={() => navigation.goBack()} />
      <Text style={[styles.kicker, {color: theme.textMuted}]}>Membership</Text>
      <Text style={[styles.title, {color: theme.text}]}>My Progress</Text>
      <Text style={[styles.sub, {color: theme.textMuted}]}>
        Your drives, ratings, and path to the next membership level.
      </Text>

      <View
        style={[
          styles.heroCard,
          {borderColor: theme.border, backgroundColor: theme.surface},
        ]}>
        <Text style={[styles.heroLabel, {color: theme.textMuted}]}>
          Current level
        </Text>
        <Text style={[styles.heroLevel, {color: theme.text}]}>
          {progression.currentLevel?.name || data.membership?.name || 'Member'}
        </Text>
        <Text style={[styles.heroMeta, {color: theme.textMuted}]}>
          {upgradeLabel(progression.upgradeStatus)}
        </Text>
        {next ? (
          <Text style={[styles.heroNext, {color: theme.text}]}>
            Next · {next.name}
          </Text>
        ) : (
          <Text style={[styles.heroNext, {color: theme.textMuted}]}>
            Highest configured level reached
          </Text>
        )}
        {progressPct != null ? (
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${progressPct}%`,
                  backgroundColor: theme.inverse,
                },
              ]}
            />
          </View>
        ) : null}
        {progression.remainingDrives != null && next?.minCompletedTrips ? (
          <Text style={[styles.barCaption, {color: theme.textMuted}]}>
            {stats.completedTrips} / {next.minCompletedTrips} completed drives
            {progression.remainingDrives > 0
              ? ` · ${progression.remainingDrives} remaining`
              : ' · drive count met'}
          </Text>
        ) : (
          <Text style={[styles.barCaption, {color: theme.textMuted}]}>
            Upgrade still requires Marshall recommendation and Admin approval.
          </Text>
        )}
      </View>

      <View style={styles.statGrid}>
        <Stat
          label="Completed"
          value={String(stats.completedTrips)}
          theme={theme}
        />
        <Stat
          label="Attended"
          value={String(stats.attendedDrives)}
          theme={theme}
        />
        <Stat
          label="Ratings"
          value={String(stats.ratingsReceived)}
          theme={theme}
        />
        <Stat
          label="Average"
          value={formatAvg(stats.overallAverage)}
          theme={theme}
        />
      </View>

      <Text style={[styles.section, {color: theme.textMuted}]}>
        Performance
      </Text>
      {performance.ratingsReceived === 0 ? (
        <Text style={[styles.body, {color: theme.textMuted}]}>
          No ratings yet. Once a Marshall rates you after a completed drive,
          category averages appear here.
        </Text>
      ) : (
        <>
          {performance.categoryAverages.map(cat => (
            <View
              key={cat.criterionId}
              style={[styles.row, {borderBottomColor: theme.border}]}>
              <Text style={[styles.rowLabel, {color: theme.text}]}>
                {cat.name}
              </Text>
              <Text style={[styles.rowValue, {color: theme.textMuted}]}>
                {cat.sampleSize > 0 ? formatAvg(cat.average) : '—'}
              </Text>
            </View>
          ))}
          {performance.ratingTrend.length > 0 ? (
            <>
              <Text
                style={[
                  styles.section,
                  {color: theme.textMuted, marginTop: spacing.lg},
                ]}>
                Recent trend
              </Text>
              {performance.ratingTrend.map(point => (
                <View
                  key={`${point.tripId}-${point.ratedAt}`}
                  style={[styles.row, {borderBottomColor: theme.border}]}>
                  <View style={{flex: 1}}>
                    <Text style={[styles.rowLabel, {color: theme.text}]}>
                      {point.title}
                    </Text>
                    <Text style={[styles.rowHint, {color: theme.textMuted}]}>
                      {formatDate(point.date)}
                    </Text>
                  </View>
                  <Text style={[styles.rowValue, {color: theme.text}]}>
                    {formatAvg(point.overall)}
                  </Text>
                </View>
              ))}
            </>
          ) : null}
        </>
      )}

      <Text style={[styles.section, {color: theme.textMuted}]}>
        Path to next level
      </Text>
      {progression.requirements.map(req => (
        <View
          key={req.code}
          style={[styles.reqRow, {borderColor: theme.border}]}>
          <Text style={[styles.reqMark, {color: theme.text}]}>
            {req.met ? '✓' : '○'}
          </Text>
          <View style={{flex: 1}}>
            <Text style={[styles.rowLabel, {color: theme.text}]}>
              {req.label}
            </Text>
            {req.required != null ? (
              <Text style={[styles.rowHint, {color: theme.textMuted}]}>
                {req.current ?? '—'} / {req.required}
              </Text>
            ) : null}
          </View>
        </View>
      ))}

      <Text style={[styles.section, {color: theme.textMuted}]}>
        Upgrade status
      </Text>
      <View
        style={[
          styles.statusCard,
          {borderColor: theme.border, backgroundColor: theme.surface},
        ]}>
        <Text style={[styles.rowLabel, {color: theme.text}]}>
          {upgradeLabel(progression.upgradeStatus)}
        </Text>
        {progression.activeRecommendation ? (
          <Text style={[styles.body, {color: theme.textMuted, marginTop: 6}]}>
            Recommended by {progression.activeRecommendation.recommendedBy} for{' '}
            {progression.activeRecommendation.toLevel}. Waiting for Admin
            review.
          </Text>
        ) : null}
        {progression.latestDecision &&
        progression.latestDecision.status !== 'pending' ? (
          <Text style={[styles.body, {color: theme.textMuted, marginTop: 6}]}>
            Latest decision: {progression.latestDecision.status}
            {progression.latestDecision.decisionNotes
              ? ` — ${progression.latestDecision.decisionNotes}`
              : ''}
          </Text>
        ) : null}
        {progression.upgradeHistory.length === 0 ? (
          <Text style={[styles.body, {color: theme.textMuted, marginTop: 6}]}>
            No Marshall recommendation has been submitted for you yet.
          </Text>
        ) : null}
      </View>

      {progression.upgradeHistory.length > 0 ? (
        <>
          <Text style={[styles.section, {color: theme.textMuted}]}>
            Upgrade history
          </Text>
          {progression.upgradeHistory.map(item => (
            <View
              key={item.id}
              style={[styles.row, {borderBottomColor: theme.border}]}>
              <View style={{flex: 1}}>
                <Text style={[styles.rowLabel, {color: theme.text}]}>
                  {item.fromLevel || '—'} → {item.toLevel}
                </Text>
                <Text style={[styles.rowHint, {color: theme.textMuted}]}>
                  {item.status} · {formatDate(item.createdAt)}
                  {item.recommendedBy ? ` · ${item.recommendedBy}` : ''}
                </Text>
              </View>
            </View>
          ))}
        </>
      ) : null}

      <Button
        label="View My Trips"
        onPress={() =>
          navigation.navigate('Trips', {tab: 'mine'})
        }
        style={{marginTop: spacing.lg, marginBottom: spacing.xxl}}
      />
    </Screen>
  );
}

function Stat({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View
      style={[
        styles.stat,
        {borderColor: theme.border, backgroundColor: theme.surface},
      ]}>
      <Text style={[styles.statValue, {color: theme.text}]}>{value}</Text>
      <Text style={[styles.statLabel, {color: theme.textMuted}]}>{label}</Text>
    </View>
  );
}

function formatDate(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  kicker: {...typography.label},
  title: {...typography.hero, fontSize: 28, marginTop: spacing.xs},
  sub: {
    ...typography.subtitle,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  heroCard: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  heroLabel: {...typography.label},
  heroLevel: {...typography.title, fontSize: 26, marginTop: spacing.xs},
  heroMeta: {...typography.caption, marginTop: spacing.xs},
  heroNext: {...typography.body, marginTop: spacing.sm},
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  barFill: {height: '100%'},
  barCaption: {...typography.caption, marginTop: spacing.sm},
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stat: {
    width: '47%',
    flexGrow: 1,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  statValue: {...typography.title, fontSize: 22},
  statLabel: {...typography.label, marginTop: 4},
  section: {
    ...typography.section,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  body: {...typography.body},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  rowLabel: {...typography.body},
  rowValue: {...typography.title, fontSize: 16},
  rowHint: {...typography.caption, marginTop: 2},
  reqRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  reqMark: {...typography.title, fontSize: 16, width: 20},
  statusCard: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
});
