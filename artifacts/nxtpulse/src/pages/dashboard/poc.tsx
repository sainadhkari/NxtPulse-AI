import { useMemo } from "react";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetTelemetry,
  useGetOutreachSuggestions,
  useGetUnderstudySimulation,
} from "@workspace/api-client-react";
import type { TelemetryRow } from "@workspace/api-client-react";

type ExtTelemetryRow = TelemetryRow & { cohort?: string; attendance?: number; ai_dependency?: number };
import {
  AlertCircle, Clock, CheckCircle2, Users,
  CalendarCheck, MessageSquare, ShieldAlert, Eye,
  UserCheck, Zap, TrendingDown, TrendingUp,
  Phone, Video, FileText, ArrowRight,
  Activity, Bell, Target, ChevronRight,
} from "lucide-react";
import { Link } from "wouter";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

// ─── Daily Ops data ──────────────────────────────────────────────────────────

const STANDUP_STATUS = [
  { name: "Rahul Verma",  done: false, status: "missed" },
  { name: "Vikram Singh", done: true,  status: "done" },
  { name: "Sai Krishna",  done: true,  status: "done" },
  { name: "Pooja Menon",  done: false, status: "pending" },
  { name: "Arjun Das",    done: true,  status: "done" },
  { name: "Kiran Patel",  done: false, status: "pending" },
  { name: "Deepa Nair",   done: true,  status: "done" },
];

const ATTENDANCE_TODAY = {
  present: 7,
  absent: 3,
  late: 2,
  total: 10,
};

const PRIORITY_ACTIONS = [
  { label: "Call Rahul Verma — absent 5 days, 3 standups missed", severity: "critical", href: "/poc/trainee/t1" },
  { label: "Review Vikram Singh demo — AI dependency at 88%",      severity: "warning",  href: "/poc/trainee/t2" },
  { label: "Reschedule missed sync-up with Pooja Menon",           severity: "warning",  href: "/poc/syncups" },
];

const TODAY_SCHEDULE = [
  { time: "09:30 AM", type: "Standup", label: "Cohort-7 Daily Standup", trainees: "5 trainees", icon: MessageSquare, color: "bg-primary/10 text-primary", border: "border-primary/20" },
  { time: "11:00 AM", type: "Sync-up", label: "1:1 with Rahul Verma", trainees: "Follow-up on attendance", icon: Video, color: "bg-amber-50 text-amber-600", border: "border-amber-200" },
  { time: "02:30 PM", type: "Demo Review", label: "Demo Review — Vikram Singh", trainees: "Score pending", icon: FileText, color: "bg-violet-50 text-violet-600", border: "border-violet-200" },
  { time: "04:00 PM", type: "Intervention", label: "Intervention — Pooja Menon", trainees: "AI dependency concern", icon: ShieldAlert, color: "bg-red-50 text-red-600", border: "border-red-200" },
];

const QUICK_METRICS = [
  { label: "Avg Attendance", value: 66, color: "#f59e0b", trend: -4, positive: false },
  { label: "Avg Demo Score", value: 44, color: "#ef4444", trend: -3, positive: false },
  { label: "Avg Teach Score", value: 52, color: "#7c3aed", trend: +2, positive: true },
  { label: "SDI Progress", value: 61, color: "#2563eb", trend: +5, positive: true },
];

