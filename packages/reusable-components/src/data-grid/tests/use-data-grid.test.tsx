import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderHook } from "vitest-browser-react";

import { DataGridConfigProvider } from "../ui/context";
import type { ColumnDef } from "../ui/types";
import { useDataGrid, type DataGridInstance, type DataGridOptions } from "../ui/use-data-grid";

type Person = { id: number; name: string; team: string; age: number };

const people: Person[] = [
  { age: 34, id: 1, name: "Ana", team: "Platform" },
  { age: 28, id: 2, name: "Bogdan", team: "Content" },
  { age: 45, id: 3, name: "Cristina", team: "Sales" },
  { age: 41, id: 4, name: "Dan", team: "Platform" },
  { age: 37, id: 5, name: "Elena", team: "Security" },
  { age: 25, id: 6, name: "Florin", team: "Sales" },
  { age: 31, id: 7, name: "Gabriela", team: "Content" },
  { age: 46, id: 8, name: "Horia", team: "Support" },
  { age: 29, id: 9, name: "Ioana", team: "Support" },
  { age: 52, id: 10, name: "Mihai", team: "Platform" },
  { age: 39, id: 11, name: "Oana", team: "Security" },
  { age: 33, id: 12, name: "Radu", team: "Content" },
];

const columns: ColumnDef<Person>[] = [
  { accessor: "name", header: "Name", id: "name" },
  { accessor: "team", filter: { variant: "select" }, header: "Team", id: "team" },
  { accessor: "age", header: "Age", id: "age" },
];

type Wrapper = (props: { children: ReactNode }) => ReactNode;

function setup(options: Partial<DataGridOptions<Person>> = {}, wrapper?: Wrapper) {
  return renderHook(() => useDataGrid({ columns, data: people, ...options }), { wrapper });
}

function names(grid: DataGridInstance<Person>) {
  return grid.rows.map((row) => row.original.name);
}

