import type {AlertApi, ShowAlertOptions, ShowConfirmOptions, ShowToastOptions} from './types';

let api: AlertApi | null = null;

export function registerAlertApi(next: AlertApi | null) {
  api = next;
}

function requireApi(): AlertApi {
  if (!api) {
    throw new Error(
      'Alert system is not mounted. Wrap the app with <AlertProvider>.',
    );
  }
  return api;
}

/** Imperative helpers — usable outside React components */
export function showAlert(options: ShowAlertOptions) {
  requireApi().showAlert(options);
}

export function showConfirm(options: ShowConfirmOptions) {
  return requireApi().showConfirm(options);
}

export function showToast(options: ShowToastOptions) {
  requireApi().showToast(options);
}

export function hideAlert() {
  api?.hide();
}
