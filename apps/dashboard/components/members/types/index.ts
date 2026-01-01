import { InviteMemberSchema } from "@repo/contracts";
import type { z } from "zod";

export const inviteMemberSchema = InviteMemberSchema;
export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;
