import React, {
  useEffect,
  useMemo,
  useRef,
  type ElementRef,
  type RefObject,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {colors, spacing, typography, useThemeColors} from '../theme';
import {Trip} from '../types';
import {
  CALENDAR_LEGEND,
  CalendarDotKind,
  dotsForTrips,
  sortCalendarDayTrips,
} from '../utils/calendarIndicators';
import {
  addMonths,
  buildMonthGrid,
  formatTripTime,
  monthLabel,
  parseYmd,
  sameYmd,
  todayYmd,
} from '../utils/calendarDates';
import {
  discoveryStatus,
  discoveryStatusLabel,
  formatCapacity,
  formatSpotsLeft,
  formatTripDate,
} from '../utils/tripPresentation';
import {RemoteImage} from './RemoteImage';
import {Button} from './Button';
import type {ScreenScrollHandle} from './Screen';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const DOT_COLORS: Record<CalendarDotKind, string> = {
  upcoming: '#111110',
  joined: '#3D5A45',
  completed: '#A9A49B',
  cancelled: '#8B3A2F',
};

export function AdventureCalendar({
  year,
  month,
  selectedDate,
  tripsByDate,
  loading,
  refreshing,
  error,
  scrollHandleRef,
  onSelectDate,
  onChangeMonth,
  onOpenTrip,
  onBrowseUpcoming,
  onRetry,
}: {
  year: number;
  month: number;
  selectedDate: string;
  tripsByDate: Record<string, Trip[]>;
  loading?: boolean;
  refreshing?: boolean;
  error?: string | null;
  scrollHandleRef?: RefObject<ScreenScrollHandle | null>;
  onSelectDate: (ymd: string) => void;
  onChangeMonth: (year: number, month: number) => void;
  onOpenTrip: (tripId: string) => void;
  onBrowseUpcoming: () => void;
  onRetry?: () => void;
}) {
  const theme = useThemeColors();
  const today = todayYmd();
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const dayTrips = sortCalendarDayTrips(tripsByDate[selectedDate] || []);
  const scheduleRef = useRef<ElementRef<typeof View> | null>(null);
  const pendingScroll = useRef(false);

  const scrollScheduleIntoView = () => {
    const handle = scrollHandleRef?.current;
    const node = scheduleRef.current;
    if (!handle || !node) return;
    handle.scrollChildIntoView(cb => {
      node.measureInWindow(cb);
    }, spacing.sm);
  };

  useEffect(() => {
    if (!pendingScroll.current) return;
    if (loading) return; // wait until month data settles
    pendingScroll.current = false;
    if (dayTrips.length === 0) return;
    const t = setTimeout(() => scrollScheduleIntoView(), 80);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, dayTrips.length, loading]);

  const goMonth = (delta: number) => {
    const next = addMonths(year, month, delta);
    onChangeMonth(next.year, next.month);
  };

  const goToday = () => {
    const t = todayYmd();
    const [y, m] = t.split('-').map(Number);
    onChangeMonth(y, m);
    pendingScroll.current = true;
    onSelectDate(t);
  };

  const selectDate = (ymd: string) => {
    pendingScroll.current = true;
    onSelectDate(ymd);
  };

  const dateHeading = sameYmd(selectedDate, today)
    ? 'Today'
    : parseYmd(selectedDate)
      ? formatTripDate(selectedDate)
      : selectedDate;

  return (
    <View>
      <View style={styles.monthHeader}>
        <Pressable
          onPress={() => goMonth(-1)}
          hitSlop={12}
          accessibilityLabel="Previous month"
          style={styles.navBtn}>
          <Text style={[styles.navGlyph, {color: theme.text}]}>‹</Text>
        </Pressable>
        <View style={styles.monthCenter}>
          <Text style={[styles.monthTitle, {color: theme.text}]}>
            {monthLabel(year, month)}
          </Text>
          {refreshing && !loading ? (
            <ActivityIndicator size="small" color={theme.textMuted} />
          ) : null}
        </View>
        <Pressable
          onPress={() => goMonth(1)}
          hitSlop={12}
          accessibilityLabel="Next month"
          style={styles.navBtn}>
          <Text style={[styles.navGlyph, {color: theme.text}]}>›</Text>
        </Pressable>
      </View>

      <Pressable onPress={goToday} hitSlop={8} style={styles.todayLink}>
        <Text style={[styles.todayLinkText, {color: theme.textMuted}]}>
          Today
        </Text>
      </Pressable>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((d, i) => (
          <Text
            key={`${d}-${i}`}
            style={[styles.weekday, {color: theme.textMuted}]}>
            {d}
          </Text>
        ))}
      </View>

      <View
        style={[
          styles.grid,
          {borderColor: theme.border, backgroundColor: theme.surface},
        ]}>
        {cells.map((ymd, index) => {
          if (!ymd) {
            return <View key={`empty-${index}`} style={styles.cell} />;
          }
          const dayNum = Number(ymd.slice(-2));
          const isToday = sameYmd(ymd, today);
          const isSelected = sameYmd(ymd, selectedDate);
          const dots = dotsForTrips(tripsByDate[ymd] || []);

          return (
            <Pressable
              key={ymd}
              onPress={() => selectDate(ymd)}
              accessibilityRole="button"
              accessibilityState={{selected: isSelected}}
              accessibilityLabel={`${ymd}${dots.length ? `, ${dots.length} adventures` : ''}`}
              style={[
                styles.cell,
                isSelected && {backgroundColor: colors.cream},
              ]}>
              <View
                style={[
                  styles.dayNumWrap,
                  isToday && {
                    borderColor: theme.text,
                    borderWidth: 1,
                  },
                ]}>
                <Text
                  style={[
                    styles.dayNum,
                    {
                      color: theme.text,
                      fontWeight: isToday || isSelected ? '600' : '400',
                    },
                  ]}>
                  {dayNum}
                </Text>
              </View>
              <View style={styles.dotsRow}>
                {dots.slice(0, 3).map(kind => (
                  <View
                    key={`${ymd}-${kind}`}
                    style={[styles.dot, {backgroundColor: DOT_COLORS[kind]}]}
                  />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Day schedule sits directly under the grid — scroll brings it into view on select. */}
      <View
        ref={scheduleRef}
        collapsable={false}
        style={[
          styles.schedulePanel,
          {borderColor: theme.border, backgroundColor: theme.surface},
        ]}>
        <View style={styles.scheduleHeader}>
          <View style={{flex: 1}}>
            <Text style={[styles.scheduleKicker, {color: theme.textMuted}]}>
              On this day
            </Text>
            <Text style={[styles.scheduleTitle, {color: theme.text}]}>
              {dateHeading}
            </Text>
          </View>
          <Text style={[styles.scheduleCount, {color: theme.textMuted}]}>
            {dayTrips.length}{' '}
            {dayTrips.length === 1 ? 'adventure' : 'adventures'}
          </Text>
        </View>

        {loading && dayTrips.length === 0 ? (
          <ActivityIndicator
            style={{marginVertical: spacing.md}}
            color={theme.text}
          />
        ) : null}

        {error && dayTrips.length === 0 && !loading ? (
          <View style={styles.emptyBlock}>
            <Text style={[styles.emptyTitle, {color: theme.text}]}>
              Could not load calendar
            </Text>
            <Text style={[styles.emptyBody, {color: theme.textMuted}]}>
              {error}
            </Text>
            {onRetry ? (
              <Button
                label="Retry"
                variant="secondary"
                onPress={onRetry}
                style={{marginTop: spacing.md}}
              />
            ) : null}
          </View>
        ) : null}

        {!loading && !error && dayTrips.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={[styles.emptyTitle, {color: theme.text}]}>
              No adventures scheduled for this date.
            </Text>
            <Text style={[styles.emptyBody, {color: theme.textMuted}]}>
              Browse upcoming drives or pick another day.
            </Text>
            <Button
              label="View upcoming trips"
              variant="secondary"
              onPress={onBrowseUpcoming}
              style={{marginTop: spacing.md}}
            />
          </View>
        ) : null}

        <View style={styles.dayList}>
          {dayTrips.map(trip => {
            const status = discoveryStatus(trip);
            const statusText = discoveryStatusLabel(status);
            const timeLabel = formatTripTime(trip.time);
            return (
              <Pressable
                key={trip.id}
                onPress={() => onOpenTrip(trip.id)}
                style={({pressed}) => [
                  styles.dayCard,
                  {borderColor: theme.border, backgroundColor: theme.bg},
                  pressed && {opacity: 0.92},
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${trip.title}. ${statusText}.`}>
                <RemoteImage uri={trip.coverImage} style={styles.dayCover} />
                <View style={styles.dayBody}>
                  <Text style={[styles.dayStatus, {color: theme.textMuted}]}>
                    {statusText}
                  </Text>
                  <Text
                    style={[styles.dayTripTitle, {color: theme.text}]}
                    numberOfLines={2}>
                    {trip.title}
                  </Text>
                  <Text
                    style={[styles.dayMeta, {color: theme.textMuted}]}
                    numberOfLines={1}>
                    {trip.destination}
                    {timeLabel ? `  ·  ${timeLabel}` : ''}
                  </Text>
                  {trip.organizer?.name ? (
                    <Text
                      style={[styles.dayMeta, {color: theme.textMuted}]}
                      numberOfLines={1}>
                      Marshall · {trip.organizer.name}
                    </Text>
                  ) : null}
                  {status !== 'completed' && status !== 'cancelled' ? (
                    <Text style={[styles.dayMeta, {color: theme.textMuted}]}>
                      {formatCapacity(trip)} · {formatSpotsLeft(trip)}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.legend}>
        {CALENDAR_LEGEND.map(item => (
          <View key={item.kind} style={styles.legendItem}>
            <View style={[styles.dot, {backgroundColor: item.color}]} />
            <Text style={[styles.legendLabel, {color: theme.textMuted}]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navGlyph: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
  },
  monthCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  monthTitle: {
    ...typography.title,
    fontSize: 20,
  },
  todayLink: {
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  todayLinkText: {
    ...typography.label,
    letterSpacing: 1.4,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    ...typography.label,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: StyleSheet.hairlineWidth,
  },
  cell: {
    width: '14.2857%',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dayNumWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    minHeight: 6,
    marginTop: 2,
  },
  dot: {
    width: 5,
    height: 5,
  },
  schedulePanel: {
    marginTop: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  scheduleKicker: {
    ...typography.label,
    letterSpacing: 1.4,
    fontSize: 9,
    marginBottom: 4,
  },
  scheduleTitle: {
    ...typography.title,
    fontSize: 18,
  },
  scheduleCount: {
    ...typography.caption,
    marginBottom: 2,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendLabel: {
    ...typography.caption,
    fontSize: 11,
  },
  emptyBlock: {
    paddingBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  emptyTitle: {
    ...typography.title,
    fontSize: 16,
  },
  emptyBody: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  dayList: {
    gap: spacing.sm,
  },
  dayCard: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    minHeight: 96,
  },
  dayCover: {
    width: 96,
    alignSelf: 'stretch',
  },
  dayBody: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    gap: 2,
  },
  dayStatus: {
    ...typography.label,
    letterSpacing: 1.2,
    fontSize: 9,
  },
  dayTripTitle: {
    ...typography.title,
    fontSize: 16,
  },
  dayMeta: {
    ...typography.caption,
    fontSize: 12,
  },
});
