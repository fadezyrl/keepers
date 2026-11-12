import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {colors, spacing, typography} from '../theme';
import {HeroSlide} from '../types';
import {RemoteImage} from './RemoteImage';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Math.min(Dimensions.get('window').height * 0.36, 300);
const AUTO_MS = 4800;

interface HeroCarouselProps {
  slides: HeroSlide[];
  onPressSlide: (slide: HeroSlide) => void;
}

export function HeroCarousel({slides, onPressSlide}: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const listRef = useRef<FlatList<HeroSlide>>(null);
  const indexRef = useRef(0);

  const goTo = useCallback(
    (next: number, animated = true) => {
      if (!slides.length) {
        return;
      }
      const clamped = ((next % slides.length) + slides.length) % slides.length;
      listRef.current?.scrollToIndex({index: clamped, animated});
      indexRef.current = clamped;
      setIndex(clamped);
    },
    [slides.length],
  );

  useEffect(() => {
    if (slides.length < 2 || paused) {
      return;
    }
    const timer = setInterval(() => {
      goTo(indexRef.current + 1);
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, [goTo, paused, slides.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / WIDTH);
    if (next !== indexRef.current && next >= 0 && next < slides.length) {
      indexRef.current = next;
      setIndex(next);
    }
  };

  if (!slides.length) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        keyExtractor={item => item.id}
        onScrollBeginDrag={() => setPaused(true)}
        onMomentumScrollEnd={() => setPaused(false)}
        getItemLayout={(_, i) => ({
          length: WIDTH,
          offset: WIDTH * i,
          index: i,
        })}
        renderItem={({item}) => (
          <Pressable
            style={styles.slide}
            onPress={() => onPressSlide(item)}
            accessibilityRole="button"
            accessibilityLabel={item.title}>
            <RemoteImage uri={item.image} style={StyleSheet.absoluteFill} />
            <View style={styles.veil} />
            <View style={styles.content}>
              <Text style={styles.kicker}>Keepers Campaign</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
              {item.tripId ? (
                <View style={styles.ctaRow}>
                  <Text style={styles.cta}>Explore adventure</Text>
                  <View style={styles.ctaLine} />
                </View>
              ) : null}
            </View>
          </Pressable>
        )}
      />

      <View style={styles.progressRow}>
        {slides.map((slide, i) => {
          const active = i === index;
          return (
            <Pressable
              key={slide.id}
              onPress={() => goTo(i)}
              hitSlop={8}
              style={styles.progressHit}>
              <View
                style={[
                  styles.progressTrack,
                  active && styles.progressTrackActive,
                ]}>
                {active ? <View style={styles.progressFill} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.sm,
  },
  slide: {
    width: WIDTH,
    height: HEIGHT,
    overflow: 'hidden',
    backgroundColor: colors.black,
  },
  veil: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17,17,16,0.42)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + spacing.sm,
  },
  kicker: {
    ...typography.label,
    color: colors.greige,
    marginBottom: spacing.xs,
    letterSpacing: 3.2,
  },
  title: {
    ...typography.display,
    color: colors.ivory,
    fontSize: 26,
    lineHeight: 30,
    maxWidth: WIDTH * 0.86,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.cream,
    marginTop: spacing.xs,
    maxWidth: WIDTH * 0.78,
    lineHeight: 20,
    fontSize: 13,
  },
  ctaRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cta: {
    ...typography.label,
    color: colors.ivory,
    letterSpacing: 2.8,
  },
  ctaLine: {
    width: 36,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.ivory,
  },
  progressRow: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.md,
    flexDirection: 'row',
    gap: 6,
  },
  progressHit: {
    flex: 1,
    paddingVertical: 8,
  },
  progressTrack: {
    height: 1,
    backgroundColor: 'rgba(243,240,234,0.28)',
    overflow: 'hidden',
  },
  progressTrackActive: {
    backgroundColor: 'rgba(243,240,234,0.28)',
  },
  progressFill: {
    height: 1,
    width: '100%',
    backgroundColor: colors.ivory,
  },
});
