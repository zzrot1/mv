import type { GridFeature, ProcessingMode, ProcessingModes } from "./types";

export type ProcessingModesOption =
  | ProcessingMode
  | Partial<Record<GridFeature, ProcessingMode>>;

// A page that came from the server can't be searched, filtered or sorted as a
// whole on the client, so server pagination moves every step to the server.
export function resolveProcessingModes(
  option: ProcessingModesOption = "client",
): ProcessingModes {
  const pick = (feature: GridFeature) =>
    typeof option === "string" ? option : (option[feature] ?? "client");

  if (pick("pagination") === "server") {
    return modesFor(() => "server");
  }

  return modesFor(pick);
}

export function resolveFilterMode(
  filter: { mode?: ProcessingMode },
  modes: ProcessingModes,
): ProcessingMode {
  return modes.pagination === "server" ? "server" : (filter.mode ?? modes.filters);
}

export function hasServerProcessing(
  modes: ProcessingModes,
  filters: readonly { mode?: ProcessingMode }[],
) {
  return (
    Object.values(modes).includes("server") ||
    filters.some((filter) => resolveFilterMode(filter, modes) === "server")
  );
}

function modesFor(
  pick: (feature: GridFeature) => ProcessingMode,
): ProcessingModes {
  return {
    columnFilters: pick("columnFilters"),
    filters: pick("filters"),
    pagination: pick("pagination"),
    sorting: pick("sorting"),
  };
}
