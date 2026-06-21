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
  TerminalSquare,
  Users
} from "lucide-react";
import { getAuthRole, clearAuth } from "@/lib/auth";
import { NotificationBell } from "@/components/notification-bell";
import { GlobalSearch, SearchTrigger } from "@/components/global-search";

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
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row dark">
      <GlobalSearch />
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-card-border bg-card/50 backdrop-blur-xl flex flex-col z-50">
        <div className="p-6 border-b border-card-border">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <TerminalSquare className="w-8 h-8 text-primary shadow-xs" />
              <span className="font-bold text-xl tracking-tighter uppercase text-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">NxtPulse</span>
            </Link>
            {role && <NotificationBell />}
          </div>
          {role && (
            <div className="mt-4 inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium bg-primary/10 text-primary border border-primary/30 uppercase tracking-widest">
              {role}
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SearchTrigger />
          {role && (
            <Link 
              href={getDashboardLink()}
              className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/30"
            >
              <LayoutDashboard className="w-4 h-4" />
              Command Center
            </Link>
          )}
          <Link 
            href="/cohorts"
            className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/30"
          >
            <Users className="w-4 h-4" />
            Cohort Compare
          </Link>
          <Link 
            href="/interventions"
            className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/30"
          >
            <ShieldAlert className="w-4 h-4" />
            Interventions
          </Link>
          <Link 
            href="/understudy"
            className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/30"
          >
            <Bot className="w-4 h-4" />
            Understudy AI
          </Link>
          <Link 
            href="/learnguard"
            className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/30"
          >
            <Brain className="w-4 h-4" />
            LearnGuard AI
          </Link>
          <Link 
            href="/insights"
            className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/30"
          >
            <BarChart3 className="w-4 h-4" />
            Executive Insights
          </Link>
          <Link 
            href="/wellness"
            className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/30"
          >
            <Activity className="w-4 h-4" />
            Wellness AI
          </Link>
        </nav>

        {role && (
          <div className="p-4 border-t border-card-border">
            <button 
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors border border-transparent hover:border-destructive/30"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        {children}
      </main>
    </div>
  );
}
