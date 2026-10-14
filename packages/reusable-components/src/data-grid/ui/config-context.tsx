"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { ConfirmPort } from "../application/ports";
import type { GridLabels } from "./labels";
import type { LoadingOverlayOptions } from "./types";

export type DataGridConfig = {
  labels?: Partial<GridLabels>;
  confirm?: ConfirmPort;
  loadingOverlay?: LoadingOverlayOptions | false;
  pageSizeOptions?: readonly number[];
};

const DataGridConfigContext = createContext<DataGridConfig>({});

export function DataGridConfigProvider({
  children,
  ...config
}: DataGridConfig & { children: ReactNode }) {
  const parent = useContext(DataGridConfigContext);
  const value: DataGridConfig = {
    ...parent,
    ...config,
    labels: { ...parent.labels, ...config.labels },
  };

  return <DataGridConfigContext value={value}>{children}</DataGridConfigContext>;
}

export function useDataGridConfig() {
  return useContext(DataGridConfigContext);
}
