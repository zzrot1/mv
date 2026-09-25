import { useMemo } from "react";

import { useGetProfile } from "@/service-api/generated/endpoints/profile/profile";

import { mapAccountProfile } from "../data/account-profile";
import type { AccountNavigationItem } from "../model/account";

const accountNavigationItems: AccountNavigationItem[] = [
  {
    id: "orders",
    label: "Orders",
  },
  {
    id: "profile",
    label: "Profile",
  },
];

export function useAccountProfile() {
  const profileQuery = useGetProfile({
    query: {
      retry: false,
    },
  });

  const user = profileQuery.data;
  const profile = useMemo(
    () => (user ? mapAccountProfile(user) : undefined),
    [user],
  );

  return {
    isLoading: profileQuery.isLoading,
    navigationItems: accountNavigationItems,
    profile,
  };
}
