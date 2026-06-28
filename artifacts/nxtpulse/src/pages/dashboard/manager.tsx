import { useMemo } from "react";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { RiskDonutChart } from "@/components/charts/RiskDonutChart";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetTraineeStats,
  useGetRiskDistribution,
  useGetTelemetry,
  useGetSilentDetectorAlerts,
  useGetCohortStats,
  useGetRecommendedActions,
} from "@workspace/api-client-react";
import {
  AlertCircle, Activity, BrainCircuit, Users,
  TrendingUp, TrendingDown, ShieldAlert, Bot,
  Eye, Zap, CheckCircle2, Clock, BarChart3,
  Flame, Target, Brain,
} from "lucide-react";
import { Link } from "wouter";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const WEEKLY_TRENDS = {
  learning: [
    { day: "Mon", value: 65 }, { day: "Tue", value: 63 }, { day: "Wed", value: 67 },
    { day: "Thu", value: 66 }, { day: "Fri", value: 68 }, { day: "Sat", value: 67 }, { day: "Sun", value: 67.3 },
  ],
  attendance: [
    { day: "Mon", value: 82 }, { day: "Tue", value: 79 }, { day: "Wed", value: 81 },
    { day: "Thu", value: 77 }, { day: "Fri", value: 80 }, { day: "Sat", value: 78 }, { day: "Sun", value: 80 },
  ],
  aiDependency: [
    { day: "Mon", value: 28 }, { day: "Tue", value: 31 }, { day: "Wed", value: 29 },
    { day: "Thu", value: 33 }, { day: "Fri", value: 35 }, { day: "Sat", value: 34 }, { day: "Sun", value: 36 },
  ],
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function MiniSparkline({ data, color }: { data: { day: string; value: number }[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function HealthRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={7} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={7}
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize="14" fontWeight="700" fill={color}>
        {score}
      </text>
    </svg>
  );
}

function MetricBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function urgencyScore(t: { risk_level: string; learning_score: number; ai_dependency: number; attendance: number }) {
  let score = 0;
  if (t.risk_level === "high") score += 50;
  else if (t.risk_level === "medium") score += 20;
  score += Math.max(0, 50 - t.learning_score) * 0.6;
  score += (t.ai_dependency - 50) * 0.3;
  score += Math.max(0, 70 - t.attendance) * 0.2;
  return Math.round(score);
}

export default function ManagerDashboard() {
  return (
    <ProtectedRoute allowedRoles={["manager"]}>
      <Layout>
        <div className="p-6 space-y-6 overflow-y-auto h-screen">
          <DashboardContent />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { data: stats, isLoading: statsLoading } = useGetTraineeStats();
  const { data: riskDist, isLoading: riskLoading } = useGetRiskDistribution();
  const { data: telemetry, isLoading: telLoading } = useGetTelemetry();
  const { data: alerts, isLoading: alertsLoading } = useGetSilentDetectorAlerts();
  const { data: cohorts, isLoading: cohortsLoading } = useGetCohortStats();
  const { data: actions, isLoading: actionsLoading } = useGetRecommendedActions();

  const priorityTrainees = useMemo(() => {
    if (!telemetry) return [];
    return [...telemetry]
      .filter((t) => t.risk_level === "high" || t.risk_level === "medium")
      .map((t) => ({ ...t, urgency: urgencyScore(t) }))
      .sort((a, b) => b.urgency - a.urgency)
      .slice(0, 8);
  }, [telemetry]);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}, Arjun 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{formatDate()} · SDI Programme Command Centre</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live · Silent Detector active
          </span>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)
        ) : stats ? (
          <>
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +2.4%
                </span>
              </div>
              <div className="text-3xl font-bold tabular-nums">{stats.avg_learning_score}%</div>
              <div className="text-sm text-muted-foreground mt-0.5">Avg Learning Score</div>
              <div className="mt-3 -mx-1">
                <MiniSparkline data={WEEKLY_TRENDS.learning} color="#2563eb" />
              </div>
            </GlassCard>

            <GlassCard className="p-5 border-red-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-xs font-semibold text-red-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +12
                </span>
              </div>
              <div className="text-3xl font-bold tabular-nums">{stats.high_risk_count}</div>
              <div className="text-sm text-muted-foreground mt-0.5">High Risk Trainees</div>
              <div className="text-xs text-red-500 mt-1">Needs immediate attention</div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Target className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-0.5">
                  <Clock className="w-3 h-3" /> Pending
                </span>
              </div>
              <div className="text-3xl font-bold tabular-nums">{stats.pending_demos}</div>
              <div className="text-sm text-muted-foreground mt-0.5">Pending Demos</div>
              <div className="mt-3 -mx-1">
                <MiniSparkline data={WEEKLY_TRENDS.attendance} color="#f59e0b" />
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-violet-600" />
                </div>
                <span className="text-xs font-semibold text-violet-600 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>
              <div className="text-3xl font-bold tabular-nums">{stats.active_interventions}</div>
              <div className="text-sm text-muted-foreground mt-0.5">Active Interventions</div>
              <div className="mt-3 -mx-1">
                <MiniSparkline data={WEEKLY_TRENDS.aiDependency} color="#7c3aed" />
              </div>
            </GlassCard>
          </>
        ) : null}
      </div>

      {/* ── AI Command Brief + Risk Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2 p-5 border-primary/20 bg-primary/[0.02]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">AI Command Brief</h3>
            <span className="ml-auto text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">Live</span>
          </div>

          {statsLoading ? <Skeleton className="h-16 w-full" /> : stats ? (
            <p className="text-sm text-foreground leading-relaxed">
              NxtPulse AI is monitoring{" "}
              <span className="font-semibold text-foreground">{stats.total_trainees?.toLocaleString() ?? "4,882"} trainees</span> across the SDI programme.{" "}
              <span className="font-semibold text-red-600">{stats.high_risk_count} trainees</span> are at critical risk and need action today — AI dependency is trending upward at{" "}
              <span className="font-semibold text-amber-600">{stats.ai_dependency_avg ?? 27}%</span> avg, with Cohort-7 showing the highest concentration.{" "}
              Learning score is at <span className="font-semibold text-primary">{stats.avg_learning_score}%</span> (+2.4% vs last week). Prediction model accuracy:{" "}
              <span className="font-semibold text-emerald-600">{stats.prediction_accuracy ?? 91}%</span>.
            </p>
          ) : null}

          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
            {[
              { label: "Prediction Accuracy", value: `${stats?.prediction_accuracy ?? 91}%`, color: "text-emerald-600" },
              { label: "AI Dependency Avg", value: `${stats?.ai_dependency_avg ?? 27}%`, color: "text-amber-600" },
              { label: "Total Programme", value: stats?.total_trainees?.toLocaleString() ?? "4,882", color: "text-primary" },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <div className={`text-lg font-bold tabular-nums ${m.color}`}>{m.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Button size="sm" className="gap-2 h-8 text-xs" asChild>
              <Link href="/insights"><Zap className="w-3.5 h-3.5" /> Executive Insights</Link>
            </Button>
            <Button size="sm" variant="outline" className="gap-2 h-8 text-xs" asChild>
              <Link href="/interventions"><ShieldAlert className="w-3.5 h-3.5" /> View Interventions</Link>
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Risk Distribution</h3>
          {riskLoading ? (
            <div className="h-48 flex items-center justify-center">
              <Skeleton className="h-40 w-40 rounded-full" />
            </div>
          ) : riskDist ? (
            <RiskDonutChart data={riskDist} />
          ) : null}
          <div className="mt-3 grid grid-cols-3 gap-1 text-center">
            {[
              { label: "High", value: riskDist?.high, color: "text-red-600", bg: "bg-red-50" },
              { label: "Medium", value: riskDist?.medium, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Low", value: riskDist?.low, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map((r) => (
              <div key={r.label} className={`${r.bg} rounded-lg py-1.5`}>
                <div className={`text-sm font-bold tabular-nums ${r.color}`}>{r.value?.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{r.label}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ── Cohort Health Grid ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Cohort Health Overview</h2>
        </div>

        {cohortsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-xl" />)}
          </div>
        ) : cohorts ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cohorts.map((c) => {
              const health = Math.round(
                c.avg_learning_score * 0.5 +
                c.avg_attendance * 0.3 +
                (100 - c.avg_ai_dependency) * 0.2
              );
              const riskTotal = c.high_risk_count + c.medium_risk_count + c.low_risk_count;
              const isRisky = c.high_risk_count > 0;
              return (
                <GlassCard key={c.cohort} className={`p-5 ${isRisky && c.high_risk_count > 1 ? "border-red-200" : ""}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-foreground text-base">{c.cohort}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.total_trainees} trainees</p>
                    </div>
                    <HealthRing score={health} size={68} />
                  </div>

                  <div className="space-y-2.5 mb-4">
                    <MetricBar label="Learning Score" value={c.avg_learning_score} color="#2563eb" />
                    <MetricBar label="Demo Score" value={c.avg_demo_score} color="#7c3aed" />
                    <MetricBar label="Attendance" value={c.avg_attendance} color="#10b981" />
                    <MetricBar label="AI Dependency" value={c.avg_ai_dependency} color="#ef4444" />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-border">
                    <span className="text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md font-medium">
                      {c.high_risk_count} High
                    </span>
                    <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                      {c.medium_risk_count} Medium
                    </span>
                    <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                      {c.low_risk_count} Low
                    </span>
                    <Button size="sm" variant="outline" className="ml-auto h-6 text-xs px-2 gap-1" asChild>
                      <Link href="/cohorts"><Eye className="w-3 h-3" /> Details</Link>
                    </Button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* ── Priority Action Queue ── */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Priority Action Queue</h3>
          {!telLoading && priorityTrainees.length > 0 && (
            <span className="ml-auto text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
              {priorityTrainees.length} requiring action
            </span>
          )}
        </div>

        {telLoading ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Header */}
            <div className="grid grid-cols-12 gap-3 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-3">Trainee</div>
              <div className="col-span-2">Cohort / Track</div>
              <div className="col-span-1 text-center">Score</div>
              <div className="col-span-1 text-center">Attend</div>
              <div className="col-span-1 text-center">AI Dep</div>
              <div className="col-span-1 text-center">Risk</div>
              <div className="col-span-2 text-center">Urgency</div>
            </div>

            {priorityTrainees.map((row, idx) => {
              const isHigh = row.risk_level === "high";
              return (
                <div key={row.trainee_id} className={`grid grid-cols-12 gap-3 py-3 items-center hover:bg-muted/30 transition-colors rounded-lg px-1 ${isHigh ? "bg-red-50/20" : ""}`}>
                  <div className="col-span-1 text-center">
                    <span className="text-xs font-bold text-muted-foreground">{idx + 1}</span>
                  </div>
                  <div className="col-span-3">
                    <Link href={`/trainee/${row.trainee_id}`} className="text-sm font-semibold text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors">
                      {row.trainee_name}
                    </Link>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground">{row.cohort}</div>
                    <div className="text-xs text-muted-foreground/70 truncate">{row.track}</div>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className={`text-xs font-bold tabular-nums ${row.learning_score < 40 ? "text-red-600" : row.learning_score < 60 ? "text-amber-600" : "text-emerald-600"}`}>
                      {row.learning_score}%
                    </span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className={`text-xs tabular-nums ${row.attendance < 60 ? "text-red-600" : "text-muted-foreground"}`}>
                      {row.attendance}%
                    </span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className={`text-xs tabular-nums ${row.ai_dependency > 70 ? "text-red-600" : row.ai_dependency > 50 ? "text-amber-600" : "text-muted-foreground"}`}>
                      {row.ai_dependency}%
                    </span>
                  </div>
                  <div className="col-span-1 text-center">
                    <Badge variant="outline" className={`text-xs ${isHigh ? "text-red-700 border-red-200 bg-red-50" : "text-amber-700 border-amber-200 bg-amber-50"}`}>
                      {row.risk_level.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, row.urgency)}%` }} />
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" asChild>
                        <Link href={`/trainee/${row.trainee_id}`}><Eye className="w-3 h-3" /></Link>
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" asChild>
                        <Link href="/interventions"><ShieldAlert className="w-3 h-3" /></Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {priorityTrainees.length === 0 && (
              <div className="py-10 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No high-priority trainees right now — all clear.</p>
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* ── Weekly Trends ── */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" /> Weekly Trends — Last 7 Days
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Learning Score", data: WEEKLY_TRENDS.learning, color: "#2563eb", trend: "+2.3%", positive: true },
            { label: "Attendance Rate", data: WEEKLY_TRENDS.attendance, color: "#10b981", trend: "-2.0%", positive: false },
            { label: "AI Dependency", data: WEEKLY_TRENDS.aiDependency, color: "#ef4444", trend: "+8.0%", positive: false },
          ].map((t) => (
            <GlassCard key={t.label} className="p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{t.label}</span>
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${t.positive ? "text-emerald-600" : "text-red-600"}`}>
                  {t.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {t.trend}
                </span>
              </div>
              <div className="text-2xl font-bold tabular-nums" style={{ color: t.color }}>
                {t.data[t.data.length - 1].value}%
              </div>
              <div className="mt-3 -mx-1">
                <ResponsiveContainer width="100%" height={64}>
                  <LineChart data={t.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, border: "1px solid #e5e7eb", borderRadius: 8, padding: "4px 8px" }}
                      formatter={(v: unknown) => [`${v}%`, t.label]}
                    />
                    <Line type="monotone" dataKey="value" stroke={t.color} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* ── AI Recommended Actions ── */}
      {!actionsLoading && actions && actions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">AI Recommended Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {actions.slice(0, 4).map((action, i) => {
              const isHigh = action.priority === "high";
              return (
                <div key={i} className={`p-4 rounded-xl border flex gap-3 ${isHigh ? "border-red-200 bg-red-50/20" : "border-amber-200 bg-amber-50/20"}`}>
                  <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${isHigh ? "bg-red-100" : "bg-amber-100"}`}>
                    <Zap className={`w-3.5 h-3.5 ${isHigh ? "text-red-600" : "text-amber-600"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-foreground">{action.action}</span>
                      <Badge variant="outline" className={`text-xs shrink-0 ${isHigh ? "text-red-700 border-red-200 bg-red-50" : "text-amber-700 border-amber-200 bg-amber-50"}`}>
                        {action.priority?.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{action.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Silent Detector Alerts ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Silent Detector AI Alerts</h2>
          {!alertsLoading && alerts && (
            <span className="ml-auto text-xs text-muted-foreground">{alerts.length} active alerts</span>
          )}
        </div>
        {alertsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-xl" />)}
          </div>
        ) : alerts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => {
              const isHigh = alert.risk_level === "high";
              return (
                <div key={alert.id} className={`p-5 rounded-xl border flex flex-col gap-3 ${isHigh ? "border-red-200 bg-red-50/20" : "border-amber-200 bg-amber-50/20"}`}>
                  <div className="flex items-center justify-between">
                    <Link href={`/trainee/${alert.trainee_id}`} className="font-bold text-foreground hover:text-primary transition-colors hover:underline underline-offset-2">
                      {alert.trainee_name}
                    </Link>
                    <Badge variant="outline" className={isHigh ? "text-red-700 border-red-200 bg-red-50" : "text-amber-700 border-amber-200 bg-amber-50"}>
                      {alert.risk_level.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {alert.signals.map((sig, i) => (
                      <span key={i} className={`text-xs px-2 py-0.5 rounded-md font-medium ${isHigh ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {sig}
                      </span>
                    ))}
                  </div>

                  <p className={`text-sm border-l-2 pl-3 ${isHigh ? "border-red-400 text-red-700" : "border-amber-400 text-amber-700"}`}>
                    {alert.recommendation}
                  </p>

                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-2.5" asChild>
                      <Link href={`/trainee/${alert.trainee_id}`}><Eye className="w-3 h-3" /> Profile</Link>
                    </Button>
                    <Button size="sm" variant="outline" className={`h-7 text-xs gap-1 px-2.5 ${isHigh ? "border-red-200 text-red-600 hover:bg-red-50" : "border-amber-200 text-amber-600 hover:bg-amber-50"}`} asChild>
                      <Link href="/interventions"><ShieldAlert className="w-3 h-3" /> Intervene</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

    </div>
  );
}
