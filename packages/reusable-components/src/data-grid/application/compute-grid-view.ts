import { isActiveFilterValue } from "../domain/filter-fns";
import { applyColumnFilters } from "../domain/filtering";
import {
  clampPageIndex,
  getPageCount,
  paginateRows,
} from "../domain/pagination";
import { resolveFilterMode } from "../domain/processing-modes";
import { sortRows } from "../domain/sorting";
import type {
  ColumnModel,
  GridFilterModel,
  GridState,
  ProcessingModes,
} from "../domain/types";
import { runChain, type ChainLink } from "./filter-chain";

export type GridViewInput<TRow> = {
  data: readonly TRow[];
  columns: readonly ColumnModel<TRow>[];
  filters: readonly GridFilterModel<TRow>[];
  state: GridState;
  modes: ProcessingModes;
  paginate: boolean;
  rowCount?: number;
};

export type GridView<TRow> = {
  rows: readonly TRow[];
  rowCount: number;
  pageCount: number;
  pageIndex: number;
};

export function computeGridView<TRow>(input: GridViewInput<TRow>): GridView<TRow> {
  return paginateView(runChain(buildClientChain(input), input.data), input);
}

export function buildClientChain<TRow>({
  columns,
  filters,
  modes,
  state,
}: GridViewInput<TRow>): ChainLink<TRow>[] {
  const filterLinks = filters.flatMap((filter): ChainLink<TRow>[] => {
    const { handle } = filter;

    if (!handle || resolveFilterMode(filter, modes) !== "client") {
      return [];
    }

    return [
      (rows, next) => {
        const value = state.filters[filter.id];

        return isActiveFilterValue(value)
          ? handle(rows, value, next, { columns })
          : next(rows);
      },
    ];
  });

  const columnFilterLinks: ChainLink<TRow>[] =
    modes.columnFilters === "client"
      ? [(rows, next) => next(applyColumnFilters(rows, columns, state.columnFilters))]
      : [];

  const sortingLinks: ChainLink<TRow>[] =
    modes.sorting === "client"
      ? [(rows, next) => next(sortRows(rows, columns, state.sorting))]
      : [];

  return [...filterLinks, ...columnFilterLinks, ...sortingLinks];
}

function paginateView<TRow>(
  rows: readonly TRow[],
  { modes, paginate, rowCount, state }: GridViewInput<TRow>,
): GridView<TRow> {
  const { pageIndex, pageSize } = state.pagination;

  if (!paginate) {
    return { pageCount: 1, pageIndex: 0, rowCount: rows.length, rows };
  }

  if (modes.pagination === "server") {
    const total = rowCount ?? rows.length;

    return { pageCount: getPageCount(total, pageSize), pageIndex, rowCount: total, rows };
  }

  const pageCount = getPageCount(rows.length, pageSize);
  const currentPage = clampPageIndex(pageIndex, pageCount);

  return {
    pageCount,
    pageIndex: currentPage,
    rowCount: rows.length,
    rows: paginateRows(rows, { pageIndex: currentPage, pageSize }),
  };
}
