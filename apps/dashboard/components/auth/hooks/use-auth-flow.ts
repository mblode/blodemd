"use client";

import { bootstrapUser } from "@repo/api-client";
import { createBrowserSupabaseClient } from "@repo/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { createZodResolver } from "@/lib/utils/zod-resolver";
import type { EmailFormValues, OtpFormValues } from "../types";
import { emailSchema, otpSchema } from "../types";

export type AuthMode = "signin" | "signup";
export type AuthStep = "email" | "otp";

export const useAuthFlow = (mode: AuthMode, prefillEmail?: string) => {
  const [step, setStep] = useState<AuthStep>("email");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const emailForm = useForm<EmailFormValues>({
    resolver: createZodResolver(emailSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: createZodResolver(otpSchema),
    defaultValues: { token: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (prefillEmail) {
      emailForm.setValue("email", prefillEmail, { shouldValidate: true });
    }
  }, [prefillEmail, emailForm.setValue]);

  const email = emailForm.watch("email");

  const primaryLabel = useMemo(() => {
    if (step === "email") {
      return mode === "signup" ? "Create account" : "Continue";
    }
    return "Verify code";
  }, [mode, step]);

  const title = useMemo(() => {
    return mode === "signup"
      ? "Create your neue workspace"
      : "Welcome back to neue";
  }, [mode]);

  const subtitle = useMemo(() => {
    return mode === "signup"
      ? "Start with your email and we will send a one-time code."
      : "Sign in with your email and a one-time code.";
  }, [mode]);

  const sendOtp = emailForm.handleSubmit(async (values) => {
    setError(null);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: { shouldCreateUser: mode === "signup" },
    });
    if (authError) {
      setError(authError.message);
      return;
    }
    setStep("otp");
    otpForm.reset();
  });

  const verifyOtp = otpForm.handleSubmit(async (values) => {
    setError(null);
    const { data, error: authError } = await supabase.auth.verifyOtp({
      email,
      token: values.token,
      type: "email",
    });
    if (authError) {
      setError("Invalid or expired code. Try again.");
      return;
    }
    if (!data.user?.email) {
      setError("Unable to finish sign-in.");
      return;
    }
    try {
      const result = await bootstrapUser({
        userId: data.user.id,
        email: data.user.email,
        fullName:
          typeof data.user.user_metadata?.full_name === "string"
            ? data.user.user_metadata.full_name
            : undefined,
        avatarUrl:
          typeof data.user.user_metadata?.avatar_url === "string"
            ? data.user.user_metadata.avatar_url
            : undefined,
      });
      otpForm.reset({ token: "" });
      router.push(`/${result.workspace.slug}/${result.project.slug}`);
      return;
    } catch (_bootstrapError) {
      setError("Unable to finish setup. Please try again.");
      return;
    }
  });

  const onGoogle = async () => {
    setError(null);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (authError) {
      setError(authError.message);
    }
  };

  const onBack = () => {
    setError(null);
    setStep("email");
    otpForm.reset({ token: "" });
  };

  return {
    step,
    emailForm,
    otpForm,
    email,
    primaryLabel,
    title,
    subtitle,
    onEmailSubmit: sendOtp,
    onOtpSubmit: verifyOtp,
    onGoogle,
    onBack,
    error,
  };
};
