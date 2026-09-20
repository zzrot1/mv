"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { getErrorMessage } from "@/core/api-error";
import { useLogout } from "@/service-api/generated/endpoints/auth/auth";

import styles from "../styles/account-page.module.css";

export function AccountActions() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.clear();
        router.push("/");
        router.refresh();
      },
    },
  });

  function handleSignOut() {
    logoutMutation.mutate({
      data: {},
    });
  }

  return (
    <div className={styles.actions}>
      <button
        className={styles.secondaryButton}
        disabled={logoutMutation.isPending}
        onClick={handleSignOut}
        type="button"
      >
        {logoutMutation.isPending ? "Signing out..." : "Sign out"}
      </button>
      <button className={styles.textButton} type="button">
        Sign out of all devices
      </button>
      {logoutMutation.isError ? (
        <p className={styles.actionError} role="alert">
          {getErrorMessage(logoutMutation.error)}
        </p>
      ) : null}
    </div>
  );
}
