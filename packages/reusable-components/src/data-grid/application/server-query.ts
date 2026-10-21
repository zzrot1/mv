import { resolveFilterMode } from "../domain/processing-modes";
import type { GridQuery, GridState, ProcessingMode, ProcessingModes } from "../domain/types";

export type ServerGridQuery = Partial<GridQuery>;

export type ConfirmPort = (message: string) => boolean | Promise<boolean>;

export type GridQueryListener = (query: ServerGridQuery) => void;

export function toServerQuery(
  state: GridState,
  modes: ProcessingModes,
  filters: readonly { id: string; mode?: ProcessingMode }[],
): ServerGridQuery {
  const serverIds = new Set(
    filters.filter((filter) => resolveFilterMode(filter, modes) === "server").map((filter) => filter.id),
  );

  return {
    ...(serverIds.size
      ? { filters: Object.fromEntries(Object.entries(state.filters).filter(([id]) => serverIds.has(id))) }
      : {}),
    ...(modes.columnFilters === "server" ? { columnFilters: state.columnFilters } : {}),
    ...(modes.sorting === "server" ? { sorting: state.sorting } : {}),
    ...(modes.pagination === "server" ? { pagination: state.pagination } : {}),
  };
}
