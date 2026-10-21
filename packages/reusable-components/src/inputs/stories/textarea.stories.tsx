import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { Textarea } from "../ui/components/textarea";

const meta = {
  args: { "aria-label": "Review", onValueChange: fn(), placeholder: "What did you think of the book?" },
  component: Textarea,
  decorators: [
    (Story) => (
      <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
  title: "Inputs/Textarea",
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { rows: 4 },
  play: async ({ args, canvas }) => {
    const textarea = canvas.getByRole("textbox", { name: "Review" });

    await userEvent.type(textarea, "Loved it.{enter}Would read again.");

    await expect(textarea).toHaveValue("Loved it.\nWould read again.");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("Loved it.\nWould read again.");
  },
};

export const CharacterCount: Story = {
  args: { "aria-label": "Short bio", maxLength: 80, placeholder: "A line about you", showCount: true },
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole("textbox", { name: "Short bio" });

    await expect(canvas.getByText("0 / 80")).toBeVisible();
    await userEvent.type(textarea, "Reader, writer.");
    await expect(canvas.getByText("15 / 80")).toBeVisible();
    await expect(textarea).toHaveAccessibleDescription("15 / 80");
  },
};

export const AutoResize: Story = {
  args: { "aria-label": "Notes", autoResize: true, maxRows: 5, placeholder: "Grows as you type", rows: 1 },
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole("textbox", { name: "Notes" });
    const before = textarea.offsetHeight;

    await userEvent.type(textarea, "one{enter}two{enter}three{enter}four");
    const grown = textarea.offsetHeight;

    await expect(grown).toBeGreaterThan(before);
    await userEvent.type(textarea, "{enter}five{enter}six{enter}seven{enter}eight");
    await expect(textarea.style.overflowY).toBe("auto");
    await expect(textarea.offsetHeight).toBeLessThan(grown * 2);
  },
};

export const Invalid: Story = {
  args: { defaultValue: "Too short", invalid: true, variant: "filled" },
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole("textbox", { name: "Review" });

    await expect(textarea).toHaveAttribute("aria-invalid", "true");
    await expect(textarea.closest(".rc-frame")).toHaveAttribute("data-variant", "filled");
  },
};
