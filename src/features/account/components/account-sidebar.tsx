import type { AccountNavigationItem, AccountSection } from "../model/account";
import styles from "../styles/account-page.module.css";

type AccountSidebarProps = {
  activeSection: AccountSection;
  items: AccountNavigationItem[];
  onSectionChange: (section: AccountSection) => void;
};

export function AccountSidebar({
  activeSection,
  items,
  onSectionChange,
}: AccountSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <nav aria-label="Account navigation" className={styles.navigation}>
        {items.map((item) => (
          <button
            aria-current={activeSection === item.id ? "page" : undefined}
            className={
              activeSection === item.id ? styles.activeLink : styles.navigationLink
            }
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
