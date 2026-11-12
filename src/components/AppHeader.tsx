import React from 'react';
import {Linking, Pressable, StyleSheet, View, ViewStyle} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useApp} from '../context/AppContext';
import {RootStackParamList} from '../navigation/types';
import {spacing, useThemeColors} from '../theme';
import {BrandLogo} from './BrandLogo';
import {Icon} from './Icon';

const INSTAGRAM_URL = 'https://www.instagram.com/keepersadventure/';

interface AppHeaderProps {
  style?: ViewStyle;
}

export function AppHeader({style}: AppHeaderProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useThemeColors();
  const {unreadCount} = useApp();

  return (
    <View style={[styles.header, {backgroundColor: theme.bg}, style]}>
      <BrandLogo
        size="sm"
        showTagline={false}
        tone={theme.dark ? 'dark' : 'light'}
        style={styles.logo}
      />
      <View style={styles.headerRight}>
        <Pressable
          onPress={() => Linking.openURL(INSTAGRAM_URL)}
          hitSlop={12}
          accessibilityRole="link"
          accessibilityLabel="Open Instagram">
          <Icon name="instagram" size={20} color={theme.text} />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('Notifications')}
          hitSlop={12}
          style={styles.bellWrap}
          accessibilityRole="button"
          accessibilityLabel="Notifications">
          <Icon name="bell" size={20} color={theme.text} />
          {unreadCount > 0 ? (
            <View style={[styles.dot, {backgroundColor: theme.text}]} />
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    alignItems: 'flex-start',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  bellWrap: {
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
