import type { CSSProperties, ReactNode } from "react";

import styles from "./index.module.css";

type GridSmallBackgroundTheme = "light" | "dark" | "system";

type GridSmallBackgroundProps = {
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  minHeight?: string;
  theme?: GridSmallBackgroundTheme;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function GridSmallBackground({
  children,
  className,
  contentClassName,
  minHeight,
  theme = "system",
}: GridSmallBackgroundProps) {
  const style = minHeight
    ? ({
        "--grid-small-background-min-height": minHeight,
      } as CSSProperties)
    : undefined;

  return (
    <section
      className={cx(styles["grid-small-background"], className)}
      data-theme={theme === "system" ? undefined : theme}
      style={style}
    >
      <div aria-hidden className={styles["grid-small-background__grid"]} />
      <div aria-hidden className={styles["grid-small-background__fade"]} />
      <div
        className={cx(
          styles["grid-small-background__content"],
          contentClassName,
        )}
      >
        {children ?? (
          <p className={styles["grid-small-background__demo-title"]}>
            Backgrounds
          </p>
        )}
      </div>
    </section>
  );
}
