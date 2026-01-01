import { getWorkspaceBySlug, listProjects } from "@repo/api-client";
import { notFound } from "next/navigation";
import { ProjectSettingsForm } from "@/components/project-settings/project-settings-form";

export default async function ProjectSettingsPage({
  params,
}: {
  params: { workspaceSlug: string; projectSlug: string };
}) {
  const workspace = await getWorkspaceBySlug(params.workspaceSlug).catch(
    () => null
  );
  if (!workspace) {
    return notFound();
  }

  const projects = await listProjects(workspace.id).catch(() => []);
  const project = projects.find((item) => item.slug === params.projectSlug);
  if (!project) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-semibold text-2xl">Project settings</h1>
        <p className="text-muted-foreground text-sm">
          {params.workspaceSlug} / {params.projectSlug}
        </p>
      </header>
      <ProjectSettingsForm project={project} />
    </div>
  );
}
