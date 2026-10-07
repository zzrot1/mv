import type { ReactNode } from "react";

import { filterFns } from "../domain/filter-fns";
import {
  matchHandler,
  predicateHandler,
  searchHandler,
} from "../domain/filter-handlers";
import type {
  Accessor,
  ColumnModel,
  FilterFn,
  FilterVariant,
  ProcessingMode,
  RowsHandler,
} from "../domain/types";
import type {
  ColumnFilterDef,
  ControlVariant,
  FilterOption,
  FilterRenderContext,
  GridFilterDef,
} from "./types";

type BaseFilterOptions = {
  id: string;
  label: string;
  mode?: ProcessingMode;
  placeholder?: string;
};

type MatchFilterOptions<TRow> = BaseFilterOptions & {
  accessor?: Accessor<TRow>;
  // Replaces the built-in matching on `accessor`.
  predicate?: (row: TRow, value: unknown) => boolean;
};

// The default first link of the chain: every word must match a searchable column.
export function searchFilter<TRow>(
  config: Partial<BaseFilterOptions> = {},
): GridFilterDef<TRow> {
  return {
    handle: searchHandler(),
    id: config.id ?? "search",
    label: config.label,
    mode: config.mode,
    placeholder: config.placeholder,
    variant: "search",
  };
}

export function textFilter<TRow>(config: MatchFilterOptions<TRow>) {
  return matchFilter(config, "text", filterFns.includesText);
}

export function selectFilter<TRow>(
  config: MatchFilterOptions<TRow> & { options?: readonly FilterOption[] },
): GridFilterDef<TRow> {
  return { ...matchFilter(config, "select", filterFns.equals), options: config.options };
}

export function toggleFilter<TRow>(config: MatchFilterOptions<TRow>) {
  return matchFilter(config, "toggle", filterFns.isTruthy);
}

export function numberRangeFilter<TRow>(config: MatchFilterOptions<TRow>) {
  return matchFilter(config, "number-range", filterFns.inNumberRange);
}

type CustomFilterOptions<TRow, TValue> = Omit<BaseFilterOptions, "label"> & {
  label?: string;
  render: (context: FilterRenderContext<TValue>) => ReactNode;
  // Your link of the chain. Call `next` with the rows that pass.
  handle?: (
    rows: readonly TRow[],
    value: TValue,
    next: RowsHandler<TRow>,
    context: { columns: readonly ColumnModel<TRow>[] },
  ) => readonly TRow[];
};

// The grid stores filter values untyped; these two only read back what their
// own control wrote, so the casts are safe.

export function customFilter<TRow, TValue = unknown>({
  handle,
  render,
  ...config
}: CustomFilterOptions<TRow, TValue>): GridFilterDef<TRow> {
  return {
    ...config,
    handle: handle && ((rows, value, next, context) => handle(rows, value as TValue, next, context)),
    render: (context) => render(context as FilterRenderContext<TValue>),
  };
}

export function defineColumnFilter<TRow, TValue = unknown>({
  fn,
  render,
  ...config
}: {
  variant?: FilterVariant;
  placeholder?: string;
  options?: readonly FilterOption[];
  fn?: (cellValue: unknown, value: TValue, row: TRow) => boolean;
  render?: (context: FilterRenderContext<TValue>) => ReactNode;
}): ColumnFilterDef<TRow> {
  return {
    ...config,
    fn: fn && ((cellValue, value, row) => fn(cellValue, value as TValue, row)),
    render: render && ((context) => render(context as FilterRenderContext<TValue>)),
  };
}

function matchFilter<TRow>(
  { accessor, predicate, ...config }: MatchFilterOptions<TRow>,
  variant: ControlVariant,
  filterFn: FilterFn<unknown>,
): GridFilterDef<TRow> {
  const handle = predicate
    ? predicateHandler(predicate)
    : accessor !== undefined
      ? matchHandler<TRow>(accessor, filterFn)
      : undefined;

  return { ...config, accessor, handle, variant };
}
