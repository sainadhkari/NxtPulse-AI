import { useState } from "react";
import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
  Bell, ShieldAlert, AlertTriangle, CheckCircle2,
  Clock, X, Brain, CalendarDays, BookOpen, Zap,
  Activity, Target, ChevronDown, ChevronUp,
} from "lucide-react";

type Severity = "critical" | "warning" | "resolved";
type Filter = Severity | "all";

interface SDIAlert {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  timestamp: string;
  category: "demo" | "attendance" | "ccbp" | "ai_dependency" | "tech_os" | "general";
  suggestion: string;
  dismissed?: boolean;
}

const ALERTS: SDIAlert[] = [
  {
    id: "a1", severity: "critical", category: "demo",
    title: "Demo scheduled tomorrow — React Hooks",
    detail: "Your demo on React Hooks is at 2:00 PM tomorrow. Last practice score was 74%. You need 30 more minutes of preparation.",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    suggestion: "Run through the Demo Simulator now — focus on useEffect cleanup functions which were weak in your last session.",
  },
  {
    id: "a2", severity: "critical", category: "attendance",
    title: "Attendance dropped to 85%",
    detail: "Your attendance has dropped from 92% to 85% over the last 4 months. This may affect your Instructor Readiness score.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    suggestion: "Attend all standups this week. Target 95% attendance for next month to recover your score.",
  },
  {
    id: "a3", severity: "warning", category: "ccbp",
    title: "Node.js module incomplete — demo in 3 days",
    detail: "You have a Node.js demo on Jul 2 but the Streams & Buffers module is only 60% complete.",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    suggestion: "Set aside 2 hours tonight to complete the remaining module content before your demo.",
  },
  {
    id: "a4", severity: "warning", category: "ai_dependency",
    title: "AI dependency at 34% — still above target",
    detail: "Good progress (down from 62%), but target is 25%. You're still relying on AI for SQL and DSA problems.",
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    suggestion: "Do 3 coding challenges this week without any AI tools. Focus on SQL window functions.",
  },
  {
    id: "a5", severity: "warning", category: "tech_os",
    title: "Demo handling score dipped to 62%",
    detail: "Your Tech OS demo handling score dropped 8% this week. Session preparation time also decreased.",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    suggestion: "Use the Viva Practice mode to rebuild confidence. Practice out loud — speak the full demo before tomorrow.",
  },
  {
    id: "a6", severity: "warning", category: "ccbp",
    title: "JavaScript Closures flagged as critical gap",
    detail: "LearnGuard AI flagged Closures as a critical knowledge gap (52%). This topic may appear in your upcoming viva.",
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    suggestion: "Complete the Closures revision module. Practice 5 closure-based coding problems today.",
  },
  {
    id: "a7", severity: "resolved", category: "demo",
    title: "Node.js REST API demo — Passed (85%)",
    detail: "You passed the Node.js REST API demo with 85% — excellent technical understanding and confident delivery.",
    timestamp: new Date(Date.now() - 432000000).toISOString(),
    suggestion: "Keep this momentum. Apply the same confidence to your next React Hooks demo.",
  },
  {
    id: "a8", severity: "resolved", category: "ai_dependency",
    title: "AI dependency reduced by 28%",
    detail: "Dropped from 62% to 34% over 6 weeks. Consistent no-AI coding practice is paying off.",
    timestamp: new Date(Date.now() - 604800000).toISOString(),
    suggestion: "Continue reducing by 2-3% per week. Target: 25% by end of July.",
  },
];

const CAT_ICONS = {
  demo:          Target,
  attendance:    CalendarDays,
  ccbp:          BookOpen,
  ai_dependency: Zap,
  tech_os:       Activity,
  general:       Bell,
};

