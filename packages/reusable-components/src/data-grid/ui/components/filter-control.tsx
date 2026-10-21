"use client";

import { useEffect, useEffectEvent, useState, type ReactNode } from "react";

import { Checkbox, NumberInput, SearchInput, Select, TextInput } from "../../../inputs";
import { FilterIcon } from "../../../shared/icons";
import { useAnchoredPopover } from "../../../shared/use-anchored-popover";
import { isActiveFilterValue } from "../../domain/filtering";
import { toNumber, toText } from "../../domain/values";
import { useGridContext } from "../context";
import type { ColumnDef, ControlVariant, FilterOption, FilterRenderContext } from "../types";

type FilterControlProps = {
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

export function FilterControl({
  debounceMs,
  id,
  label,
  onChange,
  onClose = () => {},
  options,
  placeholder,
  placement,
  render,
  value,
  variant,
}: FilterControlProps) {
  const { css, labels, slot, unstyled } = useGridContext();
  const [draft, setDraft] = useDraft(value, onChange, debounceMs);
  const control = { ...slot("control", ""), unstyled };

  if (render) {
    return render({ close: onClose, id, label, setValue: onChange, value });
  }

  if (variant === "search") {
    return (
      <SearchInput
        {...slot("search", "rc-grid__search")}
        aria-label={label}
        onValueChange={setDraft}
        placeholder={placeholder ?? labels.searchPlaceholder}
        unstyled={unstyled}
        value={toText(draft)}
      />
    );
  }

  if (variant === "select") {
    return (
      <Select
        {...control}
        aria-label={labels.filterBy(label)}
        onValueChange={onChange}
        options={[
          { label: placeholder ?? (placement === "toolbar" ? labels.filterAll(label) : labels.allOptions), value: "" },
          ...options,
        ]}
        value={toText(value)}
      />
    );
  }

  if (variant === "toggle") {
    return (
      <Checkbox
        {...slot("control", "rc-grid__toggle")}
        checked={value === true}
        label={label}
        onCheckedChange={onChange}
        unstyled={unstyled}
      />
    );
  }

  if (variant === "number-range") {
    const [min, max] = Array.isArray(draft) ? draft.map(toNumber) : [];

    return (
      <div aria-label={labels.filterBy(label)} className={css("rc-range")} role="group">
        <NumberInput
          {...control}
          aria-label={labels.minimum}
          hideStepper
          onValueChange={(next) => setDraft([next ?? undefined, max])}
          placeholder={labels.minimum}
          value={min ?? null}
        />
        <NumberInput
          {...control}
          aria-label={labels.maximum}
          hideStepper
          onValueChange={(next) => setDraft([min, next ?? undefined])}
          placeholder={labels.maximum}
          value={max ?? null}
        />
      </div>
    );
  }

  return (
    <TextInput
      {...control}
      aria-label={labels.filterBy(label)}
      onValueChange={setDraft}
      placeholder={placeholder ?? (placement === "toolbar" ? label : labels.filterPlaceholder)}
      value={toText(draft)}
    />
  );
}

export function ColumnFilter<TRow>({ column }: { column: ColumnDef<TRow> }) {
  const { css, grid, labels, slot } = useGridContext<TRow>();
  const { onToggle, popoverId, triggerRef } = useAnchoredPopover({
    align: column.align,
    focusSelector: "input, select",
  });
  const filters = grid.filters.column;
  const value = filters.values[column.id];
  const active = isActiveFilterValue(value);
  const label = column.label ?? (typeof column.header === "string" ? column.header : column.id);

  return (
    <>
      <button
        {...slot("filterTrigger", "rc-grid__filter-trigger")}
        aria-label={active ? labels.filterByActive(label) : labels.filterBy(label)}
        data-active={active || undefined}
        popoverTarget={popoverId}
        ref={triggerRef}
        type="button"
      >
        <FilterIcon />
      </button>
      <div
        {...slot("filterPopover", "rc-grid__filter-popover")}
        aria-label={labels.filterBy(label)}
        id={popoverId}
        onToggle={onToggle}
        popover="auto"
        role="dialog"
      >
        <span className={css("rc-grid__filter-title")}>{labels.filterBy(label)}</span>
        <FilterControl
          debounceMs={filters.debounceMs}
          id={column.id}
          label={label}
          onChange={(next) => filters.set(column.id, next)}
          onClose={() => document.getElementById(popoverId)?.hidePopover()}
          options={filters.getOptions(column)}
          placeholder={column.filter?.placeholder}
          placement="column"
          render={column.filter?.render}
          value={value}
          variant={column.filter?.variant ?? "text"}
        />
        {active ? (
          <button
            {...slot("button", "rc-button")}
            data-size="small"
            data-variant="ghost"
            onClick={() => filters.set(column.id, undefined)}
            type="button"
          >
            {labels.clearFilter}
          </button>
        ) : null}
      </div>
    </>
  );
}

const NOTHING_SENT = Symbol("nothing sent");

export function useDraft(value: unknown, onCommit: (value: unknown) => void, delayMs: number) {
  const [draft, setDraft] = useState(value);
  const [committed, setCommitted] = useState(value);
  const [sent, setSent] = useState<unknown>(NOTHING_SENT);
  const commit = useEffectEvent((next: unknown) => {
    setSent(next);
    onCommit(next);
  });

  if (value !== committed) {
    setCommitted(value);
    setSent(NOTHING_SENT);

    if (value !== sent) {
      setDraft(value);
    }
  }

  useEffect(() => {
    if (delayMs <= 0 || draft === committed) {
      return;
    }

    const timer = setTimeout(() => commit(draft), delayMs);

    return () => clearTimeout(timer);
  }, [committed, delayMs, draft]);

  function change(next: unknown) {
    setDraft(next);

    if (delayMs <= 0) {
      setSent(next);
      onCommit(next);
    }
  }

  return [draft, change] as const;
}
