import { NavLink } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";

export default function Sidebar({ links }) {
  const { user } = useUser();

  return (
    <aside className="flex h-full w-60 flex-col bg-[var(--bg-sidebar)] text-[var(--text-sidebar)]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--primary)] text-white text-sm font-bold">
          JS
        </div>
        <span className="text-base font-bold text-white tracking-tight">
          JobSphere
        </span>
      </div>

      {/* Nav */}
      <nav className="mt-2 flex flex-1 flex-col gap-0.5 px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[var(--bg-sidebar-active)] text-white"
                  : "text-[var(--text-sidebar)] hover:bg-[var(--bg-sidebar-hover)] hover:text-white"
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
        <div className="border-t border-white/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src={user.imageUrl}
              alt=""
              className="h-8 w-8 rounded-full object-cover ring-2 ring-white/10"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user.fullName || user.primaryEmailAddress?.emailAddress || "User"}
              </p>
              <p className="truncate text-xs text-[var(--text-sidebar)]">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
