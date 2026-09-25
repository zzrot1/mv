"use client";

import type { UseMutationOptions } from "@tanstack/react-query";
import { useDataHandlerMutationOptions } from "orval-data-handler";

import { apiDataHandler, type ApiMutationMeta } from "./api-data-handler";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: ApiMutationMeta;
  }
}

export function useApiMutationOptions<TData, TError, TVariables, TContext>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
  endpoint: { url: string },
  operation: { operationId: string; operationName: string },
) {
  return useDataHandlerMutationOptions(apiDataHandler, options, endpoint, operation, {
    notify: notifyMutation,
  });
}

function notifyMutation(level: "success" | "error", message: string) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console[level === "success" ? "info" : "error"](`[${level}] ${message}`);
}
