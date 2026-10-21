import { describe, expect, it } from "vitest";

import {
  applyColumnFilters,
  columnFilterFns,
  filterBySearch,
  filterFns,
  getUniqueValues,
  isActiveFilterValue,
  matchHandler,
  predicateHandler,
  searchHandler,
} from "../domain/filtering";
import {
  hasServerProcessing,
  resolveFilterMode,
  resolveProcessingModes,
} from "../domain/processing-modes";
import {
  clampPageIndex,
  getPageCount,
  getPageRange,
  getSelectionStatus,
  isRowSelected,
  paginateRows,
  setRowsSelected,
} from "../domain/rows";
import { compareText, compareValues, sortRows } from "../domain/sorting";
import type { ColumnModel, RowsHandler } from "../domain/types";
import {
  isEmptyValue,
  isSearchableColumn,
  isSortableColumn,
  normalizeText,
  readValue,
  toNumber,
  toText,
} from "../domain/values";

type Person = { name: string; team: string; role: string; age: number | null; tags?: string[] };

const people: Person[] = [
  { age: 34, name: "Ana Pop", role: "Admin", tags: ["ops", "sql"], team: "Platform" },
  { age: null, name: "Ștefan Rusu", role: "Viewer", team: "Security" },
  { age: 28, name: "Dan Popescu", role: "Editor", tags: ["sql", ""], team: "Platform" },
  { age: 41, name: "Bogdan Ionescu", role: "Admin", tags: ["design"], team: "Content" },
];

const columns: ColumnModel<Person>[] = [
  { accessor: "name", filter: {}, id: "name" },
  { accessor: "team", id: "team" },
  { accessor: "role", filter: { variant: "select" }, id: "role" },
  { accessor: "age", filter: { variant: "number-range" }, id: "age" },
];

const keep: RowsHandler<Person> = (rows) => rows;

function names(rows: readonly Person[]) {
  return rows.map((person) => person.name);
}

describe("values", () => {
  it("treats null, undefined, the empty string, NaN and invalid dates as empty", () => {
    expect([null, undefined, "", Number.NaN, new Date("not a date")].map(isEmptyValue)).toEqual([
      true,
      true,
      true,
      true,
      true,
    ]);
    expect([0, false, " ", new Date(0)].map(isEmptyValue)).toEqual([false, false, false, false]);
  });

  it("turns any value into text", () => {
    expect(toText(null)).toBe("");
    expect(toText(3)).toBe("3");
    expect(toText(true)).toBe("true");
    expect(toText(new Date(Date.UTC(2020, 0, 2)))).toBe("2020-01-02T00:00:00.000Z");
    expect(toText(new Date("not a date"))).toBe("");
    expect(toText(["a", null, 2])).toBe("a, 2");
    expect(toText({ any: "object" })).toBe("");
  });

  it("normalizes text for matching: no diacritics, lower case, trimmed", () => {
    expect(normalizeText("  Ștefan ÎNCĂ ")).toBe("stefan inca");
  });

  it("reads numbers and rejects what isn't one", () => {
    expect(toNumber(7)).toBe(7);
    expect(toNumber("12.5")).toBe(12.5);
    expect(toNumber("abc")).toBeUndefined();
    expect(toNumber(Number.POSITIVE_INFINITY)).toBeUndefined();
    expect(toNumber("")).toBeUndefined();
    expect(toNumber(null)).toBeUndefined();
    expect(toNumber("  ")).toBeUndefined();
    expect(toNumber([])).toBeUndefined();
  });
});

describe("accessor", () => {
  it("reads a value by key or by function", () => {
    expect(readValue(people[0], "team")).toBe("Platform");
    expect(readValue(people[0], (person) => person.name.length)).toBe(7);
    expect(readValue(people[0], undefined)).toBeUndefined();
  });

  it("decides which columns sort and search", () => {
    expect(isSortableColumn<Person>({ accessor: "name", id: "name" })).toBe(true);
    expect(isSortableColumn<Person>({ id: "actions" })).toBe(false);
    expect(isSortableColumn<Person>({ id: "custom", sortingFn: () => 0 })).toBe(true);
    expect(isSortableColumn<Person>({ accessor: "name", enableSorting: false, id: "name" })).toBe(false);

    expect(isSearchableColumn<Person>({ accessor: "name", id: "name" })).toBe(true);
    expect(isSearchableColumn<Person>({ id: "actions" })).toBe(false);
    expect(isSearchableColumn<Person>({ accessor: "name", id: "name", searchable: false })).toBe(false);
  });
});