describe("useDataGrid", () => {
  it("keeps the rows selected on earlier server pages", async () => {
    const { act, rerender, result } = await renderHook(
      (page?: readonly Person[]) =>
        useDataGrid({ columns, data: page, enableRowSelection: true, mode: "server", rowCount: 12 }),
      { initialProps: people.slice(0, 5) },
    );

    await act(() => result.current.selection.setSelected("1", true));
    await rerender(people.slice(5, 10));

    expect(result.current.selection.selectedRows.map((person) => person.name)).toEqual(["Ana"]);
  });

  it("starts on the first page, with the search bar as the only filter", async () => {
    const { result } = await setup();

    expect(result.current.filters.toolbar.definitions.map((filter) => filter.id)).toEqual(["search"]);
    expect(result.current.rows).toHaveLength(10);
    expect(result.current.rows[0]).toEqual({ id: "1", original: people[0] });
    expect(result.current.pagination).toMatchObject({
      enabled: true,
      pageCount: 2,
      pageIndex: 0,
      pageSize: 10,
      pageSizeOptions: [10, 25, 50, 100],
      rowCount: 12,
    });
    expect(result.current.isProcessing).toBe(false);
  });

  it("searches, goes back to the first page, and resets", async () => {
    const { act, result } = await setup();

    await act(() => result.current.pagination.setPageIndex(1));
    await expect.poll(() => result.current.pagination.pageIndex).toBe(1);

    await act(() => result.current.filters.toolbar.set("search", "an"));
    await expect.poll(() => names(result.current)).toEqual(["Ana", "Bogdan", "Dan", "Ioana", "Oana"]);
    expect(result.current.pagination.pageIndex).toBe(0);
    expect(result.current.filters.hasActive).toBe(true);

    await act(() => result.current.filters.reset());
    await expect.poll(() => result.current.rows.length).toBe(10);
    expect(result.current.filters.hasActive).toBe(false);
  });

  it("reads a select column's options from the data and filters by them", async () => {
    const { act, result } = await setup();

    expect(result.current.filters.column.getOptions(columns[1]).map((option) => option.value)).toEqual([
      "Content",
      "Platform",
      "Sales",
      "Security",
      "Support",
    ]);
    expect(result.current.filters.column.getOptions(columns[0])).toEqual([]);

    await act(() => result.current.filters.column.set("team", "Sales"));
    await expect.poll(() => names(result.current)).toEqual(["Cristina", "Florin"]);
  });

  it("sorts by one column at a time unless multi-sort is on", async () => {
    const single = await setup();

    await single.act(() => single.result.current.sorting.toggle("age"));
    await expect.poll(() => names(single.result.current).slice(0, 3)).toEqual(["Florin", "Bogdan", "Ioana"]);
    expect(single.result.current.sorting.getDirection("age")).toBe("asc");

    await single.act(() => single.result.current.sorting.toggle("team", true));
    expect(single.result.current.sorting.state).toEqual([{ desc: false, id: "team" }]);

    const multi = await setup({ enableMultiSort: true });

    await multi.act(() => multi.result.current.sorting.toggle("team"));
    await multi.act(() => multi.result.current.sorting.toggle("age", true));
    await expect.poll(() => names(multi.result.current).slice(0, 3)).toEqual(["Bogdan", "Gabriela", "Radu"]);
    expect(multi.result.current.sorting.getDirection("name")).toBeUndefined();
  });

  it("selects the rows of a page and keeps the selection across pages", async () => {
    const { act, result } = await setup({ enableRowSelection: true });

    await act(() => result.current.selection.setPageSelected(true));
    expect(result.current.selection.pageStatus).toBe("all");
    expect(result.current.selection.selectedRows).toHaveLength(10);

    await act(() => result.current.pagination.setPageIndex(1));
    await expect.poll(() => result.current.selection.pageStatus).toBe("none");
    await act(() => result.current.selection.setSelected("12", true));

    expect(result.current.selection.isSelected("12")).toBe(true);
    expect(result.current.selection.selectedRows).toHaveLength(11);

    await act(() => result.current.selection.clear());
    expect(result.current.selection.selectedRows).toHaveLength(0);
  });

  it("lets controlled state win and reports every change", async () => {
    const onStateChange = vi.fn();
    const { act, result } = await setup({
      onStateChange,
      state: { sorting: [{ desc: true, id: "age" }] },
    });

    expect(names(result.current)[0]).toBe("Mihai");

    await act(() => result.current.sorting.toggle("age"));

    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({ sorting: [] }));
    expect(result.current.sorting.state).toEqual([{ desc: true, id: "age" }]);
  });

  it("reports the server query on mount and on every change, in server mode", async () => {
    const onQueryChange = vi.fn();
    const page = people.slice(0, 10);
    const { act, result } = await setup({ data: page, mode: "server", onQueryChange, rowCount: 40 });

    await vi.waitFor(() =>
      expect(onQueryChange).toHaveBeenCalledWith({
        columnFilters: {},
        filters: {},
        pagination: { pageIndex: 0, pageSize: 10 },
        sorting: [],
      }),
    );
    expect(result.current.pagination.pageCount).toBe(4);
    expect(result.current.filters.toolbar.getDebounceMs(result.current.filters.toolbar.definitions[0])).toBe(300);
    expect(result.current.filters.column.debounceMs).toBe(300);

    await act(() => result.current.sorting.toggle("name"));

    await vi.waitFor(() =>
      expect(onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ sorting: [{ desc: false, id: "name" }] }),
      ),
    );
    expect(onQueryChange).toHaveBeenCalledTimes(2);
    expect(names(result.current)[0]).toBe("Ana");
  });

  it("never calls onQueryChange in client mode", async () => {
    const onQueryChange = vi.fn();
    const { act, result } = await setup({ onQueryChange });

    await act(() => result.current.sorting.toggle("name"));

    expect(onQueryChange).not.toHaveBeenCalled();
    expect(result.current.filters.toolbar.getDebounceMs(result.current.filters.toolbar.definitions[0])).toBe(0);
  });

  it("uses the row index as id when rows have none, and accepts missing data", async () => {
    const plain = await renderHook(() =>
      useDataGrid({
        columns: [{ accessor: "label", header: "Label", id: "label" }],
        data: [{ label: "first" }, { label: "second" }],
      }),
    );
    const empty = await setup({ data: undefined });

    expect(plain.result.current.rows.map((row) => row.id)).toEqual(["0", "1"]);
    expect(empty.result.current.rows).toEqual([]);
  });

  it("shows every row without pagination, and takes page sizes from the provider", async () => {
    const all = await setup({ enablePagination: false });
    const provided = await setup({}, ({ children }) => (
      <DataGridConfigProvider pageSizeOptions={[5, 15]}>{children}</DataGridConfigProvider>
    ));

    expect(all.result.current.rows).toHaveLength(12);
    expect(provided.result.current.pagination.pageSizeOptions).toEqual([5, 15]);

    await provided.act(() => provided.result.current.pagination.setPageSize(5));
    await expect.poll(() => provided.result.current.pagination.pageCount).toBe(3);
  });

  it("keeps the rows when a controlled state passes the same parts again", async () => {
    const readAge = vi.fn((person: Person) => person.age);
    const byAge: ColumnDef<Person>[] = [{ accessor: readAge, header: "Age", id: "age" }];
    const sorting = [{ desc: false, id: "age" }];
    const { rerender } = await renderHook(() => useDataGrid({ columns: byAge, data: people, state: { sorting } }));
    const reads = readAge.mock.calls.length;

    await rerender();

    expect(readAge.mock.calls.length).toBe(reads);
  });

  it("moves back to the last page when the server has fewer rows than the current page needs", async () => {
    const { act, rerender, result } = await renderHook(
      (props?: { rowCount: number }) =>
        useDataGrid({ columns, data: people.slice(0, 2), mode: "server", rowCount: props?.rowCount }),
      { initialProps: { rowCount: 50 } },
    );

    await act(() => result.current.pagination.setPageIndex(4));
    await rerender({ rowCount: 40 });

    await expect.poll(() => result.current.pagination.pageIndex).toBe(3);
  });

  it("keeps the ids of rows that a custom filter copies", async () => {
    const { result } = await setup({
      filters: [{ handle: (rows, _value, next) => next(rows.map((row) => ({ ...row }))), id: "copy" }],
      initialState: { filters: { copy: true } },
    });

    expect(result.current.rows.slice(0, 3).map((row) => row.id)).toEqual(["1", "2", "3"]);
  });
});
