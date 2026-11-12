import React from 'react';
import {StyleSheet, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Icon, IconName} from '../components';
import {AboutScreen} from '../screens/about/AboutScreen';
import {HomeScreen} from '../screens/home/HomeScreen';
import {SettingsScreen} from '../screens/settings/SettingsScreen';
import {TripsScreen} from '../screens/trips/TripsScreen';
import {colors, spacing, useThemeColors} from '../theme';
import {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const icons: Record<keyof MainTabParamList, IconName> = {
  Home: 'home',
  Trips: 'trips',
  Settings: 'settings',
  About: 'about',
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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Trips" component={TripsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
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
