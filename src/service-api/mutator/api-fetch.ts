import {
  clearAccessToken,
  createApiError,
  getAccessToken,
  setAccessToken,
  toApiError,
  type ApiError,
} from "orval-data-handler";

export type ErrorType<ErrorData = unknown> = ApiError & { body?: ErrorData };
export type BodyType<BodyData = unknown> = BodyData;

const REFRESH_TOKENS_PATH = "/auth/refresh-tokens";
const REFRESH_TIMEOUT_MS = 10_000;

const AUTH_PATH_PREFIX = "/auth/";
const BEARER_AUTH_PATHS: ReadonlySet<string> = new Set([
  "/auth/send-verification-email",
]);

export async function apiFetch<TResponse>(
  url: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const sentToken = getAccessToken();
  let response = await sendRequest(url, options);

  if (
    response.status === 401 &&
    renewsOnUnauthorized(url) &&
    (await renewAccessToken(sentToken))
  ) {
    response = await sendRequest(url, options);
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  return readJsonBody<TResponse>(response);
}

function sendRequest(url: string, options: RequestInit) {
  return fetch(getRequestUrl(url), {
    ...options,
    credentials: "include",
    headers: withAuthorization(options.headers),
  });
}

async function readJsonBody<TResponse>(response: Response) {
  const body = await response.text();

  if (!body) {
    return undefined as TResponse;
  }

  try {
    return JSON.parse(body) as TResponse;
  } catch {
    throw createApiError("The server sent an invalid response.", {
      status: response.status,
    });
  }
}

function renewsOnUnauthorized(url: string) {
  const path = toPath(url);

  return !path.startsWith(AUTH_PATH_PREFIX) || BEARER_AUTH_PATHS.has(path);
}

let renewal: Promise<boolean> | null = null;

function renewAccessToken(rejectedToken: string | null): Promise<boolean> {
  const currentToken = getAccessToken();

  if (currentToken && currentToken !== rejectedToken) {
    return Promise.resolve(true);
  }

  renewal ??= requestAccessToken().finally(() => {
    renewal = null;
  });

  return renewal;
}

async function requestAccessToken() {
  try {
    const response = await fetch(getRequestUrl(REFRESH_TOKENS_PATH), {
      body: "{}",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      method: "POST",
      signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
    });
    const token = response.ok ? readAccessToken(await response.json()) : null;

    setAccessToken(token);

    return token !== null;
  } catch {
    clearAccessToken();

    return false;
  }
}

function readAccessToken(body: unknown) {
  const token = (body as { access?: { token?: unknown } } | null)?.access?.token;

  return typeof token === "string" && token ? token : null;
}

function getRequestUrl(url: string) {
  return `${getApiBaseUrl()}/${url.replace(/^\/+/, "")}`;
}

function getApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (typeof window === "undefined") {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is required outside the browser.");
  }

  return window.location.origin;
}

function toPath(url: string) {
  const [path] = url.split(/[?#]/, 1);

  return `/${path.replace(/^\/+/, "")}`;
}

function withAuthorization(source: HeadersInit | undefined) {
  const headers = new Headers(source);
  const accessToken = getAccessToken();

  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}
