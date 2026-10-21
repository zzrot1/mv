"use client";

import { createContext, useContext, type AriaAttributes, type ReactNode } from "react";

import type { InputSize, InputVariant } from "./appearance";

/** Every text the inputs show or announce, so each one can come from a translation. */
export type InputLabels = {
  characterCount: (count: number, maxLength?: number) => string;
  clearSearch: string;
  decrement: string;
  hidePassword: string;
  increment: string;
  showPassword: string;
};

export const defaultInputLabels: InputLabels = {
  characterCount: (count, maxLength) => (maxLength === undefined ? String(count) : `${count} / ${maxLength}`),
  clearSearch: "Clear search",
  decrement: "Decrease",
  hidePassword: "Hide password",
  increment: "Increase",
  showPassword: "Show password",
};

/** App-wide defaults for every input; an input's own props still win. */
export type InputsConfig = {
  labels?: Partial<InputLabels>;
  size?: InputSize;
  variant?: InputVariant;
};

const ConfigContext = createContext<InputsConfig>({});

export function InputsConfigProvider({ children, ...config }: InputsConfig & { children: ReactNode }) {
  const parent = useContext(ConfigContext);

  return (
    <ConfigContext value={{ ...parent, ...config, labels: { ...parent.labels, ...config.labels } }}>
      {children}
    </ConfigContext>
  );
}

export function useInputsConfig() {
  return useContext(ConfigContext);
}

export function useInputLabels(): InputLabels {
  return { ...defaultInputLabels, ...useInputsConfig().labels };
}

export const FieldContext = createContext<{
  controlId: string;
  descriptionId?: string;
  errorId?: string;
  invalid: boolean;
  disabled: boolean;
  required: boolean;
  size?: InputSize;
} | null>(null);

export function useFieldContext() {
  return useContext(FieldContext);
}

export function useFieldControl<TProps extends object>(
  props: TProps & {
    id?: string;
    disabled?: boolean;
    required?: boolean;
    "aria-describedby"?: string;
    "aria-invalid"?: AriaAttributes["aria-invalid"];
  },
  invalid: boolean,
) {
  const field = useFieldContext();
  const describedBy = [props["aria-describedby"], field?.descriptionId, field?.errorId].filter(Boolean).join(" ");

  return {
    ...props,
    "aria-describedby": describedBy || undefined,
    "aria-invalid": props["aria-invalid"] ?? (invalid || undefined),
    disabled: props.disabled ?? field?.disabled,
    id: field?.controlId ?? props.id,
    required: props.required ?? field?.required,
  };
}
