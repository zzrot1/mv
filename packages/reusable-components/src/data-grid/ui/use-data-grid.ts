"use client";

import {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";

import { computeGridView } from "../application/compute-grid-view";
import {
  createGridState,
  DEFAULT_PAGE_SIZE,
  gridReducer,
  hasActiveFilters,
  mergeGridState,
  type GridAction,
} from "../application/grid-state";
import type { GridQueryListener } from "../application/ports";
import { toServerQuery } from "../application/server-query";
import { getUniqueValues } from "../domain/filtering";
import { clampPageIndex } from "../domain/pagination";
import {
  hasServerProcessing,
  resolveFilterMode,
  resolveProcessingModes,
  type ProcessingModesOption,
} from "../domain/processing-modes";
import { getSelectionStatus, type SelectionStatus } from "../domain/row-selection";
import type {
  FilterValues,
  GridState,
  ProcessingMode,
  ProcessingModes,
  RowId,
  SortingState,
} from "../domain/types";
import { useDataGridConfig } from "./config-context";
import { searchFilter } from "./filters";
import type {
  ColumnDef,
  FilterOption,
  GridFilterDef,
  GridFiltersOption,
} from "./types";

const DEFAULT_PAGE_SIZE_OPTIONS: readonly number[] = [10, 25, 50, 100];
const DEFAULT_SERVER_INPUT_DEBOUNCE_MS = 300;
const EMPTY: readonly never[] = [];

export type DataGridOptions<TRow> = {
  data: readonly TRow[] | undefined;
  // Keep `columns` and `filters` referentially stable (module scope or useMemo).
  columns: readonly ColumnDef<TRow>[];
  // The filter chain above the grid. Default: [searchFilter()]. Pass a function
  // to extend the defaults: (defaults) => [...defaults, myFilter].
  filters?: GridFiltersOption<TRow>;
  getRowId?: (row: TRow, index: number) => RowId;
  mode?: ProcessingModesOption;
  // Total rows on the server; required for server pagination.
  rowCount?: number;
  initialState?: Partial<GridState>;
  state?: Partial<GridState>;
  onStateChange?: (state: GridState) => void;
  // Called on mount and whenever a step that runs on the server changes.
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
  // True while the visible rows still reflect the previous filters or sorting.
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

export function useDataGrid<TRow>(
  options: DataGridOptions<TRow>,
): DataGridInstance<TRow> {
  const config = useDataGridConfig();
  const {
    columns,
    data = EMPTY,
    defaultPageSize = DEFAULT_PAGE_SIZE,
    enableMultiSort = false,
    enablePagination = true,
    enableRowSelection = false,
    filters: filtersOption,
    getRowId = getDefaultRowId,
    mode,
    onQueryChange,
    onStateChange,
    pageSizeOptions = config.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS,
    rowCount,
    serverInputDebounceMs = DEFAULT_SERVER_INPUT_DEBOUNCE_MS,
  } = options;

  const filters = useMemo(() => resolveFilters(filtersOption), [filtersOption]);

  const modesKey = JSON.stringify(mode ?? "client");
  const modes = useMemo(
    () => resolveProcessingModes(JSON.parse(modesKey) as ProcessingModesOption),
    [modesKey],
  );

  const [internalState, setInternalState] = useState(() =>
    createGridState(options.initialState, defaultPageSize),
  );
  const state = mergeGridState(internalState, options.state);

  // Controls update right away; the rows follow in a background render, and the
  // grid shows an overlay while they catch up.
  const viewState = useDeferredValue(state);
  const isProcessing = viewKey(viewState) !== viewKey(state);

  function dispatch(action: GridAction) {
    const next = gridReducer(state, action);

    if (next === state) {
      return;
    }

    setInternalState(next);
    onStateChange?.(next);
  }

  const view = useMemo(
    () =>
      computeGridView({
        columns,
        data,
        filters,
        modes,
        paginate: enablePagination,
        rowCount,
        state: viewState,
      }),
    [columns, data, enablePagination, filters, modes, rowCount, viewState],
  );

  const selectOptions = useMemo(
    () => computeSelectOptions({ columns, data, filters, modes }),
    [columns, data, filters, modes],
  );

  const rowIndexes = useMemo(
    () => new Map(data.map((row, index) => [row, index] as const)),
    [data],
  );

  const rows = useMemo(
    () =>
      view.rows.map((row) => ({
        id: getRowId(row, rowIndexes.get(row) ?? 0),
        original: row,
      })),
    [getRowId, rowIndexes, view.rows],
  );

  const selectedRows = useMemo(
    () => data.filter((row, index) => state.rowSelection[getRowId(row, index)]),
    [data, getRowId, state.rowSelection],
  );

  const serverQueryKey = hasServerProcessing(modes, filters)
    ? JSON.stringify(toServerQuery(state, modes, filters))
    : undefined;
  const notifiedQueryKey = useRef<string | undefined>(undefined);
  const notifyQueryChange = useEffectEvent(() => {
    onQueryChange?.(toServerQuery(state, modes, filters));
  });

  useEffect(() => {
    if (
      serverQueryKey === undefined ||
      serverQueryKey === notifiedQueryKey.current
    ) {
      return;
    }

    notifiedQueryKey.current = serverQueryKey;
    notifyQueryChange();
  }, [serverQueryKey]);

  const debounceFor = (processingMode: ProcessingMode) =>
    processingMode === "server" ? serverInputDebounceMs : 0;
  const pageRowIds = rows.map((row) => row.id);
  const pageIndex =
    modes.pagination === "server"
      ? state.pagination.pageIndex
      : clampPageIndex(state.pagination.pageIndex, view.pageCount);

  return {
    columns,
    filters: {
      column: {
        debounceMs: debounceFor(modes.columnFilters),
        getOptions: (column) =>
          column.filter?.options ?? selectOptions.columns[column.id] ?? EMPTY,
        set: (id, value) => dispatch({ id, type: "setColumnFilter", value }),
        values: state.columnFilters,
      },
      hasActive: hasActiveFilters(state),
      reset: () => dispatch({ type: "resetFilters" }),
      toolbar: {
        definitions: filters,
        getDebounceMs: (filter) => debounceFor(resolveFilterMode(filter, modes)),
        getOptions: (filter) =>
          filter.options ?? selectOptions.filters[filter.id] ?? EMPTY,
        set: (id, value) => dispatch({ id, type: "setFilter", value }),
        values: state.filters,
      },
    },
    isProcessing,
    modes,
    pagination: {
      enabled: enablePagination,
      pageCount: view.pageCount,
      pageIndex,
      pageSize: state.pagination.pageSize,
      pageSizeOptions,
      rowCount: view.rowCount,
      setPageIndex: (next) => dispatch({ pageIndex: next, type: "setPageIndex" }),
      setPageSize: (pageSize) => dispatch({ pageSize, type: "setPageSize" }),
    },
    rows,
    selection: {
      clear: () => dispatch({ type: "clearSelection" }),
      enabled: enableRowSelection,
      isSelected: (rowId) => Boolean(state.rowSelection[rowId]),
      pageStatus: getSelectionStatus(pageRowIds, state.rowSelection),
      selectedRows,
      setPageSelected: (selected) =>
        dispatch({ rowIds: pageRowIds, selected, type: "setRowsSelected" }),
      setSelected: (rowId, selected) =>
        dispatch({ rowIds: [rowId], selected, type: "setRowsSelected" }),
    },
    sorting: {
      enableMulti: enableMultiSort,
      getDirection: (columnId) => {
        const sort = state.sorting.find(({ id }) => id === columnId);

        return sort ? (sort.desc ? "desc" : "asc") : undefined;
      },
      state: state.sorting,
      toggle: (columnId, multi = false) =>
        dispatch({ id: columnId, multi: enableMultiSort && multi, type: "toggleSorting" }),
    },
    state,
  };
}

function resolveFilters<TRow>(
  option: GridFiltersOption<TRow> | undefined,
): readonly GridFilterDef<TRow>[] {
  const defaults = [searchFilter<TRow>()];

  if (typeof option === "function") {
    return option(defaults);
  }

  return option ?? defaults;
}

function viewKey({ columnFilters, filters, pagination, sorting }: GridState) {
  return JSON.stringify([filters, columnFilters, sorting, pagination]);
}

// Select options read from the loaded rows. On the server the rows are only a
// page, so there the options must come from the consumer.
function computeSelectOptions<TRow>({
  columns,
  data,
  filters,
  modes,
}: {
  columns: readonly ColumnDef<TRow>[];
  data: readonly TRow[];
  filters: readonly GridFilterDef<TRow>[];
  modes: ProcessingModes;
}) {
  const options = {
    columns: {} as Record<string, readonly FilterOption[]>,
    filters: {} as Record<string, readonly FilterOption[]>,
  };

  if (modes.columnFilters === "client") {
    for (const column of columns) {
      if (column.filter?.variant === "select" && !column.filter.options) {
        options.columns[column.id] = toOptions(getUniqueValues(data, column.accessor));
      }
    }
  }

  for (const filter of filters) {
    if (
      filter.variant === "select" &&
      !filter.options &&
      resolveFilterMode(filter, modes) === "client"
    ) {
      options.filters[filter.id] = toOptions(getUniqueValues(data, filter.accessor));
    }
  }

  return options;
}

function getDefaultRowId(row: unknown, index: number): RowId {
  const id =
    typeof row === "object" && row !== null && "id" in row ? row.id : undefined;

  return typeof id === "string" || typeof id === "number"
    ? String(id)
    : String(index);
}

function toOptions(values: readonly string[]): readonly FilterOption[] {
  return values.map((value) => ({ label: value, value }));
}
