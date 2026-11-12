import React, {useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {useThemeColors} from '../theme';
import {Icon} from './Icon';

interface AvatarProps {
  uri?: string;
  size?: number;
}

export function Avatar({uri, size = 40}: AvatarProps) {
  const theme = useThemeColors();
  const [failed, setFailed] = useState(false);

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.bgMuted,
          borderColor: theme.border,
        },
      ]}>
      {uri && !failed ? (
        <Image
          source={{uri}}
          onError={() => setFailed(true)}
          style={{width: size, height: size, borderRadius: size / 2}}
        />
      ) : (
        <Icon name="user" size={size * 0.45} color={theme.textMuted} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
