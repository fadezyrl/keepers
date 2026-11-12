import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import {colors, spacing, typography, useThemeColors} from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'onDark';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const theme = useThemeColors();
  const isDisabled = disabled || loading;

  const primaryBg = theme.dark ? colors.ivory : colors.black;
  const primaryText = theme.dark ? colors.black : colors.ivory;
  const secondaryBorder = theme.dark ? colors.ivory : colors.black;
  const secondaryText = theme.dark ? colors.ivory : colors.black;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({pressed}) => [
        styles.base,
        variant === 'primary' && {backgroundColor: primaryBg},
        variant === 'secondary' && {
          backgroundColor: colors.transparent,
          borderWidth: 1,
          borderColor: secondaryBorder,
        },
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && {
          backgroundColor: colors.transparent,
          borderWidth: 1,
          borderColor: theme.border,
        },
        variant === 'onDark' && styles.onDark,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary'
              ? primaryText
              : variant === 'onDark'
                ? colors.black
                : secondaryText
          }
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'primary' && {color: primaryText},
            variant === 'secondary' && {color: secondaryText},
            variant === 'ghost' && {color: theme.textMuted},
            variant === 'danger' && {color: theme.text},
            variant === 'onDark' && styles.labelOnDark,
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  onDark: {
    backgroundColor: colors.ivory,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.38,
  },
  label: {
    ...typography.button,
  },
  labelOnDark: {
    color: colors.black,
  },
});
