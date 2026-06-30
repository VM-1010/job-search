import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors border",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent)] text-white border-transparent",
        accent:
          "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-soft-border)]",
        secondary:
          "bg-[var(--surface-raised)] text-[var(--text-secondary)] border-[var(--border)]",
        outline:
          "border-[var(--border)] bg-transparent text-[var(--text-secondary)]",
        // Application status — semantic
        pending:
          "bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning-border)]",
        interview:
          "bg-[var(--info-bg)] text-[var(--info)] border-[rgba(59,130,246,0.30)]",
        accepted:
          "bg-[var(--success-bg)] text-[var(--success)] border-[var(--success-border)]",
        rejected:
          "bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger-border)]",
        success:
          "bg-[var(--success-bg)] text-[var(--success)] border-[var(--success-border)]",
        warning:
          "bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning-border)]",
        danger:
          "bg-[var(--danger-bg)] text-[var(--danger)] border-[var(--danger-border)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
