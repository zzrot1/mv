"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { HeaderAccountAction } from "./header-account-action";
import styles from "./header.module.css";

type HeaderLink = {
  href: string;
  label: string;
};

type HeaderProps = {
  announcement?: string;
  mainLinks?: HeaderLink[];
  utilityLinks?: HeaderLink[];
};

const defaultMainLinks: HeaderLink[] = [
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
];

const defaultUtilityLinks: HeaderLink[] = [
  { href: "/account", label: "Account" },
  { href: "/search", label: "Search" },
  { href: "/cart", label: "Cart" },
];

function Announcement({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <div className={styles["header__announcement"]}>{message}</div>;
}

function Navigation({
  ariaLabel,
  className,
  links,
}: {
  ariaLabel: string;
  className: string;
  links: HeaderLink[];
}) {
  return (
    <nav aria-label={ariaLabel} className={className}>
      {links.map((link) => (
        <Link className={styles["header__link"]} href={link.href} key={link.href}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function CartIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
      <path
        d="M3.5 5h2.25l1.9 10.4h9.9l2.1-7.4H7.05M9 20a.75.75 0 1 0 0-1.5A.75.75 0 0 0 9 20Zm8 0a.75.75 0 1 0 0-1.5A.75.75 0 0 0 17 20Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
      <path
        d="m20 20-4.45-4.45M18 10.75a7.25 7.25 0 1 1-14.5 0 7.25 7.25 0 0 1 14.5 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function UtilityIcon({ label }: { label: string }) {
  if (label === "Cart") {
    return <CartIcon />;
  }

  return label;
}

function UtilityNavigation({
  isSearchOpen,
  links,
  onSearchOpen,
}: {
  isSearchOpen: boolean;
  links: HeaderLink[];
  onSearchOpen: () => void;
}) {
  return (
    <nav aria-label="Utility navigation" className={styles["header__utilities"]}>
      {links.map((link) => (
        link.label === "Account" ? (
          <HeaderAccountAction key={link.href} />
        ) : link.label === "Search" ? (
          <button
            aria-expanded={isSearchOpen}
            aria-label="Open search"
            className={styles["header__icon-link"]}
            key={link.href}
            onClick={onSearchOpen}
            title="Search"
            type="button"
          >
            <SearchIcon />
          </button>
        ) : (
          <Link
            aria-label={link.label}
            className={styles["header__icon-link"]}
            href={link.href}
            key={link.href}
            title={link.label}
          >
            <UtilityIcon label={link.label} />
          </Link>
        )
      ))}
    </nav>
  );
}

function SearchPanel({
  inputId,
  inputRef,
  isOpen,
  onClose,
}: {
  inputId: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <div
      aria-hidden={!isOpen}
      className={`${styles["header__search-panel"]} ${
        isOpen ? styles["header__search-panel--open"] : ""
      }`}
    >
      <label className={styles["header__search-label"]} htmlFor={inputId}>
        <SearchIcon />
        <span className={styles["header__search-divider"]} />
        <input
          className={styles["header__search-input"]}
          id={inputId}
          placeholder="Search for..."
          ref={inputRef}
          tabIndex={isOpen ? 0 : -1}
          type="search"
        />
      </label>
      <button
        aria-label="Close search"
        className={styles["header__search-close"]}
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
        type="button"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

export function Header({
  announcement,
  mainLinks = defaultMainLinks,
  utilityLinks = defaultUtilityLinks,
}: HeaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    inputRef.current?.focus();
  }, [isSearchOpen]);

  return (
    <header className={styles.header}>
      <Announcement message={announcement} />
      <div className={styles["header__bar"]}>
        <Navigation
          ariaLabel="Primary navigation"
          className={styles["header__nav"]}
          links={mainLinks}
        />
        <UtilityNavigation
          isSearchOpen={isSearchOpen}
          links={utilityLinks}
          onSearchOpen={() => setIsSearchOpen(true)}
        />
      </div>
      <SearchPanel
        inputId={inputId}
        inputRef={inputRef}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
}
