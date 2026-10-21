import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import {
  customFilter,
  DataGrid,
  DataGridConfigProvider,
  defineColumnFilter,
  GridFilters,
  GridPagination,
  GridResetFilters,
  GridTable,
  GridToolbar,
  numberRangeFilter,
  PageWithGrid,
  searchFilter,
  selectFilter,
  textFilter,
  useDataGrid,
  type ColumnDef,
  type GridFilterDef,
  type GridLabels,
  type RowAction,
  type SortingState,
} from "../index";
import { members, roleOptions, type Member } from "./fixtures";
import { bodyRows, columnValues, find, setInputValue } from "./test-utils";

const memberColumns: ColumnDef<Member>[] = [
  { accessor: "name", filter: { variant: "text" }, header: "Name", id: "name" },
  { accessor: "team", header: "Team", id: "team" },
  { accessor: "age", align: "end", filter: { variant: "number-range" }, header: "Age", id: "age" },
];

const deleteAction = (onDelete: (person: Member) => void): RowAction<Member> => ({
  confirm: (person) => `Delete ${person.name}?`,
  id: "delete",
  label: "Delete",
  onClick: onDelete,
  tone: "danger",
});

const romanian: Partial<GridLabels> = {
  filterBy: (column) => `Filtrează după ${column}`,
  firstPage: "Prima pagină",
  lastPage: "Ultima pagină",
  nextPage: "Pagina următoare",
  openRowActions: (row) => `Acțiuni pentru ${row}`,
  pageRange: (from, to, total) => `${from}–${to} din ${total}`,
  pageStatus: (page, pageCount) => `Pagina ${page} din ${pageCount}`,
  pagination: "Paginare",
  previousPage: "Pagina anterioară",
  search: "Caută",
  searchPlaceholder: "Caută…",
};

function TranslatedGrid({ confirm, onDelete }: { confirm: () => boolean; onDelete: (person: Member) => void }) {
  return (
    <DataGridConfigProvider confirm={confirm} labels={romanian} pageSizeOptions={[5, 15]}>
      <DataGridConfigProvider labels={{ rowsPerPage: "Rânduri pe pagină" }}>
        <PageWithGrid
          columns={memberColumns}
          data={members}
          defaultPageSize={5}
          labels={{ search: "Caută un coleg" }}
          rowActions={[deleteAction(onDelete)]}
          title="Echipa"
        />
      </DataGridConfigProvider>
    </DataGridConfigProvider>
  );
}

const teamPicker = defineColumnFilter<Member, string>({
  fn: (cellValue, team) => cellValue === team,
  render: ({ close, setValue, value }) => (
    <div aria-label="Pick a team" role="group">
      {["Platform", "Sales"].map((team) => (
        <button
          aria-pressed={value === team}
          key={team}
          onClick={() => {
            setValue(team);
            close();
          }}
          type="button"
        >
          {team}
        </button>
      ))}
    </div>
  ),
});

const composedColumns: ColumnDef<Member>[] = [
  { accessor: "name", header: "Name", id: "name" },
  { accessor: "team", filter: teamPicker, header: "Team", id: "team" },
  { accessor: "age", align: "end", header: "Age", id: "age" },
  { accessor: "role", header: "Role", id: "role" },
];

const composedFilters: GridFilterDef<Member>[] = [
  searchFilter({ placeholder: "Find a teammate…" }),
  customFilter<Member, number>({
    handle: (rows, minimum, next) => next(rows.filter((person) => (person.age ?? 0) >= minimum)),
    id: "minAge",
    label: "Minimum age",
    render: ({ setValue, value }) => (
      <label className="rc-grid__toggle">
        Age ≥ {value ?? 20}
        <input
          aria-label="Minimum age"
          max={60}
          min={20}
          onChange={(event) => {
            const next = Number(event.target.value);
            setValue(next === 20 ? undefined : next);
          }}
          type="range"
          value={value ?? 20}
        />
      </label>
    ),
  }),
  textFilter({ accessor: "team", id: "teamText", label: "Team" }),
  numberRangeFilter({ accessor: "age", id: "ageRange", label: "Age" }),
  selectFilter({
    id: "role",
    label: "Role",
    options: roleOptions,
    predicate: (person, value) => person.role === value,
  }),
];

