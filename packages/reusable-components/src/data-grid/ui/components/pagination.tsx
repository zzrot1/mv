"use client";

import type { ReactNode } from "react";

import { Select } from "../../../inputs";
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "../../../shared/icons";
import { getPageRange } from "../../domain/rows";
import { useGridContext } from "../context";

export function GridPagination() {
  const { css, grid, labels, slot, unstyled } = useGridContext();
  const { enabled, pageCount, pageIndex, pageSize, pageSizeOptions, rowCount, setPageIndex, setPageSize } =
    grid.pagination;

  if (!enabled) {
    return null;
  }

  const { from, to } = getPageRange({ pageIndex, pageSize }, rowCount);
  const sizes = [...new Set([...pageSizeOptions, pageSize])].sort((a, b) => a - b);
  const isFirst = pageIndex <= 0;
  const isLast = pageIndex >= pageCount - 1;

  function pageButton(label: string, icon: ReactNode, disabled: boolean, target: number) {
    return (
      <button
        {...slot("button", "rc-button")}
        aria-label={label}
        data-icon=""
        data-size="small"
        disabled={disabled}
        onClick={() => setPageIndex(target)}
        type="button"
      >
        {icon}
      </button>
    );
  }

  return (
    <nav {...slot("pagination", "rc-grid__pagination")} aria-label={labels.pagination}>
      <span aria-live="polite">{labels.pageRange(from, to, rowCount)}</span>
      <div className={css("rc-grid__pagination-group")}>
        {sizes.length > 1 ? (
          <label className={css("rc-grid__page-size")}>
            <span>{labels.rowsPerPage}</span>
            <Select
              {...slot("control", "")}
              onValueChange={(value) => setPageSize(Number(value))}
              options={sizes.map((size) => ({ label: String(size), value: String(size) }))}
              size="sm"
              unstyled={unstyled}
              value={String(pageSize)}
            />
          </label>
        ) : null}
        <span>{labels.pageStatus(pageIndex + 1, pageCount)}</span>
        <div className={css("rc-grid__page-buttons")}>
          {pageButton(labels.firstPage, <ChevronsLeftIcon />, isFirst, 0)}
          {pageButton(labels.previousPage, <ChevronLeftIcon />, isFirst, pageIndex - 1)}
          {pageButton(labels.nextPage, <ChevronRightIcon />, isLast, pageIndex + 1)}
          {pageButton(labels.lastPage, <ChevronsRightIcon />, isLast, pageCount - 1)}
        </div>
      </div>
    </nav>
  );
}
