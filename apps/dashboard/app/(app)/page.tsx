import {
  listDeployments,
  listDomains,
  listProjects,
  listWorkspaces,
} from "@repo/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formatStatus = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export default async function DashboardHome() {
  const workspaces = await listWorkspaces().catch(() => []);
  const projectsByWorkspace = await Promise.all(
    workspaces.map((workspace) => listProjects(workspace.id).catch(() => []))
  );
  const projects = projectsByWorkspace.flat();

  const [domainsByProject, deploymentsByProject] = await Promise.all([
    Promise.all(
      projects.map((project) => listDomains(project.id).catch(() => []))
    ),
    Promise.all(
      projects.map((project) => listDeployments(project.id).catch(() => []))
    ),
  ]);

  const domains = domainsByProject.flat();
  const deployments = deploymentsByProject.flat();
  const domainsCount = domains.length;
  const previewsCount = deployments.filter(
    (deployment) => deployment.environment === "preview"
  ).length;

  const projectMap = new Map(projects.map((project) => [project.id, project]));
  const recentDeployments = deployments
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-semibold text-3xl">Docs control center</h1>
          <p className="text-muted-foreground text-sm">
            Track tenants, domains, and previews in real time.
          </p>
        </div>
        <Button className="rounded-full">New tenant</Button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>Active tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-3xl">{workspaces.length}</p>
            <p className="text-muted-foreground text-sm">All tenants synced</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>Custom domains</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-3xl">{domainsCount}</p>
            <p className="text-muted-foreground text-sm">Across all projects</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>Preview deployments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-3xl">{previewsCount}</p>
            <p className="text-muted-foreground text-sm">
              Recent preview builds
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-lg">Recent deployments</h2>
        <div className="space-y-3">
          {recentDeployments.length === 0 ? (
            <Card className="border-border/60 bg-card/70">
              <CardContent className="py-4 text-muted-foreground text-sm">
                No deployments yet.
              </CardContent>
            </Card>
          ) : (
            recentDeployments.map((deployment) => {
              const project = projectMap.get(deployment.projectId);
              return (
                <Card
                  className="border-border/60 bg-card/70"
                  key={deployment.id}
                >
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-semibold text-sm">
                        {project?.name ?? "Project"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {deployment.branch} ·{" "}
                        {deployment.environment === "production"
                          ? "Production"
                          : "Preview"}
                      </p>
                    </div>
                    <Badge className="rounded-full" variant="accent">
                      {formatStatus(deployment.status)}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
