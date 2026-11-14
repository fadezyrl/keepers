import React, {useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {showAlert, showConfirm} from '../alerts';
import {spacing, typography, useThemeColors} from '../theme';
import {Button} from './Button';

interface ImagePickerSheetProps {
  visible: boolean;
  title: string;
  onSelect: (
    file: {uri: string; name: string; type: string},
  ) => void | Promise<void>;
  onClose: () => void;
  uploading?: boolean;
  /** photo (default), video, or mixed for cover/promo media */
  mediaType?: 'photo' | 'video' | 'mixed';
}

async function ensureCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const permission = PermissionsAndroid.PERMISSIONS.CAMERA;
  const alreadyGranted = await PermissionsAndroid.check(permission);
  if (alreadyGranted) {
    return true;
  }

  const result = await PermissionsAndroid.request(permission, {
    title: 'Camera permission',
    message: 'Keepers needs camera access to capture media.',
    buttonPositive: 'Allow',
    buttonNegative: 'Deny',
  });

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

async function ensureVideoLibraryPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const permission =
    Platform.Version >= 33
      ? 'android.permission.READ_MEDIA_VIDEO'
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

  const alreadyGranted = await PermissionsAndroid.check(
    permission as typeof PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
  );
  if (alreadyGranted) {
    return true;
  }

  const result = await PermissionsAndroid.request(
    permission as typeof PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    {
      title: 'Video access',
      message: 'Keepers needs access to your videos to upload trip highlights.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

function showCameraPermissionAlert(forVideo: boolean) {
  void showConfirm({
    type: 'warning',
    title: 'Camera permission needed',
    message: forVideo
      ? 'Enable camera access in Settings to record a video.'
      : 'Enable camera access in Settings to take a photo.',
    cancelText: 'Cancel',
    confirmText: 'Open Settings',
    onConfirm: () => {
      Linking.openSettings();
    },
  });
}

export function ImagePickerSheet({
  visible,
  title,
  onSelect,
  onClose,
  uploading = false,
  mediaType = 'photo',
}: ImagePickerSheetProps) {
  const theme = useThemeColors();
  const [busy, setBusy] = useState(false);
  const isVideo = mediaType === 'video';
  const isMixed = mediaType === 'mixed';

  const handleAsset = async (
    response: Awaited<ReturnType<typeof launchImageLibrary>>,
  ) => {
    if (response.didCancel) {
      setBusy(false);
      return;
    }
    if (response.errorCode) {
      setBusy(false);
      if (response.errorCode === 'permission') {
        showCameraPermissionAlert(isVideo);
        return;
      }
      showAlert({
        type: 'error',
        title: isVideo ? 'Video' : 'Camera',
        message: response.errorMessage || 'Could not open the camera.',
      });
      return;
    }
    const asset = response.assets?.[0];
    if (!asset?.uri) {
      setBusy(false);
      return;
    }
    const fallbackExt = isVideo ? 'mp4' : 'jpg';
    const fallbackMime = isVideo ? 'video/mp4' : 'image/jpeg';
    const name =
      asset.fileName ||
      `${isVideo ? 'video' : 'photo'}-${Date.now()}.${
        (asset.type || fallbackMime).split('/')[1] || fallbackExt
      }`;
    try {
      setBusy(true);
      await onSelect({
        uri: asset.uri,
        name,
        type: asset.type || fallbackMime,
      });
    } finally {
      setBusy(false);
    }
  };

  const pickLibrary = async () => {
    setBusy(true);
    try {
      if (isVideo || isMixed) {
        const allowed = await ensureVideoLibraryPermission();
        if (!allowed) {
          setBusy(false);
          void showConfirm({
            type: 'warning',
            title: 'Video access needed',
            message: 'Enable video access in Settings to upload highlight clips.',
            cancelText: 'Cancel',
            confirmText: 'Open Settings',
            onConfirm: () => {
              Linking.openSettings();
            },
          });
          return;
        }
      }
      const response = await launchImageLibrary({
        mediaType,
        selectionLimit: 1,
        quality: 0.8,
      });
      await handleAsset(response);
    } catch {
      setBusy(false);
      showAlert({
        type: 'error',
        title: isVideo ? 'Videos' : 'Photos',
        message: isVideo
          ? 'Could not open the video library.'
          : 'Could not open the photo library.',
      });
    }
  };

  const pickCamera = async () => {
    setBusy(true);
    try {
      const allowed = await ensureCameraPermission();
      if (!allowed) {
        setBusy(false);
        showCameraPermissionAlert(isVideo);
        return;
      }

      if ((isVideo || isMixed) && Platform.OS === 'android') {
        const mic = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;
        const micOk = await PermissionsAndroid.check(mic);
        if (!micOk) {
          await PermissionsAndroid.request(mic, {
            title: 'Microphone permission',
            message: 'Keepers needs the mic to record trip highlight videos.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          });
        }
      }

      onClose();
      setBusy(false);
      await new Promise<void>(resolve => setTimeout(resolve, 350));

      const response = await launchCamera({
        mediaType: isVideo || isMixed ? 'video' : 'photo',
        cameraType: 'back',
        quality: 0.8,
        saveToPhotos: false,
        ...(isVideo || isMixed
          ? {
              videoQuality: 'high' as const,
              durationLimit: 180,
            }
          : {}),
      });
      await handleAsset(response);
    } catch {
      setBusy(false);
      showAlert({
        type: 'error',
        title: isVideo ? 'Video' : 'Camera',
        message: isVideo
          ? 'Could not open the video recorder.'
          : 'Could not open the camera.',
      });
    }
  };

  const locked = busy || uploading;
  const libraryLabel = isVideo
    ? 'Choose video from library'
    : isMixed
      ? 'Choose from library'
      : 'Choose from library';
  const cameraLabel = isVideo
    ? 'Record video'
    : isMixed
      ? 'Record video'
      : 'Take photo';
  const helpText = isVideo
    ? 'Pick a clip from your library or record a new highlight video. Files upload securely to Keepers storage.'
    : isMixed
      ? 'Choose a photo or video from your library, or record a new clip.'
      : 'Choose a photo from your library or take a new one. Images upload securely to Keepers storage.';
  const uploadingTitle = isVideo ? 'Uploading video…' : 'Uploading photo…';
  const uploadingBody = isVideo
    ? 'Please wait while we save your video.'
    : 'Please wait while we save your image.';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={locked ? undefined : onClose}>
        <Pressable
          style={[
            styles.sheet,
            {backgroundColor: theme.surface, borderColor: theme.border},
          ]}
          onPress={e => e.stopPropagation()}>
          <Text style={[styles.title, {color: theme.text}]}>{title}</Text>
          <Text style={[styles.sub, {color: theme.textMuted}]}>{helpText}</Text>

          {locked ? (
            <View style={styles.loading}>
              <ActivityIndicator color={theme.text} size="large" />
              <Text style={[styles.loadingTitle, {color: theme.text}]}>
                {uploading ? uploadingTitle : 'Opening…'}
              </Text>
              <Text style={[styles.loadingText, {color: theme.textMuted}]}>
                {uploading
                  ? uploadingBody
                  : isVideo
                    ? 'Preparing your recorder or library.'
                    : 'Preparing your camera or library.'}
              </Text>
            </View>
          ) : (
            <>
              <Button label={libraryLabel} onPress={pickLibrary} />
              <Button
                label={cameraLabel}
                variant="secondary"
                onPress={pickCamera}
                style={{marginTop: spacing.sm}}
              />
              <Button
                label="Cancel"
                variant="ghost"
                onPress={onClose}
                style={{marginTop: spacing.sm}}
              />
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 17, 16, 0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {...typography.title, fontSize: 18},
  sub: {...typography.caption, marginTop: spacing.xs, marginBottom: spacing.md},
  loading: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  loadingTitle: {...typography.title, fontSize: 16, textAlign: 'center'},
  loadingText: {...typography.caption, textAlign: 'center'},
});
