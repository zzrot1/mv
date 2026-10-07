import { resolveFilterMode } from "../domain/processing-modes";
import type {
  FilterValues,
  GridQuery,
  GridState,
  ProcessingMode,
  ProcessingModes,
} from "../domain/types";

// Only the steps the server runs: a change in a client step never needs a request.
export type ServerGridQuery = Partial<GridQuery>;

export function toServerQuery(
  state: GridState,
  modes: ProcessingModes,
  filters: readonly { id: string; mode?: ProcessingMode }[],
): ServerGridQuery {
  const serverFilterIds = filters
    .filter((filter) => resolveFilterMode(filter, modes) === "server")
    .map((filter) => filter.id);

  return {
    ...(serverFilterIds.length
      ? { filters: pickValues(state.filters, serverFilterIds) }
      : {}),
    ...(modes.columnFilters === "server"
      ? { columnFilters: state.columnFilters }
      : {}),
    ...(modes.sorting === "server" ? { sorting: state.sorting } : {}),
    ...(modes.pagination === "server" ? { pagination: state.pagination } : {}),
  };
}

function pickValues(values: FilterValues, ids: readonly string[]): FilterValues {
  const picked: Record<string, unknown> = {};

  for (const id of ids) {
    if (id in values) {
      picked[id] = values[id];
    }
  }

  return picked;
}
