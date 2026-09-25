import { GridSmallBackground } from "@/components";
import styles from "../../page.module.css";

const products = [
  { name: "Architectural Landscapes", price: "EUR 49" },
  { name: "The Art of Gathering", price: "EUR 39" },
  { name: "Modern Living Spaces", price: "EUR 55" },
];

export default function ProductsPage() {
  return (
    <GridSmallBackground minHeight="calc(100svh - var(--header-height) - var(--header-search-height))">
      <main className={styles.productsContent}>
        <p className={styles.eyebrow}>Products</p>
        <h1 className={styles.productsTitle}>Curated visual books.</h1>
        <p className={styles.productsCopy}>
          The products page uses the same standalone background component, ready
          for the real product grid once the API is connected.
        </p>
        <div className={styles.productGrid}>
          {products.map((product) => (
            <article className={styles.productCard} key={product.name}>
              <div className={styles.productMedia} />
              <h2 className={styles.productName}>{product.name}</h2>
              <p className={styles.productPrice}>{product.price}</p>
            </article>
          ))}
        </div>
      </main>
    </GridSmallBackground>
  );
}
