import { describe, expect, it, vi } from "vitest";

import {
  buildClientChain,
  computeGridView,
  runChain,
  type ChainLink,
  type GridViewInput,
} from "../application/grid-view";
import {
  createGridState,
  gridReducer,
  hasActiveFilters,
  mergeGridState,
  toggleSorting,
} from "../application/grid-state";
import { toServerQuery } from "../application/server-query";
import { searchHandler } from "../domain/filtering";
import { resolveProcessingModes } from "../domain/processing-modes";
import type { ColumnModel, GridState } from "../domain/types";

type Item = { id: number; name: string; group: string };

const items: Item[] = Array.from({ length: 25 }, (_, index) => ({
  group: (index + 1) % 2 ? "odd" : "even",
  id: index + 1,
  name: `Item ${index + 1}`,
}));

const columns: ColumnModel<Item>[] = [
  { accessor: "name", id: "name" },
  { accessor: "group", filter: { variant: "select" }, id: "group" },
  { accessor: "id", id: "id" },
];

const client = resolveProcessingModes();
const server = resolveProcessingModes("server");

function input(overrides: Partial<GridViewInput<Item>> = {}): GridViewInput<Item> {
  return {
    columns,
    data: items,
    filters: [{ handle: searchHandler(), id: "search" }],
    modes: client,
    paginate: true,
    state: createGridState(),
    ...overrides,
  };
}

function withState(state: Partial<GridState>) {
  return { ...createGridState(), ...state };
}

describe("runChain", () => {
  it("runs the links in order, each passing to the next", () => {
    const links: ChainLink<number>[] = [
      (rows, next) => next(rows.filter((value) => value > 1)),
      (rows, next) => next(rows.map((value) => value * 10)),
    ];

    expect(runChain(links, [1, 2, 3])).toEqual([20, 30]);
    expect(runChain([], [1, 2])).toEqual([1, 2]);
  });

  it("stops at a link that doesn't call next", () => {
    const last = vi.fn<ChainLink<number>>((rows, next) => next(rows));

    expect(runChain([(rows) => rows.slice(0, 1), last], [1, 2, 3])).toEqual([1]);
    expect(last).not.toHaveBeenCalled();
  });
});

describe("grid state", () => {
  it("starts empty, with the given page size and initial values", () => {
    expect(createGridState()).toEqual({
      columnFilters: {},
      filters: {},
      pagination: { pageIndex: 0, pageSize: 10 },
      rowSelection: {},
      sorting: [],
    });
    expect(createGridState({ pagination: { pageIndex: 2, pageSize: 5 } }, 25).pagination).toEqual({
      pageIndex: 2,
      pageSize: 5,
    });
  });

  it("lets controlled slices override the internal ones", () => {
    const internal = createGridState();
    const sorting = [{ desc: true, id: "name" }];

    expect(mergeGridState(internal, undefined)).toBe(internal);
    expect(mergeGridState(internal, { sorting })).toEqual({ ...internal, sorting });
  });

  it("knows when any filter is active", () => {
    expect(hasActiveFilters(createGridState())).toBe(false);
    expect(hasActiveFilters(withState({ filters: { search: "" } }))).toBe(false);
    expect(hasActiveFilters(withState({ columnFilters: { group: "odd" } }))).toBe(true);
  });
});

