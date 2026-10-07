import type { ReactNode } from "react";

function Icon({ children, size = 16 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size}
    >
      {children}
    </svg>
  );
}

export function SearchIcon() {
  return (
    <Icon>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  );
}

export function SortIcon({ direction }: { direction: "asc" | "desc" | undefined }) {
  if (direction === "asc") {
    return (
      <Icon size={14}>
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </Icon>
    );
  }

  if (direction === "desc") {
    return (
      <Icon size={14}>
        <path d="M12 5v14" />
        <path d="m19 12-7 7-7-7" />
      </Icon>
    );
  }

  return (
    <Icon size={14}>
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </Icon>
  );
}

export function FilterIcon() {
  return (
    <Icon size={14}>
      <path d="M3 5h18l-7 8v6l-4 2v-8L3 5z" />
    </Icon>
  );
}

export function MoreIcon() {
  return (
    <Icon>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </Icon>
  );
}

export function ChevronsLeftIcon() {
  return (
    <Icon>
      <path d="m11 17-5-5 5-5" />
      <path d="m18 17-5-5 5-5" />
    </Icon>
  );
}

export function ChevronsRightIcon() {
  return (
    <Icon>
      <path d="m6 17 5-5-5-5" />
      <path d="m13 17 5-5-5-5" />
    </Icon>
  );
}

export function ChevronLeftIcon() {
  return (
    <Icon>
      <path d="m15 18-6-6 6-6" />
    </Icon>
  );
}

export function ChevronRightIcon() {
  return (
    <Icon>
      <path d="m9 18 6-6-6-6" />
    </Icon>
  );
}
