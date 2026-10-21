"use client";

import { useId, type ReactNode } from "react";

import { cx } from "../shared/class-names";
import { createSlotResolver } from "../shared/slots";
import { themeToStyle } from "../shared/theme";
import type { ConfirmPort } from "./application/server-query";
import { GridBulkActions } from "./ui/components/actions";
import { DataGrid } from "./ui/components/data-grid";
import { GridPagination } from "./ui/components/pagination";
import { GridTable, type GridTableProps } from "./ui/components/table";
import { GridFilters, GridResetFilters, GridToolbar } from "./ui/components/toolbar";
import type { BulkAction, GridAppearance } from "./ui/types";
import { useDataGrid, type DataGridOptions } from "./ui/use-data-grid";

export type PageWithGridProps<TRow> = DataGridOptions<TRow> &
  GridAppearance &
  GridTableProps<TRow> & {
    title?: ReactNode;
    description?: ReactNode;
    headerActions?: ReactNode;
    toolbarActions?: ReactNode;
    /** Turns on row selection. */
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
  ...options
}: PageWithGridProps<TRow>) {
  const titleId = useId();
  const grid = useDataGrid({ ...options, enableRowSelection: options.enableRowSelection ?? bulkActions.length > 0 });
  const slot = createSlotResolver(classNames, styles, unstyled);
  const page = slot("page", "rc-root rc-page", { ...themeToStyle(theme), ...style });

  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={cx(page.className, className)}
      data-color-scheme={colorScheme}
      style={page.style}
    >
      {title || description || headerActions ? (
        <header {...slot("pageHeader", "rc-page__header")}>
          <div>
            {title ? (
              <h1 {...slot("pageTitle", "rc-page__title")} id={titleId}>
                {title}
              </h1>
            ) : null}
            {description ? <p {...slot("pageDescription", "rc-page__description")}>{description}</p> : null}
          </div>
          {headerActions ? <div {...slot("pageActions", "rc-page__actions")}>{headerActions}</div> : null}
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
          {toolbarActions ? <div className={unstyled ? undefined : "rc-grid__toolbar-end"}>{toolbarActions}</div> : null}
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
