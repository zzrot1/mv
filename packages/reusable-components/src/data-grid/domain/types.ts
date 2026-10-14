export type RowId = string;

export type ProcessingMode = "client" | "server";

export type GridFeature = "filters" | "columnFilters" | "sorting" | "pagination";

export type ProcessingModes = Readonly<Record<GridFeature, ProcessingMode>>;

export type ColumnSort = { id: string; desc: boolean };

export type SortingState = readonly ColumnSort[];

export type FilterValues = Readonly<Record<string, unknown>>;

export type PaginationState = { pageIndex: number; pageSize: number };

export type RowSelectionState = Readonly<Record<RowId, boolean>>;

export type GridState = {
  filters: FilterValues;
  columnFilters: FilterValues;
  sorting: SortingState;
  pagination: PaginationState;
  rowSelection: RowSelectionState;
};

export type GridQuery = Omit<GridState, "rowSelection">;

export type Accessor<TRow> = (keyof TRow & string) | ((row: TRow) => unknown);

export type FilterVariant = "text" | "select" | "number-range";

export type NumberRange = readonly [min: number | undefined, max: number | undefined];

export type FilterFn<TRow> = (
  cellValue: unknown,
  filterValue: unknown,
  row: TRow,
) => boolean;

export type ColumnModel<TRow> = {
  id: string;
  accessor?: Accessor<TRow>;
  enableSorting?: boolean;
  searchable?: boolean;
  sortingFn?: (a: TRow, b: TRow) => number;
  filter?: { variant?: FilterVariant; fn?: FilterFn<TRow> };
};

export type RowsHandler<TRow> = (rows: readonly TRow[]) => readonly TRow[];

export type FilterHandler<TRow> = (
  rows: readonly TRow[],
  value: unknown,
  next: RowsHandler<TRow>,
  context: { columns: readonly ColumnModel<TRow>[] },
) => readonly TRow[];

export type GridFilterModel<TRow> = {
  id: string;
  mode?: ProcessingMode;
  handle?: FilterHandler<TRow>;
};
