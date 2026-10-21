"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { cx } from "../../../shared/class-names";
import { useGridContext } from "../context";
import type { LoadingOverlayOptions } from "../types";

export function Spinner({ className, style }: { className?: string; style?: CSSProperties }) {
  return <span aria-hidden="true" className={cx("rc-spinner", className)} style={style} />;
}

export function LoadingOverlay({ active, options }: { active: boolean; options: LoadingOverlayOptions }) {
  const { css, labels, slot } = useGridContext();
  const visible = useDelayedFlag(active, {
    delayMs: options.delayMs ?? 150,
    minDurationMs: options.minDurationMs ?? 300,
  });

  return visible ? (
    <div {...slot("overlay", "rc-grid__overlay")} role="status">
      {options.content ?? (
        <>
          {options.spinner ?? <Spinner {...slot("spinner", "")} />}
          <span className={css("rc-visually-hidden")}>{labels.loading}</span>
        </>
      )}
    </div>
  ) : null;
}

export function useDelayedFlag(active: boolean, { delayMs, minDurationMs }: { delayMs: number; minDurationMs: number }) {
  const [visible, setVisible] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    if (active === visible) {
      return;
    }

    const wait = active ? delayMs : Math.max(0, minDurationMs - (Date.now() - shownAt.current));
    const timer = setTimeout(() => {
      shownAt.current = Date.now();
      setVisible(active);
    }, wait);

    return () => clearTimeout(timer);
  }, [active, delayMs, minDurationMs, visible]);

  return visible;
}
