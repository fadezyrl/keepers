import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {showAlert, showToast} from '../../alerts';
import {Button, Icon, LoadingState, Screen} from '../../components';
import {useApp} from '../../context/AppContext';
import {useCachedTrip} from '../../hooks/useCachedQueries';
import {RootStackParamList} from '../../navigation/types';
import {radii, spacing, typography, useThemeColors} from '../../theme';
import {openTripInCalendar} from '../../utils/calendar';

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrationConfirm'>;

export function RegistrationConfirmScreen({navigation, route}: Props) {
  const theme = useThemeColors();
  const {getTrip} = useApp();
  const cached = getTrip(route.params.tripId);
  const tripQuery = useCachedTrip(route.params.tripId, cached);
  const trip = tripQuery.data || cached;
  const [calendarBusy, setCalendarBusy] = useState(false);

  const addToCalendar = async () => {
    if (!trip) return;
    setCalendarBusy(true);
    const result = await openTripInCalendar({
      title: trip.title,
      date: trip.date,
      time: trip.time,
      location: trip.meetingPoint || trip.destination,
      details: trip.description,
    });
    setCalendarBusy(false);
    if (!result.ok) {
      showAlert({
        type: 'warning',
        title: 'Calendar',
        message: result.message,
      });
    } else {
      showToast({type: 'success', message: result.message || 'Calendar updated'});
    }
  };

  if (!trip && tripQuery.isLoading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

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
        {trip && route.params.status !== 'waitlist' ? (
          <Button
            label="Add to Phone Calendar"
            variant="secondary"
            onPress={addToCalendar}
            loading={calendarBusy}
            style={{marginBottom: spacing.sm}}
          />
        ) : null}
        <Button
          label="Back to Trip"
          onPress={() =>
            navigation.replace('TripDetails', {tripId: route.params.tripId})
          }
        />
        <Button
          label="Explore More Adventures"
          onPress={() => navigation.navigate('Trips')}
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
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  cardLabel: {...typography.label},
  cardTitle: {...typography.title, fontSize: 18, marginTop: 4},
  cardMeta: {...typography.caption, marginTop: 4},
});
