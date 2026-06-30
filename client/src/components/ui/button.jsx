import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)]",
    "text-sm font-medium transition-all duration-150 cursor-pointer select-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.97]",
    "focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(91,91,246,0.20)]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "text-white shadow-sm",
          "bg-[linear-gradient(135deg,#5B5BF6_0%,#7C7CF9_100%)]",
          "hover:bg-[linear-gradient(135deg,#4A4AE0_0%,#6C6CF8_100%)]",
          "hover:shadow-md hover:shadow-indigo-500/20 hover:scale-[1.02]",
        ].join(" "),
        destructive: [
          "bg-[var(--danger)] text-white shadow-sm",
          "hover:bg-[#dc2626] hover:scale-[1.02] hover:shadow-md",
        ].join(" "),
        outline: [
          "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]",
          "hover:bg-[var(--surface-raised)] hover:border-[var(--accent-soft-border)] hover:scale-[1.01]",
        ].join(" "),
        secondary: [
          "bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-primary)]",
          "hover:border-[var(--accent-soft-border)] hover:scale-[1.01]",
        ].join(" "),
        ghost: [
          "text-[var(--text-secondary)]",
          "hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] hover:scale-[1.01]",
        ].join(" "),
        link: "text-[var(--accent)] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-[6px] px-3 text-xs",
        lg: "h-11 rounded-[var(--radius-sm)] px-6 text-base font-semibold",
        icon: "h-9 w-9 rounded-[var(--radius-sm)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
