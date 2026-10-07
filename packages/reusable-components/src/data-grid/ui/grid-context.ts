"use client";

import { createContext, useContext } from "react";

import type { ConfirmPort } from "../application/ports";
import type { GridLabels } from "./labels";
import type { SlotResolver } from "./slots";
import type { DataGridInstance } from "./use-data-grid";

export type DataGridContextValue<TRow> = {
  confirm: ConfirmPort;
  grid: DataGridInstance<TRow>;
  labels: GridLabels;
  slot: SlotResolver;
};

export const DataGridContext =
  createContext<DataGridContextValue<unknown> | null>(null);

export function useDataGridContext<TRow = unknown>(): DataGridContextValue<TRow> {
  const context = useContext(DataGridContext);

  if (!context) {
    throw new Error("Data grid parts must be rendered inside <DataGrid>.");
  }

  // The context erases the row type; every part renders inside the grid that set it.
  return context as unknown as DataGridContextValue<TRow>;
}
