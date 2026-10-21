"use client";

import { useImperativeHandle, useRef, type MouseEvent } from "react";

import { cx } from "../../../shared/class-names";
import { ChevronDownIcon, ChevronUpIcon } from "../../../shared/icons";
import { createSlotResolver } from "../../../shared/slots";
import type { InputAppearance } from "../appearance";
import { useFieldContext, useInputLabels } from "../context";
import { useFormReset } from "../use-form-reset";
import { useNumberInput, type UseNumberInputOptions } from "../use-number-input";
import { TextInput, type TextInputProps, type TextInputSlot } from "./text-input";

export type NumberInputSlot = TextInputSlot | "stepper" | "increment" | "decrement";

export type NumberInputProps = Omit<
  TextInputProps,
  | "aria-valuemax"
  | "aria-valuemin"
  | "aria-valuenow"
  | "classNames"
  | "defaultValue"
  | "max"
  | "min"
  | "onValueChange"
  | "role"
  | "step"
  | "styles"
  | "type"
  | "value"
> &
  Pick<InputAppearance<NumberInputSlot>, "classNames" | "styles"> &
  UseNumberInputOptions & {
    /** Hides the up/down buttons; the arrow keys still step. */
    hideStepper?: boolean;
  };

export function NumberInput({
  classNames,
  defaultValue,
  hideStepper = false,
  largeStep,
  max,
  min,
  onBlur,
  onKeyDown,
  onValueChange,
  precision,
  ref,
  step,
  styles,
  suffix,
  value,
  ...props
}: NumberInputProps) {
  const labels = useInputLabels();
  const field = useFieldContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const number = useNumberInput({
    defaultValue,
    disabled: props.disabled ?? field?.disabled,
    largeStep,
    max,
    min,
    onValueChange,
    precision,
    readOnly: props.readOnly,
    step,
    value,
  });
  const slot = createSlotResolver<NumberInputSlot>(classNames, styles, props.unstyled);
  const stepper = hideStepper ? null : (
    <span {...slot("stepper", "rc-number__stepper")} key="stepper">
      <button
        {...slot("increment", "rc-number__step")}
        aria-label={labels.increment}
        disabled={!number.canIncrement}
        onClick={number.increment}
        onMouseDown={keepFocus}
        tabIndex={-1}
        type="button"
      >
        <ChevronUpIcon size={12} />
      </button>
      <button
        {...slot("decrement", "rc-number__step")}
        aria-label={labels.decrement}
        disabled={!number.canDecrement}
        onClick={number.decrement}
        onMouseDown={keepFocus}
        tabIndex={-1}
        type="button"
      >
        <ChevronDownIcon size={12} />
      </button>
    </span>
  );

  useFormReset(inputRef, number.reset);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  return (
    <TextInput
      autoComplete="off"
      inputMode={min !== undefined && min >= 0 ? (precision === 0 ? "numeric" : "decimal") : "text"}
      {...props}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={number.value ?? undefined}
      classNames={{ ...classNames, suffix: cx(stepper && !props.unstyled && "rc-number__suffix", classNames?.suffix) }}
      onBlur={(event) => {
        onBlur?.(event);
        number.blur();
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);

        if (!event.defaultPrevented) {
          number.keyDown(event);
        }
      }}
      onValueChange={number.change}
      ref={inputRef}
      role="spinbutton"
      styles={styles}
      suffix={[suffix, stepper]}
      type="text"
      value={number.text}
    />
  );
}

function keepFocus(event: MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
}
