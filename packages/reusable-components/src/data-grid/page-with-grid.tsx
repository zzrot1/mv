"use client";

import { useId, type ReactNode } from "react";

import { cx } from "../shared/class-names";
import type { ConfirmPort } from "./application/ports";
import { DataGrid } from "./ui/components/data-grid";
import { GridBulkActions } from "./ui/components/grid-bulk-actions";
import { GridFilters } from "./ui/components/grid-filters";
import { GridPagination } from "./ui/components/grid-pagination";
import { GridTable, type GridTableProps } from "./ui/components/grid-table";
import { GridResetFilters, GridToolbar } from "./ui/components/grid-toolbar";
import { createSlotResolver } from "./ui/slots";
import { themeToStyle } from "./ui/styles/theme";
import type { BulkAction, GridAppearance } from "./ui/types";
import { useDataGrid, type DataGridOptions } from "./ui/use-data-grid";

export type PageWithGridProps<TRow> = DataGridOptions<TRow> &
  GridAppearance &
  GridTableProps<TRow> & {
    title?: ReactNode;
    description?: ReactNode;
    headerActions?: ReactNode;
    toolbarActions?: ReactNode;
    // Turns on row selection.
    bulkActions?: readonly BulkAction<TRow>[];
    confirm?: ConfirmPort;
  };

export function PageWithGrid<TRow>({
  bulkActions = [],
  caption,
  className,
  classNames,
  colorScheme,
  confirm,
  description,
  emptyState,
  error,
  headerActions,
  height,
  isFetching,
  isLoading,
  labels,
  loadingOverlay,
  renderRowActions,
  rowActions,
  rowActionsDisplay,
  style,
  styles,
  theme,
  title,
  toolbarActions,
  unstyled,
  ...gridOptions
}: PageWithGridProps<TRow>) {
  const titleId = useId();
  const grid = useDataGrid({
    ...gridOptions,
    enableRowSelection: gridOptions.enableRowSelection ?? bulkActions.length > 0,
  });
  const slot = createSlotResolver(classNames, styles);
  const hasHeader = Boolean(title || description || headerActions);

  return (
    <section
      {...slot("page", cx("rc-root rc-page", className), {
        ...themeToStyle(theme),
        ...style,
      })}
      aria-labelledby={title ? titleId : undefined}
      data-color-scheme={colorScheme}
    >
      {hasHeader ? (
        <header {...slot("pageHeader", "rc-page__header")}>
          <div>
            {title ? (
              <h1 {...slot("pageTitle", "rc-page__title")} id={titleId}>
                {title}
              </h1>
            ) : null}
            {description ? (
              <p {...slot("pageDescription", "rc-page__description")}>{description}</p>
            ) : null}
          </div>
          {headerActions ? (
            <div {...slot("pageActions", "rc-page__actions")}>{headerActions}</div>
          ) : null}
        </header>
      ) : null}

      <DataGrid
        classNames={classNames}
        colorScheme={colorScheme}
        confirm={confirm}
        grid={grid}
        labels={labels}
        styles={styles}
        unstyled={unstyled}
      >
        <GridToolbar>
          <GridFilters />
          <GridResetFilters />
          {toolbarActions ? (
            <div className="rc-grid__toolbar-end">{toolbarActions}</div>
          ) : null}
        </GridToolbar>
        <GridBulkActions actions={bulkActions} />
        <GridTable
          caption={caption}
          emptyState={emptyState}
          error={error}
          height={height}
          isFetching={isFetching}
          isLoading={isLoading}
          loadingOverlay={loadingOverlay}
          renderRowActions={renderRowActions}
          rowActions={rowActions}
          rowActionsDisplay={rowActionsDisplay}
        />
        <GridPagination />
      </DataGrid>
    </section>
  );
}
