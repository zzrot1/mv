import { Footer, FooterBenefits, Header } from "@/components";
import { LoginQueryParamHandler } from "@/features/auth/components/login-query-param-handler";
import styles from "./layout.module.css";

type NotRegisteredLayoutProps = {
  children: React.ReactNode;
};

export default function NotRegisteredLayout({ children }: NotRegisteredLayoutProps) {
  return (
    <div className={styles.layout}>
      <Header />
      <LoginQueryParamHandler />
      <main className={styles.layout__content}>{children}</main>
      <FooterBenefits />
      <Footer />
    </div>
  );
}
