import type { ReactNode } from "react";

import styles from "../styles/login-modal.module.css";

type LoginSocialButtonProps = {
  children: ReactNode;
  icon: ReactNode;
};

export function LoginSocialButton({ children, icon }: LoginSocialButtonProps) {
  return (
    <button className={styles.socialButton} type="button">
      <span className={styles.socialIcon}>{icon}</span>
      {children}
    </button>
  );
}
