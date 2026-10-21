import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { Select, type SelectOption, type SelectOptionGroup } from "../ui/components/select";

const genres: SelectOption[] = [
  { label: "Fantasy", value: "fantasy" },
  { label: "Science fiction", value: "sci-fi" },
  { label: "Mystery", value: "mystery" },
  { disabled: true, label: "Poetry (coming soon)", value: "poetry" },
];

const formats: SelectOptionGroup[] = [
  {
    label: "Print",
    options: [
      { label: "Hardcover", value: "hardcover" },
      { label: "Paperback", value: "paperback" },
    ],
  },
  {
    label: "Digital",
    options: [
      { label: "E-book", value: "ebook" },
      { label: "Audiobook", value: "audio" },
    ],
  },
];

const meta = {
  args: { "aria-label": "Genre", onValueChange: fn(), options: genres, placeholder: "Pick a genre" },
  component: Select,
  decorators: [
    (Story) => (
      <div style={{ display: "grid", gap: 12, maxWidth: 280 }}>
        <Story />
      </div>
    ),
  ],
  title: "Inputs/Select",
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas }) => {
    const select = canvas.getByRole("combobox", { name: "Genre" });

    await expect(select).toHaveValue("");
    await expect(canvas.getByRole("option", { name: "Poetry (coming soon)" })).toBeDisabled();

    await userEvent.selectOptions(select, "sci-fi");
    await expect(select).toHaveValue("sci-fi");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("sci-fi");
  },
};

export const GroupedOptions: Story = {
  args: { "aria-label": "Format", defaultValue: "ebook", options: formats, placeholder: undefined },
  play: async ({ canvas, canvasElement }) => {
    const select = canvas.getByRole("combobox", { name: "Format" });

    await expect(select).toHaveValue("ebook");
    await expect(canvasElement.querySelectorAll("optgroup")).toHaveLength(2);
    await userEvent.selectOptions(select, "Audiobook");
    await expect(select).toHaveValue("audio");
  },
};

export const WithPrefix: Story = {
  args: {
    "aria-label": "Sort by",
    defaultValue: "newest",
    options: [
      { label: "Newest", value: "newest" },
      { label: "Price, low to high", value: "price-asc" },
      { label: "Price, high to low", value: "price-desc" },
    ],
    placeholder: undefined,
    prefix: "Sort:",
    variant: "ghost",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Sort:")).toHaveClass("rc-input__prefix");
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Sort by" }), "price-desc");
    await expect(canvas.getByRole("combobox", { name: "Sort by" })).toHaveValue("price-desc");
  },
};

export const InvalidAndRequired: Story = {
  args: { invalid: true, required: true, size: "lg" },
  play: async ({ canvas }) => {
    const select = canvas.getByRole("combobox", { name: "Genre" });

    await expect(select).toBeRequired();
    await expect(select).toBeInvalid();
    await expect(select.closest(".rc-frame")).toHaveAttribute("data-invalid", "true");
  },
};
