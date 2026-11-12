import React, {useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Input, Screen} from '../../components';
import {useApp} from '../../context/AppContext';
import {AuthStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';
import {FieldErrors, validateForgotPassword} from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({navigation}: Props) {
  const theme = useThemeColors();
  const {emailHasAccount} = useApp();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const nextErrors = validateForgotPassword(email);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }
    setLoading(true);
    try {
      await emailHasAccount(email.trim());
      Alert.alert(
        'Check your email',
        'If an account exists for this address, a password reset link has been sent.',
        [{text: 'Back to Sign In', onPress: () => navigation.navigate('Login')}],
      );
    } catch (error) {
      Alert.alert(
        'Reset failed',
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
        <Text style={[styles.heading, {color: theme.text}]}>Reset password</Text>
        <Text style={[styles.sub, {color: theme.textMuted}]}>
          Enter your membership email. We will send a verification code to
          continue.
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

      <Button label="Send Code" onPress={onSubmit} loading={loading} />
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
