import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Video, {ViewType} from 'react-native-video';
import {spacing, typography, useThemeColors} from '../theme';

type Props = {
  uri: string;
  /** Accessibility label for the video. */
  label?: string;
  style?: ViewStyle;
  /**
   * Only one clip should be active at a time on Android — multiple simultaneous
   * surfaces bleed into each other (merged frames). Inactive clips stay paused
   * on their first frame.
   */
  active?: boolean;
  /** Called when user taps an inactive clip to make it the playing one. */
  onActivate?: () => void;
};

/**
 * Muted looping highlight reel.
 * Active clip autoplays; inactive clips freeze (avoids Android multi-surface merge).
 */
export function VideoPlayer({
  uri,
  label = 'Trip highlight video',
  style,
  active = true,
  onActivate,
}: Props) {
  const theme = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    setReloadKey(k => k + 1);
  }, []);

  if (!uri) return null;

  const body = (
    <View
      collapsable={false}
      renderToHardwareTextureAndroid
      needsOffscreenAlphaCompositing={Platform.OS === 'android'}
      accessibilityLabel={label}
      style={[
        styles.card,
        {borderColor: theme.border, backgroundColor: '#111110'},
        style,
      ]}>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry video"
            onPress={retry}
            style={styles.retryBtn}>
            <Text style={styles.retryLabel}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <View collapsable={false} style={styles.surface}>
          <Video
            key={`${uri}-${reloadKey}`}
            source={{
              uri,
              isNetwork: uri.startsWith('http'),
              shouldCache: true,
              bufferConfig: {
                minBufferMs: 500,
                maxBufferMs: 3000,
                bufferForPlaybackMs: 250,
                bufferForPlaybackAfterRebufferMs: 500,
              },
            }}
            style={styles.video}
            paused={!active}
            muted
            repeat={active}
            controls={false}
            resizeMode="cover"
            volume={0}
            rate={1}
            playInBackground={false}
            playWhenInactive={false}
            ignoreSilentSwitch="ignore"
            disableFocus
            preventsDisplaySleepDuringVideoPlayback={false}
            hideShutterView
            shutterColor="#111110"
            viewType={ViewType.TEXTURE}
            onLoadStart={() => setLoading(true)}
            onLoad={() => setLoading(false)}
            onReadyForDisplay={() => setLoading(false)}
            onBuffer={({isBuffering}) => {
              if (!isBuffering) setLoading(false);
            }}
            onError={() => {
              setLoading(false);
              setError('Video could not play. Tap retry.');
            }}
          />

          {loading ? (
            <View style={styles.loader} pointerEvents="none">
              <ActivityIndicator color="#fff" size="small" />
            </View>
          ) : null}

          {!active && !loading && !error ? (
            <View style={styles.inactiveHint} pointerEvents="none">
              <Text style={styles.inactiveHintText}>Tap to play</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );

  if (!active && onActivate && !error) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, tap to play`}
        onPress={onActivate}>
        {body}
      </Pressable>
    );
  }

  return body;
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 16 / 9,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.sm,
  },
  surface: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#111110',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loader: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  inactiveHint: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  inactiveHintText: {
    color: '#fff',
    ...typography.label,
    fontSize: 10,
  },
  errorBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    ...typography.subtitle,
  },
  retryBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  retryLabel: {
    color: '#fff',
    ...typography.label,
  },
});
