import { describe, expect, it, vi } from "vitest";
import { render, renderHook } from "vitest-browser-react";

import { NumberInput } from "../ui/components/number-input";
import { TextInput } from "../ui/components/text-input";
import { InputsConfigProvider } from "../ui/context";
import { createSlotResolver } from "../../shared/slots";
import { themeToStyle } from "../../shared/theme";
import { useControllableState } from "../../shared/use-controllable-state";

describe("InputsConfigProvider", () => {
  it("gives every input its size, variant and labels; nested providers merge", async () => {
    const screen = await render(
      <InputsConfigProvider labels={{ increment: "Mai mult" }} size="sm" variant="ghost">
        <InputsConfigProvider labels={{ decrement: "Mai puțin" }}>
          <NumberInput aria-label="Count" />
          <TextInput aria-label="Own" size="lg" variant="filled" />
        </InputsConfigProvider>
      </InputsConfigProvider>,
    );
    const count = screen.getByRole("spinbutton").element().closest("[data-size]")!;
    const own = screen.getByRole("textbox", { name: "Own" }).element().closest("[data-size]")!;

    await expect.element(screen.getByRole("button", { name: "Mai mult" })).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Mai puțin" })).toBeVisible();
    expect(count).toHaveAttribute("data-size", "sm");
    expect(count).toHaveAttribute("data-variant", "ghost");
    expect(own).toHaveAttribute("data-size", "lg");
    expect(own).toHaveAttribute("data-variant", "filled");
  });
});

describe("themeToStyle", () => {
  it("maps tokens to --rc-* variables and skips empty ones", () => {
    expect(themeToStyle({ cellPadding: "4px", destructive: "", primary: "teal", radius: "2px" })).toEqual({
      "--rc-cell-padding": "4px",
      "--rc-primary": "teal",
      "--rc-radius": "2px",
    });
    expect(themeToStyle()).toEqual({});
    expect(themeToStyle({ primary: "red; background: url(//evil)" })).toEqual({});
    expect(themeToStyle({ background: 'image-set("https://evil.example/x.png" 1x)' })).toEqual({});
  });
});

describe("createSlotResolver", () => {
  it("adds the consumer's class and style after the built-in ones", () => {
    const slot = createSlotResolver<"input">({ input: "mine" }, { input: { color: "red" } });

    expect(slot("input", "rc-base", { margin: 0 })).toEqual({
      className: "rc-base mine",
      style: { color: "red", margin: 0 },
    });
  });

  it("drops the built-in class when unstyled, and leaves style out when there is none", () => {
    const slot = createSlotResolver<"input">({}, {}, true);

    expect(slot("input", "rc-base")).toEqual({ className: "", style: undefined });
  });
});

describe("useControllableState", () => {
  it("keeps its own state when uncontrolled", async () => {
    const onChange = vi.fn();
    const { act, result } = await renderHook(() =>
      useControllableState({ defaultValue: 1, onChange }),
    );

    await act(() => result.current[1](2));

    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("follows the value prop when controlled", async () => {
    const onChange = vi.fn();
    const { act, result } = await renderHook(() =>
      useControllableState<number | null>({ defaultValue: 1, onChange, value: null }),
    );

    await act(() => result.current[1](5));

    expect(result.current[0]).toBeNull();
    expect(onChange).toHaveBeenCalledWith(5);
  });
});
