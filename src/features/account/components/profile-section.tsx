import { useState } from "react";

import type { AccountProfile } from "../model/account";
import { AddressModal } from "./address-modal";
import { AddressSummaryCard } from "./address-summary-card";
import { EmptyAddressCard } from "./empty-address-card";
import { InfoRow } from "./info-row";
import styles from "../styles/account-page.module.css";

type ProfileSectionProps = {
  profile: AccountProfile;
};

export function ProfileSection({ profile }: ProfileSectionProps) {
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  return (
    <div className={styles.profileStack}>
      <section className={styles.section} aria-labelledby="profile-heading">
        <div className={styles.sectionHeader}>
          <h1 className={styles.profileName} id="profile-heading">
            {profile.fullName}
          </h1>
          <button className={styles.outlineButton} type="button">
            Edit
          </button>
        </div>
        <InfoRow label="Email" value={profile.email} />
      </section>

      <section className={styles.section} aria-labelledby="addresses-heading">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle} id="addresses-heading">
            Addresses
          </h2>
          <button
            className={styles.outlineButton}
            onClick={() => setIsAddressModalOpen(true)}
            type="button"
          >
            {profile.hasAddresses ? "Edit" : "Add"}
          </button>
        </div>
        {profile.hasAddresses ? (
          <AddressSummaryCard profile={profile} />
        ) : (
          <EmptyAddressCard />
        )}
      </section>
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        profile={profile}
      />
    </div>
  );
}
