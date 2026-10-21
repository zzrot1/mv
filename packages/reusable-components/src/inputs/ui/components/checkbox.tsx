"use client";

import { useImperativeHandle, useLayoutEffect, useRef, type ComponentProps, type ReactNode } from "react";

import { useInputAppearance, type InputAppearance } from "../appearance";
import { useFieldControl } from "../context";

export type CheckboxSlot = "input" | "label";

export type CheckboxProps = Omit<ComponentProps<"input">, "className" | "prefix" | "size" | "style" | "type"> &
  Omit<InputAppearance<CheckboxSlot>, "variant"> & {
    label?: ReactNode;
    onCheckedChange?: (checked: boolean) => void;
    /** The "some of them" state, shown as a dash; screen readers announce it as mixed. */
    indeterminate?: boolean;
  };

export type SwitchProps = Omit<CheckboxProps, "indeterminate" | "role">;

export function Checkbox(props: CheckboxProps) {
  return <CheckControl {...props} block="rc-checkbox" />;
}

export function Switch(props: SwitchProps) {
  return <CheckControl {...props} block="rc-switch" role="switch" />;
}

function CheckControl({ block, indeterminate = false, ...props }: CheckboxProps & { block: string }) {
  const [look, { label, onChange, onCheckedChange, ref, ...native }] = useInputAppearance<CheckboxSlot, CheckboxProps>(
    props,
    block,
  );
  const control = useFieldControl(native, look.invalid);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  });

  return (
    <label {...look.root}>
      <input
        {...control}
        {...look.slot("input", `${block}__control`)}
        onChange={(event) => {
          onChange?.(event);
          onCheckedChange?.(event.target.checked);
        }}
        ref={inputRef}
        type="checkbox"
      />
      {label ? <span {...look.slot("label", `${block}__label`)}>{label}</span> : null}
    </label>
  );
}
