export type ApiError = Error & {
  body?: unknown;
  status?: number;
};

export async function toApiError(error: unknown): Promise<ApiError> {
  if (error instanceof Response) {
    return responseToApiError(error);
  }

  if (error instanceof Error) {
    return error as ApiError;
  }

  const apiError = new Error("The request failed.") as ApiError;
  apiError.body = error;

  return apiError;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "The request failed.";
}

async function responseToApiError(response: Response): Promise<ApiError> {
  const body = await readResponseBody(response);
  const message = readErrorMessage(body) ?? response.statusText;
  const apiError = new Error(message || "The request failed.") as ApiError;

  apiError.body = body;
  apiError.status = response.status;

  return apiError;
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function readErrorMessage(body: unknown) {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  const { error, message } = body as Record<string, unknown>;

  return typeof message === "string"
    ? message
    : typeof error === "string"
      ? error
      : undefined;
}
