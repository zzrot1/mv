import { composeStories } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { fn } from "storybook/test";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { SidePanel } from "../side-panel";
import * as stories from "../stories/side-panel.stories";

const { Expanded } = composeStories(stories);

function RouterLink(props: ComponentProps<"a">) {
  return <a data-router="" {...props} />;
}

describe("SidePanel", () => {
  it("renders internal links with linkAs, absolute URLs in a new tab and the rest as buttons", async () => {
    const screen = await render(<Expanded linkAs={RouterLink} />);

    await expect.element(screen.getByRole("link", { name: "Home" })).toHaveAttribute("data-router");
    await expect.element(screen.getByRole("link", { name: "Roadmap" })).not.toHaveAttribute("data-router");
    await expect.element(screen.getByRole("link", { name: "Roadmap" })).toHaveAttribute("rel", "noopener noreferrer");
    await expect.element(screen.getByRole("button", { name: "Feature requests" })).toHaveAttribute("type", "button");
  });

  it("runs onClose after a navigation and from its close button", async () => {
    const onClose = fn();
    const screen = await render(<Expanded onClose={onClose} />);

    await screen.getByRole("link", { name: "Home" }).click();
    await screen.getByRole("button", { name: "Close menu" }).click();

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("stays collapsed while controlled, and reports the toggle", async () => {
    const onCollapsedChange = fn();
    const screen = await render(<Expanded collapsed onCollapsedChange={onCollapsedChange} />);

    await screen.getByRole("button", { name: "Expand" }).click();

    expect(onCollapsedChange).toHaveBeenCalledWith(false);
    expect(screen.container.querySelector(".rc-side-panel")).toHaveAttribute("data-collapsed");
  });

  it("hides the logo and the extra content while collapsed", async () => {
    const screen = await render(
      <Expanded defaultCollapsed>
        <p>Getting started</p>
      </Expanded>,
    );

    expect(screen.getByText("Acme", { exact: true }).query()).toBeNull();
    expect(screen.getByText("Getting started").query()).toBeNull();
  });

  it("takes its texts from labels and falls back to the name's initials", async () => {
    const screen = await render(<Expanded labels={{ collapse: "Restrânge", navigation: "Meniu" }} />);

    await expect.element(screen.getByRole("button", { name: "Restrânge" })).toBeVisible();
    await expect.element(screen.getByRole("navigation", { name: "Meniu" })).toBeVisible();
    expect(screen.container.querySelector(".rc-side-panel__avatar")).toHaveTextContent("AS");
  });

  it("closes the account menu after a choice", async () => {
    const screen = await render(<Expanded />);

    await screen.getByRole("button", { name: /Acme Studio/ }).click();
    await screen.getByRole("link", { name: "Billing" }).click();

    await expect.element(screen.getByRole("link", { name: "Billing" })).not.toBeInTheDocument();
  });

  it("opens any absolute URL in a new tab, and leaves out the toggle when not collapsible", async () => {
    const screen = await render(
      <SidePanel
        className="app-nav"
        collapsible={false}
        items={[
          { href: "HTTPS://example.com/docs", label: "Docs" },
          { href: "//status.example.com", label: "Status" },
        ]}
        sections={[{ items: [{ label: "Help" }] }]}
        style={{ width: 300 }}
      />,
    );
    const root = screen.container.querySelector<HTMLElement>(".rc-side-panel")!;

    for (const name of ["Docs", "Status"]) {
      await expect.element(screen.getByRole("link", { name })).toHaveAttribute("target", "_blank");
    }

    expect(screen.getByRole("button", { name: "Collapse" }).query()).toBeNull();
    expect(screen.container.querySelector(".rc-side-panel__section-label")).toBeNull();
    expect(root).toHaveClass("app-nav");
    expect(root.style.width).toBe("300px");
  });

  it("keeps the account menu open when its header is clicked, and shows a single name's initial", async () => {
    const screen = await render(
      <SidePanel account={{ header: <p>Signed in</p>, menu: [[{ label: "Log out" }]], name: "Ana" }} items={[]} />,
    );

    expect(screen.container.querySelector(".rc-side-panel__avatar")).toHaveTextContent("A");
    await screen.getByRole("button", { name: /Ana/ }).click();
    await screen.getByText("Signed in").click();

    await expect.element(screen.getByRole("button", { name: "Log out" })).toBeVisible();
  });
});
