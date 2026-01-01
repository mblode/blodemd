"use client";

import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <div>
        <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
          neue
        </p>
        <h1 className="mt-3 font-semibold text-2xl">Something went wrong.</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          {error.message ||
            "Try refreshing the page or continue from the dashboard."}
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
