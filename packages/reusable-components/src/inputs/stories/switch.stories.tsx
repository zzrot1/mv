import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent } from "storybook/test";

import { Switch } from "../ui/components/checkbox";

const meta = {
  args: { label: "Airplane mode", onCheckedChange: fn() },
  component: Switch,
  title: "Inputs/Switch",
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas }) => {
    const toggle = canvas.getByRole("switch", { name: "Airplane mode" });

    await userEvent.click(toggle);

    await expect(toggle).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);
  },
};

const settings = [
  { id: "orders", label: "Order updates" },
  { id: "deals", label: "Deals and offers" },
  { id: "reviews", label: "Review reminders" },
];

function NotificationSettings() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ orders: true });
  const count = Object.values(enabled).filter(Boolean).length;

  return (
    <div style={{ display: "grid", gap: 14, maxWidth: 320 }}>
      {settings.map(({ id, label }) => (
        <Switch
          checked={enabled[id] ?? false}
          key={id}
          label={label}
          onCheckedChange={(checked) => setEnabled((current) => ({ ...current, [id]: checked }))}
          style={{ justifyContent: "space-between", width: "100%" }}
          styles={{ label: { order: -1 } }}
        />
      ))}
      <p role="status" style={{ margin: 0 }}>
        {count} of {settings.length} notifications on
      </p>
    </div>
  );
}

export const SettingsList: Story = {
  render: () => <NotificationSettings />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent("1 of 3 notifications on");

    await userEvent.click(canvas.getByRole("switch", { name: "Deals and offers" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("2 of 3 notifications on");

    await userEvent.click(canvas.getByRole("switch", { name: "Order updates" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("1 of 3 notifications on");
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      <Switch defaultChecked label="Small" size="sm" />
      <Switch defaultChecked label="Medium" size="md" />
      <Switch defaultChecked label="Large" size="lg" />
      <Switch disabled label="Disabled" />
    </div>
  ),
  play: async ({ canvas }) => {
    const widths = ["Small", "Medium", "Large"].map(
      (name) => canvas.getByRole("switch", { name }).getBoundingClientRect().width,
    );

    await expect(widths).toEqual([28, 32, 40]);
    await expect(canvas.getByRole("switch", { name: "Disabled" })).toBeDisabled();
  },
};