const CAT_LABELS = {
  demo: "Demo", attendance: "Attendance", ccbp: "CCBP",
  ai_dependency: "AI Dependency", tech_os: "Tech OS", general: "General",
};

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function AlertCard({ a, onDismiss }: { a: SDIAlert; onDismiss: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const Icon = CAT_ICONS[a.category];
  const sev = a.severity;

  const styles = {
    critical: { border: "border-l-red-500",     icon: "bg-red-50 border-red-200 text-red-600",     badge: "text-red-700 border-red-200 bg-red-50" },
    warning:  { border: "border-l-amber-500",   icon: "bg-amber-50 border-amber-200 text-amber-600", badge: "text-amber-700 border-amber-200 bg-amber-50" },
    resolved: { border: "border-l-emerald-500", icon: "bg-emerald-50 border-emerald-200 text-emerald-600", badge: "text-emerald-700 border-emerald-200 bg-emerald-50" },
  }[sev];

  return (
    <div className={`flex items-start gap-4 p-5 rounded-xl border border-border bg-card border-l-4 ${styles.border} hover:shadow-sm transition-shadow`}>
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${styles.icon}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">{a.title}</span>
            <Badge variant="outline" className={`text-[10px] font-black ${styles.badge}`}>
              {sev === "critical" ? "CRITICAL" : sev === "warning" ? "WARNING" : "RESOLVED"}
            </Badge>
            <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">{CAT_LABELS[a.category]}</Badge>
          </div>
          <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
            <Clock className="w-3 h-3" />{timeAgo(a.timestamp)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{a.detail}</p>
        <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
          <Brain className="w-3 h-3" />
          {open ? "Hide" : "AI"} Suggestion {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {open && (
          <div className="mt-2 p-3 rounded-xl border border-primary/20 bg-primary/[0.02]">
            <p className="text-xs text-muted-foreground leading-relaxed">{a.suggestion}</p>
          </div>
        )}
      </div>
      {sev !== "resolved" && (
        <button onClick={() => onDismiss(a.id)} className="shrink-0 p-1 text-muted-foreground/30 hover:text-muted-foreground rounded-lg hover:bg-muted/60 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function SDIAlertsPage() {
  const [alerts, setAlerts] = useState(ALERTS);
  const [filter, setFilter] = useState<Filter>("all");

  const dismiss = (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  const counts = {
    all:      alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning:  alerts.filter((a) => a.severity === "warning").length,
    resolved: alerts.filter((a) => a.severity === "resolved").length,
  };

  const displayed = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <Layout>
      <div className="p-6 space-y-6">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Personal alerts — demos, attendance, CCBP, AI dependency</p>
          </div>
          {counts.critical > 0 && (
            <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50 font-bold text-sm px-3 py-1">
              {counts.critical} Critical
            </Badge>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {([
            { key: "all",      label: "All",      icon: Bell,         bg: "bg-muted/40",   color: "text-foreground" },
            { key: "critical", label: "Critical",  icon: ShieldAlert,  bg: "bg-red-100",    color: "text-red-600" },
            { key: "warning",  label: "Warning",   icon: AlertTriangle,bg: "bg-amber-100",  color: "text-amber-600" },
            { key: "resolved", label: "Resolved",  icon: CheckCircle2, bg: "bg-emerald-100",color: "text-emerald-600" },
          ] as const).map(({ key, label, icon: Icon, bg, color }) => (
            <button key={key} onClick={() => setFilter(key as Filter)} className="text-left">
              <GlassCard className={`p-5 h-full cursor-pointer hover:shadow-sm transition-shadow ${filter === key ? "ring-2 ring-primary/20 border-primary/30" : ""}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg} ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`text-2xl font-bold tabular-nums ${color}`}>{counts[key as keyof typeof counts]}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
              </GlassCard>
            </button>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {(["all","critical","warning","resolved"] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                filter === f ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              {f} {counts[f] > 0 && <span className="ml-1 text-xs">{counts[f]}</span>}
            </button>
          ))}
        </div>

        {/* Alerts grouped */}
        {filter === "all" ? (
          <div className="space-y-6">
            {(["critical","warning","resolved"] as Severity[]).map((sev) => {
              const items = alerts.filter((a) => a.severity === sev);
              if (!items.length) return null;
              const heading = sev === "critical" ? "🔴 Critical — Act Now" : sev === "warning" ? "🟡 Warning — Review Soon" : "✅ Resolved";
              return (
                <div key={sev}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">{heading} ({items.length})</p>
                  <div className="space-y-3">
                    {items.map((a) => <AlertCard key={a.id} a={a} onDismiss={dismiss} />)}
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
                <p className="text-sm">No {filter} alerts</p>
              </div>
            ) : displayed.map((a) => <AlertCard key={a.id} a={a} onDismiss={dismiss} />)}
          </div>
        )}

      </div>
    </Layout>
  );
}
