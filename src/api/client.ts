import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL, STORAGE_KEYS} from '../config/api';

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

type ApiFailure = {
  success: false;
  error: ApiError;
  data?: unknown;
};

let memoryAccessToken: string | null = null;

export async function setTokens(accessToken: string | null, refreshToken?: string | null) {
  memoryAccessToken = accessToken;
  if (accessToken) {
    await AsyncStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  } else {
    await AsyncStorage.removeItem(STORAGE_KEYS.accessToken);
  }
  if (refreshToken !== undefined) {
    if (refreshToken) {
      await AsyncStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.refreshToken);
    }
  }
}

export async function loadStoredAccessToken() {
  if (memoryAccessToken) return memoryAccessToken;
  memoryAccessToken = await AsyncStorage.getItem(STORAGE_KEYS.accessToken);
  return memoryAccessToken;
}

export async function clearTokens() {
  memoryAccessToken = null;
  await AsyncStorage.removeItem(STORAGE_KEYS.accessToken);
  await AsyncStorage.removeItem(STORAGE_KEYS.refreshToken);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.refreshToken);
  if (!refreshToken) return null;
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({refreshToken}),
  });
  const json = (await res.json()) as ApiSuccess<{session: {access_token: string; refresh_token: string}}> | ApiFailure;
  if (!res.ok || !json.success) return null;
  await setTokens(json.data.session.access_token, json.data.session.refresh_token);
  return json.data.session.access_token;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & {auth?: boolean; retry?: boolean} = {},
): Promise<T> {
  const {auth = true, retry = true, headers, ...rest} = options;
  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  if (!(rest.body instanceof FormData)) {
    finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || 'application/json';
  }

  if (auth) {
    const token = await loadStoredAccessToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
  });

  if (res.status === 401 && auth && retry) {
    const next = await refreshAccessToken();
    if (next) {
      return apiRequest<T>(path, {...options, retry: false});
    }
  }

  let json: ApiSuccess<T> | ApiFailure;
  try {
    json = (await res.json()) as ApiSuccess<T> | ApiFailure;
  } catch {
    throw {code: 'INVALID_RESPONSE', message: 'Invalid server response'} as ApiError;
  }

  if (!res.ok || !json.success) {
    const err = (json as ApiFailure).error || {
      code: 'REQUEST_FAILED',
      message: `Request failed (${res.status})`,
    };
    throw err;
  }

  return json.data;
}

export async function apiUpload<T>(
  path: string,
  file: {uri: string; name: string; type: string},
  fields: Record<string, string> = {},
): Promise<T> {
  const form = new FormData();
  form.append('file', file as unknown as Blob);
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  return apiRequest<T>(path, {
    method: 'POST',
    body: form,
  });
}
