import { useState } from "react";
import {
  Users, TrendingUp, TrendingDown, Award, AlertTriangle,
  Brain, Activity, Loader2, Bot, ShieldAlert,
  Download, Target, Zap, CheckCircle2, XCircle,
  MessageSquare, Calendar, BarChart3
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  LineChart, Line, ResponsiveContainer,
} from "recharts";
import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetCohortStats } from "@workspace/api-client-react";
import type { CohortStats } from "@workspace/api-client-react";

const COHORT_COLORS: Record<string, string> = {
  "Cohort-6": "#2563eb",
  "Cohort-7": "#ef4444",
  "Cohort-8": "#f59e0b",
};

function healthScore(c: CohortStats) {
  return Math.round(
    c.avg_learning_score * 0.35 +
    c.avg_demo_score * 0.25 +
    c.avg_attendance * 0.25 +
    (100 - c.avg_ai_dependency) * 0.15
  );
}

function healthStyle(score: number) {
  if (score >= 75) return { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", label: "Healthy" };
  if (score >= 50) return { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500", label: "At Risk" };
  return { text: "text-red-600", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500", label: "Critical" };
}

function riskBadgeClass(level: string) {
  if (level === "high") return "text-red-700 border-red-200 bg-red-50";
  if (level === "medium") return "text-amber-700 border-amber-200 bg-amber-50";
  return "text-emerald-700 border-emerald-200 bg-emerald-50";
}

const HEATMAP_DATA = {
  tracks: ["React", "Python", "DSA", "ML"],
  cohorts: ["Cohort-6", "Cohort-7", "Cohort-8"],
  values: [
    [18, 72, 31],
    [22, 68, 44],
    [15, 55, 38],
    [12, 76, 52],
  ],
};

const TIMELINE = [
  { date: "Jun 24", event: "AI dependency spiked in Cohort-7 (+14%)", type: "critical" },
  { date: "Jun 22", event: "Demo performance dropped in Cohort-8 (–11%)", type: "warning" },
  { date: "Jun 20", event: "Attendance instability detected in Cohort-7", type: "warning" },
  { date: "Jun 18", event: "Cohort-6 reached peak learning score (84%)", type: "success" },
  { date: "Jun 15", event: "Risk level increased in Cohort-7 (high risk: +5)", type: "critical" },
];

function heatmapColor(val: number) {
  if (val <= 25) return { bg: "bg-emerald-50 text-emerald-700", label: "Low" };
  if (val <= 55) return { bg: "bg-amber-50 text-amber-700", label: "Med" };
  return { bg: "bg-red-50 text-red-700", label: "High" };
}

function generateInsights(cohorts: CohortStats[]) {
  const insights: { type: string; icon: string; title: string; desc: string }[] = [];
  for (const c of cohorts) {
    if (c.avg_ai_dependency > 60) {
      insights.push({
        type: "critical",
        icon: "bot",
        title: `${c.cohort} AI Dependency Critical`,
        desc: `AI dependency at ${c.avg_ai_dependency.toFixed(0)}% — trainees may struggle with independent problem-solving`,
      });
    }
    if (c.high_risk_count >= 3) {
      insights.push({
        type: "warning",
        icon: "alert",
        title: `${c.cohort} Risk Concentration`,
        desc: `${c.high_risk_count} trainees at high risk — immediate intervention recommended`,
      });
    }
    if (c.avg_learning_score < 58) {
      insights.push({
        type: "warning",
        icon: "trending-down",
        title: `Learning Scores Below Threshold in ${c.cohort}`,
        desc: `Avg learning score ${c.avg_learning_score.toFixed(0)}% — below the 60% programme baseline`,
      });
    }
    if (c.avg_attendance < 78) {
      insights.push({
        type: "warning",
        icon: "calendar",
        title: `Attendance Instability — ${c.cohort}`,
        desc: `Avg attendance at ${c.avg_attendance.toFixed(0)}% — attendance policy enforcement needed`,
      });
    }
  }
  return insights.slice(0, 4);
}

function generatePredictions(cohorts: CohortStats[]) {
  return cohorts.map((c) => {
    const hs = healthScore(c);
    const hs7 = healthStyle(hs);
    const prob = hs < 50 ? 82 : hs < 65 ? 54 : 18;
    const riskLabel = hs < 50 ? "critical" : hs < 65 ? "medium-high" : "low";
    return {
      cohort: c.cohort,
      score: hs,
      style: hs7,
      prob,
      riskLabel,
      reason: hs < 50
        ? `Persistent high AI dependency (${c.avg_ai_dependency.toFixed(0)}%) and low attendance (${c.avg_attendance.toFixed(0)}) are key drivers`
        : hs < 65
        ? `Demo scores (${c.avg_demo_score.toFixed(0)}%) and risk count (${c.high_risk_count} high-risk) need monitoring`
        : `Strong across learning, demo, and attendance — maintain current trajectory`,
    };
  });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-md">
      <p className="text-muted-foreground mb-1 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
        </p>
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
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const totalTrainees = cohorts.reduce((s, c) => s + c.total_trainees, 0);
  const totalAtRisk = cohorts.reduce((s, c) => s + c.high_risk_count, 0);
  const totalCritical = cohorts.reduce((s, c) => s + (healthScore(c) < 50 ? 1 : 0), 0);

  const riskBarData = cohorts.map((c) => ({
    name: c.cohort.replace("Cohort-", "C"),
    High: c.high_risk_count,
    Medium: c.medium_risk_count,
    Low: c.low_risk_count,
  }));

  const trendData = [
    { week: "Week 1", ...Object.fromEntries(cohorts.map((c) => [c.cohort, Math.max(30, healthScore(c) - 12)])) },
    { week: "Week 2", ...Object.fromEntries(cohorts.map((c) => [c.cohort, Math.max(30, healthScore(c) - 7)])) },
    { week: "Week 3", ...Object.fromEntries(cohorts.map((c) => [c.cohort, Math.max(30, healthScore(c) - 3)])) },
    { week: "Week 4 (Now)", ...Object.fromEntries(cohorts.map((c) => [c.cohort, healthScore(c)])) },
  ];

  const insights = generateInsights(cohorts);
  const predictions = generatePredictions(cohorts);

  const recommendations = [
    {
      title: "Schedule mentor intervention for Cohort-7",
      priority: "High",
      severity: "critical",
      action: "Raise Intervention",
      icon: <ShieldAlert className="w-4 h-4 text-red-500" />,
    },
    {
      title: "Restrict AI-assisted coding for ML cohort trainees",
      priority: "Medium",
      severity: "warning",
      action: "Notify POC",
      icon: <Bot className="w-4 h-4 text-amber-500" />,
    },
    {
      title: "Conduct attendance review for Cohort-8",
      priority: "Medium",
      severity: "warning",
      action: "Generate Report",
      icon: <Calendar className="w-4 h-4 text-amber-500" />,
    },
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cohorts Overview</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track cohort performance, risks, and AI dependency across all cohorts
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 self-start sm:self-auto">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Executive Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Cohorts", value: cohorts.length, icon: <Users className="w-5 h-5" />, color: "text-primary", bg: "bg-primary/8" },
            { label: "Total Trainees", value: totalTrainees, icon: <Users className="w-5 h-5" />, color: "text-violet-600", bg: "bg-violet-50", trend: "↑ 8% from last week" },
            { label: "At Risk", value: totalAtRisk, icon: <AlertTriangle className="w-5 h-5" />, color: "text-amber-500", bg: "bg-amber-50", trend: "↑ +12 since yesterday" },
            { label: "Critical Cohorts", value: totalCritical, icon: <ShieldAlert className="w-5 h-5" />, color: "text-red-500", bg: "bg-red-50" },
          ].map((s) => (
            <GlassCard key={s.label} className="p-5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color} ${s.bg}`}>
                {s.icon}
              </div>
              <div className="text-2xl font-bold text-foreground tabular-nums">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{s.label}</div>
              {s.trend && (
                <div className="text-xs text-amber-600 mt-1.5 font-medium">{s.trend}</div>
              )}
            </GlassCard>
          ))}
        </div>

        {/* Cohort Health Cards */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cohort Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cohorts.map((c) => {
              const hs = healthScore(c);
              const hs7 = healthStyle(hs);
              const isSelected = selected === c.cohort || (selected === null && c === cohorts[0]);
              return (
                <GlassCard
                  key={c.cohort}
                  className={`p-5 cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary/30 border-primary/40" : "hover:border-primary/20"}`}
                  onClick={() => setSelected(c.cohort)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COHORT_COLORS[c.cohort] }} />
                      <span className="font-semibold text-foreground">{c.cohort}</span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${hs7.bg} ${hs7.text} ${hs7.border}`}>
                      {hs7.label}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-end gap-2 mb-1.5">
                      <span className={`text-3xl font-bold ${hs7.text}`}>{hs}</span>
                      <span className="text-muted-foreground text-sm pb-1">/100</span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">AI Health Score</div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${hs >= 75 ? "bg-emerald-500" : hs >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${hs}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-4">
                    {[
                      { label: "Learning", value: c.avg_learning_score, good: "high" as const },
                      { label: "Demo", value: c.avg_demo_score, good: "high" as const },
                      { label: "Attendance", value: c.avg_attendance, good: "high" as const },
                      { label: "AI Dependency", value: c.avg_ai_dependency, good: "low" as const },
                    ].map(({ label, value, good }) => {
                      const isOk = good === "high" ? value >= 70 : value <= 35;
                      const isMid = good === "high" ? value >= 50 : value <= 60;
                      const color = isOk ? "text-emerald-600" : isMid ? "text-amber-600" : "text-red-600";
                      const Icon = good === "high" ? (value >= 60 ? TrendingUp : TrendingDown) : (value <= 40 ? TrendingUp : TrendingDown);
                      return (
                        <div key={label}>
                          <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                          <div className={`text-sm font-semibold flex items-center gap-1 ${color}`}>
                            <Icon className="w-3 h-3" />
                            {value.toFixed(0)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    {[
                      { label: "High", count: c.high_risk_count, cls: "text-red-700 bg-red-50 border-red-200" },
                      { label: "Med", count: c.medium_risk_count, cls: "text-amber-700 bg-amber-50 border-amber-200" },
                      { label: "Low", count: c.low_risk_count, cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                    ].map(({ label, count, cls }) => (
                      <span key={label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium ${cls}`}>
                        {label} · {count}
                      </span>
                    ))}
                    <span className="text-xs text-muted-foreground ml-auto self-center">{c.total_trainees} trainees</span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <GlassCard className="lg:col-span-3 p-5">
            <div className="flex items-center gap-2 mb-5">
              <Activity className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Performance Trend</h3>
              <span className="text-xs text-muted-foreground ml-1">— health score over 4 weeks</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="week" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: COHORT_COLORS[v] || "#374151", fontSize: 11 }}>{v}</span>} />
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

          <GlassCard className="lg:col-span-2 p-5">
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-foreground">Risk Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={riskBarData} layout="vertical" barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ fontSize: 11, color: "#6b7280" }}>{v}</span>} />
                <Bar dataKey="High" fill="#ef4444" radius={[0, 3, 3, 0]} stackId="a" />
                <Bar dataKey="Medium" fill="#f59e0b" radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="Low" fill="#10b981" radius={[0, 3, 3, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* AI Insights */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">AI Insights</h2>
            <span className="text-xs text-muted-foreground">— automatically generated from current data</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.length > 0 ? insights.map((ins, i) => (
              <div
                key={i}
                className={`flex gap-3 p-4 rounded-xl border ${ins.type === "critical" ? "border-red-200 bg-red-50/50" : "border-amber-200 bg-amber-50/50"}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ins.type === "critical" ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-500"}`}>
                  {ins.icon === "bot" ? <Bot className="w-4 h-4" /> : ins.icon === "alert" ? <AlertTriangle className="w-4 h-4" /> : ins.icon === "calendar" ? <Calendar className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{ins.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{ins.desc}</div>
                </div>
              </div>
            )) : (
              <div className="col-span-2 p-6 rounded-xl border border-emerald-200 bg-emerald-50/50 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="text-sm font-semibold text-emerald-700">All cohorts are performing well</div>
                <div className="text-xs text-emerald-600 mt-0.5">No critical insights detected at this time</div>
              </div>
            )}
          </div>
          <Button className="mt-3 gap-2" variant="outline" size="sm">
            <Zap className="w-3.5 h-3.5" />
            Generate Full AI Report
          </Button>
        </div>

        {/* AI Risk Prediction */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
              <Target className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">AI Risk Prediction</h2>
            <span className="text-xs text-muted-foreground">— probability forecast for next 7 days</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predictions.map((p) => (
              <GlassCard key={p.cohort} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COHORT_COLORS[p.cohort] }} />
                    <span className="font-semibold text-sm text-foreground">{p.cohort}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${p.style.bg} ${p.style.text} ${p.style.border}`}>
                    {p.style.label}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="text-xs text-muted-foreground mb-1">Risk escalation probability</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${p.prob >= 70 ? "bg-red-500" : p.prob >= 40 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${p.prob}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${p.prob >= 70 ? "text-red-600" : p.prob >= 40 ? "text-amber-600" : "text-emerald-600"}`}>{p.prob}%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{p.reason}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">AI Recommendations</h2>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border ${rec.severity === "critical" ? "border-red-200 bg-red-50/30" : "border-amber-200 bg-amber-50/30"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${rec.severity === "critical" ? "bg-red-100" : "bg-amber-100"}`}>
                  {rec.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{rec.title}</div>
                  <div className={`text-xs font-medium mt-0.5 ${rec.severity === "critical" ? "text-red-600" : "text-amber-600"}`}>
                    Priority: {rec.priority}
                  </div>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 text-xs h-8">
                  {rec.action}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Timeline + Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Timeline */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Alert Timeline</h3>
            </div>
            <div className="relative space-y-0">
              {TIMELINE.map((item, i) => (
                <div key={i} className="flex gap-3 relative pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${item.type === "critical" ? "bg-red-500" : item.type === "warning" ? "bg-amber-500" : "bg-emerald-500"}`} />
                    {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-1">
                    <div className="text-xs font-medium text-muted-foreground">{item.date}</div>
                    <div className="text-sm text-foreground mt-0.5">{item.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Heatmap */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">AI Dependency Heatmap</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left text-xs text-muted-foreground pb-3 font-medium w-20">Track</th>
                    {HEATMAP_DATA.cohorts.map((c) => (
                      <th key={c} className="text-center text-xs text-muted-foreground pb-3 font-medium" style={{ color: COHORT_COLORS[c] }}>
                        {c.replace("Cohort-", "C")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {HEATMAP_DATA.tracks.map((track, ri) => (
                    <tr key={track}>
                      <td className="py-1.5 text-sm text-foreground font-medium pr-4">{track}</td>
                      {HEATMAP_DATA.values[ri].map((val, ci) => {
                        const vc = heatmapColor(val);
                        return (
                          <td key={ci} className="py-1.5 text-center">
                            <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${vc.bg}`}>
                              {val}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex gap-4 mt-4 pt-4 border-t border-border">
                {[{ label: "Low (≤25%)", cls: "bg-emerald-50 text-emerald-700" }, { label: "Med (26–55%)", cls: "bg-amber-50 text-amber-700" }, { label: "High (>55%)", cls: "bg-red-50 text-red-700" }].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded ${l.cls}`} />
                    <span className="text-xs text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Comparison Table */}
        <GlassCard>
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Full Metric Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Metric</th>
                  {cohorts.map((c) => (
                    <th key={c.cohort} className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: COHORT_COLORS[c.cohort] }}>
                      {c.cohort}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Total Trainees", fn: (c: CohortStats) => c.total_trainees.toString(), good: "neutral" },
                  { label: "Avg Learning Score", fn: (c: CohortStats) => `${c.avg_learning_score.toFixed(1)}%`, good: "high", numFn: (c: CohortStats) => c.avg_learning_score },
                  { label: "Avg Demo Score", fn: (c: CohortStats) => `${c.avg_demo_score.toFixed(1)}%`, good: "high", numFn: (c: CohortStats) => c.avg_demo_score },
                  { label: "Avg Attendance", fn: (c: CohortStats) => `${c.avg_attendance.toFixed(1)}%`, good: "high", numFn: (c: CohortStats) => c.avg_attendance },
                  { label: "Avg AI Dependency", fn: (c: CohortStats) => `${c.avg_ai_dependency.toFixed(1)}%`, good: "low", numFn: (c: CohortStats) => c.avg_ai_dependency },
                  { label: "High Risk", fn: (c: CohortStats) => c.high_risk_count.toString(), good: "low-count", numFn: (c: CohortStats) => c.high_risk_count },
                  { label: "Medium Risk", fn: (c: CohortStats) => c.medium_risk_count.toString(), good: "neutral" },
                  { label: "Low Risk", fn: (c: CohortStats) => c.low_risk_count.toString(), good: "high-count", numFn: (c: CohortStats) => c.low_risk_count },
                ].map(({ label, fn, good, numFn }) => {
                  const values = numFn ? cohorts.map(numFn) : [];
                  const best = good === "high" || good === "high-count" ? Math.max(...values) : good === "low" || good === "low-count" ? Math.min(...values) : null;
                  const worst = good === "high" || good === "high-count" ? Math.min(...values) : good === "low" || good === "low-count" ? Math.max(...values) : null;
                  return (
                    <tr key={label} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{label}</td>
                      {cohorts.map((c) => {
                        const v = numFn ? numFn(c) : null;
                        const isBest = v !== null && best !== null && v === best && values.filter(x => x === best).length < values.length;
                        const isWorst = v !== null && worst !== null && v === worst && values.filter(x => x === worst).length < values.length;
                        return (
                          <td key={c.cohort} className="px-5 py-3">
                            <span className={`text-sm font-semibold tabular-nums ${isBest ? "text-emerald-600" : isWorst ? "text-red-600" : "text-foreground"}`}>
                              {fn(c)}
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

        {/* Spotlight */}
        {selectedCohort && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Spotlight — {selectedCohort.cohort}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard className="p-5 border-emerald-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-700">🏆 Top Performer</span>
                </div>
                <p className="text-base font-bold text-foreground">{selectedCohort.top_performer.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedCohort.top_performer.track}</p>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: "Learning", val: selectedCohort.top_performer.learning_score },
                    { label: "Demo", val: selectedCohort.top_performer.demo_score },
                    { label: "Attendance", val: selectedCohort.top_performer.attendance },
                  ].map(({ label, val }) => (
                    <div key={label} className="text-center">
                      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                      <div className="text-sm font-bold text-emerald-600">{val}%</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <Badge variant="outline" className={`text-xs ${riskBadgeClass(selectedCohort.top_performer.risk_level)}`}>
                    {selectedCohort.top_performer.risk_level.toUpperCase()} RISK
                  </Badge>
                </div>
              </GlassCard>

              <GlassCard className="p-5 border-red-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-sm font-semibold text-red-700">🚨 Needs Intervention</span>
                </div>
                <p className="text-base font-bold text-foreground">{selectedCohort.bottom_performer.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedCohort.bottom_performer.track}</p>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: "Learning", val: selectedCohort.bottom_performer.learning_score },
                    { label: "Demo", val: selectedCohort.bottom_performer.demo_score },
                    { label: "Attendance", val: selectedCohort.bottom_performer.attendance },
                  ].map(({ label, val }) => (
                    <div key={label} className="text-center">
                      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                      <div className="text-sm font-bold text-red-600">{val}%</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <Badge variant="outline" className={`text-xs ${riskBadgeClass(selectedCohort.bottom_performer.risk_level)}`}>
                    {selectedCohort.bottom_performer.risk_level.toUpperCase()} RISK
                  </Badge>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" className="gap-2">
              <ShieldAlert className="w-4 h-4" />
              Raise Intervention
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Notify POC
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Zap className="w-4 h-4" />
              Generate AI Report
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Cohort Data
            </Button>
          </div>
        </GlassCard>

      </div>
    </Layout>
  );
}
