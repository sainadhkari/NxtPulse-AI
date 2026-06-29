import { useState } from "react";
import {
  Users, AlertTriangle, CheckCircle2, Clock,
  TrendingDown, TrendingUp, ShieldAlert, CalendarCheck,
  ChevronRight, Loader2, Filter
} from "lucide-react";
import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetCohortStats } from "@workspace/api-client-react";
import type { CohortStats } from "@workspace/api-client-react";

function riskStyle(value: number, type: "high" | "low") {
  const isGood = type === "high" ? value >= 70 : value <= 35;
  const isMid = type === "high" ? value >= 50 : value <= 60;
  if (isGood) return "text-emerald-600";
  if (isMid) return "text-amber-600";
  return "text-red-600";
}

function riskBg(count: number) {
  if (count >= 5) return "text-red-700 bg-red-50 border-red-200";
  if (count >= 2) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-emerald-700 bg-emerald-50 border-emerald-200";
}

function metricStatus(value: number, goodThreshold = 70, warnThreshold = 50) {
  if (value >= goodThreshold) return { dot: "bg-emerald-500", label: "Good" };
  if (value >= warnThreshold) return { dot: "bg-amber-500", label: "Warning" };
  return { dot: "bg-red-500", label: "At Risk" };
}

const LOW_PERFORMERS = [
  { name: "Rahul Verma", cohort: "Cohort-7", attendance: 62, demo: 38, risk: "HIGH" },
  { name: "Pooja Menon", cohort: "Cohort-7", attendance: 48, demo: 19, risk: "HIGH" },
  { name: "Vikram Singh", cohort: "Cohort-8", attendance: 55, demo: 31, risk: "HIGH" },
  { name: "Rohit Joshi", cohort: "Cohort-7", attendance: 41, demo: 22, risk: "HIGH" },
  { name: "Arjun Das", cohort: "Cohort-8", attendance: 70, demo: 44, risk: "MEDIUM" },
];

const DEMO_READINESS = [
  { name: "Ananya Reddy", cohort: "Cohort-8", score: 87, date: "Today 3 PM", ready: true },
  { name: "Meena Iyer", cohort: "Cohort-6", score: 89, date: "Tomorrow 10 AM", ready: true },
  { name: "Sai Krishna", cohort: "Cohort-7", score: 55, date: "Jun 30, 2 PM", ready: false },
  { name: "Kiran Patel", cohort: "Cohort-7", score: 63, date: "Jul 1, 11 AM", ready: false },
];

const PENDING_INTERVENTIONS = [
  { trainee: "Rahul Verma", cohort: "Cohort-7", issue: "Missed 3 consecutive standups", severity: "HIGH" },
  { trainee: "Vikram Singh", cohort: "Cohort-8", issue: "AI dependency critical — 88%", severity: "HIGH" },
  { trainee: "Pooja Menon", cohort: "Cohort-7", issue: "No communication for 5 days", severity: "HIGH" },
  { trainee: "Sai Krishna", cohort: "Cohort-7", issue: "Demo submission delayed twice", severity: "MEDIUM" },
];

