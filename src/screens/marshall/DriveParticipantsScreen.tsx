import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {showAlert, showConfirm, showToast} from '../../alerts';
import {
  Avatar,
  BackHeader,
  BusyOverlay,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
} from '../../components';
import {
  markAttendanceRequest,
  permanentlyDeleteTripRequest,
  reviewRegistrationRequest,
} from '../../api/keepersApi';
import {openPrivateAsMarshall} from '../../chat/chatApi';
import {invalidateAfterMarshallMutation, useCacheSession} from '../../cache';
import {useApp} from '../../context/AppContext';
import {useCachedTrip} from '../../hooks/useCachedQueries';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';
import {Participant} from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'DriveParticipants'>;

function formatRegisteredAt(value?: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString();
}

export function DriveParticipantsScreen({navigation, route}: Props) {
  const theme = useThemeColors();
  const {upsertLocalTrip, removeLocalTrip, user, hasPermission} = useApp();
  const {queryClient, activeUserId} = useCacheSession();
  const tripQuery = useCachedTrip(route.params.tripId);
  const trip = tripQuery.data || null;
  const loading = tripQuery.isLoading && !trip;
  const error =
    tripQuery.isError && !trip
      ? tripQuery.error instanceof Error
        ? tripQuery.error.message
        : 'Unable to load drive.'
      : null;
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reviewBusyId, setReviewBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canMarkAttendance =
    hasPermission('attendance.mark') &&
    (hasPermission('trips.manage') ||
      hasPermission('trips.manage_own') ||
      trip?.organizerId === user.id);
  const canRate = hasPermission('ratings.create');
  const ownsTrip =
    Boolean(user.id) &&
    (trip?.createdBy === user.id ||
      (!trip?.createdBy && trip?.organizerId === user.id));
  const isOrganizer = Boolean(user.id) && trip?.organizerId === user.id;
  const canManageMedia =
    Boolean(trip) &&
    (hasPermission('trips.manage') ||
      (hasPermission('trips.manage_own') && isOrganizer));
  const canReviewRegistrations =
    Boolean(trip) &&
    (hasPermission('registrations.manage') ||
      hasPermission('trips.manage') ||
      (hasPermission('trips.manage_own') && isOrganizer));
  const canMessagePrivate =
    Boolean(trip) &&
    (hasPermission('chat.send') || hasPermission('chat.moderate')) &&
    (hasPermission('trips.manage') ||
      (hasPermission('trips.manage_own') && isOrganizer));
  const canPermanentDelete =
    Boolean(trip) &&
    (hasPermission('trips.manage') ||
      (ownsTrip &&
        (hasPermission('trips.create') || hasPermission('trips.manage_own'))));

  const load = async () => {
    await tripQuery.refetch();
  };

  const onMessagePrivate = async (p: Participant) => {
    if (!trip) return;
    setBusyId(`chat-${p.id}`);
    try {
      const convo = await openPrivateAsMarshall(trip.id, p.id);
      navigation.navigate('ChatThread', {
        conversationId: convo.id,
        title: p.name,
      });
    } catch (err) {
      showAlert({
        type: 'error',
        title: 'Private chat unavailable',
        message:
          err && typeof err === 'object' && 'message' in err
            ? String((err as {message: string}).message)
            : 'Unable to open private chat.',
      });
    } finally {
      setBusyId(null);
    }
  };

  useEffect(() => {
    if (tripQuery.data) {
      upsertLocalTrip(tripQuery.data);
    }
  }, [tripQuery.data, upsertLocalTrip]);

  const {pending, confirmed, rejected} = useMemo(() => {
    const list = trip?.participants || [];
    return {
      pending: list.filter(p => p.registrationStatus === 'pending'),
      confirmed: list.filter(
        p =>
          !p.registrationStatus ||
          p.registrationStatus === 'registered' ||
          p.registrationStatus === 'waitlist',
      ),
      rejected: list.filter(p => p.registrationStatus === 'rejected'),
    };
  }, [trip?.participants]);

  const onAttendance = async (userId: string, attended: boolean) => {
    if (!trip) return;
    setBusyId(userId);
    try {
      await markAttendanceRequest(trip.id, {userId, attended});
      const uid = user.id || activeUserId;
      if (uid) {
        await invalidateAfterMarshallMutation(queryClient, uid, trip.id);
      }
      await load();
      showToast({
        type: 'success',
        message: attended ? 'Marked present' : 'Marked absent',
      });
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as {message: string}).message)
          : 'Unable to update attendance.';
      showAlert({
        type: 'error',
        title: 'Attendance failed',
        message,
      });
    } finally {
      setBusyId(null);
    }
  };

  const onReview = async (
    participant: Participant,
    status: 'registered' | 'rejected',
  ) => {
    if (!trip || !participant.registrationId) return;
    const run = async () => {
      setReviewBusyId(participant.registrationId!);
      try {
        await reviewRegistrationRequest(participant.registrationId!, {status});
        const uid = user.id || activeUserId;
        if (uid) {
          await invalidateAfterMarshallMutation(queryClient, uid, trip.id);
        }
        await load();
        showToast({
          type: 'success',
          message:
            status === 'registered'
              ? `${participant.name} accepted`
              : `${participant.name} rejected`,
        });
      } catch (err) {
        const code =
          err && typeof err === 'object' && 'code' in err
            ? String((err as {code: string}).code)
            : '';
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as {message: string}).message)
            : 'Unable to update registration.';
        showAlert({
          type: 'error',
          title:
            code === 'TRIP_FULL'
              ? 'Trip is full'
              : code === 'ALREADY_REVIEWED'
                ? 'Already reviewed'
                : code === 'TRIP_CLOSED'
                  ? 'Trip closed'
                  : 'Review failed',
          message,
        });
      } finally {
        setReviewBusyId(null);
      }
    };

    if (status === 'rejected') {
      void showConfirm({
        title: 'Reject registration?',
        message: `${participant.name} will be notified that their registration was rejected.`,
        cancelText: 'Keep pending',
        confirmText: 'Reject',
        destructive: true,
        onConfirm: run,
      });
      return;
    }

    await run();
  };

  const onPermanentDelete = () => {
    if (!trip || deleting) return;
    void showConfirm({
      title: 'Permanently delete drive?',
      message: `“${trip.title}” will be permanently deleted. Registrations, attendance, ratings and trip media for this drive will be removed. This cannot be undone.`,
      cancelText: 'Keep drive',
      confirmText: 'Delete permanently',
      destructive: true,
      onConfirm: async () => {
        setDeleting(true);
        try {
          await permanentlyDeleteTripRequest(trip.id);
          removeLocalTrip(trip.id);
          const uid = user.id || activeUserId;
          if (uid) {
            await invalidateAfterMarshallMutation(queryClient, uid, trip.id);
          }
          showToast({type: 'success', message: 'Drive permanently removed'});
          navigation.navigate('MarshallHub');
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  if (loading && !trip) {
    return (
      <Screen>
        <BackHeader onBack={() => navigation.goBack()} />
        <LoadingState />
      </Screen>
    );
  }

  if (!trip) {
    return (
      <Screen>
        <BackHeader onBack={() => navigation.goBack()} />
        <ErrorState
          title="Drive unavailable"
          message={error || 'This drive could not be found.'}
          actionLabel="Retry"
          onAction={load}
        />
      </Screen>
    );
  }

  const renderParticipantCard = (
    p: Participant,
    mode: 'pending' | 'confirmed' | 'rejected',
  ) => {
    const registeredAt = formatRegisteredAt(p.registeredAt);
    return (
      <View
        key={`${mode}-${p.registrationId || p.id}`}
        style={[
          styles.card,
          {borderColor: theme.border, backgroundColor: theme.surface},
        ]}>
        <View style={styles.row}>
          <Avatar uri={p.avatar} size={44} />
          <View style={styles.info}>
            <Text style={[styles.name, {color: theme.text}]}>{p.name}</Text>
            {p.vehicle ? (
              <Text style={[styles.meta, {color: theme.textMuted}]}>
                {p.vehicle}
              </Text>
            ) : null}
            <Text style={[styles.meta, {color: theme.textMuted}]}>
              {mode === 'pending'
                ? 'Pending review'
                : mode === 'rejected'
                  ? 'Rejected'
                  : p.registrationStatus === 'waitlist'
                    ? 'Waitlist'
                    : 'Confirmed'}
              {registeredAt ? ` · ${registeredAt}` : ''}
            </Text>
          </View>
        </View>

        {mode === 'pending' && canReviewRegistrations ? (
          <View style={styles.actions}>
            <Button
              label="Accept"
              onPress={() => onReview(p, 'registered')}
              loading={reviewBusyId === p.registrationId}
              style={styles.btn}
            />
            <Button
              label="Reject"
              variant="secondary"
              onPress={() => onReview(p, 'rejected')}
              loading={reviewBusyId === p.registrationId}
              style={styles.btn}
            />
          </View>
        ) : null}

        {mode === 'confirmed' &&
        (canMarkAttendance || canRate || canMessagePrivate) ? (
          <View style={styles.actions}>
            {canMarkAttendance ? (
              <>
                <Button
                  label="Present"
                  onPress={() => onAttendance(p.id, true)}
                  loading={busyId === p.id}
                  style={styles.btn}
                />
                <Button
                  label="Absent"
                  variant="secondary"
                  onPress={() => onAttendance(p.id, false)}
                  loading={busyId === p.id}
                  style={styles.btn}
                />
              </>
            ) : null}
            {canMessagePrivate && p.id !== user.id ? (
              <Button
                label="Message"
                variant="ghost"
                onPress={() => onMessagePrivate(p)}
                loading={busyId === `chat-${p.id}`}
                style={styles.btn}
              />
            ) : null}
            {canRate ? (
              <Button
                label="Rate"
                variant="ghost"
                onPress={() =>
                  navigation.navigate('RateMember', {
                    tripId: trip.id,
                    memberId: p.id,
                    memberName: p.name,
                  })
                }
                style={styles.btn}
              />
            ) : null}
          </View>
        ) : null}

        {mode === 'confirmed' &&
        !canMarkAttendance &&
        !canRate &&
        !canMessagePrivate ? (
          <Text
            style={[
              styles.meta,
              {color: theme.textMuted, marginTop: spacing.sm},
            ]}>
            View only — attendance and ratings require Marshall authority.
          </Text>
        ) : null}
      </View>
    );
  };

  const totalVisible = pending.length + confirmed.length + rejected.length;

  return (
    <Screen scroll onRefresh={load}>
      <BackHeader onBack={() => navigation.goBack()} />
      <Text style={[styles.kicker, {color: theme.textMuted}]}>Marshall</Text>
      <Text style={[styles.title, {color: theme.text}]}>{trip.title}</Text>
      <Text style={[styles.sub, {color: theme.textMuted}]}>
        {trip.date} · {trip.registeredCount}/{trip.maxParticipants} confirmed
        {trip.pendingCount ? ` · ${trip.pendingCount} pending` : ''}
      </Text>

      {canManageMedia ? (
        <Button
          label="Manage trip media"
          variant="secondary"
          onPress={() =>
            navigation.navigate('ManageTripMedia', {tripId: trip.id})
          }
          style={{marginBottom: spacing.lg}}
        />
      ) : null}

      {canReviewRegistrations ? (
        <View style={styles.block}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>
            Pending registrations
          </Text>
          {pending.length === 0 ? (
            <EmptyState
              title="No pending requests"
              message="New join requests that need approval will show here."
            />
          ) : (
            pending.map(p => renderParticipantCard(p, 'pending'))
          )}
        </View>
      ) : null}

      <View style={styles.block}>
        <Text style={[styles.sectionTitle, {color: theme.text}]}>
          Confirmed participants
        </Text>
        {confirmed.length === 0 ? (
          <EmptyState
            title="No confirmed participants"
            message="Accepted members will appear here."
          />
        ) : (
          confirmed.map(p => renderParticipantCard(p, 'confirmed'))
        )}
      </View>

      {canReviewRegistrations && rejected.length > 0 ? (
        <View style={styles.block}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>
            Rejected
          </Text>
          {rejected.map(p => renderParticipantCard(p, 'rejected'))}
        </View>
      ) : null}

      {!canReviewRegistrations && totalVisible === 0 ? (
        <EmptyState
          title="No participants yet"
          message="Registered members will appear here."
        />
      ) : null}

      {canPermanentDelete ? (
        <View
          style={[
            styles.deleteBox,
            {borderColor: theme.border, backgroundColor: theme.surface},
          ]}>
          <Text style={[styles.deleteTitle, {color: theme.text}]}>
            Permanent deletion
          </Text>
          <Text style={[styles.deleteBody, {color: theme.textMuted}]}>
            Permanently removes this drive and its registrations, attendance,
            ratings and media. Member accounts are not affected. This cannot be
            undone.
          </Text>
          <Button
            label="Delete trip permanently"
            variant="secondary"
            onPress={onPermanentDelete}
            loading={deleting}
            style={{marginTop: spacing.md}}
          />
        </View>
      ) : null}

      <BusyOverlay
        visible={Boolean(busyId) || Boolean(reviewBusyId) || deleting}
        message={
          deleting
            ? 'Deleting drive…'
            : reviewBusyId
              ? 'Updating registration…'
              : 'Updating attendance…'
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {...typography.label},
  title: {...typography.hero, fontSize: 26, marginTop: spacing.xs},
  sub: {
    ...typography.subtitle,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  block: {marginBottom: spacing.lg},
  sectionTitle: {
    ...typography.title,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  row: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  info: {flex: 1},
  name: {...typography.title, fontSize: 16},
  meta: {...typography.caption, marginTop: 2},
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  btn: {flexGrow: 1, minWidth: '30%'},
  deleteBox: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  deleteTitle: {...typography.title, fontSize: 16},
  deleteBody: {...typography.caption, marginTop: spacing.xs},
});
