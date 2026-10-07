"use client";

import type { ReactNode } from "react";

import { cx } from "../../../shared/class-names";
import { readValue } from "../../domain/accessor";
import type { RowId } from "../../domain/types";
import { isEmptyValue, toText } from "../../domain/values";
import { getRowName } from "../columns";
import { useDataGridContext } from "../grid-context";
import type { RowAction, RowActionsRenderContext } from "../types";
import type { GridRow } from "../use-data-grid";
import { ActionButton, resolveConfirmMessage } from "./action-button";
import { Checkbox } from "./checkbox";
import { RowActionsMenu } from "./row-actions-menu";

export type RowActionsConfig<TRow> = {
  display: "menu" | "inline";
  items: readonly RowAction<TRow>[];
  render?: (context: RowActionsRenderContext<TRow>) => ReactNode;
};

type GridTableRowProps<TRow> = {
  row: GridRow<TRow>;
  actions: RowActionsConfig<TRow> | undefined;
};

export function GridTableRow<TRow>({ actions, row }: GridTableRowProps<TRow>) {
  const { grid, labels, slot } = useDataGridContext<TRow>();
  const selected = grid.selection.isSelected(row.id);
  const rowName = getRowName(grid.columns, row.original, row.id);

  return (
    <tr {...slot("row", "rc-grid__row")} data-selected={selected || undefined}>
      {grid.selection.enabled ? (
        <td {...slot("cell", "rc-grid__cell rc-grid__select-cell")}>
          <Checkbox
            aria-label={labels.selectRow(rowName)}
            checked={selected}
            onCheckedChange={(checked) => grid.selection.setSelected(row.id, checked)}
          />
        </td>
      ) : null}

      {grid.columns.map((column) => {
        const value = readValue(row.original, column.accessor);

        return (
          <td
            {...slot("cell", cx("rc-grid__cell", column.className))}
            data-align={column.align}
            key={column.id}
          >
            {column.cell ? (
              column.cell({ row: row.original, rowId: row.id, value })
            ) : (
              <CellValue value={value} />
            )}
          </td>
        );
      })}

      {actions ? (
        <td {...slot("cell", "rc-grid__cell rc-grid__actions-cell")}>
          <RowActions actions={actions} row={row.original} rowId={row.id} rowName={rowName} />
        </td>
      ) : null}
    </tr>
  );
}

function RowActions<TRow>({
  actions,
  row,
  rowId,
  rowName,
}: {
  actions: RowActionsConfig<TRow>;
  row: TRow;
  rowId: RowId;
  rowName: string;
}) {
  const { labels } = useDataGridContext<TRow>();

  if (actions.render) {
    return actions.render({ row, rowId, rowName });
  }

  const visible = actions.items.filter((action) => !action.isHidden?.(row));

  if (!visible.length) {
    return null;
  }

  if (actions.display === "menu") {
    return <RowActionsMenu actions={visible} row={row} rowName={rowName} />;
  }

  return (
    <div className="rc-grid__row-actions">
      {visible.map((action) => (
        <ActionButton
          accessibleLabel={labels.rowAction(action.label, rowName)}
          confirmMessage={resolveConfirmMessage(action.confirm, row)}
          disabled={action.isDisabled?.(row)}
          icon={action.icon}
          key={action.id}
          label={action.label}
          onAction={() => action.onClick(row)}
          size="small"
          tone={action.tone}
          variant="ghost"
        />
      ))}
    </div>
  );
}

function CellValue({ value }: { value: unknown }) {
  const { labels } = useDataGridContext();

  if (isEmptyValue(value)) {
    return <span className="rc-grid__empty-value">{labels.emptyValue}</span>;
  }

  if (typeof value === "boolean") {
    return value ? labels.yes : labels.no;
  }

  // ISO date: the same on the server and in the browser, so hydration matches.
  return value instanceof Date ? toText(value).slice(0, 10) : toText(value);
}
