"use client";

import { Fragment, type KeyboardEvent } from "react";

import { useDataGridContext } from "../grid-context";
import type { RowAction } from "../types";
import { useAnchoredPopover } from "../use-anchored-popover";
import { resolveConfirmMessage } from "./action-button";
import { MoreIcon } from "./icons";

const ENABLED_ITEM = '[role="menuitem"]:not(:disabled)';

type RowActionsMenuProps<TRow> = {
  actions: readonly RowAction<TRow>[];
  row: TRow;
  rowName: string;
};

export function RowActionsMenu<TRow>({ actions, row, rowName }: RowActionsMenuProps<TRow>) {
  const { confirm, labels, slot } = useDataGridContext<TRow>();
  const { onToggle, popoverId, triggerRef } = useAnchoredPopover({
    align: "end",
    focusSelector: ENABLED_ITEM,
  });

  async function runAction(action: RowAction<TRow>, menu: HTMLElement) {
    menu.hidePopover();

    const message = resolveConfirmMessage(action.confirm, row);

    if (message && !(await confirm(message))) {
      return;
    }

    await action.onClick(row);
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
            {action.separatorBefore ? (
              <div className="rc-menu__separator" role="separator" />
            ) : null}
            <button
              {...slot("menuItem", "rc-menu__item")}
              data-tone={action.tone === "danger" ? "danger" : undefined}
              disabled={action.isDisabled?.(row)}
              onClick={(event) => {
                const menu = event.currentTarget.closest<HTMLElement>("[popover]");

                if (menu) {
                  void runAction(action, menu);
                }
              }}
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

// Arrow keys, Home and End move between items, as in a native menu.
function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
  const items = [...event.currentTarget.querySelectorAll<HTMLElement>(ENABLED_ITEM)];
  const current = items.findIndex((item) => item === document.activeElement);
  const last = items.length - 1;

  const next: Partial<Record<string, number>> = {
    ArrowDown: current >= last ? 0 : current + 1,
    ArrowUp: current <= 0 ? last : current - 1,
    End: last,
    Home: 0,
  };
  const target = next[event.key];

  if (target !== undefined && items[target]) {
    event.preventDefault();
    items[target].focus();
  }
}
