"use client";

import { useDataGridContext } from "../grid-context";
import type { BulkAction } from "../types";
import { ActionButton, resolveConfirmMessage } from "./action-button";

export type GridBulkActionsProps<TRow> = {
  actions: readonly BulkAction<TRow>[];
};

export function GridBulkActions<TRow>({ actions }: GridBulkActionsProps<TRow>) {
  const { grid, labels, slot } = useDataGridContext<TRow>();
  const { clear, selectedRows } = grid.selection;

  if (!actions.length || !selectedRows.length) {
    return null;
  }

  const rows = [...selectedRows];

  return (
    <div
      {...slot("bulkActions", "rc-grid__bulk")}
      aria-label={labels.bulkActions}
      role="group"
    >
      <span className="rc-grid__bulk-count">{labels.selectedRows(rows.length)}</span>
      {actions.map((action) => (
        <ActionButton
          confirmMessage={resolveConfirmMessage(action.confirm, rows)}
          icon={action.icon}
          key={action.id}
          label={action.label}
          onAction={() => action.onClick(rows, { clearSelection: clear })}
          size="small"
          tone={action.tone}
        />
      ))}
      <button
        {...slot("button", "rc-button")}
        data-size="small"
        data-variant="ghost"
        onClick={clear}
        type="button"
      >
        {labels.clearSelection}
      </button>
    </div>
  );
}
