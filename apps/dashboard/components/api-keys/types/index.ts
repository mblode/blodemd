import { z } from "zod";

export const apiKeyFormSchema = z.object({
  name: z.string().min(1, "Key name is required."),
});

export type ApiKeyFormValues = z.infer<typeof apiKeyFormSchema>;
