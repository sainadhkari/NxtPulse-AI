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

export function Layout({ children }: { children: React.ReactNode }) {
  const role = getAuthRole();
  const [, setLocation] = useLocation();

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
            <Link 
              href={getDashboardLink()}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
          <Link 
            href="/cohorts"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Users className="w-4 h-4" />
            Cohorts
          </Link>
          <Link 
            href="/interventions"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            Interventions
          </Link>
          <Link 
            href="/understudy"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Bot className="w-4 h-4" />
            Understudy AI
          </Link>
          <Link 
            href="/learnguard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Brain className="w-4 h-4" />
            LearnGuard AI
          </Link>
          <Link 
            href="/insights"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Insights
          </Link>
          <Link 
            href="/wellness"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Activity className="w-4 h-4" />
            Wellness
          </Link>
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
