"use client";

import { useEffect, useRef, useState } from "react";

// Turns on only after `delayMs` of `active`, then stays on at least
// `minDurationMs`, so a quick change never flashes a spinner.
export function useDelayedFlag(
  active: boolean,
  { delayMs, minDurationMs }: { delayMs: number; minDurationMs: number },
) {
  const [visible, setVisible] = useState(false);
  const shownAt = useRef(0);

  useEffect(() => {
    if (active && !visible) {
      const timer = setTimeout(() => {
        shownAt.current = Date.now();
        setVisible(true);
      }, delayMs);

      return () => clearTimeout(timer);
    }

    if (!active && visible) {
      const remaining = minDurationMs - (Date.now() - shownAt.current);
      const timer = setTimeout(() => setVisible(false), Math.max(0, remaining));

      return () => clearTimeout(timer);
    }
  }, [active, delayMs, minDurationMs, visible]);

  return visible;
}
