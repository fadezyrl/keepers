import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {showAlert, showConfirm, showToast} from '../../alerts';
import {
  BackHeader,
  BusyOverlay,
  Button,
  EmptyState,
  ErrorState,
  ImagePickerSheet,
  LoadingState,
  RemoteImage,
  Screen,
  VideoPlayer,
} from '../../components';
import {
  attachTripMediaRequest,
  deleteTripMediaRequest,
  updateTripRequest,
} from '../../api/keepersApi';
import {invalidateAfterMarshallMutation, useCacheSession} from '../../cache';
import {useApp} from '../../context/AppContext';
import {useCachedTrip} from '../../hooks/useCachedQueries';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';
import {TripMediaItem} from '../../types';
import {uploadTripMedia} from '../../utils/mediaUpload';

type Props = NativeStackScreenProps<RootStackParamList, 'ManageTripMedia'>;

type PickerMode = 'cover' | 'gallery' | 'video' | null;

export function ManageTripMediaScreen({navigation, route}: Props) {
  const theme = useThemeColors();
  const {upsertLocalTrip, user, hasPermission} = useApp();
  const {queryClient, activeUserId} = useCacheSession();
  const tripQuery = useCachedTrip(route.params.tripId);
  const trip = tripQuery.data || null;
  const loading = tripQuery.isLoading && !trip;
  const error =
    tripQuery.isError && !trip
      ? tripQuery.error instanceof Error
        ? tripQuery.error.message
        : 'Unable to load drive media.'
      : null;

  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [busyMessage, setBusyMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const canManage =
    Boolean(trip) &&
    (hasPermission('trips.manage') ||
      (hasPermission('trips.manage_own') && trip?.organizerId === user.id));

  useEffect(() => {
    if (tripQuery.data) {
      upsertLocalTrip(tripQuery.data);
    }
  }, [tripQuery.data, upsertLocalTrip]);

  const galleryItems = useMemo(
    () =>
      (trip?.mediaItems || []).filter(item => item.mediaType === 'image') as TripMediaItem[],
    [trip?.mediaItems],
  );
  const videoItems = useMemo(
    () =>
      (trip?.mediaItems || []).filter(item => item.mediaType === 'video') as TripMediaItem[],
    [trip?.mediaItems],
  );

  useEffect(() => {
    if (videoItems.length === 0) {
      setActiveVideoId(null);
      return;
    }
    setActiveVideoId(prev =>
      prev && videoItems.some(item => item.id === prev)
        ? prev
        : videoItems[0].id,
    );
  }, [videoItems]);

  const refresh = async () => {
    const next = await tripQuery.refetch();
    if (next.data) {
      upsertLocalTrip(next.data);
    }
  };

  const afterMutation = async () => {
    const uid = user.id || activeUserId;
    if (uid && trip) {
      await invalidateAfterMarshallMutation(queryClient, uid, trip.id);
    }
    await refresh();
  };

  const onPick = async (file: {uri: string; name: string; type: string}) => {
    if (!trip || !pickerMode) return;
    const mode = pickerMode;
    setPickerMode(null);
    setBusyMessage(
      mode === 'cover'
        ? 'Uploading cover…'
        : mode === 'video'
          ? 'Uploading video…'
          : 'Uploading photo…',
    );
    try {
      const url = await uploadTripMedia(file);
      if (mode === 'cover') {
        const updated = await updateTripRequest(trip.id, {coverImage: url});
        upsertLocalTrip(updated);
      } else {
        await attachTripMediaRequest(trip.id, {
          url,
          mediaType: mode === 'video' ? 'video' : 'image',
        });
      }
      await afterMutation();
      showToast({
        type: 'success',
        message:
          mode === 'cover'
            ? 'Cover photo updated'
            : mode === 'video'
              ? 'Highlight video added'
              : 'Gallery photo added',
      });
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as {message: string}).message)
          : 'Upload failed.';
      showAlert({
        type: 'error',
        title: 'Upload failed',
        message,
        buttons: [
          {label: 'Dismiss', variant: 'secondary'},
          {
            label: 'Retry',
            variant: 'primary',
            onPress: () => setPickerMode(mode),
          },
        ],
      });
    } finally {
      setBusyMessage(null);
    }
  };

  const onDeleteMedia = (item: TripMediaItem) => {
    if (!trip || deletingId) return;
    void showConfirm({
      title: item.mediaType === 'video' ? 'Delete video?' : 'Delete photo?',
      message: 'This removes the media from this drive. This cannot be undone.',
      cancelText: 'Keep',
      confirmText: 'Delete',
      destructive: true,
      onConfirm: async () => {
        setDeletingId(item.id);
        setBusyMessage('Deleting media…');
        try {
          await deleteTripMediaRequest(trip.id, item.id);
          await afterMutation();
          showToast({type: 'success', message: 'Media deleted'});
        } catch (err) {
          const message =
            err && typeof err === 'object' && 'message' in err
              ? String((err as {message: string}).message)
              : 'Unable to delete media.';
          showAlert({type: 'error', title: 'Delete failed', message});
        } finally {
          setDeletingId(null);
          setBusyMessage(null);
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
          onAction={() => tripQuery.refetch()}
        />
      </Screen>
    );
  }

  if (!canManage) {
    return (
      <Screen>
        <BackHeader onBack={() => navigation.goBack()} />
        <Text style={[styles.title, {color: theme.text}]}>Not authorized</Text>
        <Text style={[styles.sub, {color: theme.textMuted}]}>
          Only the drive organizer or an Admin can manage trip media.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen scroll onRefresh={refresh}>
      <BackHeader onBack={() => navigation.goBack()} />
      <Text style={[styles.kicker, {color: theme.textMuted}]}>Marshall</Text>
      <Text style={[styles.title, {color: theme.text}]}>Trip media</Text>
      <Text style={[styles.sub, {color: theme.textMuted}]}>{trip.title}</Text>

      <View
        style={[
          styles.section,
          {borderColor: theme.border, backgroundColor: theme.surface},
        ]}>
        <Text style={[styles.sectionTitle, {color: theme.text}]}>
          Cover photo
        </Text>
        {trip.coverImage ? (
          <RemoteImage uri={trip.coverImage} style={styles.cover} />
        ) : (
          <EmptyState
            title="No cover photo"
            message="Add a cover image members see on this drive."
          />
        )}
        <Button
          label={trip.coverImage ? 'Replace cover' : 'Add cover'}
          onPress={() => setPickerMode('cover')}
          style={{marginTop: spacing.md}}
        />
      </View>

      <View
        style={[
          styles.section,
          {borderColor: theme.border, backgroundColor: theme.surface},
        ]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>
            Gallery
          </Text>
          <Button
            label="Add photos"
            variant="secondary"
            onPress={() => setPickerMode('gallery')}
            style={styles.compactBtn}
          />
        </View>
        {galleryItems.length === 0 ? (
          <EmptyState
            title="No gallery photos"
            message="Upload photos from the drive to share with members."
          />
        ) : (
          galleryItems.map(item => (
            <View key={item.id} style={styles.mediaRow}>
              <Pressable
                onPress={() =>
                  navigation.navigate('GalleryViewer', {
                    images: galleryItems.map(g => g.url),
                    index: galleryItems.findIndex(g => g.id === item.id),
                  })
                }>
                <RemoteImage uri={item.url} style={styles.thumb} />
              </Pressable>
              <Button
                label="Delete"
                variant="ghost"
                onPress={() => onDeleteMedia(item)}
                loading={deletingId === item.id}
                style={styles.compactBtn}
              />
            </View>
          ))
        )}
      </View>

      <View
        style={[
          styles.section,
          {borderColor: theme.border, backgroundColor: theme.surface},
        ]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>
            Highlight videos
          </Text>
          <Button
            label="Add video"
            variant="secondary"
            onPress={() => setPickerMode('video')}
            style={styles.compactBtn}
          />
        </View>
        {videoItems.length === 0 ? (
          <EmptyState
            title="No highlight videos"
            message="Attach MP4, MOV or WebM clips for this drive."
          />
        ) : (
          videoItems.map(item => (
            <View key={item.id} style={styles.videoBlock} collapsable={false}>
              <VideoPlayer
                uri={item.url}
                label="Highlight video"
                active={activeVideoId === item.id}
                onActivate={() => setActiveVideoId(item.id)}
              />
              <Button
                label="Delete"
                variant="ghost"
                onPress={() => onDeleteMedia(item)}
                loading={deletingId === item.id}
                style={{marginTop: spacing.sm}}
              />
            </View>
          ))
        )}
      </View>

      <ImagePickerSheet
        visible={pickerMode === 'cover' || pickerMode === 'gallery'}
        title={pickerMode === 'cover' ? 'Cover photo' : 'Gallery photo'}
        mediaType="photo"
        uploading={Boolean(busyMessage)}
        onSelect={onPick}
        onClose={() => setPickerMode(null)}
      />
      <ImagePickerSheet
        visible={pickerMode === 'video'}
        title="Highlight video"
        mediaType="video"
        uploading={Boolean(busyMessage)}
        onSelect={onPick}
        onClose={() => setPickerMode(null)}
      />

      <BusyOverlay visible={Boolean(busyMessage)} message={busyMessage || ''} />
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
  section: {
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {...typography.title, fontSize: 16},
  cover: {width: '100%', height: 180, marginTop: spacing.sm},
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  thumb: {width: 96, height: 72},
  compactBtn: {minWidth: 96},
  videoBlock: {marginTop: spacing.md},
});
