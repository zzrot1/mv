"use client";

import { useId, type ReactNode } from "react";

import { useInputAppearance, type InputAppearance } from "../appearance";
import { FieldContext } from "../context";

export type FieldSlot = "label" | "description" | "error" | "required";

export type FieldProps = Omit<InputAppearance<FieldSlot>, "variant"> & {
  children: ReactNode;
  label?: ReactNode;
  description?: ReactNode;
  /** Anything but `null`, `undefined` or `false` marks the control as invalid. */
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** The control's id; generated when left out. */
  id?: string;
};

export function Field({ children, description, error, id, label, required = false, ...props }: FieldProps) {
  const generatedId = useId();
  const controlId = id ?? `${generatedId}-control`;
  const [look] = useInputAppearance<FieldSlot, typeof props>(
    { ...props, invalid: props.invalid ?? (error !== undefined && error !== null && error !== false) },
    "rc-field",
  );
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = look.invalid && error ? `${controlId}-error` : undefined;

  return (
    <div {...look.root}>
      {label ? (
        <label {...look.slot("label", "rc-field__label")} htmlFor={controlId}>
          {label}
          {required ? (
            <span aria-hidden="true" {...look.slot("required", "rc-field__required")}>
              *
            </span>
          ) : null}
        </label>
      ) : null}
      <FieldContext
        value={{
          controlId,
          descriptionId,
          disabled: props.disabled ?? false,
          errorId,
          invalid: look.invalid,
          required,
          size: look.root["data-size"],
        }}
      >
        {children}
      </FieldContext>
      {descriptionId ? (
        <p {...look.slot("description", "rc-field__description")} id={descriptionId}>
          {description}
        </p>
      ) : null}
      {errorId ? (
        <p {...look.slot("error", "rc-field__error")} id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
