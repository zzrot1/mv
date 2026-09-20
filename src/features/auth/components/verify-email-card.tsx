"use client";

import Link from "next/link";

import { useVerifyEmailToken } from "../hooks/use-verify-email-token";
import styles from "../styles/verify-email-page.module.css";

type VerifyEmailCardProps = {
  token?: string;
};

export function VerifyEmailCard({ token }: VerifyEmailCardProps) {
  const verification = useVerifyEmailToken(token);

  if (verification.isMissingToken) {
    return (
      <section className={styles.card}>
        <p className={styles.eyebrow}>Email verification</p>
        <h1 className={styles.title}>Verification link is missing</h1>
        <p className={styles.description}>
          The verification link does not include a token. Please use the latest link
          from your email.
        </p>
        <Link className={styles.primaryLink} href="/">
          Back home
        </Link>
      </section>
    );
  }

  if (verification.isSuccess) {
    return (
      <section className={styles.card}>
        <p className={styles.eyebrow}>Email verification</p>
        <h1 className={styles.title}>Your email is verified</h1>
        <p className={styles.description}>
          Your account is ready. You can continue to your account page.
        </p>
        <Link className={styles.primaryLink} href="/account">
          Continue
        </Link>
      </section>
    );
  }

  if (verification.isError) {
    return (
      <section className={styles.card}>
        <p className={styles.eyebrow}>Email verification</p>
        <h1 className={styles.title}>We could not verify your email</h1>
        <p className={styles.description}>{verification.errorMessage}</p>
        <button className={styles.primaryLink} onClick={verification.retry} type="button">
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>Email verification</p>
      <h1 className={styles.title}>Verifying your email</h1>
      <p className={styles.description}>Please wait while we confirm your account.</p>
      <div className={styles.progressBar} aria-hidden="true" />
    </section>
  );
}
