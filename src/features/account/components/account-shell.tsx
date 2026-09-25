"use client";

import { useState } from "react";

import type {
  AccountNavigationItem,
  AccountProfile,
  AccountSection,
} from "../model/account";
import { AccountActions } from "./account-actions";
import { AccountLoginControl } from "./account-login-control";
import { AccountSidebar } from "./account-sidebar";
import { MarketingPreferences } from "./marketing-preferences";
import { OrdersEmptyState } from "./orders-empty-state";
import { ProfileSection } from "./profile-section";
import styles from "../styles/account-page.module.css";

type AccountShellProps = {
  navigationItems: AccountNavigationItem[];
  profile: AccountProfile;
};

export function AccountShell({ navigationItems, profile }: AccountShellProps) {
  const [activeSection, setActiveSection] = useState<AccountSection>("profile");

  return (
    <main className={styles.page}>
      <AccountSidebar
        activeSection={activeSection}
        items={navigationItems}
        onSectionChange={setActiveSection}
      />
      <section className={styles.content} aria-label="Account">
        <AccountLoginControl />
        <div className={styles.contentInner}>
          {activeSection === "orders" ? (
            <OrdersEmptyState profile={profile} />
          ) : (
            <>
              <ProfileSection profile={profile} />
              <MarketingPreferences emailEnabled={profile.marketingEmailEnabled} />
              <AccountActions />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
