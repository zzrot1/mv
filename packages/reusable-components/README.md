<h1 align="center">reusable-components</h1>

<p align="center">
  Accessible, themeable React 19 components for data-heavy apps:<br />
  a full-featured data grid and a complete set of form inputs, on a headless core.
</p>

<p align="center">
  <a href="https://github.com/zzrot1/mv/blob/main/packages/reusable-components/package.json"><img alt="license: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
  <a href="https://react.dev"><img alt="React 19.2+" src="https://img.shields.io/badge/react-%E2%89%A5%2019.2-61dafb?logo=react&logoColor=white" /></a>
  <a href="https://www.typescriptlang.org"><img alt="Written in TypeScript" src="https://img.shields.io/badge/types-TypeScript-3178c6?logo=typescript&logoColor=white" /></a>
  <img alt="Zero runtime dependencies" src="https://img.shields.io/badge/dependencies-0-brightgreen.svg" />
  <a href="https://vitest.dev/guide/browser/"><img alt="Tested in a real browser with Vitest" src="https://img.shields.io/badge/tested%20with-Vitest%20%2B%20Playwright-6e9f18?logo=vitest&logoColor=white" /></a>
  <a href="https://github.com/dequelabs/axe-core"><img alt="Every story checked with axe" src="https://img.shields.io/badge/a11y-axe%20checked-663399.svg" /></a>
</p>

<p align="center">
  <a href="#installation">Installation</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#data-grid">Data grid</a> ·
  <a href="#inputs">Inputs</a> ·
  <a href="#side-panel">Side panel</a> ·
  <a href="#theming">Theming</a> ·
  <a href="#translations">Translations</a> ·
  <a href="#contributing">Contributing</a>
</p>

## Highlights

- **Accessible by default.** Native elements, full keyboard support, and an
  automated axe check on every Storybook story.
- **Your look, not ours.** A minimal shadcn-like style out of the box, built on
  tokens with light and dark modes. Any single class wins over it (Tailwind
  included), every part takes its own class and style, and `unstyled` removes
  it entirely.
- **Client or server data.** The grid searches, filters, sorts and paginates in
  the browser, or hands any of those steps to your API.
- **Translatable.** Every visible or announced text comes from `labels`, ready
  for Lingui, i18next or plain strings.
- **Works like the platform.** Inputs pass every native prop and the `ref` to
  the native element, so they fit plain forms and form libraries alike.
- **TypeScript-first, zero runtime dependencies.** React is the only peer.

## Installation

```bash
npm install reusable-components
```

```bash
pnpm add reusable-components
```

```bash
yarn add reusable-components
```

| Requirement | Version |
|---|---|
| `react`, `react-dom` | 19.2 or later |
| Browsers | Chrome and Edge 123+, Firefox 125+, Safari 17.5+ (`light-dark()`, the Popover API, `:has()`) |

The package ships its TypeScript source. Vite compiles it out of the box. With
Next.js, add it to `transpilePackages`:

```ts
// next.config.ts
const nextConfig: NextConfig = {
  transpilePackages: ["reusable-components"],
};
```

There are no styles to import by hand: each component imports its own CSS file,
and your bundler adds it to the page (Next.js and Vite do this out of the box).
In Jest, map `\.css$` to an empty module.

## Quick start

### A data grid

```tsx
"use client";

import { PageWithGrid, type ColumnDef, type RowAction } from "reusable-components";

type User = { id: string; name: string; email: string; role: string; age: number };

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

Define `columns` at module scope or in `useMemo`: the grid recomputes when the
array changes.

### A form

```tsx
"use client";

import { useState } from "react";
import {
  Field,
  NumberInput,
  Select,
  TextInput,
  composeValidators,
  email,
  required,
} from "reusable-components";

const checkEmail = composeValidators(
  required("Enter your email."),
  email("That doesn't look like an email."),
);

