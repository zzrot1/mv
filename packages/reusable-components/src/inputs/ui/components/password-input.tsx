"use client";

import { EyeIcon, EyeOffIcon } from "../../../shared/icons";
import { createSlotResolver } from "../../../shared/slots";
import { useControllableState } from "../../../shared/use-controllable-state";
import type { InputAppearance } from "../appearance";
import { useFieldContext, useInputLabels } from "../context";
import { TextInput, type TextInputProps, type TextInputSlot } from "./text-input";

export type PasswordInputSlot = TextInputSlot | "toggle";

export type PasswordInputProps = Omit<TextInputProps, "classNames" | "styles" | "type"> &
  Pick<InputAppearance<PasswordInputSlot>, "classNames" | "styles"> & {
    /** Whether the password shows as plain text. */
    visible?: boolean;
    defaultVisible?: boolean;
    onVisibleChange?: (visible: boolean) => void;
  };

export function PasswordInput({
  classNames,
  defaultVisible = false,
  onVisibleChange,
  styles,
  suffix,
  visible,
  ...props
}: PasswordInputProps) {
  const labels = useInputLabels();
  const field = useFieldContext();
  const [shown, setShown] = useControllableState({ defaultValue: defaultVisible, onChange: onVisibleChange, value: visible });
  const slot = createSlotResolver<PasswordInputSlot>(classNames, styles, props.unstyled);

  return (
    <TextInput
      autoCapitalize="off"
      autoComplete="current-password"
      autoCorrect="off"
      spellCheck={false}
      {...props}
      classNames={classNames}
      styles={styles}
      suffix={[
        suffix,
        <button
          {...slot("toggle", "rc-input__button")}
          aria-label={shown ? labels.hidePassword : labels.showPassword}
          disabled={props.disabled ?? field?.disabled}
          key="toggle"
          onClick={() => setShown(!shown)}
          type="button"
        >
          {shown ? <EyeOffIcon /> : <EyeIcon />}
        </button>,
      ]}
      type={shown ? "text" : "password"}
    />
  );
}
