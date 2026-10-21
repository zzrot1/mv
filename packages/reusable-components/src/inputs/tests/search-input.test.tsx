import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { Field } from "../ui/components/field";
import { SearchInput } from "../ui/components/search-input";
import { InputsConfigProvider } from "../ui/context";

describe("SearchInput", () => {
  it("fires the native onChange when cleared, and ignores Enter while composing", async () => {
    const onChange = vi.fn();
    const onSearch = vi.fn();
    const screen = await render(
      <SearchInput aria-label="Search" defaultValue="dune" onChange={onChange} onSearch={onSearch} />,
    );

    await screen.getByRole("button", { name: "Clear search" }).click();
    expect(onChange).toHaveBeenCalledOnce();
    await expect.element(screen.getByRole("searchbox")).toHaveValue("");

    screen
      .getByRole("searchbox")
      .element()
      .dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, isComposing: true, key: "Enter" }));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("is a searchbox whose clear button shows up once there is text", async () => {
    const onClear = vi.fn();
    const onValueChange = vi.fn();
    const screen = await render(
      <SearchInput aria-label="Search books" onClear={onClear} onValueChange={onValueChange} />,
    );
    const box = screen.getByRole("searchbox", { name: "Search books" });
    const clear = screen.getByRole("button", { name: "Clear search" });

    expect(clear.query()).toBeNull();
    expect(screen.container.querySelector("svg.rc-search__icon")).not.toBeNull();

    await box.fill("dune");
    expect(onValueChange).toHaveBeenLastCalledWith("dune");
    await clear.click();

    await expect.element(box).toHaveValue("");
    await expect.element(box).toHaveFocus();
    expect(onClear).toHaveBeenCalledOnce();
    expect(clear.query()).toBeNull();
  });

  it("clears with Escape and searches with Enter", async () => {
    const onSearch = vi.fn();
    const screen = await render(<SearchInput aria-label="Search" onSearch={onSearch} />);
    const box = screen.getByRole("searchbox");

    await box.fill("tolkien");
    await userEvent.keyboard("{Enter}");
    expect(onSearch).toHaveBeenCalledWith("tolkien");

    await userEvent.keyboard("{Escape}");
    await expect.element(box).toHaveValue("");
  });

  it("can be controlled and forwards the ref", async () => {
    const ref = createRef<HTMLInputElement>();

    function Controlled() {
      const [query, setQuery] = useState("start");

      return (
        <>
          <SearchInput aria-label="Search" onValueChange={setQuery} ref={ref} value={query} />
          <p>Query: {query}</p>
        </>
      );
    }

    const screen = await render(<Controlled />);

    expect(ref.current).toBe(screen.getByRole("searchbox").element());
    await screen.getByRole("button", { name: "Clear search" }).click();
    await expect.element(screen.getByRole("searchbox")).toHaveValue("");
    await screen.getByRole("searchbox").fill("next");
    await expect.element(screen.getByText("Query: next")).toBeVisible();
  });

  it("takes a custom icon, no icon, and can turn clearing off", async () => {
    const screen = await render(
      <>
        <SearchInput aria-label="Custom" defaultValue="x" icon={<span>🔎</span>} />
        <SearchInput aria-label="Bare" clearable={false} defaultValue="x" icon={null} />
      </>,
    );

    await expect.element(screen.getByText("🔎")).toBeVisible();
    expect(screen.getByRole("button", { name: "Clear search" }).elements()).toHaveLength(1);

    const bare = screen.getByRole("searchbox", { name: "Bare" }).element();

    expect(bare.closest("[data-size]")!.querySelector(".rc-input__prefix")).toBeNull();
  });

  it("leaves Escape alone when read-only or when the consumer handles it", async () => {
    const screen = await render(
      <>
        <SearchInput aria-label="Fixed" defaultValue="keep" readOnly />
        <SearchInput
          aria-label="Handled"
          defaultValue="keep"
          onKeyDown={(event) => event.preventDefault()}
        />
      </>,
    );

    for (const name of ["Fixed", "Handled"]) {
      const box = screen.getByRole("searchbox", { name });

      await box.click();
      await userEvent.keyboard("{Escape}");
      await expect.element(box).toHaveValue("keep");
    }

    expect(screen.getByRole("button", { name: "Clear search" }).elements()).toHaveLength(1);
  });

  it("goes back to its default value on a form reset", async () => {
    const screen = await render(
      <form>
        <SearchInput aria-label="Search" defaultValue="dune" />
        <button type="reset">Reset</button>
      </form>,
    );

    await screen.getByRole("searchbox").fill("tolkien");
    await screen.getByRole("button", { name: "Reset" }).click();

    await expect.element(screen.getByRole("searchbox")).toHaveValue("dune");
  });

  it("names its clear button from the provider, and can't be cleared in a disabled Field", async () => {
    const screen = await render(
      <InputsConfigProvider labels={{ clearSearch: "Șterge" }}>
        <SearchInput aria-label="Caută" defaultValue="dune" />
        <Field disabled label="Blocat">
          <SearchInput defaultValue="dune" />
        </Field>
      </InputsConfigProvider>,
    );

    expect(screen.getByRole("button", { name: "Șterge" }).elements()).toHaveLength(1);
  });
});
