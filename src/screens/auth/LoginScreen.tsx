import React, {useEffect, useState} from 'react';
import {
  Alert,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BrandLogo, Button, Input, RemoteImage, Screen} from '../../components';
import {SEED_CREDENTIALS} from '../../config/demoAuth';
import {useApp} from '../../context/AppContext';
import {images} from '../../data/images';
import {AuthStackParamList} from '../../navigation/types';
import {colors, spacing, typography, useThemeColors} from '../../theme';
import {FieldErrors, validateLogin} from '../../utils/validation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({navigation}: Props) {
  const theme = useThemeColors();
  const {login} = useApp();
  const [email, setEmail] = useState<string>(SEED_CREDENTIALS.email);
  const [password, setPassword] = useState<string>(SEED_CREDENTIALS.password);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardOpen(true));
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setKeyboardOpen(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const onSubmit = async () => {
    Keyboard.dismiss();
    const nextErrors = validateLogin({email, password});
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      Alert.alert(
        'Sign in failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll padded={false} refreshable={false}>
      <View
        style={[styles.masthead, keyboardOpen && styles.mastheadCollapsed]}>
        <RemoteImage uri={images.hero.auth} style={StyleSheet.absoluteFill} />
        <View style={styles.mastheadOverlay} />
        {!keyboardOpen ? (
          <>
            <BrandLogo size="md" tone="dark" />
            <Text style={styles.mastheadLine}>Members access</Text>
          </>
        ) : null}
      </View>

      <View style={styles.form}>
        <Text style={[styles.heading, {color: theme.text}]}>Sign in</Text>
        <Text style={[styles.sub, {color: theme.textMuted}]}>
          Enter your Keepers credentials to continue into the collective.
        </Text>

        <Input
          label="Email"
          icon="mail"
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          placeholder="you@domain.com"
        />
        <Input
          label="Password"
          icon="lock"
          isPassword
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          placeholder="••••••••"
        />

        <Pressable
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgot}>
          <Text style={[styles.forgotText, {color: theme.text}]}>
            Forgot password?
          </Text>
        </Pressable>

        <Button label="Sign In" onPress={onSubmit} loading={loading} />

        <View style={styles.footer}>
          <Text style={[styles.footerText, {color: theme.textMuted}]}>
            New to Keepers?
          </Text>
          <Pressable onPress={() => navigation.navigate('Signup')}>
            <Text style={[styles.link, {color: theme.text}]}>
              {' '}
              Create account
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  masthead: {
    height: 260,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    overflow: 'hidden',
  },
  mastheadCollapsed: {
    height: 72,
  },
  mastheadOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(17,17,16,0.42)',
  },
  mastheadLine: {
    ...typography.label,
    color: colors.white,
    marginTop: spacing.md,
    letterSpacing: 2,
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  heading: {
    ...typography.hero,
    fontSize: 28,
  },
  sub: {
    ...typography.subtitle,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
  },
  forgotText: {
    ...typography.label,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.subtitle,
  },
  link: {
    ...typography.subtitle,
    fontWeight: '600',
  },
});
