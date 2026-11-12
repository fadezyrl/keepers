import React, {useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import {colors, spacing, typography, useThemeColors} from '../theme';
import {Icon, IconName} from './Icon';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: IconName;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  icon,
  isPassword,
  style,
  ...rest
}: InputProps) {
  const theme = useThemeColors();
  const [secure, setSecure] = useState(!!isPassword);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, {color: theme.textMuted}]}>{label}</Text>
      <View
        style={[
          styles.field,
          {
            borderColor: error
              ? theme.text
              : focused
                ? theme.text
                : theme.border,
            backgroundColor: theme.surface,
          },
        ]}>
        {icon ? <Icon name={icon} size={16} color={theme.textMuted} /> : null}
        <TextInput
          {...rest}
          secureTextEntry={secure}
          placeholderTextColor={theme.textMuted}
          onFocus={e => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[styles.input, {color: theme.text}, style]}
        />
        {isPassword ? (
          <Pressable onPress={() => setSecure(s => !s)} hitSlop={10}>
            <Icon
              name={secure ? 'eye' : 'eye-off'}
              size={16}
              color={theme.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={[styles.error, {color: theme.text}]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  field: {
    minHeight: 54,
    borderBottomWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    paddingHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.transparent,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing.sm,
    letterSpacing: 0.2,
  },
  error: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
});
