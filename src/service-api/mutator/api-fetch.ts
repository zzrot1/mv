import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  toApiError,
  type ApiError,
} from "orval-data-handler";

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  params?: Record<string, unknown>;
  data?: unknown;
  body?: BodyInit | null;
};

export type ErrorType<ErrorData = unknown> = ApiError & { body?: ErrorData };
export type BodyType<BodyData = unknown> = BodyData;

export async function apiFetch<TResponse>(
  url: string,
  options: ApiFetchOptions = {},
): Promise<TResponse> {
  let response = await sendRequest(url, options);

  // Access token-ul traieste ~30 min. Cand expira, il reinnoim din cookie-ul
  // httpOnly de refresh si reluam cererea o singura data, ca utilizatorul sa
  // nu fie deconectat la fiecare expirare.
  if (response.status === 401 && !isAuthEndpoint(url)) {
    const renewed = await renewAccessToken();

    if (renewed) {
      response = await sendRequest(url, options);
    }
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

function sendRequest(url: string, options: ApiFetchOptions) {
  return fetch(getRequestUrl(url, options.params), {
    body: getRequestBody(options),
    credentials: "include",
    headers: getHeaders(options),
    method: options.method ?? "GET",
    signal: options.signal,
  });
}

/** Rutele de auth nu se reincearca: un 401 de la ele e raspunsul real. */
function isAuthEndpoint(url: string) {
  return url.startsWith("/auth/");
}

/**
 * O singura reinnoire in zbor, indiferent cate cereri primesc 401 simultan:
 * refresh token-ul se roteste la fiecare folosire, deci doua apeluri paralele
 * s-ar invalida reciproc.
 */
let renewal: Promise<boolean> | null = null;

function renewAccessToken(): Promise<boolean> {
  renewal ??= (async () => {
    try {
      const response = await fetch(getRequestUrl("/auth/refresh-tokens"), {
        body: "{}",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        clearAccessToken();
        return false;
      }

      const tokens = (await response.json()) as {
        access?: { token?: string };
      };

      setAccessToken(tokens.access?.token ?? null);
      return Boolean(tokens.access?.token);
    } catch {
      clearAccessToken();
      return false;
    } finally {
      renewal = null;
    }
  })();

  return renewal;
}

function getRequestUrl(url: string, params?: Record<string, unknown>) {
  const requestUrl = new URL(joinPath(getApiBaseUrl(), url));

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => requestUrl.searchParams.append(key, String(item)));
      return;
    }

    requestUrl.searchParams.set(key, String(value));
  });

  return requestUrl.toString();
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || window.location.origin;
}

function joinPath(base: string, path: string) {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function getHeaders(options: ApiFetchOptions) {
  const headers = new Headers(options.headers);
  const body = options.body ?? options.data;

  if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = getAccessToken();
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

function getRequestBody(options: ApiFetchOptions) {
  const body = options.body ?? options.data;

  if (!body) {
    return undefined;
  }

  if (
    typeof body === "string" ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams
  ) {
    return body;
  }

  return JSON.stringify(body);
}
