"use client";

import { useQueryClient, type UseMutationOptions } from "@tanstack/react-query";

import { apiDataHandler, type ApiMutationMeta } from "@/core/cache/api-data-handler";

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
  const queryClient = useQueryClient();

  return apiDataHandler.buildMutationOptions(options, endpoint, operation, {
    notify: notifyMutation,
    queryClient,
  });
}

function notifyMutation(level: "success" | "error", message: string) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console[level === "success" ? "info" : "error"](`[${level}] ${message}`);
}
