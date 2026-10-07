"use client";

import type { ReactNode } from "react";

import { toNumber, toText } from "../../domain/values";
import { useDataGridContext } from "../grid-context";
import type { ControlVariant, FilterOption, FilterRenderContext } from "../types";
import { SearchIcon } from "./icons";
import { TextInput } from "./text-input";

export type FilterControlProps = {
  id: string;
  label: string;
  variant: ControlVariant;
  placement: "column" | "toolbar";
  value: unknown;
  onChange: (value: unknown) => void;
  onClose?: () => void;
  options: readonly FilterOption[];
  placeholder?: string;
  debounceMs: number;
  render?: (context: FilterRenderContext) => ReactNode;
};

const controls: Readonly<
  Record<ControlVariant, (props: FilterControlProps) => ReactNode>
> = {
  "number-range": NumberRangeFilter,
  search: SearchFilter,
  select: SelectFilter,
  text: TextFilter,
  toggle: ToggleFilter,
};

export function FilterControl(props: FilterControlProps) {
  const { id, label, onChange, onClose = noop, render, value, variant } = props;

  if (render) {
    return render({ close: onClose, id, label, setValue: onChange, value });
  }

  const Control = controls[variant];

  return <Control {...props} />;
}

function SearchFilter({ debounceMs, label, onChange, placeholder, value }: FilterControlProps) {
  const { labels, slot } = useDataGridContext();

  return (
    <div {...slot("search", "rc-grid__search")} role="search">
      <SearchIcon />
      <TextInput
        {...slot("control", "rc-control rc-grid__search-input")}
        aria-label={label}
        debounceMs={debounceMs}
        onCommit={onChange}
        placeholder={placeholder ?? labels.searchPlaceholder}
        type="search"
        value={toText(value)}
      />
    </div>
  );
}

function TextFilter({
  debounceMs,
  label,
  onChange,
  placeholder,
  placement,
  value,
}: FilterControlProps) {
  const { labels, slot } = useDataGridContext();

  return (
    <TextInput
      {...slot("control", "rc-control")}
      aria-label={labels.filterBy(label)}
      debounceMs={debounceMs}
      onCommit={onChange}
      placeholder={
        placeholder ?? (placement === "toolbar" ? label : labels.filterPlaceholder)
      }
      value={toText(value)}
    />
  );
}

function SelectFilter({
  label,
  onChange,
  options,
  placeholder,
  placement,
  value,
}: FilterControlProps) {
  const { labels, slot } = useDataGridContext();
  const allLabel =
    placeholder ??
    (placement === "toolbar" ? labels.filterAll(label) : labels.allOptions);

  return (
    <select
      {...slot("control", "rc-control")}
      aria-label={labels.filterBy(label)}
      onChange={(event) => onChange(event.target.value)}
      value={toText(value)}
    >
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function NumberRangeFilter({
  debounceMs,
  label,
  onChange,
  value,
}: FilterControlProps) {
  const { labels, slot } = useDataGridContext();
  const [min, max] = Array.isArray(value) ? value : [];

  function commit(index: 0 | 1, text: string) {
    const next = [toNumber(min), toNumber(max)];
    next[index] = toNumber(text);
    onChange(next);
  }

  return (
    <div aria-label={labels.filterBy(label)} className="rc-range" role="group">
      <TextInput
        {...slot("control", "rc-control")}
        aria-label={labels.minimum}
        debounceMs={debounceMs}
        inputMode="decimal"
        onCommit={(text) => commit(0, text)}
        placeholder={labels.minimum}
        type="number"
        value={toText(min)}
      />
      <TextInput
        {...slot("control", "rc-control")}
        aria-label={labels.maximum}
        debounceMs={debounceMs}
        inputMode="decimal"
        onCommit={(text) => commit(1, text)}
        placeholder={labels.maximum}
        type="number"
        value={toText(max)}
      />
    </div>
  );
}

function ToggleFilter({ label, onChange, value }: FilterControlProps) {
  const { slot } = useDataGridContext();

  return (
    <label className="rc-toggle">
      <input
        {...slot("checkbox", "rc-checkbox")}
        checked={value === true}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span>{label}</span>
    </label>
  );
}

function noop() {}
