"use client";

import { type FormEvent, useEffect } from "react";

import { getErrorMessage } from "orval-data-handler";
import { useUpdateProfile } from "@/service-api/generated/endpoints/profile/profile";

import type { AccountProfile } from "../model/account";
import styles from "../styles/account-page.module.css";

type AddressModalProps = {
  isOpen: boolean;
  onClose: () => void;
  profile: AccountProfile;
};

export function AddressModal({ isOpen, onClose, profile }: AddressModalProps) {
  const nameParts = splitName(profile.name || "");
  const updateProfile = useUpdateProfile({
    mutation: {
      meta: {
        successMessage: "Address saved.",
      },
      onSuccess: () => {
        onClose();
      },
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const firstName = readFormValue(formData, "firstName");
    const lastName = readFormValue(formData, "lastName");
    const name = [firstName, lastName].filter(Boolean).join(" ");

    updateProfile.mutate({
      data: {
        addressLine1: readFormValue(formData, "addressLine1"),
        addressLine2: readFormValue(formData, "addressLine2"),
        city: readFormValue(formData, "city"),
        country: readFormValue(formData, "country"),
        name: name || profile.name || null,
        phone: readFormValue(formData, "phone"),
        postalCode: readFormValue(formData, "postalCode"),
      },
    });
  }

  return (
    <div className={styles.modalOverlay} role="presentation">
      <button
        aria-label="Close address modal"
        className={styles.modalBackdrop}
        onClick={onClose}
        type="button"
      />
      <section
        aria-labelledby="address-modal-title"
        aria-modal="true"
        className={styles.addressModal}
        role="dialog"
      >
        <div className={styles.addressModalHeader}>
          <h2 className={styles.addressModalTitle} id="address-modal-title">
            {profile.hasAddresses ? "Edit address" : "Add address"}
          </h2>
          <button
            aria-label="Close address modal"
            className={styles.addressModalClose}
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </div>

        <form className={styles.addressForm} onSubmit={handleSubmit}>
          <label className={styles.addressField}>
            <span>Country/region</span>
            <select
              className={styles.addressInput}
              defaultValue={profile.country || "DE"}
              name="country"
            >
              <option value="DE">Germany</option>
              <option value="RO">Romania</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="FR">France</option>
            </select>
          </label>

          <div className={styles.addressGrid}>
            <label className={styles.addressField}>
              <span className={styles.srOnly}>First name</span>
              <input
                className={styles.addressInput}
                defaultValue={nameParts.firstName}
                name="firstName"
                placeholder="First name"
              />
            </label>
            <label className={styles.addressField}>
              <span className={styles.srOnly}>Last name</span>
              <input
                className={styles.addressInput}
                defaultValue={nameParts.lastName}
                name="lastName"
                placeholder="Last name"
              />
            </label>
          </div>

          <input className={styles.addressInput} name="company" placeholder="Company" />
          <input
            className={styles.addressInput}
            defaultValue={profile.addressLine1 || ""}
            name="addressLine1"
            placeholder="Street and house number"
            required
          />
          <input
            className={styles.addressInput}
            defaultValue={profile.addressLine2 || ""}
            name="addressLine2"
            placeholder="Additional address (optional)"
          />

          <div className={styles.addressGrid}>
            <input
              className={styles.addressInput}
              defaultValue={profile.postalCode || ""}
              name="postalCode"
              placeholder="Postal code"
            />
            <input
              className={styles.addressInput}
              defaultValue={profile.city || ""}
              name="city"
              placeholder="City"
            />
          </div>

          <input
            className={styles.addressInput}
            defaultValue={profile.phone || "+49"}
            name="phone"
            placeholder="Phone"
          />

          {updateProfile.isError ? (
            <p className={styles.actionError} role="alert">
              {getErrorMessage(updateProfile.error)}
            </p>
          ) : null}

          <div className={styles.addressModalActions}>
            <button className={styles.textButton} onClick={onClose} type="button">
              Cancel
            </button>
            <button
              className={styles.secondaryButton}
              disabled={updateProfile.isPending}
              type="submit"
            >
              {updateProfile.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function readFormValue(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();

  return value || null;
}

function splitName(fullName: string) {
  const [firstName = "", ...lastNameParts] = fullName.split(" ");

  return {
    firstName,
    lastName: lastNameParts.join(" "),
  };
}
