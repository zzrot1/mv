import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent } from "storybook/test";

import { Checkbox } from "../ui/components/checkbox";

const meta = {
  args: { label: "Send me the monthly newsletter", onCheckedChange: fn() },
  component: Checkbox,
  title: "Inputs/Checkbox",
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Send me the monthly newsletter" });

    await userEvent.click(canvas.getByText("Send me the monthly newsletter"));

    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);
  },
};

const genres = ["Fantasy", "Science fiction", "Mystery"];

function GenrePicker() {
  const [chosen, setChosen] = useState<string[]>(["Fantasy"]);
  const all = chosen.length === genres.length;

  function toggle(genre: string, checked: boolean) {
    setChosen((current) =>
      checked ? [...current, genre] : current.filter((item) => item !== genre),
    );
  }

  return (
    <fieldset style={{ border: 0, display: "grid", gap: 10, margin: 0, padding: 0 }}>
      <legend style={{ fontWeight: 600, marginBottom: 8 }}>Genres</legend>
      <Checkbox
        checked={all}
        indeterminate={chosen.length > 0 && !all}
        label="All genres"
        onCheckedChange={(checked) => setChosen(checked ? genres : [])}
      />
      <div style={{ display: "grid", gap: 10, paddingInlineStart: 24 }}>
        {genres.map((genre) => (
          <Checkbox
            checked={chosen.includes(genre)}
            key={genre}
            label={genre}
            onCheckedChange={(checked) => toggle(genre, checked)}
          />
        ))}
      </div>
    </fieldset>
  );
}

export const SelectAll: Story = {
  render: () => <GenrePicker />,
  play: async ({ canvas }) => {
    const all = canvas.getByRole("checkbox", { name: "All genres" });

    await expect(all).toBePartiallyChecked();

    await userEvent.click(all);
    for (const genre of genres) {
      await expect(canvas.getByRole("checkbox", { name: genre })).toBeChecked();
    }

    await userEvent.click(canvas.getByRole("checkbox", { name: "Mystery" }));
    await expect(all).toBePartiallyChecked();
  },
};

export const SizesAndStates: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      <Checkbox defaultChecked label="Small" size="sm" />
      <Checkbox defaultChecked label="Medium" size="md" />
      <Checkbox defaultChecked label="Large" size="lg" />
      <Checkbox invalid label="Invalid: accept the terms" />
      <Checkbox defaultChecked disabled label="Disabled" />
    </div>
  ),
  play: async ({ canvas }) => {
    const widths = ["Small", "Medium", "Large"].map(
      (name) => canvas.getByRole("checkbox", { name }).getBoundingClientRect().width,
    );

    await expect(widths).toEqual([14, 16, 20]);
    await expect(canvas.getByRole("checkbox", { name: "Invalid: accept the terms" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(canvas.getByRole("checkbox", { name: "Disabled" })).toBeDisabled();
  },
};
