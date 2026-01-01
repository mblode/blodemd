"use client";

import { type ComponentProps, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type InputProps = ComponentProps<"input">;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      type={type}
      {...props}
    />
  )
);

Input.displayName = "Input";
