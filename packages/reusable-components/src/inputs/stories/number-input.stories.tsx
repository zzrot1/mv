import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent } from "storybook/test";

import { NumberInput } from "../ui/components/number-input";

const meta = {
  args: { "aria-label": "Quantity", defaultValue: 1, max: 10, min: 0, onValueChange: fn() },
  component: NumberInput,
  decorators: [
    (Story) => (
      <div style={{ display: "grid", gap: 12, maxWidth: 240 }}>
        <Story />
      </div>
    ),
  ],
  title: "Inputs/Number input",
} satisfies Meta<typeof NumberInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas }) => {
    const input = canvas.getByRole("spinbutton", { name: "Quantity" });

    await userEvent.click(canvas.getByRole("button", { name: "Increase" }));
    await userEvent.click(canvas.getByRole("button", { name: "Increase" }));
    await expect(input).toHaveValue("3");

    await userEvent.click(input);
    await userEvent.keyboard("{ArrowDown}");
    await expect(input).toHaveValue("2");
    await expect(args.onValueChange).toHaveBeenLastCalledWith(2);
  },
};

export const Decimals: Story = {
  args: {
    "aria-label": "Price",
    defaultValue: 9.99,
    max: undefined,
    precision: 2,
    prefix: "€",
    step: 0.5,
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("spinbutton", { name: "Price" });

    await userEvent.clear(input);
    await userEvent.type(input, "12,3");
    await userEvent.tab();
    await expect(input).toHaveValue("12.30");

    await userEvent.click(canvas.getByRole("button", { name: "Increase" }));
    await expect(input).toHaveValue("12.80");
  },
};

export const ClampedToBounds: Story = {
  args: { "aria-label": "Discount", defaultValue: 20, max: 100, precision: 0, suffix: "%" },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("spinbutton", { name: "Discount" });

    await userEvent.clear(input);
    await userEvent.type(input, "150");
    await userEvent.tab();

    await expect(input).toHaveValue("100");
    await expect(canvas.getByRole("button", { name: "Increase" })).toBeDisabled();
  },
};

export const KeyboardOnly: Story = {
  args: { "aria-label": "Year", defaultValue: 2026, hideStepper: true, max: 2100, min: 1900, precision: 0 },
  play: async ({ canvas, canvasElement }) => {
    const input = canvas.getByRole("spinbutton", { name: "Year" });

    await expect(canvasElement.querySelector("button")).toBeNull();
    await userEvent.click(input);
    await userEvent.keyboard("{PageUp}{Shift>}{ArrowDown}{/Shift}{ArrowUp}");
    await expect(input).toHaveValue("2027");
  },
};

function Cart() {
  const [quantity, setQuantity] = useState<number | null>(2);
  const price = 24.5;

  return (
    <>
      <NumberInput aria-label="Books" max={20} min={1} onValueChange={setQuantity} value={quantity} />
      <p style={{ margin: 0 }}>Total: {((quantity ?? 0) * price).toFixed(2)} lei</p>
      <button onClick={() => setQuantity(1)} type="button">
        Reset
      </button>
    </>
  );
}

export const Controlled: Story = {
  render: () => <Cart />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Increase" }));
    await expect(canvas.getByText("Total: 73.50 lei")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(canvas.getByRole("spinbutton", { name: "Books" })).toHaveValue("1");
    await expect(canvas.getByText("Total: 24.50 lei")).toBeVisible();
  },
};
