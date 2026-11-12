import React from 'react';
import {Image, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {colors, typography, useThemeColors} from '../theme';

/** Official client wordmark from assets/brand. */
const USE_IMAGE_LOGO = true;
const LOGO_LIGHT = require('../../assets/brand/logo-light.png');
const LOGO_DARK = require('../../assets/brand/logo-dark.png');
const LOGO_ASPECT = 1400 / 349;

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  /** Surface the logo sits on. Omit to follow app display mode. */
  tone?: 'light' | 'dark';
  style?: ViewStyle;
}

export function BrandLogo({
  size = 'md',
  showTagline = true,
  tone,
  style,
}: BrandLogoProps) {
  const theme = useThemeColors();
  const resolvedTone = tone ?? (theme.dark ? 'dark' : 'light');

  if (USE_IMAGE_LOGO) {
    const height = size === 'lg' ? 44 : size === 'sm' ? 22 : 32;
    const width = Math.round(height * LOGO_ASPECT);
    // tone="dark" means rendered on a dark surface → light mark
    const source = resolvedTone === 'dark' ? LOGO_LIGHT : LOGO_DARK;
    return (
      <View style={[styles.wrap, style]}>
        <Image
          source={source}
          style={{width, height}}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="Keepers Adventures 4x4"
        />
      </View>
    );
  }

  const markSize = size === 'lg' ? 72 : size === 'sm' ? 36 : 52;
  const titleSize = size === 'lg' ? 22 : size === 'sm' ? 12 : 16;
  const onDark = resolvedTone === 'dark';
  const ink = onDark ? colors.ivory : colors.black;
  const muted = onDark ? colors.greige : colors.stone;

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.wordmarkBlock}>
        <View
          style={[
            styles.emblem,
            {
              width: markSize,
              height: markSize,
              borderRadius: markSize / 2,
              borderColor: ink,
              backgroundColor: onDark ? 'rgba(243,240,234,0.06)' : colors.cream,
            },
          ]}>
          <View style={[styles.emblemInner, {borderColor: ink}]}>
            <Text
              style={[
                styles.emblemText,
                {fontSize: markSize * 0.28, color: ink},
              ]}>
              4X4
            </Text>
          </View>
        </View>
        <View style={styles.textCol}>
          <Text
            style={[
              styles.title,
              {fontSize: titleSize, color: ink, letterSpacing: titleSize * 0.18},
            ]}>
            KEEPERS
          </Text>
          {showTagline ? (
            <Text style={[styles.tagline, {color: muted}]}>ADVENTURES</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-start',
  },
  wordmarkBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emblem: {
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemInner: {
    width: '72%',
    height: '72%',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemText: {
    fontWeight: '600',
    letterSpacing: 1,
  },
  textCol: {
    justifyContent: 'center',
  },
  title: {
    ...typography.label,
    fontWeight: '600',
  },
  tagline: {
    ...typography.caption,
    marginTop: 2,
    letterSpacing: 3,
  },
});
