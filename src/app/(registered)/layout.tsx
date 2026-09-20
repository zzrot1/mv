import { RegisteredAuthGuard } from "@/features/auth/components/registered-auth-guard";

type RegisteredLayoutProps = {
  children: React.ReactNode;
};

export default function RegisteredLayout({ children }: RegisteredLayoutProps) {
  return <RegisteredAuthGuard>{children}</RegisteredAuthGuard>;
}
