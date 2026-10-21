"use client";

import { useEffect, useEffectEvent, useLayoutEffect, type RefObject } from "react";

export function useAutoResize(ref: RefObject<HTMLTextAreaElement | null>, enabled: boolean, maxRows?: number) {
  const fit = useEffectEvent(() => {
    const textarea = ref.current;

    if (!textarea || !enabled) {
      return;
    }

    const style = getComputedStyle(textarea);
    const px = (value: string) => Number.parseFloat(value) || 0;
    const padding = px(style.paddingTop) + px(style.paddingBottom);
    const border = px(style.borderTopWidth) + px(style.borderBottomWidth);
    const lineHeight = px(style.lineHeight) || px(style.fontSize) * 1.5;
    const toHeight = (lines: number) => (style.boxSizing === "border-box" ? lines + padding + border : lines);

    textarea.style.height = "auto";

    const content = toHeight(textarea.scrollHeight - padding);
    const limit = maxRows === undefined ? Infinity : toHeight(maxRows * lineHeight);

    textarea.style.height = `${Math.min(content, limit)}px`;
    textarea.style.overflowY = content > limit ? "auto" : "hidden";
  });

  useLayoutEffect(() => fit());

  useEffect(() => {
    const textarea = ref.current;

    if (!textarea || !enabled) {
      return;
    }

    let width = textarea.offsetWidth;
    const observer = new ResizeObserver(() => {
      if (textarea.offsetWidth !== width) {
        width = textarea.offsetWidth;
        fit();
      }
    });

    observer.observe(textarea);

    return () => observer.disconnect();
  }, [enabled, ref]);
}
