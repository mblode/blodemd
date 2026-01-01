import { z } from "zod";

export const startSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export type StartFormValues = z.infer<typeof startSchema>;
