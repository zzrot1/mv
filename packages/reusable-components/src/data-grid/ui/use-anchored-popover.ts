"use client";

import { useEffect, useId, useRef, type ToggleEvent } from "react";

import { placePopover } from "./place-popover";

type AnchoredPopoverOptions = {
  align?: "start" | "center" | "end";
  // What gets focus once the popover is open.
  focusSelector: string;
};

// A native popover (`popover="auto"`) opened by a `popoverTarget` button: the
// browser handles Escape, outside clicks and focus return; this keeps it next
// to its trigger while the page scrolls or resizes.
export function useAnchoredPopover({ align, focusSelector }: AnchoredPopoverOptions) {
  const popoverId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const stopFollowing = useRef<(() => void) | null>(null);

  useEffect(() => () => stopFollowing.current?.(), []);

  function onToggle(event: ToggleEvent<HTMLDivElement>) {
    stopFollowing.current?.();
    stopFollowing.current = null;

    const popover = event.currentTarget;
    const trigger = triggerRef.current;

    if (event.newState !== "open" || !trigger) {
      return;
    }

    const place = () => placePopover(popover, trigger, align);

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    stopFollowing.current = () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };

    popover.querySelector<HTMLElement>(focusSelector)?.focus();
  }

  return { onToggle, popoverId, triggerRef };
}
