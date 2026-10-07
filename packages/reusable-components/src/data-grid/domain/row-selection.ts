import type { RowId, RowSelectionState } from "./types";

export type SelectionStatus = "none" | "some" | "all";

export function getSelectionStatus(
  rowIds: readonly RowId[],
  selection: RowSelectionState,
): SelectionStatus {
  const selectedCount = rowIds.filter((rowId) => selection[rowId]).length;

  if (selectedCount === 0) {
    return "none";
  }

  return selectedCount === rowIds.length ? "all" : "some";
}

export function setRowsSelected(
  selection: RowSelectionState,
  rowIds: readonly RowId[],
  selected: boolean,
): RowSelectionState {
  const next: Record<RowId, boolean> = { ...selection };

  for (const rowId of rowIds) {
    if (selected) {
      next[rowId] = true;
    } else {
      delete next[rowId];
    }
  }

  return next;
}
