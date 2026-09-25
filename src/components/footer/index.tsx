import Link from "next/link";
import styles from "./footer.module.css";

type FooterLink = {
  href: string;
  label: string;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

type FooterProps = {
  brandLabel?: string;
  description?: string;
  columns?: FooterColumn[];
};

const defaultColumns: FooterColumn[] = [
  {
    title: "Shop",
    links: [
      { href: "/collections/new-releases", label: "New Releases" },
      { href: "/collections/most-popular", label: "Most Popular" },
      { href: "/pages/all-categories", label: "Categories" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/pages/about-us", label: "About Us" },
      { href: "/blogs/journal", label: "Journal" },
      { href: "/pages/careers", label: "Careers" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/pages/contact", label: "Contact" },
      { href: "/pages/shipping", label: "Shipping" },
      { href: "/pages/returns", label: "Returns" },
    ],
  },
];

function FooterIntro({
  brandLabel,
  description,
}: {
  brandLabel: string;
  description: string;
}) {
  return (
    <div className={styles["footer__intro"]}>
      <Link className={styles["footer__brand"]} href="/">
        {brandLabel}
      </Link>
      <p className={styles["footer__description"]}>{description}</p>
    </div>
  );
}

function FooterColumnGroup({ column }: { column: FooterColumn }) {
  return (
    <section className={styles["footer__column"]}>
      <h2 className={styles["footer__heading"]}>{column.title}</h2>
      <ul className={styles["footer__list"]}>
        {column.links.map((link) => (
          <li key={link.href}>
            <Link className={styles["footer__link"]} href={link.href}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Footer({
  brandLabel = "Books & Culture",
  description = "Coffee table books and visual culture for contemporary living.",
  columns = defaultColumns,
}: FooterProps) {
  return (
    <footer className={styles.footer}>
      <FooterIntro brandLabel={brandLabel} description={description} />
      {columns.map((column) => (
        <FooterColumnGroup column={column} key={column.title} />
      ))}
    </footer>
  );
}
