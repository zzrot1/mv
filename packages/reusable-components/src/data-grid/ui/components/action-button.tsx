"use client";

import { useState, type ReactNode } from "react";

import { useDataGridContext } from "../grid-context";
import type { ActionTone } from "../types";

export type ActionButtonProps = {
  label: string;
  accessibleLabel?: string;
  icon?: ReactNode;
  tone?: ActionTone;
  variant?: "ghost" | "primary";
  size?: "small";
  disabled?: boolean;
  confirmMessage?: string;
  onAction: () => unknown;
};

export function ActionButton({
  accessibleLabel,
  confirmMessage,
  disabled = false,
  icon,
  label,
  onAction,
  size,
  tone,
  variant,
}: ActionButtonProps) {
  const { confirm, slot } = useDataGridContext();
  const [isPending, setIsPending] = useState(false);

  async function runAction() {
    if (confirmMessage && !(await confirm(confirmMessage))) {
      return;
    }

    setIsPending(true);

    try {
      await onAction();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      {...slot("button", "rc-button")}
      aria-label={accessibleLabel}
      data-size={size}
      data-tone={tone === "danger" ? tone : undefined}
      data-variant={variant}
      disabled={disabled || isPending}
      onClick={() => void runAction()}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

export function resolveConfirmMessage<TValue>(
  confirm: string | ((value: TValue) => string) | undefined,
  value: TValue,
) {
  return typeof confirm === "function" ? confirm(value) : confirm;
}
