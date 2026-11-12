import React, {useCallback, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useApp} from '../context/AppContext';
import {spacing, useThemeColors} from '../theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  tone?: 'light' | 'dark' | 'theme';
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  edges?: Array<'top' | 'bottom'>;
  /** Pull-to-refresh. Defaults to true when `scroll` is enabled. */
  refreshable?: boolean;
  onRefresh?: () => void | Promise<void>;
}

export function Screen({
  children,
  scroll = false,
  padded = true,
  tone = 'theme',
  style,
  contentStyle,
  edges = ['top', 'bottom'],
  refreshable,
  onRefresh,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const {refreshAppData} = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const paddingTop = edges.includes('top') ? insets.top : 0;
  const paddingBottom = edges.includes('bottom') ? insets.bottom : 0;
  const canRefresh = scroll && (refreshable ?? true);

  const isDark =
    tone === 'dark' ? true : tone === 'light' ? false : theme.dark;

  const backgroundColor =
    tone === 'dark'
      ? theme.brandBlack
      : tone === 'light'
        ? theme.brandIvory
        : theme.bg;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await refreshAppData();
      }
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, refreshAppData]);

  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        padded && styles.padded,
        {paddingBottom: paddingBottom + spacing.xl},
        contentStyle,
      ]}
      refreshControl={
        canRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.text}
            colors={[theme.text]}
            progressBackgroundColor={theme.surface}
          />
        ) : undefined
      }>
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        padded && styles.padded,
        {paddingBottom},
        contentStyle,
      ]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.root, {paddingTop, backgroundColor}, style]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? paddingTop : 0}>
        {body}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
});
