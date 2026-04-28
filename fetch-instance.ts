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

type ObjectConfig = {
  url: string;
  method: string;
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, unknown>;
  signal?: AbortSignal;
};

let _config: ClientConfig = {};

export const configure = (config: ClientConfig): void => {
  _config = { ..._config, ...config };
};

// Overload 1: react-query client calls fetchInstance({ url, method, data, signal, ... })
export async function fetchInstance<T>(config: ObjectConfig): Promise<T>;
// Overload 2: fetch client calls fetchInstance(url, RequestInit)
export async function fetchInstance<T>(url: string, options?: RequestInit): Promise<T>;

export async function fetchInstance<T>(
  first: string | ObjectConfig,
  second?: RequestInit,
): Promise<T> {
  let url: string;
  let method: string;
  let incomingHeaders: HeadersInit | undefined;
  let body: BodyInit | undefined;
  let signal: AbortSignal | undefined;
  let params: Record<string, unknown> | undefined;

  if (typeof first === 'string') {
    url = first;
    method = second?.method ?? 'GET';
    incomingHeaders = second?.headers;
    body = second?.body as BodyInit | undefined;
    signal = second?.signal ?? undefined;
  } else {
    const { url: u, method: m, headers, data, signal: s, params: p } = first;
    url = u;
    method = m;
    incomingHeaders = headers as HeadersInit | undefined;
    signal = s;
    params = p;
    if (data instanceof FormData) {
      body = data;
    } else if (data !== undefined) {
      body = JSON.stringify(data);
    }
  }

  const base = (_config.baseURL ?? '').replace(/\/$/, '');
  const fullUrl = new URL(`${base}${url}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        fullUrl.searchParams.append(key, String(value));
      }
    });
  }

  const headers = new Headers(incomingHeaders);

  const token = _config.getToken?.();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const extraHeaders = _config.getHeaders?.() ?? {};
  Object.entries(extraHeaders).forEach(([k, v]) => headers.set(k, v));

  if (typeof first !== 'string' && first.data !== undefined && !(first.data instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(fullUrl.toString(), { method, headers, body, signal });

  if (!response.ok) {
    const responseBody = await response.json().catch(() => null);
    const error: ApiError = {
      status: response.status,
      message: responseBody?.message ?? response.statusText,
      validationErrors: responseBody?.validationErrors ?? null,
    };
    throw error;
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}
