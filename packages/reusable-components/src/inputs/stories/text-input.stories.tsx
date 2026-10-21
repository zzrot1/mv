import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { TextInput } from "../ui/components/text-input";

const meta = {
  args: { "aria-label": "Full name", onValueChange: fn(), placeholder: "Ada Lovelace" },
  component: TextInput,
  decorators: [
    (Story) => (
      <div style={{ display: "grid", gap: 12, maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
  title: "Inputs/Text input",
} satisfies Meta<typeof TextInput>;

export default meta;

type Story = StoryObj<typeof meta>;

function frameOf(element: HTMLElement) {
  return element.closest<HTMLElement>(".rc-frame")!;
}

export const Default: Story = {
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Full name" });

    await userEvent.type(input, "Ada");

    await expect(input).toHaveValue("Ada");
    await expect(args.onValueChange).toHaveBeenLastCalledWith("Ada");
  },
};

export const PrefixAndSuffix: Story = {
  args: { "aria-label": "Website", placeholder: "my-shop", prefix: "https://", suffix: ".ro" },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByText("https://"));

    await expect(canvas.getByRole("textbox", { name: "Website" })).toHaveFocus();
    await expect(canvas.getByText(".ro")).toHaveClass("rc-input__suffix");
  },
};

export const Sizes: Story = {
  render: (args) => (
    <>
      {(["sm", "md", "lg"] as const).map((size) => (
        <TextInput
          {...args}
          aria-label={`Size ${size}`}
          key={size}
          placeholder={`size="${size}"`}
          size={size}
        />
      ))}
    </>
  ),
  play: async ({ canvas }) => {
    const heights = ["sm", "md", "lg"].map(
      (size) => frameOf(canvas.getByRole("textbox", { name: `Size ${size}` })).offsetHeight,
    );

    await expect(heights).toEqual([32, 36, 40]);
  },
};

export const Variants: Story = {
  render: (args) => (
    <>
      {(["outline", "filled", "ghost"] as const).map((variant) => (
        <TextInput
          {...args}
          aria-label={`Variant ${variant}`}
          defaultValue={`variant="${variant}"`}
          key={variant}
          variant={variant}
        />
      ))}
    </>
  ),
  play: async ({ canvas }) => {
    const outline = getComputedStyle(frameOf(canvas.getByRole("textbox", { name: "Variant outline" })));
    const filled = getComputedStyle(frameOf(canvas.getByRole("textbox", { name: "Variant filled" })));
    const ghost = getComputedStyle(frameOf(canvas.getByRole("textbox", { name: "Variant ghost" })));

    await expect(outline.borderTopColor).not.toBe("rgba(0, 0, 0, 0)");
    await expect(filled.backgroundColor).toBe("rgb(245, 245, 245)");
    await expect(ghost.borderTopColor).toBe("rgba(0, 0, 0, 0)");
  },
};

export const Invalid: Story = {
  args: { "aria-label": "Email", defaultValue: "ada@", invalid: true, type: "email" },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });

    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(getComputedStyle(frameOf(input)).borderTopColor).toBe("rgb(220, 38, 38)");
  },
};

export const Disabled: Story = {
  args: { defaultValue: "Ada Lovelace", disabled: true },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Full name" });

    await expect(input).toBeDisabled();
    await expect(frameOf(input)).toHaveAttribute("data-disabled", "true");
  },
};
