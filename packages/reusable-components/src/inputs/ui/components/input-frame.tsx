"use client";

import { Children, type ComponentProps, type MouseEvent, type ReactNode } from "react";

const INTERACTIVE = "input, textarea, select, button, a[href], [tabindex]";

export function InputFrame({
  children,
  onMouseDown,
  prefix,
  prefixProps,
  suffix,
  suffixProps,
  ...props
}: Omit<ComponentProps<"div">, "prefix"> & {
  prefix?: ReactNode;
  prefixProps?: ComponentProps<"span">;
  suffix?: ReactNode;
  suffixProps?: ComponentProps<"span">;
}) {
  const start = Children.toArray(prefix);
  const end = Children.toArray(suffix);

  function handleMouseDown(event: MouseEvent<HTMLDivElement>) {
    onMouseDown?.(event);

    const control = event.currentTarget.querySelector<HTMLElement>("input, textarea, select");

    if (!event.defaultPrevented && control && !(event.target as HTMLElement).closest(INTERACTIVE)) {
      event.preventDefault();
      control.focus();
    }
  }

  return (
    <div {...props} onMouseDown={handleMouseDown}>
      {start.length ? <span {...prefixProps}>{start}</span> : null}
      {children}
      {end.length ? <span {...suffixProps}>{end}</span> : null}
    </div>
  );
}
