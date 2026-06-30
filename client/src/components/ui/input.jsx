import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-lg border border-[var(--border)]",
        "bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)]",
        "shadow-[var(--shadow-sm)] transition-colors duration-150",
        "placeholder:text-[var(--text-muted)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft-border)]",
        "focus-visible:border-[var(--accent)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex w-full rounded-lg border border-[var(--border)]",
        "bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)]",
        "shadow-[var(--shadow-sm)] transition-colors duration-150",
        "placeholder:text-[var(--text-muted)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft-border)]",
        "focus-visible:border-[var(--accent)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "min-h-[80px] resize-y",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Input, Textarea };
