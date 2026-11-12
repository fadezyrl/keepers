import React, {useState} from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BackHeader, Button, Input, Screen} from '../../components';
import {createTripRequest, mapApiTrip} from '../../api/keepersApi';
import {useApp} from '../../context/AppContext';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';
import {Difficulty} from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateDrive'>;

const DIFFICULTIES: Difficulty[] = ['Easy', 'Moderate', 'Advanced', 'Expert'];

export function CreateDriveScreen({navigation}: Props) {
  const theme = useThemeColors();
  const {refreshAppData} = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [destination, setDestination] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Moderate');
  const [capacity, setCapacity] = useState('20');
  const [coverUrl, setCoverUrl] = useState('');
  const [publish, setPublish] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters.');
      return;
    }
    if (!destination.trim()) {
      setError('Destination is required.');
      return;
    }
    if (!date.trim()) {
      setError('Date is required (YYYY-MM-DD).');
      return;
    }
    const maxParticipants = Number(capacity) || 20;
    setLoading(true);
    try {
      const created = await createTripRequest({
        title: title.trim(),
        description: description.trim() || undefined,
        destination: destination.trim(),
        meetingPoint: meetingPoint.trim() || undefined,
        date: date.trim(),
        time: time.trim() || undefined,
        difficulty,
        maxParticipants,
        coverImage: coverUrl.trim() || undefined,
        publish,
      });
      const trip = mapApiTrip(created);
      await refreshAppData().catch(() => undefined);
      Alert.alert('Drive published', `${trip.title} is live.`, [
        {
          text: 'Manage participants',
          onPress: () =>
            navigation.replace('DriveParticipants', {tripId: trip.id}),
        },
        {text: 'Done', onPress: () => navigation.goBack()},
      ]);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as {message: string}).message)
          : 'Unable to create drive.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <BackHeader onBack={() => navigation.goBack()} />
      <Text style={[styles.kicker, {color: theme.textMuted}]}>Marshall</Text>
      <Text style={[styles.title, {color: theme.text}]}>Create drive</Text>
      <Text style={[styles.sub, {color: theme.textMuted}]}>
        Publish an expedition for Keepers members.
      </Text>

      <Input label="Title" value={title} onChangeText={setTitle} placeholder="Liwa Dawn Run" />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Brief overview"
        multiline
      />
      <Input
        label="Destination"
        value={destination}
        onChangeText={setDestination}
        placeholder="Liwa Oasis"
      />
      <Input
        label="Meeting point"
        value={meetingPoint}
        onChangeText={setMeetingPoint}
        placeholder="Gate 3 · Al Ain Road"
      />
      <Input
        label="Date"
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        autoCapitalize="none"
      />
      <Input
        label="Time"
        value={time}
        onChangeText={setTime}
        placeholder="05:30"
        autoCapitalize="none"
      />

      <Text style={[styles.fieldLabel, {color: theme.textMuted}]}>Difficulty</Text>
      <View style={styles.chips}>
        {DIFFICULTIES.map(item => {
          const active = difficulty === item;
          return (
            <Pressable
              key={item}
              onPress={() => setDifficulty(item)}
              style={[
                styles.chip,
                {
                  borderColor: theme.border,
                  backgroundColor: active ? theme.inverse : theme.surface,
                },
              ]}>
              <Text
                style={[
                  styles.chipLabel,
                  {color: active ? theme.onInverse : theme.textMuted},
                ]}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Input
        label="Capacity"
        value={capacity}
        onChangeText={setCapacity}
        keyboardType="number-pad"
        placeholder="20"
      />
      <Input
        label="Cover image URL (optional)"
        value={coverUrl}
        onChangeText={setCoverUrl}
        autoCapitalize="none"
        placeholder="https://..."
      />

      <View
        style={[
          styles.publishRow,
          {borderColor: theme.border, backgroundColor: theme.surface},
        ]}>
        <View style={{flex: 1}}>
          <Text style={[styles.publishTitle, {color: theme.text}]}>Publish now</Text>
          <Text style={[styles.publishSub, {color: theme.textMuted}]}>
            Make this drive visible to members immediately.
          </Text>
        </View>
        <Switch
          value={publish}
          onValueChange={setPublish}
          trackColor={{false: theme.border, true: theme.inverse}}
          thumbColor={theme.surface}
        />
      </View>

      {error ? (
        <Text style={[styles.error, {color: theme.text}]}>{error}</Text>
      ) : null}

      <Button
        label="Publish drive"
        onPress={onSubmit}
        loading={loading}
        style={{marginTop: spacing.md, marginBottom: spacing.xxl}}
      />
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
  fieldLabel: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chipLabel: {...typography.label, letterSpacing: 1.2},
  publishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  publishTitle: {...typography.title, fontSize: 15},
  publishSub: {...typography.caption, marginTop: 4},
  error: {...typography.caption, marginTop: spacing.sm},
});
