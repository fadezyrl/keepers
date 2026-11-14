import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  BackHeader,
  ErrorState,
  LoadingState,
  RemoteImage,
  Screen,
} from '../../components';
import {useCachedMyTripPerformance} from '../../hooks/useCachedQueries';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MyTripPerformance'>;

function formatDate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function MyTripPerformanceScreen({navigation, route}: Props) {
  const theme = useThemeColors();
  const query = useCachedMyTripPerformance(route.params.tripId);
  const data = query.data;

  if (query.isLoading && !data) {
    return (
      <Screen>
        <BackHeader onBack={() => navigation.goBack()} />
        <LoadingState label="Loading trip performance..." />
      </Screen>
    );
  }

  if (query.isError || !data) {
    return (
      <Screen>
        <BackHeader onBack={() => navigation.goBack()} />
        <ErrorState
          title="Trip unavailable"
          message="This trip is not in your history, or it could not be loaded."
          actionLabel="Retry"
          onAction={() => {
            void query.refetch();
          }}
        />
      </Screen>
    );
  }

  const {trip, attendance, rating} = data;

  return (
    <Screen
      scroll
      onRefresh={async () => {
        await query.refetch();
      }}>
      <BackHeader onBack={() => navigation.goBack()} />
      <Text style={[styles.kicker, {color: theme.textMuted}]}>Performance</Text>
      <Text style={[styles.title, {color: theme.text}]}>{trip.title}</Text>
      <Text style={[styles.sub, {color: theme.textMuted}]}>
        {formatDate(trip.date)}
        {trip.destination ? ` · ${trip.destination}` : ''}
      </Text>

      {trip.coverImage ? (
        <RemoteImage uri={trip.coverImage} style={styles.cover} />
      ) : null}

      <Text style={[styles.section, {color: theme.textMuted}]}>Drive</Text>
      <Info label="Status" value={trip.status} theme={theme} />
      <Info
        label="Organizer"
        value={trip.organizerName || '—'}
        theme={theme}
      />
      <Info
        label="Meeting point"
        value={trip.meetingPoint || '—'}
        theme={theme}
      />
      {trip.difficulty ? (
        <Info label="Difficulty" value={trip.difficulty} theme={theme} />
      ) : null}

      <Text style={[styles.section, {color: theme.textMuted}]}>Attendance</Text>
      <Info
        label="Your status"
        value={
          attendance.attended === true
            ? 'Attended'
            : attendance.attended === false
              ? 'Absent'
              : attendance.status
        }
        theme={theme}
      />
      <Info
        label="Marked"
        value={attendance.markedAt ? formatDate(attendance.markedAt) : '—'}
        theme={theme}
      />

      <Text style={[styles.section, {color: theme.textMuted}]}>Rating</Text>
      {!rating ? (
        <View
          style={[
            styles.notice,
            {borderColor: theme.border, backgroundColor: theme.surface},
          ]}>
          <Text style={[styles.noticeTitle, {color: theme.text}]}>
            Not rated yet
          </Text>
          <Text style={[styles.noticeBody, {color: theme.textMuted}]}>
            A Marshall has not submitted a rating for this drive. Scores are
            never invented when missing.
          </Text>
        </View>
      ) : (
        <>
          <Info
            label="Overall"
            value={
              rating.overall != null ? rating.overall.toFixed(1) : '—'
            }
            theme={theme}
          />
          <Info label="Marshall" value={rating.marshallName} theme={theme} />
          <Info label="Rated on" value={formatDate(rating.ratedAt)} theme={theme} />

          <Text
            style={[
              styles.section,
              {color: theme.textMuted, marginTop: spacing.md},
            ]}>
            Category scores
          </Text>
          {rating.scores.map(score => (
            <View
              key={score.criterionId}
              style={[styles.scoreRow, {borderBottomColor: theme.border}]}>
              <Text style={[styles.scoreName, {color: theme.text}]}>
                {score.name}
              </Text>
              <Text style={[styles.scoreValue, {color: theme.text}]}>
                {score.score}/{score.maxScore}
              </Text>
            </View>
          ))}

          {rating.feedback ? (
            <>
              <Text style={[styles.section, {color: theme.textMuted}]}>
                Marshall feedback
              </Text>
              <Text style={[styles.feedback, {color: theme.text}]}>
                {rating.feedback}
              </Text>
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}

function Info({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={[styles.infoRow, {borderBottomColor: theme.border}]}>
      <Text style={[styles.infoLabel, {color: theme.textMuted}]}>{label}</Text>
      <Text style={[styles.infoValue, {color: theme.text}]}>{value}</Text>
    </View>
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
  cover: {
    width: '100%',
    height: 180,
    marginBottom: spacing.md,
  },
  section: {
    ...typography.section,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  infoRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: {...typography.label},
  infoValue: {...typography.body, marginTop: 4},
  notice: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  noticeTitle: {...typography.title, fontSize: 16},
  noticeBody: {...typography.body, marginTop: spacing.xs},
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scoreName: {...typography.body},
  scoreValue: {...typography.title, fontSize: 16},
  feedback: {...typography.body, marginBottom: spacing.xxl},
});
