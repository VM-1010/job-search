import { UserButton } from "@clerk/clerk-react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/utils";

export default function Topbar({ title }) {
  const { theme, toggle } = useTheme();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6 backdrop-blur-md">
      <h1 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          id="theme-toggle-btn"
          onClick={toggle}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className={[
            "flex h-8 w-8 items-center justify-center rounded-lg",
            "text-[var(--text-muted)] transition-all duration-150",
            "hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft-border)]",
          ].join(" ")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Clerk user button */}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 ring-2 ring-[var(--accent-soft-border)] rounded-full",
            },
          }}
        />
      </div>
    </header>
  );
}
