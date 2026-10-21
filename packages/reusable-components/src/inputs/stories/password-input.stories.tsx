import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent } from "storybook/test";

import { Field } from "../ui/components/field";
import { PasswordInput } from "../ui/components/password-input";

const meta = {
  args: { "aria-label": "Password", onVisibleChange: fn(), placeholder: "••••••••" },
  component: PasswordInput,
  decorators: [
    (Story) => (
      <div style={{ display: "grid", gap: 12, maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
  title: "Inputs/Password input",
} satisfies Meta<typeof PasswordInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas }) => {
    const input = canvas.getByLabelText("Password", { exact: true });

    await userEvent.type(input, "correct horse");
    await expect(input).toHaveAttribute("type", "password");

    await userEvent.click(canvas.getByRole("button", { name: "Show password" }));
    await expect(input).toHaveAttribute("type", "text");
    await expect(args.onVisibleChange).toHaveBeenLastCalledWith(true);
  },
};

export const VisibleByDefault: Story = {
  args: { defaultValue: "shown-on-purpose", defaultVisible: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText("Password", { exact: true })).toHaveAttribute("type", "text");
    await expect(canvas.getByRole("button", { name: "Hide password" })).toBeVisible();
  },
};

function strengthOf(password: string) {
  if (password.length >= 12) {
    return "Strong";
  }

  return password.length >= 8 ? "Good" : "Too short: use at least 8 characters";
}

function NewPassword() {
  const [password, setPassword] = useState("");
  const tooShort = password.length > 0 && password.length < 8;

  return (
    <Field
      description={password ? `Strength: ${strengthOf(password)}` : "At least 8 characters."}
      error={tooShort ? "This password is too short." : undefined}
      label="New password"
      required
    >
      <PasswordInput autoComplete="new-password" onValueChange={setPassword} value={password} />
    </Field>
  );
}

export const WithStrengthHint: Story = {
  render: () => <NewPassword />,
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText("New password", { exact: false });

    await userEvent.type(input, "abc");
    await expect(canvas.getByRole("alert")).toHaveTextContent("This password is too short.");

    await userEvent.type(input, "defghijkl");
    await expect(canvas.getByText("Strength: Strong")).toBeVisible();
    await expect(canvas.queryByRole("alert")).toBeNull();
  },
};
