const GAP = 6;
const VIEWPORT_MARGIN = 8;

export function placePopover(
  popover: HTMLElement,
  trigger: HTMLElement,
  align: "start" | "center" | "end" = "start",
) {
  const anchor = trigger.getBoundingClientRect();
  const height = popover.offsetHeight;
  const width = popover.offsetWidth;

  const preferredLeft = { center: anchor.left + (anchor.width - width) / 2, end: anchor.right - width, start: anchor.left }[align];
  const left = clamp(
    preferredLeft,
    VIEWPORT_MARGIN,
    window.innerWidth - width - VIEWPORT_MARGIN,
  );

  const below = anchor.bottom + GAP;
  const fitsBelow = below + height <= window.innerHeight - VIEWPORT_MARGIN;
  const top = fitsBelow
    ? below
    : Math.max(VIEWPORT_MARGIN, anchor.top - GAP - height);

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}
