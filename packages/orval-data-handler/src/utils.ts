import type { QueryKey } from "@tanstack/react-query";

export type RecordWithId = { id: string | number };

type DefinedResponse<T> = NonNullable<T>;

export type RecordsOf<TResponse> =
  [DefinedResponse<TResponse>] extends [readonly (infer TRecord)[]]
    ? TRecord[]
    : [DefinedResponse<TResponse>] extends [{ data: readonly (infer TRecord)[] }]
      ? TRecord[]
      : DefinedResponse<TResponse>[];

export type ResourceRules<TResource extends string> = Partial<
  Record<TResource, { staysFreshFor?: number; alsoChanges?: readonly TResource[] }>
>;

export type WritePlan =
  | {
      readonly strategy: "fromResponse";
      readonly pickRecord: (response: unknown) => RecordWithId | undefined;
    }
  | { readonly strategy: "reload"; readonly queryKeys: readonly QueryKey[] }
  | {
      readonly strategy: "optimistic";
      readonly pickRecord: (variables: unknown) => RecordWithId | undefined;
    }
  | { readonly strategy: "skip" };

export type WriteMeta = {
  successMessage?: string;
  errorMessage?: string;
    cache?: WritePlan;
};

export type WriteEvent<TResource extends string> = {
  operationName: string;
  resourceName: TResource;
  outcome: "merged" | "removed" | "reloaded" | "skipped";
    strategy: WritePlan["strategy"];
    wasOptimistic: boolean;
    updatedQueryKeys: readonly QueryKey[];
    reloadedResources: readonly TResource[];
    reloadedQueryKeys: readonly QueryKey[];
};

export type CacheSnapshot = readonly (readonly [QueryKey, unknown])[];