export function OrderForm() {
  const [address, setAddress] = useState("");
  const [copies, setCopies] = useState<number | null>(1);
  const [format, setFormat] = useState("");

  return (
    <form>
      <Field label="Email" error={address ? checkEmail(address) : undefined} required>
        <TextInput type="email" value={address} onValueChange={setAddress} />
      </Field>
      <Field label="Copies">
        <NumberInput min={1} max={20} value={copies} onValueChange={setCopies} />
      </Field>
      <Field label="Format">
        <Select
          placeholder="Pick one"
          value={format}
          onValueChange={setFormat}
          options={[
            { label: "Hardcover", value: "hardcover" },
            { label: "E-book", value: "ebook" },
          ]}
        />
      </Field>
    </form>
  );
}
```

Every component is a client component (`"use client"`). In the Next.js App
Router, the page that passes functions to it (columns, cell renderers, actions,
handlers) must be a client component too.

## Components

| Component | What it is |
|---|---|
| [`PageWithGrid`](#data-grid) | A ready-made page: header, filter bar, data grid, pagination, row and bulk actions |
| [`DataGrid` and its parts](#composing-your-own-page) | The same pieces, to compose your own layout around `useDataGrid` |
| [`TextInput`](#inputs) | Single-line input with optional content before and after the text |
| [`NumberInput`](#inputs) | Number field with stepper, keyboard stepping, bounds and precision |
| [`Textarea`](#inputs) | Multi-line input that can grow with its content and count characters |
| [`PasswordInput`](#inputs) | Password field with a show/hide button |
| [`SearchInput`](#inputs) | Search box with a clear button, Escape to clear and Enter to search |
| [`Select`](#inputs) | The native select, with options, groups and a placeholder |
| [`Checkbox`](#inputs) | Checkbox with a label and an indeterminate state |
| [`Switch`](#inputs) | On/off toggle, announced as a switch |
| [`Field`](#field) | Label, description and error for any control |
| [`SidePanel`](#side-panel) | App navigation: logo slot, links, sections and an account menu; collapses to icons |

## Data grid

`PageWithGrid` is a page with a header, a filter bar (the search bar plus your
own filters), column filters, sorting, pagination, row selection, bulk actions
and row actions. Inspired by [TanStack Table](https://tanstack.com/table): a
headless `useDataGrid` hook does the work, and the components only render its
state.

### Columns

| Field | What it does |
|---|---|
| `id` | Unique key; also the key in sorting and filter state |
| `header` | What the header shows (`ReactNode`) |
| `label` | Accessible name when `header` isn't plain text |
| `accessor` | A key of the row (`"name"`) or a function (`(row) => row.address.city`) |
| `cell` | Custom renderer: `({ row, rowId, value }) => ReactNode` |
| `filter` | Column filter, see [Column filters](#column-filters) |
| `enableSorting` | Default: `true` when the column has an `accessor` or a `sortingFn` |
| `sortingFn` | `(a, b) => number` on whole rows |
| `searchable` | Included in the search bar; default: `true` when it has an `accessor` |
| `align`, `width`, `className` | Presentation |

Without a `cell`, values show as text: empty values as `labels.emptyValue`
(`—`), booleans as Yes/No, dates as `YYYY-MM-DD`.

### Filters

#### The filter bar is a chain of responsibility

The filters above the grid form a chain. Each filter is a link: it receives the
rows, narrows them, and hands them to the next link with `next(rows)`. After the
last filter come the column filters, then sorting, then pagination.

By default the chain is only the search bar. To add filters, pass a function
that extends the defaults:

```tsx
import { selectFilter, toggleFilter, type GridFiltersOption } from "reusable-components";

const filters: GridFiltersOption<User> = (defaults) => [
  ...defaults, // the search bar
  selectFilter({ id: "role", label: "Role", accessor: "role" }), // options read from the data
  toggleFilter({ id: "active", label: "Active only", accessor: "active" }),
];

