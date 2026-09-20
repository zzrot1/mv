import type { QueryKey } from "@tanstack/react-query";

/**
 * Contractul dupa care gasim o inregistrare in cache: are `id`.
 * `number` e acolo fiindca destule API-uri numeroteaza utilizatorii.
 */
export type RecordWithId = { id: string | number };

type DefinedResponse<T> = NonNullable<T>;

/**
 * Inregistrarile dintr-un raspuns, la nivel de tip. Perechea de compilare a lui
 * `DataHandler.readRecords`, ca `dataPage.records` sa fie tipizat fara adnotari.
 */
export type RecordsOf<TResponse> =
  [DefinedResponse<TResponse>] extends [readonly (infer TRecord)[]]
    ? TRecord[]
    : [DefinedResponse<TResponse>] extends [{ data: readonly (infer TRecord)[] }]
      ? TRecord[]
      : DefinedResponse<TResponse>[];

/**
 * Exceptiile de la `defaultRules`, per resursa. Ce lipseste se completeaza de acolo.
 */
export type ResourceRules<TResource extends string> = Partial<
  Record<TResource, { staysFreshFor?: number; alsoChanges?: readonly TResource[] }>
>;

/**
 * Ce se intampla cu cache-ul in jurul unei scrieri.
 */
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

/**
 * Ce poate cere un call site prin `mutation.meta`.
 */
export type WriteMeta = {
  successMessage?: string;
  errorMessage?: string;
  /** Ce se intampla cu cache-ul. Fara el: `writeFromResponse()`. */
  cache?: WritePlan;
};

/** Ce primeste `onWriteCompleted` dupa fiecare scriere reusita. */
export type WriteEvent<TResource extends string> = {
  operationName: string;
  resourceName: TResource;
  outcome: "merged" | "removed" | "reloaded" | "skipped";
  /** Planul cerut de call site prin `meta.cache`, sau cel implicit. */
  strategy: WritePlan["strategy"];
  /** Daca payload-ul a fost scris in cache inainte de raspuns. */
  wasOptimistic: boolean;
  /** Query key-urile chiar modificate in cache. */
  updatedQueryKeys: readonly QueryKey[];
  /** Resursele re-cerute intregi. */
  reloadedResources: readonly TResource[];
  /** Query key-urile re-cerute tintit, prin `reloadAfterWrite(key)`. */
  reloadedQueryKeys: readonly QueryKey[];
};

/** Starea query-urilor unei resurse, copiata ca sa poata fi pusa la loc. */
export type CacheSnapshot = readonly (readonly [QueryKey, unknown])[];
