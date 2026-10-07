import { readValue } from "./accessor";
import { columnFilterFns, isActiveFilterValue } from "./filter-fns";
import { compareText } from "./sorting";
import type { Accessor, ColumnModel, FilterValues } from "./types";
import { toText } from "./values";

type RowPredicate<TRow> = (row: TRow) => boolean;

export function applyColumnFilters<TRow>(
  rows: readonly TRow[],
  columns: readonly ColumnModel<TRow>[],
  values: FilterValues,
): readonly TRow[] {
  const predicates = columns.flatMap((column): RowPredicate<TRow>[] => {
    const filterValue = values[column.id];

    if (!column.filter || !isActiveFilterValue(filterValue)) {
      return [];
    }

    const filterFn =
      column.filter.fn ?? columnFilterFns[column.filter.variant ?? "text"];

    return [(row) => filterFn(readValue(row, column.accessor), filterValue, row)];
  });

  return predicates.length
    ? rows.filter((row) => predicates.every((matches) => matches(row)))
    : rows;
}

export function getUniqueValues<TRow>(
  rows: readonly TRow[],
  accessor: Accessor<TRow> | undefined,
): string[] {
  if (accessor === undefined) {
    return [];
  }

  const values = new Set<string>();

  for (const row of rows) {
    const value = readValue(row, accessor);

    for (const item of Array.isArray(value) ? value : [value]) {
      const text = toText(item);

      if (text) {
        values.add(text);
      }
    }
  }

  return [...values].sort(compareText);
}
