"use client";

import { Fragment, useState, type KeyboardEvent, type ReactNode } from "react";

import { MoreIcon } from "../../../shared/icons";
import { useAnchoredPopover } from "../../../shared/use-anchored-popover";
import { useGridContext } from "../context";
import type { ActionTone, BulkAction, RowAction } from "../types";

const ENABLED_ITEM = '[role="menuitem"]:not(:disabled)';

export function messageFor<TValue>(confirm: string | ((value: TValue) => string) | undefined, value: TValue) {
  return typeof confirm === "function" ? confirm(value) : confirm;
}

export function ActionButton({
  accessibleLabel,
  confirmMessage,
  disabled = false,
  icon,
  label,
  onAction,
  size,
  tone,
  variant,
}: {
  label: string;
  accessibleLabel?: string;
  icon?: ReactNode;
  tone?: ActionTone;
  variant?: "ghost";
  size?: "small";
  disabled?: boolean;
  confirmMessage?: string;
  onAction: () => unknown;
}) {
  const { confirm, slot } = useGridContext();
  const [pending, setPending] = useState(false);

  async function run() {
    if (pending) {
      return;
    }

    setPending(true);

    try {
      if (!confirmMessage || (await confirm(confirmMessage))) {
        await onAction();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      {...slot("button", "rc-button")}
      aria-disabled={pending || undefined}
      aria-label={accessibleLabel}
      data-size={size}
      data-tone={tone === "danger" ? tone : undefined}
      data-variant={variant}
      disabled={disabled}
      onClick={() => void run()}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

export function GridBulkActions<TRow>({ actions }: { actions: readonly BulkAction<TRow>[] }) {
  const { css, grid, labels, slot } = useGridContext<TRow>();
  const { clear, selectedRows } = grid.selection;

  if (!actions.length || !selectedRows.length) {
    return null;
  }

  const rows = [...selectedRows];

  return (
    <div {...slot("bulkActions", "rc-grid__bulk")} aria-label={labels.bulkActions} role="group">
      <span className={css("rc-grid__bulk-count")}>{labels.selectedRows(rows.length)}</span>
      {actions.map((action) => (
        <ActionButton
          confirmMessage={messageFor(action.confirm, rows)}
          icon={action.icon}
          key={action.id}
          label={action.label}
          onAction={() => action.onClick(rows, { clearSelection: clear })}
          size="small"
          tone={action.tone}
        />
      ))}
      <button {...slot("button", "rc-button")} data-size="small" data-variant="ghost" onClick={clear} type="button">
        {labels.clearSelection}
      </button>
    </div>
  );
}

export function RowActionsMenu<TRow>({
  actions,
  row,
  rowName,
}: {
  actions: readonly RowAction<TRow>[];
  row: TRow;
  rowName: string;
}) {
  const { confirm, css, labels, slot } = useGridContext<TRow>();
  const [pending, setPending] = useState(false);
  const { onToggle, popoverId, triggerRef } = useAnchoredPopover({ align: "end", focusSelector: ENABLED_ITEM });

  async function run(action: RowAction<TRow>) {
    document.getElementById(popoverId)?.hidePopover();
    setPending(true);

    try {
      const message = messageFor(action.confirm, row);

      if (!message || (await confirm(message))) {
        await action.onClick(row);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        {...slot("button", "rc-button")}
        aria-haspopup="menu"
        aria-label={labels.openRowActions(rowName)}
        data-icon=""
        data-size="small"
        data-variant="ghost"
        popoverTarget={popoverId}
        ref={triggerRef}
        type="button"
      >
        <MoreIcon />
      </button>
      <div
        {...slot("menu", "rc-menu")}
        aria-label={labels.openRowActions(rowName)}
        id={popoverId}
        onKeyDown={moveFocus}
        onToggle={onToggle}
        popover="auto"
        role="menu"
      >
        {actions.map((action) => (
          <Fragment key={action.id}>
            {action.separatorBefore ? <div className={css("rc-menu__separator")} role="separator" /> : null}
            <button
              {...slot("menuItem", "rc-menu__item")}
              data-tone={action.tone === "danger" ? "danger" : undefined}
              disabled={pending || action.isDisabled?.(row)}
              onClick={() => void run(action)}
              role="menuitem"
              tabIndex={-1}
              type="button"
            >
              {action.icon}
              {action.label}
            </button>
          </Fragment>
        ))}
      </div>
    </>
  );
}

function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
  if (event.key === "Tab") {
    event.currentTarget.hidePopover();

    return;
  }

  const items = [...event.currentTarget.querySelectorAll<HTMLElement>(ENABLED_ITEM)];
  const current = items.indexOf(document.activeElement as HTMLElement);
  const last = items.length - 1;
  const target = {
    ArrowDown: current >= last ? 0 : current + 1,
    ArrowUp: current <= 0 ? last : current - 1,
    End: last,
    Home: 0,
  }[event.key];

  if (target !== undefined && items[target]) {
    event.preventDefault();
    items[target].focus();
  }
}
