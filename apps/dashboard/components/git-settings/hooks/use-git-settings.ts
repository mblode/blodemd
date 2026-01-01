"use client";

import { updateGitSettings } from "@repo/api-client";
import type { GitSettings } from "@repo/contracts";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createZodResolver } from "@/lib/utils/zod-resolver";
import type { GitSettingsFormValues } from "../types";
import { gitSettingsFormSchema } from "../types";

export const useGitSettings = (
  projectId: string,
  settings: GitSettings | null
) => {
  const [hasSaved, setHasSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<GitSettingsFormValues>({
    resolver: createZodResolver(gitSettingsFormSchema),
    defaultValues: {
      organization: settings?.organization ?? "",
      repository: settings?.repository ?? "",
      branch: settings?.branch ?? "main",
      isMonorepo: settings?.isMonorepo ?? false,
      docsPath: settings?.docsPath ?? "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset({
      organization: settings?.organization ?? "",
      repository: settings?.repository ?? "",
      branch: settings?.branch ?? "main",
      isMonorepo: settings?.isMonorepo ?? false,
      docsPath: settings?.docsPath ?? "",
    });
  }, [
    settings?.organization,
    settings?.repository,
    settings?.branch,
    settings?.isMonorepo,
    settings?.docsPath,
    form.reset,
  ]);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setHasSaved(false);
    try {
      const docsPath =
        values.isMonorepo && values.docsPath?.trim()
          ? values.docsPath.trim()
          : undefined;
      await updateGitSettings(projectId, {
        organization: values.organization,
        repository: values.repository,
        branch: values.branch,
        isMonorepo: values.isMonorepo,
        docsPath,
      });
      form.reset({
        organization: values.organization,
        repository: values.repository,
        branch: values.branch,
        isMonorepo: values.isMonorepo,
        docsPath: docsPath ?? "",
      });
      setHasSaved(true);
    } catch (_submitError) {
      setError("Unable to save git settings.");
    }
  });

  return { form, onSubmit, hasSaved, error };
};
