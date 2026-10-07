import type { PaginationState } from "./types";

export function getPageCount(rowCount: number, pageSize: number) {
  return Math.max(1, Math.ceil(rowCount / Math.max(1, pageSize)));
}

export function clampPageIndex(pageIndex: number, pageCount: number) {
  return Math.min(Math.max(0, pageIndex), Math.max(0, pageCount - 1));
}

export function paginateRows<TRow>(
  rows: readonly TRow[],
  { pageIndex, pageSize }: PaginationState,
): readonly TRow[] {
  const start = pageIndex * pageSize;

  return rows.slice(start, start + pageSize);
}

export function getPageRange(
  { pageIndex, pageSize }: PaginationState,
  rowCount: number,
) {
  if (rowCount === 0) {
    return { from: 0, to: 0 };
  }

  return {
    from: pageIndex * pageSize + 1,
    to: Math.min((pageIndex + 1) * pageSize, rowCount),
  };
}
