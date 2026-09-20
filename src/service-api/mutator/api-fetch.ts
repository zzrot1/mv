import { toApiError, type ApiError } from "@/core/api-error";

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
  const response = await fetch(getRequestUrl(url, options.params), {
    body: getRequestBody(options),
    credentials: "include",
    headers: getHeaders(options),
    method: options.method ?? "GET",
    signal: options.signal,
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

function getRequestUrl(url: string, params?: Record<string, unknown>) {
  const requestUrl = new URL(url, getApiBaseUrl());

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

function getHeaders(options: ApiFetchOptions) {
  const headers = new Headers(options.headers);
  const body = options.body ?? options.data;

  if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
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
