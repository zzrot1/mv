import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { expect, userEvent } from "storybook/test";

import { Checkbox, Switch } from "../ui/components/checkbox";
import { Field } from "../ui/components/field";
import { NumberInput } from "../ui/components/number-input";
import { PasswordInput } from "../ui/components/password-input";
import { SearchInput } from "../ui/components/search-input";
import { Select } from "../ui/components/select";
import { TextInput } from "../ui/components/text-input";
import { Textarea } from "../ui/components/textarea";
import { InputsConfigProvider } from "../ui/context";

const formats = [
  { label: "Hardcover", value: "hardcover" },
  { label: "E-book", value: "ebook" },
];

function Showcase({ className }: { className?: string }) {
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 380 }}>
      <Field label="Name">
        <TextInput className={className} placeholder="Ada Lovelace" />
      </Field>
      <Field label="Copies">
        <NumberInput className={className} defaultValue={2} min={1} />
      </Field>
      <Field label="Search">
        <SearchInput className={className} defaultValue="Dune" />
      </Field>
      <Field label="Password">
        <PasswordInput className={className} defaultValue="secret-pass" />
      </Field>
      <Field label="Format">
        <Select className={className} defaultValue="ebook" options={formats} />
      </Field>
      <Field label="Notes">
        <Textarea className={className} defaultValue="Signed copy, please." maxLength={100} showCount />
      </Field>
      <Checkbox defaultChecked label="Gift wrap" />
      <Switch defaultChecked label="Express delivery" />
    </div>
  );
}

const meta = {
  component: Showcase,
  title: "Inputs/Theming",
} satisfies Meta<typeof Showcase>;

export default meta;

type Story = StoryObj<typeof meta>;

function frameOf(element: HTMLElement) {
  return element.closest<HTMLElement>(".rc-frame")!;
}

export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <div className="dark" style={{ background: "#0a0a0a", borderRadius: 12, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
  parameters: { backgrounds: { disable: true } },
  play: async ({ canvas }) => {
    const name = canvas.getByRole("textbox", { name: "Name" });

    await expect(getComputedStyle(frameOf(name)).colorScheme).toBe("dark");
    await expect(getComputedStyle(canvas.getByText("Name")).color).toBe("rgb(250, 250, 250)");
    await expect(getComputedStyle(canvas.getByRole("switch")).backgroundColor).toBe("rgb(229, 229, 229)");
  },
};

const brand = {
  "--rc-primary": "#6d28d9",
  "--rc-primary-foreground": "#ffffff",
  "--rc-radius": "14px",
  "--rc-ring": "#8b5cf6",
} as CSSProperties;

export const BrandTokens: Story = {
  decorators: [
    (Story) => (
      <div style={brand}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    await expect(getComputedStyle(frameOf(canvas.getByRole("textbox", { name: "Name" }))).borderRadius).toBe(
      "14px",
    );
    await expect(getComputedStyle(canvas.getByRole("checkbox")).backgroundColor).toBe("rgb(109, 40, 217)");
  },
};

const pillStyles = `
.pill { border-radius: 999px; border-color: #0284c7; }
.pill:focus-within { box-shadow: 0 0 0 3px rgb(2 132 199 / 0.25); }
`;

export const ConsumerClasses: Story = {
  args: { className: "pill" },
  decorators: [
    (Story) => (
      <>
        <style>{pillStyles}</style>
        <Story />
      </>
    ),
  ],
  play: async ({ canvas }) => {
    const frame = frameOf(canvas.getByRole("textbox", { name: "Name" }));

    await expect(getComputedStyle(frame).borderRadius).toBe("999px");
    await expect(getComputedStyle(frame).borderTopColor).toBe("rgb(2, 132, 199)");
  },
};

const ownCss = `
.plain-input { padding: 6px 8px; border: 2px solid #334155; border-radius: 4px; font: inherit; }
.plain-label { display: block; margin-bottom: 4px; font-weight: 700; }
`;

export const Unstyled: Story = {
  render: () => (
    <>
      <style>{ownCss}</style>
      <Field classNames={{ label: "plain-label" }} label="Title" unstyled>
        <TextInput classNames={{ input: "plain-input" }} unstyled />
      </Field>
    </>
  ),
  play: async ({ canvas, canvasElement }) => {
    const input = canvas.getByRole("textbox", { name: "Title" });

    await expect(canvasElement.querySelector('[class*="rc-"]')).toBeNull();
    await expect(getComputedStyle(input).borderTopWidth).toBe("2px");
  },
};

export const Translated: Story = {
  decorators: [
    (Story) => (
      <InputsConfigProvider
        labels={{
          characterCount: (count, max) => `${count} din ${max} caractere`,
          clearSearch: "Șterge căutarea",
          decrement: "Micșorează",
          hidePassword: "Ascunde parola",
          increment: "Mărește",
          showPassword: "Arată parola",
        }}
      >
        <Story />
      </InputsConfigProvider>
    ),
  ],
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Mărește" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Șterge căutarea" })).toBeVisible();
    await expect(canvas.getByText("20 din 100 caractere")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Arată parola" }));
    await expect(canvas.getByRole("button", { name: "Ascunde parola" })).toBeVisible();
  },
};

export const AppDefaults: Story = {
  decorators: [
    (Story) => (
      <InputsConfigProvider size="lg" variant="filled">
        <Story />
      </InputsConfigProvider>
    ),
  ],
  play: async ({ canvas }) => {
    const frame = frameOf(canvas.getByRole("spinbutton", { name: "Copies" }));

    await expect(frame).toHaveAttribute("data-size", "lg");
    await expect(frame).toHaveAttribute("data-variant", "filled");
    await expect(frame.offsetHeight).toBe(40);
  },
};
