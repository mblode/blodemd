"use client";

import Link from "next/link";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type AuthMode, useAuthFlow } from "./hooks/use-auth-flow";

const GOOGLE_LABEL = "Continue with Google";

export const AuthView = ({
  mode,
  prefillEmail,
}: {
  mode: AuthMode;
  prefillEmail?: string;
}) => {
  const {
    step,
    emailForm,
    otpForm,
    email,
    primaryLabel,
    title,
    subtitle,
    onEmailSubmit,
    onOtpSubmit,
    onGoogle,
    onBack,
    error,
  } = useAuthFlow(mode, prefillEmail);
  const emailId = useId();
  const tokenId = useId();

  return (
    <div className="min-h-screen bg-[radial-gradient(70%_70%_at_20%_20%,oklch(0.42_0.18_160_/_0.35),transparent),radial-gradient(60%_60%_at_90%_0%,oklch(0.5_0.12_240_/_0.25),transparent)] px-6 py-16">
      <Card className="mx-auto w-full max-w-lg border-border/60 bg-card/80 backdrop-blur">
        <CardHeader className="space-y-3">
          <p className="text-muted-foreground text-xs uppercase tracking-[0.4em]">
            neue
          </p>
          <div>
            <h1 className="font-semibold text-2xl">{title}</h1>
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-destructive text-sm">
              {error}
            </div>
          ) : null}
          {step === "email" && (
            <form className="space-y-5" onSubmit={onEmailSubmit}>
              <div className="space-y-2">
                <label className="font-medium text-sm" htmlFor={emailId}>
                  Email address
                </label>
                <Input
                  id={emailId}
                  placeholder="you@company.com"
                  type="email"
                  {...emailForm.register("email")}
                />
                {emailForm.formState.errors.email?.message && (
                  <p className="text-destructive text-sm">
                    {emailForm.formState.errors.email?.message}
                  </p>
                )}
              </div>

              <Button
                className="w-full"
                disabled={emailForm.formState.isSubmitting}
                type="submit"
              >
                {primaryLabel}
              </Button>

              <div className="relative text-center text-muted-foreground text-xs uppercase tracking-[0.3em]">
                <span className="bg-card px-2">or</span>
                <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
              </div>

              <Button
                className="w-full"
                onClick={onGoogle}
                type="button"
                variant="outline"
              >
                {GOOGLE_LABEL}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form className="space-y-5" onSubmit={onOtpSubmit}>
              <div className="rounded-lg border border-border/60 bg-background/60 p-4 text-muted-foreground text-sm">
                <p>
                  Enter the 6-digit code sent to{" "}
                  <strong className="text-foreground">{email}</strong>.
                </p>
                <button
                  className="mt-2 font-semibold text-primary text-sm"
                  onClick={onBack}
                  type="button"
                >
                  Use a different email
                </button>
              </div>

              <div className="space-y-2">
                <label className="font-medium text-sm" htmlFor={tokenId}>
                  Verification code
                </label>
                <Input
                  autoComplete="one-time-code"
                  id={tokenId}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  {...otpForm.register("token")}
                />
                {otpForm.formState.errors.token?.message && (
                  <p className="text-destructive text-sm">
                    {otpForm.formState.errors.token?.message}
                  </p>
                )}
              </div>

              <Button
                className="w-full"
                disabled={otpForm.formState.isSubmitting}
                type="submit"
              >
                {primaryLabel}
              </Button>
            </form>
          )}

          <div className="text-muted-foreground text-sm">
            {mode === "signup" ? (
              <span>
                Already have an account?{" "}
                <Link className="text-foreground" href="/signin">
                  Sign in
                </Link>
              </span>
            ) : (
              <span>
                Need an account?{" "}
                <Link className="text-foreground" href="/signup">
                  Create one
                </Link>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
