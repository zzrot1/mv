import styles from "../styles/account-page.module.css";

type AccountAvatarProps = {
  initials: string;
};

export function AccountAvatar({ initials }: AccountAvatarProps) {
  return <div className={styles.avatar}>{initials}</div>;
}