<PageWithGrid filters={filters} />;
```

Pass an array instead to replace the defaults; `filters={[]}` removes the
search bar.

| Factory | Control | Matches |
|---|---|---|
| `searchFilter({ placeholder?, mode? })` | Search input | Every word, in any searchable column (case and diacritics ignored) |
| `textFilter({ id, label, accessor })` | Text input | Contains the text |
| `selectFilter({ id, label, accessor, options? })` | Dropdown | Equal value |
| `toggleFilter({ id, label, accessor })` | Checkbox | Truthy value |
| `numberRangeFilter({ id, label, accessor })` | Min / max | Between min and max |
| `customFilter({ id, render, handle? })` | Yours | Yours |

Every built-in factory also takes a `predicate: (row, value) => boolean` instead
of `accessor`.

#### Your own link

`customFilter` gives you the control and the link. `handle` receives the rows,
the filter's value (typed) and `next`:

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

- A link runs only while its value is active. `undefined`, `""`, `false` and
  empty ranges count as off.
- A link that returns without calling `next` stops the chain: the column
  filters and sorting won't run.
- A filter without `handle` never runs on the client; its value only goes to
  the server.

Narrowing the rows always goes back to the first page. "Reset filters" appears
whenever a filter is active.

#### Column filters

A funnel icon in the header opens the column's filter in a popover; the icon is
filled while the filter is active. Each column is configured independently:

| `filter.variant` | Control | Matches |
|---|---|---|
| `"text"` (default) | Text input | The value contains the text |
| `"select"` | Dropdown | Equal value (or one of the items, for array values) |
| `"number-range"` | Min / max | Between min and max, either side optional |

- **Options.** On the client, select options are read from the loaded rows. On
  the server, pass them: `filter: { variant: "select", options: [{ label, value }] }`.
- **Custom logic.** `filter.fn`.
- **Custom control.** `filter.render`.

`defineColumnFilter` types the value and lets you reuse a definition:

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

### Client or server

By default everything runs on the client, on the rows in `data`. Each step can
move to the server:

```tsx
<PageWithGrid mode="server" />                                    // every step
<PageWithGrid mode={{ filters: "server" }} />                     // the filter bar
<PageWithGrid mode={{ columnFilters: "server", sorting: "server" }} />
searchFilter({ mode: "server" })                                  // one filter only
```

The steps are `filters`, `columnFilters`, `sorting` and `pagination`. A
filter's own `mode` wins over `filters`.

- A step on the server is skipped on the client: `data` is taken as its result.
- `onQueryChange` receives what the server has to apply:
  `{ filters, columnFilters, sorting, pagination }`, each only when it runs
  there. It's called on mount and whenever one of those steps changes.
- Typing is debounced (300 ms, `serverInputDebounceMs`) when its step runs on
  the server.
- Server pagination needs `rowCount`, the total number of rows on the server,
  and rows with an `id` (or `getRowId`), so a selection stays on its rows
  across pages. A page past the last one moves back to the last page.
- Server pagination moves every step to the server: a single page can't be
  searched, filtered or sorted as a whole on the client.

With a generated query hook (`GET /users?page&limit&sortBy&sortOrder&role`):

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
  filters={[selectFilter({ id: "role", label: "Role", options: roleOptions })]}
  data={users.data?.data}
  rowCount={users.data?.total}
  isLoading={users.isLoading}
  isFetching={users.isFetching}
  onQueryChange={setQuery}
/>;
```

Column ids double as `sortBy` values here, so name the sortable columns after
the API's sort fields.

### Height

The table never shrinks while you filter.

- **No `height`:** it reserves the height of a full page (`pageSize` rows).
  Fewer rows leave the rest empty, and "No results." sits in the middle.
- **`height={480}` or `height="60vh"`:** a fixed height. Rows scroll inside and
  the header stays visible.

The reserved row height is the `rowHeight` token (49px).

### Loading overlay

While the grid is busy, an overlay with a spinner covers the table:

