import type { AccountNavigationItem, AccountProfile } from "../model/account";
import { useDataPage } from "orval-data-handler";
import { useGetProfile } from "@/service-api/generated/endpoints/profile/profile";

import { AccountDataPage } from "../data/account-data-page";

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
  const { isLoading, accountProfile } = useDataPage(
    AccountDataPage,
    profileQuery,
  );

  return {
    isLoading,
    navigationItems: accountNavigationItems,
    profile: accountProfile,
  };
}
