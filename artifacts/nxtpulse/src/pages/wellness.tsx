import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useGetWellnessMetrics,
  useGetWellnessSuggestions
} from "@workspace/api-client-react";
import {
  HeartPulse, Activity, Brain, Zap, Flame, ChevronUp, ChevronDown,
  AlertTriangle, CheckCircle2, TrendingUp, Users, Target, Sparkles,
  ShieldAlert, ArrowRight, BarChart3
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from "recharts";

// ─── Static enrichment data ───────────────────────────────────────────────────

const COHORT_WELLNESS_DATA = [
  { cohort: "C6", stress: 38, motivation: 74, burnout: 22 },
  { cohort: "C7", stress: 67, motivation: 51, burnout: 58 },
  { cohort: "C8", stress: 49, motivation: 63, burnout: 38 },
];

const BURNOUT_HEATMAP = [
  { cohort: "C6", low: 8, medium: 2, high: 0 },
  { cohort: "C7", low: 2, medium: 5, high: 3 },
  { cohort: "C8", low: 4, medium: 3, high: 1 },
];

const WELLNESS_ALERTS = [
  {
    name: "Rahul Verma",
    issue: "Stress increased 28% in last 5 days",
    risk: "HIGH" as const,
    tag: "Burnout Risk",
    recommendation: "Schedule immediate 1-on-1 wellness check-in.",
    cohort: "C7",
  },
  {
    name: "Sai Krishna",
    issue: "Motivation dropped 15% · Peer interaction declining",
    risk: "HIGH" as const,
    tag: "Isolation",
    recommendation: "Assign peer mentor and monitor engagement daily.",
    cohort: "C7",
  },
  {
    name: "Vikram Singh",
    issue: "Attendance below 60% — emotional disengagement suspected",
    risk: "MEDIUM" as const,
    tag: "Attendance",
    recommendation: "Conduct informal check-in. Identify root cause.",
    cohort: "C8",
  },
  {
    name: "Ananya Reddy",
    issue: "Confidence low post-demo feedback — stress spike detected",
    risk: "MEDIUM" as const,
    tag: "Low Confidence",
    recommendation: "Schedule structured confidence-building session.",
    cohort: "C6",
  },
];

const WELLNESS_FACTORS = [
  { label: "Demo Pressure", pct: 34, color: "#ef4444" },
  { label: "Low Confidence", pct: 28, color: "#f59e0b" },
  { label: "Isolation", pct: 18, color: "#8b5cf6" },
  { label: "AI Dependency", pct: 12, color: "#2563eb" },
  { label: "Attendance Issues", pct: 8, color: "#6b7280" },
];

const AI_CRITICAL = [
  "Cohort-7 has highest burnout risk — 3 trainees in High zone",
  "Demo week causing stress spikes across all cohorts",
  "React + Node trainees show lowest motivation (avg 51)",
];

const AI_PREDICTIONS = [
  "6 trainees may burn out in next 7 days without intervention",
  "Stress likely to rise 12% before upcoming assessments",
  "Cohort-7 wellness index may drop below threshold next week",
];

const INTERVENTIONS = [
  { priority: "HIGH", label: "Conduct 1-on-1 with 5 high-risk trainees immediately", count: 5, color: "bg-red-50 border-red-200 text-red-700", badge: "bg-red-600 text-white" },
  { priority: "HIGH", label: "Assign peer mentors to 3 isolated trainees in C7", count: 3, color: "bg-red-50 border-red-200 text-red-700", badge: "bg-red-600 text-white" },
  { priority: "MEDIUM", label: "Facilitate group debrief session after demo week", count: 12, color: "bg-amber-50 border-amber-200 text-amber-700", badge: "bg-amber-500 text-white" },
  { priority: "MEDIUM", label: "Set up anonymous wellness check-in form for Cohort-7", count: 10, color: "bg-amber-50 border-amber-200 text-amber-700", badge: "bg-amber-500 text-white" },
  { priority: "LOW", label: "Conduct wellness workshop before next demo week", count: null, color: "bg-muted/40 border-border text-foreground", badge: "bg-muted-foreground/80 text-white" },
];

// ─── Shared Components ────────────────────────────────────────────────────────

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

function KPICard({
  icon, title, value, trendPct, trendPositive, statusLabel, statusColor, borderClass
}: {
  icon: React.ReactNode; title: string; value: string | number;
  trendPct?: number; trendPositive?: boolean; statusLabel: string;
  statusColor: string; borderClass: string;
}) {
  return (
    <GlassCard className={`p-5 border-l-4 ${borderClass}`} glowing>
      <div className="flex items-start justify-between mb-3">
        <div className="text-muted-foreground/70 w-4 h-4">{icon}</div>
        {trendPct !== undefined ? (
          <span className={`flex items-center gap-0.5 text-xs font-bold ${trendPositive ? "text-emerald-600" : "text-red-500"}`}>
            {trendPositive ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {Math.abs(trendPct)}%
          </span>
        ) : null}
      </div>
      <p className="text-2xl font-black text-foreground tabular-nums">{value}</p>
      <p className="text-xs font-semibold text-muted-foreground mt-0.5 mb-3">{title}</p>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>{statusLabel}</span>
    </GlassCard>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WellnessPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="p-6 space-y-7 max-w-[1400px] mx-auto">
          {/* Page Header */}
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                </div>
                <h1 className="text-xl font-black text-foreground">Wellness AI</h1>
              </div>
              <p className="text-sm text-muted-foreground ml-10">AI-powered emotional health monitoring — burnout, stress & intervention intelligence</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              <Activity className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span className="font-medium text-rose-700">Live Wellness Monitoring</span>
              <span className="text-rose-400">· Updated just now</span>
            </div>
          </div>

          <WellnessContent />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function WellnessContent() {
  const { data: metrics, isLoading: metricsLoading } = useGetWellnessMetrics();
  const { data: suggestions, isLoading: sugLoading } = useGetWellnessSuggestions();

  // ── SECTION 1: KPI Cards ─────────────────────────────────────────────────
  return (
    <div className="space-y-7">

      {/* KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)
        ) : metrics ? (
          <>
            <KPICard
              icon={<Zap />}
              title="Stress Index"
              value={metrics.stress_score}
              trendPct={8}
              trendPositive={false}
              statusLabel={metrics.stress_level === "low" ? "Low" : metrics.stress_level === "medium" ? "Moderate" : "High"}
              statusColor={
                metrics.stress_level === "low"
                  ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                  : metrics.stress_level === "medium"
                  ? "border-amber-300 text-amber-700 bg-amber-50"
                  : "border-red-300 text-red-700 bg-red-50"
              }
              borderClass={
                metrics.stress_level === "low" ? "border-l-emerald-500"
                  : metrics.stress_level === "medium" ? "border-l-amber-500"
                  : "border-l-red-500"
              }
            />
            <KPICard
              icon={<Flame />}
              title="Burnout Risk"
              value={metrics.burnout_score}
              trendPct={5}
              trendPositive={false}
              statusLabel={metrics.burnout_risk === "low" ? "Low" : metrics.burnout_risk === "medium" ? "Moderate" : "High"}
              statusColor={
                metrics.burnout_risk === "low"
                  ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                  : metrics.burnout_risk === "medium"
                  ? "border-amber-300 text-amber-700 bg-amber-50"
                  : "border-red-300 text-red-700 bg-red-50"
              }
              borderClass={
                metrics.burnout_risk === "low" ? "border-l-emerald-500"
                  : metrics.burnout_risk === "medium" ? "border-l-amber-500"
                  : "border-l-red-500"
              }
            />
            <KPICard
              icon={<TrendingUp />}
              title="Motivation Score"
              value={metrics.motivation_score}
              trendPct={3}
              trendPositive={metrics.motivation_trend === "improving"}
              statusLabel={metrics.motivation_trend === "improving" ? "Improving" : metrics.motivation_trend === "stable" ? "Stable" : "Declining"}
              statusColor={
                metrics.motivation_trend === "improving"
                  ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                  : metrics.motivation_trend === "stable"
                  ? "border-primary/30 text-primary bg-primary/5"
                  : "border-red-300 text-red-700 bg-red-50"
              }
              borderClass="border-l-primary"
            />
            <KPICard
              icon={<Users />}
              title="Engagement Score"
              value={74}
              statusLabel="Stable"
              statusColor="border-primary/30 text-primary bg-primary/5"
              borderClass="border-l-violet-500"
            />
          </>
        ) : null}
      </div>

      {/* ── SECTION 2: Charts ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Stress vs Motivation Trend */}
        <GlassCard className="p-5">
          <SectionHeader
            icon={<Activity className="w-4 h-4" />}
            title="Stress vs Motivation Trend"
            subtitle="7-day emotional and energy tracking"
          />
          {metricsLoading ? (
            <Skeleton className="h-52 w-full" />
          ) : metrics ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.weekly_trend} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="stress" name="Stress" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="motivation" name="Motivation" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </GlassCard>

        {/* Cohort Wellness Comparison */}
        <GlassCard className="p-5">
          <SectionHeader
            icon={<BarChart3 className="w-4 h-4" />}
            title="Cohort Wellness Comparison"
            subtitle="Stress, Motivation & Burnout Risk by cohort"
          />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COHORT_WELLNESS_DATA} margin={{ top: 5, right: 10, bottom: 0, left: -10 }} barSize={12} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="cohort" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="stress" name="Stress" fill="#ef4444" radius={[3, 3, 0, 0]} />
                <Bar dataKey="motivation" name="Motivation" fill="#2563eb" radius={[3, 3, 0, 0]} />
                <Bar dataKey="burnout" name="Burnout Risk" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* ── SECTION 3: AI Wellness Alerts ──────────────────────────────────── */}
      <div>
        <SectionHeader
          icon={<ShieldAlert className="w-4 h-4" />}
          title="AI Wellness Alerts"
          subtitle="High-risk trainees requiring immediate manager attention"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WELLNESS_ALERTS.map((alert, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border flex flex-col gap-3 ${
                alert.risk === "HIGH"
                  ? "bg-red-50 border-red-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-bold text-foreground">{alert.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground bg-white/70 border border-border rounded px-1.5 py-0.5">{alert.cohort}</span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-snug">{alert.issue}</p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <Badge variant="outline" className={`text-[10px] font-black ${
                    alert.risk === "HIGH"
                      ? "border-red-400 text-red-700 bg-red-100"
                      : "border-amber-400 text-amber-700 bg-amber-100"
                  }`}>
                    {alert.risk}
                  </Badge>
                  <Badge variant="outline" className="text-[9px] text-muted-foreground border-border bg-white/60">
                    {alert.tag}
                  </Badge>
                </div>
              </div>
              <div className="pt-2 border-t border-white/40 flex items-start justify-between gap-3">
                <div className="flex items-start gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] text-foreground leading-snug">
                    <span className="font-semibold text-primary">AI: </span>{alert.recommendation}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="text-[10px] h-6 px-2.5 shrink-0 border-border bg-white/70 hover:bg-white font-semibold">
                  Act <ArrowRight className="w-2.5 h-2.5 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 4: AI Wellness Summary ─────────────────────────────────── */}
      <GlassCard className="p-5">
        <SectionHeader
          icon={<Sparkles className="w-4 h-4" />}
          title="AI Wellness Summary"
          subtitle="Synthesized insights across all cohorts and trainees"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Critical Findings</span>
            </div>
            <ul className="space-y-2">
              {AI_CRITICAL.map((f, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5">{i + 1}</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Predictions</span>
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
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Recommended Priorities</span>
            </div>
            {["Reduce Burnout Risk", "Improve Engagement", "Lower Stress Levels"].map((p, i) => (
              <div key={i} className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black text-muted-foreground w-4 text-right shrink-0">#{i + 1}</span>
                <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${88 - i * 16}%` }} />
                </div>
                <span className="text-xs text-foreground font-medium whitespace-nowrap">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* ── SECTION 5: Burnout Heatmap + Factors ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Burnout Heatmap */}
        <GlassCard className="p-5">
          <SectionHeader
            icon={<Flame className="w-4 h-4" />}
            title="Burnout Heatmap"
            subtitle="Cohort-level burnout risk breakdown"
          />
          <div className="rounded-xl overflow-hidden border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/60">
                  <th className="text-left px-4 py-2.5 font-bold text-muted-foreground">Cohort</th>
                  <th className="px-4 py-2.5 font-bold text-emerald-700 text-center">Low</th>
                  <th className="px-4 py-2.5 font-bold text-amber-700 text-center">Medium</th>
                  <th className="px-4 py-2.5 font-bold text-red-700 text-center">High</th>
                  <th className="px-4 py-2.5 font-bold text-muted-foreground text-right pr-4">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {BURNOUT_HEATMAP.map((row, i) => {
                  const maxRisk = row.high > 2 ? "High" : row.medium > 3 ? "Medium" : "Low";
                  return (
                    <tr key={i} className={`border-t border-border ${row.high > 0 ? "bg-red-50/30" : ""}`}>
                      <td className="px-4 py-3 font-bold text-foreground">{row.cohort}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-7 rounded-lg bg-emerald-100 border border-emerald-200 font-black text-emerald-700">{row.low}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-7 rounded-lg bg-amber-100 border border-amber-200 font-black text-amber-700">{row.medium}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-7 rounded-lg font-black ${row.high > 0 ? "bg-red-100 border border-red-200 text-red-700" : "bg-muted border border-border text-muted-foreground"}`}>{row.high}</span>
                      </td>
                      <td className="px-4 py-3 text-right pr-4">
                        <Badge variant="outline" className={
                          maxRisk === "High" ? "border-red-300 text-red-700 bg-red-50 text-[10px] font-bold"
                            : maxRisk === "Medium" ? "border-amber-300 text-amber-700 bg-amber-50 text-[10px] font-bold"
                            : "border-emerald-300 text-emerald-700 bg-emerald-50 text-[10px] font-bold"
                        }>
                          {maxRisk}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Wellness Factors */}
        <GlassCard className="p-5">
          <SectionHeader
            icon={<BarChart3 className="w-4 h-4" />}
            title="Wellness Factors Breakdown"
            subtitle="Root causes affecting trainee wellbeing"
          />
          <div className="space-y-3">
            {WELLNESS_FACTORS.map((f, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-foreground">{f.label}</span>
                  <span className="text-xs font-black tabular-nums" style={{ color: f.color }}>{f.pct}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${f.pct * 2.2}%`, backgroundColor: f.color }}
                  />
                </div>
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground pt-1 leading-snug">
              Demo pressure and low confidence together account for 62% of wellness decline this week.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* ── SECTION 6: Intervention Recommendations ────────────────────────── */}
      <GlassCard className="p-5">
        <SectionHeader
          icon={<Target className="w-4 h-4" />}
          title="Intervention Recommendations"
          subtitle="Manager-level action plan — AI-prioritized for maximum impact"
        />
        <div className="space-y-3">
          {INTERVENTIONS.map((item, i) => (
            <div key={i} className={`p-4 rounded-xl border flex items-center justify-between gap-4 flex-wrap ${item.color}`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg shrink-0 ${item.badge}`}>
                  {item.priority}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  {item.count && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">Affects {item.count} trainees</p>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                className={`shrink-0 text-xs font-bold shadow-sm ${
                  item.priority === "HIGH"
                    ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                    : item.priority === "MEDIUM"
                    ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
                    : "bg-primary hover:bg-primary/90 text-white"
                }`}
              >
                Execute
              </Button>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── SECTION 7: AI Suggestions (existing data — improved display) ───── */}
      {!sugLoading && suggestions && suggestions.length > 0 && (
        <GlassCard className="p-5">
          <SectionHeader
            icon={<CheckCircle2 className="w-4 h-4" />}
            title="AI Wellness Suggestions"
            subtitle="Personalized guidance from live wellness data analysis"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestions.map(sug => (
              <div key={sug.id} className={`p-4 rounded-xl border ${
                sug.priority === "high"
                  ? "bg-red-50 border-red-200"
                  : sug.priority === "medium"
                  ? "bg-amber-50 border-amber-200"
                  : "bg-primary/5 border-primary/20"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-[10px] font-mono uppercase border-border bg-white/70">
                    {sug.category}
                  </Badge>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    sug.priority === "high"
                      ? "text-red-700 bg-red-100 border border-red-200"
                      : sug.priority === "medium"
                      ? "text-amber-700 bg-amber-100 border border-amber-200"
                      : "text-primary bg-primary/10 border border-primary/20"
                  }`}>
                    {sug.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">{sug.suggestion}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
