import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import type { ZodError, z } from "zod";

const mapZodErrors = <TFieldValues extends FieldValues>(
  error: ZodError
): FieldErrors<TFieldValues> => {
  const fieldErrors: FieldErrors<TFieldValues> = {};
  for (const issue of error.issues) {
    const [field] = issue.path;
    if (typeof field !== "string") {
      continue;
    }
    fieldErrors[field] = {
      type: issue.code,
      message: issue.message,
    };
  }
  return fieldErrors;
};

export const createZodResolver = <T extends z.ZodType<FieldValues>>(
  schema: T
): Resolver<z.infer<T>> => {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }

    return {
      values: {},
      errors: mapZodErrors<z.infer<T>>(result.error),
    };
  };
};
