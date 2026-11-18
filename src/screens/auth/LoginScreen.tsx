import React, {useEffect, useState} from 'react';
import {Keyboard, Platform, StyleSheet, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {showAlert} from '../../alerts';
import {BrandLogo, Button, Input, RemoteImage, Screen} from '../../components';
import {STORAGE_KEYS} from '../../config/api';
import {images} from '../../data/images';
import {useApp} from '../../context/AppContext';
import {AuthStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';
import {FieldErrors, validateLogin} from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({navigation}: Props) {
  const theme = useThemeColors();
  const {login} = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardOpen(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardOpen(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const onSubmit = async () => {
    const nextErrors = validateLogin({email, password});
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Sign in failed',
        message:
          error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll refreshable={false} padded={false}>
      <View style={[styles.hero, keyboardOpen && styles.heroCompact]}>
        <RemoteImage uri={images.hero.auth} style={StyleSheet.absoluteFill} />
        <View style={styles.heroOverlay} />
        <BrandLogo size={keyboardOpen ? 'sm' : 'md'} tone="dark" />
      </View>

      <View style={styles.form}>
        <Text style={[styles.kicker, {color: theme.textMuted}]}>Welcome</Text>
        <Text style={[styles.heading, {color: theme.text}]}>Sign in</Text>

        <Input
          label="Email"
          icon="mail"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          placeholder="you@domain.com"
          returnKeyType="next"
        />
        <Input
          label="Password"
          icon="lock"
          isPassword
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          placeholder="Password"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />

        <Button label="Sign in" onPress={onSubmit} loading={loading} />
        <Button
          label="Forgot password?"
          onPress={() =>
            navigation.navigate('ForgotPassword', {
              email: email.trim() || undefined,
            })
          }
          variant="ghost"
          style={styles.link}
        />
        <Button
          label="Create membership"
          onPress={() => navigation.navigate('Signup')}
          variant="secondary"
          style={styles.link}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111110',
  },
  heroCompact: {
    height: 96,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17,17,16,0.45)',
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  kicker: {...typography.label},
  heading: {...typography.hero, fontSize: 32, marginBottom: spacing.lg},
  link: {marginTop: spacing.sm},
});
