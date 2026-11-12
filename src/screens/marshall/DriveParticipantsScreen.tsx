import React, {useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Avatar,
  BackHeader,
  Button,
  EmptyState,
  ErrorState,
  Screen,
} from '../../components';
import {markAttendanceRequest} from '../../api/keepersApi';
import {useApp} from '../../context/AppContext';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DriveParticipants'>;

export function DriveParticipantsScreen({navigation, route}: Props) {
  const theme = useThemeColors();
  const {getTrip, refreshAppData} = useApp();
  const trip = getTrip(route.params.tripId);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!trip) {
    return (
      <Screen>
        <BackHeader onBack={() => navigation.goBack()} />
        <ErrorState
          title="Drive unavailable"
          message="This drive could not be found."
          actionLabel="Back"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  const onAttendance = async (userId: string, attended: boolean) => {
    setBusyId(userId);
    try {
      await markAttendanceRequest(trip.id, {userId, attended});
      await refreshAppData().catch(() => undefined);
      Alert.alert(
        attended ? 'Marked present' : 'Marked absent',
        'Attendance updated.',
      );
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as {message: string}).message)
          : 'Unable to update attendance.';
      Alert.alert('Attendance failed', message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Screen scroll>
      <BackHeader onBack={() => navigation.goBack()} />
      <Text style={[styles.kicker, {color: theme.textMuted}]}>Marshall</Text>
      <Text style={[styles.title, {color: theme.text}]}>{trip.title}</Text>
      <Text style={[styles.sub, {color: theme.textMuted}]}>
        {trip.registeredCount} registered · mark attendance and rate members.
      </Text>

      {trip.participants.length === 0 ? (
        <EmptyState
          title="No participants yet"
          message="Registered members will appear here once they join."
        />
      ) : (
        trip.participants.map(member => (
          <View
            key={member.id}
            style={[styles.card, {borderColor: theme.border, backgroundColor: theme.surface}]}>
            <View style={styles.cardHeader}>
              <Avatar uri={member.avatar} size={48} />
              <View style={{flex: 1}}>
                <Text style={[styles.name, {color: theme.text}]}>{member.name}</Text>
                {member.vehicle ? (
                  <Text style={[styles.meta, {color: theme.textMuted}]}>
                    {member.vehicle}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={styles.actions}>
              <Button
                label="Present"
                onPress={() => onAttendance(member.id, true)}
                loading={busyId === member.id}
                style={styles.actionBtn}
              />
              <Button
                label="Absent"
                variant="secondary"
                onPress={() => onAttendance(member.id, false)}
                disabled={busyId === member.id}
                style={styles.actionBtn}
              />
              <Button
                label="Rate"
                variant="ghost"
                onPress={() =>
                  navigation.navigate('RateMember', {
                    tripId: trip.id,
                    memberId: member.id,
                    memberName: member.name,
                  })
                }
                style={styles.actionBtn}
              />
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {...typography.label},
  title: {...typography.hero, fontSize: 26, marginTop: spacing.xs},
  sub: {
    ...typography.subtitle,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  name: {...typography.title, fontSize: 16},
  meta: {...typography.caption, marginTop: 2},
  actions: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  actionBtn: {
    marginTop: 0,
  },
});
