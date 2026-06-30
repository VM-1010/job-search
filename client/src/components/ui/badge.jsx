import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)] text-white",
        secondary: "bg-gray-100 text-[var(--text-secondary)]",
        outline: "border border-[var(--border)] text-[var(--text-secondary)]",
        pending:
          "bg-amber-50 text-amber-700 border border-amber-200",
        interview:
          "bg-blue-50 text-blue-700 border border-blue-200",
        accepted:
          "bg-emerald-50 text-emerald-700 border border-emerald-200",
        rejected:
          "bg-red-50 text-red-700 border border-red-200",
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
