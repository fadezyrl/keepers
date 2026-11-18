import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {showAlert} from '../../alerts';
import {Button, Input, Screen} from '../../components';
import {STORAGE_KEYS} from '../../config/api';
import {useApp} from '../../context/AppContext';
import {AuthStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';
import {FieldErrors, validateForgotPassword} from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({navigation, route}: Props) {
  const theme = useThemeColors();
  const {requestPasswordReset} = useApp();
  const [email, setEmail] = useState(route.params?.email?.trim() || '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route.params?.email?.trim()) {
      setEmail(route.params.email.trim());
      return;
    }
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEYS.lastLoginEmail)
      .then(saved => {
        if (!cancelled && saved) {
          setEmail(saved);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [route.params?.email]);

  const onSubmit = async () => {
    const nextErrors = validateForgotPassword(email);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      showAlert({
        type: 'info',
        title: 'Check your email',
        message:
          'If an account exists for this address, a password reset link has been sent. Open the link on this device to choose a new password.',
        buttonText: 'Back to Sign In',
        onClose: () => navigation.navigate('Login'),
      });
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Reset failed',
        message:
          error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll refreshable={false}>
      <View style={styles.top}>
        <Text style={[styles.kicker, {color: theme.textMuted}]}>
          Account recovery
        </Text>
        <Text style={[styles.heading, {color: theme.text}]}>Reset password</Text>
        <Text style={[styles.sub, {color: theme.textMuted}]}>
          Confirm your membership email. We will send a secure reset link. Open
          it on this phone — if a browser page appears, tap “Open Keepers app”.
        </Text>
      </View>

      <Input
        label="Email"
        icon="mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        placeholder="you@domain.com"
      />

      <Button label="Send reset link" onPress={onSubmit} loading={loading} />
      <Button
        label="Back to Sign In"
        onPress={() => navigation.navigate('Login')}
        variant="ghost"
        style={styles.back}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  kicker: {...typography.label},
  heading: {...typography.hero, fontSize: 30, marginTop: spacing.xs},
  sub: {...typography.body, marginTop: spacing.sm, lineHeight: 22},
  back: {marginTop: spacing.sm},
});
