"use client";

import Link from "next/link";

import { useVerifyEmailToken } from "../hooks/use-verify-email-token";
import styles from "../styles/verify-email-page.module.css";

type VerifyEmailCardProps = {
  token?: string;
};

function VerifyEmailCopy({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className={styles.copyGroup}>
      <p className={styles.eyebrow}>Email verification</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{children}</p>
    </div>
  );
}

export function VerifyEmailCard({ token }: VerifyEmailCardProps) {
  const verification = useVerifyEmailToken(token);

  if (verification.isMissingToken) {
    return (
      <section className={styles.card}>
        <VerifyEmailCopy title="Verification link is missing">
          The verification link does not include a token. Please use the latest link
          from your email.
        </VerifyEmailCopy>
        <Link className={styles.primaryLink} href="/">
          Back home
        </Link>
      </section>
    );
  }

  if (verification.isSuccess) {
    return (
      <section className={styles.card}>
        <VerifyEmailCopy title="Your email is verified">
          Your account is ready. You can continue to the home page.
        </VerifyEmailCopy>
        <Link className={styles.primaryLink} href="/?login=1">
          Continue
        </Link>
      </section>
    );
  }

  if (verification.isError) {
    return (
      <section className={styles.card}>
        <VerifyEmailCopy title="We could not verify your email">
          {verification.errorMessage}
        </VerifyEmailCopy>
        <button className={styles.primaryLink} onClick={verification.retry} type="button">
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <VerifyEmailCopy title="Verifying your email">
        Please wait while we confirm your account.
      </VerifyEmailCopy>
      <div className={styles.progressBar} aria-hidden="true" />
    </section>
  );
}
