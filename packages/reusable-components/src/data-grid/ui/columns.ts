import { isSearchableColumn, readValue } from "../domain/accessor";
import type { RowId } from "../domain/types";
import { toText } from "../domain/values";
import type { ColumnDef } from "./types";

export function getColumnLabel<TRow>(column: ColumnDef<TRow>) {
  return (
    column.label ?? (typeof column.header === "string" ? column.header : column.id)
  );
}

export function getRowName<TRow>(
  columns: readonly ColumnDef<TRow>[],
  row: TRow,
  rowId: RowId,
) {
  const column = columns.find(isSearchableColumn);

  return (column && toText(readValue(row, column.accessor))) || rowId;
}