describe("gridReducer", () => {
  const onPageThree = withState({ pagination: { pageIndex: 2, pageSize: 10 } });

  it("sets a filter, drops an empty one and goes back to the first page", () => {
    const filtered = gridReducer(onPageThree, { id: "search", type: "setFilter", value: "item" });

    expect(filtered.filters).toEqual({ search: "item" });
    expect(filtered.pagination.pageIndex).toBe(0);
    expect(gridReducer(filtered, { id: "search", type: "setFilter", value: "" }).filters).toEqual({});
  });

  it("returns the same state when a filter doesn't change", () => {
    const filtered = gridReducer(onPageThree, { id: "search", type: "setFilter", value: "item" });

    expect(gridReducer(filtered, { id: "search", type: "setFilter", value: "item" })).toBe(filtered);
  });

  it("sets and resets column filters", () => {
    const filtered = gridReducer(onPageThree, { id: "group", type: "setColumnFilter", value: "odd" });

    expect(filtered.columnFilters).toEqual({ group: "odd" });
    expect(filtered.pagination.pageIndex).toBe(0);
    expect(gridReducer(filtered, { id: "group", type: "setColumnFilter", value: "odd" })).toBe(filtered);

    const reset = gridReducer(
      { ...filtered, filters: { search: "x" }, pagination: { pageIndex: 1, pageSize: 10 } },
      { type: "resetFilters" },
    );

    expect(reset).toMatchObject({ columnFilters: {}, filters: {}, pagination: { pageIndex: 0 } });
  });

  it("changes pages, page sizes and the selection", () => {
    expect(gridReducer(onPageThree, { pageIndex: -2, type: "setPageIndex" }).pagination.pageIndex).toBe(0);
    expect(gridReducer(onPageThree, { pageSize: 25, type: "setPageSize" }).pagination).toEqual({
      pageIndex: 0,
      pageSize: 25,
    });

    const selected = gridReducer(onPageThree, { rowIds: ["1", "2"], selected: true, type: "setRowsSelected" });

    expect(selected.rowSelection).toEqual({ 1: true, 2: true });
    expect(gridReducer(selected, { type: "clearSelection" }).rowSelection).toEqual({});
  });

  it("cycles a column's sort through ascending, descending and off", () => {
    const ascending = gridReducer(createGridState(), { id: "name", multi: false, type: "toggleSorting" });
    const descending = gridReducer(ascending, { id: "name", multi: false, type: "toggleSorting" });

    expect(ascending.sorting).toEqual([{ desc: false, id: "name" }]);
    expect(descending.sorting).toEqual([{ desc: true, id: "name" }]);
    expect(gridReducer(descending, { id: "name", multi: false, type: "toggleSorting" }).sorting).toEqual([]);
  });

  it("adds to the sort in multi mode and replaces it otherwise", () => {
    const byName = [{ desc: false, id: "name" }];
    const both = toggleSorting(byName, "group", true);

    expect(both).toEqual([...byName, { desc: false, id: "group" }]);
    expect(toggleSorting(both, "group", true)).toEqual([...byName, { desc: true, id: "group" }]);
    expect(toggleSorting(toggleSorting(both, "group", true), "group", true)).toEqual(byName);
    expect(toggleSorting(byName, "group", false)).toEqual([{ desc: false, id: "group" }]);
  });
});

describe("toServerQuery", () => {
  const state = withState({
    columnFilters: { group: "odd" },
    filters: { group: "odd", search: "item" },
    sorting: [{ desc: true, id: "id" }],
  });

  it("is empty when everything runs on the client", () => {
    expect(toServerQuery(state, client, [{ id: "search" }])).toEqual({});
  });

  it("sends only the filters that run on the server", () => {
    expect(toServerQuery(state, client, [{ id: "search", mode: "server" }, { id: "group" }])).toEqual({
      filters: { search: "item" },
    });
    expect(toServerQuery(state, client, [{ id: "missing", mode: "server" }])).toEqual({ filters: {} });
  });

  it("sends every step under server mode", () => {
    expect(toServerQuery(state, server, [{ id: "search" }])).toEqual({
      columnFilters: { group: "odd" },
      filters: { search: "item" },
      pagination: { pageIndex: 0, pageSize: 10 },
      sorting: [{ desc: true, id: "id" }],
    });
  });
});

describe("computeGridView", () => {
  it("filters, column-filters, sorts and paginates on the client, in that order", () => {
    const view = computeGridView(
      input({
        state: withState({
          columnFilters: { group: "odd" },
          filters: { search: "item 1" },
          sorting: [{ desc: true, id: "id" }],
        }),
      }),
    );

    expect(view.rows.map((item) => item.id)).toEqual([21, 19, 17, 15, 13, 11, 1]);
    expect(view).toMatchObject({ pageCount: 1, pageIndex: 0, rowCount: 7 });
  });

  it("skips a filter that is off or runs on the server", () => {
    const handle = vi.fn(searchHandler<Item>());

    computeGridView(input({ filters: [{ handle, id: "search" }] }));
    computeGridView(
      input({ filters: [{ handle, id: "search", mode: "server" }], state: withState({ filters: { search: "x" } }) }),
    );

    expect(handle).not.toHaveBeenCalled();
  });

  it("clamps a page past the end to the last page", () => {
    const view = computeGridView(input({ state: withState({ pagination: { pageIndex: 9, pageSize: 10 } }) }));

    expect(view.pageIndex).toBe(2);
    expect(view.rows.map((item) => item.id)).toEqual([21, 22, 23, 24, 25]);
  });

  it("shows every row without pagination", () => {
    expect(computeGridView(input({ paginate: false }))).toMatchObject({
      pageCount: 1,
      pageIndex: 0,
      rowCount: 25,
    });
  });

  it("takes the server's rows and total under server pagination", () => {
    const view = computeGridView(
      input({
        data: items.slice(0, 10),
        modes: server,
        rowCount: 95,
        state: withState({ pagination: { pageIndex: 3, pageSize: 10 }, sorting: [{ desc: true, id: "id" }] }),
      }),
    );

    expect(view).toMatchObject({ pageCount: 10, pageIndex: 3, rowCount: 95 });
    expect(view.rows[0].id).toBe(1);
  });

  it("builds no client links when every step runs on the server", () => {
    expect(buildClientChain(input({ modes: server }))).toEqual([]);
  });
});
