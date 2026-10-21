"use client";

import { useDeferredValue, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import {
  createGridState,
  DEFAULT_PAGE_SIZE,
  gridReducer,
  hasActiveFilters,
  mergeGridState,
  type GridAction,
} from "../application/grid-state";
import { computeGridView } from "../application/grid-view";
import { toServerQuery, type GridQueryListener } from "../application/server-query";
import { getUniqueValues } from "../domain/filtering";
import {
  hasServerProcessing,
  resolveFilterMode,
  resolveProcessingModes,
  type ProcessingModesOption,
} from "../domain/processing-modes";
import { clampPageIndex, getSelectionStatus, isRowSelected, type SelectionStatus } from "../domain/rows";
import type {
  Accessor,
  FilterValues,
  GridState,
  ProcessingMode,
  ProcessingModes,
  RowId,
  SortingState,
} from "../domain/types";
import { useDataGridConfig } from "./context";
import { searchFilter } from "./filters";
import type { ColumnDef, FilterOption, GridFilterDef, GridFiltersOption } from "./types";

const EMPTY: readonly never[] = [];

export type DataGridOptions<TRow> = {
  data: readonly TRow[] | undefined;
  columns: readonly ColumnDef<TRow>[];
  filters?: GridFiltersOption<TRow>;
  /** Defaults to the row's `id`, else its index in `data`: give rows an `id` when pagination runs on the server. */
  getRowId?: (row: TRow, index: number) => RowId;
  mode?: ProcessingModesOption;
  rowCount?: number;
  initialState?: Partial<GridState>;
  state?: Partial<GridState>;
  onStateChange?: (state: GridState) => void;
  onQueryChange?: GridQueryListener;
  enablePagination?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: readonly number[];
  enableRowSelection?: boolean;
  enableMultiSort?: boolean;
  serverInputDebounceMs?: number;
};

export type GridRow<TRow> = { id: RowId; original: TRow };

export type DataGridInstance<TRow> = {
  columns: readonly ColumnDef<TRow>[];
  modes: ProcessingModes;
  state: GridState;
  rows: readonly GridRow<TRow>[];
  isProcessing: boolean;
  filters: {
    toolbar: {
      definitions: readonly GridFilterDef<TRow>[];
      getDebounceMs: (filter: GridFilterDef<TRow>) => number;
      getOptions: (filter: GridFilterDef<TRow>) => readonly FilterOption[];
      set: (id: string, value: unknown) => void;
      values: FilterValues;
    };
    column: {
      debounceMs: number;
      getOptions: (column: ColumnDef<TRow>) => readonly FilterOption[];
      set: (id: string, value: unknown) => void;
      values: FilterValues;
    };
    hasActive: boolean;
    reset: () => void;
  };
  sorting: {
    enableMulti: boolean;
    getDirection: (columnId: string) => "asc" | "desc" | undefined;
    state: SortingState;
    toggle: (columnId: string, multi?: boolean) => void;
  };
  pagination: {
    enabled: boolean;
    pageCount: number;
    pageIndex: number;
    pageSize: number;
    pageSizeOptions: readonly number[];
    rowCount: number;
    setPageIndex: (pageIndex: number) => void;
    setPageSize: (pageSize: number) => void;
  };
  selection: {
    clear: () => void;
    enabled: boolean;
    isSelected: (rowId: RowId) => boolean;
    pageStatus: SelectionStatus;
    selectedRows: readonly TRow[];
    setPageSelected: (selected: boolean) => void;
    setSelected: (rowId: RowId, selected: boolean) => void;
  };
};

export function useDataGrid<TRow>({
  columns,
  data = EMPTY,
  defaultPageSize = DEFAULT_PAGE_SIZE,
  enableMultiSort = false,
  enablePagination = true,
  enableRowSelection = false,
  filters: filtersOption,
  getRowId = getDefaultRowId,
  initialState,
  mode = "client",
  onQueryChange,
  onStateChange,
  pageSizeOptions,
  rowCount,
  serverInputDebounceMs = 300,
  state: controlledState,
}: DataGridOptions<TRow>): DataGridInstance<TRow> {
  const config = useDataGridConfig();
  const filters = useMemo(
    () =>
      typeof filtersOption === "function"
        ? filtersOption([searchFilter()])
        : (filtersOption ?? [searchFilter<TRow>()]),
    [filtersOption],
  );
  const modesKey = JSON.stringify(mode);
  const modes = useMemo(() => resolveProcessingModes(JSON.parse(modesKey) as ProcessingModesOption), [modesKey]);

  const [internalState, setInternalState] = useState(() => createGridState(initialState, defaultPageSize));
  const { columnFilters, filters: filterValues, pagination, rowSelection, sorting } = controlledState ?? {};
  const state = useMemo(
    () => mergeGridState(internalState, { columnFilters, filters: filterValues, pagination, rowSelection, sorting }),
    [columnFilters, filterValues, internalState, pagination, rowSelection, sorting],
  );
  const viewState = useDeferredValue(state);

  const view = useMemo(
    () => computeGridView({ columns, data, filters, modes, paginate: enablePagination, rowCount, state: viewState }),
    [columns, data, enablePagination, filters, modes, rowCount, viewState],
  );
  const rowIds = useMemo(() => new Map(data.map((row, index) => [row, getRowId(row, index)])), [data, getRowId]);
  const rows = useMemo(
    () => view.rows.map((row, index) => ({ id: rowIds.get(row) ?? getRowId(row, index), original: row })),
    [getRowId, rowIds, view.rows],
  );

  const [pickedRows, setPickedRows] = useState(new Map<RowId, TRow>());
  const selectedRows = useMemo(() => {
    const loaded = new Map([...rowIds].map(([row, id]) => [id, row]));

    return Object.keys(state.rowSelection)
      .filter((id) => isRowSelected(state.rowSelection, id))
      .flatMap((id) => (loaded.has(id) ? [loaded.get(id) as TRow] : pickedRows.has(id) ? [pickedRows.get(id) as TRow] : []));
  }, [pickedRows, rowIds, state.rowSelection]);

  const selectOptions = useMemo(() => {
    const optionsOf = (accessor: Accessor<TRow> | undefined) =>
      getUniqueValues(data, accessor).map((value) => ({ label: value, value }));

    return {
      columns: Object.fromEntries(
        columns
          .filter((column) => modes.columnFilters === "client" && column.filter?.variant === "select" && !column.filter.options)
          .map((column) => [column.id, optionsOf(column.accessor)]),
      ),
      filters: Object.fromEntries(
        filters
          .filter((filter) => filter.variant === "select" && !filter.options && resolveFilterMode(filter, modes) === "client")
          .map((filter) => [filter.id, optionsOf(filter.accessor)]),
      ),
    };
  }, [columns, data, filters, modes]);

  const notifiedQuery = useRef<string>(undefined);
  const serverQuery = hasServerProcessing(modes, filters) ? JSON.stringify(toServerQuery(state, modes, filters)) : undefined;
  const notifyQueryChange = useEffectEvent(() => onQueryChange?.(toServerQuery(state, modes, filters)));

  useEffect(() => {
    if (serverQuery !== undefined && serverQuery !== notifiedQuery.current) {
      notifiedQuery.current = serverQuery;
      notifyQueryChange();
    }
  }, [serverQuery]);

  const pastLastPage =
    modes.pagination === "server" && Boolean(rowCount) && state.pagination.pageIndex >= view.pageCount;
  const goToLastPage = useEffectEvent(() => dispatch({ pageIndex: view.pageCount - 1, type: "setPageIndex" }));

  useEffect(() => {
    if (pastLastPage) {
      goToLastPage();
    }
  }, [pastLastPage]);

  function dispatch(action: GridAction) {
    const next = gridReducer(state, action);

    if (next !== state) {
      setInternalState(next);
      onStateChange?.(next);
    }
  }

  function select(rowIds: readonly RowId[], selected: boolean) {
    const picked = rows.filter((row) => rowIds.includes(row.id)).map((row) => [row.id, row.original] as const);

    setPickedRows((known) => new Map([...known, ...picked]));
    dispatch({ rowIds, selected, type: "setRowsSelected" });
  }

  const debounceFor = (processingMode: ProcessingMode) => (processingMode === "server" ? serverInputDebounceMs : 0);
  const pageRowIds = rows.map((row) => row.id);

  return {
    columns,
    filters: {
      column: {
        debounceMs: debounceFor(modes.columnFilters),
        getOptions: (column) => column.filter?.options ?? selectOptions.columns[column.id] ?? EMPTY,
        set: (id, value) => dispatch({ id, type: "setColumnFilter", value }),
        values: state.columnFilters,
      },
      hasActive: hasActiveFilters(state),
      reset: () => dispatch({ type: "resetFilters" }),
      toolbar: {
        definitions: filters,
        getDebounceMs: (filter) => debounceFor(resolveFilterMode(filter, modes)),
        getOptions: (filter) => filter.options ?? selectOptions.filters[filter.id] ?? EMPTY,
        set: (id, value) => dispatch({ id, type: "setFilter", value }),
        values: state.filters,
      },
    },
    isProcessing: viewKey(viewState) !== viewKey(state),
    modes,
    pagination: {
      enabled: enablePagination,
      pageCount: view.pageCount,
      pageIndex:
        modes.pagination === "server"
          ? state.pagination.pageIndex
          : clampPageIndex(state.pagination.pageIndex, view.pageCount),
      pageSize: state.pagination.pageSize,
      pageSizeOptions: pageSizeOptions ?? config.pageSizeOptions ?? [10, 25, 50, 100],
      rowCount: view.rowCount,
      setPageIndex: (pageIndex) => dispatch({ pageIndex, type: "setPageIndex" }),
      setPageSize: (pageSize) => dispatch({ pageSize, type: "setPageSize" }),
    },
    rows,
    selection: {
      clear: () => {
        setPickedRows(new Map());
        dispatch({ type: "clearSelection" });
      },
      enabled: enableRowSelection,
      isSelected: (rowId) => isRowSelected(state.rowSelection, rowId),
      pageStatus: getSelectionStatus(pageRowIds, state.rowSelection),
      selectedRows,
      setPageSelected: (selected) => select(pageRowIds, selected),
      setSelected: (rowId, selected) => select([rowId], selected),
    },
    sorting: {
      enableMulti: enableMultiSort,
      getDirection: (columnId) => {
        const sort = state.sorting.find(({ id }) => id === columnId);

        return sort && (sort.desc ? "desc" : "asc");
      },
      state: state.sorting,
      toggle: (columnId, multi = false) =>
        dispatch({ id: columnId, multi: enableMultiSort && multi, type: "toggleSorting" }),
    },
    state,
  };
}

function viewKey({ columnFilters, filters, pagination, sorting }: GridState) {
  return JSON.stringify([filters, columnFilters, sorting, pagination]);
}

function getDefaultRowId(row: unknown, index: number): RowId {
  const id = typeof row === "object" && row !== null && "id" in row ? row.id : undefined;

  return typeof id === "string" || typeof id === "number" ? String(id) : String(index);
}
