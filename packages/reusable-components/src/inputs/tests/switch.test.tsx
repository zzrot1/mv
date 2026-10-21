import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { Switch } from "../ui/components/checkbox";

describe("Switch", () => {
  it("is a switch that turns on and off", async () => {
    const onCheckedChange = vi.fn();
    const screen = await render(<Switch label="Wi-Fi" onCheckedChange={onCheckedChange} />);
    const toggle = screen.getByRole("switch", { name: "Wi-Fi" });

    await expect.element(toggle).not.toBeChecked();
    await toggle.click();

    await expect.element(toggle).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it("moves the thumb when on", async () => {
    const screen = await render(<Switch label="Dark mode" />);
    const toggle = screen.getByRole("switch");
    const offset = () => new DOMMatrix(getComputedStyle(toggle.element(), "::before").transform).m41;

    expect(offset()).toBe(0);
    await toggle.click();
    await expect.poll(offset).toBeGreaterThan(0);
  });

  it("submits with its form", async () => {
    const screen = await render(
      <form aria-label="Preferences">
        <Switch defaultChecked label="News" name="news" value="yes" />
        <Switch label="Ads" name="ads" value="yes" />
      </form>,
    );
    const data = new FormData(screen.getByRole("form").element() as HTMLFormElement);

    expect(data.get("news")).toBe("yes");
    expect(data.get("ads")).toBeNull();
  });

  it("takes its size and classes from outside", async () => {
    const screen = await render(
      <Switch classNames={{ input: "track", label: "caption" }} label="Compact" size="sm" />,
    );
    const toggle = screen.getByRole("switch");

    await expect.element(toggle).toHaveClass("rc-switch__control", "track");
    await expect.element(screen.getByText("Compact")).toHaveClass("rc-switch__label", "caption");
    expect(getComputedStyle(toggle.element()).width).toBe("28px");
  });
});
