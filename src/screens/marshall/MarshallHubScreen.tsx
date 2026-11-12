import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  BackHeader,
  Button,
  EmptyState,
  Icon,
  Screen,
  StatusPill,
} from '../../components';
import {useApp} from '../../context/AppContext';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MarshallHub'>;

export function MarshallHubScreen({navigation}: Props) {
  const theme = useThemeColors();
  const {trips, user} = useApp();

  const organized = useMemo(() => {
    return trips.filter(
      trip =>
        trip.organizerId === user.id ||
        trip.organizer.name
          .toLowerCase()
          .includes(`${user.firstName} ${user.lastName}`.trim().toLowerCase()),
    );
  }, [trips, user.firstName, user.id, user.lastName]);

  return (
    <Screen scroll>
      <BackHeader onBack={() => navigation.goBack()} />
      <Text style={[styles.kicker, {color: theme.textMuted}]}>Operations</Text>
      <Text style={[styles.title, {color: theme.text}]}>Marshall</Text>
      <Text style={[styles.sub, {color: theme.textMuted}]}>
        Create drives, manage attendance, and rate members after each expedition.
      </Text>

      <View style={styles.actions}>
        <Button
          label="Create Drive"
          onPress={() => navigation.navigate('CreateDrive')}
        />
        <Button
          label="Upgrade requests"
          variant="secondary"
          onPress={() => navigation.navigate('MarshallUpgrades')}
          style={{marginTop: spacing.sm}}
        />
      </View>

      <Text style={[styles.section, {color: theme.text}]}>My drives</Text>

      {organized.length === 0 ? (
        <EmptyState
          title="No organized drives"
          message="Publish a drive to start managing participants and ratings."
          actionLabel="Create Drive"
          onAction={() => navigation.navigate('CreateDrive')}
        />
      ) : (
        organized.map(trip => (
          <Pressable
            key={trip.id}
            onPress={() =>
              navigation.navigate('DriveParticipants', {tripId: trip.id})
            }
            style={({pressed}) => [
              styles.row,
              {
                borderColor: theme.border,
                backgroundColor: theme.surface,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <View style={styles.rowTop}>
              <Text style={[styles.rowTitle, {color: theme.text}]}>
                {trip.title}
              </Text>
              <StatusPill status={trip.status} />
            </View>
            <Text style={[styles.rowMeta, {color: theme.textMuted}]}>
              {trip.date} · {trip.time} · {trip.destination}
            </Text>
            <View style={styles.rowFooter}>
              <Text style={[styles.rowMeta, {color: theme.textMuted}]}>
                {trip.registeredCount}/{trip.maxParticipants} registered
              </Text>
              <Icon name="chevron-right" size={16} color={theme.textMuted} />
            </View>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {...typography.label},
  title: {...typography.hero, fontSize: 28, marginTop: spacing.xs},
  sub: {
    ...typography.subtitle,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  actions: {marginBottom: spacing.xl},
  section: {
    ...typography.label,
    marginBottom: spacing.md,
    letterSpacing: 1.6,
  },
  row: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  rowTitle: {...typography.title, fontSize: 17, flex: 1},
  rowMeta: {...typography.caption, marginTop: spacing.xs},
  rowFooter: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
