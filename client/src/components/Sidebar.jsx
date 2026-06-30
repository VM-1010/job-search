import { NavLink } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";

export default function Sidebar({ links }) {
  const { user } = useUser();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-[var(--sidebar-bg)] border-r border-[var(--border)]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-bold shadow-sm"
          style={{ background: "linear-gradient(135deg, #5B5BF6 0%, #7C7CF9 100%)" }}
        >
          JS
        </div>
        <span className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
          JobSphere
        </span>
      </div>

      {/* Nav */}
      <nav className="mt-1 flex flex-1 flex-col gap-0.5 px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                "transition-colors duration-150 outline-none",
                isActive
                  ? [
                      "nav-active-bar bg-[var(--accent-soft)] text-[var(--accent)]",
                    ].join(" ")
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
              )
            }
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User at bottom */}
      {user && (
        <div className="border-t border-[var(--border)] px-4 py-3 mt-auto">
          <div className="flex items-center gap-3">
            <img
              src={user.imageUrl}
              alt=""
              className="h-8 w-8 rounded-full object-cover ring-2 ring-[var(--accent-soft-border)]"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                {user.fullName || user.primaryEmailAddress?.emailAddress || "User"}
              </p>
              <p className="truncate text-xs text-[var(--text-muted)]">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
