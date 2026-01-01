"use client";

import { createApiKey } from "@repo/api-client";
import type { ApiKey } from "@repo/contracts";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createZodResolver } from "@/lib/utils/zod-resolver";
import type { ApiKeyFormValues } from "../types";
import { apiKeyFormSchema } from "../types";

export const useApiKeys = (workspaceId: string, initialKeys: ApiKey[]) => {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [lastCreated, setLastCreated] = useState<ApiKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ApiKeyFormValues>({
    resolver: createZodResolver(apiKeyFormSchema),
    defaultValues: { name: "" },
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setLastCreated(null);
    try {
      const created = await createApiKey(workspaceId, values);
      setKeys((prev) => [created, ...prev]);
      setLastCreated(created);
      form.reset({ name: "" });
    } catch (_submitError) {
      setError("Unable to create API key.");
    }
  });

  return { keys, lastCreated, error, form, onSubmit };
};
