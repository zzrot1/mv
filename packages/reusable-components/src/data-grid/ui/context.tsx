"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { SlotResolver } from "../../shared/slots";
import type { ConfirmPort } from "../application/server-query";
import type { GridLabels } from "./labels";
import type { GridSlot, LoadingOverlayOptions } from "./types";
import type { DataGridInstance } from "./use-data-grid";

export type DataGridConfig = {
  labels?: Partial<GridLabels>;
  confirm?: ConfirmPort;
  loadingOverlay?: LoadingOverlayOptions | false;
  pageSizeOptions?: readonly number[];
};

const ConfigContext = createContext<DataGridConfig>({});

export function DataGridConfigProvider({ children, ...config }: DataGridConfig & { children: ReactNode }) {
  const parent = useContext(ConfigContext);

  return (
    <ConfigContext value={{ ...parent, ...config, labels: { ...parent.labels, ...config.labels } }}>
      {children}
    </ConfigContext>
  );
}

export function useDataGridConfig() {
  return useContext(ConfigContext);
}

type GridContextValue<TRow> = {
  confirm: ConfirmPort;
  css: (className: string) => string | undefined;
  grid: DataGridInstance<TRow>;
  labels: GridLabels;
  slot: SlotResolver<GridSlot>;
  unstyled: boolean;
};

const GridContext = createContext<GridContextValue<unknown> | null>(null);

export function GridProvider<TRow>({ children, value }: { children: ReactNode; value: GridContextValue<TRow> }) {
  return <GridContext value={value as unknown as GridContextValue<unknown>}>{children}</GridContext>;
}

export function useGridContext<TRow = unknown>() {
  const context = useContext(GridContext);

  if (!context) {
    throw new Error("Data grid parts must be rendered inside <DataGrid>.");
  }

  return context as unknown as GridContextValue<TRow>;
}
