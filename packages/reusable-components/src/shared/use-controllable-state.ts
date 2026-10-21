"use client";

import { useState } from "react";

export function useControllableState<TValue>({
  defaultValue,
  onChange,
  value,
}: {
  defaultValue: TValue;
  onChange?: (value: TValue) => void;
  value?: TValue;
}) {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;

  function setValue(next: TValue) {
    setInternal(next);
    onChange?.(next);
  }

  return [isControlled ? value : internal, setValue] as const;
}
