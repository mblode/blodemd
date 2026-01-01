import {
  listDeployments,
  listProjects,
  listWorkspaces,
} from "@repo/api-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const formatStatus = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export default async function PreviewsPage() {
  const workspaces = await listWorkspaces().catch(() => []);
  const projectsByWorkspace = await Promise.all(
    workspaces.map((workspace) => listProjects(workspace.id).catch(() => []))
  );
  const projects = projectsByWorkspace.flat();
  const deploymentsByProject = await Promise.all(
    projects.map((project) => listDeployments(project.id).catch(() => []))
  );
  const previewDeployments = deploymentsByProject
    .flat()
    .filter((deployment) => deployment.environment === "preview")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  const projectMap = new Map(projects.map((project) => [project.id, project]));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-semibold text-2xl">Preview deployments</h1>
        <p className="text-muted-foreground text-sm">
          Monitor branch previews across every tenant.
        </p>
      </header>

      <div className="space-y-3">
        {previewDeployments.length === 0 ? (
          <Card className="border-border/60 bg-card/70">
            <CardContent className="py-4 text-muted-foreground text-sm">
              No preview deployments yet.
            </CardContent>
          </Card>
        ) : (
          previewDeployments.map((preview) => {
            const project = projectMap.get(preview.projectId);
            return (
              <Card className="border-border/60 bg-card/70" key={preview.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-semibold text-sm">
                      {project?.name ?? "Project"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {preview.previewUrl ?? preview.branch}
                    </p>
                  </div>
                  <Badge className="rounded-full" variant="accent">
                    {formatStatus(preview.status)}
                  </Badge>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
