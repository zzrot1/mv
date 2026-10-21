"use client";

import { useId, useImperativeHandle, useRef, useState, type ComponentProps } from "react";

import { cx } from "../../../shared/class-names";
import { useInputAppearance, type InputAppearance } from "../appearance";
import { useFieldControl } from "../context";
import { useAutoResize } from "../use-auto-resize";
import { useFormReset } from "../use-form-reset";
import { InputFrame } from "./input-frame";

export type TextareaSlot = "textarea" | "count";

export type TextareaProps = Omit<ComponentProps<"textarea">, "className" | "defaultValue" | "style" | "value"> &
  InputAppearance<TextareaSlot> & {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    /** Grows with the text instead of scrolling, up to `maxRows` lines. */
    autoResize?: boolean;
    maxRows?: number;
    /** Shows "12 / 200" under the text (with `maxLength`), or just the count. */
    showCount?: boolean;
  };

export function Textarea(props: TextareaProps) {
  const [look, { autoResize = false, maxRows, onChange, onValueChange, ref, rows = 3, showCount = false, ...native }] =
    useInputAppearance<TextareaSlot, TextareaProps>(props, "rc-frame rc-textarea");
  const countId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [typed, setTyped] = useState(native.defaultValue ?? "");
  const text = native.value ?? typed;
  const control = useFieldControl(
    { ...native, "aria-describedby": cx(native["aria-describedby"], showCount && countId) || undefined },
    look.invalid,
  );

  useAutoResize(textareaRef, autoResize, maxRows);
  useFormReset(textareaRef, setTyped);
  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement, []);

  return (
    <InputFrame {...look.root}>
      <textarea
        {...control}
        {...look.slot("textarea", "rc-textarea__control")}
        data-auto-resize={autoResize || undefined}
        onChange={(event) => {
          setTyped(event.target.value);
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
        ref={textareaRef}
        rows={rows}
      />
      {showCount ? (
        <span
          {...look.slot("count", "rc-textarea__count")}
          data-over={(native.maxLength !== undefined && text.length > native.maxLength) || undefined}
          id={countId}
        >
          {look.labels.characterCount(text.length, native.maxLength)}
        </span>
      ) : null}
    </InputFrame>
  );
}
