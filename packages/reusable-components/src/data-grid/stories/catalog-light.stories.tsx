import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { PageWithGrid, type PageWithGridProps } from "../page-with-grid";
import { selectFilter, toggleFilter } from "../ui/filters";
import type { BulkAction, ColumnDef, GridFiltersOption, RowAction } from "../ui/types";
import { books, type Book } from "./fixtures";
import { bodyRows, columnValues, find } from "./test-utils";

const columns: ColumnDef<Book>[] = [
  { accessor: "title", filter: { variant: "text" }, header: "Title", id: "title" },
  { accessor: "author", header: "Author", id: "author" },
  { accessor: "genre", filter: { variant: "select" }, header: "Genre", id: "genre" },
  {
    accessor: "price",
    align: "end",
    cell: ({ value }) => `${Number(value).toFixed(2)} lei`,
    filter: { variant: "number-range" },
    header: "Price",
    id: "price",
  },
  { accessor: "stock", align: "end", header: "Stock", id: "stock" },
  { accessor: "bestseller", align: "center", header: "Bestseller", id: "bestseller" },
  { accessor: "publishedAt", header: "Published", id: "publishedAt" },
];

// The search bar comes from `defaults`; the two filters after it are more links.
const filters: GridFiltersOption<Book> = (defaults) => [
  ...defaults,
  selectFilter({ accessor: "genre", id: "genre", label: "Genre" }),
  toggleFilter({ id: "inStock", label: "In stock", predicate: (item) => item.stock > 0 }),
];

type BookCatalogProps = Omit<PageWithGridProps<Book>, "columns" | "data"> & {
  onEdit: (item: Book) => void;
  onDelete: (item: Book) => void;
  onDeleteMany: (items: Book[]) => void;
};

function BookCatalog({ onDelete, onDeleteMany, onEdit, ...props }: BookCatalogProps) {
  const [items, setItems] = useState(books);
  const remove = (ids: ReadonlySet<string>) =>
    setItems((current) => current.filter((item) => !ids.has(item.id)));

  const rowActions: RowAction<Book>[] = [
    { id: "edit", label: "Edit", onClick: onEdit },
    { id: "restock", isHidden: (item) => item.stock > 0, label: "Restock", onClick: onEdit },
    {
      confirm: (item) => `Delete “${item.title}”?`,
      id: "delete",
      isDisabled: (item) => item.bestseller,
      label: "Delete",
      onClick: (item) => {
        onDelete(item);
        remove(new Set([item.id]));
      },
      separatorBefore: true,
      tone: "danger",
    },
  ];

  const bulkActions: BulkAction<Book>[] = [
    {
      confirm: (rows) => `Delete ${rows.length} books?`,
      id: "delete",
      label: "Delete selected",
      onClick: (rows, { clearSelection }) => {
        onDeleteMany(rows);
        remove(new Set(rows.map((item) => item.id)));
        clearSelection();
      },
      tone: "danger",
    },
  ];

  return (
    <PageWithGrid
      bulkActions={bulkActions}
      columns={columns}
      data={items}
      description="Every step runs on the client, on the loaded books."
      filters={filters}
      rowActions={rowActions}
      title="Book catalog"
      {...props}
    />
  );
}

const meta = {
  args: {
    colorScheme: "light",
    confirm: fn(() => true),
    onDelete: fn(),
    onDeleteMany: fn(),
    onEdit: fn(),
  },
  component: BookCatalog,
  title: "Data grid/Light theme · Book catalog",
} satisfies Meta<typeof BookCatalog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("heading", { level: 1, name: "Book catalog" })).toBeVisible();
    await expect(bodyRows(canvasElement)).toHaveLength(10);
    await expect(canvas.getByText("1–10 of 23")).toBeVisible();
    await expect(canvas.getByText("Page 1 of 3")).toBeVisible();

    const page = find(canvasElement, ".rc-page");
    await expect(getComputedStyle(page).colorScheme).toBe("light");
    await expect(getComputedStyle(page).backgroundColor).toBe("rgb(255, 255, 255)");

    await expect(columnValues(canvasElement, 3)[0]).toBe("39.90 lei");
    await expect(columnValues(canvasElement, 5).slice(0, 2)).toEqual(["Yes", "No"]);
    await expect(columnValues(canvasElement, 6)[0]).toBe("1892-01-01");
  },
};

