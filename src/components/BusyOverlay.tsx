import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {radii, spacing, typography, useThemeColors} from '../theme';

/**
 * Blocks interaction and shows a clear in-progress state for uploads
 * and other slow actions.
 */
export function BusyOverlay({
  visible,
  message = 'Please wait…',
}: {
  visible: boolean;
  message?: string;
}) {
  const theme = useThemeColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => undefined}>
      <View style={[styles.backdrop, {backgroundColor: 'rgba(17, 17, 16, 0.55)'}]}>
        <View
          style={[
            styles.card,
            {backgroundColor: theme.surface, borderColor: theme.border},
          ]}
          accessibilityRole="progressbar"
          accessibilityLabel={message}>
          <ActivityIndicator size="large" color={theme.text} />
          <Text style={[styles.message, {color: theme.text}]}>{message}</Text>
          <Text style={[styles.hint, {color: theme.textMuted}]}>
            This may take a moment
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    minWidth: 220,
    maxWidth: 320,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  message: {
    ...typography.title,
    fontSize: 17,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  hint: {
    ...typography.caption,
    textAlign: 'center',
  },
});