- `isLoading` (no data yet) or `isFetching` (a server refetch);
- client filtering and sorting still being computed. The controls update right
  away and the rows follow in a background render (`useDeferredValue`).

To avoid flicker, it appears only after 150 ms of work, then stays at least
300 ms.

```tsx
<PageWithGrid loadingOverlay={{ delayMs: 0, minDurationMs: 400 }} /> // always show it
<PageWithGrid loadingOverlay={{ spinner: <MySpinner /> }} />          // your spinner
<PageWithGrid loadingOverlay={{ content: <Skeleton rows={10} /> }} /> // your content
<PageWithGrid loadingOverlay={false} />                               // "Loading…" text instead
```

`Spinner` is exported for reuse.

### Pagination

```tsx
<PageWithGrid defaultPageSize={25} pageSizeOptions={[10, 25, 50]} />
```

- One option (or none) hides the "Rows per page" selector.
- The buttons go to the first, previous, next and last page.
- `enablePagination={false}` shows every row.

### Actions

#### Row actions

`rowActions` render as a "⋯" button with a dropdown menu.

| Field | What it does |
|---|---|
| `id`, `label`, `icon` | The item |
| `onClick(row)` | Returning a promise disables the inline button while it runs |
| `tone: "danger"` | Destructive styling |
| `confirm` | A message, or `(row) => message`, to confirm before running |
| `isHidden(row)`, `isDisabled(row)` | Per-row visibility and state |
| `separatorBefore` | A line above the item in the menu |

`rowActionsDisplay="inline"` shows one button per action instead of the menu.
For a completely custom element (your own dropdown, a link):

```tsx
<PageWithGrid
  renderRowActions={({ row, rowName }) => <UserMenu user={row} label={`Actions for ${rowName}`} />}
/>
```

#### Bulk actions

`bulkActions` turn on row selection. A bar shows up while rows are selected:

```tsx
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

`confirm` defaults to `window.confirm`. Pass your own to use a dialog:
`confirm={(message) => openConfirmDialog(message)}` (it may return a promise).

### Grid parts

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

### Composing your own page

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
</DataGrid>;
```

`useDataGrid` returns the grid split by concern: `grid.filters` (`toolbar` and
`column`), `grid.sorting`, `grid.pagination`, `grid.selection`, the visible
`grid.rows` and `grid.isProcessing`. Any part can be replaced with your own
component that reads them.

State can be uncontrolled (`initialState`) or controlled per slice (`state` +
`onStateChange`), as in TanStack Table.

## Inputs

| Component | Value | What it adds |
|---|---|---|
| `TextInput` | `string` | `prefix` and `suffix` inside the box: an icon, a unit, a button |
| `NumberInput` | `number \| null` | `min`, `max`, `step`, `largeStep`, `precision`; accepts `,` or `.`; clamps and rounds on blur; `hideStepper` |
| `Textarea` | `string` | `autoResize` up to `maxRows`; `showCount` ("12 / 200" with `maxLength`) |
| `PasswordInput` | `string` | A show/hide button; `visible`, `defaultVisible`, `onVisibleChange` |
| `SearchInput` | `string` | Magnifier and clear button; `onSearch`, `onClear`, `icon`, `clearable` |
| `Select` | `string` | `options` (groups too) or `<option>` children; `placeholder` |
| `Checkbox` | `boolean` | `label`, `indeterminate` |
| `Switch` | `boolean` | `label`; a native checkbox with `role="switch"` |

Every input behaves like the element it wraps:

- controlled with `value` + `onValueChange` (`checked` + `onCheckedChange` for
  `Checkbox` and `Switch`), or uncontrolled with `defaultValue`;
