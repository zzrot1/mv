import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { Textarea } from "../ui/components/textarea";
import { InputsConfigProvider } from "../ui/context";

describe("Textarea", () => {
  it("follows a form reset in its counter", async () => {
    const screen = await render(
      <form>
        <Textarea aria-label="Bio" defaultValue="Hi" maxLength={10} showCount />
        <button type="reset">Reset</button>
      </form>,
    );

    await screen.getByRole("textbox").fill("Hello");
    await expect.element(screen.getByText("5 / 10")).toBeVisible();
    await screen.getByRole("button", { name: "Reset" }).click();
    await expect.element(screen.getByText("2 / 10")).toBeVisible();
  });

  it("passes native props and the ref to the <textarea>", async () => {
    const ref = createRef<HTMLTextAreaElement>();
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    const screen = await render(
      <Textarea
        aria-label="Bio"
        name="bio"
        onChange={onChange}
        onValueChange={onValueChange}
        ref={ref}
        rows={5}
      />,
    );
    const textarea = screen.getByRole("textbox", { name: "Bio" });

    await expect.element(textarea).toHaveAttribute("rows", "5");
    expect(ref.current).toBe(textarea.element());

    await textarea.fill("Hello");

    expect(onValueChange).toHaveBeenLastCalledWith("Hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("counts characters against maxLength and describes the field with it", async () => {
    const screen = await render(
      <Textarea aria-label="Bio" defaultValue="Hi" maxLength={10} showCount />,
    );
    const textarea = screen.getByRole("textbox");

    await expect.element(screen.getByText("2 / 10")).toBeVisible();
    await expect.element(textarea).toHaveAccessibleDescription("2 / 10");

    await textarea.fill("Hello");

    await expect.element(screen.getByText("5 / 10")).toBeVisible();
  });

  it("shows only the count without maxLength, and flags a value over the limit", async () => {
    const screen = await render(
      <>
        <Textarea aria-label="Notes" defaultValue="abc" showCount />
        <Textarea aria-label="Title" maxLength={3} readOnly showCount value="too long" />
      </>,
    );

    await expect.element(screen.getByText("3", { exact: true })).toBeVisible();
    await expect.element(screen.getByText("8 / 3")).toHaveAttribute("data-over", "true");
  });

  it("takes a translated counter from the provider", async () => {
    const screen = await render(
      <InputsConfigProvider labels={{ characterCount: (count, max) => `${count} din ${max}` }}>
        <Textarea aria-label="Bio" defaultValue="Hi" maxLength={10} showCount />
      </InputsConfigProvider>,
    );

    await expect.element(screen.getByText("2 din 10")).toBeVisible();
  });

  it("grows with its content and scrolls after maxRows", async () => {
    const screen = await render(<Textarea aria-label="Notes" autoResize maxRows={4} rows={1} />);
    const textarea = screen.getByRole("textbox").element() as HTMLTextAreaElement;
    const lineHeight = Number.parseFloat(getComputedStyle(textarea).lineHeight);
    const empty = textarea.offsetHeight;

    await screen.getByRole("textbox").fill("one\ntwo\nthree");
    const threeLines = textarea.offsetHeight;

    expect(threeLines).toBeGreaterThan(empty);
    expect(textarea.style.overflowY).toBe("hidden");

    await screen.getByRole("textbox").fill("1\n2\n3\n4\n5\n6\n7\n8");

    expect(textarea.offsetHeight).toBeGreaterThan(threeLines);
    expect(textarea.offsetHeight).toBeLessThan(threeLines + 2 * lineHeight);
    expect(textarea.style.overflowY).toBe("auto");
  });

  it("styles the parts from outside", async () => {
    const screen = await render(
      <Textarea
        aria-label="Styled"
        classNames={{ count: "counter", root: "shell", textarea: "area" }}
        showCount
        styles={{ textarea: { fontFamily: "monospace" } }}
        variant="ghost"
      />,
    );
    const textarea = screen.getByRole("textbox").element() as HTMLTextAreaElement;

    expect(textarea).toHaveClass("rc-textarea__control", "area");
    expect(textarea.style.fontFamily).toBe("monospace");
    expect(textarea.closest(".shell")).toHaveAttribute("data-variant", "ghost");
    await expect.element(screen.getByText("0")).toHaveClass("rc-textarea__count", "counter");
  });
});
