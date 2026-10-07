import { readValue } from "./accessor";
import { filterBySearch } from "./search";
import type { Accessor, FilterFn, FilterHandler } from "./types";
import { toText } from "./values";

export function searchHandler<TRow>(): FilterHandler<TRow> {
  return (rows, value, next, { columns }) =>
    next(filterBySearch(rows, columns, toText(value)));
}

export function matchHandler<TRow>(
  accessor: Accessor<TRow>,
  filterFn: FilterFn<TRow>,
): FilterHandler<TRow> {
  return (rows, value, next) =>
    next(rows.filter((row) => filterFn(readValue(row, accessor), value, row)));
}

export function predicateHandler<TRow>(
  predicate: (row: TRow, value: unknown) => boolean,
): FilterHandler<TRow> {
  return (rows, value, next) => next(rows.filter((row) => predicate(row, value)));
}
