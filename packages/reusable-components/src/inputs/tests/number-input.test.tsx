import { composeStories } from "@storybook/react-vite";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import * as stories from "../stories/number-input.stories";
import { Field } from "../ui/components/field";
import { NumberInput } from "../ui/components/number-input";

const { Controlled } = composeStories(stories);

describe("NumberInput stories", () => {
  it("Controlled: the total follows the quantity, and Reset sets it back", async () => {
    const screen = await render(<Controlled />);
    const books = screen.getByRole("spinbutton", { name: "Books" });

    await books.fill("4");
    await expect.element(screen.getByText("Total: 98.00 lei")).toBeVisible();

    await books.click();
    await userEvent.keyboard("{ArrowUp}");
    await expect.element(screen.getByText("Total: 122.50 lei")).toBeVisible();

    await screen.getByRole("button", { name: "Reset" }).click();
    await expect.element(books).toHaveValue("1");
  });
});

describe("NumberInput", () => {
  it("goes back to its default value on a form reset", async () => {
    const screen = await render(
      <form>
        <NumberInput aria-label="Books" defaultValue={5} />
        <button type="reset">Reset</button>
      </form>,
    );

    await screen.getByRole("spinbutton").fill("8");
    await screen.getByRole("button", { name: "Reset" }).click();

    await expect.element(screen.getByRole("spinbutton")).toHaveValue("5");
  });

  it("follows a disabled Field and allows a minus sign on touch keyboards", async () => {
    const screen = await render(
      <>
        <Field disabled label="Locked">
          <NumberInput defaultValue={1} />
        </Field>
        <NumberInput aria-label="Offset" />
      </>,
    );

    await expect.element(screen.getByRole("button", { name: "Increase" }).first()).toBeDisabled();
    await expect.element(screen.getByRole("spinbutton", { name: "Offset" })).toHaveAttribute("inputmode", "text");
  });

  it("is a spinbutton that announces its value and bounds", async () => {
    const screen = await render(
      <NumberInput aria-label="Quantity" defaultValue={3} max={10} min={0} />,
    );
    const input = screen.getByRole("spinbutton", { name: "Quantity" });

    await expect.element(input).toHaveValue("3");
    await expect.element(input).toHaveAttribute("aria-valuenow", "3");
    await expect.element(input).toHaveAttribute("aria-valuemin", "0");
    await expect.element(input).toHaveAttribute("aria-valuemax", "10");
    await expect.element(input).toHaveAttribute("inputmode", "decimal");
  });

  it("steps with the arrow keys, Shift and Page Up/Down, inside the bounds", async () => {
    const onValueChange = vi.fn();
    const screen = await render(
      <NumberInput
        aria-label="Quantity"
        defaultValue={5}
        largeStep={5}
        max={12}
        min={0}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole("spinbutton");

    await input.click();
    await userEvent.keyboard("{ArrowUp}");
    await expect.element(input).toHaveValue("6");
    await userEvent.keyboard("{Shift>}{ArrowUp}{/Shift}");
    await expect.element(input).toHaveValue("11");
    await userEvent.keyboard("{PageUp}");
    await expect.element(input).toHaveValue("12");
    await userEvent.keyboard("{ArrowDown}{PageDown}{PageDown}{PageDown}");
    await expect.element(input).toHaveValue("0");
    await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}");
    await expect.element(input).toHaveValue("0");

    expect(onValueChange.mock.calls.map(([value]) => value)).toEqual([6, 11, 12, 11, 6, 1, 0]);
  });

  it("keeps half-typed numbers, accepts a comma and ignores letters", async () => {
    const onValueChange = vi.fn();
    const screen = await render(
      <NumberInput aria-label="Price" onValueChange={onValueChange} precision={2} />,
    );
    const input = screen.getByRole("spinbutton");

    await input.click();
    await userEvent.keyboard("1,5a");

    await expect.element(input).toHaveValue("1,5");
    expect(onValueChange).toHaveBeenLastCalledWith(1.5);

    await userEvent.tab();
    await expect.element(input).toHaveValue("1.50");
  });

  it("clamps and rounds when the user leaves the field", async () => {
    const onValueChange = vi.fn();
    const screen = await render(
      <NumberInput aria-label="Percent" max={100} min={0} onValueChange={onValueChange} precision={0} />,
    );
    const input = screen.getByRole("spinbutton");

    await expect.element(input).toHaveAttribute("inputmode", "numeric");
    await input.fill("140.6");
    await userEvent.tab();

    await expect.element(input).toHaveValue("100");
    expect(onValueChange).toHaveBeenLastCalledWith(100);
  });

  it("empties to null, and a lone minus falls back to the last number", async () => {
    const onValueChange = vi.fn();
    const screen = await render(
      <NumberInput aria-label="Offset" defaultValue={4} onValueChange={onValueChange} />,
    );
    const input = screen.getByRole("spinbutton");

    await input.fill("");
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    await expect.element(input).not.toHaveAttribute("aria-valuenow");

    await input.fill("7");
    await input.fill("-");
    await userEvent.tab();

    await expect.element(input).toHaveValue("7");
  });

  it("commits on Enter", async () => {
    const screen = await render(<NumberInput aria-label="Rate" precision={1} />);
    const input = screen.getByRole("spinbutton");

    await input.fill("3.46");
    await userEvent.keyboard("{Enter}");

    await expect.element(input).toHaveValue("3.5");
  });

  it("steps with the buttons, which switch off at the bounds", async () => {
    const screen = await render(
      <NumberInput aria-label="Guests" defaultValue={1} max={2} min={1} />,
    );
    const increase = screen.getByRole("button", { name: "Increase" });
    const decrease = screen.getByRole("button", { name: "Decrease" });

    await expect.element(decrease).toBeDisabled();
    await increase.click();

    await expect.element(screen.getByRole("spinbutton")).toHaveValue("2");
    await expect.element(increase).toBeDisabled();
    await decrease.click();
    await expect.element(screen.getByRole("spinbutton")).toHaveValue("1");
  });

  it("starts an empty field from min", async () => {
    const screen = await render(<NumberInput aria-label="Year" min={2000} />);

    await screen.getByRole("button", { name: "Increase" }).click();

    await expect.element(screen.getByRole("spinbutton")).toHaveValue("2000");
  });

  it("can be controlled", async () => {
    function Controlled() {
      const [value, setValue] = useState<number | null>(10);

      return (
        <>
          <NumberInput aria-label="Count" onValueChange={setValue} step={5} value={value} />
          <p>Value: {String(value)}</p>
        </>
      );
    }

    const screen = await render(<Controlled />);

    await screen.getByRole("button", { name: "Increase" }).click();

    await expect.element(screen.getByText("Value: 15")).toBeVisible();
    await expect.element(screen.getByRole("spinbutton")).toHaveValue("15");
  });

  it("doesn't step when read-only, and can hide the stepper", async () => {
    const screen = await render(
      <NumberInput aria-label="Fixed" defaultValue={5} hideStepper readOnly />,
    );
    const input = screen.getByRole("spinbutton");

    await input.click();
    await userEvent.keyboard("{ArrowUp}");

    await expect.element(input).toHaveValue("5");
    expect(screen.container.querySelector("button")).toBeNull();
  });

  it("runs the consumer's handlers, which can cancel stepping", async () => {
    const onBlur = vi.fn();
    const screen = await render(
      <NumberInput
        aria-label="Locked"
        defaultValue={1}
        onBlur={onBlur}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp") {
            event.preventDefault();
          }
        }}
      />,
    );
    const input = screen.getByRole("spinbutton");

    await input.click();
    await userEvent.keyboard("{ArrowUp}");
    await userEvent.tab();

    await expect.element(input).toHaveValue("1");
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it("forwards the ref and styles each part", async () => {
    const ref = createRef<HTMLInputElement>();
    const screen = await render(
      <NumberInput
        aria-label="Styled"
        classNames={{ decrement: "down", increment: "up", stepper: "steps", suffix: "end" }}
        ref={ref}
        styles={{ stepper: { width: 40 } }}
        suffix="kg"
      />,
    );

    expect(ref.current).toBe(screen.getByRole("spinbutton").element());
    await expect.element(screen.getByRole("button", { name: "Increase" })).toHaveClass("up");
    await expect.element(screen.getByRole("button", { name: "Decrease" })).toHaveClass("down");
    await expect.element(screen.getByText("kg")).toHaveClass("rc-input__suffix", "rc-number__suffix", "end");

    const stepper = screen.container.querySelector<HTMLElement>(".rc-number__stepper")!;

    expect(stepper).toHaveClass("steps");
    expect(stepper.style.width).toBe("40px");
  });
});
