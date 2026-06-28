import { useState } from "react";
import {
  Bell, ShieldAlert, AlertTriangle, CheckCircle2, X,
  Clock, Brain, ChevronRight, Zap, Wifi, WifiOff,
  Filter, CheckCheck, Trash2, Eye, CalendarDays
} from "lucide-react";
import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/use-notifications";

type Severity = "critical" | "warning" | "resolved" | "all";

interface StaticNotif {
  id: string;
  severity: "critical" | "warning" | "resolved";
  trainee: string;
  cohort: string;
  issue: string;
  detail: string;
  timestamp: string;
  aiRecommendation: string;
  category: "attendance" | "ai_dependency" | "standup" | "demo" | "syncup" | "engagement";
  dismissed?: boolean;
}

const STATIC_NOTIFS: StaticNotif[] = [
  {
    id: "n1", severity: "critical", trainee: "Rahul Verma", cohort: "Cohort-7",
    issue: "Attendance dropped to 62%", detail: "Missed 3 consecutive standups — 5 days inactive",
    timestamp: new Date(Date.now() - 900000).toISOString(),
    aiRecommendation: "Immediate intervention required. Schedule same-day sync-up and escalate to programme coordinator if unresponsive within 24h.",
    category: "attendance",
  },
  {
    id: "n2", severity: "critical", trainee: "Vikram Singh", cohort: "Cohort-8",
    issue: "AI dependency spike — 88%", detail: "Submitting AI-generated code without modification across all tasks",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    aiRecommendation: "Enforce no-AI coding challenges for 1 week. Conduct hands-on pair session. Review all recent submissions.",
    category: "ai_dependency",
  },
  {
    id: "n3", severity: "critical", trainee: "Pooja Menon", cohort: "Cohort-7",
    issue: "No communication for 5 days", detail: "Last seen 5 days ago — not responding to Slack messages or calls",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    aiRecommendation: "Escalate to emergency contact. Flag for counselor review. Notify programme manager.",
    category: "engagement",
  },
  {
    id: "n4", severity: "critical", trainee: "Rohit Joshi", cohort: "Cohort-7",
    issue: "Demo score critically low — 22%", detail: "Failed to demonstrate core concepts in last 2 demos. Score dropped from 41% to 22%.",
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    aiRecommendation: "Assign immediate demo prep coaching. Pair with Meena Iyer for 3 mock sessions. Re-evaluate within 48 hours.",
    category: "demo",
  },
  {
    id: "n5", severity: "warning", trainee: "Sai Krishna", cohort: "Cohort-7",
    issue: "Demo submission delayed twice", detail: "Demo score at 55%. Requested 2 extensions without completing.",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    aiRecommendation: "Schedule sync-up to understand blockers. Assign 2 practice submissions before next deadline.",
    category: "demo",
  },
  {
    id: "n6", severity: "warning", trainee: "Arjun Das", cohort: "Cohort-8",
    issue: "Attendance inconsistent — 70%", detail: "Attendance declining week-over-week: 85% → 78% → 70%",
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    aiRecommendation: "Proactive check-in to identify blockers. Set weekly attendance target of 90%.",
    category: "attendance",
  },
  {
    id: "n7", severity: "warning", trainee: "Kiran Patel", cohort: "Cohort-7",
    issue: "Missed sync-up — no response", detail: "Scheduled sync-up on June 24 missed without prior notice.",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    aiRecommendation: "Reschedule immediately. If missed again, escalate to programme lead.",
    category: "syncup",
  },
  {
    id: "n8", severity: "warning", trainee: "Deepa Nair", cohort: "Cohort-8",
    issue: "LearnGuard flagged SQL gaps", detail: "Scored 35% on SQL Joins assessment. AI dependency 74% on data tasks.",
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    aiRecommendation: "Assign SQL fundamentals module. Pair with Suresh Babu for hands-on review.",
    category: "ai_dependency",
  },
  {
    id: "n9", severity: "resolved", trainee: "Meena Iyer", cohort: "Cohort-6",
    issue: "Low demo confidence resolved", detail: "Attended 3 mock sessions. Demo score improved from 58% to 89%.",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    aiRecommendation: "No further action needed. Monitor for sustained improvement.",
    category: "demo",
  },
  {
    id: "n10", severity: "resolved", trainee: "Kavitha Rao", cohort: "Cohort-6",
    issue: "Attendance back to 92%", detail: "Personal issue resolved. Returned to full attendance after 1-week break.",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    aiRecommendation: "Continue monitoring weekly. No intervention required.",
    category: "attendance",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  attendance: "Attendance",
  ai_dependency: "AI Dependency",
  standup: "Standup",
  demo: "Demo",
  syncup: "Sync-up",
  engagement: "Engagement",
};

const CATEGORY_STYLES: Record<string, string> = {
  attendance: "text-blue-700 border-blue-200 bg-blue-50",
  ai_dependency: "text-violet-700 border-violet-200 bg-violet-50",
  standup: "text-amber-700 border-amber-200 bg-amber-50",
  demo: "text-orange-700 border-orange-200 bg-orange-50",
  syncup: "text-emerald-700 border-emerald-200 bg-emerald-50",
  engagement: "text-red-700 border-red-200 bg-red-50",
};

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotifCard({ n, onDismiss }: { n: StaticNotif; onDismiss: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  const severityConfig = {
    critical: { border: "border-l-red-500", bg: "", icon: ShieldAlert, iconBg: "bg-red-50 border-red-200 text-red-600", badge: "text-red-700 border-red-200 bg-red-50", label: "CRITICAL" },
    warning:  { border: "border-l-amber-500", bg: "", icon: AlertTriangle, iconBg: "bg-amber-50 border-amber-200 text-amber-600", badge: "text-amber-700 border-amber-200 bg-amber-50", label: "WARNING" },
    resolved: { border: "border-l-emerald-500", bg: "opacity-80", icon: CheckCircle2, iconBg: "bg-emerald-50 border-emerald-200 text-emerald-600", badge: "text-emerald-700 border-emerald-200 bg-emerald-50", label: "RESOLVED" },
  }[n.severity];

  const Icon = severityConfig.icon;

  return (
    <div className={`flex items-start gap-4 p-5 rounded-xl border border-border bg-card border-l-4 ${severityConfig.border} ${severityConfig.bg} hover:shadow-sm transition-shadow`}>
      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${severityConfig.iconBg}`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-foreground text-sm">{n.trainee}</span>
            <span className="text-xs text-muted-foreground">{n.cohort}</span>
            <Badge variant="outline" className={`text-[10px] font-black ${severityConfig.badge}`}>{severityConfig.label}</Badge>
            <Badge variant="outline" className={`text-[10px] ${CATEGORY_STYLES[n.category] || ""}`}>{CATEGORY_LABELS[n.category] || n.category}</Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <Clock className="w-3 h-3" />
            {timeAgo(n.timestamp)}
          </div>
        </div>

        <p className="text-sm font-semibold text-foreground mb-1">{n.issue}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{n.detail}</p>

        {/* AI Recommendation — expandable */}
        {expanded && (
          <div className="mt-3 p-3 rounded-xl border border-primary/20 bg-primary/[0.02]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Brain className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">AI Recommendation</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{n.aiRecommendation}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <button onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
            <Brain className="w-3 h-3" />
            {expanded ? "Hide" : "View"} AI Recommendation
          </button>
          {n.severity !== "resolved" && (
            <>
              <span className="text-muted-foreground/30 text-xs">·</span>
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium">
                <CalendarDays className="w-3 h-3" /> Schedule Sync-up
              </button>
              <span className="text-muted-foreground/30 text-xs">·</span>
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium">
                <ShieldAlert className="w-3 h-3" /> Create Intervention
              </button>
            </>
          )}
        </div>
      </div>

      {/* Dismiss */}
      <button onClick={() => onDismiss(n.id)} className="shrink-0 p-1.5 rounded-lg text-muted-foreground/30 hover:text-muted-foreground hover:bg-muted/60 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function POCNotificationsPage() {
  const { notifications: liveNotifs, connected, clearAll: clearLive } = useNotifications();
  const [staticNotifs, setStaticNotifs] = useState<StaticNotif[]>(STATIC_NOTIFS);
  const [activeFilter, setActiveFilter] = useState<Severity>("all");
  const [showLive, setShowLive] = useState(false);

  const dismiss = (id: string) => setStaticNotifs((prev) => prev.filter((n) => n.id !== id));
  const clearAll = () => setStaticNotifs((prev) => prev.filter((n) => n.severity === "resolved"));
  const markResolved = (id: string) => setStaticNotifs((prev) => prev.map((n) => n.id === id ? { ...n, severity: "resolved" as const } : n));

  const counts = {
    all: staticNotifs.length,
    critical: staticNotifs.filter((n) => n.severity === "critical").length,
    warning: staticNotifs.filter((n) => n.severity === "warning").length,
    resolved: staticNotifs.filter((n) => n.severity === "resolved").length,
  };

  const displayed = activeFilter === "all" ? staticNotifs : staticNotifs.filter((n) => n.severity === activeFilter);

  const FILTERS: { key: Severity; label: string; icon: typeof Bell; color: string; count: number }[] = [
    { key: "all",      label: "All",      icon: Bell,         color: "text-foreground", count: counts.all },
    { key: "critical", label: "Critical", icon: ShieldAlert,  color: "text-red-600",    count: counts.critical },
    { key: "warning",  label: "Warning",  icon: AlertTriangle,color: "text-amber-600",  count: counts.warning },
    { key: "resolved", label: "Resolved", icon: CheckCircle2, color: "text-emerald-600",count: counts.resolved },
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6 overflow-y-auto h-screen">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Central alerts center — stay on top of critical issues
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border ${connected ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-muted text-muted-foreground"}`}>
              {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {connected ? "Live" : "Offline"}
            </div>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={() => setShowLive((v) => !v)}>
              <Bell className="w-3.5 h-3.5" /> Live Stream {liveNotifs.length > 0 && `(${liveNotifs.length})`}
            </Button>
            {counts.critical > 0 && (
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                onClick={() => setStaticNotifs((prev) => prev.map((n) => n.severity !== "resolved" ? { ...n, severity: "resolved" as const } : n))}>
                <CheckCheck className="w-3.5 h-3.5" /> Resolve All
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-red-600"
              onClick={clearAll}>
              <Trash2 className="w-3.5 h-3.5" /> Clear Resolved
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FILTERS.map(({ key, label, icon: Icon, color, count }) => {
            const bgMap = { all: "bg-card", critical: "bg-red-50", warning: "bg-amber-50", resolved: "bg-emerald-50" };
            const iconBgMap = { all: "bg-muted/40", critical: "bg-red-100", warning: "bg-amber-100", resolved: "bg-emerald-100" };
            return (
              <button key={key} onClick={() => setActiveFilter(key)} className="text-left w-full">
                <GlassCard className={`p-5 cursor-pointer hover:border-primary/20 transition-colors h-full ${activeFilter === key ? "ring-2 ring-primary/20 border-primary/30" : ""}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color} ${iconBgMap[key]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className={`text-2xl font-bold tabular-nums ${color}`}>{count}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
                </GlassCard>
              </button>
            );
          })}
        </div>

        {/* Live Stream Panel */}
        {showLive && liveNotifs.length > 0 && (
          <GlassCard className="p-4 border-primary/20 bg-primary/[0.02]">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-primary">Live Stream Alerts</span>
              </div>
              <span className="text-xs text-muted-foreground ml-auto">{liveNotifs.length} alerts</span>
            </div>
            <div className="space-y-2">
              {liveNotifs.slice(0, 5).map((n) => (
                <div key={n.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${
                  n.level === "high" ? "border-red-200 bg-red-50/40" : n.level === "medium" ? "border-amber-200 bg-amber-50/40" : "border-emerald-200 bg-emerald-50/40"
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${n.level === "high" ? "bg-red-500" : n.level === "medium" ? "bg-amber-500" : "bg-emerald-500"}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-foreground">{n.trainee}</span>
                    <span className="text-xs text-muted-foreground ml-2">{n.change}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(n.timestamp)}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Filter tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {FILTERS.map(({ key, label, color, count }) => (
            <button key={key} onClick={() => setActiveFilter(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeFilter === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              {label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  activeFilter === key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>{count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Section groups */}
        {activeFilter === "all" ? (
          <div className="space-y-6">
            {(["critical", "warning", "resolved"] as const).map((sev) => {
              const items = staticNotifs.filter((n) => n.severity === sev);
              if (items.length === 0) return null;
              const sectionTitle = sev === "critical" ? "🔴 Critical — Requires Immediate Action" : sev === "warning" ? "🟡 Warning — Monitor & Follow Up" : "✅ Resolved";
              return (
                <div key={sev}>
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">{sectionTitle}</h2>
                    <span className="text-xs text-muted-foreground">({items.length})</span>
                  </div>
                  <div className="space-y-3">
                    {items.map((n) => <NotifCard key={n.id} n={n} onDismiss={dismiss} />)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Bell className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm font-medium">No {activeFilter} notifications</p>
              </div>
            ) : (
              displayed.map((n) => <NotifCard key={n.id} n={n} onDismiss={dismiss} />)
            )}
          </div>
        )}

      </div>
    </Layout>
  );
}
