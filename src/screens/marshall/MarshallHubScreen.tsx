import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  BackHeader,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  StatusPill,
} from '../../components';
import {useApp} from '../../context/AppContext';
import {
  useCachedAssignedTrips,
  useCachedOrganizedTrips,
} from '../../hooks/useCachedQueries';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';
import {Trip} from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'MarshallHub'>;

export function MarshallHubScreen({navigation}: Props) {
  const theme = useThemeColors();
  const {hasPermission} = useApp();
  const canCreateDrive = hasPermission('trips.create');
  const canRecommend = hasPermission('upgrades.recommend');
  const canListOrganized =
    hasPermission('trips.create') ||
    hasPermission('trips.manage_own') ||
    hasPermission('trips.manage');

  const drivesQuery = useCachedOrganizedTrips(canListOrganized);
  const assignedQuery = useCachedAssignedTrips();

  const organized = drivesQuery.data || [];
  const assigned = assignedQuery.data || [];

  const drives = useMemo(() => {
    const byId = new Map<string, Trip>();
    for (const trip of organized) {
      byId.set(trip.id, {...trip, accessMode: trip.accessMode || 'organizer'});
    }
    for (const trip of assigned) {
      if (!byId.has(trip.id)) {
        byId.set(trip.id, {...trip, accessMode: 'assigned'});
      }
    }
    return Array.from(byId.values());
  }, [organized, assigned]);

  const loading =
    (canListOrganized && drivesQuery.isLoading && !drivesQuery.data) ||
    (assignedQuery.isLoading && !assignedQuery.data);
  const error =
    (canListOrganized && drivesQuery.isError && !drivesQuery.data
      ? drivesQuery.error instanceof Error
        ? drivesQuery.error.message
        : 'Unable to load your drives.'
      : null) ||
    (assignedQuery.isError && !assignedQuery.data
      ? assignedQuery.error instanceof Error
        ? assignedQuery.error.message
        : 'Unable to load assigned drives.'
      : null);

  const load = async () => {
    await Promise.all([
      canListOrganized ? drivesQuery.refetch() : Promise.resolve(),
      assignedQuery.refetch(),
    ]);
  };

  return (
    <Screen scroll onRefresh={load}>
      <BackHeader onBack={() => navigation.goBack()} />
      <Text style={[styles.kicker, {color: theme.textMuted}]}>Operations</Text>
      <Text style={[styles.title, {color: theme.text}]}>Marshall</Text>
      <Text style={[styles.sub, {color: theme.textMuted}]}>
        {canCreateDrive
          ? 'Create drives, manage attendance, and rate members after each expedition.'
          : 'View assigned drive information. Drive creation, attendance, and ratings require Marshall or Admin authority.'}
      </Text>

      <View style={styles.actions}>
        {canCreateDrive ? (
          <Button
            label="Create Drive"
            onPress={() => navigation.navigate('CreateDrive')}
          />
        ) : null}
        {canRecommend ? (
          <Button
            label="My upgrade recommendations"
            variant="secondary"
            onPress={() => navigation.navigate('MarshallUpgrades')}
            style={{marginTop: canCreateDrive ? spacing.sm : 0}}
          />
        ) : null}
      </View>

      <Text style={[styles.section, {color: theme.text}]}>My drives</Text>

      {loading ? <LoadingState /> : null}
      {!loading && error ? (
        <ErrorState
          title="Unable to load drives"
          message={error}
          actionLabel="Retry"
          onAction={load}
        />
      ) : null}
      {!loading && !error && drives.length === 0 ? (
        <EmptyState
          title="No drives"
          message={
            canCreateDrive
              ? 'Publish a drive to start managing participants and ratings.'
              : 'No drives are assigned to you yet. Ask an Admin to assign you as Pre-Marshall.'
          }
          actionLabel={canCreateDrive ? 'Create Drive' : undefined}
          onAction={
            canCreateDrive
              ? () => navigation.navigate('CreateDrive')
              : undefined
          }
        />
      ) : null}

      {!loading &&
        !error &&
        drives.map(trip => (
          <Pressable
            key={trip.id}
            onPress={() =>
              navigation.navigate('DriveParticipants', {tripId: trip.id})
            }
            style={[
              styles.card,
              {borderColor: theme.border, backgroundColor: theme.surface},
            ]}>
            <View style={styles.row}>
              <Text style={[styles.cardTitle, {color: theme.text}]} numberOfLines={2}>
                {trip.title}
              </Text>
              <StatusPill status={trip.status} />
            </View>
            <Text style={[styles.meta, {color: theme.textMuted}]}>
              {trip.date} · {trip.destination}
            </Text>
            <Text style={[styles.meta, {color: theme.textMuted}]}>
              {trip.registeredCount}/{trip.maxParticipants} registered
              {trip.accessMode === 'assigned' ? ' · Assigned (view only)' : ''}
            </Text>
          </Pressable>
        ))}
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
  actions: {marginBottom: spacing.xl},
  section: {...typography.title, fontSize: 16, marginBottom: spacing.md},
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  cardTitle: {...typography.title, fontSize: 16, flex: 1},
  meta: {...typography.caption, marginTop: spacing.xs},
});
