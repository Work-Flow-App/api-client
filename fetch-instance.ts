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
  {
    method = 'GET',
    params,
    data,
    headers: configHeaders,
    signal,
  }: {
    method?: string;
    params?: Record<string, unknown>;
    data?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
  } = {},
): Promise<T> => {
  const base = (_config.baseURL ?? '').replace(/\/$/, '');
  const fullUrl = new URL(base + url);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        fullUrl.searchParams.append(key, String(value));
      }
    });
  }

  const headers = new Headers(configHeaders as HeadersInit | undefined);

  const token = _config.getToken?.();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const extraHeaders = _config.getHeaders?.() ?? {};
  Object.entries(extraHeaders).forEach(([k, v]) => headers.set(k, v));

  if (data && !(data instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(fullUrl.toString(), {
    method: method.toUpperCase(),
    headers,
    body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    signal,
  });

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
