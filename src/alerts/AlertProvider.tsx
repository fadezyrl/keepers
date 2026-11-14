import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {registerAlertApi} from './alertController';
import {AlertDialog} from './AlertDialog';
import {ToastHost} from './ToastHost';
import type {
  AlertApi,
  AlertButton,
  ShowAlertOptions,
  ShowConfirmOptions,
  ShowToastOptions,
} from './types';

type DialogState = {
  tone?: ShowAlertOptions['type'] | 'confirm';
  title: string;
  message?: string;
  buttons: AlertButton[];
} | null;

type ToastState = {
  message: string;
  type?: ShowToastOptions['type'];
  duration?: number;
} | null;

const AlertContext = createContext<AlertApi | null>(null);

export function AlertProvider({children}: {children: React.ReactNode}) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const queueRef = useRef<Array<() => void>>([]);
  const busyRef = useRef(false);
  const confirmResolveRef = useRef<((value: boolean) => void) | null>(null);

  const flushQueue = useCallback(() => {
    if (busyRef.current) return;
    const next = queueRef.current.shift();
    if (next) next();
  }, []);

  const hide = useCallback(() => {
    if (confirmResolveRef.current) {
      const resolve = confirmResolveRef.current;
      confirmResolveRef.current = null;
      resolve(false);
    }
    setDialog(null);
    setLoading(false);
    busyRef.current = false;
    // Allow modal unmount before next dialog
    setTimeout(() => flushQueue(), 40);
  }, [flushQueue]);

  const enqueue = useCallback(
    (run: () => void) => {
      if (busyRef.current || dialog) {
        queueRef.current.push(run);
        return;
      }
      run();
    },
    [dialog],
  );

  const showAlert = useCallback(
    (options: ShowAlertOptions) => {
      enqueue(() => {
        busyRef.current = true;
        const close = () => {
          options.onClose?.();
          hide();
        };
        const buttons: AlertButton[] =
          options.buttons && options.buttons.length > 0
            ? options.buttons.map(btn => ({
                ...btn,
                onPress: async () => {
                  await btn.onPress?.();
                  close();
                },
              }))
            : [
                {
                  label: options.buttonText || 'OK',
                  variant: 'primary',
                  onPress: close,
                },
              ];
        setDialog({
          tone: options.type || 'info',
          title: options.title,
          message: options.message,
          buttons,
        });
      });
    },
    [enqueue, hide],
  );

  const showConfirm = useCallback(
    (options: ShowConfirmOptions) =>
      new Promise<boolean>(resolve => {
        enqueue(() => {
          busyRef.current = true;
          confirmResolveRef.current = resolve;

          const finish = (value: boolean) => {
            confirmResolveRef.current = null;
            setDialog(null);
            setLoading(false);
            busyRef.current = false;
            resolve(value);
            setTimeout(() => flushQueue(), 40);
          };

          setDialog({
            tone: options.destructive
              ? 'warning'
              : options.type === 'confirm'
                ? 'confirm'
                : options.type || 'confirm',
            title: options.title,
            message: options.message,
            buttons: [
              {
                label: options.cancelText || 'Cancel',
                variant: 'ghost',
                onPress: () => {
                  options.onCancel?.();
                  finish(false);
                },
              },
              {
                label: options.confirmText || 'Confirm',
                variant: options.destructive ? 'danger' : 'primary',
                onPress: async () => {
                  if (!options.onConfirm) {
                    finish(true);
                    return;
                  }
                  try {
                    setLoading(true);
                    await options.onConfirm();
                    setLoading(false);
                    finish(true);
                  } catch (err) {
                    setLoading(false);
                    finish(false);
                    const message =
                      err instanceof Error
                        ? err.message
                        : 'Something went wrong. Please try again.';
                    setTimeout(() => {
                      showAlert({
                        type: 'error',
                        title: 'Action failed',
                        message,
                      });
                    }, 60);
                  }
                },
              },
            ],
          });
        });
      }),
    [enqueue, flushQueue, showAlert],
  );

  const showToast = useCallback((options: ShowToastOptions) => {
    setToast({
      message: options.message,
      type: options.type || 'info',
      duration: options.duration,
    });
  }, []);

  const api = useMemo<AlertApi>(
    () => ({
      showAlert,
      showConfirm,
      showToast,
      hide,
    }),
    [showAlert, showConfirm, showToast, hide],
  );

  useEffect(() => {
    registerAlertApi(api);
    return () => registerAlertApi(null);
  }, [api]);

  return (
    <AlertContext.Provider value={api}>
      {children}
      <AlertDialog
        visible={Boolean(dialog)}
        tone={dialog?.tone}
        title={dialog?.title || ''}
        message={dialog?.message}
        buttons={dialog?.buttons || []}
        loading={loading}
        onRequestClose={() => {
          if (loading) return;
          hide();
        }}
      />
      <ToastHost
        visible={Boolean(toast)}
        message={toast?.message || ''}
        tone={toast?.type}
        duration={toast?.duration}
        onHide={() => setToast(null)}
      />
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertApi {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return ctx;
}