export default function POCDashboard() {
  return (
    <ProtectedRoute allowedRoles={["poc", "manager"]}>
      <Layout>
        <div className="p-6 space-y-6 overflow-y-auto h-screen">
          <DashboardContent />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function DailyOpsSummary() {
  const done = STANDUP_STATUS.filter((s) => s.done).length;
  const total = STANDUP_STATUS.length;
  const pct = Math.round((done / total) * 100);
  const attPct = Math.round((ATTENDANCE_TODAY.present / ATTENDANCE_TODAY.total) * 100);

  return (
    <GlassCard className="p-0 overflow-hidden border-primary/20">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-primary/[0.02]">
        <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
          <Activity className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-xs font-bold text-primary uppercase tracking-wider">Daily Ops Summary</span>
        <span className="text-xs text-muted-foreground ml-1">— {formatDate()}</span>
        <Link href="/poc/notifications" className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
          <Bell className="w-3 h-3" /> View all alerts <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">

        {/* Panel 1 — Standup Completion */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Standup Completion</span>
            </div>
            <span className={`text-xs font-bold tabular-nums ${pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-red-600"}`}>
              {done}/{total} done
            </span>
          </div>
          {/* Progress arc-style bar */}
          <div className="h-2 bg-muted rounded-full mb-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {/* Per-trainee dots */}
          <div className="flex flex-wrap gap-1.5">
            {STANDUP_STATUS.map((s) => (
              <div
                key={s.name}
                title={`${s.name} — ${s.status}`}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-medium ${
                  s.status === "done"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : s.status === "missed"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-border bg-muted/40 text-muted-foreground"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${s.status === "done" ? "bg-emerald-500" : s.status === "missed" ? "bg-red-500" : "bg-gray-400"}`} />
                {s.name.split(" ")[0]}
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2 — Attendance Snapshot */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Attendance Snapshot</span>
            </div>
            <span className={`text-xs font-bold tabular-nums ${attPct >= 80 ? "text-emerald-600" : attPct >= 60 ? "text-amber-600" : "text-red-600"}`}>
              {attPct}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full mb-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${attPct >= 80 ? "bg-emerald-500" : attPct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${attPct}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Present", value: ATTENDANCE_TODAY.present, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
              { label: "Absent",  value: ATTENDANCE_TODAY.absent,  color: "text-red-700",     bg: "bg-red-50 border-red-200" },
              { label: "Late",    value: ATTENDANCE_TODAY.late,    color: "text-amber-700",   bg: "bg-amber-50 border-amber-200" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`text-center px-2 py-2 rounded-xl border ${bg}`}>
                <div className={`text-lg font-bold tabular-nums ${color}`}>{value}</div>
                <div className="text-[10px] text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 3 — Priority Actions */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Top Priority Actions</span>
          </div>
          <div className="space-y-2">
            {PRIORITY_ACTIONS.map((a, i) => (
              <Link key={i} href={a.href} className="group flex items-start gap-2 hover:bg-muted/40 rounded-lg p-1.5 -mx-1.5 transition-colors">
                <span className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                  a.severity === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                }`}>{i + 1}</span>
                <span className="text-xs text-foreground leading-relaxed group-hover:text-primary transition-colors">{a.label}</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </GlassCard>
  );
}

function DashboardContent() {
  const { data: telemetry, isLoading: telLoading } = useGetTelemetry();
  const { data: suggestions, isLoading: sugLoading } = useGetOutreachSuggestions();
  const { data: simulation, isLoading: simLoading } = useGetUnderstudySimulation();

  const cohort7Trainees = useMemo(() => {
    if (!telemetry) return [];
    return telemetry
      .filter((t) => t.cohort === "Cohort-7")
      .sort((a, b) => {
        const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return (order[a.risk_level] ?? 3) - (order[b.risk_level] ?? 3);
      });
  }, [telemetry]);

  const highPriority = cohort7Trainees.filter((t) => t.risk_level === "high" || t.risk_level === "medium");

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}, Priya 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDate()} · POC Command Center · Cohort-7
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!simLoading && simulation && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              {simulation.pending_actions} items need attention
            </span>
          )}
        </div>
      </div>

      {/* ── Daily Ops Summary ── */}
      <DailyOpsSummary />

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {simLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
        ) : simulation ? (
          <>
            <GlassCard className="p-5 border-amber-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-xs font-medium text-amber-600">Action needed</span>
              </div>
              <div className="text-3xl font-bold tabular-nums">{simulation.pending_actions}</div>
              <div className="text-sm text-muted-foreground mt-0.5">Pending Actions</div>
            </GlassCard>

            <GlassCard className="p-5 border-red-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-xs font-medium text-red-600">3 absent</span>
              </div>
              <div className="text-3xl font-bold tabular-nums">3</div>
              <div className="text-sm text-muted-foreground mt-0.5">Attendance Alerts</div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-primary">Today</span>
              </div>
              <div className="text-3xl font-bold tabular-nums">4</div>
              <div className="text-sm text-muted-foreground mt-0.5">Standups Scheduled</div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +12%
                </span>
              </div>
              <div className="text-3xl font-bold tabular-nums">{simulation.resolved_today}</div>
              <div className="text-sm text-muted-foreground mt-0.5">Resolved Today</div>
            </GlassCard>
          </>
        ) : null}
      </div>

      {/* ── Main grid: Priority Trainees + Today's Schedule ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Section 1 — High Priority Trainees */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">High Priority Trainees</h2>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
              <Link href="/poc/my-trainees"><Users className="w-3 h-3" /> View All</Link>
            </Button>
          </div>

          {telLoading ? (
            <div className="space-y-2">
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {highPriority.slice(0, 5).map((t) => {
                const isHigh = t.risk_level === "high";
                const issues = [];
                if (t.attendance < 65) issues.push(`Attendance ${t.attendance}%`);
                if (t.ai_dependency > 70) issues.push(`AI dep ${t.ai_dependency}%`);
                if (t.learning_score < 45) issues.push(`Score ${t.learning_score}%`);

                return (
                  <div key={t.trainee_id} className={`p-4 rounded-xl border flex items-center gap-4 ${isHigh ? "border-red-200 bg-red-50/20" : "border-amber-200 bg-amber-50/20"}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isHigh ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                      {t.trainee_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={`/poc/trainee/${t.trainee_id}`} className="text-sm font-semibold text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors">
                          {t.trainee_name}
                        </Link>
                        <Badge variant="outline" className={`text-xs ${isHigh ? "text-red-700 border-red-200 bg-red-50" : "text-amber-700 border-amber-200 bg-amber-50"}`}>
                          {t.risk_level.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {issues.map((issue, i) => (
                          <span key={i} className={`text-xs px-1.5 py-0.5 rounded font-medium ${isHigh ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                            {issue}
                          </span>
                        ))}
                        <span className="text-xs text-muted-foreground">{t.track}</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
                        <Link href={`/poc/trainee/${t.trainee_id}`}><Eye className="w-3.5 h-3.5" /></Link>
                      </Button>
                      <Button size="sm" variant="ghost" className={`h-7 w-7 p-0 ${isHigh ? "text-red-500 hover:text-red-700 hover:bg-red-50" : "text-amber-500 hover:text-amber-700 hover:bg-amber-50"}`} asChild>
                        <Link href="/interventions"><ShieldAlert className="w-3.5 h-3.5" /></Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
              {highPriority.length === 0 && (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All trainees are on track — no urgent issues.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2 — Today's Schedule */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Today's Schedule</h2>
          </div>
          <div className="space-y-3">
            {TODAY_SCHEDULE.map((item, i) => (
              <div key={i} className={`flex gap-3 p-3 rounded-lg border ${item.border} bg-white/50`}>
                <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground font-medium">{item.time}</div>
                  <div className="text-sm font-semibold text-foreground truncate">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.trainees}</div>
                </div>
              </div>
            ))}
          </div>
          <Button size="sm" variant="outline" className="w-full mt-4 text-xs gap-1 h-8" asChild>
            <Link href="/poc/calendar"><CalendarCheck className="w-3 h-3" /> Full Calendar</Link>
          </Button>
        </GlassCard>
      </div>

      {/* ── Section 3: AI Recommendations + Section 4: Quick Metrics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* AI Recommendations */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">AI Recommendations</h2>
          </div>

          {sugLoading ? (
            <div className="space-y-2">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : suggestions ? (
            <div className="space-y-2">
              {suggestions.slice(0, 4).map((sug) => {
                const isHigh = sug.priority === "high";
                return (
                  <div key={sug.id} className={`p-4 rounded-xl border flex gap-3 ${isHigh ? "border-red-200 bg-red-50/20" : "border-amber-200 bg-amber-50/20"}`}>
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${isHigh ? "bg-red-100" : "bg-amber-100"}`}>
                      <UserCheck className={`w-4 h-4 ${isHigh ? "text-red-600" : "text-amber-600"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-foreground">{sug.trainee_name}</span>
                        <Badge variant="outline" className={`text-xs ${isHigh ? "text-red-700 border-red-200 bg-red-50" : "text-amber-700 border-amber-200 bg-amber-50"}`}>
                          {sug.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{sug.issue}</p>
                      <p className={`text-xs font-medium border-l-2 pl-2 ${isHigh ? "border-red-400 text-red-700" : "border-amber-400 text-amber-700"}`}>
                        {sug.recommendation}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="outline" className="h-7 text-xs px-2">Resolve</Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
                        <Link href={`/poc/trainee/${sug.trainee_id}`}><ArrowRight className="w-3.5 h-3.5" /></Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Quick Metrics */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Quick Metrics</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Cohort-7 averages</p>
          <div className="space-y-4">
            {QUICK_METRICS.map((m) => (
              <div key={m.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold tabular-nums" style={{ color: m.color }}>{m.value}%</span>
                    <span className={`text-xs flex items-center gap-0.5 ${m.positive ? "text-emerald-600" : "text-red-600"}`}>
                      {m.positive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      {Math.abs(m.trend)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${m.value}%`, backgroundColor: m.color }} />
                </div>
              </div>
            ))}
          </div>
          <Button size="sm" variant="outline" className="w-full mt-5 text-xs gap-1 h-8" asChild>
            <Link href="/poc/my-trainees"><Users className="w-3 h-3" /> View All Trainees</Link>
          </Button>
        </GlassCard>
      </div>

    </div>
  );
}
