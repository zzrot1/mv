import type { CSSProperties } from "react";

/** The `--rc-*` tokens, by camelCase name: `cellPadding` sets `--rc-cell-padding`. */
export type Theme = {
  accent?: string;
  background?: string;
  border?: string;
  cellPadding?: string;
  controlHeight?: string;
  destructive?: string;
  destructiveForeground?: string;
  fontFamily?: string;
  fontSize?: string;
  foreground?: string;
  headerBackground?: string;
  headerForeground?: string;
  input?: string;
  muted?: string;
  mutedForeground?: string;
  overlayBackground?: string;
  popover?: string;
  popoverForeground?: string;
  primary?: string;
  primaryForeground?: string;
  radius?: string;
  ring?: string;
  rowHeight?: string;
  rowHoverBackground?: string;
  rowSelectedBackground?: string;
  shadow?: string;
  spinnerColor?: string;
};

export type ColorScheme = "light" | "dark" | "system";

const UNSAFE_VALUE = /[;{}<>\\]|\/\*|url\(|image(-set)?\(|@import/i;

export function themeToStyle(theme: Theme = {}): CSSProperties {
  return Object.fromEntries(
    Object.entries(theme)
      .filter(([, value]) => typeof value === "string" && value !== "" && !UNSAFE_VALUE.test(value))
      .map(([key, value]) => [`--rc-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, value]),
  );
}
