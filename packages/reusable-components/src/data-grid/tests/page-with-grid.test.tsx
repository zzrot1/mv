import { composeStories } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import * as catalogStories from "../stories/catalog-light.stories";
import * as teamStories from "../stories/team-dark.stories";

const { Overview: BookCatalog } = composeStories(catalogStories);
const { Overview: TeamDirectory } = composeStories(teamStories);

describe("PageWithGrid, rendered from its stories", () => {
  it("marks an action busy while it waits for its confirmation, and keeps focus on it", async () => {
    const confirm = fn(() => new Promise<boolean>(() => {}));
    const screen = await render(<TeamDirectory confirm={confirm} />);
    const remove = screen.getByRole("button", { name: "Remove Bogdan Ionescu" });

    await remove.click();

    await expect.element(remove).toHaveAttribute("aria-disabled", "true");
    await expect.element(remove).toHaveFocus();
    (remove.element() as HTMLButtonElement).click();
    expect(confirm).toHaveBeenCalledOnce();
  });

  it("keeps the selection across pages and hands every selected row to the bulk action", async () => {
    const onDeleteMany = fn();
    const screen = await render(<BookCatalog onDeleteMany={onDeleteMany} />);

    await screen.getByRole("checkbox", { name: "Select Baltagul" }).click();
    await screen.getByRole("button", { name: "Next page" }).click();
    await screen.getByRole("checkbox", { name: "Select A Brief History of Time" }).click();

    await expect.element(screen.getByText("2 selected")).toBeVisible();
    await screen.getByRole("button", { name: "Delete selected" }).click();

    await vi.waitFor(() =>
      expect(onDeleteMany).toHaveBeenCalledWith([
        expect.objectContaining({ title: "Baltagul" }),
        expect.objectContaining({ title: "A Brief History of Time" }),
      ]),
    );
  });

  it("goes back to the first page when the search changes", async () => {
    const screen = await render(<BookCatalog />);

    await screen.getByRole("button", { name: "Next page" }).click();
    await expect.element(screen.getByText("Page 2 of 3")).toBeVisible();

    await screen.getByRole("searchbox", { name: "Search" }).fill("rebreanu");

    await expect.element(screen.getByText("Page 1 of 1")).toBeVisible();
    await expect.element(screen.getByText("1–2 of 2")).toBeVisible();
  });

  it("reads the genre options from the loaded rows", async () => {
    const screen = await render(<BookCatalog />);
    const select = screen.getByRole("combobox", { name: "Filter by Genre" }).element() as HTMLSelectElement;

    expect([...select.options].slice(1).map((option) => option.text)).toEqual([
      "Fiction",
      "History",
      "Poetry",
      "Science",
    ]);
  });

  it("takes props on top of the story's args", async () => {
    const screen = await render(<BookCatalog defaultPageSize={5} pageSizeOptions={[5, 10]} />);

    await expect.element(screen.getByText("1–5 of 23")).toBeVisible();
    await expect.element(screen.getByText("Page 1 of 5")).toBeVisible();
  });

  it("renders the dark story with its inline actions", async () => {
    const onMessage = fn();
    const screen = await render(<TeamDirectory onMessage={onMessage} />);
    const page = screen.container.querySelector<HTMLElement>(".rc-page")!;

    expect(getComputedStyle(page).colorScheme).toBe("dark");

    await screen.getByRole("button", { name: "Message Ana Pop" }).click();

    expect(onMessage).toHaveBeenCalledWith(expect.objectContaining({ name: "Ana Pop" }));
    await expect.element(screen.getByRole("button", { name: "Message Cristina Marin" })).toBeDisabled();
  });
});
