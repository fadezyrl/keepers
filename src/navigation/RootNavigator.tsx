import React, {useEffect, useRef} from 'react';
import {Linking, View} from 'react-native';
import {
  DefaultTheme,
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {LoadingState, Screen} from '../components';
import {linkingConfig, parseRecoveryParams} from '../config/linking';
import {useApp} from '../context/AppContext';
import {setPushNavigationRef} from '../notifications/navigationFromPush';
import {AboutScreen} from '../screens/about/AboutScreen';
import {
  ClubBrochureScreen,
  ClubProtocolsScreen,
  SafetyBriefingScreen,
} from '../screens/about/DocumentScreen';
import {SplashScreen} from '../screens/auth/SplashScreen';
import {GalleryViewerScreen} from '../screens/gallery/GalleryViewerScreen';
import {LegalScreen} from '../screens/legal/LegalScreen';
import {CreateDriveScreen} from '../screens/marshall/CreateDriveScreen';
import {DriveParticipantsScreen} from '../screens/marshall/DriveParticipantsScreen';
import {ManageTripMediaScreen} from '../screens/marshall/ManageTripMediaScreen';
import {ChatInboxScreen} from '../screens/chat/ChatInboxScreen';
import {ChatThreadScreen} from '../screens/chat/ChatThreadScreen';
import {MarshallHubScreen} from '../screens/marshall/MarshallHubScreen';
import {MarshallUpgradesScreen} from '../screens/marshall/MarshallUpgradesScreen';
import {RateMemberScreen} from '../screens/marshall/RateMemberScreen';
import {NotificationsScreen} from '../screens/notifications/NotificationsScreen';
import {ChangePasswordScreen} from '../screens/settings/ChangePasswordScreen';
import {DisplayModeScreen} from '../screens/settings/DisplayModeScreen';
import {EditProfileScreen} from '../screens/settings/EditProfileScreen';
import {NotificationPreferencesScreen} from '../screens/settings/NotificationPreferencesScreen';
import {MemberProfileScreen} from '../screens/settings/MemberProfileScreen';
import {MembersDirectoryScreen} from '../screens/settings/MembersDirectoryScreen';
import {MyAdventureHistoryScreen} from '../screens/progress/MyAdventureHistoryScreen';
import {MyProgressScreen} from '../screens/progress/MyProgressScreen';
import {MyTripPerformanceScreen} from '../screens/progress/MyTripPerformanceScreen';
import {RegistrationConfirmScreen} from '../screens/trips/RegistrationConfirmScreen';
import {TripDetailsScreen} from '../screens/trips/TripDetailsScreen';
import {TripsScreen} from '../screens/trips/TripsScreen';
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
      <Stack.Screen name="Trips" component={TripsScreen} />
      <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
      <Stack.Screen
        name="RegistrationConfirm"
        component={RegistrationConfirmScreen}
      />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen
        name="NotificationPreferences"
        component={NotificationPreferencesScreen}
      />
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
      <Stack.Screen name="About" component={AboutScreen} />
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
      <Stack.Screen
        name="ManageTripMedia"
        component={ManageTripMediaScreen}
      />
      <Stack.Screen name="ChatInbox" component={ChatInboxScreen} />
      <Stack.Screen name="ChatThread" component={ChatThreadScreen} />
      <Stack.Screen name="RateMember" component={RateMemberScreen} />
      <Stack.Screen name="MarshallUpgrades" component={MarshallUpgradesScreen} />
      <Stack.Screen name="MyProgress" component={MyProgressScreen} />
      <Stack.Screen
        name="MyAdventureHistory"
        component={MyAdventureHistoryScreen}
      />
      <Stack.Screen
        name="MyTripPerformance"
        component={MyTripPerformanceScreen}
      />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  const {
    bootstrapped,
    authMode,
    displayMode,
    recoveryAccessToken,
    setRecoveryAccessToken,
    setOffline,
  } = useApp();
  const theme = useThemeColors();
  const navRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    setPushNavigationRef(navRef as any);
    return () => setPushNavigationRef(null);
  }, []);

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) return;
      const {accessToken, type, error, errorDescription} =
        parseRecoveryParams(url);
      if (error) {
        // Keep user in auth flow; Reset screen will show a clear message.
        setRecoveryAccessToken(null);
        return;
      }
      const isRecovery =
        type === 'recovery' ||
        !type ||
        url.includes('reset-password') ||
        url.includes('mobile-reset');
      if (accessToken && isRecovery) {
        setRecoveryAccessToken(accessToken);
      }
      void errorDescription;
    };

    Linking.getInitialURL()
      .then(url => handleUrl(url ?? null))
      .catch(() => undefined);
    const sub = Linking.addEventListener('url', ({url}) => handleUrl(url));
    return () => sub.remove();
  }, [setRecoveryAccessToken, setOffline]);

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
      <NavigationContainer
        ref={navRef}
        theme={navTheme}
        linking={linkingConfig}>
        {authMode === 'app' ? (
          <AppStack />
        ) : (
          <AuthNavigator
            key={
              // Remount auth stack when a recovery token arrives so ResetPassword opens.
              recoveryAccessToken ? `reset-${recoveryAccessToken.slice(0, 12)}` : 'auth'
            }
          />
        )}
      </NavigationContainer>
    </View>
  );
}
