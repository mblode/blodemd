import { listWorkspaces } from "@repo/api-client";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default async function TenantsPage() {
  const workspaces = await listWorkspaces().catch(() => []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-semibold text-2xl">Tenants</h1>
        <p className="text-muted-foreground text-sm">
          Each tenant is isolated by domain and configuration.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workspaces.length === 0 ? (
          <Card className="border-border/60 bg-card/70">
            <CardContent className="py-4 text-muted-foreground text-sm">
              No workspaces yet.
            </CardContent>
          </Card>
        ) : (
          workspaces.map((workspace) => (
            <Link href={`/tenants/${workspace.slug}`} key={workspace.slug}>
              <Card className="border-border/60 bg-card/70 transition hover:border-primary/50">
                <CardContent className="space-y-2">
                  <p className="font-semibold text-lg">{workspace.name}</p>
                  <p className="text-muted-foreground text-sm">
                    Workspace slug
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {workspace.slug}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
