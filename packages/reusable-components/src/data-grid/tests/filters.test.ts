import { describe, expect, it, vi } from "vitest";

import type { RowsHandler } from "../domain/types";
import {
  customFilter,
  defineColumnFilter,
  numberRangeFilter,
  searchFilter,
  selectFilter,
  textFilter,
  toggleFilter,
} from "../ui/filters";
import type { FilterRenderContext, GridFilterDef } from "../ui/types";

type Book = { title: string; genre: string; stock: number; price: number };

const books: Book[] = [
  { genre: "Fiction", price: 39, stock: 12, title: "Baltagul" },
  { genre: "Science", price: 64, stock: 0, title: "Cosmos" },
  { genre: "Poetry", price: 25, stock: 30, title: "Luceafărul" },
];

const keep: RowsHandler<Book> = (rows) => rows;

function run(filter: GridFilterDef<Book>, value: unknown) {
  return filter.handle!(books, value, keep, { columns: [{ accessor: "title", id: "title" }] }).map(
    (book) => book.title,
  );
}

function context<TValue>(value: TValue): FilterRenderContext {
  return { close: vi.fn(), id: "x", label: "X", setValue: vi.fn(), value };
}

describe("filter factories", () => {
  it("searchFilter is the search bar, with id 'search' unless given one", () => {
    const search = searchFilter<Book>();

    expect(search).toMatchObject({ id: "search", variant: "search" });
    expect(run(search, "cosmos")).toEqual(["Cosmos"]);
    expect(searchFilter<Book>({ id: "q", mode: "server", placeholder: "Find…" })).toMatchObject({
      id: "q",
      mode: "server",
      placeholder: "Find…",
    });
  });

  it("text, select, toggle and number-range filters match through their accessor", () => {
    expect(run(textFilter<Book>({ accessor: "title", id: "title", label: "Title" }), "cos")).toEqual([
      "Cosmos",
    ]);
    expect(run(selectFilter<Book>({ accessor: "genre", id: "genre", label: "Genre" }), "Poetry")).toEqual([
      "Luceafărul",
    ]);
    expect(run(toggleFilter<Book>({ accessor: "stock", id: "stock", label: "In stock" }), true)).toEqual([
      "Baltagul",
      "Luceafărul",
    ]);
    expect(run(numberRangeFilter<Book>({ accessor: "price", id: "price", label: "Price" }), [30, 70])).toEqual([
      "Baltagul",
      "Cosmos",
    ]);
  });

  it("a predicate replaces the accessor", () => {
    const cheap = toggleFilter<Book>({ id: "cheap", label: "Cheap", predicate: (book) => book.price < 30 });

    expect(run(cheap, true)).toEqual(["Luceafărul"]);
  });

  it("without an accessor or predicate the filter only goes to the server", () => {
    const filter = selectFilter<Book>({ id: "genre", label: "Genre", options: [{ label: "A", value: "a" }] });

    expect(filter.handle).toBeUndefined();
    expect(filter).toMatchObject({ options: [{ label: "A", value: "a" }], variant: "select" });
  });

  it("customFilter passes the typed value to handle and the context to render", () => {
    const render = vi.fn(() => null);
    const minStock = customFilter<Book, number>({
      handle: (rows, min, next) => next(rows.filter((book) => book.stock >= min)),
      id: "minStock",
      render,
    });
    const renderContext = context(10);

    expect(run(minStock, 10)).toEqual(["Baltagul", "Luceafărul"]);
    minStock.render?.(renderContext);
    expect(render).toHaveBeenCalledWith(renderContext);
    expect(customFilter<Book>({ id: "ui-only", render }).handle).toBeUndefined();
  });

  it("defineColumnFilter wraps fn and render, and keeps the rest", () => {
    const fn = vi.fn((cellValue: unknown, min: number) => Number(cellValue) >= min);
    const render = vi.fn(() => null);
    const minimum = defineColumnFilter<Book, number>({ fn, placeholder: "Min", render, variant: "number-range" });

    expect(minimum.fn?.(40, 30, books[0])).toBe(true);
    expect(fn).toHaveBeenCalledWith(40, 30, books[0]);
    minimum.render?.(context(5));
    expect(render).toHaveBeenCalled();
    expect(minimum).toMatchObject({ placeholder: "Min", variant: "number-range" });
    expect(defineColumnFilter<Book>({ variant: "text" })).toMatchObject({ fn: undefined, render: undefined });
  });
});
