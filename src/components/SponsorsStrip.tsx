import React from 'react';
import {Linking, Pressable, StyleSheet, View} from 'react-native';
import {spacing, useThemeColors} from '../theme';
import {Sponsor} from '../types';
import {SponsorBrandMark} from './SponsorBrandMark';

interface SponsorsStripProps {
  sponsors: Sponsor[];
}

export function SponsorsStrip({sponsors}: SponsorsStripProps) {
  const theme = useThemeColors();

  const openSponsor = async (sponsor: Sponsor) => {
    if (!sponsor.url) {
      return;
    }
    await Linking.openURL(sponsor.url);
  };

  return (
    <View style={[styles.wrap, {paddingHorizontal: spacing.lg}]}>
      <View style={styles.grid}>
        {sponsors.map(sponsor => {
          const tappable = Boolean(sponsor.url);
          return (
            <Pressable
              key={sponsor.id}
              disabled={!tappable}
              onPress={() => openSponsor(sponsor)}
              style={({pressed}) => [
                styles.cell,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                  opacity: pressed && tappable ? 0.78 : 1,
                },
              ]}
              accessibilityRole={tappable ? 'link' : 'text'}
              accessibilityLabel={sponsor.name}>
              <SponsorBrandMark
                slug={sponsor.logo}
                color={theme.text}
                width={118}
                height={42}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  cell: {
    width: '48.5%',
    height: 92,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
