import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { SidePanel } from "../side-panel";

const icon = (d: string) => (
  <svg
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
  >
    <path d={d} />
  </svg>
);

const logOut = fn();
const openFeedback = fn();

const meta = {
  args: {
    account: {
      description: "Professional plan",
      header: (
        <>
          <div style={{ color: "#666" }}>Signed in as</div>
          <strong>ana@example.com</strong>
        </>
      ),
      menu: [
        [
          { href: "#profile", icon: icon("M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"), label: "Profile & settings" },
          { href: "#billing", icon: icon("M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM2 10h20"), label: "Billing" },
        ],
        [{ icon: icon("M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"), label: "Log out", onClick: logOut }],
      ],
      name: "Acme Studio",
    },
    header: <strong style={{ fontSize: 22 }}>Acme</strong>,
    items: [
      { href: "#home", icon: icon("m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"), label: "Home" },
      { href: "#invoices", icon: icon("M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5M9 13h6M9 17h6"), label: "Invoices" },
      { href: "#clients", icon: icon("M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"), label: "Clients" },
      { active: true, badge: "Beta", href: "#contracts", icon: icon("M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"), label: "Contracts" },
      { href: "#settings", icon: icon("M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"), label: "Settings" },
    ],
    onCollapsedChange: fn(),
    sections: [
      {
        items: [
          { href: "https://example.com/roadmap", icon: icon("M9 3 3 6v15l6-3 6 3 6-3V3l-6 3zM9 3v15M15 6v15"), label: "Roadmap" },
          { icon: icon("M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"), label: "Feature requests", onClick: openFeedback },
        ],
        label: "Product",
      },
      {
        items: [{ badge: "Online", icon: icon("M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8"), label: "Support" }],
        label: "Help",
      },
    ],
  },
  component: SidePanel,
  decorators: [
    (Story) => (
      <div style={{ height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "fullscreen" },
  title: "Navigation/Side panel",
} satisfies Meta<typeof SidePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Contracts Beta" })).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("link", { name: "Roadmap" })).toHaveAttribute("target", "_blank");

    await userEvent.click(canvas.getByRole("button", { name: "Feature requests" }));
    await expect(openFeedback).toHaveBeenCalled();
  },
};

export const Collapsed: Story = {
  args: { defaultCollapsed: true },
  play: async ({ args, canvas, canvasElement }) => {
    const panel = canvasElement.querySelector<HTMLElement>(".rc-side-panel")!;

    await expect(canvas.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(canvas.queryByText("Acme")).toBeNull();
    await expect(panel.offsetWidth).toBe(80);

    await userEvent.click(canvas.getByRole("button", { name: "Expand" }));
    await expect(args.onCollapsedChange).toHaveBeenCalledWith(false);
    await waitFor(() => expect(panel.offsetWidth).toBe(280));
  },
};

export const AccountMenu: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Acme Studio/ }));
    await expect(await canvas.findByRole("link", { name: "Billing" })).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Log out" }));
    await expect(logOut).toHaveBeenCalled();
    await waitFor(() => expect(canvas.queryByRole("link", { name: "Billing" })).toBeNull());
  },
};

export const Dark: Story = {
  decorators: [
    (Story) => (
      <div className="dark" style={{ background: "#0a0a0a", height: "100%" }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector<HTMLElement>(".rc-side-panel")!;

    await expect(getComputedStyle(panel).colorScheme).toBe("dark");
  },
};
