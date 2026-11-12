import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Icon, Screen} from '../../components';
import {useApp} from '../../context/AppContext';
import {RootStackParamList} from '../../navigation/types';
import {radii, spacing, typography, useThemeColors} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrationConfirm'>;

export function RegistrationConfirmScreen({navigation, route}: Props) {
  const theme = useThemeColors();
  const {getTrip} = useApp();
  const trip = getTrip(route.params.tripId);

  return (
    <Screen scroll>
      <View style={styles.wrap}>
        <View
          style={[
            styles.icon,
            {borderColor: theme.border, backgroundColor: theme.bgMuted},
          ]}>
          <Icon name="check" size={32} color={theme.text} />
        </View>
        <Text style={[styles.title, {color: theme.text}]}>
          {route.params.status === 'waitlist'
            ? 'Added to waitlist'
            : 'Registration confirmed'}
        </Text>
        <Text style={[styles.message, {color: theme.textMuted}]}>
          {route.params.message}
        </Text>
        {trip ? (
          <View
            style={[
              styles.card,
              {borderColor: theme.border, backgroundColor: theme.surface},
            ]}>
            <Text style={[styles.cardLabel, {color: theme.textMuted}]}>
              Adventure
            </Text>
            <Text style={[styles.cardTitle, {color: theme.text}]}>
              {trip.title}
            </Text>
            <Text style={[styles.cardMeta, {color: theme.textMuted}]}>
              {trip.date} · {trip.time}
            </Text>
            <Text style={[styles.cardMeta, {color: theme.textMuted}]}>
              {trip.meetingPoint}
            </Text>
          </View>
        ) : null}
        <Button
          label="Back to Trip"
          onPress={() =>
            navigation.replace('TripDetails', {tripId: route.params.tripId})
          }
        />
        <Button
          label="Explore More Adventures"
          onPress={() => navigation.navigate('Main', {screen: 'Trips'} as never)}
          variant="ghost"
          style={{marginTop: spacing.sm}}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.hero,
    fontSize: 24,
  },
  message: {
    ...typography.subtitle,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  card: {
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  cardLabel: {
    ...typography.label,
  },
  cardTitle: {
    ...typography.title,
    marginTop: spacing.xs,
  },
  cardMeta: {
    ...typography.caption,
    marginTop: 4,
  },
});
