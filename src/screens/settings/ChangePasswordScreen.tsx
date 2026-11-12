import React, {useState} from 'react';
import {Alert, StyleSheet, Text} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BackHeader, Button, Input, Screen} from '../../components';
import {useApp} from '../../context/AppContext';
import {RootStackParamList} from '../../navigation/types';
import {spacing, typography, useThemeColors} from '../../theme';
import {
  FieldErrors,
  isValidPassword,
  required,
} from '../../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPasswordModal'>;

export function ChangePasswordScreen({navigation}: Props) {
  const theme = useThemeColors();
  const {changePassword} = useApp();
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const next: FieldErrors = {};
    if (!required(currentPassword)) {
      next.currentPassword = 'Current password is required';
    }
    if (!required(password) || !isValidPassword(password)) {
      next.password = 'New password must be at least 8 characters';
    }
    if (confirmPassword !== password) {
      next.confirmPassword = 'Passwords do not match';
    }
    setErrors(next);
    if (Object.keys(next).length) {
      return;
    }
    setSaving(true);
    try {
      await changePassword(currentPassword, password);
      Alert.alert('Password updated', 'Your password has been changed.', [
        {text: 'Done', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      Alert.alert(
        'Unable to update',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <BackHeader onBack={() => navigation.goBack()} />
      <Text style={[styles.kicker, {color: theme.textMuted}]}>Security</Text>
      <Text style={[styles.title, {color: theme.text}]}>Change password</Text>
      <Input
        label="Current password"
        icon="lock"
        isPassword
        value={currentPassword}
        onChangeText={setCurrentPassword}
        error={errors.currentPassword}
      />
      <Input
        label="New password"
        icon="lock"
        isPassword
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />
      <Input
        label="Confirm new password"
        icon="lock"
        isPassword
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={errors.confirmPassword}
      />
      <Button label="Update password" onPress={onSave} loading={saving} />
      <Button
        label="Cancel"
        onPress={() => navigation.goBack()}
        variant="ghost"
        style={{marginTop: spacing.sm}}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    ...typography.label,
  },
  title: {
    ...typography.hero,
    fontSize: 24,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
});
