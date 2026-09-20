import type {
  QueryClient,
  QueryKey,
  UseMutationOptions,
} from "@tanstack/react-query";
import type {
  CacheSnapshot,
  RecordWithId,
  ResourceRules,
  WriteEvent,
  WritePlan,
} from "./utils";

export abstract class DataHandler<TResource extends string> {
  protected abstract readonly resourceNames: readonly TResource[];

  protected readonly rules: ResourceRules<TResource> = {};

  protected readonly defaultRules = {
    alsoChanges: [] as readonly TResource[],
    staysFreshFor: 60_000,
  };

  buildMutationOptions<TData, TError, TVariables, TContext>(
    options: UseMutationOptions<TData, TError, TVariables, TContext>,
    endpoint: { url: string },
    operation: { operationName: string },
    {
      queryClient,
      notify = () => {},
    }: {
      queryClient: QueryClient;
      notify?: (level: "success" | "error", message: string) => void;
    },
  ): UseMutationOptions<TData, TError, TVariables, TContext> {
    const meta = DataHandler.extractWriteMeta(options.meta);
    const plan = meta.cache ?? DataHandler.defaultWritePlan;
    const resourceName = this.resolveResourceName(endpoint.url);
    const { operationName } = operation;
    const syncsCache = resourceName !== undefined;

    return {
      ...options,
      ...(syncsCache && plan.strategy === "optimistic"
        ? {
            onMutate: async (
              variables: TVariables,
              context: Parameters<
                NonNullable<
                  UseMutationOptions<
                    TData,
                    TError,
                    TVariables,
                    TContext
                  >["onMutate"]
                >
              >[1],
            ) => {
              await this.applyOptimisticWrite(
                queryClient,
                resourceName,
                operationName,
                plan,
                variables,
              );
              return (await options.onMutate?.(variables, context)) as TContext;
            },
          }
        : {}),

      onError: (...args) => {
        const snapshot = this.takeOptimisticWrite(args[1]);

        if (snapshot) {
          DataHandler.restoreSnapshot(queryClient, snapshot);
        }

        notify("error", meta.errorMessage ?? this.getErrorMessage(args[0]));

        return options.onError?.(...args);
      },

      onSuccess: (...args) => {
        if (syncsCache) {
          this.runWritePlan({
            operationName,
            plan,
            queryClient,
            resourceName,
            response: args[0],
            wasOptimistic: this.takeOptimisticWrite(args[1]) !== undefined,
          });
        }

        if (meta.successMessage) {
          notify("success", meta.successMessage);
        }

        return options.onSuccess?.(...args);
      },
    };
  }

  applyQueryDefaults(queryClient: QueryClient) {
    this.resourceNames.forEach((resourceName) => {
      queryClient.setQueryDefaults([resourceName], {
        staleTime: this.getRulesFor(resourceName).staysFreshFor,
      });
    });
  }

  static writeFromResponse<TResponse>(
    pickRecord?: (response: TResponse) => RecordWithId | null | undefined,
  ): WritePlan {
    return {
      pickRecord: (response) =>
        DataHandler.toRecord(
          pickRecord ? pickRecord(response as TResponse) : response,
        ),
      strategy: "fromResponse",
    };
  }

  static reloadAfterWrite(...queryKeys: readonly QueryKey[]): WritePlan {
    return { queryKeys, strategy: "reload" };
  }

  static writeOptimistically<TVariables>(
    pickRecord: (variables: TVariables) => RecordWithId,
  ): WritePlan {
    return {
      pickRecord: (variables) =>
        DataHandler.toRecord(pickRecord(variables as TVariables)),
      strategy: "optimistic",
    };
  }

  static skipCacheWrite(): WritePlan {
    return { strategy: "skip" };
  }

  protected onWriteCompleted(event: WriteEvent<TResource>) {
    const nodeEnv = (
      globalThis as { process?: { env?: { NODE_ENV?: string } } }
    ).process?.env?.NODE_ENV;

    if (nodeEnv === "production") {
      return;
    }

    console.debug(
      `[data-handler] ${event.operationName}: ${event.outcome} in "${event.resourceName}"` +
        ` (${event.strategy}${event.wasOptimistic ? ", applied early" : ""})` +
        ` | reloaded: ${event.reloadedResources.join(", ") || "-"}`,
      [...event.updatedQueryKeys, ...event.reloadedQueryKeys],
    );
  }