export const SearchAndToolbarFilters: Story = {
  play: async ({ canvas, canvasElement }) => {
    const search = canvas.getByRole("searchbox", { name: "Search" });

    await userEvent.type(search, "creanga");
    await waitFor(() => expect(columnValues(canvasElement, 0)).toEqual(["Amintiri din copilărie"]));

    await userEvent.clear(search);
    await waitFor(() => expect(bodyRows(canvasElement)).toHaveLength(10));

    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Filter by Genre" }), "Fiction");
    await expect(await canvas.findByText("1–10 of 10")).toBeVisible();

    await userEvent.click(canvas.getByRole("checkbox", { name: "In stock" }));
    await expect(await canvas.findByText("1–7 of 7")).toBeVisible();
    await expect(columnValues(canvasElement, 4).every((stock) => Number(stock) > 0)).toBe(true);

    await userEvent.click(canvas.getByRole("button", { name: "Reset filters" }));
    await expect(await canvas.findByText("1–10 of 23")).toBeVisible();
    await expect(search).toHaveValue("");
    await expect(canvas.queryByRole("button", { name: "Reset filters" })).toBeNull();
  },
};

export const ColumnFiltersAndSorting: Story = {
  args: { enableMultiSort: true },
  play: async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Filter by Genre" }));
    const genreDialog = await canvas.findByRole("dialog", { name: "Filter by Genre" });
    await userEvent.selectOptions(within(genreDialog).getByRole("combobox"), "Science");
    await waitFor(() => expect(new Set(columnValues(canvasElement, 2))).toEqual(new Set(["Science"])));
    await expect(canvas.getByRole("button", { name: "Filter by Genre (active)" })).toBeVisible();

    await userEvent.click(within(genreDialog).getByRole("button", { name: "Clear" }));
    await expect(await canvas.findByText("1–10 of 23")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Filter by Genre" }));
    await waitFor(() => expect(genreDialog).not.toBeVisible());

    await userEvent.click(canvas.getByRole("button", { name: "Filter by Price" }));
    const priceDialog = await canvas.findByRole("dialog", { name: "Filter by Price" });
    await userEvent.type(within(priceDialog).getByRole("spinbutton", { name: "Min" }), "50");
    await userEvent.type(within(priceDialog).getByRole("spinbutton", { name: "Max" }), "100");
    await expect(await canvas.findByText("1–7 of 7")).toBeVisible();
    await expect(columnValues(canvasElement, 3).every((price) => {
      const value = Number.parseFloat(price);
      return value >= 50 && value <= 100;
    })).toBe(true);
    await userEvent.click(canvas.getByRole("button", { name: "Filter by Price (active)" }));
    await waitFor(() => expect(priceDialog).not.toBeVisible());

    const priceHeader = find(canvasElement, "th:nth-child(5)");
    await userEvent.click(canvas.getByRole("button", { name: "Price" }));
    await waitFor(() => expect(priceHeader).toHaveAttribute("aria-sort", "ascending"));
    const ascending = columnValues(canvasElement, 3).map(Number.parseFloat);
    await expect(ascending).toEqual([...ascending].sort((a, b) => a - b));

    await userEvent.click(canvas.getByRole("button", { name: "Price" }));
    await waitFor(() => expect(priceHeader).toHaveAttribute("aria-sort", "descending"));

    // One user-event session, so Shift stays held for the click.
    const user = userEvent.setup();
    await user.click(canvas.getByRole("button", { name: "Genre" }));
    await user.keyboard("{Shift>}");
    await user.click(canvas.getByRole("button", { name: "Price" }));
    await user.keyboard("{/Shift}");
    await waitFor(() => expect(priceHeader).toHaveAttribute("aria-sort", "ascending"));
    await expect(find(canvasElement, "th:nth-child(4)")).toHaveAttribute("aria-sort", "ascending");

    await userEvent.click(canvas.getByRole("button", { name: "Price" }));
    await userEvent.click(canvas.getByRole("button", { name: "Price" }));
    await waitFor(() => expect(priceHeader).toHaveAttribute("aria-sort", "none"));
  },
};

export const Pagination: Story = {
  play: async ({ canvas, canvasElement }) => {
    const wrapper = find(canvasElement, ".rc-grid__table-wrapper");
    const fullPageHeight = wrapper.getBoundingClientRect().height;

    await userEvent.click(canvas.getByRole("button", { name: "Next page" }));
    await expect(await canvas.findByText("Page 2 of 3")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Last page" }));
    await expect(await canvas.findByText("21–23 of 23")).toBeVisible();
    await expect(bodyRows(canvasElement)).toHaveLength(3);
    await expect(canvas.getByRole("button", { name: "Last page" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Next page" })).toBeDisabled();
    await expect(wrapper.getBoundingClientRect().height).toBe(fullPageHeight);

    await userEvent.click(canvas.getByRole("button", { name: "Previous page" }));
    await expect(await canvas.findByText("Page 2 of 3")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "First page" }));
    await expect(await canvas.findByText("Page 1 of 3")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "First page" })).toBeDisabled();

    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Rows per page" }), "25");
    await expect(await canvas.findByText("Page 1 of 1")).toBeVisible();
    await expect(bodyRows(canvasElement)).toHaveLength(23);
  },
};

