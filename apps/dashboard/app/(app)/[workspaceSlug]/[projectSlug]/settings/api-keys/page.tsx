import { getWorkspaceBySlug, listApiKeys } from "@repo/api-client";
import { notFound } from "next/navigation";
import { ApiKeysPanel } from "@/components/api-keys/api-keys-panel";

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
  const apiKeys = await listApiKeys(workspace.id).catch(() => []);

  return <ApiKeysPanel initialKeys={apiKeys} workspaceId={workspace.id} />;
}
