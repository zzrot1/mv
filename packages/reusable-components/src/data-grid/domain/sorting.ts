import type { ColumnModel, SortingState } from "./types";
import { isEmptyValue, isSortableColumn, readValue, toText } from "./values";

type RowComparator<TRow> = (a: TRow, b: TRow) => number;

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

export function compareText(a: string, b: string) {
  return collator.compare(a, b);
}

export function compareValues(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  if (typeof a === "boolean" && typeof b === "boolean") {
    return Number(a) - Number(b);
  }

  return compareText(toText(a), toText(b));
}

export function sortRows<TRow>(
  rows: readonly TRow[],
  columns: readonly ColumnModel<TRow>[],
  sorting: SortingState,
): readonly TRow[] {
  const comparators = sorting.flatMap(({ desc, id }): RowComparator<TRow>[] => {
    const column = columns.find((candidate) => candidate.id === id);

    return column && isSortableColumn(column)
      ? [createComparator(column, desc ? -1 : 1)]
      : [];
  });

  if (!comparators.length) {
    return rows;
  }

  return [...rows].sort((a, b) => {
    for (const compare of comparators) {
      const result = compare(a, b);

      if (result !== 0) {
        return result;
      }
    }

    return 0;
  });
}

function createComparator<TRow>(
  { accessor, sortingFn }: ColumnModel<TRow>,
  direction: 1 | -1,
): RowComparator<TRow> {
  if (sortingFn) {
    return (a, b) => sortingFn(a, b) * direction;
  }

  return (a, b) => {
    const left = readValue(a, accessor);
    const right = readValue(b, accessor);

    if (isEmptyValue(left) || isEmptyValue(right)) {
      return Number(isEmptyValue(left)) - Number(isEmptyValue(right));
    }

    return compareValues(left, right) * direction;
  };
}
