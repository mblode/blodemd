import { AuthView } from "@/components/auth/auth-view";

export default function SignUpPage({
  searchParams,
}: {
  searchParams?: { email?: string };
}) {
  return <AuthView mode="signup" prefillEmail={searchParams?.email} />;
}
