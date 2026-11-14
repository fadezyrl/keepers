import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ImageStyle,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {colors} from '../theme';

interface RemoteImageProps {
  uri: string;
  style?: ImageStyle | ViewStyle;
}

/**
 * Remote media with HTTP disk cache reuse (cache: 'force-cache').
 * Stable URLs keep previously downloaded assets; URL changes force refresh.
 */
export function RemoteImage({uri, style}: RemoteImageProps) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFailed(false);
  }, [uri]);

  if (!uri) {
    return <View style={[styles.wrap, style, styles.fallback]} />;
  }

  return (
    <View style={[styles.wrap, style]}>
      {!failed ? (
        <Image
          key={uri}
          source={{
            uri,
            cache: 'force-cache',
          }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setFailed(true);
            setLoading(false);
          }}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]} />
      )}
      {loading ? (
        <View style={[StyleSheet.absoluteFill, styles.loader]}>
          <ActivityIndicator color={colors.stone} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: colors.cream,
  },
  loader: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(243,240,234,0.35)',
  },
  fallback: {
    backgroundColor: colors.greige,
  },
});
