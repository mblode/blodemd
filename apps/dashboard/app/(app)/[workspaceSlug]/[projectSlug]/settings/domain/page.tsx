import {
  getWorkspaceBySlug,
  listDomains,
  listProjects,
} from "@repo/api-client";
import { notFound } from "next/navigation";
import { DomainSetup } from "@/components/domain-settings/domain-setup";

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

  const domains = await listDomains(project.id).catch(() => []);

  return (
    <DomainSetup
      domains={domains}
      projectId={project.id}
      projectSlug={project.slug}
    />
  );
}