  protected getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "The request failed.";
  }

  protected isDeleteOperation(operationName: string) {
    return operationName.startsWith("delete");
  }

  static writeRecordToCache(
    queryClient: QueryClient,
    resourceName: string,
    record: RecordWithId,
  ) {
    return DataHandler.updateMatchingQueries(
      queryClient,
      resourceName,
      (cached) =>
        DataHandler.mapResponseRecords(cached, (records) =>
          records.some((cachedRecord) => cachedRecord.id === record.id)
            ? records.map((cachedRecord) =>
                cachedRecord.id === record.id
                  ? { ...cachedRecord, ...record }
                  : cachedRecord,
              )
            : undefined,
        ),
    );
  }

  static removeRecordFromCache(
    queryClient: QueryClient,
    resourceName: string,
    recordId: RecordWithId["id"],
  ) {
    return DataHandler.updateMatchingQueries(
      queryClient,
      resourceName,
      (cached) =>
        DataHandler.mapResponseRecords(cached, (records) => {
          const remaining = records.filter((record) => record.id !== recordId);

          return remaining.length === records.length ? undefined : remaining;
        }),
    );
  }

  static invalidateResource(queryClient: QueryClient, resourceName: string) {
    void queryClient.invalidateQueries({ queryKey: [resourceName] });
  }

  static invalidateQueries(
    queryClient: QueryClient,
    queryKeys: readonly QueryKey[],
  ) {
    queryKeys.forEach((queryKey) => {
      void queryClient.invalidateQueries({ queryKey });
    });
  }

  static readRecords(response: unknown): RecordWithId[] {
    if (Array.isArray(response)) {
      return response;
    }

    const data = (response as { data?: unknown } | null | undefined)?.data;

    if (Array.isArray(data)) {
      return data;
    }

    const record = DataHandler.toRecord(response);

    return record ? [record] : [];
  }

  static readPageInfo(response: unknown) {
    const records = DataHandler.readRecords(response);
    const paged = (response ?? {}) as Partial<
      Record<"limit" | "page" | "total" | "totalPages", unknown>
    >;

    const readNumber = (value: unknown, fallback: number) =>
      typeof value === "number" ? value : fallback;

    return {
      limit: readNumber(paged.limit, records.length),
      page: readNumber(paged.page, 1),
      total: readNumber(paged.total, records.length),
      totalPages: Math.max(readNumber(paged.totalPages, 1), 1),
    };
  }

  getRulesFor(resourceName: TResource) {
    return { ...this.defaultRules, ...this.rules[resourceName] };
  }

  resolveResourceName(source: string | QueryKey): TResource | undefined {
    const [first] =
      typeof source === "string" ? source.split("/").filter(Boolean) : source;

    return this.resourceNames.find((resourceName) => resourceName === first);
  }

  private async applyOptimisticWrite(
    queryClient: QueryClient,
    resourceName: TResource,
    operationName: string,
    plan: Extract<WritePlan, { strategy: "optimistic" }>,
    variables: unknown,
  ) {
    if (typeof variables !== "object" || variables === null) {
      return;
    }

    const record = plan.pickRecord(variables);

    if (!record) {
      return;
    }
    await queryClient.cancelQueries({ queryKey: [resourceName] });

    const snapshot = DataHandler.snapshotResource(queryClient, resourceName);
    const updatedQueryKeys = this.isDeleteOperation(operationName)
      ? DataHandler.removeRecordFromCache(queryClient, resourceName, record.id)
      : DataHandler.writeRecordToCache(queryClient, resourceName, record);

    if (updatedQueryKeys.length) {
      this.optimisticWrites.set(variables, snapshot);
    }
  }

  private takeOptimisticWrite(variables: unknown) {
    if (typeof variables !== "object" || variables === null) {
      return undefined;
    }

    const snapshot = this.optimisticWrites.get(variables);
    this.optimisticWrites.delete(variables);

    return snapshot;
  }

  private runWritePlan({
    operationName,
    plan,
    queryClient,
    resourceName,
    response,
    wasOptimistic,
  }: {
    operationName: string;
    plan: WritePlan;
    queryClient: QueryClient;
    resourceName: TResource;
    response: unknown;
    wasOptimistic: boolean;
  }) {
    if (plan.strategy === "skip") {
      this.onWriteCompleted({
        operationName,
        outcome: "skipped",
        reloadedQueryKeys: [],
        reloadedResources: [],
        resourceName,
        strategy: plan.strategy,
        updatedQueryKeys: [],
        wasOptimistic,
      });

      return;
    }

    const deletes = this.isDeleteOperation(operationName);
    const record = DataHandler.readResponseRecord(plan, response);

    const updatedQueryKeys = !record
      ? []
      : deletes
        ? DataHandler.removeRecordFromCache(
            queryClient,
            resourceName,
            record.id,
          )
        : DataHandler.writeRecordToCache(queryClient, resourceName, record);

    const reloadedQueryKeys = plan.strategy === "reload" ? plan.queryKeys : [];
    const changedCache =
      updatedQueryKeys.length > 0 ||
      wasOptimistic ||
      reloadedQueryKeys.length > 0;

    const { alsoChanges } = this.getRulesFor(resourceName);
    const reloadedResources = changedCache
      ? alsoChanges
      : [resourceName, ...alsoChanges];

    DataHandler.invalidateQueries(queryClient, reloadedQueryKeys);
    reloadedResources.forEach((reloaded) =>
      DataHandler.invalidateResource(queryClient, reloaded),
    );

    this.onWriteCompleted({
      operationName,
      outcome:
        updatedQueryKeys.length || wasOptimistic
          ? deletes
            ? "removed"
            : "merged"
          : "reloaded",
      reloadedQueryKeys,
      reloadedResources,
      resourceName,
      strategy: plan.strategy,
      updatedQueryKeys,
      wasOptimistic,
    });
  }

  private readonly optimisticWrites = new WeakMap<object, CacheSnapshot>();

  private static readonly defaultWritePlan = DataHandler.writeFromResponse();

  private static readResponseRecord(plan: WritePlan, response: unknown) {
    switch (plan.strategy) {
      case "fromResponse":
        return plan.pickRecord(response);
      case "optimistic":
        return DataHandler.toRecord(response);
      default:
        return undefined;
    }
  }

  private static toRecord(value: unknown): RecordWithId | undefined {
    const id = (value as RecordWithId | undefined)?.id;

    return typeof id === "string" || typeof id === "number"
      ? (value as RecordWithId)
      : undefined;
  }

  private static mapResponseRecords(
    response: unknown,
    mapRecords: (records: RecordWithId[]) => RecordWithId[] | undefined,
  ): unknown {
    if (Array.isArray(response)) {
      return mapRecords(response);
    }

    if (typeof response !== "object" || response === null) {
      return undefined;
    }

    const { data } = response as { data?: unknown };

    if (Array.isArray(data)) {
      const nextData = mapRecords(data);

      return nextData && { ...response, data: nextData };
    }

    const record = DataHandler.toRecord(response);

    return record && mapRecords([record])?.[0];
  }

  private static updateMatchingQueries(
    queryClient: QueryClient,
    resourceName: string,
    getNextResponse: (cached: unknown) => unknown,
  ) {
    const changedQueryKeys: QueryKey[] = [];

    for (const query of queryClient
      .getQueryCache()
      .findAll({ queryKey: [resourceName] })) {
      const nextResponse = getNextResponse(query.state.data);

      if (nextResponse === undefined) {
        continue;
      }

      queryClient.setQueryData(query.queryKey, nextResponse);
      changedQueryKeys.push(query.queryKey);
    }

    return changedQueryKeys;
  }

  private static snapshotResource(
    queryClient: QueryClient,
    resourceName: string,
  ): CacheSnapshot {
    return queryClient
      .getQueryCache()
      .findAll({ queryKey: [resourceName] })
      .map((query) => [query.queryKey, query.state.data] as const);
  }

  private static restoreSnapshot(
    queryClient: QueryClient,
    snapshot: CacheSnapshot,
  ) {
    snapshot.forEach(([queryKey, data]) =>
      queryClient.setQueryData(queryKey, data),
    );
  }

  private static extractWriteMeta(meta: unknown) {
    const { cache, errorMessage, successMessage } = (meta ?? {}) as Record<
      string,
      unknown
    >;
    const strategy = (cache as WritePlan | undefined)?.strategy;
    const isWritePlan =
      strategy === "fromResponse" ||
      strategy === "reload" ||
      strategy === "optimistic" ||
      strategy === "skip";

    return {
      cache: isWritePlan ? (cache as WritePlan) : undefined,
      errorMessage: typeof errorMessage === "string" ? errorMessage : undefined,
      successMessage:
        typeof successMessage === "string" ? successMessage : undefined,
    };
  }
}
