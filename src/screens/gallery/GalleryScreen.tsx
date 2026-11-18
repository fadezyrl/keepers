import React, {useMemo} from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  AppHeader,
  EmptyState,
  RemoteImage,
  Screen,
} from '../../components';
import {useApp} from '../../context/AppContext';
import {
  MainTabParamList,
  RootStackParamList,
} from '../../navigation/types';
import {colors, spacing, typography, useThemeColors} from '../../theme';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Gallery'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const TAB_BAR_HEIGHT = 64;
const TAB_BAR_MIN_OFFSET = 10;
const COLS = 2;
const GAP = spacing.sm;
const TILE =
  (Dimensions.get('window').width - spacing.lg * 2 - GAP * (COLS - 1)) / COLS;

export function GalleryScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const {gallery, trips} = useApp();

  const tripPhotos = useMemo(() => {
    const urls: {id: string; image: string; caption: string}[] = [];
    for (const trip of trips) {
      for (const uri of trip.gallery || []) {
        if (!uri) continue;
        urls.push({
          id: `${trip.id}-${uri}`,
          image: uri,
          caption: trip.title,
        });
      }
    }
    return urls;
  }, [trips]);

  const items = useMemo(() => {
    const club = (gallery || []).map(g => ({
      id: g.id,
      image: g.image,
      caption: g.caption || 'Keepers gallery',
    }));
    const seen = new Set(club.map(c => c.image));
    const merged = [...club];
    for (const photo of tripPhotos) {
      if (seen.has(photo.image)) continue;
      seen.add(photo.image);
      merged.push(photo);
    }
    return merged;
  }, [gallery, tripPhotos]);

  const images = items.map(i => i.image);
  const tabClearance =
    TAB_BAR_HEIGHT + Math.max(insets.bottom, TAB_BAR_MIN_OFFSET) + spacing.md;

  return (
    <Screen scroll padded={false} edges={['top']}>
      <AppHeader />
      <View style={[styles.pad, {paddingBottom: tabClearance}]}>
        <Text style={[styles.kicker, {color: theme.textMuted}]}>Media</Text>
        <Text style={[styles.title, {color: theme.text}]}>Gallery</Text>
        <Text style={[styles.sub, {color: theme.textMuted}]}>
          Authorised club photography and trip memories from Keepers Adventures.
        </Text>

        {items.length === 0 ? (
          <EmptyState
            title="No media yet"
            message="Trip photos and club gallery items will appear here when available."
          />
        ) : (
          <View style={styles.grid}>
            {items.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() =>
                  navigation.navigate('GalleryViewer', {images, index})
                }
                style={({pressed}) => [
                  styles.tile,
                  pressed && {opacity: 0.88},
                ]}>
                <RemoteImage uri={item.image} style={styles.image} />
                <View style={styles.captionVeil} />
                <Text style={styles.caption} numberOfLines={2}>
                  {item.caption}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  kicker: {
    ...typography.label,
    letterSpacing: 2,
  },
  title: {
    ...typography.hero,
    fontSize: 30,
    marginTop: spacing.xs,
  },
  sub: {
    ...typography.subtitle,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  tile: {
    width: TILE,
    height: TILE * 1.25,
    overflow: 'hidden',
    backgroundColor: colors.black,
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  captionVeil: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    borderBottomWidth: 72,
    borderBottomColor: 'rgba(17,17,16,0.55)',
  },
  caption: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
    color: colors.ivory,
    ...typography.caption,
    letterSpacing: 0.4,
  },
});
