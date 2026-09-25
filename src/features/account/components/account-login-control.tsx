import Link from "next/link";

import styles from "../styles/account-page.module.css";

export function AccountLoginControl() {
  return (
    <Link aria-label="Back to home" className={styles.backButton} href="/">
      <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
        <path
          d="M15.5 5.5 9 12l6.5 6.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </svg>
    </Link>
  );
}
