"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";

import styles from "./index.module.css";

type ThreeDCardEffectTheme = "light" | "dark" | "system";

type ThreeDCardEffectProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  footer?: ReactNode;
  theme?: ThreeDCardEffectTheme;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function ThreeDCardEffect({
  children,
  className,
  contentClassName,
  footer,
  theme = "system",
}: ThreeDCardEffectProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const card = cardRef.current;

    if (!card) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -13;
    const rotateY = ((x / rect.width) - 0.5) * 13;

    card.style.setProperty("--three-d-card-rotate-x", `${rotateX.toFixed(2)}deg`);
    card.style.setProperty("--three-d-card-rotate-y", `${rotateY.toFixed(2)}deg`);
  }

  function handlePointerLeave() {
    const card = cardRef.current;

    if (!card) {
      return;
    }

    card.style.setProperty("--three-d-card-rotate-x", "0deg");
    card.style.setProperty("--three-d-card-rotate-y", "0deg");
  }

  return (
    <div
      className={cx(styles["three-d-card-effect"], className)}
      data-theme={theme === "system" ? undefined : theme}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      ref={cardRef}
      style={
        {
          "--three-d-card-rotate-x": "0deg",
          "--three-d-card-rotate-y": "0deg",
        } as CSSProperties
      }
    >
      <div className={styles["three-d-card-effect__body"]}>
        <div
          className={cx(
            styles["three-d-card-effect__content"],
            contentClassName,
          )}
        >
          {children}
        </div>
        {footer ? (
          <div className={styles["three-d-card-effect__footer"]}>{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
