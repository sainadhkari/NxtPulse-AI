import { useState } from "react";
import {
  Users, TrendingUp, TrendingDown, Award, AlertTriangle,
  Brain, Activity, BarChart2, Loader2
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { useGetCohortStats } from "@workspace/api-client-react";
import type { CohortStats } from "@workspace/api-client-react";

const COHORT_COLORS: Record<string, string> = {
  "Cohort-6": "#00f0ff",
  "Cohort-7": "#a855f7",
  "Cohort-8": "#f59e0b",
};

const RISK_COLOR = { high: "#ef4444", medium: "#eab308", low: "#10b981" };

function riskBadge(level: string) {
  if (level === "high") return "text-red-400 border-red-500/30 bg-red-500/10";
  if (level === "medium") return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
  return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
}

function StatDelta({ value, good = "high" }: { value: number; good?: "high" | "low" }) {
  const isGood = good === "high" ? value >= 70 : value <= 30;
  const isMid = good === "high" ? value >= 50 : value <= 50;
  const color = isGood ? "text-emerald-400" : isMid ? "text-yellow-400" : "text-red-400";
  const Icon = isGood ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold ${color}`}>
      <Icon className="w-3 h-3" />
      {value.toFixed(1)}%
    </span>
  );
}

function CohortCard({ stats, selected, onClick }: { stats: CohortStats; selected: boolean; onClick: () => void }) {
  const color = COHORT_COLORS[stats.cohort] || "#00f0ff";
  return (
    <GlassCard
      glowing={selected}
      className={`p-5 cursor-pointer transition-all ${selected ? "border-primary/60" : "hover:border-primary/30"}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
          <span className="text-sm font-bold text-foreground tracking-tight">{stats.cohort}</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{stats.total_trainees} trainees</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: "Avg Learning", value: stats.avg_learning_score, good: "high" as const },
          { label: "Avg Demo", value: stats.avg_demo_score, good: "high" as const },
          { label: "AI Dependency", value: stats.avg_ai_dependency, good: "low" as const },
          { label: "Attendance", value: stats.avg_attendance, good: "high" as const },
        ].map(({ label, value, good }) => (
          <div key={label}>
            <p className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider mb-0.5">{label}</p>
            <StatDelta value={value} good={good} />
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { label: "High", count: stats.high_risk_count, color: "text-red-400 bg-red-500/10 border-red-500/30" },
          { label: "Med", count: stats.medium_risk_count, color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
          { label: "Low", count: stats.low_risk_count, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
        ].map(({ label, count, color }) => (
          <span key={label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold ${color}`}>
            {label} · {count}
          </span>
        ))}
      </div>
    </GlassCard>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded p-3 text-xs">
      <p className="text-muted-foreground font-mono mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}</p>
      ))}
    </div>
  );
};

export default function CohortsPage() {
  const { data: cohorts = [], isLoading } = useGetCohortStats();
  const [selected, setSelected] = useState<string | null>(null);

  const selectedCohort = cohorts.find((c) => c.cohort === selected) || cohorts[0] || null;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const radarData = [
    { metric: "Learning", ...Object.fromEntries(cohorts.map((c) => [c.cohort, c.avg_learning_score])) },
    { metric: "Demo", ...Object.fromEntries(cohorts.map((c) => [c.cohort, c.avg_demo_score])) },
    { metric: "Attendance", ...Object.fromEntries(cohorts.map((c) => [c.cohort, c.avg_attendance])) },
    { metric: "AI Safety", ...Object.fromEntries(cohorts.map((c) => [c.cohort, 100 - c.avg_ai_dependency])) },
  ];

  const riskBarData = cohorts.map((c) => ({
    name: c.cohort.replace("Cohort-", "C"),
    High: c.high_risk_count,
    Medium: c.medium_risk_count,
    Low: c.low_risk_count,
  }));

  const scoreLineData = cohorts.length > 0
    ? cohorts[0].score_distribution.map((bucket, i) => ({
        range: bucket.range,
        ...Object.fromEntries(cohorts.map((c) => [c.cohort, c.score_distribution[i]?.count || 0])),
      }))
    : [];

  return (
    <Layout>
      <div className="p-6 space-y-6 overflow-y-auto h-screen">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-base font-semibold text-foreground">Cohort Comparison</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Side-by-side performance analytics across all cohorts — identify gaps, celebrate wins, prioritise resources
            </p>
          </div>
        </div>

        {/* Cohort Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cohorts.map((c) => (
            <CohortCard
              key={c.cohort}
              stats={c}
              selected={selected === c.cohort || (selected === null && c === cohorts[0])}
              onClick={() => setSelected(c.cohort)}
            />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Radar */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-primary" />
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Performance Radar</p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "monospace" }} />
                {cohorts.map((c) => (
                  <Radar
                    key={c.cohort}
                    name={c.cohort}
                    dataKey={c.cohort}
                    stroke={COHORT_COLORS[c.cohort]}
                    fill={COHORT_COLORS[c.cohort]}
                    fillOpacity={0.08}
                    strokeWidth={1.5}
                  />
                ))}
                <Legend
                  formatter={(v) => <span style={{ color: COHORT_COLORS[v] || "#fff", fontSize: 10, fontFamily: "monospace" }}>{v}</span>}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Risk Distribution Bar */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Risk Distribution by Cohort</p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={riskBarData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ fontSize: 10, fontFamily: "monospace", color: "#9ca3af" }}>{v}</span>} />
                <Bar dataKey="High" fill={RISK_COLOR.high} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Medium" fill={RISK_COLOR.medium} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Low" fill={RISK_COLOR.low} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Score Distribution Line Chart */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Learning Score Distribution</p>
            <span className="text-[10px] text-muted-foreground/50 ml-1">— trainees per score band</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={scoreLineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="range" tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span style={{ color: COHORT_COLORS[v] || "#fff", fontSize: 10, fontFamily: "monospace" }}>{v}</span>} />
              {cohorts.map((c) => (
                <Line
                  key={c.cohort}
                  type="monotone"
                  dataKey={c.cohort}
                  stroke={COHORT_COLORS[c.cohort]}
                  strokeWidth={2}
                  dot={{ fill: COHORT_COLORS[c.cohort], r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Spotlight — Top & Bottom per Cohort */}
        {selectedCohort && (
          <div className="space-y-3">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-primary" />
              Spotlight — {selectedCohort.cohort}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Performer */}
              <GlassCard className="p-4 border-emerald-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Top Performer</span>
                </div>
                <p className="text-base font-bold text-foreground">{selectedCohort.top_performer.name}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{selectedCohort.top_performer.track}</p>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {[
                    { label: "Learning", val: selectedCohort.top_performer.learning_score },
                    { label: "Demo", val: selectedCohort.top_performer.demo_score },
                    { label: "Attendance", val: selectedCohort.top_performer.attendance },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <p className="text-[10px] font-mono text-muted-foreground/70 uppercase">{label}</p>
                      <p className="text-sm font-bold text-emerald-400 mt-0.5">{val}%</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${riskBadge(selectedCohort.top_performer.risk_level)}`}>
                    {selectedCohort.top_performer.risk_level} risk
                  </span>
                </div>
              </GlassCard>

              {/* Bottom Performer */}
              <GlassCard className="p-4 border-red-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-mono text-red-400 uppercase tracking-widest">Needs Attention</span>
                </div>
                <p className="text-base font-bold text-foreground">{selectedCohort.bottom_performer.name}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{selectedCohort.bottom_performer.track}</p>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {[
                    { label: "Learning", val: selectedCohort.bottom_performer.learning_score },
                    { label: "Demo", val: selectedCohort.bottom_performer.demo_score },
                    { label: "Attendance", val: selectedCohort.bottom_performer.attendance },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <p className="text-[10px] font-mono text-muted-foreground/70 uppercase">{label}</p>
                      <p className="text-sm font-bold text-red-400 mt-0.5">{val}%</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${riskBadge(selectedCohort.bottom_performer.risk_level)}`}>
                    {selectedCohort.bottom_performer.risk_level} risk
                  </span>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <GlassCard>
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Full Metric Comparison</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Metric</th>
                  {cohorts.map((c) => (
                    <th key={c.cohort} className="px-4 py-3 text-[10px] font-mono uppercase tracking-widest" style={{ color: COHORT_COLORS[c.cohort] }}>
                      {c.cohort}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Total Trainees", fn: (c: CohortStats) => c.total_trainees.toString(), good: "neutral" },
                  { label: "Avg Learning Score", fn: (c: CohortStats) => `${c.avg_learning_score}%`, good: "high" },
                  { label: "Avg Demo Score", fn: (c: CohortStats) => `${c.avg_demo_score}%`, good: "high" },
                  { label: "Avg Attendance", fn: (c: CohortStats) => `${c.avg_attendance}%`, good: "high" },
                  { label: "Avg AI Dependency", fn: (c: CohortStats) => `${c.avg_ai_dependency}%`, good: "low" },
                  { label: "High Risk", fn: (c: CohortStats) => c.high_risk_count.toString(), good: "low-count" },
                  { label: "Medium Risk", fn: (c: CohortStats) => c.medium_risk_count.toString(), good: "neutral" },
                  { label: "Low Risk", fn: (c: CohortStats) => c.low_risk_count.toString(), good: "high-count" },
                ].map(({ label, fn, good }) => {
                  const values = cohorts.map((c) => parseFloat(fn(c)));
                  const best = good === "high" || good === "high-count" ? Math.max(...values) : good === "low" || good === "low-count" ? Math.min(...values) : null;
                  return (
                    <tr key={label} className="border-b border-border/40 hover:bg-primary/[0.02] transition-colors">
                      <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground">{label}</td>
                      {cohorts.map((c) => {
                        const v = parseFloat(fn(c));
                        const isBest = best !== null && v === best;
                        return (
                          <td key={c.cohort} className="px-4 py-2.5">
                            <span className={`text-sm font-bold tabular-nums ${isBest ? "text-primary" : "text-foreground/70"}`}>
                              {fn(c)}
                              {isBest && <span className="ml-1 text-[10px] text-primary/60">★</span>}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}
