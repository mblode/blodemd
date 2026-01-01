import {
  listDeployments,
  listDomains,
  listProjects,
  listWorkspaces,
} from "@repo/api-client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/status-pill";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function TenantDetail({
  params,
}: {
  params: { slug: string };
}) {
  const workspaces = await listWorkspaces().catch(() => []);
  const workspace = workspaces.find((item) => item.slug === params.slug);
  if (!workspace) {
    return notFound();
  }

  const projects = await listProjects(workspace.id).catch(() => []);
  const [domainsByProject, deploymentsByProject] = await Promise.all([
    Promise.all(
      projects.map((project) => listDomains(project.id).catch(() => []))
    ),
    Promise.all(
      projects.map((project) => listDeployments(project.id).catch(() => []))
    ),
  ]);

  const domains = domainsByProject.flat();
  const deployments = deploymentsByProject
    .flat()
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-semibold text-2xl">{workspace.name}</h1>
        <p className="text-muted-foreground text-sm">
          Workspace {workspace.slug}
        </p>
      </header>

      <Card className="border-border/60 bg-card/70">
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 className="font-semibold text-lg">Projects</h2>
            <p className="text-muted-foreground text-sm">
              Docs projects in this workspace.
            </p>
          </div>
          <div className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-muted-foreground text-sm">No projects yet.</p>
            ) : (
              projects.map((project) => (
                <Link
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/60 p-4 transition hover:bg-muted/40"
                  href={`/${workspace.slug}/${project.slug}`}
                  key={project.id}
                >
                  <div>
                    <p className="font-semibold text-sm">{project.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {project.slug}
                    </p>
                  </div>
                  <Badge className="rounded-full" variant="accent">
                    Live
                  </Badge>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/70">
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 className="font-semibold text-lg">Domains</h2>
            <p className="text-muted-foreground text-sm">
              Primary and custom domains.
            </p>
          </div>
          <div className="space-y-3">
            {domains.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No domains configured.
              </p>
            ) : (
              domains.map((domain) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/60 p-4"
                  key={domain.id}
                >
                  <div>
                    <p className="font-semibold text-sm">{domain.hostname}</p>
                    <p className="text-muted-foreground text-xs">
                      {domain.pathPrefix ?? "Root domain"}
                    </p>
                  </div>
                  <StatusPill status={domain.status} />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/70">
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 className="font-semibold text-lg">Recent deployments</h2>
            <p className="text-muted-foreground text-sm">
              Latest activity for this workspace.
            </p>
          </div>
          <div className="space-y-3">
            {deployments.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No deployments yet.
              </p>
            ) : (
              deployments.slice(0, 5).map((deployment) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/60 p-4"
                  key={deployment.id}
                >
                  <div>
                    <p className="font-semibold text-sm">{deployment.branch}</p>
                    <p className="text-muted-foreground text-xs">
                      {deployment.environment === "production"
                        ? "Production"
                        : "Preview"}
                    </p>
                  </div>
                  <Badge className="rounded-full" variant="accent">
                    {deployment.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
