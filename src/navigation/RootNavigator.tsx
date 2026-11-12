import React from 'react';
import {View} from 'react-native';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {LoadingState, Screen} from '../components';
import {useApp} from '../context/AppContext';
import {
  ClubBrochureScreen,
  ClubProtocolsScreen,
  SafetyBriefingScreen,
} from '../screens/about/DocumentScreen';
import {SplashScreen} from '../screens/auth/SplashScreen';
import {GalleryViewerScreen} from '../screens/gallery/GalleryViewerScreen';
import {LegalScreen} from '../screens/legal/LegalScreen';
import {NotificationsScreen} from '../screens/notifications/NotificationsScreen';
import {CreateDriveScreen} from '../screens/marshall/CreateDriveScreen';
import {DriveParticipantsScreen} from '../screens/marshall/DriveParticipantsScreen';
import {MarshallHubScreen} from '../screens/marshall/MarshallHubScreen';
import {MarshallUpgradesScreen} from '../screens/marshall/MarshallUpgradesScreen';
import {RateMemberScreen} from '../screens/marshall/RateMemberScreen';
import {ChangePasswordScreen} from '../screens/settings/ChangePasswordScreen';
import {DisplayModeScreen} from '../screens/settings/DisplayModeScreen';
import {EditProfileScreen} from '../screens/settings/EditProfileScreen';
import {MemberProfileScreen} from '../screens/settings/MemberProfileScreen';
import {MembersDirectoryScreen} from '../screens/settings/MembersDirectoryScreen';
import {RegistrationConfirmScreen} from '../screens/trips/RegistrationConfirmScreen';
import {TripDetailsScreen} from '../screens/trips/TripDetailsScreen';
import {useThemeColors} from '../theme';
import {AuthNavigator} from './AuthNavigator';
import {MainTabNavigator} from './MainTabNavigator';
import {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppStack() {
  const theme = useThemeColors();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: theme.bg},
        animation: 'fade_from_bottom',
      }}>
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
      <Stack.Screen
        name="RegistrationConfirm"
        component={RegistrationConfirmScreen}
      />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen
        name="GalleryViewer"
        component={GalleryViewerScreen}
        options={{animation: 'fade', presentation: 'fullScreenModal'}}
      />
      <Stack.Screen name="Legal" component={LegalScreen} />
      <Stack.Screen
        name="ForgotPasswordModal"
        component={ChangePasswordScreen}
      />
      <Stack.Screen name="MembersDirectory" component={MembersDirectoryScreen} />
      <Stack.Screen name="MemberProfile" component={MemberProfileScreen} />
      <Stack.Screen name="DisplayMode" component={DisplayModeScreen} />
      <Stack.Screen
        name="ClubProtocols"
        component={ClubProtocolsScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="SafetyBriefing"
        component={SafetyBriefingScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="ClubBrochure"
        component={ClubBrochureScreen}
        options={{animation: 'slide_from_right'}}
      />
      <Stack.Screen name="MarshallHub" component={MarshallHubScreen} />
      <Stack.Screen name="CreateDrive" component={CreateDriveScreen} />
      <Stack.Screen
        name="DriveParticipants"
        component={DriveParticipantsScreen}
      />
      <Stack.Screen name="RateMember" component={RateMemberScreen} />
      <Stack.Screen
        name="MarshallUpgrades"
        component={MarshallUpgradesScreen}
      />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  const {bootstrapped, authMode, displayMode} = useApp();
  const theme = useThemeColors();

  if (!bootstrapped && authMode === 'splash') {
    return <SplashScreen />;
  }

  if (!bootstrapped) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  const navTheme = {
    ...DefaultTheme,
    dark: displayMode === 'dark',
    colors: {
      ...DefaultTheme.colors,
      background: theme.bg,
      card: theme.bg,
      text: theme.text,
      border: theme.border,
      primary: theme.inverse,
    },
  };

  return (
    <View style={{flex: 1, backgroundColor: theme.bg}}>
      <NavigationContainer theme={navTheme}>
        {authMode === 'app' ? <AppStack /> : <AuthNavigator />}
      </NavigationContainer>
    </View>
  );
}
