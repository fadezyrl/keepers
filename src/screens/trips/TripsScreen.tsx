import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {
  AdventureCalendar,
  BackHeader,
  CapacityRing,
  EmptyState,
  FilterChips,
  Icon,
  OfflineState,
  RemoteImage,
  Screen,
} from '../../components';
import type {ScreenScrollHandle} from '../../components';
import {useApp} from '../../context/AppContext';
import {
  useCachedCalendar,
  useCachedMyTripHistory,
  useCachedTripsList,
  usePrefetchCalendarMonth,
} from '../../hooks/useCachedQueries';
import {RootStackParamList} from '../../navigation/types';
import {colors, spacing, typography, useThemeColors} from '../../theme';
import {MemberTripHistoryItem, Trip, TripsTab} from '../../types';
import {
  addMonths,
  civilFromDate,
  monthRangeYmd,
  todayYmd,
  tripDateKey,
} from '../../utils/calendarDates';
import {
  canJoinTrip,
  discoveryStatus,
  discoveryStatusLabel,
  formatCapacity,
  formatSpotsLeft,
  formatTripCardDate,
  formatTripDate,
  isMyTripCompletedAdventure,
  isMyTripOtherHistory,
  isMyTripUpcoming,
  isUpcomingDiscoverable,
  myTripStatusLabel,
} from '../../utils/tripPresentation';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type TripsRoute = RouteProp<RootStackParamList, 'Trips'>;

function organizerLabel(trip: Trip): string {
  const name = trip.organizer?.name?.trim();
  if (!name) return '';
  const role = (trip.organizer?.role || 'Marshall').trim();
  return `${role} · ${name}`;
}

