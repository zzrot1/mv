"use client";

import Link from "next/link";

import { LoginModal } from "@/features/auth/components/login-modal";
import { useLoginModal } from "@/features/auth/hooks/use-login-modal";
import { useGetProfile } from "@/service-api/generated/endpoints/profile/profile";

import styles from "./header.module.css";

function AccountIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
      <path
        d="M12 12.25a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5ZM4.5 21a7.5 7.5 0 0 1 15 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function HeaderAccountAction() {
  const loginModal = useLoginModal();
  const profileQuery = useGetProfile({
    query: {
      retry: false,
    },
  });

  if (profileQuery.isSuccess) {
    return (
      <Link
        aria-label="Account"
        className={styles["header__icon-link"]}
        href="/account"
        title="Account"
      >
        <AccountIcon />
      </Link>
    );
  }

  return (
    <>
      <button
        aria-label="Open login modal"
        className={styles["header__icon-link"]}
        disabled={profileQuery.isPending}
        onClick={loginModal.openLoginModal}
        title="Account"
        type="button"
      >
        <AccountIcon />
      </button>
      <LoginModal isOpen={loginModal.isOpen} onClose={loginModal.closeLoginModal} />
    </>
  );
}