- every native prop and the `ref` reach the native element, so inputs work in
  a plain `<form>` and with form libraries (react-hook-form's `register`, …);
- the native `onChange` still fires.

### Field

`Field` gives the control inside it its id, `aria-describedby` (description and
error), `aria-invalid`, `disabled`, `required` and `size`. Any `error` other
than `null`, `undefined` or `false` marks the field invalid and is announced.
To choose the id, pass it to `Field`: it wins over the control's own `id`, so
the label always points at the control.

```tsx
<Field label="Email" description="Only for your receipts." error={errors.email} required>
  <TextInput type="email" />
</Field>
```

Your own control joins a `Field` with `useFieldControl`:

```tsx
function ColorInput() {
  return <input type="color" {...useFieldControl({}, false)} />;
}

<Field label="Favourite color" description="Used for your avatar.">
  <ColorInput />
</Field>;
```

### Validation

The validators are plain functions, usable without React: `required`,
`minLength`, `maxLength`, `pattern`, `email`, `range` and `composeValidators`.
Each takes its message as an argument, so the message can come from your
translations. Only `required` rejects an empty value.

```tsx
const checkEmail = composeValidators(
  required(t`Enter your email.`),
  email(t`That doesn't look like an email.`),
);

<Field label="Email" error={submitted ? checkEmail(email) : undefined}>
  …
</Field>;
```

### Input props and parts

| Prop | Effect |
|---|---|
| `className`, `style` | The outer element: the visible box (the label for `Checkbox` and `Switch`) |
| `classNames`, `styles` | Each part, by slot name (below) |
| `theme` | `--rc-*` tokens for this input |
| `size` | `"sm"`, `"md"` (default), `"lg"` |
| `variant` | `"outline"` (default), `"filled"`, `"ghost"` |
| `colorScheme` | `"light"`, `"dark"`, `"system"` |
| `invalid` | The error look, without a `Field` |
| `unstyled` | No built-in classes, so none of the built-in CSS applies |

| Component | Slots |
|---|---|
| `TextInput` | `root`, `input`, `prefix`, `suffix` |
| `NumberInput` | The `TextInput` slots, `stepper`, `increment`, `decrement` |
| `PasswordInput` | The `TextInput` slots, `toggle` |
| `SearchInput` | The `TextInput` slots, `icon`, `clear` |
| `Textarea` | `root`, `textarea`, `count` |
| `Select` | `root`, `select`, `prefix`, `icon` |
| `Checkbox`, `Switch` | `root`, `input`, `label` |
| `Field` | `root`, `label`, `description`, `error`, `required` |

For your own CSS, the outer element carries `data-size`, `data-variant`,
`data-invalid` and `data-disabled`.

### Building your own input

The pieces the built-in inputs use are exported:

- `useInputAppearance`: size, variant, state, theme and slots, resolved like the
  built-in inputs, plus the props left over for the native element;
- `useFieldControl`: joins a `Field`;
- `useControllableState`: controlled or uncontrolled, with one code path;
- `useNumberInput`: the number field's behaviour without any markup;
- `parseNumber`, `stepNumber`, `normalizeNumber` and `formatNumber`: the rules
  behind it.

```tsx
import type { ComponentProps } from "react";
import { useFieldControl, useInputAppearance, type InputAppearance } from "reusable-components";

type ColorInputProps = Omit<ComponentProps<"input">, "className" | "size" | "style"> & InputAppearance<"input">;

function ColorInput(props: ColorInputProps) {
  const [look, native] = useInputAppearance<"input", ColorInputProps>(props, "rc-frame rc-input");
  const control = useFieldControl(native, look.invalid);

  return (
    <div {...look.root}>
      <input {...control} {...look.slot("input", "rc-input__control")} type="color" />
    </div>
  );
}
```

## Side panel

App navigation for a dashboard: a logo slot, links, groups of links at the
bottom and an account menu. It collapses to icons with tooltips.

```tsx
import Link from "next/link";
import { SidePanel } from "reusable-components";

