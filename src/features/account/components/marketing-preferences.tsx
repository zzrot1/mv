import { MailIcon } from "./icons";
import styles from "../styles/account-page.module.css";

type MarketingPreferencesProps = {
  emailEnabled: boolean;
};

export function MarketingPreferences({ emailEnabled }: MarketingPreferencesProps) {
  return (
    <section className={styles.section} aria-labelledby="marketing-heading">
      <h2 className={styles.sectionTitle} id="marketing-heading">
        Marketing preferences
      </h2>
      <div className={styles.preferenceRow}>
        <span className={styles.preferenceLabel}>
          <MailIcon className={styles.preferenceIcon} />
          Email
        </span>
        <button
          aria-label="Toggle marketing email"
          aria-pressed={emailEnabled}
          className={styles.toggle}
          type="button"
        >
          <span className={styles.toggleHandle} />
        </button>
      </div>
    </section>
  );
}
