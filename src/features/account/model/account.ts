export type AccountSection = "orders" | "profile";

export type AccountNavigationItem = {
  id: AccountSection;
  label: string;
};

export type AccountProfile = {
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  country?: string | null;
  county?: string | null;
  initials: string;
  fullName: string;
  email: string;
  hasAddresses: boolean;
  marketingEmailEnabled: boolean;
  name?: string | null;
  phone?: string | null;
  postalCode?: string | null;
};
