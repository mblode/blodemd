import { z } from "zod";

export const gitSettingsFormSchema = z.object({
  organization: z.string().min(1, "Organization is required."),
  repository: z.string().min(1, "Repository is required."),
  branch: z.string().min(1, "Branch is required."),
  isMonorepo: z.boolean(),
  docsPath: z.string().optional(),
});

export type GitSettingsFormValues = z.infer<typeof gitSettingsFormSchema>;
