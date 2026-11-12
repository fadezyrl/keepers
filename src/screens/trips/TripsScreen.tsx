import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  AppHeader,
  DateFilter,
  EmptyState,
  FilterChips,
  Icon,
  OfflineState,
  RemoteImage,
  Screen,
} from '../../components';
import {useApp} from '../../context/AppContext';
import {RootStackParamList} from '../../navigation/types';
import {colors, spacing, typography, useThemeColors} from '../../theme';
import {Trip, TripFilter} from '../../types';

function formatTripDate(date: string) {
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatCapacity(registered: number, max: number) {
  return `${String(registered).padStart(2, '0')} / ${String(max).padStart(2, '0')}`;
}

export function TripsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useThemeColors();
  const {trips, filterTrips, isOffline, setOffline} = useApp();
  const [filter, setFilter] = useState<TripFilter>('all');
  const [query, setQuery] = useState('');
  const [date, setDate] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterTrips(filter, query, date),
    [filter, query, date, filterTrips],
  );

  const renderTrip = (trip: Trip) => (
    <Pressable
      key={trip.id}
      style={({pressed}) => [styles.listing, pressed && styles.listingPressed]}
      onPress={() => navigation.navigate('TripDetails', {tripId: trip.id})}
      accessibilityRole="button"
      accessibilityLabel={`${trip.title}. ${formatTripDate(trip.date)}. ${trip.destination}. ${trip.difficulty}. ${formatCapacity(trip.registeredCount, trip.maxParticipants)}`}>
      <View style={styles.media}>
        <RemoteImage uri={trip.coverImage} style={styles.image} />
        <View pointerEvents="none" style={styles.veil} />
        <View pointerEvents="none" style={styles.overlay}>
          <View style={styles.overlayTop}>
            <Text style={styles.difficulty}>{trip.difficulty}</Text>
            <Text style={styles.capacity}>
              {formatCapacity(trip.registeredCount, trip.maxParticipants)}
            </Text>
          </View>
          <Text style={styles.tripTitle} numberOfLines={2}>
            {trip.title}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {formatTripDate(trip.date)}
            {'  ·  '}
            {trip.time}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {trip.destination}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <Screen scroll padded={false} edges={['top']}>
      <AppHeader />
      <View style={styles.content}>
        <FilterChips value={filter} onChange={setFilter} />

        <View
          style={[
            styles.search,
            {
              borderColor: theme.border,
              backgroundColor: theme.surface,
            },
          ]}>
          <Icon name="search" size={16} color={theme.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search destination, organizer, difficulty"
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, {color: theme.text}]}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10}>
              <Icon name="close" size={14} color={theme.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <DateFilter trips={trips} value={date} onChange={setDate} />

        {isOffline ? (
          <OfflineState
            title="No internet"
            actionLabel="Retry"
            onAction={() => setOffline(false)}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              filter === 'joined' ? 'No joined trips' : 'No adventures found'
            }
            message={
              filter === 'joined'
                ? 'Join an expedition from All Trips to see it here.'
                : 'Try another search or clear the date filter.'
            }
            actionLabel="Reset"
            onAction={() => {
              setFilter('all');
              setQuery('');
              setDate(null);
            }}
          />
        ) : (
          <View style={styles.list}>
            <Text style={[styles.count, {color: theme.textMuted}]}>
              {filtered.length}{' '}
              {filtered.length === 1 ? 'expedition' : 'expeditions'}
            </Text>
            <View style={styles.bleed}>{filtered.map(renderTrip)}</View>
          </View>
        )}
        <View style={{height: 110}} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    letterSpacing: 0.2,
    paddingVertical: spacing.sm,
  },
  list: {
    marginTop: spacing.sm,
  },
  count: {
    ...typography.label,
    marginBottom: spacing.md,
  },
  bleed: {
    marginHorizontal: -spacing.lg,
    gap: spacing.sm,
  },
  listing: {
    height: 380,
    backgroundColor: colors.black,
  },
  listingPressed: {
    opacity: 0.94,
  },
  media: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.black,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  veil: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '58%',
    backgroundColor: 'rgba(17,17,16,0.72)',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xl,
  },
  overlayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  difficulty: {
    ...typography.label,
    color: colors.greige,
    letterSpacing: 2.4,
  },
  capacity: {
    ...typography.label,
    color: colors.ivory,
    letterSpacing: 1.6,
  },
  tripTitle: {
    ...typography.title,
    color: colors.ivory,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '300',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  meta: {
    ...typography.caption,
    color: colors.cream,
    letterSpacing: 0.4,
    marginTop: 3,
  },
});
