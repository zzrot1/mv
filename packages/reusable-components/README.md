# reusable-components

Reusable React components on a headless, framework-free core.

The first component is a data grid. `PageWithGrid` is a ready-made page: a header,
a filter bar (the search bar plus your own filters), column filters, sorting,
pagination, row selection, bulk actions and row actions. The same pieces are
exported on their own, so a page can be composed differently without forking
the library.

Inspired by [TanStack Table](https://tanstack.com/table): a headless
`useDataGrid` hook does the work, and the components only render its state.

## Installation

```bash
npm install reusable-components
```

Peer dependency: `react` >= 19.2 (uses `useEffectEvent`, `useDeferredValue`,
`<style precedence>` and the `popover` attributes).

## Quick start

```tsx
"use client";

import { PageWithGrid, type ColumnDef, type RowAction } from "reusable-components";

type User = { id: string; name: string; email: string; role: string; age: number };

// Module scope (or useMemo): the grid recomputes when the array changes.
const columns: ColumnDef<User>[] = [
  { id: "name", accessor: "name", header: "Name", filter: { variant: "text" } },
  { id: "email", accessor: "email", header: "Email" },
  { id: "role", accessor: "role", header: "Role", filter: { variant: "select" } },
  { id: "age", accessor: "age", header: "Age", align: "end", filter: { variant: "number-range" } },
];

export function UsersPage({ users }: { users: User[] }) {
  const rowActions: RowAction<User>[] = [
    { id: "edit", label: "Edit", onClick: (user) => openEditor(user) },
    {
      id: "delete",
      label: "Delete",
      tone: "danger",
      separatorBefore: true,
      confirm: (user) => `Delete ${user.name}?`,
      onClick: (user) => deleteUser(user.id),
    },
  ];

  return (
    <PageWithGrid
      title="Users"
      description="Everyone with access to the store."
      columns={columns}
      data={users}
      rowActions={rowActions}
    />
  );
}
```

`PageWithGrid` is a client component (`"use client"`). Columns, cell renderers,
filters and actions are functions, so the page that defines them must be a
client component too.

---

# 1. Columns

| Field | What it does |
|---|---|
| `id` | unique key; also the key in sorting and filter state |
| `header` | what the header shows (`ReactNode`) |
| `label` | accessible name when `header` is not plain text |
| `accessor` | a key of the row (`"name"`) or a function (`(row) => row.address.city`) |
| `cell` | custom renderer: `({ row, rowId, value }) => ReactNode` |
| `filter` | column filter, see [Column filters](#column-filters) |
| `enableSorting` | default: `true` when the column has an `accessor` or a `sortingFn` |
| `sortingFn` | `(a, b) => number` on whole rows |
| `searchable` | included in the search bar; default: `true` when it has an `accessor` |
| `align`, `width`, `className` | presentation |

Without a `cell`, values are shown as text: empty values as `labels.emptyValue`
(`—`), booleans as Yes/No, dates as `YYYY-MM-DD`.

# 2. Filters

## The filter bar: a chain of responsibility

The filters above the grid form a chain. Each filter is a link: it receives the
rows, narrows them, and hands them to the next link with `next(rows)`. After the
last filter come the column filters, then sorting, then pagination.

By default the chain is only the search bar. To add filters, pass a function
that extends the defaults:

```tsx
import { customFilter, selectFilter, toggleFilter, type GridFiltersOption } from "reusable-components";

const filters: GridFiltersOption<User> = (defaults) => [
  ...defaults,                                                     // the search bar
  selectFilter({ id: "role", label: "Role", accessor: "role" }),   // options read from the data
  toggleFilter({ id: "active", label: "Active only", accessor: "active" }),
];

<PageWithGrid filters={filters} ... />
```

Pass an array instead to replace the defaults. `filters={[]}` removes the search
bar.

| Factory | Control | Matches |
|---|---|---|
| `searchFilter({ placeholder?, mode? })` | search input | every word, in any searchable column (case and diacritics ignored) |
| `textFilter({ id, label, accessor })` | text input | contains the text |
| `selectFilter({ id, label, accessor, options? })` | dropdown | equal value |
| `toggleFilter({ id, label, accessor })` | checkbox | truthy value |
| `numberRangeFilter({ id, label, accessor })` | min / max | between min and max |
| `customFilter({ id, render, handle? })` | yours | yours |

Every built-in factory also takes a `predicate: (row, value) => boolean` instead
of `accessor`.

### Your own link

`customFilter` gives you the control and the link. `handle` receives the rows,
the filter's value (typed), and `next`:

```tsx
const minAge = customFilter<User, number>({
  id: "minAge",
  label: "Minimum age",
  render: ({ value, setValue }) => (
    <AgeSlider value={value ?? 18} onChange={(age) => setValue(age === 18 ? undefined : age)} />
  ),
  handle: (rows, minAge, next) => next(rows.filter((user) => user.age >= minAge)),
});
```

- The link only runs while its value is active. `undefined`, `""`, `false` and
  empty ranges count as "off".
- A link that returns without calling `next` stops the chain there: the column
  filters and sorting won't run.
- A filter without `handle` never runs on the client. Its value only goes to the
  server.

Narrowing the rows always goes back to page 1. "Reset filters" appears
whenever something is active.

## Column filters

A funnel icon in the header opens the column's filter in a popover. The icon is
filled while the filter is active. Every column can have one, and each is
configured independently:

| `filter.variant` | Control | Matches |
|---|---|---|
| `"text"` (default) | text input | the value contains the text |
| `"select"` | dropdown | equal value (or one of the items, for array values) |
| `"number-range"` | min / max | between min and max, either side optional |

- **Options:** on the client, select options are read from the loaded rows. On
  the server, pass them yourself:
  `filter: { variant: "select", options: [{ label, value }] }`.
- **Custom logic:** `filter.fn`.
- **Custom control:** `filter.render`.

`defineColumnFilter` types the value and lets you reuse the definition across
columns:

```tsx
const minimum = defineColumnFilter<User, number>({
  fn: (cellValue, min) => Number(cellValue) >= min,
  render: ({ value, setValue, close }) => (
    <MinimumInput value={value} onChange={setValue} onDone={close} />
  ),
});

const columns: ColumnDef<User>[] = [
  { id: "age", accessor: "age", header: "Age", filter: minimum },
  { id: "orders", accessor: "orders", header: "Orders", filter: minimum },
];
```

`close()` closes the popover, for a custom "Apply" button.

# 3. Client or server

By default everything runs **on the client**, on the rows in `data`. Each step
can move to the server instead:

```ts
mode="server"                                  // everything
mode={{ filters: "server" }}                   // the filter bar
mode={{ columnFilters: "server", sorting: "server" }}
searchFilter({ mode: "server" })               // one filter only
```

The steps are `filters`, `columnFilters`, `sorting` and `pagination`. A filter's
own `mode` wins over `filters`.

- A step on the server is skipped on the client: `data` is taken as its result.
- `onQueryChange` receives what the server has to apply,
  `{ filters, columnFilters, sorting, pagination }`, each only if it runs there.
  It is called on mount and again whenever one of those steps changes.
- Typing is debounced (300 ms, `serverInputDebounceMs`) when the step runs on
  the server.
- Server pagination needs `rowCount`, the total number of rows on the server.
- **Server pagination moves every step to the server.** A single page can't be
  searched, filtered or sorted as a whole on the client.

With the generated `useGetUsers` (`GET /users?page&limit&sortBy&sortOrder&role`):

```tsx
const [query, setQuery] = useState<ServerGridQuery>({});
const { pageIndex = 0, pageSize = 10 } = query.pagination ?? {};
const sort = query.sorting?.[0];
const role = query.filters?.role;

const users = useGetUsers({
  page: pageIndex + 1,
  limit: pageSize,
  sortBy: sort?.id as UserSortField | undefined,
  sortOrder: sort ? (sort.desc ? "desc" : "asc") : undefined,
  role: role ? (role as Role) : undefined,
});

<PageWithGrid
  mode="server"
  columns={columns}
  filters={[selectFilter({ id: "role", label: "Role", options: roleOptions })]} // the endpoint has no search
  data={users.data?.data}
  rowCount={users.data?.total}
  isLoading={users.isLoading}
  isFetching={users.isFetching}
  onQueryChange={setQuery}
/>
```

Column ids double as `sortBy` values here, so name the sortable columns after
`UserSortField` (`email`, `role`, `createdAt`).

# 4. Height

The table never shrinks while you filter.

- **No `height`:** it reserves the height of a full page (`pageSize` rows). Fewer
  rows leave the rest empty, and "No results." sits in the middle of that space.
- **`height={480}` or `height="60vh"`:** a fixed height. The rows scroll inside
  and the header stays visible (sticky).

The row height used for the reservation is the `rowHeight` token (49px).

# 5. Loading overlay

While the grid is busy, an overlay with a spinner covers the table:

- `isLoading` (no data yet) or `isFetching` (server refetch);
- client filtering and sorting still being computed. The controls update right
  away and the rows follow in a background render (`useDeferredValue`).

To avoid flicker, it appears only after 150 ms of work, then stays at least
300 ms. A quick client filter on a few hundred rows finishes before that, so
there is nothing to show.

```tsx
<PageWithGrid loadingOverlay={{ delayMs: 0, minDurationMs: 400 }} />    // always show it
<PageWithGrid loadingOverlay={{ spinner: <MySpinner /> }} />             // your spinner
<PageWithGrid loadingOverlay={{ content: <Skeleton rows={10} /> }} />    // your content
<PageWithGrid loadingOverlay={false} />                                  // off ("Loading…" text instead)
```

The look comes from the `overlayBackground` and `spinnerColor` tokens and the
`overlay` and `spinner` slots. `Spinner` is exported for reuse.

# 6. Pagination

```tsx
<PageWithGrid defaultPageSize={25} pageSizeOptions={[10, 25, 50]} />
```

- One option (or none) hides the "Rows per page" selector.
- The buttons go to the first, previous, next and last page.
- `enablePagination={false}` shows every row.

# 7. Actions

### Row actions

`rowActions` render as a "⋯" button with a dropdown menu (arrow keys,
Home/End and Escape work).

| Field | What it does |
|---|---|
| `id`, `label`, `icon` | the item |
| `onClick(row)` | returning a promise disables the inline button while it runs |
| `tone: "danger"` | destructive styling |
| `confirm` | a message, or `(row) => message`, to confirm before running |
| `isHidden(row)`, `isDisabled(row)` | per-row visibility and state |
| `separatorBefore` | a line above the item in the menu |

`rowActionsDisplay="inline"` shows a button per action instead of the menu.

For a completely custom element (your own shadcn `DropdownMenu`, a link):

```tsx
<PageWithGrid
  renderRowActions={({ row, rowName }) => <UserMenu user={row} label={`Actions for ${rowName}`} />}
/>
```

### Bulk actions

`bulkActions` turn on row selection. A bar shows up while rows are selected:

```ts
const bulkActions: BulkAction<User>[] = [
  {
    id: "delete",
    label: "Delete selected",
    tone: "danger",
    confirm: (rows) => `Delete ${rows.length} users?`,
    onClick: async (rows, { clearSelection }) => {
      await deleteUsers(rows.map((row) => row.id));
      clearSelection();
    },
  },
];
```

`confirm` defaults to `window.confirm`. Pass your own to use a dialog component:
`confirm={(message) => openConfirmDialog(message)}` (it may return a promise).

# 8. Styling

The grid ships with a minimal, shadcn-like style. It is injected once into
`<head>` with no setup. Every color, size and shadow comes from a token, so
nothing is hardcoded.

### Tokens

| `theme` key | CSS variable | Default (light / dark) |
|---|---|---|
| `background` | `--rc-background` | `#ffffff` / `#0a0a0a` |
| `foreground` | `--rc-foreground` | `#0a0a0a` / `#fafafa` |
| `muted` | `--rc-muted` | `#f5f5f5` / `#262626` |
| `mutedForeground` | `--rc-muted-foreground` | `#737373` / `#a3a3a3` |
| `border` | `--rc-border` | `#e5e5e5` / white 10% |
| `input` | `--rc-input` | `#e5e5e5` / white 15% |
| `ring` | `--rc-ring` | `#a3a3a3` / `#737373` |
| `primary`, `primaryForeground` | `--rc-primary`, `--rc-primary-foreground` | `#171717` / `#e5e5e5` |
| `accent` | `--rc-accent` | `#f5f5f5` / `#262626` (hover) |
| `destructive`, `destructiveForeground` | `--rc-destructive`, `--rc-destructive-foreground` | `#dc2626` / `#f87171` |
| `popover`, `popoverForeground` | `--rc-popover`, `--rc-popover-foreground` | `#ffffff` / `#171717` |
| `headerBackground`, `headerForeground` | `--rc-header-background`, `--rc-header-foreground` | transparent, foreground |
| `rowHoverBackground`, `rowSelectedBackground` | `--rc-row-hover-background`, `--rc-row-selected-background` | muted 50%, muted |
| `overlayBackground`, `spinnerColor` | `--rc-overlay-background`, `--rc-spinner-color` | background 65%, foreground |
| `shadow` | `--rc-shadow` | shadcn `shadow-md` |
| `radius` | `--rc-radius` | `8px` |
| `fontFamily`, `fontSize` | `--rc-font-family`, `--rc-font-size` | system sans, `0.875rem` |
| `controlHeight`, `cellPadding`, `rowHeight` | `--rc-control-height`, `--rc-cell-padding`, `--rc-row-height` | `36px`, `8px 12px`, `49px` |

For one grid: `<PageWithGrid theme={{ primary: "#2563eb", headerBackground: "#f8fafc" }} />`.

For the whole app, set them in CSS. An app that already uses shadcn/ui maps its
tokens once:

```css
:root {
  --rc-background: var(--background);
  --rc-foreground: var(--foreground);
  --rc-muted: var(--muted);
  --rc-muted-foreground: var(--muted-foreground);
  --rc-border: var(--border);
  --rc-input: var(--input);
  --rc-ring: var(--ring);
  --rc-primary: var(--primary);
  --rc-primary-foreground: var(--primary-foreground);
  --rc-accent: var(--accent);
  --rc-destructive: var(--destructive);
  --rc-popover: var(--popover);
  --rc-radius: var(--radius);
}
```

### Light and dark

Colors are defined with `light-dark()`, so the grid follows the `color-scheme`
around it:

- `color-scheme: dark` on a parent makes it dark;
- a `.dark` class or `data-theme="dark"` on a parent works too, which is the
  next-themes convention;
- `colorScheme="light" | "dark" | "system"` forces one. The grid then paints its
  own background.

### Parts: classes and inline styles

`classNames` and `styles` target the same parts:

```tsx
<PageWithGrid
  classNames={{ table: "text-xs", row: "hover:bg-sky-50", headerCell: "uppercase" }}
  styles={{ tableWrapper: { borderWidth: 2 }, pagination: { justifyContent: "end" } }}
/>
```

The parts are `page`, `pageHeader`, `pageTitle`, `pageDescription`,
`pageActions`, `root`, `toolbar`, `search`, `control`, `button`, `checkbox`,
`bulkActions`, `tableFrame`, `tableWrapper`, `table`, `headerCell`,
`filterTrigger`, `filterPopover`, `menu`, `menuItem`, `row`, `cell`, `state`,
`overlay`, `spinner` and `pagination`.

Every built-in rule has the specificity of a single element
(`button:where(.rc-button)`), so any class you add wins without `!important`.
The elements also keep stable `rc-*` class names for plain CSS. `unstyled`
drops the built-in stylesheet.

# 9. Texts and translations

Every text the grid shows or announces is in `labels`. Nothing is composed
inside the grid: texts with values (`pageRange`, `filterAll`, `selectRow`…) are
functions, so the word order is yours.

Set them once for the app with `DataGridConfigProvider`. Props on a grid still
win. With Lingui:

```tsx
"use client";

import { useLingui } from "@lingui/react/macro";
import { DataGridConfigProvider } from "reusable-components";

export function GridTranslations({ children }: { children: React.ReactNode }) {
  const { t } = useLingui();

  return (
    <DataGridConfigProvider
      labels={{
        search: t`Search`,
        searchPlaceholder: t`Search…`,
        noResults: t`No results.`,
        rowsPerPage: t`Rows per page`,
        firstPage: t`First page`,
        lastPage: t`Last page`,
        pageRange: (from, to, total) => t`${from}–${to} of ${total}`,
        pageStatus: (page, count) => t`Page ${page} of ${count}`,
        filterAll: (filter) => t`${filter}: All`,
        selectRow: (row) => t`Select ${row}`,
        // …
      }}
    >
      {children}
    </DataGridConfigProvider>
  );
}
```

Because `t` comes from `useLingui()`, the provider re-renders on a locale
change and every grid follows. The full list is in `defaultGridLabels`.

The provider also takes `confirm`, `loadingOverlay` and `pageSizeOptions` as
app-wide defaults.

# 10. Composing your own page

`PageWithGrid` is only a composition. The same parts are exported:

```tsx
const grid = useDataGrid({ data, columns, filters, mode: "client" });

<DataGrid grid={grid} theme={{ radius: "0px" }}>
  <GridToolbar>
    <GridFilters />
    <GridResetFilters />
  </GridToolbar>
  <GridBulkActions actions={bulkActions} />
  <GridTable rowActions={rowActions} height={480} />
  <GridPagination />
</DataGrid>
```

`useDataGrid` returns the grid split by concern:

- `grid.filters`: `toolbar` and `column`;
- `grid.sorting`, `grid.pagination` and `grid.selection`;
- the visible `grid.rows` and `grid.isProcessing`.

Any part can be replaced with your own component that reads them.

State can be uncontrolled (`initialState`) or controlled per slice (`state` +
`onStateChange`), as in TanStack Table.

# Architecture

The grid is built in layers. Dependencies only point inward:

```
src/data-grid/
  domain/          pure rules, no React: search, filters and their chain links,
                   sorting, pagination, processing modes, row selection
  application/     the chain runner, the client pipeline, state (reducer),
                   the server query, ports (ConfirmPort, GridQueryListener)
  ui/              React: useDataGrid, the config provider, context, filter
                   factories, components, styles
  page-with-grid.tsx   the ready-made composition
```

| Layer | May import from |
|---|---|
| `domain` | nothing outside itself |
| `application` | `domain` |
| `ui` | `application`, `domain`, `react` |

The rules in `domain` and `application` can be tested and reused without React,
and run on the server too.

# Development

Stories live next to the code, in `src/**/stories/*.stories.tsx`. They aren't
part of the published package.

| Command (from the repo root) | What it does |
|---|---|
| `npm run storybook` | Storybook at http://localhost:6006 |
| `npm run test:components` | runs every story as a test in headless Chromium |
| `npm run test:components:coverage` | the same, plus coverage in `packages/reusable-components/coverage/` |

The same scripts exist inside the package as `storybook`, `test`,
`test:coverage`, `test:watch`, `build-storybook` and `typecheck`.

Every story is a test:

- it renders in a real browser;
- it runs its `play` function, which clicks, types and asserts;
- it fails on any accessibility violation (axe, `a11y: { test: "error" }`).

Coverage is measured on `src/` (stories excluded), with an 80% threshold for
statements, branches, functions and lines.

The first run needs the test browser: `npx playwright install chromium`.

## License

MIT
