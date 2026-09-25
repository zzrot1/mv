"use client";

import {
  DataHandler,
  type ResourceRules,
  type WriteEvent,
  type WriteMeta,
} from "orval-data-handler";

import {
  allApiResourceNames,
  type AllApiResourceName,
} from "@/service-api/generated/api-resource-names";
import { getErrorMessage } from "orval-data-handler";

const nonDataResourceNames = ["auth"] as const;

type NonDataResourceName = (typeof nonDataResourceNames)[number];

export type ApiResourceName = Exclude<AllApiResourceName, NonDataResourceName>;
export type ApiMutationMeta = WriteMeta;

const nonDataResources: ReadonlySet<string> = new Set(nonDataResourceNames);

class ApiDataHandler extends DataHandler<ApiResourceName> {
  protected readonly resourceNames = allApiResourceNames.filter(
    (resourceName): resourceName is ApiResourceName =>
      !nonDataResources.has(resourceName),
  );

  protected readonly rules: ResourceRules<ApiResourceName> = {};

  protected getErrorMessage(error: unknown) {
    return getErrorMessage(error);
  }

  protected onWriteCompleted(event: WriteEvent<ApiResourceName>) {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    console.debug(
      `[data] ${event.operationName}: ${event.outcome} in "${event.resourceName}"` +
        ` (${event.strategy}${event.wasOptimistic ? ", optimistic" : ""})` +
        ` | reloaded: ${event.reloadedResources.join(", ") || "-"}`,
      [...event.updatedQueryKeys, ...event.reloadedQueryKeys],
    );
  }
}

export const apiDataHandler = new ApiDataHandler();
