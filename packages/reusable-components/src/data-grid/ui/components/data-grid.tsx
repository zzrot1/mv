"use client";

import type { ReactNode } from "react";

import { cx } from "../../../shared/class-names";
import { createSlotResolver } from "../../../shared/slots";
import { themeToStyle } from "../../../shared/theme";
import type { ConfirmPort } from "../../application/server-query";
import { GridProvider, useDataGridConfig } from "../context";
import { defaultGridLabels } from "../labels";
import type { GridAppearance } from "../types";
import type { DataGridInstance } from "../use-data-grid";

import "../../../shared/base.css";
import "../styles.css";

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
  const slot = createSlotResolver(classNames, styles, unstyled);
  const root = slot("root", "rc-root rc-grid", { ...themeToStyle(theme), ...style });

  return (
    <GridProvider
      value={{
        confirm: confirm ?? config.confirm ?? confirmInBrowser,
        css: (builtIn) => (unstyled ? undefined : builtIn),
        grid,
        labels: { ...defaultGridLabels, ...config.labels, ...labels },
        slot,
        unstyled,
      }}
    >
      <div className={cx(root.className, className)} data-color-scheme={colorScheme} style={root.style}>
        {children}
      </div>
    </GridProvider>
  );
}

function confirmInBrowser(message: string) {
  return typeof window !== "undefined" && window.confirm(message);
}
