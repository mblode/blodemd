import { type DocsConfig, DocsConfigSchema } from "@repo/models";

export type ValidationResult =
  | { success: true; data: DocsConfig }
  | { success: false; errors: string[] };

const formatIssues = (
  issues: Array<{ path: Array<string | number>; message: string }>
) => {
  return issues.map((issue) => {
    const path = issue.path.length ? issue.path.join(".") : "root";
    return `${path}: ${issue.message}`;
  });
};

export const validateDocsConfig = (input: unknown): ValidationResult => {
  const result = DocsConfigSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const issues = formatIssues(result.error.issues);
  return { success: false, errors: issues };
};
