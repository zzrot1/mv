"use client";

import type { ReactNode } from "react";

import { useDataGridContext } from "../grid-context";

export function GridToolbar({ children }: { children: ReactNode }) {
  const { slot } = useDataGridContext();

  return <div {...slot("toolbar", "rc-grid__toolbar")}>{children}</div>;
}

export function GridResetFilters() {
  const { grid, labels, slot } = useDataGridContext();

  if (!grid.filters.hasActive) {
    return null;
  }

  return (
    <button
      {...slot("button", "rc-button")}
      data-variant="ghost"
      onClick={grid.filters.reset}
      type="button"
    >
      {labels.resetFilters}
    </button>
  );
}
