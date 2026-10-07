"use client";

import {
  useEffect,
  useEffectEvent,
  useState,
  type InputHTMLAttributes,
} from "react";

type TextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> & {
  value: string;
  onCommit: (value: string) => void;
  debounceMs?: number;
};

// Keeps what the user types locally and commits it after `debounceMs`, so a
// server-side search doesn't send a request per keystroke.
export function TextInput({
  debounceMs = 0,
  onCommit,
  value,
  ...inputProps
}: TextInputProps) {
  const [draft, setDraft] = useState(value);
  const [committed, setCommitted] = useState(value);

  if (value !== committed) {
    setCommitted(value);
    setDraft(value);
  }

  const commit = useEffectEvent((next: string) => onCommit(next));

  useEffect(() => {
    if (debounceMs <= 0 || draft === committed) {
      return;
    }

    const timer = setTimeout(() => commit(draft), debounceMs);

    return () => clearTimeout(timer);
  }, [committed, debounceMs, draft]);

  return (
    <input
      {...inputProps}
      onChange={(event) => {
        setDraft(event.target.value);

        if (debounceMs <= 0) {
          onCommit(event.target.value);
        }
      }}
      value={draft}
    />
  );
}
