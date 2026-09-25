"use client";

import { useEffect } from "react";

import { useGetProfile } from "@/service-api/generated/endpoints/profile/profile";

import { CloseIcon } from "./auth-icons";
import { LoginForm } from "./login-form";
import styles from "../styles/login-modal.module.css";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const profileQuery = useGetProfile({
    query: {
      retry: false,
    },
  });

  useEffect(() => {
    if (isOpen && profileQuery.isSuccess) {
      onClose();
    }
  }, [isOpen, onClose, profileQuery.isSuccess]);

  if (!isOpen || profileQuery.isSuccess) {
    return null;
  }

  return (
    <div
      aria-labelledby="login-modal-title"
      aria-modal="true"
      className={styles.overlay}
      role="dialog"
    >
      <button
        aria-label="Close login modal"
        className={styles.backdrop}
        onClick={onClose}
        type="button"
      />
      <div className={styles.modalPanel}>
        <button
          aria-label="Close login modal"
          className={styles.closeButton}
          onClick={onClose}
          type="button"
        >
          <CloseIcon />
        </button>
        <div id="login-modal-title" className={styles.srOnly}>
          Login
        </div>
        <LoginForm onLoginSuccess={onClose} />
      </div>
    </div>
  );
}
