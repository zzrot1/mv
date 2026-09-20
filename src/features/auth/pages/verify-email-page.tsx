import { VerifyEmailCard } from "../components/verify-email-card";
import styles from "../styles/verify-email-page.module.css";

type VerifyEmailPageProps = {
  token?: string;
};

export function VerifyEmailPage({ token }: VerifyEmailPageProps) {
  return (
    <main className={styles.page}>
      <VerifyEmailCard token={token} />
    </main>
  );
}
