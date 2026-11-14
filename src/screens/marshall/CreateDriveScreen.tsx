import React, {useMemo, useState} from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {showAlert} from '../../alerts';
import {
  BackHeader,
  BusyOverlay,
  Button,
  ImagePickerSheet,
  Input,
  RemoteImage,
  Screen,
} from '../../components';
import {createTripRequest, mapApiTrip} from '../../api/keepersApi';
import {invalidateAfterMarshallMutation, useCacheSession} from '../../cache';
import {useApp} from '../../context/AppContext';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';
import {Difficulty} from '../../types';
import {uploadTripMedia} from '../../utils/mediaUpload';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateDrive'>;

const DIFFICULTIES: Difficulty[] = ['Easy', 'Moderate', 'Advanced', 'Expert'];

type FieldErrors = Partial<
  Record<'title' | 'destination' | 'date' | 'time' | 'capacity', string>
>;

function toDateApi(value: Date): string {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toTimeApi(value: Date): string {
  const h = String(value.getHours()).padStart(2, '0');
  const m = String(value.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatDateLabel(value: Date): string {
  return value.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTimeLabel(value: Date): string {
  return value.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CreateDriveScreen({navigation}: Props) {
  const theme = useThemeColors();
  const {refreshAppData, user, upsertLocalTrip, hasPermission} = useApp();
  const {queryClient, activeUserId} = useCacheSession();
  const canCreate = hasPermission('trips.create') || hasPermission('trips.manage');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [destination, setDestination] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [dateValue, setDateValue] = useState<Date | null>(null);
  const [timeValue, setTimeValue] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('Moderate');
  const [capacity, setCapacity] = useState('20');
  const [coverUrl, setCoverUrl] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [publish, setPublish] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const dateLabel = useMemo(
    () => (dateValue ? formatDateLabel(dateValue) : ''),
    [dateValue],
  );
  const timeLabel = useMemo(
    () => (timeValue ? formatTimeLabel(timeValue) : ''),
    [timeValue],
  );

  const clearFieldError = (key: keyof FieldErrors) => {
    setFieldErrors(prev => {
      if (!prev[key]) return prev;
      const next = {...prev};
      delete next[key];
      return next;
    });
  };

  const validateFields = (): FieldErrors => {
    const next: FieldErrors = {};
    if (title.trim().length < 3) {
      next.title = 'Title is required (min 3 characters).';
    }
    if (!destination.trim()) {
      next.destination = 'Destination is required.';
    }
    if (!dateValue) {
      next.date = 'Date is required.';
    }
    const cap = Number(capacity);
    if (!capacity.trim() || Number.isNaN(cap) || cap < 1) {
      next.capacity = 'Capacity must be at least 1.';
    }
    return next;
  };

  const onDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    if (selected) {
      setDateValue(selected);
      clearFieldError('date');
      setFormError(null);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }
    if (selected) {
      setTimeValue(selected);
      clearFieldError('time');
      setFormError(null);
    }
  };

  if (!canCreate) {
    return (
      <Screen>
        <BackHeader onBack={() => navigation.goBack()} />
        <Text style={[styles.title, {color: theme.text}]}>Not authorized</Text>
        <Text style={[styles.sub, {color: theme.textMuted}]}>
          Only Marshalls and Admins can create drives.
        </Text>
      </Screen>
    );
  }

  const onPickCover = async (file: {
    uri: string;
    name: string;
    type: string;
  }) => {
    setUploadingCover(true);
    setPickerOpen(false);
    setFormError(null);
    try {
      const url = await uploadTripMedia(file);
      setCoverUrl(url);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to upload cover image.',
      );
    } finally {
      setUploadingCover(false);
    }
  };

  const onSubmit = async () => {
    setFormError(null);
    const nextErrors = validateFields();
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
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
        date: toDateApi(dateValue!),
        time: timeValue ? toTimeApi(timeValue) : undefined,
        difficulty,
        maxParticipants,
        coverImage: coverUrl.trim() || undefined,
        publish,
      });
      const trip = mapApiTrip(created);
      upsertLocalTrip(trip);
      const uid = user.id || activeUserId;
      if (uid) {
        await invalidateAfterMarshallMutation(queryClient, uid, trip.id);
      }
      await refreshAppData().catch(() => undefined);
      showAlert({
        type: 'success',
        title: publish ? 'Drive published' : 'Drive saved',
        message: publish
          ? `${trip.title} is live.`
          : `${trip.title} saved as draft.`,
        buttons: [
          {
            label: 'Manage participants',
            variant: 'secondary',
            onPress: () =>
              navigation.replace('DriveParticipants', {tripId: trip.id}),
          },
          {
            label: 'Done',
            variant: 'primary',
            onPress: () => navigation.goBack(),
          },
        ],
      });
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as {message: string}).message)
          : 'Unable to create drive.';
      setFormError(message);
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

      <Input
        label="Title"
        required
        value={title}
        onChangeText={text => {
          setTitle(text);
          clearFieldError('title');
        }}
        placeholder="Liwa Dawn Run"
        error={fieldErrors.title}
      />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Brief overview"
        multiline
      />
      <Input
        label="Destination"
        required
        value={destination}
        onChangeText={text => {
          setDestination(text);
          clearFieldError('destination');
        }}
        placeholder="Liwa Oasis"
        error={fieldErrors.destination}
      />
      <Input
        label="Meeting point"
        value={meetingPoint}
        onChangeText={setMeetingPoint}
        placeholder="Gate 3 · Al Ain Road"
      />

      <Pressable
        onPress={() => {
          setShowTimePicker(false);
          setShowDatePicker(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="Select date">
        <View pointerEvents="none">
          <Input
            label="Date"
            required
            value={dateLabel}
            placeholder="Tap to select date"
            editable={false}
            error={fieldErrors.date}
          />
        </View>
      </Pressable>
      {showDatePicker ? (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={dateValue || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
          {Platform.OS === 'ios' ? (
            <Button
              label="Done"
              variant="secondary"
              onPress={() => setShowDatePicker(false)}
              style={{marginBottom: spacing.sm}}
            />
          ) : null}
        </View>
      ) : null}

      <Pressable
        onPress={() => {
          setShowDatePicker(false);
          setShowTimePicker(true);
        }}
        accessibilityRole="button"
        accessibilityLabel="Select time">
        <View pointerEvents="none">
          <Input
            label="Time"
            value={timeLabel}
            placeholder="Tap to select time"
            editable={false}
            error={fieldErrors.time}
          />
        </View>
      </Pressable>
      {showTimePicker ? (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={timeValue || new Date()}
            mode="time"
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
          {Platform.OS === 'ios' ? (
            <Button
              label="Done"
              variant="secondary"
              onPress={() => setShowTimePicker(false)}
              style={{marginBottom: spacing.sm}}
            />
          ) : null}
        </View>
      ) : null}

      <Text style={[styles.fieldLabel, {color: theme.textMuted}]}>
        Difficulty *
      </Text>
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
        required
        value={capacity}
        onChangeText={text => {
          setCapacity(text.replace(/[^\d]/g, ''));
          clearFieldError('capacity');
        }}
        keyboardType="number-pad"
        placeholder="20"
        error={fieldErrors.capacity}
      />
      <Text style={[styles.fieldLabel, {color: theme.textMuted}]}>
        Cover image
      </Text>
      {coverUrl ? (
        <RemoteImage uri={coverUrl} style={styles.coverPreview} />
      ) : null}
      <Button
        label={coverUrl ? 'Replace cover photo' : 'Upload cover photo'}
        variant="secondary"
        onPress={() => setPickerOpen(true)}
        loading={uploadingCover}
        style={{marginBottom: spacing.sm}}
      />
      <Input
        label="Or paste cover URL"
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
          <Text style={[styles.publishTitle, {color: theme.text}]}>
            Publish now
          </Text>
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

      {formError ? (
        <Text style={[styles.error, {color: theme.text}]}>{formError}</Text>
      ) : null}

      <Button
        label={publish ? 'Publish drive' : 'Save draft'}
        onPress={onSubmit}
        loading={loading}
        style={{marginTop: spacing.md, marginBottom: spacing.xxl}}
      />

      <ImagePickerSheet
        visible={pickerOpen}
        title="Drive cover"
        onSelect={onPickCover}
        onClose={() => setPickerOpen(false)}
        uploading={uploadingCover}
        mediaType="photo"
      />
      <BusyOverlay
        visible={uploadingCover || loading}
        message={
          uploadingCover
            ? 'Uploading cover photo…'
            : publish
              ? 'Publishing drive…'
              : 'Saving draft…'
        }
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
  coverPreview: {
    width: '100%',
    height: 160,
    marginBottom: spacing.sm,
  },
  pickerWrap: {
    marginBottom: spacing.sm,
  },
});
