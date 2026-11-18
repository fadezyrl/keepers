import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {CompositeNavigationProp, useNavigation, useRoute} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  AdventureCarousel,
  AppHeader,
  EmptyState,
  HeroCarousel,
  LoadingState,
  RemoteImage,
  Screen,
  SectionHeader,
} from '../../components';
import {fetchTrips} from '../../api/keepersApi';
import {
  TRIP_CATEGORIES,
  TRIP_CATEGORY_VISUAL,
  TripCategory,
} from '../../constants/tripCategories';
import {useApp} from '../../context/AppContext';
import {
  MainTabParamList,
  RootStackParamList,
} from '../../navigation/types';
import {colors, spacing, typography, useThemeColors} from '../../theme';
import {HeroSlide, Trip} from '../../types';
import {
  formatTripCardDate,
  isUpcomingDiscoverable,
} from '../../utils/tripPresentation';

type HomeNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Discover'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type DiscoverRoute = RouteProp<MainTabParamList, 'Discover'>;

const TAB_BAR_HEIGHT = 64;
const TAB_BAR_MIN_OFFSET = 10;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const route = useRoute<DiscoverRoute>();
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const {trips, heroSlides} = useApp();

  const initialCategory = (route.params?.category as TripCategory | undefined) || null;
  const [activeCategory, setActiveCategory] = useState<TripCategory | null>(
    initialCategory,
  );
  const [filteredTrips, setFilteredTrips] = useState<Trip[] | null>(null);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);

  useEffect(() => {
    if (route.params?.category) {
      setActiveCategory(route.params.category as TripCategory);
    }
  }, [route.params?.category]);

  const loadCategory = useCallback(async (category: TripCategory | null) => {
    if (!category) {
      setFilteredTrips(null);
      setFilterError(null);
      return;
    }
    setFilterLoading(true);
    setFilterError(null);
    try {
      const items = await fetchTrips({category});
      setFilteredTrips(items);
    } catch (err) {
      setFilterError(
        err instanceof Error ? err.message : 'Unable to filter drives.',
      );
      setFilteredTrips([]);
    } finally {
      setFilterLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategory(activeCategory);
  }, [activeCategory, loadCategory]);

  const upcoming = useMemo(() => {
    const source = activeCategory ? filteredTrips || [] : trips;
    return source.filter(isUpcomingDiscoverable);
  }, [activeCategory, filteredTrips, trips]);

  const featured = upcoming[0] || null;
  const rest = featured ? upcoming.slice(1) : upcoming;

  const onSlidePress = (slide: HeroSlide) => {
    if (slide.tripId) {
      navigation.navigate('TripDetails', {tripId: slide.tripId});
    }
  };

  const tabClearance =
    TAB_BAR_HEIGHT + Math.max(insets.bottom, TAB_BAR_MIN_OFFSET) + spacing.md;

  return (
    <Screen scroll padded={false} edges={['top']}>
      <AppHeader />

      <View style={styles.introPad}>
        <Text style={[styles.kicker, {color: theme.textMuted}]}>
          Keepers Adventures
        </Text>
        <Text style={[styles.headline, {color: theme.text}]}>Discover</Text>
        <Text style={[styles.lead, {color: theme.textMuted}]}>
          Explore desert, camping, mountain drives and club trips — then join
          the ones that fit your season.
        </Text>
      </View>

      {!activeCategory ? (
        <HeroCarousel slides={heroSlides} onPressSlide={onSlidePress} />
      ) : null}

      <View style={styles.sectionPad}>
        <SectionHeader title="Drive categories" />
        <View style={styles.categoryRail}>
          {TRIP_CATEGORIES.map(category => {
            const visual = TRIP_CATEGORY_VISUAL[category];
            const active = activeCategory === category;
            return (
              <Pressable
                key={category}
                onPress={() =>
                  setActiveCategory(prev => (prev === category ? null : category))
                }
                style={({pressed}) => [
                  styles.categoryChip,
                  {
                    borderColor: active ? colors.black : theme.border,
                    backgroundColor: active ? colors.black : theme.surface,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}>
                <Text
                  style={[
                    styles.categoryEyebrow,
                    {color: active ? colors.stone : theme.textMuted},
                  ]}>
                  {visual.eyebrow}
                </Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    {color: active ? colors.ivory : theme.text},
                  ]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {activeCategory ? (
          <Pressable onPress={() => setActiveCategory(null)}>
            <Text style={[styles.clearFilter, {color: theme.textMuted}]}>
              Clear category filter
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.sectionPad}>
        <SectionHeader
          title={activeCategory || 'Upcoming drives'}
          actionLabel="Calendar & my drives"
          onAction={() => navigation.navigate('Trips')}
        />
      </View>

      {filterLoading ? (
        <LoadingState label="Loading drives…" />
      ) : filterError ? (
        <View style={styles.sectionPad}>
          <EmptyState
            title="Could not load category"
            message={filterError}
            actionLabel="Retry"
            onAction={() => void loadCategory(activeCategory)}
          />
        </View>
      ) : featured ? (
        <Pressable
          onPress={() =>
            navigation.navigate('TripDetails', {tripId: featured.id})
          }
          style={({pressed}) => [
            styles.featured,
            pressed && {opacity: 0.92},
          ]}>
          <RemoteImage uri={featured.coverImage} style={StyleSheet.absoluteFill} />
          <View style={styles.featuredVeil} />
          <View style={styles.featuredCopy}>
            <Text style={styles.featuredCategory}>
              {featured.category || activeCategory || 'Drive'}
            </Text>
            <Text style={styles.featuredTitle}>{featured.title}</Text>
            <Text style={styles.featuredMeta}>
              {formatTripCardDate(featured.date, featured.time)}
              {'  ·  '}
              {featured.destination}
            </Text>
          </View>
        </Pressable>
      ) : (
        <View style={styles.sectionPad}>
          <EmptyState
            title="No upcoming drives"
            message={
              activeCategory
                ? `No published ${activeCategory} right now.`
                : 'New adventures will appear here when published.'
            }
            actionLabel={activeCategory ? 'Show all' : undefined}
            onAction={
              activeCategory ? () => setActiveCategory(null) : undefined
            }
          />
        </View>
      )}

      {rest.length > 0 ? (
        <AdventureCarousel
          trips={rest}
          onPressTrip={tripId =>
            navigation.navigate('TripDetails', {tripId})
          }
        />
      ) : null}

      <View style={{height: tabClearance}} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  introPad: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  kicker: {
    ...typography.label,
    letterSpacing: 2.2,
  },
  headline: {
    ...typography.hero,
    fontSize: 34,
    marginTop: spacing.xs,
  },
  lead: {
    ...typography.subtitle,
    marginTop: spacing.sm,
    maxWidth: 340,
  },
  sectionPad: {
    paddingHorizontal: spacing.lg,
  },
  categoryRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryChip: {
    width: '48%',
    flexGrow: 1,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 72,
    justifyContent: 'flex-end',
  },
  categoryEyebrow: {
    ...typography.caption,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  categoryLabel: {
    ...typography.title,
    fontSize: 15,
  },
  clearFilter: {
    ...typography.caption,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  featured: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    height: 280,
    overflow: 'hidden',
    backgroundColor: colors.black,
  },
  featuredVeil: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17,17,16,0.42)',
  },
  featuredCopy: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
  },
  featuredCategory: {
    color: colors.greige,
    ...typography.label,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  featuredTitle: {
    color: colors.ivory,
    ...typography.hero,
    fontSize: 28,
  },
  featuredMeta: {
    color: colors.cream,
    ...typography.subtitle,
    marginTop: spacing.xs,
  },
});
