import React from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {spacing, typography, useThemeColors} from '../theme';
import {GalleryItem} from '../types';
import {RemoteImage} from './RemoteImage';

const WIDTH = Dimensions.get('window').width;
const TILE = WIDTH * 0.42;

interface GalleryStripProps {
  items: GalleryItem[];
  onPressItem: (index: number) => void;
}

export function GalleryStrip({items, onPressItem}: GalleryStripProps) {
  const theme = useThemeColors();

  if (!items.length) {
    return (
      <Text style={[styles.empty, {color: theme.textMuted}]}>
        Gallery photos coming soon.
      </Text>
    );
  }

  return (
    <FlatList
      data={items}
      horizontal
      keyExtractor={item => item.id}
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={TILE + spacing.sm}
      snapToAlignment="start"
      contentContainerStyle={styles.list}
      renderItem={({item, index}) => (
        <Pressable
          onPress={() => onPressItem(index)}
          style={({pressed}) => [
            styles.tile,
            pressed && {opacity: 0.92},
            index === items.length - 1 && {marginRight: spacing.lg},
          ]}
          accessibilityRole="imagebutton"
          accessibilityLabel={item.caption || `Gallery photo ${index + 1}`}>
          <RemoteImage uri={item.image} style={StyleSheet.absoluteFill} />
          <View style={styles.scrim} />
          {item.caption ? (
            <Text style={styles.caption} numberOfLines={2}>
              {item.caption}
            </Text>
          ) : null}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingLeft: spacing.lg,
  },
  tile: {
    width: TILE,
    height: TILE * 1.25,
    marginRight: spacing.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,17,16,0.28)',
  },
  caption: {
    ...typography.caption,
    color: '#F3F0EA',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    letterSpacing: 0.3,
  },
  empty: {
    ...typography.subtitle,
    paddingHorizontal: spacing.lg,
  },
});
