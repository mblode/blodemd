"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const settingsSections = [
  { label: "Domain setup", slug: "domain" },
  { label: "General", slug: "" },
  { label: "Deployment", slug: "deployment" },
  { label: "Git settings", slug: "git" },
  { label: "GitHub app", slug: "github-app" },
  { label: "Security & access", slug: "security" },
  { label: "Authentication", slug: "authentication" },
  { label: "API keys", slug: "api-keys" },
  { label: "Workspace", slug: "workspace" },
  { label: "Members", slug: "members" },
  { label: "Billing", slug: "billing" },
  { label: "My profile", slug: "profile" },
  { label: "Advanced", slug: "advanced" },
  { label: "Exports", slug: "exports" },
  { label: "Danger zone", slug: "danger" },
];

export const ProjectSettingsLayoutClient = ({
  children,
  workspaceSlug,
  projectSlug,
}: {
  children: React.ReactNode;
  workspaceSlug: string;
  projectSlug: string;
}) => {
  const pathname = usePathname();
  const base = `/${workspaceSlug}/${projectSlug}`;
  const settingsBase = `${base}/settings`;
  const projectInitials = projectSlug
    .split("-")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-6">
        <div className="rounded-xl border border-border/60 bg-card/70 p-4">
          <p className="text-muted-foreground text-xs uppercase tracking-[0.3em]">
            Subdomain
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold text-sm">
              {projectInitials}
            </div>
            <div>
              <p className="font-semibold text-sm">{projectSlug}</p>
              <p className="text-muted-foreground text-xs">{workspaceSlug}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground text-xs uppercase tracking-[0.3em]">
            Main menu
          </p>
          <nav className="space-y-1">
            {[
              { label: "Overview", href: base },
              { label: "Editor", href: `${base}/editor/main` },
              { label: "Settings", href: settingsBase },
            ].map((item) => (
              <Link
                className={cn(
                  "block rounded-lg px-3 py-2 text-muted-foreground text-sm transition",
                  pathname === item.href
                    ? "bg-muted/60 text-foreground"
                    : "hover:bg-muted/40"
                )}
                href={item.href}
                key={item.label}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground text-xs uppercase tracking-[0.3em]">
            Project settings
          </p>
          <nav className="space-y-1">
            {settingsSections.map((section) => {
              const href = section.slug
                ? `${settingsBase}/${section.slug}`
                : settingsBase;
              const isActive = pathname === href;
              return (
                <Link
                  className={cn(
                    "block rounded-lg px-3 py-2 text-muted-foreground text-sm transition",
                    isActive
                      ? "bg-muted/60 text-foreground"
                      : "hover:bg-muted/40"
                  )}
                  href={href}
                  key={section.label}
                >
                  {section.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      <div>{children}</div>
    </div>
  );
};
