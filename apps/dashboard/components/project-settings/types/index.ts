import { z } from "zod";

export const projectSettingsSchema = z.object({
  name: z.string().min(1, "Project name is required."),
  deploymentName: z.string().min(1, "Deployment name is required."),
});

export type ProjectSettingsFormValues = z.infer<typeof projectSettingsSchema>;
