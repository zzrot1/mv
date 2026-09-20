import type { Metadata } from "next";

import { VerifyEmailPage } from "@/features/auth/pages/verify-email-page";

export const metadata: Metadata = {
  title: "Verify email | gestalten",
  description: "Confirm your email address.",
};

export default async function Page({
  searchParams,
}: PageProps<"/verify-email">) {
  const { token } = await searchParams;
  const tokenValue = Array.isArray(token) ? token[0] : token;

  return <VerifyEmailPage token={tokenValue} />;
}
