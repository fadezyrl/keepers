import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {showAlert} from '../../alerts';
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

/** Matches the floating tab bar in MainTabNavigator. */
const TAB_BAR_HEIGHT = 64;
const TAB_BAR_MIN_OFFSET = 10;

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const {user, displayMode, logout, deleteAccount, hasRole} = useApp();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const tabClearance =
    TAB_BAR_HEIGHT + Math.max(insets.bottom, TAB_BAR_MIN_OFFSET) + spacing.md;

  const showMarshall =
    hasRole('marshall') ||
    hasRole('pre_marshall') ||
    hasRole('admin') ||
    hasRole('super_admin');

  const onDelete = async () => {
    if (!deletePassword.trim()) {
      showAlert({
        type: 'warning',
        title: 'Password required',
        message: 'Enter your password to confirm deletion.',
      });
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      setDeleteOpen(false);
      setDeletePassword('');
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Delete failed',
        message:
          error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Screen scroll padded={false} edges={['top']}>
      <AppHeader />
      <View style={[styles.content, {paddingBottom: tabClearance}]}>
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
            icon="badge"
            label="My Progress"
            onPress={() => navigation.navigate('MyProgress')}
          />
          <SettingsRow
            icon="trips"
            label="My Trips"
            onPress={() => navigation.navigate('Trips', {tab: 'mine'})}
          />
          <SettingsRow
            icon="users"
            label="Members"
            onPress={() =>
              navigation.navigate('Main', {screen: 'Members'})
            }
          />
          <SettingsRow
            icon="about"
            label="About Keepers"
            onPress={() => navigation.navigate('About')}
          />
          <SettingsRow
            icon="mail"
            label="Trip chats"
            onPress={() => navigation.navigate('ChatInbox')}
          />
          {showMarshall ? (
            <SettingsRow
              icon="star"
              label="Manage My Drives"
              onPress={() => navigation.navigate('MarshallHub')}
            />
          ) : null}
          <SettingsRow
            icon="bell"
            label="Notification preferences"
            onPress={() => navigation.navigate('NotificationPreferences')}
          />
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
          message="This permanently deletes your Keepers account, profile data, and related media. Enter your password to confirm."
          confirmLabel={deleting ? 'Deleting…' : 'Delete permanently'}
          cancelLabel="Cancel"
          danger
          loading={deleting}
          onCancel={() => {
            if (deleting) return;
            setDeleteOpen(false);
            setDeletePassword('');
          }}
          onConfirm={onDelete}
          children={
            <TextInput
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
              placeholder="Current password"
              placeholderTextColor={theme.textMuted}
              style={[
                styles.passwordInput,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.bgMuted,
                },
              ]}
            />
          }
        />
      </View>
    </Screen>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  last,
}: {
  icon: IconName;
  label: string;
  value?: string;
  onPress: () => void;
  last?: boolean;
}) {
  const theme = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.row,
        !last && {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border},
        pressed && {opacity: 0.75},
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
  content: {
    paddingHorizontal: spacing.lg,
  },
  kicker: {...typography.label, marginTop: spacing.md},
  title: {...typography.hero, fontSize: 30, marginBottom: spacing.lg},
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  profileText: {flex: 1},
  name: {...typography.title, fontSize: 18},
  membership: {...typography.caption, marginTop: 2},
  editHint: {...typography.label, marginTop: spacing.sm},
  menu: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rowLeft: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  rowRight: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  rowLabel: {...typography.body},
  rowValue: {...typography.caption},
  passwordInput: {
    marginTop: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
  },
});
