"use client";

import {
  DataHandler,
  type ResourceRules,
  type WriteMeta,
} from "orval-data-handler";

import {
  allApiResourceNames,
  type AllApiResourceName,
} from "@/service-api/generated/api-resource-names";

const nonDataResourceNames = ["auth"] as const satisfies readonly AllApiResourceName[];

type NonDataResourceName = (typeof nonDataResourceNames)[number];

export type ApiResourceName = Exclude<AllApiResourceName, NonDataResourceName>;
export type ApiMutationMeta = WriteMeta;

const nonDataResources: ReadonlySet<string> = new Set(nonDataResourceNames);

function isDataResource(
  resourceName: AllApiResourceName,
): resourceName is ApiResourceName {
  return !nonDataResources.has(resourceName);
}

class ApiDataHandler extends DataHandler<ApiResourceName> {
  protected readonly resourceNames = allApiResourceNames.filter(isDataResource);

  protected readonly rules: ResourceRules<ApiResourceName> = {};
}

export const apiDataHandler = new ApiDataHandler();
