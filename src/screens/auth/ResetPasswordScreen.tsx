import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {showAlert} from '../../alerts';
import {Button, Input, Screen} from '../../components';
import {useApp} from '../../context/AppContext';
import {AuthStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';
import {FieldErrors, validateResetPassword} from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({navigation, route}: Props) {
  const theme = useThemeColors();
  const {completePasswordReset, recoveryAccessToken} = useApp();
  const accessToken = useMemo(
    () => route.params?.accessToken || recoveryAccessToken || '',
    [route.params?.accessToken, recoveryAccessToken],
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!accessToken) {
      showAlert({
        type: 'warning',
        title: 'Invalid reset link',
        message:
          'Open the password reset link from your email on this device.',
      });
      return;
    }
    const nextErrors = validateResetPassword(password, confirmPassword);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }
    setLoading(true);
    try {
      await completePasswordReset(accessToken, password);
      showAlert({
        type: 'success',
        title: 'Password updated',
        message: 'You can now sign in with your new password.',
        buttonText: 'Sign in',
        onClose: () => navigation.navigate('Login'),
      });
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Reset failed',
        message:
          error instanceof Error
            ? error.message
            : 'Please request a new reset link.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll refreshable={false}>
      <View style={styles.top}>
        <Text style={[styles.kicker, {color: theme.textMuted}]}>Security</Text>
        <Text style={[styles.heading, {color: theme.text}]}>
          Choose a new password
        </Text>
        <Text style={[styles.sub, {color: theme.textMuted}]}>
          {accessToken
            ? 'Set a new password for your Keepers account.'
            : 'This screen opens from the reset link in your email.'}
        </Text>
      </View>

      <Input
        label="New password"
        icon="lock"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        placeholder="At least 8 characters"
      />
      <Input
        label="Confirm password"
        icon="lock"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={errors.confirmPassword}
        placeholder="Repeat password"
      />

      <Button label="Update password" onPress={onSubmit} loading={loading} />
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
