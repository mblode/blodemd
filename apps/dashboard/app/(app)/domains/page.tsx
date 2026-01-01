import { listDomains, listProjects, listWorkspaces } from "@repo/api-client";
import { StatusPill } from "@/components/status-pill";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function DomainsPage() {
  const workspaces = await listWorkspaces().catch(() => []);
  const projectsByWorkspace = await Promise.all(
    workspaces.map((workspace) => listProjects(workspace.id).catch(() => []))
  );
  const projects = projectsByWorkspace.flat();
  const domainsByProject = await Promise.all(
    projects.map((project) => listDomains(project.id).catch(() => []))
  );
  const domains = domainsByProject
    .flat()
    .sort((a, b) => a.hostname.localeCompare(b.hostname));
  const workspaceMap = new Map(
    workspaces.map((workspace) => [workspace.id, workspace])
  );
  const projectMap = new Map(projects.map((project) => [project.id, project]));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-semibold text-2xl">Domains</h1>
        <p className="text-muted-foreground text-sm">
          Track verification status for every custom domain.
        </p>
      </header>
      <div className="space-y-3">
        {domains.length === 0 ? (
          <Card className="border-border/60 bg-card/70">
            <CardContent className="py-4 text-muted-foreground text-sm">
              No domains configured yet.
            </CardContent>
          </Card>
        ) : (
          domains.map((domain) => {
            const project = projectMap.get(domain.projectId);
            const workspace = project
              ? workspaceMap.get(project.workspaceId)
              : null;
            return (
              <Card className="border-border/60 bg-card/70" key={domain.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-semibold text-sm">{domain.hostname}</p>
                    <p className="text-muted-foreground text-xs">
                      {workspace?.name ?? "Workspace"} ·{" "}
                      {project?.name ?? "Project"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {project ? (
                      <Badge className="rounded-full" variant="outline">
                        {project.slug}
                      </Badge>
                    ) : null}
                    <StatusPill status={domain.status} />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
