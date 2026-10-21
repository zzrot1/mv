"use client";

import type { ComponentProps, ReactNode } from "react";

import { ChevronDownIcon } from "../../../shared/icons";
import { useInputAppearance, type InputAppearance } from "../appearance";
import { useFieldControl } from "../context";
import { InputFrame } from "./input-frame";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectOptionGroup = { label: string; options: readonly SelectOption[]; disabled?: boolean };

export type SelectSlot = "select" | "prefix" | "icon";

export type SelectProps = Omit<
  ComponentProps<"select">,
  "className" | "defaultValue" | "multiple" | "prefix" | "size" | "style" | "value"
> &
  InputAppearance<SelectSlot> & {
    /** Plain options and groups; <option> children work too, after these. */
    options?: readonly (SelectOption | SelectOptionGroup)[];
    /** Shown while nothing is chosen; it can't be picked back. */
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    prefix?: ReactNode;
    /** Replaces the chevron. */
    icon?: ReactNode;
  };

export function Select(props: SelectProps) {
  const [look, { children, defaultValue, icon, onChange, onValueChange, options = [], placeholder, prefix, ...native }] =
    useInputAppearance<SelectSlot, SelectProps>(props, "rc-frame rc-select");
  const control = useFieldControl(native, look.invalid);

  return (
    <InputFrame {...look.root} prefix={prefix} prefixProps={look.slot("prefix", "rc-input__prefix")}>
      <select
        {...control}
        {...look.slot("select", "rc-select__control")}
        defaultValue={native.value === undefined && placeholder !== undefined ? (defaultValue ?? "") : defaultValue}
        onChange={(event) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        }}
      >
        {placeholder !== undefined ? (
          <option className="rc-select__placeholder" disabled hidden value="">
            {placeholder}
          </option>
        ) : null}
        {options.map(renderOption)}
        {children}
      </select>
      <span aria-hidden="true" {...look.slot("icon", "rc-select__icon")}>
        {icon ?? <ChevronDownIcon />}
      </span>
    </InputFrame>
  );
}

function renderOption(item: SelectOption | SelectOptionGroup) {
  return "options" in item ? (
    <optgroup disabled={item.disabled} key={`group:${item.label}`} label={item.label}>
      {item.options.map(renderOption)}
    </optgroup>
  ) : (
    <option disabled={item.disabled} key={item.value} value={item.value}>
      {item.label}
    </option>
  );
}
