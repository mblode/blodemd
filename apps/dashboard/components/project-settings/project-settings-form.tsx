"use client";

import type { Project } from "@repo/contracts";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProjectSettings } from "./hooks/use-project-settings";

export const ProjectSettingsForm = ({ project }: { project: Project }) => {
  const { form, onSubmit, hasSaved, error } = useProjectSettings(project);
  const nameId = useId();
  const deploymentId = useId();

  return (
    <Card className="border-border/60 bg-card/70">
      <CardContent className="space-y-6 p-6">
        <div>
          <h2 className="font-semibold text-lg">General</h2>
          <p className="text-muted-foreground text-sm">
            Update the name and deployment identity for this project.
          </p>
        </div>

        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor={nameId}>
              Project name
            </label>
            <Input
              id={nameId}
              placeholder="Project name"
              {...form.register("name")}
            />
            <p className="text-muted-foreground text-xs">
              Name displayed on the topbar.
            </p>
            {form.formState.errors.name?.message && (
              <p className="text-destructive text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor={deploymentId}>
              Deployment name
            </label>
            <Input
              id={deploymentId}
              placeholder="Deployment name"
              {...form.register("deploymentName")}
            />
            <p className="text-muted-foreground text-xs">
              Used to label deployments and releases.
            </p>
            {form.formState.errors.deploymentName?.message && (
              <p className="text-destructive text-sm">
                {form.formState.errors.deploymentName.message}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-muted-foreground text-sm">
              {error ? <span className="text-destructive">{error}</span> : null}
              {!error && hasSaved ? <span>Saved changes.</span> : null}
            </div>
            <Button disabled={form.formState.isSubmitting} type="submit">
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
