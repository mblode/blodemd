import {
  getGitSettings,
  getWorkspaceBySlug,
  listProjects,
} from "@repo/api-client";
import { notFound } from "next/navigation";
import { GitSettingsForm } from "@/components/git-settings/git-settings-form";

export default async function SettingsSectionPage({
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

  const settings = await getGitSettings(project.id).catch(() => null);

  return <GitSettingsForm projectId={project.id} settings={settings} />;
}
