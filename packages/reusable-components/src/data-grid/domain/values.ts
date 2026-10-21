import type { Accessor, ColumnModel } from "./types";

const COMBINING_MARKS = /[̀-ͯ]/g;

export function isEmptyValue(value: unknown) {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(value instanceof Date ? value.getTime() : value)
  );
}

export function toText(value: unknown): string {
  if (isEmptyValue(value)) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(toText).filter(Boolean).join(", ");
  }

  return typeof value === "object" ? "" : String(value);
}

export function normalizeText(value: unknown) {
  return toText(value).normalize("NFD").replace(COMBINING_MARKS, "").toLowerCase().trim();
}

export function toNumber(value: unknown) {
  const number = isEmptyValue(value) || String(value).trim() === "" ? Number.NaN : Number(value);

  return Number.isFinite(number) ? number : undefined;
}

export function readValue<TRow>(row: TRow, accessor: Accessor<TRow> | undefined): unknown {
  if (accessor === undefined) {
    return undefined;
  }

  return typeof accessor === "function" ? accessor(row) : row[accessor];
}

export function isSortableColumn<TRow>(column: ColumnModel<TRow>) {
  return column.enableSorting ?? (column.accessor !== undefined || column.sortingFn !== undefined);
}

export function isSearchableColumn<TRow>(column: ColumnModel<TRow>) {
  return column.searchable ?? column.accessor !== undefined;
}
