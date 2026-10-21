import { applyColumnFilters, isActiveFilterValue } from "../domain/filtering";
import { resolveFilterMode } from "../domain/processing-modes";
import { clampPageIndex, getPageCount, paginateRows } from "../domain/rows";
import { sortRows } from "../domain/sorting";
import type { ColumnModel, GridFilterModel, GridState, ProcessingModes, RowsHandler } from "../domain/types";

export type ChainLink<TRow> = (rows: readonly TRow[], next: RowsHandler<TRow>) => readonly TRow[];

export type GridViewInput<TRow> = {
  data: readonly TRow[];
  columns: readonly ColumnModel<TRow>[];
  filters: readonly GridFilterModel<TRow>[];
  state: GridState;
  modes: ProcessingModes;
  paginate: boolean;
  rowCount?: number;
};

export function runChain<TRow>(links: readonly ChainLink<TRow>[], rows: readonly TRow[]): readonly TRow[] {
  const handlerAt =
    (index: number): RowsHandler<TRow> =>
    (current) =>
      index < links.length ? links[index](current, handlerAt(index + 1)) : current;

  return handlerAt(0)(rows);
}

export function buildClientChain<TRow>({ columns, filters, modes, state }: GridViewInput<TRow>): ChainLink<TRow>[] {
  const links = filters.flatMap(({ handle, ...filter }): ChainLink<TRow>[] =>
    handle && resolveFilterMode(filter, modes) === "client"
      ? [
          (rows, next) => {
            const value = state.filters[filter.id];

            return isActiveFilterValue(value) ? handle(rows, value, next, { columns }) : next(rows);
          },
        ]
      : [],
  );

  if (modes.columnFilters === "client") {
    links.push((rows, next) => next(applyColumnFilters(rows, columns, state.columnFilters)));
  }

  if (modes.sorting === "client") {
    links.push((rows, next) => next(sortRows(rows, columns, state.sorting)));
  }

  return links;
}

export function computeGridView<TRow>(input: GridViewInput<TRow>) {
  const rows = runChain(buildClientChain(input), input.data);
  const { pageIndex, pageSize } = input.state.pagination;

  if (!input.paginate) {
    return { pageCount: 1, pageIndex: 0, rowCount: rows.length, rows };
  }

  if (input.modes.pagination === "server") {
    const rowCount = input.rowCount ?? rows.length;

    return { pageCount: getPageCount(rowCount, pageSize), pageIndex, rowCount, rows };
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
