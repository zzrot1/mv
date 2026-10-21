import { compareText } from "./sorting";
import type {
  Accessor,
  ColumnModel,
  FilterFn,
  FilterHandler,
  FilterValues,
  FilterVariant,
} from "./types";
import { isEmptyValue, isSearchableColumn, normalizeText, readValue, toNumber, toText } from "./values";

export const filterFns: Readonly<
  Record<"equals" | "includesText" | "inNumberRange" | "isTruthy", FilterFn<unknown>>
> = {
  equals: (cellValue, filterValue) =>
    [cellValue].flat().some((value) => toText(value) === toText(filterValue)),
  includesText: (cellValue, filterValue) =>
    normalizeText(cellValue).includes(normalizeText(filterValue)),
  inNumberRange: (cellValue, filterValue) => {
    const value = toNumber(cellValue);
    const [min, max] = Array.isArray(filterValue) ? filterValue.map(toNumber) : [];

    return value !== undefined && (min === undefined || value >= min) && (max === undefined || value <= max);
  },
  isTruthy: (cellValue) => Boolean(cellValue),
};

export const columnFilterFns: Readonly<Record<FilterVariant, FilterFn<unknown>>> = {
  "number-range": filterFns.inNumberRange,
  select: filterFns.equals,
  text: filterFns.includesText,
};

export function isActiveFilterValue(value: unknown): boolean {
  return Array.isArray(value)
    ? value.some((item) => !isEmptyValue(item))
    : !isEmptyValue(value) && value !== false;
}

export function filterBySearch<TRow>(
  rows: readonly TRow[],
  columns: readonly ColumnModel<TRow>[],
  search: string,
): readonly TRow[] {
  const terms = normalizeText(search).split(/\s+/).filter(Boolean);
  const searchable = columns.filter(isSearchableColumn);

  if (!terms.length || !searchable.length) {
    return rows;
  }

  return rows.filter((row) => {
    const texts = searchable.map((column) => normalizeText(readValue(row, column.accessor)));

    return terms.every((term) => texts.some((text) => text.includes(term)));
  });
}

export function applyColumnFilters<TRow>(
  rows: readonly TRow[],
  columns: readonly ColumnModel<TRow>[],
  values: FilterValues,
): readonly TRow[] {
  const active = columns.filter(
    (column) => column.filter && Object.hasOwn(values, column.id) && isActiveFilterValue(values[column.id]),
  );

  if (!active.length) {
    return rows;
  }

  return rows.filter((row) =>
    active.every((column) => {
      const matches = column.filter?.fn ?? columnFilterFns[column.filter?.variant ?? "text"];

      return matches(readValue(row, column.accessor), values[column.id], row);
    }),
  );
}

export function getUniqueValues<TRow>(rows: readonly TRow[], accessor: Accessor<TRow> | undefined) {
  if (accessor === undefined) {
    return [];
  }

  const texts = rows.flatMap((row) => [readValue(row, accessor)].flat().map(toText));

  return [...new Set(texts.filter(Boolean))].sort(compareText);
}

export function searchHandler<TRow>(): FilterHandler<TRow> {
  return (rows, value, next, { columns }) => next(filterBySearch(rows, columns, toText(value)));
}

export function matchHandler<TRow>(accessor: Accessor<TRow>, filterFn: FilterFn<TRow>): FilterHandler<TRow> {
  return (rows, value, next) => next(rows.filter((row) => filterFn(readValue(row, accessor), value, row)));
}

export function predicateHandler<TRow>(
  predicate: (row: TRow, value: unknown) => boolean,
): FilterHandler<TRow> {
  return (rows, value, next) => next(rows.filter((row) => predicate(row, value)));
}
