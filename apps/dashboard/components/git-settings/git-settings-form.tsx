"use client";

import type { GitSettings } from "@repo/contracts";
import { useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useGitSettings } from "./hooks/use-git-settings";

export const GitSettingsForm = ({
  projectId,
  settings,
}: {
  projectId: string;
  settings: GitSettings | null;
}) => {
  const { form, onSubmit, hasSaved, error } = useGitSettings(
    projectId,
    settings
  );
  const isMonorepo = form.watch("isMonorepo");
  const organizationId = useId();
  const repositoryId = useId();
  const branchId = useId();
  const docsPathId = useId();
  const [autoUpdates, setAutoUpdates] = useState(
    Boolean(settings?.appInstalled)
  );

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/70">
        <CardContent className="space-y-6 p-6">
          <div>
            <h2 className="font-semibold text-lg">Git settings</h2>
            <p className="text-muted-foreground text-sm">
              Configure the repository that powers your docs deployments.
            </p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm">Repo settings</h3>
                <p className="text-muted-foreground text-xs">
                  Connect your docs repo.
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-background/60 p-4">
                <p className="font-semibold text-sm">GitHub</p>
                <p className="text-muted-foreground text-xs">
                  Configure GitHub to create deployments for any commits pushed
                  to your repository.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    className="font-medium text-sm"
                    htmlFor={organizationId}
                  >
                    GitHub organization
                  </label>
                  <Input
                    id={organizationId}
                    placeholder="mblode"
                    {...form.register("organization")}
                  />
                  {form.formState.errors.organization?.message && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.organization.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="font-medium text-sm" htmlFor={repositoryId}>
                    Repository
                  </label>
                  <Input
                    id={repositoryId}
                    placeholder="dnd-grid"
                    {...form.register("repository")}
                  />
                  {form.formState.errors.repository?.message && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.repository.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="font-medium text-sm" htmlFor={branchId}>
                    Branch
                  </label>
                  <Input
                    id={branchId}
                    placeholder="main"
                    {...form.register("branch")}
                  />
                  {form.formState.errors.branch?.message && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.branch.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/60 p-4">
                  <Switch
                    checked={isMonorepo}
                    onCheckedChange={(checked) =>
                      form.setValue("isMonorepo", checked, {
                        shouldDirty: true,
                      })
                    }
                  />
                  <div>
                    <p className="font-medium text-sm">Set up as monorepo</p>
                    <p className="text-muted-foreground text-xs">
                      Enable if your docs are not at the root.
                    </p>
                  </div>
                </div>
              </div>

              {isMonorepo ? (
                <div className="space-y-2">
                  <label className="font-medium text-sm" htmlFor={docsPathId}>
                    Path to directory containing docs.json
                  </label>
                  <Input
                    id={docsPathId}
                    placeholder="apps/docs"
                    {...form.register("docsPath")}
                  />
                  <p className="text-muted-foreground text-xs">
                    Please make sure a docs.json file exists in this directory.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-muted-foreground text-sm">
                {error ? (
                  <span className="text-destructive">{error}</span>
                ) : null}
                {!error && hasSaved ? <span>Saved changes.</span> : null}
              </div>
              <Button disabled={form.formState.isSubmitting} type="submit">
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/70">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h3 className="font-semibold text-sm">GitLab</h3>
            <p className="text-muted-foreground text-xs">
              Configure GitLab to create deployments for any commits pushed to
              your repository.
            </p>
          </div>
          <Button size="sm" variant="secondary">
            Switch to GitLab
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/70">
        <CardContent className="space-y-5 p-6">
          <div>
            <h3 className="font-semibold text-sm">GitHub app</h3>
            <p className="text-muted-foreground text-xs">
              Install the GitHub app to enable automatic updates.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/60 p-4">
            <div>
              <p className="font-semibold text-sm">Configure GitHub app</p>
              <p className="text-muted-foreground text-xs">
                Install the GitHub app to enable automatic updates and private
                repository access.
              </p>
              {settings?.appInstalled ? (
                <p className="mt-2 text-muted-foreground text-xs">
                  GitHub app installed successfully to Matthew Blode. Ready to
                  sync documentation.
                </p>
              ) : null}
            </div>
            <Badge
              className="rounded-full"
              variant={settings?.appInstalled ? "accent" : "outline"}
            >
              {settings?.appInstalled ? "Installed" : "Not installed"}
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/60 p-4">
            <div>
              <p className="font-semibold text-sm">Enable auto updates</p>
              <p className="text-muted-foreground text-xs">
                Keep deployments in sync with every push.
              </p>
            </div>
            <Switch checked={autoUpdates} onCheckedChange={setAutoUpdates} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/60 p-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-[0.3em]">
                Your active GitHub app connections
              </p>
              <p className="font-semibold">Active app installations</p>
              <p className="text-muted-foreground text-xs">
                mblode · All repositories
              </p>
            </div>
            <Button size="sm" variant="secondary">
              Configure GitHub app
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
