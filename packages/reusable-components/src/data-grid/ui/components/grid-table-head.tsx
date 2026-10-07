"use client";

import { cx } from "../../../shared/class-names";
import { isSortableColumn } from "../../domain/accessor";
import { useDataGridContext } from "../grid-context";
import type { ColumnDef } from "../types";
import { Checkbox } from "./checkbox";
import { ColumnFilter } from "./column-filter";
import { SortIcon } from "./icons";

const ariaSort = { asc: "ascending", desc: "descending" } as const;

export function GridTableHead<TRow>({ showActions }: { showActions: boolean }) {
  const { grid, labels, slot } = useDataGridContext<TRow>();
  const { selection } = grid;

  return (
    <thead>
      <tr>
        {selection.enabled ? (
          <th
            {...slot("headerCell", "rc-grid__header-cell rc-grid__select-cell")}
            scope="col"
          >
            <Checkbox
              aria-label={labels.selectAllRows}
              checked={selection.pageStatus === "all"}
              disabled={!grid.rows.length}
              indeterminate={selection.pageStatus === "some"}
              onCheckedChange={selection.setPageSelected}
            />
          </th>
        ) : null}
        {grid.columns.map((column) => (
          <HeaderCell column={column} key={column.id} />
        ))}
        {showActions ? (
          <th
            {...slot("headerCell", "rc-grid__header-cell rc-grid__actions-cell")}
            scope="col"
          >
            <span className="rc-visually-hidden">{labels.actions}</span>
          </th>
        ) : null}
      </tr>
    </thead>
  );
}

function HeaderCell<TRow>({ column }: { column: ColumnDef<TRow> }) {
  const { grid, slot } = useDataGridContext<TRow>();
  const sortable = isSortableColumn(column);
  const direction = grid.sorting.getDirection(column.id);

  return (
    <th
      {...slot(
        "headerCell",
        cx("rc-grid__header-cell", column.className),
        column.width ? { width: column.width } : undefined,
      )}
      aria-sort={sortable ? (direction ? ariaSort[direction] : "none") : undefined}
      data-align={column.align}
      scope="col"
    >
      <span className="rc-grid__header">
        {sortable ? (
          <button
            className="rc-grid__sort"
            onClick={(event) => grid.sorting.toggle(column.id, event.shiftKey)}
            type="button"
          >
            {column.header}
            <span className="rc-grid__sort-icon">
              <SortIcon direction={direction} />
            </span>
          </button>
        ) : (
          column.header
        )}
        {column.filter ? <ColumnFilter column={column} filter={column.filter} /> : null}
      </span>
    </th>
  );
}
