import type { AccountProfile } from "../model/account";
import { PinIcon } from "./icons";
import styles from "../styles/account-page.module.css";

type AddressSummaryCardProps = {
  profile: AccountProfile;
};

export function AddressSummaryCard({ profile }: AddressSummaryCardProps) {
  const addressParts = [
    profile.addressLine1,
    profile.addressLine2,
    [profile.postalCode, profile.city].filter(Boolean).join(" "),
    profile.country,
  ].filter(Boolean);

  return (
    <div className={styles.emptyCard}>
      <span className={styles.iconTile}>
        <PinIcon />
      </span>
      <span className={styles.addressText}>{addressParts.join(", ")}</span>
    </div>
  );
}