describe("filterBySearch", () => {
  it("keeps rows where every word appears in some searchable column", () => {
    expect(names(filterBySearch(people, columns, "pop platform"))).toEqual([
      "Ana Pop",
      "Dan Popescu",
    ]);
    expect(names(filterBySearch(people, columns, "pop security"))).toEqual([]);
  });

  it("ignores case and diacritics", () => {
    expect(names(filterBySearch(people, columns, "STEFAN"))).toEqual(["Ștefan Rusu"]);
  });

  it("returns the same rows for a blank search or no searchable column", () => {
    expect(filterBySearch(people, columns, "   ")).toBe(people);
    expect(filterBySearch(people, [{ id: "actions" }], "pop")).toBe(people);
  });
});

describe("sorting", () => {
  it("compares numbers, dates, booleans and text", () => {
    expect(compareValues(2, 10)).toBeLessThan(0);
    expect(compareValues(new Date(2020, 0, 1), new Date(2019, 0, 1))).toBeGreaterThan(0);
    expect(compareValues(false, true)).toBeLessThan(0);
    expect(compareText("item 2", "item 10")).toBeLessThan(0);
    expect(compareText("a", "A")).toBe(0);
  });

  it("sorts ascending and descending, with empty values last both ways", () => {
    const ages = (rows: readonly Person[]) => rows.map((person) => person.age);

    expect(ages(sortRows(people, columns, [{ desc: false, id: "age" }]))).toEqual([28, 34, 41, null]);
    expect(ages(sortRows(people, columns, [{ desc: true, id: "age" }]))).toEqual([41, 34, 28, null]);
  });

  it("puts NaN last, like an empty value", () => {
    const rows = [{ value: 3 }, { value: Number.NaN }, { value: 1 }];
    const byValue: ColumnModel<{ value: number }>[] = [{ accessor: "value", id: "value" }];

    expect(sortRows(rows, byValue, [{ desc: false, id: "value" }]).map((row) => row.value)).toEqual([
      1,
      3,
      Number.NaN,
    ]);
  });

  it("breaks ties with the next sort", () => {
    const sorted = sortRows(people, columns, [
      { desc: false, id: "team" },
      { desc: true, id: "name" },
    ]);

    expect(names(sorted)).toEqual(["Bogdan Ionescu", "Dan Popescu", "Ana Pop", "Ștefan Rusu"]);
  });

  it("uses a column's sortingFn", () => {
    const byLength: ColumnModel<Person> = {
      id: "length",
      sortingFn: (a, b) => a.name.length - b.name.length,
    };

    expect(names(sortRows(people, [byLength], [{ desc: true, id: "length" }]))[0]).toBe(
      "Bogdan Ionescu",
    );
  });

  it("leaves the rows alone for unknown or unsortable columns, and never mutates them", () => {
    const copy = [...people];

    expect(sortRows(people, columns, [{ desc: false, id: "missing" }])).toBe(people);
    expect(sortRows(people, [{ id: "actions" }], [{ desc: false, id: "actions" }])).toBe(people);
    sortRows(people, columns, [{ desc: false, id: "name" }]);
    expect(people).toEqual(copy);
  });
});

describe("pagination", () => {
  it("counts at least one page", () => {
    expect(getPageCount(0, 10)).toBe(1);
    expect(getPageCount(23, 10)).toBe(3);
    expect(getPageCount(5, 0)).toBe(5);
  });

  it("clamps a page index into range", () => {
    expect(clampPageIndex(5, 3)).toBe(2);
    expect(clampPageIndex(-1, 3)).toBe(0);
    expect(clampPageIndex(0, 0)).toBe(0);
  });

  it("slices a page and describes its range", () => {
    const rows = Array.from({ length: 23 }, (_, index) => index + 1);

    expect(paginateRows(rows, { pageIndex: 2, pageSize: 10 })).toEqual([21, 22, 23]);
    expect(getPageRange({ pageIndex: 2, pageSize: 10 }, 23)).toEqual({ from: 21, to: 23 });
    expect(getPageRange({ pageIndex: 0, pageSize: 10 }, 0)).toEqual({ from: 0, to: 0 });
  });
});

describe("row selection", () => {
  it("never takes inherited keys for selected rows", () => {
    expect(isRowSelected({}, "constructor")).toBe(false);
    expect(getSelectionStatus(["toString"], {})).toBe("none");
    expect(Object.keys(setRowsSelected({}, ["__proto__"], true))).toEqual(["__proto__"]);
  });

  it("reports none, some or all for the rows on a page", () => {
    expect(getSelectionStatus(["a", "b"], {})).toBe("none");
    expect(getSelectionStatus(["a", "b"], { a: true })).toBe("some");
    expect(getSelectionStatus(["a", "b"], { a: true, b: true })).toBe("all");
    expect(getSelectionStatus(["a"], { b: true })).toBe("none");
  });

  it("selects and unselects without mutating the previous selection", () => {
    const before = { a: true };

    expect(setRowsSelected(before, ["b", "c"], true)).toEqual({ a: true, b: true, c: true });
    expect(setRowsSelected({ a: true, b: true }, ["a"], false)).toEqual({ b: true });
    expect(before).toEqual({ a: true });
  });
});

