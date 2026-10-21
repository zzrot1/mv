import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type FormEvent } from "react";
import { expect, fn, userEvent } from "storybook/test";

import {
  composeValidators,
  email,
  maxLength,
  range,
  required,
} from "../domain/validation";
import { Checkbox } from "../ui/components/checkbox";
import { Field } from "../ui/components/field";
import { NumberInput } from "../ui/components/number-input";
import { Select } from "../ui/components/select";
import { TextInput } from "../ui/components/text-input";
import { Textarea } from "../ui/components/textarea";
import { useFieldControl } from "../ui/context";

const meta = {
  args: {
    children: <TextInput placeholder="ada@example.com" type="email" />,
    description: "We only use it to send your receipts.",
    label: "Email",
  },
  component: Field,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 380 }}>
        <Story />
      </div>
    ),
  ],
  title: "Inputs/Field",
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Anatomy: Story = {
  args: { error: "That doesn't look like an email.", required: true },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });

    await expect(input).toBeRequired();
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription(
      "We only use it to send your receipts. That doesn't look like an email.",
    );
    await expect(canvas.getByRole("alert")).toHaveTextContent("That doesn't look like an email.");
  },
};

export const Disabled: Story = {
  args: { disabled: true, size: "sm" },
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Email" });

    await expect(input).toBeDisabled();
    await expect(input.closest(".rc-frame")).toHaveAttribute("data-size", "sm");
  },
};

export const InlineLayout: Story = {
  args: {
    classNames: { root: "inline-field" },
    description: "Shown on your public profile.",
    label: "Display name",
    styles: {
      description: { gridColumn: 2 },
      root: { alignItems: "center", columnGap: 16, gridTemplateColumns: "120px 1fr" },
    },
  },
  play: async ({ canvas }) => {
    const label = canvas.getByText("Display name");
    const input = canvas.getByRole("textbox", { name: "Display name" });

    await expect(label.getBoundingClientRect().right).toBeLessThan(input.getBoundingClientRect().left);
  },
};

function ColorInput() {
  return (
    <input
      style={{ blockSize: 36, inlineSize: 64 }}
      type="color"
      {...useFieldControl({ defaultValue: "#7c3aed" }, false)}
    />
  );
}

export const CustomControl: Story = {
  args: { children: <ColorInput />, description: "Used for your avatar.", label: "Favourite color" },
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText("Favourite color");

    await expect(input).toHaveAccessibleDescription("Used for your avatar.");
  },
};

type SignUp = {
  age: number | null;
  bio: string;
  country: string;
  email: string;
  terms: boolean;
};

const validators = {
  age: composeValidators<number | null>(
    required("Enter your age."),
    range({ max: 120, min: 16 }, "You must be 16 or older."),
  ),
  bio: maxLength(120, "Keep it under 120 characters."),
  country: required("Pick a country."),
  email: composeValidators<string>(
    required("Enter your email."),
    email("That doesn't look like an email."),
  ),
  terms: required("Accept the terms to continue."),
};

function SignUpForm({ onSubmit }: { onSubmit: (values: SignUp) => void }) {
  const [values, setValues] = useState<SignUp>({
    age: null,
    bio: "",
    country: "",
    email: "",
    terms: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const errors = {
    age: validators.age(values.age),
    bio: validators.bio(values.bio),
    country: validators.country(values.country),
    email: validators.email(values.email),
    terms: validators.terms(values.terms),
  };
  const shown = (key: keyof SignUp) => (submitted ? errors[key] : undefined);

  function set<TKey extends keyof SignUp>(key: TKey) {
    return (value: SignUp[TKey]) => setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (Object.values(errors).every((error) => !error)) {
      onSubmit(values);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
      <Field error={shown("email")} label="Email" required>
        <TextInput autoComplete="email" onValueChange={set("email")} type="email" value={values.email} />
      </Field>
      <Field error={shown("age")} label="Age" required>
        <NumberInput min={0} onValueChange={set("age")} precision={0} value={values.age} />
      </Field>
      <Field error={shown("country")} label="Country" required>
        <Select
          onValueChange={set("country")}
          options={[
            { label: "Romania", value: "ro" },
            { label: "Moldova", value: "md" },
            { label: "Other", value: "other" },
          ]}
          placeholder="Pick a country"
          value={values.country}
        />
      </Field>
      <Field description="Optional." error={shown("bio")} label="About you">
        <Textarea autoResize maxRows={6} onValueChange={set("bio")} rows={2} value={values.bio} />
      </Field>
      <Field error={shown("terms")}>
        <Checkbox checked={values.terms} label="I accept the terms" onCheckedChange={set("terms")} />
      </Field>
      <button style={{ justifySelf: "start", padding: "8px 16px" }} type="submit">
        Create account
      </button>
    </form>
  );
}

export const SignUpWithValidation: StoryObj<typeof SignUpForm> = {
  args: { onSubmit: fn() },
  render: (args) => <SignUpForm {...args} />,
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Create account" }));
    await expect(canvas.getAllByRole("alert")).toHaveLength(4);

    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "ada@");
    await expect(canvas.getByText("That doesn't look like an email.")).toBeVisible();
    await userEvent.type(canvas.getByRole("textbox", { name: "Email" }), "example.com");

    await userEvent.type(canvas.getByRole("spinbutton", { name: "Age" }), "12");
    await expect(canvas.getByText("You must be 16 or older.")).toBeVisible();
    await userEvent.clear(canvas.getByRole("spinbutton", { name: "Age" }));
    await userEvent.type(canvas.getByRole("spinbutton", { name: "Age" }), "36");

    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Country" }), "ro");
    await userEvent.click(canvas.getByRole("checkbox", { name: "I accept the terms" }));
    await expect(canvas.queryAllByRole("alert")).toHaveLength(0);

    await userEvent.click(canvas.getByRole("button", { name: "Create account" }));
    await expect(args.onSubmit).toHaveBeenCalledWith({
      age: 36,
      bio: "",
      country: "ro",
      email: "ada@example.com",
      terms: true,
    });
  },
};
