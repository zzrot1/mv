"use client";

import type { ReactNode } from "react";

import { cx } from "../../../shared/class-names";
import type { ConfirmPort } from "../../application/ports";
import { useDataGridConfig } from "../config-context";
import { DataGridContext, type DataGridContextValue } from "../grid-context";
import { defaultGridLabels } from "../labels";
import { createSlotResolver } from "../slots";
import { GridStyles } from "../styles/grid-styles";
import { themeToStyle } from "../styles/theme";
import type { GridAppearance } from "../types";
import type { DataGridInstance } from "../use-data-grid";

export type DataGridProps<TRow> = GridAppearance & {
  grid: DataGridInstance<TRow>;
  confirm?: ConfirmPort;
  children: ReactNode;
};

export function DataGrid<TRow>({
  children,
  className,
  classNames,
  colorScheme,
  confirm,
  grid,
  labels,
  style,
  styles,
  theme,
  unstyled = false,
}: DataGridProps<TRow>) {
  const config = useDataGridConfig();
  const slot = createSlotResolver(classNames, styles);
  const context: DataGridContextValue<TRow> = {
    confirm: confirm ?? config.confirm ?? confirmInBrowser,
    grid,
    labels: { ...defaultGridLabels, ...config.labels, ...labels },
    slot,
  };

  return (
    <DataGridContext value={context as unknown as DataGridContextValue<unknown>}>
      {unstyled ? null : <GridStyles />}
      <div
        {...slot("root", cx("rc-root rc-grid", className), {
          ...themeToStyle(theme),
          ...style,
        })}
        data-color-scheme={colorScheme}
      >
        {children}
      </div>
    </DataGridContext>
  );
}

function confirmInBrowser(message: string) {
  return typeof window === "undefined" || window.confirm(message);
}