function TripCard({
  trip,
  onPress,
  past,
}: {
  trip: Trip;
  onPress: () => void;
  past?: boolean;
}) {
  const status = discoveryStatus(trip);
  const statusText = discoveryStatusLabel(status);
  const joinable = !past && canJoinTrip(trip);
  const when = formatTripCardDate(trip.date, trip.time);
  const location =
    trip.destination?.trim() ||
    trip.location?.label?.trim() ||
    trip.meetingPoint?.trim() ||
    '';
  const createdBy = organizerLabel(trip);
  const level = trip.category || trip.requiredMembership || trip.difficulty || '';

  return (
    <Pressable
      style={({pressed}) => [styles.listing, pressed && styles.listingPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${trip.title}. ${when}. ${location}. ${statusText}. ${formatCapacity(trip)}, ${formatSpotsLeft(trip)}.`}>
      <View style={styles.media}>
        <RemoteImage uri={trip.coverImage} style={styles.image} />
        <View pointerEvents="none" style={styles.veil} />
        <View pointerEvents="none" style={styles.overlay}>
          <View style={styles.overlayTop}>
            <Text style={styles.statusBadge}>{statusText}</Text>
            <CapacityRing
              registered={trip.registeredCount || 0}
              max={trip.maxParticipants || 0}
              size={52}
              tone="dark"
              labelMode="fraction"
            />
          </View>
          <Text style={styles.tripTitle} numberOfLines={2}>
            {trip.title}
          </Text>
          {createdBy ? (
            <Text style={styles.meta} numberOfLines={1}>
              {createdBy}
            </Text>
          ) : null}
          {level ? (
            <Text style={styles.meta} numberOfLines={1}>
              {trip.category ? level : `Level · ${level}`}
            </Text>
          ) : null}
          <Text style={styles.meta} numberOfLines={1}>
            {when}
          </Text>
          {location ? (
            <Text style={styles.meta} numberOfLines={1}>
              {location}
            </Text>
          ) : null}
          <Text style={styles.ctaHint}>
            {past ? 'View memories' : joinable ? 'View details · Join' : 'View details'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function HistoryCard({
  item,
  onPress,
}: {
  item: MemberTripHistoryItem;
  onPress: () => void;
}) {
  const theme = useThemeColors();
  const label = myTripStatusLabel(item);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${label}.`}
      style={({pressed}) => [
        styles.historyCard,
        {
          borderColor: theme.border,
          backgroundColor: theme.surface,
          opacity: pressed ? 0.92 : 1,
        },
      ]}>
      {item.coverImage ? (
        <RemoteImage uri={item.coverImage} style={styles.historyCover} />
      ) : (
        <View style={[styles.historyCover, {backgroundColor: theme.bgMuted}]} />
      )}
      <View style={styles.historyBody}>
        <Text style={[styles.historyStatus, {color: theme.textMuted}]}>{label}</Text>
        <Text style={[styles.historyTitle, {color: theme.text}]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.historyMeta, {color: theme.textMuted}]} numberOfLines={1}>
          {formatTripDate(item.date, item.time)}
          {item.destination ? ` · ${item.destination}` : ''}
        </Text>
        {item.rating?.overall != null ? (
          <Text style={[styles.historyMeta, {color: theme.text}]}>
            Rated {item.rating.overall.toFixed(1)}
          </Text>
        ) : isMyTripCompletedAdventure(item) ? (
          <Text style={[styles.historyMeta, {color: theme.textMuted}]}>
            Not rated yet
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function normalizeTripsTab(tab?: string | null): TripsTab {
  if (tab === 'calendar' || tab === 'mine' || tab === 'upcoming') return tab;
  // Legacy deep links used "past" — calendar covers previous months.
  if (tab === 'past') return 'calendar';
  return 'upcoming';
}

export function TripsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<TripsRoute>();
  const theme = useThemeColors();
  const {isOffline, setOffline, upsertLocalTrip, hasRole} = useApp();
  const [tab, setTab] = useState<TripsTab>(
    normalizeTripsTab(route.params?.tab),
  );
  const [query, setQuery] = useState('');
  const today = todayYmd();
  const initialCivil = civilFromDate(new Date());
  const [calYear, setCalYear] = useState(initialCivil.year);
  const [calMonth, setCalMonth] = useState(initialCivil.month);
  const [selectedDate, setSelectedDate] = useState(today);
  const scrollHandleRef = useRef<ScreenScrollHandle | null>(null);
  const prefetchMonth = usePrefetchCalendarMonth();

  useEffect(() => {
    if (route.params?.tab) {
      setTab(normalizeTripsTab(route.params.tab));
    }
  }, [route.params?.tab]);

  const showManageDrives =
    hasRole('marshall') ||
    hasRole('pre_marshall') ||
    hasRole('admin') ||
    hasRole('super_admin');

  const listQuery = useCachedTripsList('all', tab === 'upcoming');
  const historyQuery = useCachedMyTripHistory('all');
  const monthBounds = useMemo(
    () => monthRangeYmd(calYear, calMonth),
    [calYear, calMonth],
  );
  const calendarQuery = useCachedCalendar(
    monthBounds.from,
    monthBounds.to,
    tab === 'calendar',
  );

  const trips = listQuery.data || [];
  const loadingList = listQuery.isLoading && !listQuery.data;
  const calendarTrips = calendarQuery.data || [];

  useEffect(() => {
    if (listQuery.isSuccess) {
      setOffline(false);
      (listQuery.data || []).forEach(upsertLocalTrip);
    }
    if (listQuery.isError && tab === 'upcoming') {
      setOffline(true);
    }
  }, [
    listQuery.data,
    listQuery.isError,
    listQuery.isSuccess,
    setOffline,
    tab,
    upsertLocalTrip,
  ]);

  useEffect(() => {
    if (calendarQuery.isSuccess) {
      setOffline(false);
      (calendarQuery.data || []).forEach(upsertLocalTrip);
    }
    if (calendarQuery.isError && tab === 'calendar' && !calendarQuery.data) {
      setOffline(true);
    }
  }, [
    calendarQuery.data,
    calendarQuery.isError,
    calendarQuery.isSuccess,
    setOffline,
    tab,
    upsertLocalTrip,
  ]);

  useEffect(() => {
    if (tab !== 'calendar') return;
    const prev = addMonths(calYear, calMonth, -1);
    const next = addMonths(calYear, calMonth, 1);
    const prevRange = monthRangeYmd(prev.year, prev.month);
    const nextRange = monthRangeYmd(next.year, next.month);
    prefetchMonth(prevRange.from, prevRange.to);
    prefetchMonth(nextRange.from, nextRange.to);
  }, [tab, calYear, calMonth, prefetchMonth]);

  const q = query.trim().toLowerCase();

  const upcomingTrips = useMemo(() => {
    return trips
      .filter(isUpcomingDiscoverable)
      .filter(trip => {
        if (!q) return true;
        return (
          trip.title.toLowerCase().includes(q) ||
          trip.destination.toLowerCase().includes(q) ||
          trip.organizer.name.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }, [trips, q]);

  const tripsByDate = useMemo(() => {
    const map: Record<string, Trip[]> = {};
    for (const trip of calendarTrips) {
      const key = tripDateKey(trip.date);
      if (!map[key]) map[key] = [];
      map[key].push(trip);
    }
    return map;
  }, [calendarTrips]);

  const historyItems = useMemo(
    () => historyQuery.data?.pages.flatMap(page => page.items) || [],
    [historyQuery.data],
  );

  const filteredHistory = useMemo(() => {
    if (!q) return historyItems;
    return historyItems.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        (item.destination || '').toLowerCase().includes(q) ||
        (item.organizerName || '').toLowerCase().includes(q),
    );
  }, [historyItems, q]);

  const myUpcoming = useMemo(
    () => filteredHistory.filter(isMyTripUpcoming),
    [filteredHistory],
  );
  const myCompleted = useMemo(
    () => filteredHistory.filter(isMyTripCompletedAdventure),
    [filteredHistory],
  );
  const myOther = useMemo(
    () => filteredHistory.filter(isMyTripOtherHistory),
    [filteredHistory],
  );

  const onRefresh = async () => {
    if (tab === 'mine') {
      await historyQuery.refetch();
    } else if (tab === 'calendar') {
      await calendarQuery.refetch();
    } else {
      await listQuery.refetch();
    }
  };

  const clearFilters = () => {
    setQuery('');
    setTab('upcoming');
  };

  const onChangeMonth = (year: number, month: number) => {
    setCalYear(year);
    setCalMonth(month);
    // Keep selection inside the visible month when jumping months.
    const bounds = monthRangeYmd(year, month);
    if (selectedDate < bounds.from || selectedDate > bounds.to) {
      const today = todayYmd();
      if (today >= bounds.from && today <= bounds.to) {
        setSelectedDate(today);
      } else {
        setSelectedDate(bounds.from);
      }
    }
  };

  const openTrip = (tripId: string) => {
    navigation.navigate('TripDetails', {tripId});
  };

  const openHistoryItem = (item: MemberTripHistoryItem) => {
    if (isMyTripUpcoming(item)) {
      navigation.navigate('TripDetails', {tripId: item.tripId});
      return;
    }
    navigation.navigate('MyTripPerformance', {tripId: item.tripId});
  };

  const renderDiscoverList = (items: Trip[]) => {
    if (isOffline && !trips.length) {
      return (
        <OfflineState title="No internet" actionLabel="Retry" onAction={onRefresh} />
      );
    }
    if (items.length === 0 && !loadingList) {
      return (
        <EmptyState
          title="No upcoming adventures right now"
          message="Check back soon for the next Keepers drive."
          actionLabel={query ? 'Clear search' : undefined}
          onAction={query ? () => setQuery('') : undefined}
        />
      );
    }
    return (
      <View style={styles.list}>
        <Text style={[styles.count, {color: theme.textMuted}]}>
          {items.length} {items.length === 1 ? 'adventure' : 'adventures'}
        </Text>
        <View style={styles.bleed}>
          {items.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              onPress={() => openTrip(trip.id)}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderCalendar = () => {
    if (isOffline && calendarTrips.length === 0 && !calendarQuery.isFetching) {
      return (
        <OfflineState title="No internet" actionLabel="Retry" onAction={onRefresh} />
      );
    }
    return (
      <AdventureCalendar
        year={calYear}
        month={calMonth}
        selectedDate={selectedDate}
        tripsByDate={tripsByDate}
        loading={calendarQuery.isLoading && calendarTrips.length === 0}
        refreshing={calendarQuery.isFetching && calendarTrips.length > 0}
        error={
          calendarQuery.isError && calendarTrips.length === 0
            ? 'Check your connection and try again.'
            : null
        }
        scrollHandleRef={scrollHandleRef}
        onSelectDate={setSelectedDate}
        onChangeMonth={onChangeMonth}
        onOpenTrip={openTrip}
        onBrowseUpcoming={() => setTab('upcoming')}
        onRetry={() => {
          void calendarQuery.refetch();
        }}
      />
    );
  };

  const renderMyTrips = () => {
    const loading = historyQuery.isLoading && historyItems.length === 0;
    if (loading) {
      return (
        <ActivityIndicator
          style={{marginTop: spacing.xl}}
          color={theme.text}
        />
      );
    }
    if (historyQuery.isError && historyItems.length === 0) {
      return (
        <EmptyState
          title="Could not load your trips"
          message="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => {
            void historyQuery.refetch();
          }}
        />
      );
    }
    if (filteredHistory.length === 0) {
      return (
        <EmptyState
          title="You haven't joined any adventures yet"
          message="Explore upcoming drives and join your first Keepers adventure."
          actionLabel="Browse upcoming"
          onAction={() => setTab('upcoming')}
        />
      );
    }

    return (
      <View style={styles.myWrap}>
        {myUpcoming.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.text}]}>
              Upcoming joined
            </Text>
            {myUpcoming.map(item => (
              <HistoryCard
                key={`up-${item.tripId}`}
                item={item}
                onPress={() => openHistoryItem(item)}
              />
            ))}
          </View>
        ) : null}

        {myCompleted.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.text}]}>
              Completed adventures
            </Text>
            <Text style={[styles.sectionHint, {color: theme.textMuted}]}>
              Drives you attended. Absent marks stay in history below.
            </Text>
            {myCompleted.map(item => (
              <HistoryCard
                key={`done-${item.tripId}`}
                item={item}
                onPress={() => openHistoryItem(item)}
              />
            ))}
          </View>
        ) : null}

        {myOther.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, {color: theme.text}]}>
              Cancelled & other
            </Text>
            <Text style={[styles.sectionHint, {color: theme.textMuted}]}>
              Cancelled, absent, and other registration history.
            </Text>
            {myOther.map(item => (
              <HistoryCard
                key={`other-${item.tripId}`}
                item={item}
                onPress={() => openHistoryItem(item)}
              />
            ))}
          </View>
        ) : null}

        {historyQuery.hasNextPage ? (
          <Pressable
            onPress={() => {
              if (!historyQuery.isFetchingNextPage) {
                void historyQuery.fetchNextPage();
              }
            }}
            style={styles.loadMore}>
            {historyQuery.isFetchingNextPage ? (
              <ActivityIndicator color={theme.text} />
            ) : (
              <Text style={[styles.loadMoreText, {color: theme.text}]}>
                Load more history
              </Text>
            )}
          </Pressable>
        ) : null}
      </View>
    );
  };

  return (
    <Screen
      scroll
      padded={false}
      edges={['top']}
      onRefresh={onRefresh}
      scrollHandleRef={scrollHandleRef}>
      <BackHeader onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={[styles.pageTitle, {color: theme.text}]}>Adventures</Text>
        <Text style={[styles.pageSub, {color: theme.textMuted}]}>
          {tab === 'calendar'
            ? 'Club schedule — see what’s happening on any day.'
            : tab === 'mine'
              ? 'Track the adventures you’ve joined.'
              : 'Discover upcoming Keepers drives.'}
        </Text>

        <FilterChips value={tab} onChange={setTab} />

        {tab !== 'calendar' ? (
          <View
            style={[
              styles.search,
              {borderColor: theme.border, backgroundColor: theme.surface},
            ]}>
            <Icon name="search" size={16} color={theme.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name or destination"
              placeholderTextColor={theme.textMuted}
              style={[styles.searchInput, {color: theme.text}]}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {query.length > 0 ? (
              <Pressable
                onPress={() => setQuery('')}
                hitSlop={10}
                accessibilityLabel="Clear search">
                <Icon name="close" size={14} color={theme.textMuted} />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {tab !== 'calendar' && (query || tab !== 'upcoming') ? (
          <Pressable onPress={clearFilters} hitSlop={8} style={styles.clearRow}>
            <Text style={[styles.clearText, {color: theme.textMuted}]}>
              Clear filters
            </Text>
          </Pressable>
        ) : null}

        {showManageDrives ? (
          <Pressable
            onPress={() => navigation.navigate('MarshallHub')}
            style={[styles.manageRow, {borderColor: theme.border}]}>
            <View style={{flex: 1}}>
              <Text style={[styles.manageTitle, {color: theme.text}]}>
                Manage My Drives
              </Text>
              <Text style={[styles.manageHint, {color: theme.textMuted}]}>
                {hasRole('pre_marshall') && !hasRole('marshall')
                  ? 'View assigned drives'
                  : 'Create and manage your club drives'}
              </Text>
            </View>
            <Icon name="chevron-right" size={16} color={theme.textMuted} />
          </Pressable>
        ) : null}

        {tab === 'upcoming' ? renderDiscoverList(upcomingTrips) : null}
        {tab === 'calendar' ? renderCalendar() : null}
        {tab === 'mine' ? renderMyTrips() : null}

        <View style={{height: 110}} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
  },
  pageTitle: {
    ...typography.hero,
    fontSize: 28,
    marginBottom: 4,
  },
  pageSub: {
    ...typography.subtitle,
    marginBottom: spacing.md,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    letterSpacing: 0.2,
    paddingVertical: spacing.sm,
  },
  clearRow: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  clearText: {
    ...typography.label,
    letterSpacing: 1.2,
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  manageTitle: {
    ...typography.label,
    letterSpacing: 1.4,
  },
  manageHint: {
    ...typography.caption,
    marginTop: 4,
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
    backgroundColor: colors.black,
  },
  listingPressed: {
    opacity: 0.92,
  },
  media: {
    height: 268,
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  veil: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17,17,16,0.38)',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  overlayTop: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  statusBadge: {
    ...typography.label,
    color: colors.ivory,
    letterSpacing: 1.6,
    fontSize: 10,
  },
  tripTitle: {
    ...typography.title,
    color: colors.ivory,
    fontSize: 22,
  },
  meta: {
    ...typography.caption,
    color: colors.greige,
    marginTop: 4,
  },
  ctaHint: {
    ...typography.label,
    color: colors.ivory,
    marginTop: spacing.sm,
    letterSpacing: 1.4,
    fontSize: 10,
  },
  myWrap: {
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
  },
  sectionHint: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  historyCard: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  historyCover: {
    width: '100%',
    height: 132,
  },
  historyBody: {
    padding: spacing.md,
  },
  historyStatus: {
    ...typography.label,
    letterSpacing: 1.4,
    fontSize: 10,
    marginBottom: 4,
  },
  historyTitle: {
    ...typography.title,
    fontSize: 17,
  },
  historyMeta: {
    ...typography.caption,
    marginTop: 4,
  },
  loadMore: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  loadMoreText: {
    ...typography.label,
    letterSpacing: 1.4,
  },
});
