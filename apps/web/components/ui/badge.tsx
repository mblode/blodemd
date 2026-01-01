import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-border px-3 py-1 font-medium text-xs uppercase tracking-[0.2em]",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        accent: "bg-primary/15 text-primary",
        outline: "bg-transparent text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      className={cn(badgeVariants({ variant, className }))}
      ref={ref}
      {...props}
    />
  )
);

Badge.displayName = "Badge";
