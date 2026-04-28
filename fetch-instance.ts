type ClientConfig = {
  baseURL?: string;
  getToken?: () => string | null | undefined;
  getHeaders?: () => Record<string, string>;
};

export type ApiError = {
  status: number;
  message: string;
  validationErrors?: Record<string, string> | null;
};

let _config: ClientConfig = {};

export const configure = (config: ClientConfig): void => {
  _config = { ..._config, ...config };
};

export const fetchInstance = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  const base = (_config.baseURL ?? '').replace(/\/$/, '');
  const fullUrl = `${base}${url}`;

  const headers = new Headers(options.headers);

  const token = _config.getToken?.();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const extraHeaders = _config.getHeaders?.() ?? {};
  Object.entries(extraHeaders).forEach(([k, v]) => headers.set(k, v));

  const response = await fetch(fullUrl, { ...options, headers });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const error: ApiError = {
      status: response.status,
      message: body?.message ?? response.statusText,
      validationErrors: body?.validationErrors ?? null,
    };
    throw error;
  }

  if (response.status === 204) return undefined as T;
  return response.json();
};
