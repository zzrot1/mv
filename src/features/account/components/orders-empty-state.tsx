import Link from "next/link";

import type { AccountProfile } from "../model/account";
import styles from "../styles/account-page.module.css";

type OrdersEmptyStateProps = {
  profile: AccountProfile;
};

export function OrdersEmptyState({ profile }: OrdersEmptyStateProps) {
  const firstName = profile.fullName.split(" ")[0] || profile.fullName;

  return (
    <section className={styles.ordersCard} aria-label="Orders">
      <div>
        <h1 className={styles.ordersTitle}>Welcome, {firstName}</h1>
        <p className={styles.ordersText}>Ready to shop?</p>
      </div>
      <Link className={styles.shopButton} href="/products">
        Shop now
      </Link>
    </section>
  );
}
