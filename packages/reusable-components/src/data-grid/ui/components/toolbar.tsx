"use client";

import type { ReactNode } from "react";

import { useGridContext } from "../context";
import { FilterControl } from "./filter-control";

export function GridToolbar({ children }: { children: ReactNode }) {
  const { slot } = useGridContext();

  return <div {...slot("toolbar", "rc-grid__toolbar")}>{children}</div>;
}

export function GridFilters() {
  const { grid, labels } = useGridContext();
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

export function GridResetFilters() {
  const { grid, labels, slot } = useGridContext();

  return grid.filters.hasActive ? (
    <button {...slot("button", "rc-button")} data-variant="ghost" onClick={grid.filters.reset} type="button">
      {labels.resetFilters}
    </button>
  ) : null;
}
