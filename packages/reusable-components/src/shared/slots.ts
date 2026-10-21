import type { CSSProperties } from "react";

import { cx } from "./class-names";

export type SlotResolver<TSlot extends string> = (
  name: TSlot,
  baseClassName: string,
  baseStyle?: CSSProperties,
) => { className: string; style?: CSSProperties };

export function createSlotResolver<TSlot extends string>(
  classNames: Partial<Record<TSlot, string>> = {},
  styles: Partial<Record<TSlot, CSSProperties>> = {},
  unstyled = false,
): SlotResolver<TSlot> {
  return (name, baseClassName, baseStyle) => ({
    className: cx(!unstyled && baseClassName, classNames[name]),
    style: baseStyle || styles[name] ? { ...baseStyle, ...styles[name] } : undefined,
  });
}
