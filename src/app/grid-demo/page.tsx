"use client";

import { useState } from "react";
import {
  customFilter,
  PageWithGrid,
  selectFilter,
  toggleFilter,
  type BulkAction,
  type ColumnDef,
  type GridFiltersOption,
  type RowAction,
  type ServerGridQuery,
} from "reusable-components";

type Person = {
  id: number;
  name: string;
  city: string;
  age: number | null;
  role: "admin" | "editor" | "viewer";
  active: boolean;
};

const cities = ["Iași", "Cluj", "București", "Timișoara", "Brașov"];
const roles = ["admin", "editor", "viewer"] as const;
const firstNames = ["Ana", "Bogdan", "Cristina", "Dan", "Elena", "Florin", "Gabriela", "Horia", "Ioana", "Mihai", "Ștefan"];
const lastNames = ["Pop", "Ionescu", "Marin", "Popescu", "Rusu", "Stan", "Dumitru", "Matei"];

const allPeople: Person[] = Array.from({ length: 57 }, (_, index) => ({
  active: index % 4 !== 0,
  age: index % 9 === 0 ? null : 20 + ((index * 13) % 40),
  city: cities[(index * 3) % cities.length],
  id: index + 1,
  name: `${firstNames[index % firstNames.length]} ${lastNames[(index * 7) % lastNames.length]}`,
  role: roles[index % roles.length],
}));

const columns: ColumnDef<Person>[] = [
  { accessor: "name", filter: { variant: "text" }, header: "Name", id: "name" },
  { accessor: "city", filter: { variant: "select" }, header: "City", id: "city" },
  { accessor: "age", align: "end", filter: { variant: "number-range" }, header: "Age", id: "age" },
  {
    accessor: "role",
    cell: ({ value }) => <span style={{ textTransform: "capitalize" }}>{String(value)}</span>,
    header: "Role",
    id: "role",
  },
];

// The search bar comes from `defaults`; every filter after it is one more link.
const filters: GridFiltersOption<Person> = (defaults) => [
  ...defaults,
  selectFilter({ accessor: "role", id: "role", label: "Role" }),
  toggleFilter({ accessor: "active", id: "active", label: "Active only" }),
  customFilter<Person, number>({
    handle: (rows, minAge, next) => next(rows.filter((person) => (person.age ?? 0) >= minAge)),
    id: "minAge",
    label: "Minimum age",
    render: ({ setValue, value }) => (
      <label className="rc-toggle">
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
];

const serverColumns: ColumnDef<Person>[] = [
  columns[0],
  {
    ...columns[1],
    filter: { options: cities.map((city) => ({ label: city, value: city })), variant: "select" },
  },
  { accessor: "age", align: "end", header: "Age", id: "age" },
  columns[3],
];

export default function GridDemoPage() {
  const [people, setPeople] = useState(allPeople);
  const [scheme, setScheme] = useState<"light" | "dark">("light");

  const rowActions: RowAction<Person>[] = [
    {
      icon: <PencilIcon />,
      id: "edit",
      label: "Edit",
      onClick: (person) => {
        const name = window.prompt("Name", person.name);

        if (name) {
          setPeople((current) => current.map((item) => (item.id === person.id ? { ...item, name } : item)));
        }
      },
    },
    {
      icon: <CopyIcon />,
      id: "duplicate",
      label: "Duplicate",
      onClick: (person) =>
        setPeople((current) => [...current, { ...person, id: Math.max(...current.map(({ id }) => id)) + 1 }]),
    },
    {
      confirm: (person) => `Delete ${person.name}?`,
      icon: <TrashIcon />,
      id: "delete",
      label: "Delete",
      onClick: (person) => setPeople((current) => current.filter(({ id }) => id !== person.id)),
      separatorBefore: true,
      tone: "danger",
    },
  ];

  const bulkActions: BulkAction<Person>[] = [
    {
      confirm: (rows) => `Delete ${rows.length} people?`,
      id: "delete",
      label: "Delete selected",
      onClick: (rows, { clearSelection }) => {
        const ids = new Set(rows.map(({ id }) => id));
        setPeople((current) => current.filter(({ id }) => !ids.has(id)));
        clearSelection();
      },
      tone: "danger",
    },
  ];

  return (
    <main
      style={{
        background: scheme === "dark" ? "#0a0a0a" : "#ffffff",
        colorScheme: scheme,
        display: "grid",
        gap: 72,
        minHeight: "100vh",
        padding: "40px var(--gutter)",
      }}
    >
      <button
        className="rc-button"
        onClick={() => setScheme(scheme === "dark" ? "light" : "dark")}
        style={{ justifySelf: "end" }}
        type="button"
      >
        {scheme === "dark" ? "Light" : "Dark"} mode
      </button>
      <PageWithGrid
        bulkActions={bulkActions}
        columns={columns}
        data={people}
        defaultPageSize={10}
        filters={filters}
        pageSizeOptions={[5, 10, 20]}
        description="Everything runs on the client, on the loaded rows."
        headerActions={
          <button className="rc-button" data-variant="primary" type="button">
            Add person
          </button>
        }
        rowActions={rowActions}
        title="People (client)"
      />
      <ServerDemo />
    </main>
  );
}

function ServerDemo() {
  const [result, setResult] = useState<{ rows: Person[]; total: number }>();
  const [isFetching, setIsFetching] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  function handleQueryChange(query: ServerGridQuery) {
    setLog((current) => [JSON.stringify(query), ...current].slice(0, 6));
    setIsFetching(true);
    setTimeout(() => {
      setResult(fakeServer(query));
      setIsFetching(false);
    }, 250);
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PageWithGrid
        columns={serverColumns}
        data={result?.rows}
        description="Search, filters, sorting and pagination are sent to a fake server."
        height={420}
        isFetching={isFetching}
        isLoading={!result}
        mode="server"
        onQueryChange={handleQueryChange}
        rowCount={result?.total}
        theme={{ radius: "4px" }}
        title="People (server)"
      />
      <pre data-testid="query-log" style={{ fontSize: 12, whiteSpace: "pre-wrap" }}>
        {log.join("\n")}
      </pre>
    </div>
  );
}

function MenuIcon({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
      <path d={d} />
    </svg>
  );
}

const PencilIcon = () => <MenuIcon d="M4 20h4L19 9l-4-4L4 16v4z" />;
const CopyIcon = () => <MenuIcon d="M8 8h12v12H8zM4 16V4h12" />;
const TrashIcon = () => <MenuIcon d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />;

function fakeServer(query: ServerGridQuery) {
  const normalize = (text: string) =>
    text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const search = normalize(String(query.filters?.search ?? ""));
  const city = query.columnFilters?.city;
  const sort = query.sorting?.[0];
  const { pageIndex = 0, pageSize = 10 } = query.pagination ?? {};

  const rows = allPeople
    .filter((person) => !search || normalize(`${person.name} ${person.city}`).includes(search))
    .filter((person) => !city || person.city === city)
    .sort((a, b) => {
      if (!sort) return 0;
      const left = a[sort.id as keyof Person] ?? "";
      const right = b[sort.id as keyof Person] ?? "";
      return (left < right ? -1 : left > right ? 1 : 0) * (sort.desc ? -1 : 1);
    });

  return { rows: rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize), total: rows.length };
}