export default function POCCohortsPage() {
  const { data: cohorts = [], isLoading } = useGetCohortStats();
  const [filterCohort, setFilterCohort] = useState<string>("all");

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const displayCohorts = filterCohort === "all" ? cohorts : cohorts.filter((c) => c.cohort === filterCohort);

  return (
    <Layout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cohort Monitoring</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Operational view — track which cohort needs your attention today
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            {["all", ...cohorts.map((c) => c.cohort)].map((c) => (
              <button
                key={c}
                onClick={() => setFilterCohort(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  filterCohort === c
                    ? "bg-primary text-white border-primary"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Cohorts", value: cohorts.length, icon: Users, color: "text-primary", bg: "bg-primary/8" },
            { label: "Total Trainees", value: cohorts.reduce((s, c) => s + c.total_trainees, 0), icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
            { label: "High Risk", value: cohorts.reduce((s, c) => s + c.high_risk_count, 0), icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
            { label: "Pending Actions", value: PENDING_INTERVENTIONS.length, icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <GlassCard key={label} className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color} ${bg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground tabular-nums">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Cohort Cards */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cohort Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayCohorts.map((c) => {
              const teachScore = Math.round((c.avg_learning_score + c.avg_demo_score) / 2);
              const sdiProgress = Math.round((c.avg_learning_score * 0.4 + c.avg_demo_score * 0.3 + c.avg_attendance * 0.3));
              const highRiskStyle = riskBg(c.high_risk_count);
              const attendanceMs = metricStatus(c.avg_attendance);
              const demoMs = metricStatus(c.avg_demo_score);
              const teachMs = metricStatus(teachScore);
              const sdiMs = metricStatus(sdiProgress);

              return (
                <GlassCard key={c.cohort} className="p-5">
                  {/* Title row */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-foreground text-base">{c.cohort}</h3>
                      <p className="text-xs text-muted-foreground">{c.total_trainees} trainees</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${highRiskStyle}`}>
                      <AlertTriangle className="w-3 h-3" />
                      {c.high_risk_count} High Risk
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-2.5">
                    {[
                      { label: "Attendance", value: c.avg_attendance, ms: attendanceMs },
                      { label: "Demo Score", value: c.avg_demo_score, ms: demoMs },
                      { label: "Teach Score", value: teachScore, ms: teachMs },
                      { label: "SDI Progress", value: sdiProgress, ms: sdiMs },
                    ].map(({ label, value, ms }) => (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${ms.dot}`} />
                            <span className="text-xs text-muted-foreground">{label}</span>
                          </div>
                          <span className={`text-xs font-bold tabular-nums ${
                            ms.dot === "bg-emerald-500" ? "text-emerald-600" :
                            ms.dot === "bg-amber-500" ? "text-amber-600" : "text-red-600"
                          }`}>{value.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              ms.dot === "bg-emerald-500" ? "bg-emerald-500" :
                              ms.dot === "bg-amber-500" ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(value, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Risk counts */}
                  <div className="flex gap-1.5 mt-4 pt-3 border-t border-border">
                    <span className="text-xs px-2 py-0.5 rounded border text-red-700 bg-red-50 border-red-200 font-medium">High · {c.high_risk_count}</span>
                    <span className="text-xs px-2 py-0.5 rounded border text-amber-700 bg-amber-50 border-amber-200 font-medium">Med · {c.medium_risk_count}</span>
                    <span className="text-xs px-2 py-0.5 rounded border text-emerald-700 bg-emerald-50 border-emerald-200 font-medium">Low · {c.low_risk_count}</span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Low Performers */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Low Performers</h2>
            <span className="text-xs text-muted-foreground">— trainees needing immediate support</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {LOW_PERFORMERS.filter((p) => filterCohort === "all" || p.cohort === filterCohort).map((p) => (
              <div key={p.name} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground">
                    {p.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.cohort}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`text-xs font-semibold ${riskStyle(p.attendance, "high")}`}>Att: {p.attendance}%</div>
                    <div className={`text-xs font-semibold ${riskStyle(p.demo, "high")}`}>Demo: {p.demo}%</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    p.risk === "HIGH" ? "text-red-700 bg-red-50 border-red-200" : "text-amber-700 bg-amber-50 border-amber-200"
                  }`}>{p.risk}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Demo Readiness + Pending Interventions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Demo Readiness */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <CalendarCheck className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Upcoming Demo Readiness</h3>
            </div>
            <div className="space-y-3">
              {DEMO_READINESS.filter((d) => filterCohort === "all" || d.cohort === filterCohort).map((d) => (
                <div key={d.name} className={`flex items-center justify-between p-3 rounded-xl border ${
                  d.ready ? "border-emerald-200 bg-emerald-50/40" : "border-amber-200 bg-amber-50/40"
                }`}>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{d.name}</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3" /> {d.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold tabular-nums ${d.ready ? "text-emerald-600" : "text-amber-600"}`}>{d.score}%</span>
                    {d.ready
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Pending Interventions */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-semibold text-foreground">Pending Interventions</h3>
            </div>
            <div className="space-y-3">
              {PENDING_INTERVENTIONS.filter((i) => filterCohort === "all" || i.cohort === filterCohort).map((item) => (
                <div key={item.trainee} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-border bg-card">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{item.trainee}</span>
                      <span className="text-xs text-muted-foreground">{item.cohort}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.issue}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      item.severity === "HIGH" ? "text-red-700 bg-red-50 border-red-200" : "text-amber-700 bg-amber-50 border-amber-200"
                    }`}>{item.severity}</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                      <ChevronRight className="w-3 h-3" /> Act
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>
    </Layout>
  );
}
