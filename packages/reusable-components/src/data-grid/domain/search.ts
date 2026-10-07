import { isSearchableColumn, readValue } from "./accessor";
import type { ColumnModel } from "./types";
import { normalizeText } from "./values";

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
    const texts = searchable.map((column) =>
      normalizeText(readValue(row, column.accessor)),
    );

    return terms.every((term) => texts.some((text) => text.includes(term)));
  });
}
