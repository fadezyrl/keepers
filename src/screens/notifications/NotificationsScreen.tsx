import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, EmptyState, Icon, Screen} from '../../components';
import {useApp} from '../../context/AppContext';
import {RootStackParamList} from '../../navigation/types';
import {radii, spacing, typography, useThemeColors} from '../../theme';
import {NotificationType} from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

const typeIcon: Record<
  NotificationType,
  'trips' | 'check' | 'calendar' | 'bell' | 'about' | 'star'
> = {
  trip: 'trips',
  registration: 'check',
  reminder: 'calendar',
  event: 'star',
  club: 'about',
  admin: 'bell',
};

export function NotificationsScreen({navigation}: Props) {
  const theme = useThemeColors();
  const {notifications, markNotificationRead, markAllNotificationsRead} =
    useApp();

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Icon name="chevron-left" color={theme.text} />
        </Pressable>
        <Text style={[styles.title, {color: theme.text}]}>Notifications</Text>
        <View style={{width: 24}} />
      </View>

      {notifications.length > 0 ? (
        <Button
          label="Mark all as read"
          onPress={markAllNotificationsRead}
          variant="ghost"
          style={styles.markAll}
        />
      ) : null}

      {notifications.length === 0 ? (
        <EmptyState
          title="You're all caught up"
          message="Trip alerts, registration updates and club news show up here."
        />
      ) : (
        notifications.map(item => (
          <Pressable
            key={item.id}
            style={[
              styles.row,
              {borderBottomColor: theme.border},
              !item.read && {backgroundColor: theme.bgMuted},
            ]}
            onPress={() => markNotificationRead(item.id)}>
            <View style={[styles.iconWrap, {borderColor: theme.border}]}>
              <Icon name={typeIcon[item.type]} size={18} color={theme.text} />
            </View>
            <View style={styles.body}>
              <Text style={[styles.itemTitle, {color: theme.text}]}>
                {item.title}
              </Text>
              <Text style={[styles.itemBody, {color: theme.text}]}>
                {item.body}
              </Text>
              <Text style={[styles.time, {color: theme.textMuted}]}>
                {item.timestamp}
              </Text>
            </View>
            {!item.read ? (
              <View style={[styles.dot, {backgroundColor: theme.text}]} />
            ) : null}
          </Pressable>
        ))
      )}
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
  markAll: {
    alignSelf: 'flex-end',
    minHeight: 40,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: -spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {flex: 1},
  itemTitle: {
    ...typography.title,
    fontSize: 15,
  },
  itemBody: {
    ...typography.subtitle,
    marginTop: 4,
  },
  time: {
    ...typography.caption,
    marginTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
});
