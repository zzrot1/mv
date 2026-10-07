import type { Accessor, ColumnModel } from "./types";

export function readValue<TRow>(
  row: TRow,
  accessor: Accessor<TRow> | undefined,
): unknown {
  if (accessor === undefined) {
    return undefined;
  }

  return typeof accessor === "function" ? accessor(row) : row[accessor];
}

export function isSortableColumn<TRow>(column: ColumnModel<TRow>) {
  return (
    column.enableSorting ??
    (column.accessor !== undefined || column.sortingFn !== undefined)
  );
}

export function isSearchableColumn<TRow>(column: ColumnModel<TRow>) {
  return column.searchable ?? column.accessor !== undefined;
}
