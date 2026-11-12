import React, {useMemo} from 'react';
import {Linking, Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Avatar,
  BackHeader,
  ErrorState,
  Icon,
  RemoteImage,
  Screen,
} from '../../components';
import {useApp} from '../../context/AppContext';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';
import {socialUrl} from '../../utils/social';

type Props = NativeStackScreenProps<RootStackParamList, 'MemberProfile'>;

export function MemberProfileScreen({navigation, route}: Props) {
  const theme = useThemeColors();
  const {members} = useApp();
  const member = useMemo(
    () => members.find(m => m.id === route.params.memberId),
    [members, route.params.memberId],
  );

  if (!member) {
    return (
      <Screen scroll>
        <BackHeader onBack={() => navigation.goBack()} />
        <ErrorState
          title="Member unavailable"
          message="This member profile could not be found."
          actionLabel="Back to Members"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <BackHeader onBack={() => navigation.goBack()} />
      <View style={styles.header}>
        <Avatar uri={member.avatar} size={96} />
        <Text style={[styles.name, {color: theme.text}]}>{member.name}</Text>
        <Text style={[styles.username, {color: theme.textMuted}]}>
          @{member.username}
        </Text>
        <Text style={[styles.membership, {color: theme.text}]}>
          {member.membership}
        </Text>
      </View>

      <Text style={[styles.section, {color: theme.textMuted}]}>Details</Text>
      <InfoRow label="Joined" value={member.joinedAt} />
      {member.nationality ? (
        <InfoRow label="Nationality" value={member.nationality} />
      ) : null}
      {member.bio ? (
        <Text style={[styles.bio, {color: theme.text}]}>{member.bio}</Text>
      ) : null}

      <Text style={[styles.section, {color: theme.textMuted}]}>Vehicle</Text>
      {member.vehicleImage ? (
        <RemoteImage uri={member.vehicleImage} style={styles.vehicle} />
      ) : null}
      <InfoRow label="Vehicle" value={member.vehicle} />

      {(member.social?.facebook ||
        member.social?.instagram ||
        member.social?.tiktok) && (
        <>
          <Text style={[styles.section, {color: theme.textMuted}]}>Social</Text>
          {member.social?.facebook ? (
            <SocialRow
              icon="facebook"
              label={member.social.facebook}
              onPress={() =>
                Linking.openURL(socialUrl('facebook', member.social!.facebook!))
              }
            />
          ) : null}
          {member.social?.instagram ? (
            <SocialRow
              icon="instagram"
              label={member.social.instagram}
              onPress={() =>
                Linking.openURL(
                  socialUrl('instagram', member.social!.instagram!),
                )
              }
            />
          ) : null}
          {member.social?.tiktok ? (
            <SocialRow
              icon="tiktok"
              label={member.social.tiktok}
              onPress={() =>
                Linking.openURL(socialUrl('tiktok', member.social!.tiktok!))
              }
            />
          ) : null}
        </>
      )}
    </Screen>
  );
}

function InfoRow({label, value}: {label: string; value: string}) {
  const theme = useThemeColors();
  return (
    <View style={[styles.infoRow, {borderBottomColor: theme.border}]}>
      <Text style={[styles.infoLabel, {color: theme.textMuted}]}>{label}</Text>
      <Text style={[styles.infoValue, {color: theme.text}]}>{value}</Text>
    </View>
  );
}

function SocialRow({
  icon,
  label,
  onPress,
}: {
  icon: 'facebook' | 'instagram' | 'tiktok';
  label: string;
  onPress: () => void;
}) {
  const theme = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.socialRow, {borderBottomColor: theme.border}]}>
      <Icon name={icon} size={16} color={theme.text} />
      <Text style={[styles.infoValue, {color: theme.text, flex: 1}]}>
        {label}
      </Text>
      <Icon name="chevron-right" size={14} color={theme.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  name: {...typography.title, fontSize: 22, marginTop: spacing.md},
  username: {...typography.caption, marginTop: 4},
  membership: {
    ...typography.label,
    marginTop: spacing.sm,
    letterSpacing: 2,
  },
  section: {
    ...typography.section,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  bio: {...typography.body, marginBottom: spacing.md},
  vehicle: {
    width: '100%',
    height: 160,
    marginBottom: spacing.md,
  },
  infoRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: {...typography.label},
  infoValue: {...typography.body, marginTop: 4},
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
