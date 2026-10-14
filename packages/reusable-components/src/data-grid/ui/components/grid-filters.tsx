"use client";

import { useDataGridContext } from "../grid-context";
import { FilterControl } from "./filter-control";

export function GridFilters() {
  const { grid, labels } = useDataGridContext();
  const { toolbar } = grid.filters;

  return toolbar.definitions.map((filter) => (
    <FilterControl
      debounceMs={toolbar.getDebounceMs(filter)}
      id={filter.id}
      key={filter.id}
      label={filter.label ?? (filter.variant === "search" ? labels.search : filter.id)}
      onChange={(value) => toolbar.set(filter.id, value)}
      options={toolbar.getOptions(filter)}
      placeholder={filter.placeholder}
      placement="toolbar"
      render={filter.render}
      value={toolbar.values[filter.id]}
      variant={filter.variant ?? "text"}
    />
  ));
}
