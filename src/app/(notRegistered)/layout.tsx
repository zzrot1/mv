import { Footer, FooterBenefits, Header } from "@/components";
import styles from "./layout.module.css";

type NotRegisteredLayoutProps = {
  children: React.ReactNode;
};

export default function NotRegisteredLayout({ children }: NotRegisteredLayoutProps) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.layout__content}>{children}</main>
      <FooterBenefits />
      <Footer />
    </div>
  );
}
