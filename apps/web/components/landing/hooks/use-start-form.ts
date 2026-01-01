"use client";

import { useForm } from "react-hook-form";
import { createZodResolver } from "@/lib/utils/zod-resolver";
import type { StartFormValues } from "../types";
import { startSchema } from "../types";

const SIGNUP_BASE = "https://dashboard.neue.com/signup";

export const useStartForm = () => {
  const form = useForm<StartFormValues>({
    resolver: createZodResolver(startSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit((data) => {
    const params = new URLSearchParams({ email: data.email });
    window.location.assign(`${SIGNUP_BASE}?${params.toString()}`);
  });

  return { form, onSubmit };
};
