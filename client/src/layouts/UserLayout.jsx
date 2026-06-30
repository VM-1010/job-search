import { Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Briefcase, FileText, UserCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const USER_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Browse Jobs", icon: Briefcase },
  { to: "/applications", label: "Applications", icon: FileText },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/jobs": "Browse Jobs",
  "/applications": "My Applications",
  "/profile": "Profile",
};

export default function UserLayout() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || "JobSphere";

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      <Sidebar links={USER_LINKS} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
