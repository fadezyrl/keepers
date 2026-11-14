import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ForgotPasswordScreen} from '../screens/auth/ForgotPasswordScreen';
import {LoginScreen} from '../screens/auth/LoginScreen';
import {ResetPasswordScreen} from '../screens/auth/ResetPasswordScreen';
import {SignupScreen} from '../screens/auth/SignupScreen';
import {useApp} from '../context/AppContext';
import {colors} from '../theme';
import {AuthStackParamList} from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  const {recoveryAccessToken} = useApp();

  return (
    <Stack.Navigator
      initialRouteName={recoveryAccessToken ? 'ResetPassword' : 'Login'}
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: colors.ivory},
        animation: 'fade',
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        initialParams={
          recoveryAccessToken
            ? {accessToken: recoveryAccessToken}
            : undefined
        }
      />
    </Stack.Navigator>
  );
}
