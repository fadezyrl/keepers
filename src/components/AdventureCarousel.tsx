import React from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {colors, spacing, typography, useThemeColors} from '../theme';
import {Trip} from '../types';
import {Avatar} from './Avatar';
import {CapacityRing} from './CapacityRing';
import {RemoteImage} from './RemoteImage';

const WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = WIDTH * 0.78;
const CARD_HEIGHT = 420;

interface AdventureCarouselProps {
  trips: Trip[];
  onPressTrip: (tripId: string) => void;
}

export function AdventureCarousel({
  trips,
  onPressTrip,
}: AdventureCarouselProps) {
  const theme = useThemeColors();

  if (!trips.length) {
    return (
      <Text style={[styles.empty, {color: theme.textMuted}]}>
        No upcoming adventures at the moment.
      </Text>
    );
  }

  return (
    <FlatList
      data={trips}
      horizontal
      keyExtractor={item => item.id}
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={CARD_WIDTH + spacing.sm}
      snapToAlignment="start"
      contentContainerStyle={styles.list}
      renderItem={({item, index}) => (
        <Pressable
          onPress={() => onPressTrip(item.id)}
          style={({pressed}) => [
            styles.card,
            pressed && {opacity: 0.92},
            index === trips.length - 1 && {marginRight: spacing.lg},
          ]}
          accessibilityRole="button"
          accessibilityLabel={item.title}>
          <RemoteImage
            uri={item.coverImage}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.frame} />
          <View style={styles.gradient} />

          <View style={styles.topRow}>
            <Text style={styles.index}>
              {String(index + 1).padStart(2, '0')}
            </Text>
            <CapacityRing
              registered={item.registeredCount}
              max={item.maxParticipants}
              size={48}
              tone="dark"
            />
          </View>

          <View style={styles.bottom}>
            <Text style={styles.difficulty}>
              {item.category || item.difficulty}
            </Text>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>

            <View style={styles.metaBlock}>
              <Text style={styles.meta}>
                {item.date}  ·  {item.time}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {item.destination}
              </Text>
            </View>

            <View style={styles.organizer}>
              <Avatar uri={item.organizer.avatar} size={28} />
              <View style={{flex: 1}}>
                <Text style={styles.orgLabel}>Organizer</Text>
                <Text style={styles.orgName} numberOfLines={1}>
                  {item.organizer.name}
                </Text>
              </View>
              <Text style={styles.capacityLabel}>
                {item.registeredCount}/{item.maxParticipants}
              </Text>
            </View>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    paddingBottom: spacing.sm,
  },
  empty: {
    ...typography.subtitle,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginRight: spacing.sm,
    overflow: 'hidden',
    backgroundColor: colors.black,
  },
  frame: {
    ...StyleSheet.absoluteFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(243,240,234,0.22)',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '68%',
    backgroundColor: 'rgba(17,17,16,0.72)',
  },
  topRow: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  index: {
    ...typography.label,
    color: colors.ivory,
    letterSpacing: 3,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
  },
  difficulty: {
    ...typography.label,
    color: colors.greige,
    letterSpacing: 2.4,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.title,
    color: colors.ivory,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '300',
    letterSpacing: 0.4,
  },
  metaBlock: {
    marginTop: spacing.sm,
    gap: 4,
  },
  meta: {
    ...typography.caption,
    color: colors.cream,
    letterSpacing: 0.4,
  },
  organizer: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(243,240,234,0.18)',
    paddingTop: spacing.sm,
  },
  orgLabel: {
    ...typography.label,
    color: colors.stone,
    fontSize: 8,
    letterSpacing: 1.6,
  },
  orgName: {
    ...typography.caption,
    color: colors.ivory,
    marginTop: 2,
  },
  capacityLabel: {
    ...typography.label,
    color: colors.greige,
    letterSpacing: 1,
  },
});
