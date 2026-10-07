import type { RowsHandler } from "../domain/types";

export type ChainLink<TRow> = (
  rows: readonly TRow[],
  next: RowsHandler<TRow>,
) => readonly TRow[];

// Chain of responsibility: each link receives the rows and decides what reaches
// the next one. A link that doesn't call `next` stops the chain there.
export function runChain<TRow>(
  links: readonly ChainLink<TRow>[],
  rows: readonly TRow[],
): readonly TRow[] {
  const handlerAt =
    (index: number): RowsHandler<TRow> =>
    (current) =>
      index < links.length ? links[index](current, handlerAt(index + 1)) : current;

  return handlerAt(0)(rows);
}
