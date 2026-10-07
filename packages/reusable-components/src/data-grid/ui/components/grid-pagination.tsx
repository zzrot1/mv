"use client";

import type { ReactNode } from "react";

import { getPageRange } from "../../domain/pagination";
import { useDataGridContext } from "../grid-context";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "./icons";

export function GridPagination() {
  const { grid, labels, slot } = useDataGridContext();
  const { pagination } = grid;

  if (!pagination.enabled) {
    return null;
  }

  const { pageCount, pageIndex, pageSize, rowCount, setPageIndex } = pagination;
  const { from, to } = getPageRange({ pageIndex, pageSize }, rowCount);
  const isFirst = pageIndex <= 0;
  const isLast = pageIndex >= pageCount - 1;
  const pageSizes = pagination.pageSizeOptions.includes(pageSize)
    ? pagination.pageSizeOptions
    : [...pagination.pageSizeOptions, pageSize].sort((a, b) => a - b);

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

      <div className="rc-grid__pagination-group">
        {pageSizes.length > 1 ? (
          <label className="rc-grid__page-size">
            <span>{labels.rowsPerPage}</span>
            <select
              {...slot("control", "rc-control")}
              onChange={(event) => pagination.setPageSize(Number(event.target.value))}
              value={pageSize}
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <span>{labels.pageStatus(pageIndex + 1, pageCount)}</span>

        <div className="rc-grid__page-buttons">
          {pageButton(labels.firstPage, <ChevronsLeftIcon />, isFirst, 0)}
          {pageButton(labels.previousPage, <ChevronLeftIcon />, isFirst, pageIndex - 1)}
          {pageButton(labels.nextPage, <ChevronRightIcon />, isLast, pageIndex + 1)}
          {pageButton(labels.lastPage, <ChevronsRightIcon />, isLast, pageCount - 1)}
        </div>
      </div>
    </nav>
  );
}
