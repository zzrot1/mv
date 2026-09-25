import type { ReactNode } from "react";

import styles from "./index.module.css";

type FooterBenefitsTheme = "light" | "dark" | "system";

type FooterBenefit = {
  icon: ReactNode;
  label: string;
};

type FooterBenefitsProps = {
  items?: FooterBenefit[];
  theme?: FooterBenefitsTheme;
};

function ShippingIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="28"
      viewBox="0 0 28 28"
      width="28"
    >
      <path
        d="m14 3.75 9.25 4.55v11.4L14 24.25 4.75 19.7V8.3L14 3.75Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.1"
      />
      <path
        d="M4.75 8.3 14 12.85 23.25 8.3M14 12.85v11.4M9.35 6l9.25 4.55"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.1"
      />
    </svg>
  );
}

function TreeIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="28"
      viewBox="0 0 28 28"
      width="28"
    >
      <path
        d="M14.15 3.75c-4.1 4.95-6.15 8.63-6.15 11.05 0 3.22 2.48 5.7 5.7 5.7s5.7-2.48 5.7-5.7c0-2.42-1.75-6.1-5.25-11.05Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.1"
      />
      <path
        d="M13.85 24.25v-11.1m0 5.35-3.05-3.05m3.05-.55 2.65-2.65"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.1"
      />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="28"
      viewBox="0 0 28 28"
      width="28"
    >
      <path
        d="M23.75 5.25c-7.3.1-12.28 1.58-14.95 4.45-2.35 2.53-2.23 6.23.22 8.5 2.45 2.28 6.13 2.12 8.48-.4 2.67-2.87 4.75-7.05 6.25-12.55Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.1"
      />
      <path
        d="M4.25 22.75c3.18-5.43 7.83-8.75 13.95-9.95"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.1"
      />
    </svg>
  );
}

const defaultItems: FooterBenefit[] = [
  {
    icon: <ShippingIcon />,
    label: "Free shipping on orders over 150 RON",
  },
  {
    icon: <TreeIcon />,
    label: "Buy a book, plant a tree",
  },
  {
    icon: <LeafIcon />,
    label: "FSC certified paper",
  },
];

export function FooterBenefits({
  items = defaultItems,
  theme = "system",
}: FooterBenefitsProps) {
  return (
    <section
      aria-label="Store benefits"
      className={styles["footer-benefits"]}
      data-theme={theme === "system" ? undefined : theme}
    >
      <div className={styles["footer-benefits__inner"]}>
        {items.map((item) => (
          <article className={styles["footer-benefits__item"]} key={item.label}>
            <div className={styles["footer-benefits__icon"]}>{item.icon}</div>
            <p className={styles["footer-benefits__label"]}>{item.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
