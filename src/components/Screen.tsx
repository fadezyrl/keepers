import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ElementRef,
  type RefObject,
} from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  ScreenKeyboardProvider,
  type MeasureInWindow,
} from '../context/ScreenKeyboardContext';
import {useApp} from '../context/AppContext';
import {spacing, useThemeColors} from '../theme';

type ScrollViewRef = ElementRef<typeof ScrollView>;

export type ScreenScrollHandle = {
  scrollTo: (opts: {y: number; animated?: boolean}) => void;
  /** Current vertical content offset. */
  getOffsetY: () => number;
  /** Measure a child view’s Y in the window, then scroll it into view. */
  scrollChildIntoView: (
    measureInWindow: MeasureInWindow,
    paddingTop?: number,
  ) => void;
};

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
  /** Optional ref to the inner ScrollView when `scroll` is enabled. */
  scrollRef?: RefObject<ScrollViewRef | null>;
  /** Higher-level scroll helpers (offset + scroll child into view). */
  scrollHandleRef?: RefObject<ScreenScrollHandle | null>;
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
  scrollRef,
  scrollHandleRef,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const {refreshAppData} = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const paddingTop = edges.includes('top') ? insets.top : 0;
  const paddingBottom = edges.includes('bottom') ? insets.bottom : 0;
  const canRefresh = scroll && (refreshable ?? true);
  const innerScrollRef = useRef<ScrollViewRef | null>(null);
  const offsetY = useRef(0);
  const keyboardHeightRef = useRef(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, e => {
      const h = e.endCoordinates?.height || 0;
      keyboardHeightRef.current = h;
      setKeyboardHeight(h);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardHeightRef.current = 0;
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const setScrollRef = useCallback(
    (node: ScrollViewRef | null) => {
      innerScrollRef.current = node;
      if (scrollRef) {
        (scrollRef as React.MutableRefObject<ScrollViewRef | null>).current =
          node;
      }
    },
    [scrollRef],
  );

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    offsetY.current = e.nativeEvent.contentOffset.y;
  }, []);

  const scrollChildIntoView = useCallback(
    (measureInWindow: MeasureInWindow, pad = spacing.lg) => {
      const scrollView = innerScrollRef.current;
      if (!scrollView) return;

      const run = () => {
        scrollView.measureInWindow(
          (_x: number, sy: number, _w: number, sh: number) => {
            measureInWindow((_cx, cy, _cw, ch) => {
              const kb = keyboardHeightRef.current;
              const windowH = Dimensions.get('window').height;
              // Prefer live keyboard top; fall back to scroll frame bottom.
              const keyboardTop = kb > 0 ? windowH - kb : sy + sh;
              const visibleTop = sy + pad;
              const visibleBottom = Math.min(sy + sh, keyboardTop) - pad;
              const fieldHeight = Math.max(ch, 56);
              const fieldTop = cy;
              const fieldBottom = cy + fieldHeight;

              let delta = 0;
              if (fieldBottom > visibleBottom) {
                delta = fieldBottom - visibleBottom;
              } else if (fieldTop < visibleTop) {
                delta = fieldTop - visibleTop;
              } else if (kb > 0) {
                // Keep focused field in the upper half of the visible area.
                const target = visibleTop + (visibleBottom - visibleTop) * 0.35;
                const center = fieldTop + fieldHeight / 2;
                const nudge = center - target;
                if (Math.abs(nudge) > 48) {
                  delta = nudge;
                }
              }

              if (Math.abs(delta) < 8) return;
              scrollView.scrollTo({
                y: Math.max(0, offsetY.current + delta),
                animated: true,
              });
            });
          },
        );
      };

      // Content padding updates after keyboard height — measure twice.
      requestAnimationFrame(run);
      setTimeout(run, 80);
      setTimeout(run, 220);
    },
    [],
  );

  if (scrollHandleRef) {
    scrollHandleRef.current = {
      scrollTo: opts => {
        innerScrollRef.current?.scrollTo(opts);
      },
      getOffsetY: () => offsetY.current,
      scrollChildIntoView,
    };
  }

  const keyboardContext = useMemo(
    () => ({
      keyboardHeight,
      scrollChildIntoView,
    }),
    [keyboardHeight, scrollChildIntoView],
  );

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

  // Edge-to-edge Android ignores adjustResize. Extra bottom inset lets long
  // forms (signup password fields) scroll above the keyboard.
  const keyboardContentPad =
    keyboardHeight > 0 ? keyboardHeight + spacing.lg : 0;

  const body = scroll ? (
    <ScrollView
      ref={setScrollRef}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      showsVerticalScrollIndicator={false}
      // Keep Android TextureView videos painting while scrolling (trip highlights).
      removeClippedSubviews={false}
      scrollEventThrottle={16}
      onScroll={onScroll}
      contentContainerStyle={[
        padded && styles.padded,
        {
          paddingBottom:
            paddingBottom +
            spacing.xl +
            (Platform.OS === 'ios' ? 0 : keyboardContentPad),
          flexGrow: 1,
        },
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
        {
          paddingBottom:
            paddingBottom +
            (Platform.OS === 'android' ? keyboardContentPad : 0),
        },
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
        // iOS: padding. Android: rely on content inset + scroll-into-view
        // (KAV padding is unreliable with edge-to-edge).
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? paddingTop : 0}>
        <ScreenKeyboardProvider value={keyboardContext}>
          {body}
        </ScreenKeyboardProvider>
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
