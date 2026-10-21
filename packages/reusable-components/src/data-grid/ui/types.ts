import type { CSSProperties, ReactNode } from "react";

import type { ColorScheme, Theme } from "../../shared/theme";
import type { Accessor, ColumnModel, GridFilterModel, RowId } from "../domain/types";
import type { GridLabels } from "./labels";

export type CellContext<TRow> = { row: TRow; rowId: RowId; value: unknown };

export type FilterOption = { label: string; value: string };

export type FilterRenderContext<TValue = unknown> = {
  id: string;
  label: string;
  value: TValue | undefined;
  setValue(value: TValue | undefined): void;
  close(): void;
};

type FilterUi = {
  placeholder?: string;
  options?: readonly FilterOption[];
  render?: (context: FilterRenderContext) => ReactNode;
};

export type ControlVariant = "search" | "text" | "select" | "number-range" | "toggle";

export type ColumnFilterDef<TRow> = NonNullable<ColumnModel<TRow>["filter"]> & FilterUi;

export type ColumnDef<TRow> = Omit<ColumnModel<TRow>, "filter"> & {
  header: ReactNode;
  label?: string;
  cell?: (context: CellContext<TRow>) => ReactNode;
  filter?: ColumnFilterDef<TRow>;
  align?: "start" | "center" | "end";
  width?: string;
  className?: string;
};

export type GridFilterDef<TRow> = GridFilterModel<TRow> &
  FilterUi & {
    label?: string;
    variant?: ControlVariant;
    accessor?: Accessor<TRow>;
  };

export type GridFiltersOption<TRow> =
  | readonly GridFilterDef<TRow>[]
  | ((defaults: readonly GridFilterDef<TRow>[]) => readonly GridFilterDef<TRow>[]);

export type ActionTone = "neutral" | "danger";

type ActionBase = { id: string; label: string; icon?: ReactNode; tone?: ActionTone };

export type RowAction<TRow> = ActionBase & {
  onClick: (row: TRow) => unknown;
  confirm?: string | ((row: TRow) => string);
  isDisabled?: (row: TRow) => boolean;
  isHidden?: (row: TRow) => boolean;
  separatorBefore?: boolean;
};

export type RowActionsRenderContext<TRow> = { row: TRow; rowId: RowId; rowName: string };

export type BulkAction<TRow> = ActionBase & {
  onClick: (rows: TRow[], context: { clearSelection: () => void }) => unknown;
  confirm?: string | ((rows: TRow[]) => string);
};

export type LoadingOverlayOptions = {
  delayMs?: number;
  minDurationMs?: number;
  spinner?: ReactNode;
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
  colorScheme?: ColorScheme;
  labels?: Partial<GridLabels>;
  style?: CSSProperties;
  styles?: GridStyles;
  theme?: Theme;
  unstyled?: boolean;
};
