"use client";

import type { Workspace } from "@repo/contracts";
import { createBrowserSupabaseClient } from "@repo/supabase/browser";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const baseNavItems = [
  { label: "Overview", href: "/" },
  { label: "Tenants", href: "/tenants" },
  { label: "Domains", href: "/domains" },
  { label: "Previews", href: "/previews" },
  { label: "Settings", href: "/settings" },
];

const supportItems = [
  { label: "Documentation", href: "/docs" },
  { label: "Invite members", href: "/invite" },
  { label: "Support", href: "/support" },
];

const reservedRoutes = new Set([
  "tenants",
  "domains",
  "previews",
  "settings",
  "signin",
  "signup",
  "docs",
  "invite",
  "support",
]);

export const DashboardShell = ({
  children,
  workspaces,
}: {
  children: React.ReactNode;
  workspaces: Workspace[];
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split("/").filter(Boolean);
  const [workspaceSlug, projectSlug] = segments;
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const isProjectRoute =
    segments.length >= 2 &&
    typeof workspaceSlug === "string" &&
    typeof projectSlug === "string" &&
    !reservedRoutes.has(workspaceSlug) &&
    workspaceSlug !== "api";

  const projectNavItems = isProjectRoute
    ? [
        {
          label: "Overview",
          href: `/${workspaceSlug}/${projectSlug}`,
        },
        {
          label: "Editor",
          href: `/${workspaceSlug}/${projectSlug}/editor/main`,
        },
        {
          label: "Settings",
          href: `/${workspaceSlug}/${projectSlug}/settings`,
        },
      ]
    : baseNavItems;

  const projectLabel = isProjectRoute
    ? `${workspaceSlug} / ${projectSlug}`
    : null;

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email ?? null);
    };
    load();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-[260px_1fr]">
        <aside className="border-border/60 border-r bg-card/70 backdrop-blur">
          <div className="flex h-full flex-col gap-8 p-6">
            <div>
              <div className="text-muted-foreground text-xs uppercase tracking-[0.4em]">
                neue
              </div>
              {projectLabel && (
                <p className="mt-3 text-muted-foreground text-xs">
                  {projectLabel}
                </p>
              )}
            </div>

            <nav className="space-y-1">
              {projectNavItems.map((item) => (
                <Link
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-muted-foreground text-sm transition",
                    pathname === item.href
                      ? "bg-muted/50 text-foreground"
                      : "hover:bg-muted/40 hover:text-foreground"
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {!isProjectRoute && (
              <div className="space-y-3">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.3em]">
                  Active tenants
                </p>
                <div className="space-y-1">
                  {workspaces.map((workspace) => (
                    <Link
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-muted-foreground text-sm transition hover:bg-muted/40 hover:text-foreground"
                      href={`/tenants/${workspace.slug}`}
                      key={workspace.slug}
                    >
                      {workspace.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto space-y-3">
              <p className="text-muted-foreground text-xs uppercase tracking-[0.3em]">
                Support
              </p>
              <div className="space-y-1">
                {supportItems.map((item) => (
                  <Link
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-muted-foreground text-sm transition hover:bg-muted/40 hover:text-foreground"
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-muted-foreground text-xs">
                <p className="truncate">{userEmail ?? "Signed in"}</p>
                <button
                  className="mt-2 font-semibold text-primary text-xs"
                  onClick={handleSignOut}
                  type="button"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
};
