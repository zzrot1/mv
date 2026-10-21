import type { Meta, StoryObj } from "@storybook/react-vite";
import { useDeferredValue, useState } from "react";
import { expect, fn, userEvent } from "storybook/test";

import { SearchInput } from "../ui/components/search-input";

const meta = {
  args: {
    "aria-label": "Search books",
    onClear: fn(),
    onSearch: fn(),
    placeholder: "Search books…",
  },
  component: SearchInput,
  decorators: [
    (Story) => (
      <div style={{ display: "grid", gap: 12, maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
  title: "Inputs/Search input",
} satisfies Meta<typeof SearchInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas }) => {
    const box = canvas.getByRole("searchbox", { name: "Search books" });

    await expect(canvas.queryByRole("button", { name: "Clear search" })).toBeNull();
    await userEvent.type(box, "dune{enter}");
    await expect(args.onSearch).toHaveBeenCalledWith("dune");

    await userEvent.click(canvas.getByRole("button", { name: "Clear search" }));
    await expect(box).toHaveValue("");
    await expect(box).toHaveFocus();
    await expect(args.onClear).toHaveBeenCalledOnce();
  },
};

export const Filled: Story = {
  args: { defaultValue: "Tolkien", size: "lg", variant: "filled" },
  play: async ({ canvas }) => {
    const box = canvas.getByRole("searchbox", { name: "Search books" });

    await userEvent.click(box);
    await userEvent.keyboard("{Escape}");
    await expect(box).toHaveValue("");
  },
};

const books = [
  "Dune",
  "The Hobbit",
  "The Left Hand of Darkness",
  "Neuromancer",
  "Foundation",
  "Hyperion",
];

function BookFinder() {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const matches = books.filter((title) => title.toLowerCase().includes(deferred.toLowerCase()));

  return (
    <>
      <SearchInput aria-label="Filter books" onValueChange={setQuery} placeholder="Filter…" value={query} />
      <ul aria-label="Books" style={{ margin: 0, paddingInlineStart: 20 }}>
        {matches.map((title) => (
          <li key={title}>{title}</li>
        ))}
      </ul>
    </>
  );
}

export const FilteringAList: Story = {
  render: () => <BookFinder />,
  play: async ({ canvas }) => {
    const box = canvas.getByRole("searchbox", { name: "Filter books" });

    await userEvent.type(box, "the");
    await expect(await canvas.findAllByRole("listitem")).toHaveLength(2);

    await userEvent.keyboard("{Escape}");
    await expect(await canvas.findAllByRole("listitem")).toHaveLength(books.length);
  },
};
