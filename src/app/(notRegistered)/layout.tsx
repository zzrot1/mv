import { Header } from "@/components";

type NotRegisteredLayoutProps = {
  children: React.ReactNode;
};

export default function NotRegisteredLayout({ children }: NotRegisteredLayoutProps) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
