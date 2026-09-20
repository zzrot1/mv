"use client";

import { AccountShell } from "../components/account-shell";
import { useAccountProfile } from "../hooks/use-account-profile";
import styles from "../styles/account-page.module.css";

export function AccountPage() {
  const { isLoading, navigationItems, profile } = useAccountProfile();

  if (isLoading || !profile) {
    return (
      <main className={styles.page}>
        <section className={styles.content} aria-label="Account loading">
          <div className={styles.contentInner}>Loading account...</div>
        </section>
      </main>
    );
  }

  return <AccountShell navigationItems={navigationItems} profile={profile} />;
}
