import { ProjectSettingsLayoutClient } from "@/components/project-settings/project-settings-layout-client";

export default async function ProjectSettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string; projectSlug: string }>;
}) {
  const resolvedParams = await params;
  return (
    <ProjectSettingsLayoutClient
      projectSlug={resolvedParams.projectSlug}
      workspaceSlug={resolvedParams.workspaceSlug}
    >
      {children}
    </ProjectSettingsLayoutClient>
  );
}
