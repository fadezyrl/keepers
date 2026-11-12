import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {brandLogoPaths} from '../data/brandLogoPaths';

interface SponsorBrandMarkProps {
  slug: string;
  color: string;
  width?: number;
  height?: number;
}

export function SponsorBrandMark({
  slug,
  color,
  width = 120,
  height = 40,
}: SponsorBrandMarkProps) {
  const path = brandLogoPaths[slug.toLowerCase()];

  if (!path) {
    return null;
  }

  return (
    <View style={[styles.wrap, {width, height}]}>
      <Svg width="100%" height="100%" viewBox="0 0 24 24">
        <Path d={path} fill={color} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
