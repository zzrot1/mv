"use client";

import type { InputHTMLAttributes } from "react";

import { useDataGridContext } from "../grid-context";

type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "onChange" | "style" | "type"
> & {
  indeterminate?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function Checkbox({
  indeterminate = false,
  onCheckedChange,
  ...inputProps
}: CheckboxProps) {
  const { slot } = useDataGridContext();

  return (
    <input
      {...inputProps}
      {...slot("checkbox", "rc-checkbox")}
      onChange={(event) => onCheckedChange(event.target.checked)}
      ref={(element) => {
        if (element) {
          element.indeterminate = indeterminate;
        }
      }}
      type="checkbox"
    />
  );
}
