import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fetchReadinessRequirements} from '../api/keepersApi';
import {VehicleReadinessRequirement} from '../types';
import {colors, spacing, typography, useThemeColors} from '../theme';
import {Button} from './Button';
import {Icon} from './Icon';

interface VehicleReadinessSheetProps {
  visible: boolean;
  submitting?: boolean;
  /** Preserve selections across failed join attempts */
  initialSelectedIds?: string[];
  onCancel: () => void;
  onContinue: (selectedIds: string[]) => void;
}

export function VehicleReadinessSheet({
  visible,
  submitting = false,
  initialSelectedIds = [],
  onCancel,
  onContinue,
}: VehicleReadinessSheetProps) {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [items, setItems] = useState<VehicleReadinessRequirement[]>([]);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialSelectedIds),
  );

  const initialKey = initialSelectedIds.slice().sort().join(',');

  useEffect(() => {
    if (!visible) return;
    setSelected(new Set(initialSelectedIds));
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const next = await fetchReadinessRequirements();
        if (!cancelled) setItems(next);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error
              ? err.message
              : 'Unable to load readiness checklist.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when sheet opens / preserved ids change
  }, [visible, initialKey]);

  const selectedCount = selected.size;
  const counterLabel = useMemo(
    () => `${selectedCount} selected`,
    [selectedCount],
  );

  const toggle = (id: string) => {
    if (submitting) return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={submitting ? undefined : onCancel}>
      <Pressable
        style={styles.backdrop}
        onPress={submitting ? undefined : onCancel}
      />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.bg,
            borderColor: theme.border,
            paddingBottom: Math.max(insets.bottom, spacing.md),
          },
        ]}>
        <View style={[styles.handle, {backgroundColor: theme.border}]} />
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, {color: theme.textMuted}]}>
              Before you join
            </Text>
            <Text style={[styles.title, {color: theme.text}]}>
              Select Available Requirements
            </Text>
            <Text style={[styles.subtitle, {color: theme.textMuted}]}>
              Optional. Confirm which vehicle and readiness items you have
              available — selecting none still lets you join.
            </Text>
          </View>
          <Pressable
            onPress={submitting ? undefined : onCancel}
            hitSlop={10}
            disabled={submitting}>
            <Icon name="close" color={theme.text} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={theme.text} />
            <Text style={[styles.loadingText, {color: theme.textMuted}]}>
              Loading checklist…
            </Text>
          </View>
        ) : loadError ? (
          <View style={styles.loadingBox}>
            <Text style={[styles.loadingText, {color: theme.textMuted}]}>
              {loadError}
            </Text>
            <Button
              label="Dismiss"
              variant="ghost"
              onPress={onCancel}
              style={{marginTop: spacing.sm}}
            />
          </View>
        ) : (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}>
            {items.map(item => {
              const checked = selected.has(item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggle(item.id)}
                  disabled={submitting}
                  style={[
                    styles.row,
                    {
                      borderColor: checked ? colors.black : theme.border,
                      backgroundColor: checked ? colors.cream : theme.surface,
                    },
                  ]}>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: checked ? colors.black : theme.border,
                        backgroundColor: checked ? colors.black : colors.white,
                      },
                    ]}>
                    {checked ? (
                      <Icon name="check" color={colors.ivory} size={14} />
                    ) : null}
                  </View>
                  <Text style={[styles.rowLabel, {color: theme.text}]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <View
          style={[
            styles.footer,
            {borderTopColor: theme.border, backgroundColor: theme.bg},
          ]}>
          <Text style={[styles.counter, {color: theme.textMuted}]}>
            {counterLabel}
          </Text>
          <Button
            label={submitting ? 'Joining…' : 'Continue'}
            onPress={() => onContinue(Array.from(selected))}
            loading={submitting}
            disabled={loading || Boolean(loadError) || submitting}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlayHeavy,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '88%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerCopy: {flex: 1},
  eyebrow: {
    ...typography.caption,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.title,
    fontSize: 22,
    marginTop: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  list: {flexGrow: 0},
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    ...typography.body,
    flex: 1,
    fontSize: 15,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  counter: {
    ...typography.caption,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  loadingBox: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    ...typography.caption,
    textAlign: 'center',
  },
});
