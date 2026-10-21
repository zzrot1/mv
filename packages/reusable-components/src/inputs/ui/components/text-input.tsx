"use client";

import type { ComponentProps, ReactNode } from "react";

import { useInputAppearance, type InputAppearance } from "../appearance";
import { useFieldControl } from "../context";
import { InputFrame } from "./input-frame";

export type TextInputSlot = "input" | "prefix" | "suffix";

export type TextInputProps = Omit<
  ComponentProps<"input">,
  "className" | "defaultValue" | "prefix" | "size" | "style" | "value"
> &
  InputAppearance<TextInputSlot> & {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    /** Shown inside the box, before and after the text: an icon, a unit, a button. */
    prefix?: ReactNode;
    suffix?: ReactNode;
  };

export function TextInput(props: TextInputProps) {
  const [look, { onChange, onValueChange, prefix, suffix, type = "text", ...native }] = useInputAppearance<
    TextInputSlot,
    TextInputProps
  >(props, "rc-frame rc-input");
  const control = useFieldControl(native, look.invalid);

  return (
    <InputFrame
      {...look.root}
      prefix={prefix}
      prefixProps={look.slot("prefix", "rc-input__prefix")}
      suffix={suffix}
      suffixProps={look.slot("suffix", "rc-input__suffix")}
    >
      <input
        {...control}
        {...look.slot("input", "rc-input__control")}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        type={type}
      />
    </InputFrame>
  );
}
