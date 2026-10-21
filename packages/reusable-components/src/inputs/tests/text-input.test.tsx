import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { TextInput } from "../ui/components/text-input";

function rootOf(container: HTMLElement) {
  return container.querySelector<HTMLElement>("[data-size]")!;
}

describe("TextInput", () => {
  it("keeps an aria-invalid passed by the consumer", async () => {
    const screen = await render(<TextInput aria-invalid aria-label="Name" />);

    await expect.element(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("passes native props and the ref to the <input>", async () => {
    const ref = createRef<HTMLInputElement>();
    const screen = await render(
      <TextInput aria-label="Name" name="name" placeholder="Your name" ref={ref} type="email" />,
    );
    const input = screen.getByRole("textbox", { name: "Name" });

    await expect.element(input).toHaveAttribute("placeholder", "Your name");
    await expect.element(input).toHaveAttribute("name", "name");
    await expect.element(input).toHaveAttribute("type", "email");
    expect(ref.current).toBe(input.element());
  });

  it("reports the typed text through onChange and onValueChange", async () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    const screen = await render(
      <TextInput aria-label="Name" onChange={onChange} onValueChange={onValueChange} />,
    );

    await screen.getByRole("textbox").fill("Ada");

    expect(onValueChange).toHaveBeenLastCalledWith("Ada");
    expect(onChange).toHaveBeenCalled();
  });

  it("can be controlled", async () => {
    function Shouting() {
      const [value, setValue] = useState("");

      return (
        <TextInput
          aria-label="Code"
          onValueChange={(next) => setValue(next.toUpperCase())}
          value={value}
        />
      );
    }

    const screen = await render(<Shouting />);

    await screen.getByRole("textbox").fill("abc");

    await expect.element(screen.getByRole("textbox")).toHaveValue("ABC");
  });

  it("shows a prefix and a suffix, and pressing them focuses the input", async () => {
    const screen = await render(<TextInput aria-label="Price" prefix="€" suffix="EUR" />);

    await screen.getByText("€").click();
    await expect.element(screen.getByRole("textbox")).toHaveFocus();
    await expect.element(screen.getByText("EUR")).toHaveClass("rc-input__suffix");
  });

  it("leaves focus alone when a button inside it is pressed", async () => {
    const screen = await render(
      <TextInput aria-label="Link" suffix={<button type="button">Copy</button>} />,
    );

    await screen.getByRole("button", { name: "Copy" }).click();

    await expect.element(screen.getByRole("button", { name: "Copy" })).toHaveFocus();
  });

  it("exposes size, variant, invalid and disabled as data attributes", async () => {
    const screen = await render(
      <TextInput aria-label="Name" disabled invalid size="lg" variant="filled" />,
    );
    const root = rootOf(screen.container);
    const input = screen.getByRole("textbox");

    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).toHaveAttribute("data-variant", "filled");
    expect(root).toHaveAttribute("data-invalid", "true");
    expect(root).toHaveAttribute("data-disabled", "true");
    await expect.element(input).toBeDisabled();
    await expect.element(input).toHaveAttribute("aria-invalid", "true");
  });

  it("takes classes, inline styles and theme tokens from outside", async () => {
    const screen = await render(
      <TextInput
        aria-label="Handle"
        className="box"
        classNames={{ input: "field", prefix: "at", root: "shell" }}
        prefix="@"
        style={{ width: 220 }}
        styles={{ input: { letterSpacing: "2px" } }}
        theme={{ primary: "rebeccapurple", radius: "0px" }}
      />,
    );
    const root = rootOf(screen.container);
    const input = screen.getByRole("textbox").element() as HTMLInputElement;

    expect(root.className).toBe("rc-root rc-frame rc-input box shell");
    expect(root.style.width).toBe("220px");
    expect(root.style.getPropertyValue("--rc-radius")).toBe("0px");
    expect(root.style.getPropertyValue("--rc-primary")).toBe("rebeccapurple");
    expect(input.className).toBe("rc-input__control field");
    expect(input.style.letterSpacing).toBe("2px");
    await expect.element(screen.getByText("@")).toHaveClass("rc-input__prefix", "at");
  });

  it("drops every built-in class when unstyled", async () => {
    const screen = await render(
      <TextInput aria-label="Plain" className="mine" classNames={{ input: "my-input" }} unstyled />,
    );

    expect(rootOf(screen.container).className).toBe("mine");
    expect(screen.getByRole("textbox").element().className).toBe("my-input");
  });

  it("follows the given color scheme", async () => {
    const screen = await render(<TextInput aria-label="Dark" colorScheme="dark" />);
    const root = rootOf(screen.container);

    expect(root).toHaveAttribute("data-color-scheme", "dark");
    expect(getComputedStyle(root).colorScheme).toBe("dark");
  });

  it("starts from defaultValue and leaves out an empty prefix and suffix", async () => {
    const screen = await render(
      <TextInput aria-label="City" defaultValue="Cluj" prefix={[null, false]} suffix={[undefined]} />,
    );

    await expect.element(screen.getByRole("textbox")).toHaveValue("Cluj");
    expect(rootOf(screen.container).querySelector("span")).toBeNull();
  });
});