export const RowActionsMenu: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Actions for Baltagul" }));
    const menu = await canvas.findByRole("menu", { name: "Actions for Baltagul" });
    const items = within(menu).getAllByRole("menuitem");
    await expect(items.map((item) => item.textContent)).toEqual(["Edit", "Restock", "Delete"]);

    await waitFor(() => expect(items[0]).toHaveFocus());
    await userEvent.keyboard("{ArrowDown}");
    await expect(items[1]).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(items[2]).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(items[0]).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(items[2]).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(items[0]).toHaveFocus();

    await userEvent.click(items[0]);
    await expect(args.onEdit).toHaveBeenCalledWith(expect.objectContaining({ title: "Baltagul" }));
    await waitFor(() => expect(menu).not.toBeVisible());

    await userEvent.click(canvas.getByRole("button", { name: "Actions for Amintiri din copilărie" }));
    const bestseller = await canvas.findByRole("menu", { name: "Actions for Amintiri din copilărie" });
    await expect(within(bestseller).getByRole("menuitem", { name: "Delete" })).toBeDisabled();
    await expect(within(bestseller).queryByRole("menuitem", { name: "Restock" })).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Actions for Amintiri din copilărie" }));
    await waitFor(() => expect(bestseller).not.toBeVisible());

    await userEvent.click(canvas.getByRole("button", { name: "Actions for Baltagul" }));
    const again = await canvas.findByRole("menu", { name: "Actions for Baltagul" });
    await userEvent.click(within(again).getByRole("menuitem", { name: "Delete" }));
    await waitFor(() => expect(args.onDelete).toHaveBeenCalledTimes(1));
    await expect(args.confirm).toHaveBeenCalledWith("Delete “Baltagul”?");
    await expect(await canvas.findByText("1–10 of 22")).toBeVisible();
    await expect(canvas.queryByText("Baltagul")).toBeNull();
  },
};

export const DeleteCancelled: Story = {
  args: { confirm: fn(() => false) },
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Actions for Baltagul" }));
    const menu = await canvas.findByRole("menu", { name: "Actions for Baltagul" });
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Delete" }));

    await waitFor(() => expect(args.confirm).toHaveBeenCalledWith("Delete “Baltagul”?"));
    await expect(args.onDelete).not.toHaveBeenCalled();
    await expect(canvas.getByText("Baltagul")).toBeVisible();
    await expect(canvas.getByText("1–10 of 23")).toBeVisible();
  },
};

export const BulkActions: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select Baltagul" }));
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select Cosmos" }));
    await expect(canvas.getByText("2 selected")).toBeVisible();

    const selectPage = canvas.getByRole("checkbox", { name: "Select all rows on this page" });
    await expect(selectPage).toBePartiallyChecked();
    await userEvent.click(selectPage);
    await expect(canvas.getByText("10 selected")).toBeVisible();
    await expect(selectPage).toBeChecked();
    await userEvent.click(selectPage);
    await expect(canvas.queryByRole("group", { name: "Bulk actions" })).toBeNull();

    await userEvent.click(canvas.getByRole("checkbox", { name: "Select Baltagul" }));
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select Cosmos" }));
    await userEvent.click(canvas.getByRole("button", { name: "Delete selected" }));
    await waitFor(() =>
      expect(args.onDeleteMany).toHaveBeenCalledWith([
        expect.objectContaining({ title: "Baltagul" }),
        expect.objectContaining({ title: "Cosmos" }),
      ]),
    );
    await expect(args.confirm).toHaveBeenCalledWith("Delete 2 books?");
    await expect(await canvas.findByText("1–10 of 21")).toBeVisible();
    await expect(canvas.queryByText("2 selected")).toBeNull();

    await userEvent.click(canvas.getByRole("checkbox", { name: "Select Ion" }));
    await expect(canvas.getByText("1 selected")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Clear selection" }));
    await expect(canvas.queryByText("1 selected")).toBeNull();
  },
};
