import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {radii, spacing, typography, useThemeColors} from '../theme';
import {RemoteImage} from './RemoteImage';
import {Button} from './Button';

interface ImagePickerSheetProps {
  visible: boolean;
  title: string;
  options: string[];
  selected?: string;
  onSelect: (uri: string) => void;
  onClose: () => void;
}

export function ImagePickerSheet({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: ImagePickerSheetProps) {
  const theme = useThemeColors();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            {backgroundColor: theme.surface, borderColor: theme.border},
          ]}>
          <Text style={[styles.title, {color: theme.text}]}>{title}</Text>
          <Text style={[styles.sub, {color: theme.textMuted}]}>
            Select a photo from your Keepers library.
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}>
            {options.map(uri => {
              const active = uri === selected;
              return (
                <Pressable
                  key={uri}
                  onPress={() => onSelect(uri)}
                  style={[
                    styles.option,
                    {
                      borderColor: active ? theme.text : theme.border,
                      opacity: active ? 1 : 0.85,
                    },
                  ]}>
                  <RemoteImage uri={uri} style={styles.image} />
                </Pressable>
              );
            })}
          </ScrollView>
          <Button label="Done" onPress={onClose} style={{marginTop: spacing.md}} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 17, 16, 0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {...typography.title, fontSize: 18},
  sub: {...typography.caption, marginTop: spacing.xs, marginBottom: spacing.md},
  row: {gap: spacing.sm, paddingRight: spacing.md},
  option: {
    borderWidth: 1,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  image: {
    width: 108,
    height: 108,
  },
});
