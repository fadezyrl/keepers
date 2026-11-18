import React from 'react';
import {StyleSheet, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon, IconName} from '../components';
import {GalleryScreen} from '../screens/gallery/GalleryScreen';
import {HomeScreen} from '../screens/home/HomeScreen';
import {MembersDirectoryScreen} from '../screens/settings/MembersDirectoryScreen';
import {SettingsScreen} from '../screens/settings/SettingsScreen';
import {colors, spacing, useThemeColors} from '../theme';
import {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const icons: Record<keyof MainTabParamList, IconName> = {
  Discover: 'home',
  Members: 'users',
  Gallery: 'camera',
  Profile: 'user',
};

export function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.dark ? colors.ivory : colors.ivory,
        tabBarInactiveTintColor: theme.dark ? colors.greige : colors.stone,
        tabBarLabelStyle: {
          fontSize: 9,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          fontWeight: '500',
          marginBottom: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          left: spacing.md,
          right: spacing.md,
          bottom: Math.max(insets.bottom, 10),
          height: 64,
          borderRadius: 2,
          backgroundColor: colors.black,
          borderTopWidth: 0,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: theme.dark
            ? 'rgba(243,240,234,0.22)'
            : 'rgba(243,240,234,0.14)',
          elevation: 0,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarIcon: ({color, focused}) => (
          <View style={[styles.iconWrap, focused && styles.iconActive]}>
            <Icon name={icons[route.name]} size={18} color={color} />
          </View>
        ),
      })}>
      <Tab.Screen
        name="Discover"
        component={HomeScreen}
        options={{tabBarLabel: 'Discover'}}
      />
      <Tab.Screen
        name="Members"
        component={MembersDirectoryScreen}
        options={{tabBarLabel: 'Members'}}
      />
      <Tab.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{tabBarLabel: 'Gallery'}}
      />
      <Tab.Screen
        name="Profile"
        component={SettingsScreen}
        options={{tabBarLabel: 'Profile'}}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    opacity: 1,
  },
});
