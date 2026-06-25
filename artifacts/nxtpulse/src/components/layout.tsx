import React from "react";
import { Link, useLocation } from "wouter";
import { 
  Activity, 
  BarChart3, 
  Bot,
  Brain,
  LayoutDashboard, 
  LogOut,
  ShieldAlert,
  Users
} from "lucide-react";
import { getAuthRole, clearAuth } from "@/lib/auth";
import { NotificationBell } from "@/components/notification-bell";
import { GlobalSearch, SearchTrigger } from "@/components/global-search";
import { AIAssistant } from "@/components/ai-assistant";
import { NxtPulseLogo } from "@/components/nxtpulse-logo";

function formatRole(role: string) {
  if (role === "poc") return "POC";
  if (role === "sdi") return "SDI";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  currentPath: string;
  matchPrefix?: boolean;
}

function NavLink({ href, icon, label, currentPath, matchPrefix }: NavLinkProps) {
  const isActive = matchPrefix
    ? currentPath.startsWith(href)
    : currentPath === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      <span className={isActive ? "text-primary" : ""}>{icon}</span>
      {label}
    </Link>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const role = getAuthRole();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    clearAuth();
    setLocation("/auth");
  };

  const getDashboardLink = () => {
    if (role === "manager") return "/dashboard/manager";
    if (role === "poc") return "/dashboard/poc";
    if (role === "sdi") return "/dashboard/sdi";
    return "/";
  };

  const dashboardLink = getDashboardLink();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <GlobalSearch />
      <AIAssistant />
      {/* Sidebar */}
      <aside className="w-full md:w-60 border-r border-border bg-sidebar flex flex-col z-50 shrink-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-0">
              <NxtPulseLogo size="sm" />
            </Link>
            {role && <NotificationBell />}
          </div>
          {role && (
            <div className="mt-2.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary">
                {formatRole(role)}
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          <SearchTrigger />
          {role && (
            <NavLink
              href={dashboardLink}
              icon={<LayoutDashboard className="w-4 h-4" />}
              label="Dashboard"
              currentPath={location}
              matchPrefix
            />
          )}
          <NavLink
            href="/cohorts"
            icon={<Users className="w-4 h-4" />}
            label="Cohorts"
            currentPath={location}
          />
          <NavLink
            href="/interventions"
            icon={<ShieldAlert className="w-4 h-4" />}
            label="Interventions"
            currentPath={location}
          />
          <NavLink
            href="/understudy"
            icon={<Bot className="w-4 h-4" />}
            label="Understudy AI"
            currentPath={location}
          />
          <NavLink
            href="/learnguard"
            icon={<Brain className="w-4 h-4" />}
            label="LearnGuard AI"
            currentPath={location}
          />
          <NavLink
            href="/insights"
            icon={<BarChart3 className="w-4 h-4" />}
            label="Insights"
            currentPath={location}
          />
          <NavLink
            href="/wellness"
            icon={<Activity className="w-4 h-4" />}
            label="Wellness"
            currentPath={location}
          />
        </nav>

        {role && (
          <div className="p-3 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}
