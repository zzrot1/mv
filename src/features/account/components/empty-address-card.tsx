import { PinIcon } from "./icons";
import styles from "../styles/account-page.module.css";

export function EmptyAddressCard() {
  return (
    <div className={styles.emptyCard}>
      <span className={styles.iconTile}>
        <PinIcon />
      </span>
      <span className={styles.emptyText}>No addresses added</span>
    </div>
  );
}
