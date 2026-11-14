export type AlertTone = 'success' | 'error' | 'warning' | 'info';

export type AlertButton = {
  label: string;
  onPress?: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export type ShowAlertOptions = {
  type?: AlertTone;
  title: string;
  message?: string;
  buttonText?: string;
  buttons?: AlertButton[];
  onClose?: () => void;
};

export type ShowConfirmOptions = {
  type?: AlertTone | 'confirm';
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  /** Destructive confirm — never the accidental default focus */
  destructive?: boolean;
  /** Awaited; dialog stays open with loading until resolve/reject */
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
};

export type ShowToastOptions = {
  type?: AlertTone;
  message: string;
  duration?: number;
};

export type AlertApi = {
  showAlert: (options: ShowAlertOptions) => void;
  showConfirm: (options: ShowConfirmOptions) => Promise<boolean>;
  showToast: (options: ShowToastOptions) => void;
  hide: () => void;
};