<SidePanel
  linkAs={Link}
  header={<Logo />}
  items={[
    { label: "Home", href: "/", icon: <HomeIcon />, active: pathname === "/" },
    { label: "Contracts", href: "/contracts", icon: <PenIcon />, badge: "Beta" },
  ]}
  sections={[{ label: "Help", items: [{ label: "Support", icon: <HelpIcon />, onClick: openChat }] }]}
  account={{
    name: company.name,
    description: "Professional plan",
    header: <>Signed in as {email}</>,
    menu: [
      [{ label: "Profile & settings", href: "/settings" }, { label: "Billing", href: "/billing" }],
      [{ label: "Log out", onClick: logOut }],
    ],
  }}
/>;
```

| Prop | What it does |
|---|---|
| `items`, `sections` | The links, and the titled groups above the account. An item with `href` is a link (absolute URLs open in a new tab); without one it is a button. |
| `account` | The account button at the bottom and its menu. Each `menu` group is separated by a line. Without `avatar`, the name's initials show. |
| `header`, `children` | The logo slot, and content shown above the sections while expanded. |
| `collapsed`, `defaultCollapsed`, `onCollapsedChange`, `collapsible` | Collapsing to icons, controlled or not. |
| `onClose` | Adds a close button and runs after every navigation, for a mobile drawer. |
| `linkAs` | The component for internal links, such as Next.js `Link`. |
| `labels` | The texts of the collapse button, the close button and the navigation landmark. |

The width comes from `--rc-side-panel-width` (280px) and
`--rc-side-panel-collapsed-width` (80px), and the colors from the shared tokens
(the active item uses `--rc-primary`). Every part has a stable
`rc-side-panel__*` class.

## Theming

Every component ships with a minimal, shadcn-like style in a plain CSS file.
Every color, size and shadow comes from a token.

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
| `accent` | `--rc-accent` | `#f5f5f5` / `#262626` |
| `destructive`, `destructiveForeground` | `--rc-destructive`, `--rc-destructive-foreground` | `#dc2626` / `#f87171` |
| `popover`, `popoverForeground` | `--rc-popover`, `--rc-popover-foreground` | `#ffffff` / `#171717` |
| `headerBackground`, `headerForeground` | `--rc-header-background`, `--rc-header-foreground` | Transparent, foreground |
| `rowHoverBackground`, `rowSelectedBackground` | `--rc-row-hover-background`, `--rc-row-selected-background` | Muted 50%, muted |
| `overlayBackground`, `spinnerColor` | `--rc-overlay-background`, `--rc-spinner-color` | Background 65%, foreground |
| `shadow` | `--rc-shadow` | shadcn `shadow-md` |
| `radius` | `--rc-radius` | `8px` |
| `fontFamily`, `fontSize` | `--rc-font-family`, `--rc-font-size` | System sans, `0.875rem` |
| `controlHeight`, `cellPadding`, `rowHeight` | `--rc-control-height`, `--rc-cell-padding`, `--rc-row-height` | `36px`, `8px 12px`, `49px` |

The input sizes also read `--rc-control-height-sm` (`32px`) and
`--rc-control-height-lg` (`40px`).

For one component, pass `theme` (typed as `Theme`; values that could break out of
a CSS declaration, such as `;` or `url(`, are dropped):
`<PageWithGrid theme={{ primary: "#2563eb", headerBackground: "#f8fafc" }} />`.
For a whole area or app, set the variables in CSS on any ancestor. An app that
already uses shadcn/ui maps its tokens once:

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

Colors use `light-dark()`, so components follow the `color-scheme` around them:

- `color-scheme: dark` on a parent makes them dark;
- a `.dark` class or `data-theme="dark"` on a parent works too (the next-themes
  convention);
- `colorScheme="light" | "dark" | "system"` forces one per component.

### Your classes win

Every built-in rule has the specificity of a single element
(`button:where(.rc-button)`), so any class you add wins without `!important`,
whatever order the CSS loads in:

```tsx
<TextInput className="rounded-full border-sky-600" classNames={{ input: "tracking-wide" }} />
```

Elements also keep stable `rc-*` class names for plain CSS. `unstyled` drops
every built-in class, so the built-in CSS has nothing to match and only your
classes apply.

### Content Security Policy

