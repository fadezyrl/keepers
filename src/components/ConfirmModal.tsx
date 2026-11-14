import React from 'react';
import {AlertDialog} from '../alerts/AlertDialog';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

/**
 * Local controlled confirm dialog (e.g. forms with embedded fields).
 * Prefer `useAlert().showConfirm` / `showConfirm()` for simple confirmations.
 */
export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger,
  loading = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps) {
  return (
    <AlertDialog
      visible={visible}
      tone={danger ? 'warning' : 'confirm'}
      title={title}
      message={message}
      loading={loading}
      onRequestClose={onCancel}
      buttons={[
        {
          label: cancelLabel,
          variant: 'ghost',
          onPress: onCancel,
        },
        {
          label: confirmLabel,
          variant: danger ? 'danger' : 'primary',
          onPress: onConfirm,
        },
      ]}>
      {children}
    </AlertDialog>
  );
}
