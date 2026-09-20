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
  const bodyMessage = readErrorMessage((error as ApiError | undefined)?.body);

  if (bodyMessage) {
    return bodyMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "The request failed.";
}

export function getErrorStatus(error: unknown) {
  const { status } = (error ?? {}) as Partial<ApiError>;

  return typeof status === "number" ? status : undefined;
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

  const { details, error, message } = body as Record<string, unknown>;
  const detailMessage = readValidationDetails(details);

  return detailMessage
    ? detailMessage
    : typeof message === "string"
      ? message
      : typeof error === "string"
        ? error
        : undefined;
}

function readValidationDetails(details: unknown) {
  if (!Array.isArray(details)) {
    return undefined;
  }

  const messages = details
    .map((detail) => {
      if (!detail || typeof detail !== "object") {
        return undefined;
      }

      const { message, path } = detail as Record<string, unknown>;

      if (typeof message !== "string") {
        return undefined;
      }

      return typeof path === "string" && path
        ? `${formatValidationPath(path)}: ${message}`
        : message;
    })
    .filter((message): message is string => Boolean(message));

  return messages.length ? messages.join("\n") : undefined;
}

function formatValidationPath(path: string) {
  return path.charAt(0).toUpperCase() + path.slice(1);
}
