import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  AdventureCarousel,
  AppHeader,
  GalleryStrip,
  HeroCarousel,
  Screen,
  SectionHeader,
  SponsorsStrip,
} from '../../components';
import {useApp} from '../../context/AppContext';
import {
  MainTabParamList,
  RootStackParamList,
} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';
import {HeroSlide} from '../../types';

type HomeNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const theme = useThemeColors();
  const {trips, sponsors, heroSlides, gallery} = useApp();

  const upcoming = trips.filter(t => t.status !== 'completed');

  const onSlidePress = (slide: HeroSlide) => {
    if (slide.tripId) {
      navigation.navigate('TripDetails', {tripId: slide.tripId});
    }
  };

  const openGallery = (index: number) => {
    navigation.navigate('GalleryViewer', {
      images: gallery.map(item => item.image),
      index,
    });
  };

  return (
    <Screen scroll padded={false} edges={['top']}>
      <AppHeader />

      <HeroCarousel slides={heroSlides} onPressSlide={onSlidePress} />

      <View style={styles.sectionPad}>
        <SectionHeader
          title="Upcoming Adventures"
          actionLabel="See All"
          onAction={() => navigation.navigate('Trips')}
        />
      </View>
      <AdventureCarousel
        trips={upcoming}
        onPressTrip={tripId =>
          navigation.navigate('TripDetails', {tripId})
        }
      />

      <View style={styles.sectionPad}>
        <SectionHeader
          title="Gallery"
          subtitle="From the Keepers trail"
          actionLabel="Open"
          onAction={() => openGallery(0)}
        />
      </View>
      <GalleryStrip items={gallery} onPressItem={openGallery} />

      <View style={styles.sectionPad}>
        <SectionHeader title="Sponsors & Partners" />
        <Text style={[styles.sponsorLead, {color: theme.textMuted}]}>
          Official partners behind Keepers expeditions.
        </Text>
      </View>
      <SponsorsStrip sponsors={sponsors} />

      <View style={{height: 110}} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionPad: {
    paddingHorizontal: spacing.lg,
  },
  sponsorLead: {
    ...typography.caption,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
});
