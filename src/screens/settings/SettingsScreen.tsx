import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  AppHeader,
  Avatar,
  ConfirmModal,
  Icon,
  IconName,
  Screen,
} from '../../components';
import {useApp} from '../../context/AppContext';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useThemeColors();
  const {user, displayMode, logout, deleteAccount, hasRole} = useApp();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const showMarshall =
    hasRole('marshall') ||
    hasRole('pre_marshall') ||
    hasRole('admin') ||
    hasRole('super_admin') ||
    (user.roles || []).some(role =>
      ['marshall', 'pre_marshall', 'admin', 'super_admin'].includes(
        role.toLowerCase(),
      ),
    );

  return (
    <Screen scroll padded={false} edges={['top']}>
      <AppHeader />
      <View style={styles.content}>
      <Text style={[styles.kicker, {color: theme.textMuted}]}>Account</Text>
      <Text style={[styles.title, {color: theme.text}]}>Settings</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Edit profile"
        onPress={() => navigation.navigate('EditProfile')}
        style={({pressed}) => [
          styles.profile,
          {
            borderColor: theme.border,
            backgroundColor: theme.surface,
            opacity: pressed ? 0.88 : 1,
          },
        ]}>
        <Avatar uri={user.avatar} size={78} />
        <View style={styles.profileText}>
          <Text style={[styles.name, {color: theme.text}]}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={[styles.membership, {color: theme.textMuted}]}>
            {user.membership}
          </Text>
          <Text style={[styles.editHint, {color: theme.text}]}>
            Edit profile
          </Text>
        </View>
        <Icon name="chevron-right" size={18} color={theme.textMuted} />
      </Pressable>

      <View style={[styles.menu, {borderColor: theme.border}]}>
        <SettingsRow
          icon="users"
          label="Members"
          onPress={() => navigation.navigate('MembersDirectory')}
        />
        {showMarshall ? (
          <SettingsRow
            icon="badge"
            label="Marshall"
            onPress={() => navigation.navigate('MarshallHub')}
          />
        ) : null}
        <SettingsRow
          icon="eye"
          label="Display Mode"
          value={displayMode === 'dark' ? 'Dark' : 'Light'}
          onPress={() => navigation.navigate('DisplayMode')}
        />
        <SettingsRow
          icon="globe"
          label="Terms and Privacy Policy"
          onPress={() => navigation.navigate('Legal', {type: 'terms'})}
        />
        <SettingsRow
          icon="logout"
          label="Logout"
          onPress={() => setLogoutOpen(true)}
        />
        <SettingsRow
          icon="trash"
          label="Delete account"
          last
          onPress={() => setDeleteOpen(true)}
        />
      </View>

      <ConfirmModal
        visible={logoutOpen}
        title="Log out?"
        message="You will need to sign in again to access your Keepers membership."
        confirmLabel="Logout"
        cancelLabel="Cancel"
        onCancel={() => setLogoutOpen(false)}
        onConfirm={async () => {
          setLogoutOpen(false);
          await logout();
        }}
      />
      <ConfirmModal
        visible={deleteOpen}
        title="Delete account?"
        message="This clears your local Keepers profile, registrations and saved preferences on this device."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          setDeleteOpen(false);
          await deleteAccount();
        }}
      />
      </View>
    </Screen>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  last,
  onPress,
}: {
  icon: IconName;
  label: string;
  value?: string;
  last?: boolean;
  onPress: () => void;
}) {
  const theme = useThemeColors();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.row,
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.border,
        },
        pressed && {opacity: 0.72},
      ]}>
      <View style={styles.rowLeft}>
        <Icon name={icon} size={18} color={theme.text} />
        <Text style={[styles.rowLabel, {color: theme.text}]}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value ? (
          <Text style={[styles.rowValue, {color: theme.textMuted}]}>{value}</Text>
        ) : null}
        <Icon name="chevron-right" size={16} color={theme.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {paddingHorizontal: spacing.lg},
  kicker: {...typography.label, marginTop: spacing.sm},
  title: {...typography.hero, marginTop: spacing.xs, marginBottom: spacing.lg},
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  profileText: {flex: 1},
  name: {...typography.title, fontSize: 18},
  membership: {...typography.caption, marginTop: 4, letterSpacing: 1.2},
  editHint: {
    ...typography.label,
    marginTop: spacing.sm,
  },
  menu: {
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 120,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 58,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowLabel: {...typography.body, fontSize: 15},
  rowValue: {...typography.caption, letterSpacing: 1},
});
