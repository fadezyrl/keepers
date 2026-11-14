import React from 'react';
import {
  AccessibilityInfo,
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button} from '../components/Button';
import {Icon, IconName} from '../components/Icon';
import {colors, spacing, typography, useThemeColors} from '../theme';
import type {AlertButton, AlertTone} from './types';

type Props = {
  visible: boolean;
  tone?: AlertTone | 'confirm';
  title: string;
  message?: string;
  buttons: AlertButton[];
  loading?: boolean;
  onRequestClose: () => void;
  children?: React.ReactNode;
};

function toneIcon(tone: AlertTone | 'confirm' | undefined): IconName {
  switch (tone) {
    case 'success':
      return 'check';
    case 'error':
      return 'alert';
    case 'warning':
      return 'alert';
    case 'confirm':
      return 'alert';
    default:
      return 'bell';
  }
}

export function AlertDialog({
  visible,
  tone = 'info',
  title,
  message,
  buttons,
  loading = false,
  onRequestClose,
  children,
}: Props) {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (!visible) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (loading) return true;
      onRequestClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, loading, onRequestClose]);

  React.useEffect(() => {
    if (visible && title) {
      AccessibilityInfo.announceForAccessibility(
        message ? `${title}. ${message}` : title,
      );
    }
  }, [visible, title, message]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!loading) onRequestClose();
      }}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}>
        <View
          style={[
            styles.backdrop,
            {paddingBottom: Math.max(insets.bottom, spacing.lg)},
          ]}
          accessibilityViewIsModal>
          <Pressable
            style={StyleSheet.absoluteFill}
            disabled={loading}
            onPress={() => {
              if (!loading) onRequestClose();
            }}
            accessibilityLabel="Dismiss dialog"
          />
          <View
            style={[
              styles.card,
              {backgroundColor: theme.surface, borderColor: theme.border},
            ]}
            accessibilityRole="alert">
            <View style={styles.header}>
              <View
                style={[
                  styles.iconWrap,
                  {borderColor: theme.border, backgroundColor: theme.bgMuted},
                ]}>
                <Icon name={toneIcon(tone)} size={18} color={theme.text} />
              </View>
              <Text style={[styles.title, {color: theme.text}]}>{title}</Text>
            </View>
            {message ? (
              <Text style={[styles.message, {color: theme.textMuted}]}>
                {message}
              </Text>
            ) : null}
            {children}
            <View style={styles.actions}>
              {buttons.map((btn, index) => (
                <Button
                  key={`${btn.label}-${index}`}
                  label={btn.label}
                  variant={
                    btn.variant ||
                    (index === buttons.length - 1 ? 'primary' : 'ghost')
                  }
                  loading={loading && index === buttons.length - 1}
                  disabled={loading}
                  onPress={() => {
                    void btn.onPress?.();
                  }}
                  style={styles.btn}
                />
              ))}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlayHeavy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 2,
    padding: spacing.lg,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.title,
    fontSize: 18,
    flex: 1,
  },
  message: {
    ...typography.subtitle,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  btn: {
    flex: 1,
    minHeight: 48,
  },
});
