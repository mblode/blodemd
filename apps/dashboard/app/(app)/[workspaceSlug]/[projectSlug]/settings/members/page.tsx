import { getWorkspaceBySlug, listMembers } from "@repo/api-client";
import { notFound } from "next/navigation";
import { MembersPanel } from "@/components/members/members-panel";

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

  const members = await listMembers(workspace.id).catch(() => []);

  return <MembersPanel initialMembers={members} workspaceId={workspace.id} />;
}
