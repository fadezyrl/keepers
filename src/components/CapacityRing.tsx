import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {colors, typography} from '../theme';

interface CapacityRingProps {
  registered: number;
  max: number;
  size?: number;
  tone?: 'light' | 'dark';
}

export function CapacityRing({
  registered,
  max,
  size = 52,
  tone = 'light',
}: CapacityRingProps) {
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(registered / max, 1) : 0;
  const dark = tone === 'dark';
  const track = dark ? 'rgba(243,240,234,0.2)' : colors.greige;
  const fill = dark ? colors.ivory : colors.black;
  const label = dark ? colors.ivory : colors.black;

  return (
    <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={track}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={fill}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={[styles.value, {color: label, fontSize: size * 0.22}]}>
        {registered}/{max}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  value: {
    ...typography.label,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
});
