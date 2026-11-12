import React, {useEffect, useRef, useState} from 'react';
import {Alert, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Screen} from '../../components';
import {useApp} from '../../context/AppContext';
import {AuthStackParamList} from '../../navigation/types';
import {radii, spacing, typography, useThemeColors} from '../../theme';
import {FieldErrors, validateOtp} from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

export function OtpScreen({navigation, route}: Props) {
  const theme = useThemeColors();
  const {signup, verifyOtp, demoOtp} = useApp();
  const {email, mode, profile} = route.params;
  const [digits, setDigits] = useState(['', '', '', '']);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(45);
  const inputs = useRef<Array<React.ElementRef<typeof TextInput> | null>>([]);

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }
    const id = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const code = digits.join('');

  const onChangeDigit = (value: string, index: number) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (clean && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const onVerify = async () => {
    const nextErrors = validateOtp(code);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }
    if (!verifyOtp(code)) {
      setErrors({otp: 'Incorrect code. Check the verification code and try again.'});
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup' && profile) {
        await signup(profile);
        Alert.alert(
          'Application submitted',
          'Your membership request is pending approval. You can sign in once an admin activates your account.',
          [{text: 'Go to Sign In', onPress: () => navigation.navigate('Login')}],
        );
      } else {
        navigation.navigate('ResetPassword', {email});
      }
    } catch (error) {
      Alert.alert(
        mode === 'signup' ? 'Signup failed' : 'Verification failed',
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
          Verification
        </Text>
        <Text style={[styles.heading, {color: theme.text}]}>Enter OTP</Text>
        <Text style={[styles.sub, {color: theme.textMuted}]}>
          A 4-digit code was sent to {email}. Enter the code below to continue.
        </Text>
        <View
          style={[
            styles.codeHint,
            {borderColor: theme.border, backgroundColor: theme.bgMuted},
          ]}>
          <Text style={[styles.codeHintLabel, {color: theme.textMuted}]}>
            Verification code
          </Text>
          <Text style={[styles.codeHintValue, {color: theme.text}]}>
            {demoOtp}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        {digits.map((digit, index) => (
          <TextInput
            key={`otp-${index}`}
            ref={ref => {
              inputs.current[index] = ref as React.ElementRef<
                typeof TextInput
              > | null;
            }}
            value={digit}
            onChangeText={value => onChangeDigit(value, index)}
            keyboardType="number-pad"
            maxLength={1}
            style={[
              styles.box,
              {
                borderColor: theme.border,
                backgroundColor: theme.surface,
                color: theme.text,
              },
            ]}
            placeholder="•"
            placeholderTextColor={theme.textMuted}
          />
        ))}
      </View>
      {errors.otp ? (
        <Text style={[styles.error, {color: theme.text}]}>{errors.otp}</Text>
      ) : null}

      <Button label="Verify" onPress={onVerify} loading={loading} />

      <Pressable
        disabled={seconds > 0}
        onPress={() => {
          setSeconds(45);
          setDigits(['', '', '', '']);
          setErrors({});
          Alert.alert(
            'Code resent',
            `A new verification code was sent to ${email}.`,
          );
        }}
        style={styles.resend}>
        <Text style={[styles.resendText, {color: theme.textMuted}]}>
          {seconds > 0 ? `Resend code in ${seconds}s` : 'Resend code'}
        </Text>
      </Pressable>
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
  codeHint: {
    marginTop: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeHintLabel: {
    ...typography.label,
  },
  codeHintValue: {
    ...typography.title,
    fontSize: 22,
    letterSpacing: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  box: {
    flex: 1,
    height: 64,
    borderRadius: radii.sm,
    borderWidth: 1,
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '300',
  },
  error: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  resend: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  resendText: {
    ...typography.label,
  },
});
