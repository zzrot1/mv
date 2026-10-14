import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import type { ServerGridQuery } from "../application/server-query";
import { PageWithGrid } from "../page-with-grid";
import type { ColumnDef } from "../ui/types";
import { queryMembers, roleOptions, type Member } from "./fixtures";
import { bodyRows, columnValues, find } from "./test-utils";

const columns: ColumnDef<Member>[] = [
  { accessor: "name", header: "Name", id: "name" },
  { accessor: "role", filter: { options: roleOptions, variant: "select" }, header: "Role", id: "role" },
  { accessor: "team", header: "Team", id: "team" },
];

type ServerTeamProps = {
  latencyMs: number;
  onQueryChange: (query: ServerGridQuery) => void;
};

function ServerTeam({ latencyMs, onQueryChange }: ServerTeamProps) {
  const [result, setResult] = useState<ReturnType<typeof queryMembers>>();
  const [isFetching, setIsFetching] = useState(false);

  function handleQueryChange(query: ServerGridQuery) {
    onQueryChange(query);
    setIsFetching(true);
    setTimeout(() => {
      setResult(queryMembers(query));
      setIsFetching(false);
    }, latencyMs);
  }

  return (
    <PageWithGrid
      columns={columns}
      data={result?.rows}
      defaultPageSize={5}
      description="Search, filters, sorting and pagination are answered by a fake server."
      height={300}
      isFetching={isFetching}
      isLoading={!result}
      loadingOverlay={{ delayMs: 0, minDurationMs: 0 }}
      mode="server"
      onQueryChange={handleQueryChange}
      pageSizeOptions={[5, 10]}
      rowCount={result?.total}
      title="Team (server)"
    />
  );
}

const meta = {
  args: { latencyMs: 150, onQueryChange: fn() },
  component: ServerTeam,
  title: "Data grid/Server side",
} satisfies Meta<typeof ServerTeam>;

export default meta;

type Story = StoryObj<typeof meta>;

const overlay = (root: HTMLElement) => root.querySelector(".rc-grid__overlay");

export const QueriesTheServer: Story = {
  play: async ({ args, canvas, canvasElement }) => {
    await waitFor(() => expect(overlay(canvasElement)).not.toBeNull());
    await expect(find(canvasElement, "table")).toHaveAttribute("aria-busy", "true");
    await waitFor(() => expect(bodyRows(canvasElement)).toHaveLength(5));
    await waitFor(() => expect(overlay(canvasElement)).toBeNull());
    await expect(args.onQueryChange).toHaveBeenCalledTimes(1);
    await expect(args.onQueryChange).toHaveBeenLastCalledWith({
      columnFilters: {},
      filters: {},
      pagination: { pageIndex: 0, pageSize: 5 },
      sorting: [],
    });
    await expect(canvas.getByText("1–5 of 16")).toBeVisible();

    await userEvent.type(canvas.getByRole("searchbox", { name: "Search" }), "pop");
    await waitFor(() =>
      expect(args.onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ filters: { search: "pop" } }),
      ),
    );
    await expect(args.onQueryChange).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(columnValues(canvasElement, 0)).toEqual(["Ana Pop", "Dan Popescu", "Ioana Pop", "Radu Pop"]));
    await userEvent.clear(canvas.getByRole("searchbox", { name: "Search" }));
    await expect(await canvas.findByText("1–5 of 16")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Next page" }));
    await waitFor(() =>
      expect(args.onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ pagination: { pageIndex: 1, pageSize: 5 } }),
      ),
    );
    await expect(await canvas.findByText("6–10 of 16")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await waitFor(() =>
      expect(args.onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ sorting: [{ desc: false, id: "name" }] }),
      ),
    );

    await userEvent.click(canvas.getByRole("button", { name: "Filter by Role" }));
    const dialog = await canvas.findByRole("dialog", { name: "Filter by Role" });
    await userEvent.selectOptions(within(dialog).getByRole("combobox"), "Admin");
    await waitFor(() =>
      expect(args.onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          columnFilters: { role: "Admin" },
          pagination: { pageIndex: 0, pageSize: 5 },
        }),
      ),
    );
    await waitFor(() => expect(new Set(columnValues(canvasElement, 1))).toEqual(new Set(["Admin"])));
    await userEvent.click(canvas.getByRole("button", { name: "Filter by Role (active)" }));
    await waitFor(() => expect(dialog).not.toBeVisible());

    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Rows per page" }), "10");
    await waitFor(() =>
      expect(args.onQueryChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ pagination: { pageIndex: 0, pageSize: 10 } }),
      ),
    );
  },
};
