export type GridLabels = {
  actions: string;
  allOptions: string;
  bulkActions: string;
  clearFilter: string;
  clearSelection: string;
  emptyValue: string;
  filterAll: (filter: string) => string;
  filterBy: (column: string) => string;
  filterByActive: (column: string) => string;
  filterPlaceholder: string;
  firstPage: string;
  lastPage: string;
  loading: string;
  maximum: string;
  minimum: string;
  nextPage: string;
  no: string;
  noResults: string;
  openRowActions: (row: string) => string;
  pageRange: (from: number, to: number, total: number) => string;
  pageStatus: (page: number, pageCount: number) => string;
  pagination: string;
  previousPage: string;
  resetFilters: string;
  rowAction: (action: string, row: string) => string;
  rowsPerPage: string;
  search: string;
  searchPlaceholder: string;
  selectAllRows: string;
  selectRow: (row: string) => string;
  selectedRows: (count: number) => string;
  yes: string;
};

export const defaultGridLabels: GridLabels = {
  actions: "Actions",
  allOptions: "All",
  bulkActions: "Bulk actions",
  clearFilter: "Clear",
  clearSelection: "Clear selection",
  emptyValue: "—",
  filterAll: (filter) => `${filter}: All`,
  filterBy: (column) => `Filter by ${column}`,
  filterByActive: (column) => `Filter by ${column} (active)`,
  filterPlaceholder: "Filter…",
  firstPage: "First page",
  lastPage: "Last page",
  loading: "Loading…",
  maximum: "Max",
  minimum: "Min",
  nextPage: "Next page",
  no: "No",
  noResults: "No results.",
  openRowActions: (row) => `Actions for ${row}`,
  pageRange: (from, to, total) => `${from}–${to} of ${total}`,
  pageStatus: (page, pageCount) => `Page ${page} of ${pageCount}`,
  pagination: "Pagination",
  previousPage: "Previous page",
  resetFilters: "Reset filters",
  rowAction: (action, row) => `${action} ${row}`,
  rowsPerPage: "Rows per page",
  search: "Search",
  searchPlaceholder: "Search…",
  selectAllRows: "Select all rows on this page",
  selectRow: (row) => `Select ${row}`,
  selectedRows: (count) => `${count} selected`,
  yes: "Yes",
};
