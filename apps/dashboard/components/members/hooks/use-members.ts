"use client";

import { inviteMember } from "@repo/api-client";
import type { Member } from "@repo/contracts";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createZodResolver } from "@/lib/utils/zod-resolver";
import type { InviteMemberFormValues } from "../types";
import { inviteMemberSchema } from "../types";

export const useMembers = (workspaceId: string, initialMembers: Member[]) => {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<InviteMemberFormValues>({
    resolver: createZodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      const created = await inviteMember(workspaceId, values);
      setMembers((prev) => [created, ...prev]);
      form.reset({ email: "", role: "member" });
    } catch (_submitError) {
      setError("Unable to invite member.");
    }
  });

  return { members, form, onSubmit, error };
};
