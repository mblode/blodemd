import { z } from "zod";

export const emailSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

export type EmailFormValues = z.infer<typeof emailSchema>;

export const otpSchema = z.object({
  token: z.string().regex(/^[0-9]{6}$/, "Enter the 6-digit code we sent."),
});

export type OtpFormValues = z.infer<typeof otpSchema>;
