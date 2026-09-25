import { redirect } from "next/navigation";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { login } = await searchParams;
  const shouldOpenLogin = Array.isArray(login) ? login[0] === "1" : login === "1";

  redirect(shouldOpenLogin ? "/products?login=1" : "/products");
}
