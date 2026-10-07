import type { CSSProperties, ReactNode } from "react";

import type {
  Accessor,
  ColumnModel,
  GridFilterModel,
  RowId,
} from "../domain/types";
import type { GridLabels } from "./labels";
import type { ColorScheme, GridTheme } from "./styles/theme";

export type CellContext<TRow> = { row: TRow; rowId: RowId; value: unknown };

export type FilterOption = { label: string; value: string };

export type FilterRenderContext<TValue = unknown> = {
  id: string;
  label: string;
  value: TValue | undefined;
  setValue(value: TValue | undefined): void;
  // Closes the column filter popover; does nothing in the toolbar.
  close(): void;
};

type FilterUi = {
  placeholder?: string;
  options?: readonly FilterOption[];
  // Replaces the built-in control.
  render?: (context: FilterRenderContext) => ReactNode;
};

export type ControlVariant = "search" | "text" | "select" | "number-range" | "toggle";

export type ColumnFilterDef<TRow> = NonNullable<ColumnModel<TRow>["filter"]> &
  FilterUi;

export type ColumnDef<TRow> = Omit<ColumnModel<TRow>, "filter"> & {
  header: ReactNode;
  // Accessible name when `header` is not plain text.
  label?: string;
  cell?: (context: CellContext<TRow>) => ReactNode;
  filter?: ColumnFilterDef<TRow>;
  align?: "start" | "center" | "end";
  width?: string;
  className?: string;
};

// A filter above the grid: one link of the filter chain plus its control.
export type GridFilterDef<TRow> = GridFilterModel<TRow> &
  FilterUi & {
    label?: string;
    variant?: ControlVariant;
    // Lets a "select" read its options from the loaded rows.
    accessor?: Accessor<TRow>;
  };

export type GridFiltersOption<TRow> =
  | readonly GridFilterDef<TRow>[]
  | ((defaults: readonly GridFilterDef<TRow>[]) => readonly GridFilterDef<TRow>[]);

export type ActionTone = "neutral" | "danger";

type ActionBase = {
  id: string;
  label: string;
  icon?: ReactNode;
  tone?: ActionTone;
};

// Return a promise from `onClick` to disable the button while it runs.
export type RowAction<TRow> = ActionBase & {
  onClick: (row: TRow) => unknown;
  confirm?: string | ((row: TRow) => string);
  isDisabled?: (row: TRow) => boolean;
  isHidden?: (row: TRow) => boolean;
  // Draws a line above the item in the actions menu.
  separatorBefore?: boolean;
};

export type RowActionsRenderContext<TRow> = {
  row: TRow;
  rowId: RowId;
  // Accessible name of the row, e.g. for an aria-label.
  rowName: string;
};

export type BulkAction<TRow> = ActionBase & {
  onClick: (rows: TRow[], context: { clearSelection: () => void }) => unknown;
  confirm?: string | ((rows: TRow[]) => string);
};

export type LoadingOverlayOptions = {
  // Wait before showing it, so instant changes don't flash (default 150).
  delayMs?: number;
  // Once shown, keep it at least this long (default 300).
  minDurationMs?: number;
  // Replaces the built-in spinner.
  spinner?: ReactNode;
  // Replaces everything inside the overlay.
  content?: ReactNode;
};

export type GridSlot =
  | "page"
  | "pageHeader"
  | "pageTitle"
  | "pageDescription"
  | "pageActions"
  | "root"
  | "toolbar"
  | "search"
  | "control"
  | "button"
  | "checkbox"
  | "bulkActions"
  | "tableFrame"
  | "tableWrapper"
  | "table"
  | "headerCell"
  | "filterTrigger"
  | "filterPopover"
  | "menu"
  | "menuItem"
  | "row"
  | "cell"
  | "state"
  | "overlay"
  | "spinner"
  | "pagination";

export type GridClassNames = Partial<Record<GridSlot, string>>;

export type GridStyles = Partial<Record<GridSlot, CSSProperties>>;

export type GridAppearance = {
  className?: string;
  classNames?: GridClassNames;
  // Without it the grid follows the surrounding `color-scheme` (and `.dark`).
  colorScheme?: ColorScheme;
  labels?: Partial<GridLabels>;
  style?: CSSProperties;
  styles?: GridStyles;
  theme?: GridTheme;
  unstyled?: boolean;
};
