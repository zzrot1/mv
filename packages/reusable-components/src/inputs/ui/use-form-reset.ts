"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";

export function useFormReset(
  ref: RefObject<HTMLInputElement | HTMLTextAreaElement | null>,
  onReset: (value: string) => void,
) {
  const reset = useEffectEvent(onReset);

  useEffect(() => {
    const control = ref.current;
    const handleReset = () => setTimeout(() => reset(control?.value ?? ""));

    control?.form?.addEventListener("reset", handleReset);

    return () => control?.form?.removeEventListener("reset", handleReset);
  }, [ref]);
}
