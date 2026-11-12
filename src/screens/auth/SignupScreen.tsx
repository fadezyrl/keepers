import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BrandLogo, Button, Input, Screen} from '../../components';
import {AuthStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';
import {FieldErrors, validateSignup} from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export function SignupScreen({navigation}: Props) {
  const theme = useThemeColors();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const onContinue = () => {
    const nextErrors = validateSignup({
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }
    navigation.navigate('Otp', {
      email: email.trim(),
      mode: 'signup',
      profile: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      },
    });
  };

  return (
    <Screen scroll refreshable={false}>
      <View style={styles.top}>
        <BrandLogo size="sm" showTagline={false} />
        <Text style={[styles.kicker, {color: theme.textMuted}]}>
          Membership
        </Text>
        <Text style={[styles.heading, {color: theme.text}]}>
          Join the collective
        </Text>
        <Text style={[styles.sub, {color: theme.textMuted}]}>
          Create your Keepers profile to access exclusive expeditions and the
          members directory.
        </Text>
      </View>

      <Input
        label="First name"
        icon="user"
        value={firstName}
        onChangeText={setFirstName}
        error={errors.firstName}
        placeholder="First name"
      />
      <Input
        label="Last name"
        icon="user"
        value={lastName}
        onChangeText={setLastName}
        error={errors.lastName}
        placeholder="Last name"
      />
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
      <Input
        label="Phone"
        icon="phone"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        error={errors.phone}
        placeholder="+971 50 000 0000"
      />
      <Input
        label="Password"
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

      <Button label="Continue" onPress={onContinue} style={styles.cta} />

      <View style={styles.footer}>
        <Text style={[styles.footerText, {color: theme.textMuted}]}>
          Already a member?
        </Text>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.link, {color: theme.text}]}> Sign in</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  kicker: {
    ...typography.label,
    marginTop: spacing.xl,
  },
  heading: {
    ...typography.hero,
    marginTop: spacing.xs,
  },
  sub: {
    ...typography.subtitle,
    marginTop: spacing.sm,
  },
  cta: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  footerText: {
    ...typography.subtitle,
  },
  link: {
    ...typography.subtitle,
    fontWeight: '600',
  },
});
