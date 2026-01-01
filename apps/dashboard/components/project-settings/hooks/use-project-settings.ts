import { updateProject } from "@repo/api-client";
import type { Project } from "@repo/contracts";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createZodResolver } from "@/lib/utils/zod-resolver";
import type { ProjectSettingsFormValues } from "../types";
import { projectSettingsSchema } from "../types";

export const useProjectSettings = (project: Project) => {
  const [hasSaved, setHasSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProjectSettingsFormValues>({
    resolver: createZodResolver(projectSettingsSchema),
    defaultValues: {
      name: project.name,
      deploymentName: project.deploymentName,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset({
      name: project.name,
      deploymentName: project.deploymentName,
    });
  }, [project.name, project.deploymentName, form.reset]);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setHasSaved(false);
    try {
      await updateProject(project.id, values);
      form.reset(values);
      setHasSaved(true);
    } catch (_submitError) {
      setError("Unable to save project settings.");
    }
  });

  return { form, onSubmit, hasSaved, error };
};
