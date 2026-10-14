import type { CSSProperties } from "react";

export type GridTheme = {
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

export const themeVariables: Readonly<Record<keyof GridTheme, string>> = {
  accent: "--rc-accent",
  background: "--rc-background",
  border: "--rc-border",
  cellPadding: "--rc-cell-padding",
  controlHeight: "--rc-control-height",
  destructive: "--rc-destructive",
  destructiveForeground: "--rc-destructive-foreground",
  fontFamily: "--rc-font-family",
  fontSize: "--rc-font-size",
  foreground: "--rc-foreground",
  headerBackground: "--rc-header-background",
  headerForeground: "--rc-header-foreground",
  input: "--rc-input",
  muted: "--rc-muted",
  mutedForeground: "--rc-muted-foreground",
  overlayBackground: "--rc-overlay-background",
  popover: "--rc-popover",
  popoverForeground: "--rc-popover-foreground",
  primary: "--rc-primary",
  primaryForeground: "--rc-primary-foreground",
  radius: "--rc-radius",
  ring: "--rc-ring",
  rowHeight: "--rc-row-height",
  rowHoverBackground: "--rc-row-hover-background",
  rowSelectedBackground: "--rc-row-selected-background",
  shadow: "--rc-shadow",
  spinnerColor: "--rc-spinner-color",
};

export function themeToStyle(theme: GridTheme = {}): CSSProperties {
  const style: Record<string, string> = {};

  for (const key of Object.keys(theme) as (keyof GridTheme)[]) {
    const value = theme[key];

    if (value) {
      style[themeVariables[key]] = value;
    }
  }

  return style as CSSProperties;
}
