import { Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, List, Building2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const EMP_LINKS = [
  { to: "/emp/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/emp/listings", label: "Listings", icon: List },
  { to: "/emp/profile", label: "Company Profile", icon: Building2 },
];

const PAGE_TITLES = {
  "/emp/dashboard": "Dashboard",
  "/emp/listings": "Job Listings",
  "/emp/profile": "Company Profile",
};

export default function EmployerLayout() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? "Employer Portal";

  return (
    <div className="flex h-screen bg-[var(--bg)]">
      <Sidebar links={EMP_LINKS} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
