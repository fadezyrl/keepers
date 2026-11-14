import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import {View} from 'react-native';

export type MeasureInWindow = (
  callback: (x: number, y: number, width: number, height: number) => void,
) => void;

export type ScreenKeyboardContextValue = {
  keyboardHeight: number;
  scrollChildIntoView: (
    measureInWindow: MeasureInWindow,
    padding?: number,
  ) => void;
};

const ScreenKeyboardContext = createContext<ScreenKeyboardContextValue | null>(
  null,
);

export function ScreenKeyboardProvider({
  value,
  children,
}: {
  value: ScreenKeyboardContextValue;
  children: React.ReactNode;
}) {
  return (
    <ScreenKeyboardContext.Provider value={value}>
      {children}
    </ScreenKeyboardContext.Provider>
  );
}

export function useScreenKeyboard() {
  return useContext(ScreenKeyboardContext);
}

/**
 * Call from any focused field (Input or raw TextInput) so Screen scrolls it
 * above the keyboard. Attach `fieldRef` to a wrapping View.
 */
export function useEnsureInputVisible(delayMs = 60) {
  const ctx = useScreenKeyboard();
  const fieldRef = useRef<View | null>(null);
  const focusedRef = useRef(false);

  const ensureVisible = useCallback(() => {
    if (!ctx?.scrollChildIntoView || !fieldRef.current) return;
    const node = fieldRef.current;
    const run = () => {
      ctx.scrollChildIntoView(cb => node.measureInWindow(cb));
    };
    run();
    setTimeout(run, delayMs);
    setTimeout(run, delayMs + 160);
    setTimeout(run, delayMs + 320);
  }, [ctx, delayMs]);

  // When keyboard height lands after focus, re-scroll (signup password case).
  useEffect(() => {
    if (!focusedRef.current || !ctx?.keyboardHeight) return;
    ensureVisible();
  }, [ctx?.keyboardHeight, ensureVisible]);

  const onFocusEnsure = useCallback(() => {
    focusedRef.current = true;
    ensureVisible();
  }, [ensureVisible]);

  const onBlurEnsure = useCallback(() => {
    focusedRef.current = false;
  }, []);

  return {fieldRef, ensureVisible: onFocusEnsure, onBlurEnsure};
}
