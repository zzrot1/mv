"use client";

import type { CSSProperties } from "react";

import { cx } from "../../../shared/class-names";
import { useDataGridContext } from "../grid-context";
import type { LoadingOverlayOptions } from "../types";
import { useDelayedFlag } from "../use-delayed-flag";

const DEFAULT_DELAY_MS = 150;
const DEFAULT_MIN_DURATION_MS = 300;

export function Spinner({ className, style }: { className?: string; style?: CSSProperties }) {
  return <span aria-hidden="true" className={cx("rc-spinner", className)} style={style} />;
}

export function LoadingOverlay({
  active,
  options,
}: {
  active: boolean;
  options: LoadingOverlayOptions;
}) {
  const { labels, slot } = useDataGridContext();
  const visible = useDelayedFlag(active, {
    delayMs: options.delayMs ?? DEFAULT_DELAY_MS,
    minDurationMs: options.minDurationMs ?? DEFAULT_MIN_DURATION_MS,
  });

  if (!visible) {
    return null;
  }

  return (
    <div {...slot("overlay", "rc-grid__overlay")} role="status">
      {options.content ?? (
        <>
          {options.spinner ?? <Spinner {...slot("spinner", "")} />}
          <span className="rc-visually-hidden">{labels.loading}</span>
        </>
      )}
    </div>
  );
}
