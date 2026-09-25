"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { clearAccessToken, getErrorMessage } from "orval-data-handler";
import { useLogout } from "@/service-api/generated/endpoints/auth/auth";
import { getGetProfileQueryKey } from "@/service-api/generated/endpoints/profile/profile";

import styles from "../styles/account-page.module.css";

export function AccountActions() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        clearAccessToken();
        queryClient.removeQueries({ queryKey: getGetProfileQueryKey() });
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
      {logoutMutation.isError ? (
        <p className={styles.actionError} role="alert">
          {getErrorMessage(logoutMutation.error)}
        </p>
      ) : null}
    </div>
  );
}
