import {
  getGitSettings,
  getWorkspaceBySlug,
  listActivity,
  listDeployments,
  listDomains,
  listProjects,
} from "@repo/api-client";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const formatRelative = (value: string) => {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) {
    return "Today";
  }
  if (days === 1) {
    return "1 day ago";
  }
  return `${days} days ago`;
};

const formatStatus = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export default async function ProjectOverview({
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

  const [activity, domains, deployments, gitSettings] = await Promise.all([
    listActivity(project.id).catch(() => []),
    listDomains(project.id).catch(() => []),
    listDeployments(project.id).catch(() => []),
    getGitSettings(project.id).catch(() => null),
  ]);

  const primaryDomain = domains[0];
  const defaultDomain = `${project.slug}.neue.com`;
  const latestDeployment = deployments[0];
  const latestActivity = activity[0];
  const branch = gitSettings?.branch ?? latestDeployment?.branch ?? "main";
  const lastUpdated = latestDeployment?.updatedAt ?? latestActivity?.occurredAt;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">
            Good morning, Matthew Blode
          </p>
          <h1 className="font-semibold text-3xl">
            Welcome back to your docs dashboard
          </h1>
        </div>
        <Button variant="secondary">Ask agent</Button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="border-border/60 bg-card/70">
          <CardContent className="space-y-6 p-6">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-[0.3em]">
                Project
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-2xl">{project.name}</h2>
                  <p className="text-muted-foreground text-sm">
                    {params.workspaceSlug} / {project.slug}
                  </p>
                </div>
                <Badge className="rounded-full">Live</Badge>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Last updated",
                  value: lastUpdated
                    ? formatRelative(lastUpdated)
                    : "No updates",
                },
                { label: "Branch", value: branch },
                {
                  label: "Domain",
                  value: primaryDomain
                    ? `${primaryDomain.hostname}${primaryDomain.pathPrefix ?? ""}`
                    : defaultDomain,
                },
              ].map((item) => (
                <div
                  className="rounded-lg border border-border/60 bg-background/60 p-4"
                  key={item.label}
                >
                  <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                    {item.label}
                  </p>
                  <p className="mt-2 font-semibold text-sm">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/60 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold text-sm">
                  MB
                </div>
                <div>
                  <p className="font-semibold text-sm">Matthew Blode</p>
                  <p className="text-muted-foreground text-xs">Last publish</p>
                </div>
              </div>
              <Button asChild size="sm">
                <a
                  href={`https://${defaultDomain}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Visit site
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardContent className="space-y-4 p-6">
            <div>
              <h2 className="font-semibold text-lg">Recent changes</h2>
              <p className="text-muted-foreground text-sm">
                Activity for your documentation project.
              </p>
            </div>
            {activity.length === 0 ? (
              <p className="text-muted-foreground text-sm">No activity yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Changes</TableHead>
                    <TableHead>Actor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activity.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm">
                            {item.summary}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatDate(item.occurredAt)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="rounded-full" variant="accent">
                          {formatStatus(item.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {item.changes ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted font-semibold text-xs">
                            {item.actorName
                              .split(" ")
                              .map((part) => part[0])
                              .join("")}
                          </div>
                          <span className="text-sm">{item.actorName}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
