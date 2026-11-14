import React, {useState} from 'react';
import {Pressable, StyleSheet, Switch, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Icon, Screen} from '../../components';
import {useApp} from '../../context/AppContext';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'NotificationPreferences'>;

type PrefKey = 'trips' | 'events' | 'club' | 'registrations' | 'ratings';

const ROWS: Array<{key: PrefKey; label: string; hint: string}> = [
  {
    key: 'trips',
    label: 'Trip updates',
    hint: 'Published, cancelled or schedule changes',
  },
  {
    key: 'registrations',
    label: 'Registration updates',
    hint: 'Approvals, rejections and join alerts',
  },
  {
    key: 'ratings',
    label: 'Ratings & membership',
    hint: 'Ratings and upgrade decisions',
  },
  {
    key: 'events',
    label: 'Events',
    hint: 'Club event reminders',
  },
  {
    key: 'club',
    label: 'Club announcements',
    hint: 'Broadcast news from Keepers',
  },
];

export function NotificationPreferencesScreen({navigation}: Props) {
  const theme = useThemeColors();
  const {user, updateProfile} = useApp();
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    trips: user.notificationPrefs?.trips !== false,
    events: user.notificationPrefs?.events !== false,
    club: user.notificationPrefs?.club !== false,
    registrations: user.notificationPrefs?.registrations !== false,
    ratings: user.notificationPrefs?.ratings !== false,
  });

  const toggle = async (key: PrefKey, value: boolean) => {
    const next = {...prefs, [key]: value};
    setPrefs(next);
    setSaving(true);
    try {
      await updateProfile({
        ...user,
        notificationPrefs: next,
      });
    } catch {
      setPrefs(prefs);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Icon name="chevron-left" color={theme.text} />
        </Pressable>
        <Text style={[styles.title, {color: theme.text}]}>Notifications</Text>
        <View style={{width: 24}} />
      </View>

      <Text style={[styles.lead, {color: theme.textMuted}]}>
        Choose which push alerts you want. Account security notices stay on.
        In-app history remains available even when push is off.
      </Text>

      <View style={[styles.card, {borderColor: theme.border, backgroundColor: theme.surface}]}>
        {ROWS.map((row, index) => (
          <View
            key={row.key}
            style={[
              styles.row,
              index < ROWS.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: theme.border,
              },
            ]}>
            <View style={styles.copy}>
              <Text style={[styles.label, {color: theme.text}]}>{row.label}</Text>
              <Text style={[styles.hint, {color: theme.textMuted}]}>{row.hint}</Text>
            </View>
            <Switch
              value={prefs[row.key]}
              disabled={saving}
              onValueChange={value => toggle(row.key, value)}
              trackColor={{false: theme.border, true: theme.text}}
              thumbColor={theme.bg}
            />
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  title: {
    ...typography.title,
  },
  lead: {
    ...typography.subtitle,
    marginBottom: spacing.lg,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  copy: {flex: 1},
  label: {
    ...typography.title,
    fontSize: 15,
  },
  hint: {
    ...typography.caption,
    marginTop: 4,
  },
});
