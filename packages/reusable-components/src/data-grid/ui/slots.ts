import type { CSSProperties } from "react";

import { cx } from "../../shared/class-names";
import type { GridClassNames, GridSlot, GridStyles } from "./types";

export type SlotProps = { className: string; style?: CSSProperties };

export type SlotResolver = (
  name: GridSlot,
  baseClassName: string,
  baseStyle?: CSSProperties,
) => SlotProps;

// The consumer's class and inline style for a part come after the built-in ones.
export function createSlotResolver(
  classNames: GridClassNames = {},
  styles: GridStyles = {},
): SlotResolver {
  return (name, baseClassName, baseStyle) => {
    const style = baseStyle || styles[name] ? { ...baseStyle, ...styles[name] } : undefined;

    return { className: cx(baseClassName, classNames[name]), style };
  };
}
