import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BackHeader, Icon, Screen} from '../../components';
import {useApp} from '../../context/AppContext';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';
import {DisplayMode} from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'DisplayMode'>;

const modes: {key: DisplayMode; label: string; description: string}[] = [
  {
    key: 'light',
    label: 'Light Mode',
    description: 'Warm ivory surfaces with deep black typography.',
  },
  {
    key: 'dark',
    label: 'Dark Mode',
    description: 'Deep black canvas with ivory editorial type.',
  },
];

export function DisplayModeScreen({navigation}: Props) {
  const theme = useThemeColors();
  const {displayMode, setDisplayMode} = useApp();

  return (
    <Screen scroll>
      <BackHeader onBack={() => navigation.goBack()} />
      <Text style={[styles.kicker, {color: theme.textMuted}]}>Appearance</Text>
      <Text style={[styles.title, {color: theme.text}]}>Display Mode</Text>
      <Text style={[styles.sub, {color: theme.textMuted}]}>
        Choose how Keepers Adventure looks across every screen. Your preference
        is saved on this device.
      </Text>

      <View style={[styles.list, {borderColor: theme.border}]}>
        {modes.map((mode, index) => {
          const active = displayMode === mode.key;
          return (
            <Pressable
              key={mode.key}
              accessibilityRole="button"
              accessibilityState={{selected: active}}
              onPress={() => setDisplayMode(mode.key)}
              style={({pressed}) => [
                styles.row,
                index < modes.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.border,
                },
                pressed && {opacity: 0.75},
              ]}>
              <View style={{flex: 1}}>
                <Text style={[styles.label, {color: theme.text}]}>
                  {mode.label}
                </Text>
                <Text style={[styles.desc, {color: theme.textMuted}]}>
                  {mode.description}
                </Text>
              </View>
              <View
                style={[
                  styles.check,
                  {
                    borderColor: theme.border,
                    backgroundColor: active ? theme.inverse : 'transparent',
                  },
                ]}>
                {active ? (
                  <Icon name="check" size={14} color={theme.onInverse} />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {...typography.label},
  title: {...typography.hero, marginTop: spacing.xs},
  sub: {
    ...typography.subtitle,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  list: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  label: {...typography.title, fontSize: 16},
  desc: {...typography.caption, marginTop: 4},
  check: {
    width: 24,
    height: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
