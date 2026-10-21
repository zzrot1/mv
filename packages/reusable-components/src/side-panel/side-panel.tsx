"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";

import { cx } from "../shared/class-names";
import { PanelLeftIcon, XIcon } from "../shared/icons";
import { useControllableState } from "../shared/use-controllable-state";
import { AccountMenu } from "./account-menu";
import "./styles.css";

export type SidePanelItem = {
  label: string;
  icon?: ReactNode;
  /** A link when set (absolute URLs open in a new tab), a button otherwise. */
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: ReactNode;
};

const defaultLabels = { close: "Close menu", collapse: "Collapse", expand: "Expand", navigation: "Main" };

export type SidePanelProps = {
  items: readonly SidePanelItem[];
  /** Groups above the account, each with an optional title. */
  sections?: readonly { label?: string; items: readonly SidePanelItem[] }[];
  /** The account button at the bottom; its menu groups are split by a line. */
  account?: {
    name: string;
    description?: ReactNode;
    /** Defaults to the name's initials. */
    avatar?: ReactNode;
    header?: ReactNode;
    menu: readonly (readonly SidePanelItem[])[];
  };
  /** The logo slot. */
  header?: ReactNode;
  /** Shown above the sections while expanded. */
  children?: ReactNode;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  collapsible?: boolean;
  /** Adds a close button and runs after every navigation, for a mobile drawer. */
  onClose?: () => void;
  /** Renders internal links, e.g. Next.js `Link`. */
  linkAs?: ElementType;
  labels?: Partial<typeof defaultLabels>;
  className?: string;
  style?: CSSProperties;
};

export function SidePanel({
  account,
  children,
  className,
  collapsible = true,
  defaultCollapsed = false,
  header,
  items,
  labels,
  linkAs = "a",
  onClose,
  onCollapsedChange,
  sections = [],
  style,
  ...props
}: SidePanelProps) {
  const [collapsed, setCollapsed] = useControllableState({
    defaultValue: defaultCollapsed,
    onChange: onCollapsedChange,
    value: props.collapsed,
  });
  const text = { ...defaultLabels, ...labels };
  const toggleLabel = collapsed ? text.expand : text.collapse;
  const renderItem = (item: SidePanelItem) => (
    <PanelItem item={item} key={item.label} linkAs={linkAs} onNavigate={onClose} />
  );

  return (
    <div className={cx("rc-side-panel", className)} data-collapsed={collapsed || undefined} style={style}>
      <div className="rc-side-panel__header">
        {collapsed ? null : header}
        {collapsible ? (
          <button
            aria-label={toggleLabel}
            className="rc-side-panel__toggle"
            data-tooltip={toggleLabel}
            onClick={() => setCollapsed(!collapsed)}
            type="button"
          >
            <PanelLeftIcon size={20} />
          </button>
        ) : null}
        {onClose ? (
          <button aria-label={text.close} className="rc-side-panel__close" onClick={onClose} type="button">
            <XIcon size={20} />
          </button>
        ) : null}
      </div>
      <nav aria-label={text.navigation} className="rc-side-panel__nav">
        {items.map(renderItem)}
      </nav>
      <div className="rc-side-panel__footer">
        {collapsed ? null : children}
        {sections.map((section, index) => (
          <div className="rc-side-panel__section" key={section.label ?? index}>
            {section.label ? <p className="rc-side-panel__section-label">{section.label}</p> : null}
            {section.items.map(renderItem)}
          </div>
        ))}
      </div>
      {account ? <AccountMenu {...account} renderItem={renderItem} /> : null}
    </div>
  );
}

function PanelItem({
  item,
  linkAs,
  onNavigate,
}: {
  item: SidePanelItem;
  linkAs: ElementType;
  onNavigate?: () => void;
}) {
  const external = item.href !== undefined && /^(https?:)?\/\//i.test(item.href);
  const Element = item.href === undefined ? "button" : external ? "a" : linkAs;

  return (
    <Element
      {...(item.href === undefined ? { type: "button" } : { href: item.href })}
      {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
      aria-current={item.active ? "page" : undefined}
      className="rc-side-panel__item"
      data-tooltip={item.label}
      onClick={() => {
        item.onClick?.();
        onNavigate?.();
      }}
    >
      {item.icon}
      <span className="rc-side-panel__label">{item.label}</span>
      {item.badge ? <span className="rc-side-panel__badge">{item.badge}</span> : null}
    </Element>
  );
}
