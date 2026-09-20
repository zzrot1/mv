import type { Metadata } from "next";

import { AccountPage } from "@/features/account/pages/account-page";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage profile details, addresses, and account preferences.",
};

export default function Page() {
  return <AccountPage />;
}
