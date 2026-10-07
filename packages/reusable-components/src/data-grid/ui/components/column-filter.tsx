"use client";

import { isActiveFilterValue } from "../../domain/filter-fns";
import { getColumnLabel } from "../columns";
import { useDataGridContext } from "../grid-context";
import type { ColumnDef, ColumnFilterDef } from "../types";
import { useAnchoredPopover } from "../use-anchored-popover";
import { FilterControl } from "./filter-control";
import { FilterIcon } from "./icons";

type ColumnFilterProps<TRow> = {
  column: ColumnDef<TRow>;
  filter: ColumnFilterDef<TRow>;
};

export function ColumnFilter<TRow>({ column, filter }: ColumnFilterProps<TRow>) {
  const { grid, labels, slot } = useDataGridContext<TRow>();
  const { onToggle, popoverId, triggerRef } = useAnchoredPopover({
    align: column.align,
    focusSelector: "input, select",
  });

  const filters = grid.filters.column;
  const value = filters.values[column.id];
  const isActive = isActiveFilterValue(value);
  const label = getColumnLabel(column);
  const close = () => document.getElementById(popoverId)?.hidePopover();

  return (
    <>
      <button
        {...slot("filterTrigger", "rc-grid__filter-trigger")}
        aria-label={isActive ? labels.filterByActive(label) : labels.filterBy(label)}
        data-active={isActive || undefined}
        popoverTarget={popoverId}
        ref={triggerRef}
        type="button"
      >
        <FilterIcon />
      </button>

      <div
        {...slot("filterPopover", "rc-grid__filter-popover")}
        aria-label={labels.filterBy(label)}
        id={popoverId}
        onToggle={onToggle}
        popover="auto"
        role="dialog"
      >
        <span className="rc-grid__filter-title">{labels.filterBy(label)}</span>
        <FilterControl
          debounceMs={filters.debounceMs}
          id={column.id}
          label={label}
          onChange={(next) => filters.set(column.id, next)}
          onClose={close}
          options={filters.getOptions(column)}
          placeholder={filter.placeholder}
          placement="column"
          render={filter.render}
          value={value}
          variant={filter.variant ?? "text"}
        />
        {isActive ? (
          <button
            {...slot("button", "rc-button")}
            data-size="small"
            data-variant="ghost"
            onClick={() => filters.set(column.id, undefined)}
            type="button"
          >
            {labels.clearFilter}
          </button>
        ) : null}
      </div>
    </>
  );
}
