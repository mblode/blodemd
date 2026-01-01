import { z } from "zod";

export const customDomainSchema = z.object({
  domain: z
    .string()
    .min(1, "Enter a domain.")
    .regex(/\./, "Enter a valid domain."),
});

export type CustomDomainFormValues = z.infer<typeof customDomainSchema>;