function ComposedTeam({ onOpen }: { onOpen: (person: Member) => void }) {
  const grid = useDataGrid({
    columns: composedColumns,
    data: members,
    defaultPageSize: 5,
    filters: composedFilters,
  });

  return (
    <DataGrid grid={grid} theme={{ radius: "4px" }}>
      <GridToolbar>
        <GridFilters />
        <GridResetFilters />
      </GridToolbar>
      <GridTable<Member>
        caption="Team members"
        renderRowActions={({ row, rowName }) => (
          <button aria-label={`Open ${rowName}`} onClick={() => onOpen(row)} type="button">
            Open
          </button>
        )}
      />
      <GridPagination />
    </DataGrid>
  );
}

function ControlledSorting({ onStateChange }: { onStateChange: (sorting: SortingState) => void }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <button onClick={() => setSorting([{ desc: true, id: "age" }])} type="button">
        Oldest first
      </button>
      <PageWithGrid
        columns={memberColumns}
        data={members}
        filters={[]}
        onStateChange={(state) => {
          onStateChange(state.sorting);
          setSorting(state.sorting);
        }}
        state={{ sorting }}
        title="Controlled sorting"
      />
    </div>
  );
}

function NearTheBottom({ onDelete }: { onDelete: (person: Member) => void }) {
  return (
    <div style={{ paddingTop: "100vh" }}>
      <PageWithGrid
        columns={memberColumns}
        data={members}
        rowActions={[deleteAction(onDelete)]}
        title="Near the bottom of the page"
      />
    </div>
  );
}

const meta = {
  title: "Data grid/Composition",
} satisfies Meta;

export default meta;

