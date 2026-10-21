import { composeStories } from "@storybook/react-vite";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import * as stories from "../stories/field.stories";
import { Checkbox } from "../ui/components/checkbox";
import { Field } from "../ui/components/field";
import { NumberInput } from "../ui/components/number-input";
import { Select } from "../ui/components/select";
import { TextInput } from "../ui/components/text-input";
import { Textarea } from "../ui/components/textarea";
import { InputsConfigProvider, useFieldControl } from "../ui/context";

const { SignUpWithValidation } = composeStories(stories);

describe("Field stories", () => {
  it("SignUpWithValidation: errors wait for the first submit, and invalid data never submits", async () => {
    const onSubmit = vi.fn();
    const screen = await render(<SignUpWithValidation onSubmit={onSubmit} />);

    expect(screen.getByRole("alert").elements()).toHaveLength(0);

    await screen.getByRole("textbox", { name: "About you" }).fill("x".repeat(121));
    await screen.getByRole("button", { name: "Create account" }).click();

    await expect.element(screen.getByText("Keep it under 120 characters.")).toBeVisible();
    expect(screen.getByRole("alert").elements()).toHaveLength(5);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("Field", () => {
  it("keeps the label linked when the control brings its own id", async () => {
    const screen = await render(
      <Field label="Email">
        <TextInput id="email" />
      </Field>,
    );

    await expect.element(screen.getByRole("textbox", { name: "Email" })).toBeVisible();
  });

  it("labels the control and links its description and error", async () => {
    const screen = await render(
      <Field
        description="We never share it."
        error="Enter a valid email."
        label="Email"
        required
      >
        <TextInput type="email" />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Email" });

    await expect.element(input).toHaveAccessibleDescription("We never share it. Enter a valid email.");
    await expect.element(input).toHaveAttribute("aria-invalid", "true");
    await expect.element(input).toBeRequired();
    await expect.element(screen.getByRole("alert")).toHaveTextContent("Enter a valid email.");
    expect(input.element().closest(".rc-frame")).toHaveAttribute("data-invalid", "true");
    expect(input.element().closest(".rc-field")).toHaveAttribute("data-invalid", "true");
  });

  it("is valid without an error, and false counts as no error", async () => {
    const screen = await render(
      <Field error={false} label="Name">
        <TextInput />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Name" });

    await expect.element(input).not.toHaveAttribute("aria-invalid");
    await expect.element(input).not.toHaveAttribute("aria-describedby");
    expect(screen.getByRole("alert").query()).toBeNull();
  });

  it("passes disabled and size down, and uses the given id", async () => {
    const screen = await render(
      <Field disabled id="nickname" label="Nickname" size="sm">
        <TextInput />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Nickname" });

    await expect.element(input).toBeDisabled();
    await expect.element(input).toHaveAttribute("id", "nickname");

    const frame = input.element().closest(".rc-frame")!;

    expect(frame).toHaveAttribute("data-size", "sm");
    expect(frame).toHaveAttribute("data-disabled", "true");
  });

  it("works around every kind of control", async () => {
    const screen = await render(
      <>
        <Field label="Age">
          <NumberInput />
        </Field>
        <Field label="Country">
          <Select options={[{ label: "Romania", value: "ro" }]} />
        </Field>
        <Field description="A few words." label="Bio">
          <Textarea showCount />
        </Field>
        <Field error="Required." label="Terms">
          <Checkbox label="I agree" />
        </Field>
      </>,
    );

    await expect.element(screen.getByRole("spinbutton", { name: "Age" })).toBeVisible();
    await expect.element(screen.getByRole("combobox", { name: "Country" })).toBeVisible();
    await expect
      .element(screen.getByRole("textbox", { name: "Bio" }))
      .toHaveAccessibleDescription("0 A few words.");
    await expect
      .element(screen.getByRole("checkbox", { name: "Terms I agree" }))
      .toHaveAttribute("aria-invalid", "true");
  });

  it("lets a custom control plug in with useFieldControl", async () => {
    function ColorInput() {
      return <input type="color" {...useFieldControl({}, false)} />;
    }

    const screen = await render(
      <Field description="Used for your avatar." label="Favourite color">
        <ColorInput />
      </Field>,
    );
    const input = screen.getByLabelText("Favourite color");

    await expect.element(input).toHaveAccessibleDescription("Used for your avatar.");
  });

  it("styles its parts from outside", async () => {
    const screen = await render(
      <Field
        classNames={{ description: "hint", error: "oops", label: "caption", required: "star", root: "group" }}
        description="Hint"
        error="Oops"
        label="Styled"
        required
        styles={{ label: { textTransform: "uppercase" } }}
      >
        <TextInput />
      </Field>,
    );

    const label = screen.getByText(/^Styled/).element() as HTMLElement;

    expect(label).toHaveClass("rc-field__label", "caption");
    expect(label.style.textTransform).toBe("uppercase");
    expect(label.closest(".rc-field")).toHaveClass("group");
    await expect.element(screen.getByText("Hint")).toHaveClass("hint");
    await expect.element(screen.getByText("Oops")).toHaveClass("oops");
    await expect.element(screen.getByText("*")).toHaveClass("rc-field__required", "star");
  });

  it("lets a control's own props win over the Field, and the Field over the provider", async () => {
    const screen = await render(
      <InputsConfigProvider size="sm">
        <Field disabled error="Taken." label="Handle" size="lg">
          <TextInput aria-describedby="hint" disabled={false} invalid={false} size="md" />
        </Field>
        <p id="hint">Letters only.</p>
        <Field label="Nickname" size="lg">
          <TextInput />
        </Field>
      </InputsConfigProvider>,
    );
    const handle = screen.getByRole("textbox", { name: "Handle" });
    const nickname = screen.getByRole("textbox", { name: "Nickname" });

    await expect.element(handle).toBeEnabled();
    await expect.element(handle).not.toHaveAttribute("aria-invalid");
    await expect.element(handle).toHaveAccessibleDescription("Letters only. Taken.");
    expect(handle.element().closest(".rc-frame")).toHaveAttribute("data-size", "md");
    expect(nickname.element().closest(".rc-frame")).toHaveAttribute("data-size", "lg");
  });
});
