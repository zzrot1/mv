"use client";

import { LoginModal } from "@/features/auth/components/login-modal";
import { useLoginModal } from "@/features/auth/hooks/use-login-modal";

import { AccountAvatar } from "./account-avatar";
import styles from "../styles/account-page.module.css";

type AccountLoginControlProps = {
  initials: string;
};

export function AccountLoginControl({ initials }: AccountLoginControlProps) {
  const { closeLoginModal, isOpen, openLoginModal } = useLoginModal();

  return (
    <>
      <button
        aria-label="Open login modal"
        className={styles.avatarButton}
        onClick={openLoginModal}
        type="button"
      >
        <AccountAvatar initials={initials} />
      </button>
      <LoginModal isOpen={isOpen} onClose={closeLoginModal} />
    </>
  );
}
