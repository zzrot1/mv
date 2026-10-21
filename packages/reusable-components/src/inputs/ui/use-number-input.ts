"use client";

import { useState, type KeyboardEvent } from "react";

import {
  formatNumber,
  isPartialNumber,
  normalizeNumber,
  parseNumber,
  stepNumber,
  type NumberBounds,
} from "../domain/number";
import { useControllableState } from "../../shared/use-controllable-state";

export type UseNumberInputOptions = NumberBounds & {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  step?: number;
  /** Used with Shift + arrow and with Page Up / Page Down. */
  largeStep?: number;
  /** Decimals kept on blur and when stepping; free when left out. */
  precision?: number;
  disabled?: boolean;
  readOnly?: boolean;
};

export function useNumberInput({
  defaultValue = null,
  disabled = false,
  largeStep,
  max,
  min,
  onValueChange,
  precision,
  readOnly = false,
  step = 1,
  value,
}: UseNumberInputOptions) {
  const [current, setCurrent] = useControllableState<number | null>({
    defaultValue,
    onChange: onValueChange,
    value,
  });
  const [draft, setDraft] = useState<string | null>(null);
  const interactive = !disabled && !readOnly;

  function commit(next: number | null) {
    if (next !== current) {
      setCurrent(next);
    }
  }

  function typedValue() {
    return draft === null ? current : (parseNumber(draft) ?? current);
  }

  function change(text: string) {
    if (!isPartialNumber(text)) {
      return;
    }

    setDraft(text);

    if (text.trim() === "") {
      commit(null);
    } else {
      const parsed = parseNumber(text);

      if (parsed !== null) {
        commit(parsed);
      }
    }
  }

  function blur() {
    if (draft === null) {
      return;
    }

    const typed = draft.trim() === "" ? null : typedValue();

    setDraft(null);
    commit(normalizeNumber(typed, { max, min, precision }));
  }

  function increment(direction: 1 | -1, amount = step) {
    if (!interactive) {
      return;
    }

    setDraft(null);
    commit(stepNumber(typedValue(), { direction, max, min, precision, step: amount }));
  }

  function reset() {
    setDraft(null);

    if (value === undefined) {
      commit(defaultValue);
    }
  }

  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!interactive || event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing) {
      return;
    }

    const big = largeStep ?? step * 10;
    const moves: Record<string, [1 | -1, number]> = {
      ArrowDown: [-1, event.shiftKey ? big : step],
      ArrowUp: [1, event.shiftKey ? big : step],
      PageDown: [-1, big],
      PageUp: [1, big],
    };
    const move = moves[event.key];

    if (move) {
      event.preventDefault();
      increment(...move);
    } else if (event.key === "Enter") {
      blur();
    }
  }

  return {
    blur,
    canDecrement: interactive && (min === undefined || current === null || current > min),
    canIncrement: interactive && (max === undefined || current === null || current < max),
    change,
    decrement: () => increment(-1),
    increment: () => increment(1),
    keyDown,
    reset,
    text:
      draft !== null && (parseNumber(draft) ?? current) === current ? draft : formatNumber(current, precision),
    value: current,
  };
}