export const TranslatedWithProvider: StoryObj<typeof TranslatedGrid> = {
  args: { confirm: fn(() => true), onDelete: fn() },
  play: async ({ args, canvas }) => {
    const search = canvas.getByRole("searchbox", { name: "Caută un coleg" });
    await expect(search).toHaveAttribute("placeholder", "Caută…");
    await expect(canvas.getByText("1–5 din 16")).toBeVisible();
    await expect(canvas.getByText("Pagina 1 din 4")).toBeVisible();
    await expect(canvas.getByRole("navigation", { name: "Paginare" })).toBeVisible();

    const pageSize = canvas.getByRole("combobox", { name: "Rânduri pe pagină" });
    await expect([...pageSize.querySelectorAll("option")].map((option) => option.value)).toEqual(["5", "15"]);
    await userEvent.click(canvas.getByRole("button", { name: "Ultima pagină" }));
    await expect(await canvas.findByText("Pagina 4 din 4")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Prima pagină" }));

    await expect(canvas.getByRole("button", { name: "Filtrează după Name" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Acțiuni pentru Ana Pop" }));
    const menu = await canvas.findByRole("menu", { name: "Acțiuni pentru Ana Pop" });
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Delete" }));
    await waitFor(() => expect(args.onDelete).toHaveBeenCalledWith(expect.objectContaining({ name: "Ana Pop" })));
    await expect(args.confirm).toHaveBeenCalledWith("Delete Ana Pop?");
  },
  render: (args) => <TranslatedGrid {...args} />,
};

export const ComposedFromParts: StoryObj<typeof ComposedTeam> = {
  args: { onOpen: fn() },
  play: async ({ args, canvas, canvasElement }) => {
    await expect(canvas.getByRole("searchbox", { name: "Search" })).toHaveAttribute("placeholder", "Find a teammate…");

    setInputValue(canvas.getByRole("slider", { name: "Minimum age" }), "45");
    await waitFor(() => expect(columnValues(canvasElement, 0)).toEqual(["Horia Matei", "Mihai Marin", "Radu Pop"]));
    setInputValue(canvas.getByRole("slider", { name: "Minimum age" }), "20");
    await expect(await canvas.findByText("1–5 of 16")).toBeVisible();

    await userEvent.type(canvas.getByRole("textbox", { name: "Filter by Team" }), "sec");
    await waitFor(() => expect(new Set(columnValues(canvasElement, 1))).toEqual(new Set(["Security"])));
    await userEvent.clear(canvas.getByRole("textbox", { name: "Filter by Team" }));

    const ages = canvas.getByRole("group", { name: "Filter by Age" });
    await userEvent.type(within(ages).getByRole("spinbutton", { name: "Max" }), "26");
    await waitFor(() => expect(columnValues(canvasElement, 0)).toEqual(["Florin Stan", "Oana Stan"]));

    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Filter by Role" }), "Admin");
    await waitFor(() => expect(columnValues(canvasElement, 0)).toEqual(["Oana Stan"]));
    await userEvent.click(canvas.getByRole("button", { name: "Reset filters" }));
    await expect(await canvas.findByText("1–5 of 16")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Filter by Team" }));
    const dialog = await canvas.findByRole("dialog", { name: "Filter by Team" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Sales" }));
    await waitFor(() => expect(dialog).not.toBeVisible());
    await waitFor(() => expect(new Set(columnValues(canvasElement, 1))).toEqual(new Set(["Sales"])));
    await expect(canvas.getByRole("button", { name: "Filter by Team (active)" })).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Open Cristina Marin" }));
    await expect(args.onOpen).toHaveBeenCalledWith(expect.objectContaining({ name: "Cristina Marin" }));
    await expect(bodyRows(canvasElement)).toHaveLength(3);
  },
  render: (args) => <ComposedTeam {...args} />,
};

export const ControlledState: StoryObj<typeof ControlledSorting> = {
  args: { onStateChange: fn() },
  play: async ({ args, canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Oldest first" }));
    await waitFor(() => expect(find(canvasElement, "th:nth-child(3)")).toHaveAttribute("aria-sort", "descending"));
    await waitFor(() => expect(columnValues(canvasElement, 0)[0]).toBe("Mihai Marin"));

    await userEvent.click(canvas.getByRole("button", { name: "Name" }));
    await expect(args.onStateChange).toHaveBeenLastCalledWith([{ desc: false, id: "name" }]);
    await waitFor(() => expect(find(canvasElement, "th:nth-child(1)")).toHaveAttribute("aria-sort", "ascending"));
  },
  render: (args) => <ControlledSorting {...args} />,
};

export const PopoversNearTheBottom: StoryObj<typeof NearTheBottom> = {
  args: { onDelete: fn() },
  play: async ({ args, canvas, canvasElement }) => {
    const trigger = canvas.getByRole("button", { name: "Filter by Age" });
    trigger.scrollIntoView({ block: "end" });
    await userEvent.click(trigger);
    const dialog = await canvas.findByRole("dialog", { name: "Filter by Age" });

    await waitFor(() =>
      expect(dialog.getBoundingClientRect().bottom).toBeLessThanOrEqual(trigger.getBoundingClientRect().top),
    );
    await waitFor(() =>
      expect(Math.round(dialog.getBoundingClientRect().right)).toBe(
        Math.round(trigger.getBoundingClientRect().right),
      ),
    );

    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("scroll"));
    await expect(dialog).toBeVisible();
    await userEvent.click(trigger);
    await waitFor(() => expect(dialog).not.toBeVisible());

    const originalConfirm = window.confirm;
    const confirmInBrowser = fn(() => true);
    window.confirm = confirmInBrowser;

    try {
      await userEvent.click(canvas.getByRole("button", { name: "Actions for Ana Pop" }));
      const menu = await canvas.findByRole("menu", { name: "Actions for Ana Pop" });
      await userEvent.click(within(menu).getByRole("menuitem", { name: "Delete" }));
      await waitFor(() => expect(args.onDelete).toHaveBeenCalledTimes(1));
      await expect(confirmInBrowser).toHaveBeenCalledWith("Delete Ana Pop?");
    } finally {
      window.confirm = originalConfirm;
    }

    await expect(bodyRows(canvasElement).length).toBeGreaterThan(0);
  },
  render: (args) => <NearTheBottom {...args} />,
};
