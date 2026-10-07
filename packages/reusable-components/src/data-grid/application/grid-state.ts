import { isActiveFilterValue } from "../domain/filter-fns";
import { setRowsSelected } from "../domain/row-selection";
import type {
  FilterValues,
  GridState,
  PaginationState,
  RowId,
  SortingState,
} from "../domain/types";

export const DEFAULT_PAGE_SIZE = 10;

export type GridAction =
  | { type: "setFilter"; id: string; value: unknown }
  | { type: "setColumnFilter"; id: string; value: unknown }
  | { type: "resetFilters" }
  | { type: "toggleSorting"; id: string; multi: boolean }
  | { type: "setPageIndex"; pageIndex: number }
  | { type: "setPageSize"; pageSize: number }
  | { type: "setRowsSelected"; rowIds: readonly RowId[]; selected: boolean }
  | { type: "clearSelection" };

export function createGridState(
  initial: Partial<GridState> = {},
  pageSize = DEFAULT_PAGE_SIZE,
): GridState {
  return {
    columnFilters: initial.columnFilters ?? {},
    filters: initial.filters ?? {},
    pagination: { pageIndex: 0, pageSize, ...initial.pagination },
    rowSelection: initial.rowSelection ?? {},
    sorting: initial.sorting ?? [],
  };
}

export function mergeGridState(
  internal: GridState,
  controlled: Partial<GridState> | undefined,
): GridState {
  if (!controlled) {
    return internal;
  }

  return {
    columnFilters: controlled.columnFilters ?? internal.columnFilters,
    filters: controlled.filters ?? internal.filters,
    pagination: controlled.pagination ?? internal.pagination,
    rowSelection: controlled.rowSelection ?? internal.rowSelection,
    sorting: controlled.sorting ?? internal.sorting,
  };
}

export function hasActiveFilters(state: GridState) {
  return (
    Object.values(state.filters).some(isActiveFilterValue) ||
    Object.values(state.columnFilters).some(isActiveFilterValue)
  );
}

// Narrowing the rows always goes back to the first page.
export function gridReducer(state: GridState, action: GridAction): GridState {
  switch (action.type) {
    case "setFilter":
      return state.filters[action.id] === action.value
        ? state
        : {
            ...state,
            filters: setFilterValue(state.filters, action.id, action.value),
            pagination: firstPage(state.pagination),
          };
    case "setColumnFilter":
      return state.columnFilters[action.id] === action.value
        ? state
        : {
            ...state,
            columnFilters: setFilterValue(state.columnFilters, action.id, action.value),
            pagination: firstPage(state.pagination),
          };
    case "resetFilters":
      return {
        ...state,
        columnFilters: {},
        filters: {},
        pagination: firstPage(state.pagination),
      };
    case "toggleSorting":
      return { ...state, sorting: toggleSorting(state.sorting, action.id, action.multi) };
    case "setPageIndex":
      return {
        ...state,
        pagination: { ...state.pagination, pageIndex: Math.max(0, action.pageIndex) },
      };
    case "setPageSize":
      return { ...state, pagination: { pageIndex: 0, pageSize: action.pageSize } };
    case "setRowsSelected":
      return {
        ...state,
        rowSelection: setRowsSelected(state.rowSelection, action.rowIds, action.selected),
      };
    case "clearSelection":
      return { ...state, rowSelection: {} };
  }
}

// none -> ascending -> descending -> none
export function toggleSorting(
  sorting: SortingState,
  id: string,
  multi: boolean,
): SortingState {
  const current = sorting.find((sort) => sort.id === id);
  const others = multi ? sorting.filter((sort) => sort.id !== id) : [];

  if (!current) {
    return [...others, { desc: false, id }];
  }

  if (!current.desc) {
    return multi
      ? sorting.map((sort) => (sort.id === id ? { desc: true, id } : sort))
      : [{ desc: true, id }];
  }

  return others;
}

function setFilterValue(values: FilterValues, id: string, value: unknown) {
  const next: Record<string, unknown> = { ...values };

  if (isActiveFilterValue(value)) {
    next[id] = value;
  } else {
    delete next[id];
  }

  return next;
}

function firstPage(pagination: PaginationState): PaginationState {
  return pagination.pageIndex === 0 ? pagination : { ...pagination, pageIndex: 0 };
}
