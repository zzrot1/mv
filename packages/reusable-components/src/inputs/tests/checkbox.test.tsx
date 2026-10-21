import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Checkbox, Switch } from "../ui/components/checkbox";
import { Field } from "../ui/components/field";

describe("Checkbox", () => {
  it("toggles from its label and reports the checked state", async () => {
    const onChange = vi.fn();
    const onCheckedChange = vi.fn();
    const screen = await render(
      <Checkbox label="Accept the terms" onChange={onChange} onCheckedChange={onCheckedChange} />,
    );
    const checkbox = screen.getByRole("checkbox", { name: "Accept the terms" });

    await screen.getByText("Accept the terms").click();

    await expect.element(checkbox).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(onChange).toHaveBeenCalledOnce();

    await checkbox.click();

    await expect.element(checkbox).not.toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it("shows the indeterminate state and follows it on re-render", async () => {
    function SelectAll() {
      const [state, setState] = useState<"some" | "all">("some");

      return (
        <Checkbox
          checked={state === "all"}
          indeterminate={state === "some"}
          label="Select all"
          onCheckedChange={() => setState("all")}
        />
      );
    }

    const screen = await render(<SelectAll />);
    const checkbox = screen.getByRole("checkbox", { name: "Select all" });

    await expect.element(checkbox).toBePartiallyChecked();
    await checkbox.click();
    await expect.element(checkbox).toBeChecked();
    expect((checkbox.element() as HTMLInputElement).indeterminate).toBe(false);
  });

  it("forwards the ref and native props, and marks disabled on the label", async () => {
    const ref = createRef<HTMLInputElement>();
    const screen = await render(
      <Checkbox defaultChecked disabled label="Newsletter" name="news" ref={ref} value="yes" />,
    );
    const checkbox = screen.getByRole("checkbox");

    expect(ref.current).toBe(checkbox.element());
    await expect.element(checkbox).toBeChecked();
    await expect.element(checkbox).toBeDisabled();
    await expect.element(checkbox).toHaveAttribute("name", "news");
    expect(checkbox.element().closest("label")).toHaveAttribute("data-disabled", "true");
  });

  it("styles its parts from outside, sizes and stays unlabeled when asked", async () => {
    const screen = await render(
      <>
        <Checkbox
          classNames={{ input: "box", label: "text", root: "row" }}
          invalid
          label="Styled"
          size="lg"
        />
        <Checkbox aria-label="Only a box" />
      </>,
    );
    const styled = screen.getByRole("checkbox", { name: "Styled" });
    const root = styled.element().closest("label")!;

    await expect.element(styled).toHaveClass("rc-checkbox__control", "box");
    await expect.element(styled).toHaveAttribute("aria-invalid", "true");
    expect(root).toHaveClass("rc-root", "rc-checkbox", "row");
    expect(root).toHaveAttribute("data-size", "lg");
    await expect.element(screen.getByText("Styled")).toHaveClass("rc-checkbox__label", "text");
    expect(getComputedStyle(styled.element()).width).toBe("20px");

    const bare = screen.getByRole("checkbox", { name: "Only a box" }).element();

    expect(bare.closest("label")!.querySelector("span")).toBeNull();
  });
});

describe.each([
  { Control: Checkbox, role: "checkbox" },
  { Control: Switch, role: "switch" },
] as const)("$role", ({ Control, role }) => {
  it("joins a Field: description, error, disabled and size", async () => {
    const screen = await render(
      <Field description="Once a week." disabled error="Pick one." label="Email" size="lg">
        <Control label="News" />
      </Field>,
    );
    const control = screen.getByRole(role, { name: "Email News" });

    await expect.element(control).toHaveAccessibleDescription("Once a week. Pick one.");
    await expect.element(control).toHaveAttribute("aria-invalid", "true");
    await expect.element(control).toBeDisabled();
    expect(control.element().closest("label")).toHaveAttribute("data-size", "lg");
  });

  it("toggles with Space, and stays as its parent decides", async () => {
    const screen = await render(
      <>
        <Control label="Free" />
        <Control checked={false} label="Locked" onCheckedChange={() => {}} />
      </>,
    );

    await userEvent.tab();
    await userEvent.keyboard(" ");
    await expect.element(screen.getByRole(role, { name: "Free" })).toBeChecked();

    await screen.getByRole(role, { name: "Locked" }).click();
    await expect.element(screen.getByRole(role, { name: "Locked" })).not.toBeChecked();
  });

  it("forwards the ref, and keeps only the consumer's classes and styles when unstyled", async () => {
    const ref = createRef<HTMLInputElement>();
    const screen = await render(
      <Control
        classNames={{ input: "box" }}
        label="Plain"
        ref={ref}
        styles={{ input: { margin: "3px" }, label: { color: "red" }, root: { gap: "9px" } }}
        unstyled
      />,
    );
    const control = screen.getByRole(role).element() as HTMLInputElement;
    const label = screen.getByText("Plain").element() as HTMLElement;

    expect(ref.current).toBe(control);
    expect(control.className).toBe("box");
    expect(control.style.margin).toBe("3px");
    expect(label.className).toBe("");
    expect(label.style.color).toBe("red");
    expect(control.closest("label")!.className).toBe("");
    expect(control.closest("label")!.style.gap).toBe("9px");
  });
});
