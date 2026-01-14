import { bootstrapUser, listWorkspaces } from "@repo/api-client";
import { createNextServerSupabaseClient } from "@repo/supabase/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createNextServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/signin");
  }

  if (user.email) {
    await bootstrapUser({
      userId: user.id,
      email: user.email,
      fullName:
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : undefined,
      avatarUrl:
        typeof user.user_metadata?.avatar_url === "string"
          ? user.user_metadata.avatar_url
          : undefined,
    }).catch(() => null);
  }

  const workspaces = await listWorkspaces().catch(() => []);

  return <DashboardShell workspaces={workspaces}>{children}</DashboardShell>;
}
