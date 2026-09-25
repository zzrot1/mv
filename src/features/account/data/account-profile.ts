import type { PickUserExcludeKeyofUserPassword } from "@/service-api/generated/models";

import type { AccountProfile } from "../model/account";

export function mapAccountProfile(
  user: PickUserExcludeKeyofUserPassword,
): AccountProfile {
  const fullName = user.name || getNameFromEmail(user.email);

  return {
    addressLine1: user.addressLine1,
    addressLine2: user.addressLine2,
    city: user.city,
    country: user.country,
    county: user.county,
    email: user.email,
    fullName,
    hasAddresses: Boolean(
      user.addressLine1 ||
      user.addressLine2 ||
      user.city ||
      user.county ||
      user.postalCode ||
      user.country,
    ),
    initials: getInitials(fullName, user.email),
    marketingEmailEnabled: false,
    name: user.name,
    phone: user.phone,
    postalCode: user.postalCode,
  };
}

function getNameFromEmail(email: string) {
  return email.split("@")[0] || email;
}

function getInitials(fullName: string, email: string) {
  const initials = fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || email[0]?.toUpperCase() || "?";
}
