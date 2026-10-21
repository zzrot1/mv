import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { Field } from "../ui/components/field";
import { PasswordInput } from "../ui/components/password-input";
import { InputsConfigProvider } from "../ui/context";

describe("PasswordInput", () => {
  it("hides the password until the toggle is pressed", async () => {
    const screen = await render(<PasswordInput aria-label="Password" defaultValue="s3cret" />);
    const input = screen.getByLabelText("Password", { exact: true });

    await expect.element(input).toHaveAttribute("type", "password");
    await expect.element(input).toHaveAttribute("autocomplete", "current-password");

    await screen.getByRole("button", { name: "Show password" }).click();

    await expect.element(input).toHaveAttribute("type", "text");
    await expect.element(input).toHaveValue("s3cret");

    await screen.getByRole("button", { name: "Hide password" }).click();

    await expect.element(input).toHaveAttribute("type", "password");
  });

  it("can be controlled from outside", async () => {
    const onVisibleChange = vi.fn();

    function Controlled() {
      const [visible, setVisible] = useState(true);

      return (
        <PasswordInput
          aria-label="Password"
          autoComplete="new-password"
          onVisibleChange={(next) => {
            onVisibleChange(next);
            setVisible(next);
          }}
          visible={visible}
        />
      );
    }

    const screen = await render(<Controlled />);
    const input = screen.getByLabelText("Password", { exact: true });

    await expect.element(input).toHaveAttribute("type", "text");
    await expect.element(input).toHaveAttribute("autocomplete", "new-password");

    await screen.getByRole("button", { name: "Hide password" }).click();

    expect(onVisibleChange).toHaveBeenCalledWith(false);
    await expect.element(input).toHaveAttribute("type", "password");
  });

  it("disables the toggle with the input and keeps the consumer's suffix", async () => {
    const screen = await render(
      <PasswordInput
        aria-label="Password"
        classNames={{ toggle: "eye" }}
        disabled
        suffix={<span>Caps Lock</span>}
      />,
    );
    const toggle = screen.getByRole("button", { name: "Show password" });

    await expect.element(toggle).toBeDisabled();
    await expect.element(toggle).toHaveClass("rc-input__button", "eye");
    await expect.element(screen.getByText("Caps Lock")).toBeVisible();
  });

  it("names its toggle from the provider, and disables it in a disabled Field", async () => {
    const screen = await render(
      <InputsConfigProvider labels={{ hidePassword: "Ascunde parola", showPassword: "Arată parola" }}>
        <PasswordInput aria-label="Parolă" />
        <Field disabled label="Blocată">
          <PasswordInput />
        </Field>
      </InputsConfigProvider>,
    );
    const show = screen.getByRole("button", { name: "Arată parola" });

    await expect.element(show.last()).toBeDisabled();
    await show.first().click();
    await expect.element(screen.getByRole("button", { name: "Ascunde parola" })).toBeVisible();
  });
});
