import Link from "next/link";
import styles from "./header.module.css";

type HeaderLink = {
  href: string;
  label: string;
};

type HeaderProps = {
  announcement?: string;
  brandHref?: string;
  brandLabel?: string;
  mainLinks?: HeaderLink[];
  utilityLinks?: HeaderLink[];
};

const defaultMainLinks: HeaderLink[] = [
  { href: "/", label: "Home" },
  { href: "/collections/new-releases", label: "New" },
  { href: "/pages/all-categories", label: "Categories" },
  { href: "/pages/about-us", label: "About" },
];

const defaultUtilityLinks: HeaderLink[] = [
  { href: "/account/login", label: "Login" },
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

function BrandLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link className={styles["header__brand"]} href={href}>
      {label}
    </Link>
  );
}

export function Header({
  announcement = "Free shipping over 49 EUR",
  brandHref = "/",
  brandLabel = "gestalten",
  mainLinks = defaultMainLinks,
  utilityLinks = defaultUtilityLinks,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <Announcement message={announcement} />
      <div className={styles["header__bar"]}>
        <Navigation
          ariaLabel="Primary navigation"
          className={styles["header__nav"]}
          links={mainLinks}
        />
        <BrandLink href={brandHref} label={brandLabel} />
        <Navigation
          ariaLabel="Utility navigation"
          className={styles["header__utilities"]}
          links={utilityLinks}
        />
      </div>
    </header>
  );
}
