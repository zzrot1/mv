"use client";

import { LoginModal } from "@/features/auth/components/login-modal";
import { useLoginModal } from "@/features/auth/hooks/use-login-modal";
import { getErrorStatus } from "orval-data-handler";
import { useGetProfile } from "@/service-api/generated/endpoints/profile/profile";

import styles from "../styles/auth-gate.module.css";

type RegisteredAuthGuardProps = {
  children: React.ReactNode;
};

export function RegisteredAuthGuard({ children }: RegisteredAuthGuardProps) {
  const loginModal = useLoginModal();
  const profileQuery = useGetProfile({
    query: {
      retry: false,
    },
  });
  const errorStatus = getErrorStatus(profileQuery.error);
  const isUnauthorized = errorStatus === 401 || errorStatus === 403;

  if (profileQuery.isLoading) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>Account</p>
          <h1 className={styles.title}>Checking your session</h1>
          <p className={styles.description}>Please wait a moment.</p>
        </section>
      </main>
    );
  }

  if (profileQuery.isSuccess) {
    return children;
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Account</p>
        <h1 className={styles.title}>Sign in to continue</h1>
        <p className={styles.description}>
          {isUnauthorized
            ? "You need to log in before accessing your account."
            : "We could not confirm your session. Please log in again."}
        </p>
        <button
          className={styles.primaryButton}
          onClick={loginModal.openLoginModal}
          type="button"
        >
          Login or create account
        </button>
      </section>
      <LoginModal isOpen={loginModal.isOpen} onClose={loginModal.closeLoginModal} />
    </main>
  );
}
