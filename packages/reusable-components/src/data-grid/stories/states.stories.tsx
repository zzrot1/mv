import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { PageWithGrid, type PageWithGridProps } from "../page-with-grid";
import type { ColumnDef } from "../ui/types";
import { members, type Member } from "./fixtures";
import { bodyRows, columnValues, find } from "./test-utils";

const columns: ColumnDef<Member>[] = [
  { accessor: "name", header: "Name", id: "name" },
  { accessor: "team", header: "Team", id: "team" },
  { accessor: "age", align: "end", header: "Age", id: "age" },
];

function MemberGrid(props: Partial<PageWithGridProps<Member>>) {
  return <PageWithGrid columns={columns} data={members} title="Members" {...props} />;
}

const meta = {
  component: MemberGrid,
  title: "Data grid/States and styling",
} satisfies Meta<typeof MemberGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { data: [], isLoading: true, loadingOverlay: { delayMs: 0 } },
  play: async ({ canvas, canvasElement }) => {
    const status = await canvas.findByRole("status");
    await expect(status).toHaveClass("rc-grid__overlay");
    await expect(status).toHaveTextContent("Loading…");
    // The overlay fades in, so wait until it is actually showing.
    await waitFor(() => expect(find(status, ".rc-spinner")).toBeVisible());
    await expect(find(canvasElement, "table")).toHaveAttribute("aria-busy", "true");
    await expect(bodyRows(canvasElement)).toHaveLength(0);
  },
};

export const LoadingWithoutOverlay: Story = {
  args: { data: [], isLoading: true, loadingOverlay: false },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent("Loading…");
    await expect(canvasElement.querySelector(".rc-grid__overlay")).toBeNull();
  },
};

export const CustomOverlay: Story = {
  args: {
    isFetching: true,
    loadingOverlay: {
      delayMs: 0,
      spinner: <span data-testid="brand-spinner">Fetching members…</span>,
    },
  },
  play: async ({ canvas, canvasElement }) => {
    const spinner = await canvas.findByTestId("brand-spinner");
    await waitFor(() => expect(spinner).toBeVisible());
    await expect(bodyRows(canvasElement)).toHaveLength(10);
  },
};

export const OverlayContent: Story = {
  args: {
    isFetching: true,
    loadingOverlay: { content: <strong>Syncing with the server</strong>, delayMs: 0 },
  },
  play: async ({ canvas }) => {
    const content = await canvas.findByText("Syncing with the server");
    await waitFor(() => expect(content).toBeVisible());
  },
};

export const ErrorState: Story = {
  args: { error: "The members could not be loaded." },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole("alert")).toHaveTextContent("The members could not be loaded.");
    await expect(bodyRows(canvasElement)).toHaveLength(0);
  },
};

export const Empty: Story = {
  args: { data: [], emptyState: "No members yet. Invite someone to get started." },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("No members yet. Invite someone to get started.")).toBeVisible();
    await expect(canvas.getByText("0–0 of 0")).toBeVisible();

    const wrapper = find(canvasElement, ".rc-grid__table-wrapper");
    await expect(wrapper.getBoundingClientRect().height).toBeGreaterThan(400);
  },
};

export const NoResults: Story = {
  args: { initialState: { filters: { search: "nobody" } } },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("No results.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Reset filters" })).toBeVisible();
  },
};

export const RowsWithoutId: Story = {
  args: {
    columns: [
      { accessor: "city", header: "City", id: "city" },
      { accessor: "population", align: "end", header: "Population", id: "population" },
    ] as unknown as ColumnDef<Member>[],
    data: [
      { city: "Iași", population: 271692 },
      { city: "Cluj", population: 286598 },
    ] as unknown as Member[],
    enablePagination: false,
    filters: [],
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(columnValues(canvasElement, 0)).toEqual(["Iași", "Cluj"]);
    await expect(canvas.queryByRole("searchbox")).toBeNull();
    await expect(canvas.queryByRole("navigation", { name: "Pagination" })).toBeNull();
  },
};

export const StylingHooks: Story = {
  args: {
    className: "brand-page",
    classNames: { row: "brand-row", table: "brand-table" },
    style: { padding: 24 },
    styles: { headerCell: { textTransform: "uppercase" }, tableWrapper: { borderWidth: 2 } },
    theme: {
      headerBackground: "rgb(240, 249, 255)",
      primary: "rgb(37, 99, 235)",
      radius: "0px",
      rowHoverBackground: "rgb(255, 247, 237)",
    },
  },
  play: async ({ canvasElement }) => {
    const page = find(canvasElement, ".rc-page");
    await expect(page).toHaveClass("brand-page");
    await expect(page.style.getPropertyValue("--rc-primary")).toBe("rgb(37, 99, 235)");
    await expect(page.style.padding).toBe("24px");

    await expect(find(canvasElement, "table")).toHaveClass("rc-grid__table", "brand-table");
    await expect(bodyRows(canvasElement)[0]).toHaveClass("brand-row");

    const header = find(canvasElement, "th.rc-grid__header-cell");
    await expect(getComputedStyle(header).textTransform).toBe("uppercase");
    await expect(getComputedStyle(header).backgroundColor).toBe("rgb(240, 249, 255)");

    const wrapper = find(canvasElement, ".rc-grid__table-wrapper");
    await expect(getComputedStyle(wrapper).borderTopWidth).toBe("2px");
    await expect(getComputedStyle(wrapper).borderTopLeftRadius).toBe("0px");
  },
};

export const Unstyled: Story = {
  args: { unstyled: true },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(bodyRows(canvasElement)).toHaveLength(10));
    await expect(find(canvasElement, ".rc-page")).toHaveClass("rc-root");
  },
};
