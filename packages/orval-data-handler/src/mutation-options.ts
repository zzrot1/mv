"use client";

import { useQueryClient, type UseMutationOptions } from "@tanstack/react-query";

import type { DataHandler } from "./data-handler";

export type MutationNotifier = (
  level: "success" | "error",
  message: string,
) => void;

export function useDataHandlerMutationOptions<
  TResource extends string,
  TData,
  TError,
  TVariables,
  TContext,
>(
  dataHandler: DataHandler<TResource>,
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
  endpoint: { url: string },
  operation: { operationId: string; operationName: string },
  config: { notify?: MutationNotifier } = {},
) {
  const queryClient = useQueryClient();

  return dataHandler.buildMutationOptions(options, endpoint, operation, {
    notify: config.notify,
    queryClient,
  });
}
