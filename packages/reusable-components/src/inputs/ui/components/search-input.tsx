"use client";

import { useImperativeHandle, useRef, type ReactNode } from "react";

import { SearchIcon, XIcon } from "../../../shared/icons";
import { createSlotResolver } from "../../../shared/slots";
import { useControllableState } from "../../../shared/use-controllable-state";
import type { InputAppearance } from "../appearance";
import { useFieldContext, useInputLabels } from "../context";
import { useFormReset } from "../use-form-reset";
import { TextInput, type TextInputProps, type TextInputSlot } from "./text-input";

export type SearchInputSlot = TextInputSlot | "icon" | "clear";

export type SearchInputProps = Omit<TextInputProps, "classNames" | "styles" | "type"> &
  Pick<InputAppearance<SearchInputSlot>, "classNames" | "styles"> & {
    /** Replaces the magnifier; `null` removes it. */
    icon?: ReactNode;
    clearable?: boolean;
    /** Enter submits the current text. */
    onSearch?: (value: string) => void;
    onClear?: () => void;
  };

export function SearchInput({
  classNames,
  clearable = true,
  defaultValue = "",
  icon,
  onClear,
  onKeyDown,
  onSearch,
  onValueChange,
  prefix,
  ref,
  styles,
  suffix,
  value,
  ...props
}: SearchInputProps) {
  const labels = useInputLabels();
  const field = useFieldContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useControllableState({ defaultValue, onChange: onValueChange, value });
  const slot = createSlotResolver<SearchInputSlot>(classNames, styles, props.unstyled);
  const canClear = clearable && text !== "" && !(props.disabled ?? field?.disabled) && !props.readOnly;

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);
  useFormReset(inputRef, () => {
    if (value === undefined) {
      setText(defaultValue);
    }
  });

  function clear() {
    const input = inputRef.current as HTMLInputElement;

    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
    onClear?.();
  }

  return (
    <TextInput
      enterKeyHint="search"
      {...props}
      classNames={classNames}
      onKeyDown={(event) => {
        onKeyDown?.(event);

        if (event.defaultPrevented || event.nativeEvent.isComposing) {
          return;
        }

        if (event.key === "Escape" && canClear) {
          event.preventDefault();
          clear();
        } else if (event.key === "Enter") {
          onSearch?.(text);
        }
      }}
      onValueChange={setText}
      prefix={[icon === undefined ? <SearchIcon {...slot("icon", "rc-search__icon")} key="icon" /> : icon, prefix]}
      ref={inputRef}
      styles={styles}
      suffix={[
        suffix,
        canClear ? (
          <button {...slot("clear", "rc-input__button")} aria-label={labels.clearSearch} key="clear" onClick={clear} type="button">
            <XIcon size={14} />
          </button>
        ) : null,
      ]}
      type="search"
      value={text}
    />
  );
}
