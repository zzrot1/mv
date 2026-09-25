import type { CSSProperties } from "react";

import { GridSmallBackground, ThreeDCardEffect } from "@/components";
import styles from "../../page.module.css";

type Product = {
  accent: string;
  background: string;
  foreground: string;
  name: string;
  price: string;
  subtitle: string;
  variant: "photo" | "landscape" | "minimal" | "dark" | "blue" | "rose";
};

const products: Product[] = [
  {
    accent: "#b7ecff",
    background: "#ff8200",
    foreground: "#dff7ff",
    name: "Herrlich Hosting (Deutsche Ausgabe)",
    price: "45.00 EUR",
    subtitle: "Hannah Kleberg",
    variant: "photo",
  },
  {
    accent: "#e34435",
    background: "#dceff7",
    foreground: "#d93832",
    name: "Wanderlust Europe",
    price: "45.00 EUR",
    subtitle: "The Great European Hike",
    variant: "landscape",
  },
  {
    accent: "#8f705f",
    background: "#c8b8a3",
    foreground: "#4d3c32",
    name: "Soft Minimal",
    price: "70.00 EUR",
    subtitle: "A sensory approach",
    variant: "minimal",
  },
  {
    accent: "#f4ede0",
    background: "#141414",
    foreground: "#f6f0e8",
    name: "New Rural",
    price: "60.00 EUR",
    subtitle: "Where to find",
    variant: "dark",
  },
  {
    accent: "#f6d05f",
    background: "#8eb3c8",
    foreground: "#f7f4eb",
    name: "Stay Wild",
    price: "50.00 EUR",
    subtitle: "Cabins, retreats, escapes",
    variant: "blue",
  },
  {
    accent: "#3d2a29",
    background: "#f0b5bc",
    foreground: "#3d2a29",
    name: "Tasteful",
    price: "42.00 EUR",
    subtitle: "New interiors",
    variant: "rose",
  },
];

function ProductCover({ product }: { product: Product }) {
  const style = {
    "--product-cover-accent": product.accent,
    "--product-cover-background": product.background,
    "--product-cover-foreground": product.foreground,
  } as CSSProperties;

  return (
    <div
      aria-label={`${product.name} cover`}
      className={`${styles.productCover} ${styles[`productCover_${product.variant}`]}`}
      style={style}
    >
      <div className={styles.productCover__spine} />
      <div className={styles.productCover__art} />
      <p className={styles.productCover__title}>{product.name}</p>
      <p className={styles.productCover__subtitle}>{product.subtitle}</p>
      <span className={styles.productCover__mark}>gestalten</span>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className={styles.productCard}>
      <ThreeDCardEffect
        className={styles.product3dCard}
        contentClassName={styles.product3dCard__content}
        footer={
          <div className={styles.productInfo}>
            <h2 className={styles.productName}>{product.name}</h2>
            <p className={styles.productPrice}>{product.price}</p>
          </div>
        }
      >
        <ProductCover product={product} />
      </ThreeDCardEffect>
    </article>
  );
}

export default function ProductsPage() {
  return (
    <GridSmallBackground minHeight="calc(100svh - var(--header-height) - var(--header-search-height))">
      <main className={styles.productsContent}>
        <div className={styles.productGrid}>
          {products.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
      </main>
    </GridSmallBackground>
  );
}
