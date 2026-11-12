import React, {useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Input, Screen} from '../../components';
import {useApp} from '../../context/AppContext';
import {AuthStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';
import {
  FieldErrors,
  isValidPassword,
  required,
} from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({navigation, route}: Props) {
  const theme = useThemeColors();
  const {resetPassword} = useApp();
  const {email} = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const next: FieldErrors = {};
    if (!required(password) || !isValidPassword(password)) {
      next.password = 'Password must be at least 8 characters';
    }
    if (confirmPassword !== password) {
      next.confirmPassword = 'Passwords do not match';
    }
    setErrors(next);
    if (Object.keys(next).length) {
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, password);
      Alert.alert('Password updated', 'Sign in with your new password.', [
        {text: 'Sign in', onPress: () => navigation.navigate('Login')},
      ]);
    } catch (error) {
      Alert.alert(
        'Unable to reset',
        error instanceof Error ? error.message : 'Please try again.',
      );
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
        <Text style={[styles.heading, {color: theme.text}]}>
          Create new password
        </Text>
        <Text style={[styles.sub, {color: theme.textMuted}]}>
          Choose a new password for {email}. You will use it the next time you
          sign in.
        </Text>
      </View>

      <Input
        label="New password"
        icon="lock"
        isPassword
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        placeholder="Min. 8 characters"
      />
      <Input
        label="Confirm password"
        icon="lock"
        isPassword
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={errors.confirmPassword}
        placeholder="Repeat password"
      />

      <Button label="Save password" onPress={onSubmit} loading={loading} />
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
    marginBottom: spacing.xl,
  },
  kicker: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  heading: {
    ...typography.hero,
    fontSize: 28,
  },
  sub: {
    ...typography.subtitle,
    marginTop: spacing.sm,
  },
  back: {
    marginTop: spacing.sm,
  },
});