The built-in styles are plain CSS files, so your bundler serves them as
stylesheets and no inline `<style>` is needed. The `theme` prop writes inline
`style` attributes; under a `style-src` policy without `'unsafe-inline'`, set the
`--rc-*` variables in your own stylesheet instead.

## Translations

Every text a component shows or announces lives in `labels`. Texts with values
(`pageRange`, `selectRow`, `characterCount`, …) are functions, so the word
order is yours. Set them once for the app with a provider; a prop on a
component still wins, and nested providers merge.

With Lingui:

```tsx
"use client";

import { useLingui } from "@lingui/react/macro";
import { DataGridConfigProvider, InputsConfigProvider } from "reusable-components";

export function ComponentTranslations({ children }: { children: React.ReactNode }) {
  const { t } = useLingui();

  return (
    <DataGridConfigProvider
      labels={{
        search: t`Search`,
        noResults: t`No results.`,
        rowsPerPage: t`Rows per page`,
        pageRange: (from, to, total) => t`${from}–${to} of ${total}`,
        selectRow: (row) => t`Select ${row}`,
        // …the full list is in defaultGridLabels
      }}
    >
      <InputsConfigProvider
        labels={{
          characterCount: (count, max) => t`${count} of ${max}`,
          clearSearch: t`Clear search`,
          decrement: t`Decrease`,
          hidePassword: t`Hide password`,
          increment: t`Increase`,
          showPassword: t`Show password`,
        }}
      >
        {children}
      </InputsConfigProvider>
    </DataGridConfigProvider>
  );
}
```

Because `t` comes from `useLingui()`, the providers re-render on a locale change
and every component follows.

Both providers take app-wide defaults too: `DataGridConfigProvider` takes
`confirm`, `loadingOverlay` and `pageSizeOptions`; `InputsConfigProvider` takes
`size` and `variant`.

## Accessibility

Components use native elements wherever one exists, and every Storybook story
runs an automated [axe](https://github.com/dequelabs/axe-core) check (contrast
included, in light and dark) as part of the test suite.

| Component | Keyboard |
|---|---|
| Grid headers | Enter or Space sorts; Shift + click adds a column to the sort |
| Row actions menu | Arrow keys, Home and End move; Escape closes |
| `NumberInput` | ↑ / ↓ step; Shift + ↑ / ↓ and Page Up / Page Down take a large step; Enter commits |
| `SearchInput` | Escape clears; Enter calls `onSearch` |
| `Checkbox`, `Switch` | Space toggles |

## TypeScript

Every component exports its props and parts as `<Name>Props` and `<Name>Slot`.
The grid is generic over your row type: `ColumnDef<TRow>`, `RowAction<TRow>`,
`BulkAction<TRow>`, `GridFiltersOption<TRow>`; `ServerGridQuery` describes what
`onQueryChange` sends. `Theme` and `ColorScheme` type the shared styling props.

## Architecture

Each area (`data-grid`, `inputs`) is built in layers, and dependencies only
point inward:

| Layer | Contents | May import from |
|---|---|---|
| `domain` | Pure rules: search, filters, sorting, pagination, number parsing, validators | Nothing outside itself |
| `application` | The filter chain, the client pipeline, state, the server query | `domain` |
| `ui` | React: hooks, providers, components, styles | `application`, `domain`, `react` |

The rules in `domain` and `application` run without React, on the server too.

## Contributing

```bash
npm install
npx playwright install chromium   # once, for the browser tests
npm run storybook                 # http://localhost:6006
npm test                          # unit tests and every story, in headless Chromium
npm run test:coverage             # the same, with an 80% coverage threshold
```

Every change ships with its tests: unit tests in the area's `tests/` folder
and Storybook stories with `play` functions that pass the axe check. The full
checklist is in [AGENTS.md](https://github.com/zzrot1/mv/blob/main/packages/reusable-components/AGENTS.md).

## License

[MIT](https://opensource.org/licenses/MIT)
