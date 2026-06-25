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
} from "@workspace/api-client-react";
import {
  AlertCircle, Activity, BrainCircuit, Users,
  TrendingUp, TrendingDown, ShieldAlert, Bot,
  MessageSquare, Eye, Zap,
} from "lucide-react";
import { Link } from "wouter";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const WEEKLY_TRENDS = {
  learning: [
    { day: "Mon", value: 65 },
    { day: "Tue", value: 63 },
    { day: "Wed", value: 67 },
    { day: "Thu", value: 66 },
    { day: "Fri", value: 68 },
    { day: "Sat", value: 67 },
    { day: "Sun", value: 67.3 },
  ],
  attendance: [
    { day: "Mon", value: 82 },
    { day: "Tue", value: 79 },
    { day: "Wed", value: 81 },
    { day: "Thu", value: 77 },
    { day: "Fri", value: 80 },
    { day: "Sat", value: 78 },
    { day: "Sun", value: 80 },
  ],
  aiDependency: [
    { day: "Mon", value: 28 },
    { day: "Tue", value: 31 },
    { day: "Wed", value: 29 },
    { day: "Thu", value: 33 },
    { day: "Fri", value: 35 },
    { day: "Sat", value: 34 },
    { day: "Sun", value: 36 },
  ],
};

const MiniChart = ({ data, color, positive }: { data: { day: string; value: number }[]; color: string; positive?: boolean }) => (
  <ResponsiveContainer width="100%" height={44}>
    <LineChart data={data}>
      <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

export default function ManagerDashboard() {
  return (
    <ProtectedRoute allowedRoles={["manager"]}>
      <Layout>
        <div className="p-6 space-y-6 overflow-y-auto h-screen">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manager Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">SDI programme overview, risk signals, and AI recommendations</p>
          </div>
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

  const highRisk = telemetry?.filter((t) => t.risk_level === "high") ?? [];

  return (
    <div className="space-y-6">

      {/* KPI Cards */}
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
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +2.4%
                </span>
              </div>
              <div className="text-3xl font-bold text-foreground tabular-nums">{stats.avg_learning_score}%</div>
              <div className="text-sm text-muted-foreground mt-0.5">Avg Learning Score</div>
              <div className="text-xs text-muted-foreground mt-1">vs last week</div>
              <div className="mt-3 -mx-1">
                <MiniChart data={WEEKLY_TRENDS.learning} color="#2563eb" positive />
              </div>
            </GlassCard>

            <GlassCard className="p-5 border-red-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-xs font-medium text-red-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +12
                </span>
              </div>
              <div className="text-3xl font-bold text-foreground tabular-nums">{stats.high_risk_count}</div>
              <div className="text-sm text-muted-foreground mt-0.5">High Risk Trainees</div>
              <div className="text-xs text-red-500 mt-1">since yesterday</div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-500" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground tabular-nums">{stats.pending_demos}</div>
              <div className="text-sm text-muted-foreground mt-0.5">Pending Demos</div>
              <div className="text-xs text-muted-foreground mt-1">awaiting evaluation</div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-violet-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground tabular-nums">{stats.active_interventions}</div>
              <div className="text-sm text-muted-foreground mt-0.5">Active Interventions</div>
              <div className="text-xs text-muted-foreground mt-1">in progress</div>
            </GlassCard>
          </>
        ) : null}
      </div>

      {/* AI Summary + Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AI Summary Panel */}
        <GlassCard className="lg:col-span-2 p-5 border-primary/20 bg-primary/[0.02]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">NxtPulse AI Summary</h3>
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full ml-auto">Live</span>
          </div>
          {statsLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : stats ? (
            <p className="text-sm text-foreground leading-relaxed">
              NxtPulse AI detected rising risk across the SDI programme — <span className="font-semibold text-red-600">{stats.high_risk_count} trainees</span> are currently at high risk, with AI dependency trending upward across Cohort-7. Average learning score stands at <span className="font-semibold text-primary">{stats.avg_learning_score}%</span>, up +2.4% from last week. <span className="font-semibold text-amber-600">{stats.pending_demos}</span> demos are pending evaluation and <span className="font-semibold text-violet-600">{stats.active_interventions}</span> interventions are active.
            </p>
          ) : null}
          <div className="flex gap-2 mt-4">
            <Button size="sm" className="gap-2 h-8 text-xs">
              <Zap className="w-3.5 h-3.5" /> Generate Full Report
            </Button>
            <Button size="sm" variant="outline" className="gap-2 h-8 text-xs">
              <ShieldAlert className="w-3.5 h-3.5" /> Review Interventions
            </Button>
          </div>
        </GlassCard>

        {/* Risk Donut */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Risk Distribution</h3>
          {riskLoading ? (
            <div className="h-48 flex items-center justify-center">
              <Skeleton className="h-40 w-40 rounded-full" />
            </div>
          ) : riskDist ? (
            <RiskDonutChart data={riskDist} />
          ) : null}
        </GlassCard>
      </div>

      {/* Weekly Trends */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Weekly Trends — Last 7 Days</h2>
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
              <div className="text-xl font-bold tabular-nums" style={{ color: t.color }}>
                {t.data[t.data.length - 1].value}%
              </div>
              <div className="mt-3 -mx-1">
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={t.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, border: "1px solid #e5e7eb", borderRadius: 8, padding: "4px 8px" }}
                      formatter={(v: any) => [`${v}%`, t.label]}
                    />
                    <Line type="monotone" dataKey="value" stroke={t.color} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Immediate Action Required */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Immediate Action Required</h3>
          {!telLoading && highRisk.length > 0 && (
            <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full ml-auto">
              {highRisk.length} high-risk
            </span>
          )}
        </div>
        {telLoading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {highRisk.slice(0, 6).map((row) => (
              <div key={row.trainee_id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-xl border border-red-100 bg-red-50/30 hover:bg-red-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/trainee/${row.trainee_id}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors hover:underline underline-offset-2">
                      {row.trainee_name}
                    </Link>
                    <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50 text-xs">HIGH</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{row.track}</span>
                    <span className="text-xs font-semibold text-red-600">Learning: {row.learning_score}%</span>
                    <span className="text-xs text-muted-foreground">{row.status}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-2.5">
                    <Eye className="w-3 h-3" /> View
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-2.5 border-red-200 text-red-600 hover:bg-red-50">
                    <ShieldAlert className="w-3 h-3" /> Intervene
                  </Button>
                </div>
              </div>
            ))}
            {highRisk.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No high-risk trainees at this time
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Silent Detector AI Alerts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Silent Detector AI Alerts</h2>
        </div>
        {alertsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
          </div>
        ) : alerts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => {
              const isHigh = alert.risk_level === "high";
              return (
                <div
                  key={alert.id}
                  className={`p-5 rounded-xl border flex flex-col gap-3 ${isHigh ? "border-red-200 bg-red-50/30" : "border-amber-200 bg-amber-50/30"}`}
                >
                  <div className="flex items-center justify-between">
                    <Link href={`/trainee/${alert.trainee_id}`} className="font-bold text-foreground hover:text-primary transition-colors hover:underline underline-offset-2 text-base">
                      {alert.trainee_name}
                    </Link>
                    <Badge variant="outline" className={isHigh ? "text-red-700 border-red-200 bg-red-50" : "text-amber-700 border-amber-200 bg-amber-50"}>
                      {alert.risk_level.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Signals</div>
                    <div className="flex flex-wrap gap-1.5">
                      {alert.signals.map((sig, i) => (
                        <span key={i} className={`text-xs px-2 py-0.5 rounded-md font-medium ${isHigh ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={`text-sm border-l-2 pl-3 ${isHigh ? "border-red-400 text-red-700" : "border-amber-400 text-amber-700"}`}>
                    {alert.recommendation}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-2.5">
                      <Eye className="w-3 h-3" /> View Profile
                    </Button>
                    <Button size="sm" variant="outline" className={`h-7 text-xs gap-1 px-2.5 ${isHigh ? "border-red-200 text-red-600 hover:bg-red-50" : "border-amber-200 text-amber-600 hover:bg-amber-50"}`}>
                      <ShieldAlert className="w-3 h-3" /> Raise Intervention
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-2.5">
                      <MessageSquare className="w-3 h-3" /> Message POC
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
