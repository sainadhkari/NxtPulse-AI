import { useState } from "react";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useGetInsightsSummary,
  useGetInsightsTrends,
  useGetRecommendedActions
} from "@workspace/api-client-react";
import {
  BarChart3, TrendingUp, AlertCircle, Zap, ShieldAlert, Brain,
  TrendingDown, Users, Target, Star, ChevronUp, ChevronDown,
  AlertTriangle, CheckCircle2, Sparkles, Award, Activity
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from "recharts";

// ─── Static enrichment data ───────────────────────────────────────────────────

const RISK_TREND_DATA = [
  { week: "W1", high: 8, medium: 22, low: 31 },
  { week: "W2", high: 9, medium: 24, low: 28 },
  { week: "W3", high: 11, medium: 21, low: 29 },
  { week: "W4", high: 10, medium: 25, low: 26 },
  { week: "W5", high: 13, medium: 23, low: 25 },
  { week: "W6", high: 15, medium: 20, low: 26 },
  { week: "W7", high: 14, medium: 22, low: 25 },
  { week: "W8", high: 17, medium: 19, low: 25 },
];

const COHORT_COMPARISON_DATA = [
  { cohort: "C6", learning: 81, demo: 77, attendance: 91, ai_dep: 28 },
  { cohort: "C7", learning: 62, demo: 58, attendance: 74, ai_dep: 61 },
  { cohort: "C8", learning: 74, demo: 71, attendance: 83, ai_dep: 43 },
];

const AI_FINDINGS = [
  "Cohort-7 risk increased by 22% over the past 2 weeks",
  "12 trainees have attendance below 60% — demo failure risk rising",
  "AI dependency is climbing in React + Node track (avg 61%)",
];

const AI_PREDICTIONS = [
  "4 trainees likely to fail upcoming demo if no intervention",
  "Cohort-8 is on track to improve by ~14% with current momentum",
  "Stress-driven dropout risk in 3 trainees detected by AI models",
];

const AI_PRIORITIES = [
  { label: "Attendance Crisis", color: "bg-red-500" },
  { label: "Demo Readiness", color: "bg-amber-500" },
  { label: "AI Dependency", color: "bg-primary" },
];

const FORECAST = [
  { label: "High Risk Trainees", from: 12, to: 18, dir: "up" },
  { label: "Medium Risk", from: 31, to: 28, dir: "down" },
  { label: "Demo Failure Risk", from: null, to: 6, dir: "up" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function KPICard({
  title, value, icon, trendPct, trendPositive, bestCohort, worstCohort, insight, borderClass
}: {
  title: string; value: string; icon: React.ReactNode; trendPct: number;
  trendPositive: boolean; bestCohort: string; worstCohort: string; insight: string;
  borderClass?: string;
}) {
  return (
    <GlassCard className={`p-5 border-l-4 ${borderClass ?? "border-l-primary"}`} glowing>
      <div className="flex items-start justify-between mb-3">
        <div className="text-muted-foreground/80 w-5 h-5">{icon}</div>
        <span className={`flex items-center gap-0.5 text-xs font-bold ${trendPositive ? "text-emerald-600" : "text-red-500"}`}>
          {trendPositive ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {Math.abs(trendPct)}%
        </span>
      </div>
      <p className="text-2xl font-black text-foreground tabular-nums">{value}</p>
      <p className="text-xs font-semibold text-muted-foreground mt-0.5 mb-3">{title}</p>
      <div className="flex gap-2 text-[10px] flex-wrap">
        <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
          ↑ {bestCohort}
        </span>
        <span className="px-1.5 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 font-medium">
          ↓ {worstCohort}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 leading-snug">{insight}</p>
    </GlassCard>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InsightsPage() {
  return (
    <ProtectedRoute allowedRoles={["manager", "poc"]}>
      <Layout>
        <div className="p-6 space-y-7 max-w-[1400px] mx-auto">
          {/* Page Header */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Brain className="w-4.5 h-4.5 text-primary" />
                </div>
                <h1 className="text-xl font-black text-foreground">Executive Insights</h1>
              </div>
              <p className="text-sm text-muted-foreground ml-10">AI-powered analytics command center — program health, risk intelligence & action plans</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
              <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="font-medium text-foreground">Live AI Analysis</span>
              <span>· Updated just now</span>
            </div>
          </div>

          <InsightsContent />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function InsightsContent() {
  const { data: summary, isLoading: sumLoading } = useGetInsightsSummary();
  const { data: trends, isLoading: trendsLoading } = useGetInsightsTrends();
  const { data: actions, isLoading: actionsLoading } = useGetRecommendedActions();

  const [actionTab, setActionTab] = useState<"critical" | "high" | "medium">("critical");

  const filteredActions = actions?.filter(a =>
    actionTab === "medium" ? (a.priority !== "critical" && a.priority !== "high") : a.priority === actionTab
  );

  return (
    <div className="space-y-7">

      {/* ── SECTION 1: KPI Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sumLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
        ) : summary ? (
          <>
            <KPICard
              title="Student Health"
              value={`${summary.student_health_score}/100`}
              icon={<TrendingUp />}
              trendPct={4.2} trendPositive
              bestCohort="C6" worstCohort="C7"
              insight="Cohort 6 is driving upward trend this week"
              borderClass="border-l-emerald-500"
            />
            <KPICard
              title="Learning Health"
              value={`${summary.learning_health_score}/100`}
              icon={<BarChart3 />}
              trendPct={1.5} trendPositive
              bestCohort="C8" worstCohort="C7"
              insight="React + Node track pulling average down"
              borderClass="border-l-primary"
            />
            <KPICard
              title="Manager Efficiency"
              value={`${summary.manager_efficiency_score}/100`}
              icon={<Zap />}
              trendPct={12.4} trendPositive
              bestCohort="C6" worstCohort="C8"
              insight="Intervention response time improved by 34%"
              borderClass="border-l-violet-500"
            />
            <KPICard
              title="Risk Forecast"
              value={`${summary.risk_forecast_score}/100`}
              icon={<AlertCircle />}
              trendPct={2.1} trendPositive={false}
              bestCohort="C6" worstCohort="C7"
              insight="18 trainees at elevated risk — action needed"
              borderClass="border-l-red-500"
            />
          </>
        ) : null}
      </div>

      {/* ── SECTION 2: Charts ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Cohort Risk Trend */}
        <GlassCard className="p-5">
          <SectionHeader
            icon={<TrendingDown className="w-4 h-4" />}
            title="Cohort Risk Trend"
            subtitle="High / Medium / Low risk trainees — Week 1 to Week 8"
          />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={RISK_TREND_DATA} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="high" name="High Risk" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="medium" name="Medium Risk" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="low" name="Low Risk" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Cohort Performance Comparison */}
        <GlassCard className="p-5">
          <SectionHeader
            icon={<BarChart3 className="w-4 h-4" />}
            title="Cohort Performance Comparison"
            subtitle="Learning, Demo, Attendance & AI Dependency by cohort"
          />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COHORT_COMPARISON_DATA} margin={{ top: 5, right: 10, bottom: 0, left: -10 }} barSize={10} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="cohort" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="learning" name="Learning Score" fill="#2563eb" radius={[3, 3, 0, 0]} />
                <Bar dataKey="demo" name="Demo Score" fill="#7c3aed" radius={[3, 3, 0, 0]} />
                <Bar dataKey="attendance" name="Attendance" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="ai_dep" name="AI Dependency" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* ── SECTION 3: AI Executive Summary ───────────────────────────── */}
      <GlassCard className="p-5 border-primary/20">
        <SectionHeader
          icon={<Sparkles className="w-4 h-4" />}
          title="AI Executive Summary"
          subtitle="Synthesized intelligence from program-wide data analysis"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Critical Findings */}
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Critical Findings</span>
            </div>
            <ul className="space-y-2">
              {AI_FINDINGS.map((f, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">{i + 1}</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Predictions */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">AI Predictions</span>
            </div>
            <ul className="space-y-2">
              {AI_PREDICTIONS.map((p, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-2">
                  <span className="text-amber-500 shrink-0 mt-0.5">→</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Priorities */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Priority Areas</span>
            </div>
            <div className="space-y-2">
              {AI_PRIORITIES.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-muted-foreground w-4 shrink-0 text-right">#{i + 1}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className={`h-2 rounded-full ${p.color}`} style={{ width: `${90 - i * 18}%` }} />
                  </div>
                  <span className="text-xs text-foreground font-medium">{p.label}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 leading-snug">Focus manager attention on these areas for maximum impact this week</p>
          </div>
        </div>
      </GlassCard>

      {/* ── SECTION 4: Drilldown Insights ─────────────────────────────── */}
      <div>
        <SectionHeader
          icon={<Award className="w-4 h-4" />}
          title="Drilldown Insights"
          subtitle="Quick cohort and track performance summary"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Best Cohort", value: "Cohort 6", sub: "Avg score 81 · Risk: Low", emoji: "🏆", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
            { label: "Worst Cohort", value: "Cohort 7", sub: "Avg score 62 · Risk: High", emoji: "⚠️", bg: "bg-red-50 border-red-200", text: "text-red-700" },
            { label: "Best Track", value: "Python + ML", sub: "Avg score 79 · Stable", emoji: "⭐", bg: "bg-primary/5 border-primary/20", text: "text-primary" },
            { label: "Worst Track", value: "React + Node", sub: "Avg score 61 · Declining", emoji: "📉", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
          ].map((d) => (
            <div key={d.label} className={`p-4 rounded-xl border ${d.bg}`}>
              <div className="text-2xl mb-2">{d.emoji}</div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{d.label}</p>
              <p className={`text-sm font-black ${d.text}`}>{d.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{d.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 5: Forecast Panel ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="p-5 col-span-1">
          <SectionHeader
            icon={<TrendingUp className="w-4 h-4" />}
            title="Next 7 Days Forecast"
            subtitle="AI-powered risk prediction"
          />
          <div className="space-y-3">
            {FORECAST.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
                <span className="text-xs text-foreground font-medium">{f.label}</span>
                <div className="flex items-center gap-2">
                  {f.from !== null && (
                    <span className="text-xs text-muted-foreground tabular-nums">{f.from}</span>
                  )}
                  {f.from !== null && (
                    <span className={`text-xs font-black ${f.dir === "up" ? "text-red-500" : "text-emerald-600"}`}>
                      {f.dir === "up" ? "→" : "→"}
                    </span>
                  )}
                  <span className={`text-sm font-black tabular-nums ${f.dir === "up" ? "text-red-600" : "text-emerald-600"}`}>
                    {f.from !== null ? "" : "⚡ "}{f.to}{f.from === null ? " trainees" : ""}
                  </span>
                  {f.dir === "up"
                    ? <ChevronUp className="w-4 h-4 text-red-500" />
                    : <ChevronDown className="w-4 h-4 text-emerald-500" />}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-[11px] text-primary font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> AI Confidence: 87%
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Based on 8 weeks of behavioral and performance data</p>
          </div>
        </GlassCard>

        {/* ── SECTION 6: Recommended Actions ──────────────────────────── */}
        <GlassCard className="p-5 col-span-1 lg:col-span-2">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <SectionHeader
              icon={<ShieldAlert className="w-4 h-4" />}
              title="Recommended Executive Actions"
              subtitle="Prioritized intervention plan"
            />
            {/* Priority Tabs */}
            <div className="flex items-center bg-muted rounded-xl p-1 border border-border gap-0.5">
              {(["critical", "high", "medium"] as const).map((tab) => {
                const count = actions?.filter(a =>
                  tab === "medium" ? (a.priority !== "critical" && a.priority !== "high") : a.priority === tab
                ).length ?? 0;
                const active = actionTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActionTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      active
                        ? tab === "critical" ? "bg-red-600 text-white shadow-sm"
                          : tab === "high" ? "bg-amber-500 text-white shadow-sm"
                          : "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span className={`text-[10px] px-1 rounded-full ${active ? "bg-white/25" : "bg-muted-foreground/20"}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {actionsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : filteredActions && filteredActions.length > 0 ? (
            <div className="space-y-3">
              {filteredActions.map((action) => (
                <div
                  key={action.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    action.priority === "critical"
                      ? "bg-red-50 border-red-200"
                      : action.priority === "high"
                      ? "bg-amber-50 border-amber-200"
                      : "bg-muted/30 border-border"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge variant="outline" className={
                        action.priority === "critical"
                          ? "border-red-500 text-red-700 bg-red-100 text-[10px] font-black"
                          : action.priority === "high"
                          ? "border-amber-500 text-amber-700 bg-amber-100 text-[10px] font-black"
                          : "border-border text-muted-foreground text-[10px] font-semibold"
                      }>
                        {action.priority.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] font-mono uppercase text-muted-foreground">{action.category}</span>
                      <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                        {action.affected_count} trainees
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{action.action}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Expected impact: Risk ↓ ~15–20%</p>
                  </div>
                  <Button
                    size="sm"
                    className={`shrink-0 text-xs font-bold shadow-sm ${
                      action.priority === "critical"
                        ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                        : action.priority === "high"
                        ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
                        : "bg-primary hover:bg-primary/90 text-white"
                    }`}
                  >
                    Execute Plan
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
              No {actionTab} priority actions at this time
            </div>
          )}
        </GlassCard>
      </div>

    </div>
  );
}
