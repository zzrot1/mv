"use client";

import type { MouseEvent, ReactNode } from "react";

import { ChevronDownIcon } from "../shared/icons";
import { useAnchoredPopover } from "../shared/use-anchored-popover";
import type { SidePanelItem, SidePanelProps } from "./side-panel";

export function AccountMenu({
  avatar,
  description,
  header,
  menu,
  name,
  renderItem,
}: NonNullable<SidePanelProps["account"]> & { renderItem: (item: SidePanelItem) => ReactNode }) {
  const { onToggle, popoverId, triggerRef } = useAnchoredPopover({ focusSelector: "a, button" });

  function closeAfterChoice(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as Element).closest("a, button")) {
      event.currentTarget.hidePopover();
    }
  }

  return (
    <div className="rc-side-panel__account">
      <button
        className="rc-side-panel__account-trigger"
        data-tooltip={name}
        popoverTarget={popoverId}
        ref={triggerRef}
        type="button"
      >
        <span aria-hidden="true" className="rc-side-panel__avatar">
          {avatar ?? initials(name)}
        </span>
        <span className="rc-side-panel__label rc-side-panel__account-text">
          <span className="rc-side-panel__account-name">{name}</span>
          {description ? <span className="rc-side-panel__account-description">{description}</span> : null}
        </span>
        <ChevronDownIcon className="rc-side-panel__chevron" />
      </button>
      <div
        className="rc-side-panel__menu"
        id={popoverId}
        onClick={closeAfterChoice}
        onToggle={onToggle}
        popover="auto"
      >
        {header ? <div className="rc-side-panel__menu-header">{header}</div> : null}
        {menu.map((group, index) => (
          <div className="rc-side-panel__menu-group" key={index}>
            {group.map(renderItem)}
          </div>
        ))}
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
