import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  toApiError,
  type ApiError,
} from "orval-data-handler";

export type ErrorType<ErrorData = unknown> = ApiError & { body?: ErrorData };
export type BodyType<BodyData = unknown> = BodyData;

export async function apiFetch<TResponse>(
  url: string,
  options: RequestInit = {},
): Promise<TResponse> {
  let response = await sendRequest(url, options);


  if (response.status === 401 && !isAuthEndpoint(url)) {
    if (await renewAccessToken()) {
      response = await sendRequest(url, options);
    }
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  const body = await response.text();

  return (body ? JSON.parse(body) : undefined) as TResponse;
}

function sendRequest(url: string, options: RequestInit) {
  return fetch(getRequestUrl(url), {
    ...options,
    credentials: "include",
    headers: withAuthorization(options.headers),
  });
}

function isAuthEndpoint(url: string) {
  return url.startsWith("/auth/");
}

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

      const tokens = (await response.json()) as { access?: { token?: string } };

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

function getRequestUrl(url: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || window.location.origin;

  return `${base.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
}

function withAuthorization(source: HeadersInit | undefined) {
  const headers = new Headers(source);
  const accessToken = getAccessToken();

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}
