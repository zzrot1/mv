"use client";

import type { CSSProperties, ReactNode } from "react";

import { useDataGridConfig } from "../config-context";
import { useDataGridContext } from "../grid-context";
import type {
  LoadingOverlayOptions,
  RowAction,
  RowActionsRenderContext,
} from "../types";
import { GridTableHead } from "./grid-table-head";
import { GridTableRow, type RowActionsConfig } from "./grid-table-row";
import { LoadingOverlay } from "./loading-overlay";

export type GridTableProps<TRow> = {
  caption?: string;
  emptyState?: ReactNode;
  error?: ReactNode;
  // Rows are being refetched: the current ones stay, under the overlay.
  isFetching?: boolean;
  // No rows yet.
  isLoading?: boolean;
  // A fixed height (480, "60vh"): rows scroll inside and the header stays.
  // Without it the table keeps the height of a full page while filtering.
  height?: number | string;
  // Shown while loading, fetching or re-filtering. `false` turns it off.
  loadingOverlay?: LoadingOverlayOptions | false;
  rowActions?: readonly RowAction<TRow>[];
  // "menu": one "⋯" button with a dropdown; "inline": a button per action.
  rowActionsDisplay?: "menu" | "inline";
  // Replaces the built-in actions with your own element (e.g. a shadcn DropdownMenu).
  renderRowActions?: (context: RowActionsRenderContext<TRow>) => ReactNode;
};

export function GridTable<TRow>({
  caption,
  emptyState,
  error,
  height,
  isFetching = false,
  isLoading = false,
  loadingOverlay,
  renderRowActions,
  rowActions = [],
  rowActionsDisplay = "menu",
}: GridTableProps<TRow>) {
  const { grid, labels, slot } = useDataGridContext<TRow>();
  const config = useDataGridConfig();
  const overlay = loadingOverlay ?? config.loadingOverlay ?? {};

  const actions: RowActionsConfig<TRow> | undefined =
    rowActions.length || renderRowActions
      ? { display: rowActionsDisplay, items: rowActions, render: renderRowActions }
      : undefined;
  const columnCount =
    grid.columns.length + Number(grid.selection.enabled) + Number(Boolean(actions));
  const isBusy = isLoading || isFetching || grid.isProcessing;

  const fixedHeight = typeof height === "number" ? `${height}px` : height;
  const reservedRows =
    !fixedHeight && grid.pagination.enabled ? grid.pagination.pageSize : undefined;

  function renderState(content: ReactNode, tone?: "danger") {
    return (
      <tr>
        <td {...slot("state", "rc-grid__state")} colSpan={columnCount} data-tone={tone}>
          {content ? (
            <div role={tone === "danger" ? "alert" : "status"}>{content}</div>
          ) : null}
        </td>
      </tr>
    );
  }

  function renderBody() {
    if (error) {
      return renderState(error, "danger");
    }

    if (isLoading && !grid.rows.length) {
      return renderState(overlay === false ? labels.loading : null);
    }

    if (!grid.rows.length) {
      return renderState(emptyState ?? labels.noResults);
    }

    return grid.rows.map((row) => (
      <GridTableRow actions={actions} key={row.id} row={row} />
    ));
  }

  return (
    <div
      {...slot("tableFrame", "rc-grid__table-frame", frameStyle(fixedHeight, reservedRows))}
      data-fixed-height={fixedHeight ? "" : undefined}
    >
      <div {...slot("tableWrapper", "rc-grid__table-wrapper")}>
        <table aria-busy={isBusy || undefined} {...slot("table", "rc-grid__table")}>
          {caption ? <caption className="rc-visually-hidden">{caption}</caption> : null}
          <GridTableHead showActions={Boolean(actions)} />
          <tbody>{renderBody()}</tbody>
        </table>
      </div>
      {overlay === false ? null : <LoadingOverlay active={isBusy} options={overlay} />}
    </div>
  );
}

function frameStyle(
  fixedHeight: string | undefined,
  reservedRows: number | undefined,
): CSSProperties | undefined {
  if (fixedHeight) {
    return { "--_table-height": fixedHeight } as CSSProperties;
  }

  return reservedRows
    ? ({ "--_reserved-rows": String(reservedRows) } as CSSProperties)
    : undefined;
}
