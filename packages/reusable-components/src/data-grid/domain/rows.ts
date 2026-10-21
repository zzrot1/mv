import type { PaginationState, RowId, RowSelectionState } from "./types";

export type SelectionStatus = "none" | "some" | "all";

export function getPageCount(rowCount: number, pageSize: number) {
  return Math.max(1, Math.ceil(rowCount / Math.max(1, pageSize)));
}

export function clampPageIndex(pageIndex: number, pageCount: number) {
  return Math.min(Math.max(0, pageIndex), Math.max(0, pageCount - 1));
}

export function paginateRows<TRow>(rows: readonly TRow[], { pageIndex, pageSize }: PaginationState) {
  return rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
}

export function getPageRange({ pageIndex, pageSize }: PaginationState, rowCount: number) {
  return rowCount === 0
    ? { from: 0, to: 0 }
    : { from: pageIndex * pageSize + 1, to: Math.min((pageIndex + 1) * pageSize, rowCount) };
}

export function isRowSelected(selection: RowSelectionState, rowId: RowId) {
  return Object.hasOwn(selection, rowId) && selection[rowId] === true;
}

export function getSelectionStatus(rowIds: readonly RowId[], selection: RowSelectionState): SelectionStatus {
  const count = rowIds.filter((rowId) => isRowSelected(selection, rowId)).length;

  return count === 0 ? "none" : count === rowIds.length ? "all" : "some";
}

export function setRowsSelected(
  selection: RowSelectionState,
  rowIds: readonly RowId[],
  selected: boolean,
): RowSelectionState {
  const changed = new Set(rowIds);
  const kept = Object.entries(selection).filter(([rowId]) => !changed.has(rowId));

  return Object.fromEntries(selected ? [...kept, ...rowIds.map((rowId) => [rowId, true])] : kept);
}
