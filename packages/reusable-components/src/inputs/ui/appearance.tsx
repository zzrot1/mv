"use client";

import type { CSSProperties } from "react";

import { cx } from "../../shared/class-names";
import { createSlotResolver } from "../../shared/slots";
import { themeToStyle, type ColorScheme, type Theme } from "../../shared/theme";
import { useFieldContext, useInputLabels, useInputsConfig } from "./context";

import "../../shared/base.css";
import "./styles.css";

export type InputSize = "sm" | "md" | "lg";

export type InputVariant = "outline" | "filled" | "ghost";

/**
 * What every input accepts for styling. `className` and `style` go on the outer
 * element; every other part is reached by its slot name.
 */
export type InputAppearance<TSlot extends string> = {
  className?: string;
  style?: CSSProperties;
  classNames?: Partial<Record<TSlot | "root", string>>;
  styles?: Partial<Record<TSlot | "root", CSSProperties>>;
  theme?: Theme;
  size?: InputSize;
  variant?: InputVariant;
  /** Without it the input follows the surrounding `color-scheme` (and `.dark`). */
  colorScheme?: ColorScheme;
  unstyled?: boolean;
  invalid?: boolean;
};

/** Resolves the styling props (with the Field's and the provider's defaults) and returns the rest. */
export function useInputAppearance<
  TSlot extends string,
  TProps extends InputAppearance<TSlot> & { disabled?: boolean },
>(props: TProps, block: string) {
  const { className, classNames, colorScheme, invalid, size, style, styles, theme, unstyled, variant, ...rest } =
    props;
  const config = useInputsConfig();
  const field = useFieldContext();
  const isInvalid = invalid ?? field?.invalid ?? false;
  const look = {
    invalid: isInvalid,
    labels: useInputLabels(),
    root: {
      className: cx(!unstyled && `rc-root ${block}`, className, classNames?.root) || undefined,
      "data-color-scheme": colorScheme,
      "data-disabled": (props.disabled ?? field?.disabled) || undefined,
      "data-invalid": isInvalid || undefined,
      "data-size": size ?? field?.size ?? config.size ?? "md",
      "data-variant": variant ?? config.variant ?? "outline",
      style: { ...themeToStyle(theme), ...style, ...styles?.root },
    },
    slot: createSlotResolver<TSlot | "root">(classNames, styles, unstyled),
  };

  return [look, rest] as const;
}
