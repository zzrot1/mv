"use client";

import type { CSSProperties, ReactNode } from "react";

import { Checkbox } from "../../../inputs";
import { cx } from "../../../shared/class-names";
import { SortIcon } from "../../../shared/icons";
import { isEmptyValue, isSearchableColumn, isSortableColumn, readValue, toText } from "../../domain/values";
import { useDataGridConfig, useGridContext } from "../context";
import type { ColumnDef, LoadingOverlayOptions, RowAction, RowActionsRenderContext } from "../types";
import type { GridRow } from "../use-data-grid";
import { ActionButton, messageFor, RowActionsMenu } from "./actions";
import { ColumnFilter } from "./filter-control";
import { LoadingOverlay } from "./loading-overlay";

export type GridTableProps<TRow> = {
  caption?: string;
  emptyState?: ReactNode;
  error?: ReactNode;
  isFetching?: boolean;
  isLoading?: boolean;
  height?: number | string;
  loadingOverlay?: LoadingOverlayOptions | false;
  rowActions?: readonly RowAction<TRow>[];
  rowActionsDisplay?: "menu" | "inline";
  renderRowActions?: (context: RowActionsRenderContext<TRow>) => ReactNode;
};

const ariaSort = { asc: "ascending", desc: "descending" } as const;

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
  const config = useDataGridConfig();
  const { css, grid, labels, slot, unstyled } = useGridContext<TRow>();
  const overlay = loadingOverlay ?? config.loadingOverlay ?? {};
  const hasActions = rowActions.length > 0 || renderRowActions !== undefined;
  const busy = isLoading || isFetching || grid.isProcessing;
  const fixedHeight = typeof height === "number" ? `${height}px` : height;
  const { selection } = grid;

  function renderActions(row: GridRow<TRow>, rowName: string) {
    if (renderRowActions) {
      return renderRowActions({ row: row.original, rowId: row.id, rowName });
    }

    const visible = rowActions.filter((action) => !action.isHidden?.(row.original));

    if (rowActionsDisplay === "menu") {
      return visible.length ? <RowActionsMenu actions={visible} row={row.original} rowName={rowName} /> : null;
    }

    return (
      <div className={css("rc-grid__row-actions")}>
        {visible.map((action) => (
          <ActionButton
            accessibleLabel={labels.rowAction(action.label, rowName)}
            confirmMessage={messageFor(action.confirm, row.original)}
            disabled={action.isDisabled?.(row.original)}
            icon={action.icon}
            key={action.id}
            label={action.label}
            onAction={() => action.onClick(row.original)}
            size="small"
            tone={action.tone}
            variant="ghost"
          />
        ))}
      </div>
    );
  }

  function renderMessage(content: ReactNode, tone?: "danger") {
    return (
      <tr>
        <td
          {...slot("state", "rc-grid__state")}
          colSpan={grid.columns.length + Number(selection.enabled) + Number(hasActions)}
          data-tone={tone}
        >
          {content ? <div role={tone ? "alert" : "status"}>{content}</div> : null}
        </td>
      </tr>
    );
  }

  function renderBody() {
    if (error) {
      return renderMessage(error, "danger");
    }

    if (!grid.rows.length) {
      return renderMessage(isLoading ? (overlay === false ? labels.loading : null) : (emptyState ?? labels.noResults));
    }

    return grid.rows.map((row) => (
      <TableRow actions={hasActions ? renderActions : undefined} key={row.id} row={row} />
    ));
  }

  return (
    <div
      {...slot(
        "tableFrame",
        "rc-grid__table-frame",
        (fixedHeight
          ? { "--_table-height": fixedHeight }
          : grid.pagination.enabled
            ? { "--_reserved-rows": String(grid.pagination.pageSize) }
            : undefined) as CSSProperties | undefined,
      )}
      data-fixed-height={fixedHeight ? "" : undefined}
    >
      <div {...slot("tableWrapper", "rc-grid__table-wrapper")}>
        <table aria-busy={busy || undefined} {...slot("table", "rc-grid__table")}>
          {caption ? <caption className={css("rc-visually-hidden")}>{caption}</caption> : null}
          <thead>
            <tr>
              {selection.enabled ? (
                <th {...slot("headerCell", "rc-grid__header-cell rc-grid__select-cell")} scope="col">
                  <Checkbox
                    {...slot("checkbox", "")}
                    aria-label={labels.selectAllRows}
                    checked={selection.pageStatus === "all"}
                    disabled={!grid.rows.length}
                    indeterminate={selection.pageStatus === "some"}
                    onCheckedChange={selection.setPageSelected}
                    unstyled={unstyled}
                  />
                </th>
              ) : null}
              {grid.columns.map((column) => (
                <HeaderCell column={column} key={column.id} />
              ))}
              {hasActions ? (
                <th {...slot("headerCell", "rc-grid__header-cell rc-grid__actions-cell")} scope="col">
                  <span className={css("rc-visually-hidden")}>{labels.actions}</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>{renderBody()}</tbody>
        </table>
      </div>
      {overlay === false ? null : <LoadingOverlay active={busy} options={overlay} />}
    </div>
  );
}

function HeaderCell<TRow>({ column }: { column: ColumnDef<TRow> }) {
  const { css, grid, slot } = useGridContext<TRow>();
  const direction = grid.sorting.getDirection(column.id);
  const sortable = isSortableColumn(column);
  const cell = slot("headerCell", "rc-grid__header-cell", column.width ? { width: column.width } : undefined);

  return (
    <th
      aria-sort={sortable ? (direction ? ariaSort[direction] : "none") : undefined}
      className={cx(cell.className, column.className)}
      data-align={column.align}
      scope="col"
      style={cell.style}
    >
      <span className={css("rc-grid__header")}>
        {sortable ? (
          <button
            className={css("rc-grid__sort")}
            onClick={(event) => grid.sorting.toggle(column.id, event.shiftKey)}
            type="button"
          >
            {column.header}
            <span className={css("rc-grid__sort-icon")}>
              <SortIcon direction={direction} />
            </span>
          </button>
        ) : (
          column.header
        )}
        {column.filter ? <ColumnFilter column={column} /> : null}
      </span>
    </th>
  );
}

function TableRow<TRow>({
  actions,
  row,
}: {
  actions: ((row: GridRow<TRow>, rowName: string) => ReactNode) | undefined;
  row: GridRow<TRow>;
}) {
  const { css, grid, labels, slot, unstyled } = useGridContext<TRow>();
  const selected = grid.selection.isSelected(row.id);
  const nameColumn = grid.columns.find(isSearchableColumn);
  const rowName = (nameColumn && toText(readValue(row.original, nameColumn.accessor))) || row.id;
  const cell = slot("cell", "rc-grid__cell");

  return (
    <tr {...slot("row", "rc-grid__row")} data-selected={selected || undefined}>
      {grid.selection.enabled ? (
        <td {...slot("cell", "rc-grid__cell rc-grid__select-cell")}>
          <Checkbox
            {...slot("checkbox", "")}
            aria-label={labels.selectRow(rowName)}
            checked={selected}
            onCheckedChange={(checked) => grid.selection.setSelected(row.id, checked)}
            unstyled={unstyled}
          />
        </td>
      ) : null}
      {grid.columns.map((column) => {
        const value = readValue(row.original, column.accessor);

        return (
          <td className={cx(cell.className, column.className)} data-align={column.align} key={column.id} style={cell.style}>
            {column.cell ? (
              column.cell({ row: row.original, rowId: row.id, value })
            ) : isEmptyValue(value) ? (
              <span className={css("rc-grid__empty-value")}>{labels.emptyValue}</span>
            ) : typeof value === "boolean" ? (
              value ? labels.yes : labels.no
            ) : (
              toText(value).slice(0, value instanceof Date ? 10 : undefined)
            )}
          </td>
        );
      })}
      {actions ? <td {...slot("cell", "rc-grid__cell rc-grid__actions-cell")}>{actions(row, rowName)}</td> : null}
    </tr>
  );
}
