import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { PageWithGrid, type PageWithGridProps } from "../page-with-grid";
import { toggleFilter } from "../ui/filters";
import type { ColumnDef, GridFiltersOption, RowAction } from "../ui/types";
import { members, roleOptions, type Member } from "./fixtures";
import { bodyRows, columnValues, find } from "./test-utils";

const columns: ColumnDef<Member>[] = [
  { accessor: "name", filter: { variant: "text" }, header: "Name", id: "name" },
  { accessor: "email", enableSorting: false, header: "Email", id: "email", searchable: false },
  {
    accessor: "role",
    filter: { options: roleOptions, variant: "select" },
    header: "Role",
    id: "role",
  },
  { accessor: "team", header: "Team", id: "team" },
  { accessor: "age", align: "end", filter: { variant: "number-range" }, header: "Age", id: "age" },
  {
    accessor: "active",
    cell: ({ value }) => (value ? "Active" : "Away"),
    header: "Status",
    id: "active",
  },
];

const filters: GridFiltersOption<Member> = (defaults) => [
  ...defaults,
  toggleFilter({ accessor: "active", id: "active", label: "Active only" }),
];

type TeamDirectoryProps = Omit<PageWithGridProps<Member>, "columns" | "data"> & {
  onMessage: (person: Member) => void;
  onRemove: (person: Member) => Promise<void>;
};

function TeamDirectory({ onMessage, onRemove, ...props }: TeamDirectoryProps) {
  const [items, setItems] = useState(members);

  const rowActions: RowAction<Member>[] = [
    { id: "message", isDisabled: (person) => !person.active, label: "Message", onClick: onMessage },
    {
      confirm: "Remove this member from the team?",
      id: "remove",
      label: "Remove",
      onClick: async (person) => {
        await onRemove(person);
        setItems((current) => current.filter(({ id }) => id !== person.id));
      },
      tone: "danger",
    },
  ];

  return (
    <PageWithGrid
      colorScheme="dark"
      columns={columns}
      data={items}
      description="Dark theme, inline row actions and a different set of columns."
      filters={filters}
      rowActions={rowActions}
      rowActionsDisplay="inline"
      title="Team"
      {...props}
    />
  );
}

const meta = {
  args: {
    confirm: fn(() => true),
    onMessage: fn(),
    onRemove: fn(() => new Promise<void>((resolve) => setTimeout(resolve, 200))),
  },
  component: TeamDirectory,
  parameters: { backgrounds: { disable: true } },
  title: "Data grid/Dark theme · Team",
} satisfies Meta<typeof TeamDirectory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  play: async ({ canvas, canvasElement }) => {
    const page = find(canvasElement, ".rc-page");
    await expect(getComputedStyle(page).colorScheme).toBe("dark");
    await expect(getComputedStyle(page).backgroundColor).toBe("rgb(10, 10, 10)");
    await expect(getComputedStyle(page).color).toBe("rgb(250, 250, 250)");

    await expect(canvas.getByRole("heading", { level: 1, name: "Team" })).toBeVisible();
    await expect(bodyRows(canvasElement)).toHaveLength(10);
    await expect(canvas.queryByRole("button", { name: "Email" })).toBeNull();
    await expect(columnValues(canvasElement, 1)[0]).toBe("ana.pop@example.com");
    await expect(columnValues(canvasElement, 4)[2]).toBe("—");
    await expect(columnValues(canvasElement, 5).slice(0, 3)).toEqual(["Active", "Active", "Away"]);
  },
};

export const InlineActions: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Message Ana Pop" }));
    await expect(args.onMessage).toHaveBeenCalledWith(expect.objectContaining({ name: "Ana Pop" }));
    await expect(canvas.getByRole("button", { name: "Message Cristina Marin" })).toBeDisabled();

    const remove = canvas.getByRole("button", { name: "Remove Bogdan Ionescu" });
    await userEvent.click(remove);
    await expect(args.confirm).toHaveBeenCalledWith("Remove this member from the team?");
    await waitFor(() => expect(remove).toBeDisabled());
    await waitFor(() => expect(canvas.queryByText("Bogdan Ionescu")).toBeNull());
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
    await expect(canvas.getByText("1–10 of 15")).toBeVisible();
  },
};

export const SearchAndColumnFilters: Story = {
  play: async ({ canvas, canvasElement }) => {
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "stefan");
    await waitFor(() => expect(columnValues(canvasElement, 0)).toEqual(["Ștefan Rusu"]));
    await userEvent.clear(canvas.getByRole("searchbox", { name: "Search" }));

    await userEvent.click(canvas.getByRole("checkbox", { name: "Active only" }));
    await expect(await canvas.findByText("1–10 of 12")).toBeVisible();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Active only" }));

    await userEvent.click(canvas.getByRole("button", { name: "Filter by Role" }));
    const roleDialog = await canvas.findByRole("dialog", { name: "Filter by Role" });
    await userEvent.selectOptions(within(roleDialog).getByRole("combobox"), "Admin");
    await waitFor(() => expect(new Set(columnValues(canvasElement, 2))).toEqual(new Set(["Admin"])));
    await userEvent.click(canvas.getByRole("button", { name: "Filter by Role (active)" }));
    await waitFor(() => expect(roleDialog).not.toBeVisible());

    await userEvent.click(canvas.getByRole("button", { name: "Filter by Age" }));
    const ageDialog = await canvas.findByRole("dialog", { name: "Filter by Age" });
    await userEvent.type(within(ageDialog).getByRole("spinbutton", { name: "Min" }), "30");
    await waitFor(() => expect(columnValues(canvasElement, 0)).toEqual(["Ana Pop", "Elena Rusu", "Mihai Marin"]));
    await userEvent.click(canvas.getByRole("button", { name: "Filter by Age (active)" }));
    await waitFor(() => expect(ageDialog).not.toBeVisible());

    await userEvent.click(canvas.getByRole("button", { name: "Filter by Name" }));
    const nameDialog = await canvas.findByRole("dialog", { name: "Filter by Name" });
    await userEvent.type(within(nameDialog).getByRole("textbox", { name: "Filter by Name" }), "marin");
    await waitFor(() => expect(columnValues(canvasElement, 0)).toEqual(["Mihai Marin"]));
  },
};

export const FixedHeightWithStickyHeader: Story = {
  args: { defaultPageSize: 25, height: 320 },
  play: async ({ canvasElement }) => {
    const wrapper = find(canvasElement, ".rc-grid__table-wrapper");
    await expect(wrapper.getBoundingClientRect().height).toBe(320);
    await expect(bodyRows(canvasElement)).toHaveLength(16);

    wrapper.scrollTop = 200;
    const header = find(canvasElement, "th.rc-grid__header-cell");
    await waitFor(() =>
      expect(header.getBoundingClientRect().top - wrapper.getBoundingClientRect().top).toBeLessThan(2),
    );
    await expect(getComputedStyle(header).position).toBe("sticky");
  },
};