describe("filter functions", () => {
  it("match text, equal values, number ranges and truthy values", () => {
    expect(filterFns.includesText("Ștefan Rusu", "stef", null)).toBe(true);
    expect(filterFns.equals("Admin", "Admin", null)).toBe(true);
    expect(filterFns.equals(["ops", "sql"], "sql", null)).toBe(true);
    expect(filterFns.equals(3, "3", null)).toBe(true);
    expect(filterFns.inNumberRange(5, [1, 10], null)).toBe(true);
    expect(filterFns.inNumberRange(5, [6, undefined], null)).toBe(false);
    expect(filterFns.inNumberRange(5, [undefined, 5], null)).toBe(true);
    expect(filterFns.inNumberRange("7", ["", 10], null)).toBe(true);
    expect(filterFns.inNumberRange(null, [1, 2], null)).toBe(false);
    expect(filterFns.isTruthy(0, undefined, null)).toBe(false);
    expect(filterFns.isTruthy("x", undefined, null)).toBe(true);
  });

  it("maps every column variant to its function", () => {
    expect(columnFilterFns).toEqual({
      "number-range": filterFns.inNumberRange,
      select: filterFns.equals,
      text: filterFns.includesText,
    });
  });

  it("treats empty values, false and empty ranges as off", () => {
    expect(["", null, undefined, false, [undefined, ""]].map(isActiveFilterValue)).toEqual([
      false,
      false,
      false,
      false,
      false,
    ]);
    expect([0, "x", [undefined, 5], true].map(isActiveFilterValue)).toEqual([
      true,
      true,
      true,
      true,
    ]);
  });
});

describe("applyColumnFilters", () => {
  it("applies every active column filter with its variant", () => {
    expect(names(applyColumnFilters(people, columns, { name: "pop" }))).toEqual([
      "Ana Pop",
      "Dan Popescu",
    ]);
    expect(names(applyColumnFilters(people, columns, { age: [30, undefined], role: "Admin" }))).toEqual([
      "Ana Pop",
      "Bogdan Ionescu",
    ]);
  });

  it("uses a custom fn, and skips inactive values and columns without a filter", () => {
    const custom: ColumnModel<Person>[] = [
      { accessor: "age", filter: { fn: (age) => Number(age) > 40 }, id: "age" },
      { accessor: "team", id: "team" },
    ];

    expect(names(applyColumnFilters(people, custom, { age: true, team: "Platform" }))).toEqual([
      "Bogdan Ionescu",
    ]);
    expect(applyColumnFilters(people, columns, { name: "" })).toBe(people);
  });

  it("collects the unique, sorted values of a column, arrays included", () => {
    expect(getUniqueValues(people, "tags")).toEqual(["design", "ops", "sql"]);
    expect(getUniqueValues(people, "team")).toEqual(["Content", "Platform", "Security"]);
    expect(getUniqueValues(people, undefined)).toEqual([]);
  });
});

describe("filter handlers", () => {
  it("narrow the rows and hand them to next", () => {
    const context = { columns };

    expect(names(searchHandler<Person>()(people, "rusu", keep, context))).toEqual(["Ștefan Rusu"]);
    expect(names(matchHandler<Person>("role", filterFns.equals)(people, "Editor", keep, context))).toEqual([
      "Dan Popescu",
    ]);
    expect(
      names(
        predicateHandler<Person>((person, min) => (person.age ?? 0) > Number(min))(
          people,
          35,
          keep,
          context,
        ),
      ),
    ).toEqual(["Bogdan Ionescu"]);
  });
});

describe("processing modes", () => {
  const client = resolveProcessingModes();

  it("defaults to the client and accepts one mode or one per step", () => {
    expect(client).toEqual({
      columnFilters: "client",
      filters: "client",
      pagination: "client",
      sorting: "client",
    });
    expect(resolveProcessingModes("server").sorting).toBe("server");
    expect(resolveProcessingModes({ sorting: "server" })).toEqual({ ...client, sorting: "server" });
  });

  it("moves every step to the server when pagination is there", () => {
    expect(resolveProcessingModes({ pagination: "server" })).toEqual(resolveProcessingModes("server"));
  });

  it("lets a filter's own mode win, except under server pagination", () => {
    const server = resolveProcessingModes("server");

    expect(resolveFilterMode({}, client)).toBe("client");
    expect(resolveFilterMode({ mode: "server" }, client)).toBe("server");
    expect(resolveFilterMode({ mode: "client" }, server)).toBe("server");
  });

  it("knows when anything runs on the server", () => {
    expect(hasServerProcessing(client, [{}])).toBe(false);
    expect(hasServerProcessing(client, [{ mode: "server" }])).toBe(true);
    expect(hasServerProcessing({ ...client, sorting: "server" }, [])).toBe(true);
  });
});
