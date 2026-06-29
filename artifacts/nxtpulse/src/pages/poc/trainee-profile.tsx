import { useState } from "react";
import { useRoute, Link } from "wouter";
import {
  ArrowLeft, Brain, Download, Loader2, User,
  ShieldAlert, TrendingDown, TrendingUp, CheckCircle2,
  AlertTriangle, Clock, MessageSquare, CalendarDays,
  CalendarCheck, Zap, Target, Activity
} from "lucide-react";
import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useGetTrainee,
  useGetLearnGuardEvaluations,
  useGetDemoReports,
  useGetInterventions,
  getGetTraineeQueryKey,
  getGetLearnGuardEvaluationsQueryKey,
  getGetDemoReportsQueryKey,
} from "@workspace/api-client-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer,
  Tooltip, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

function riskStyle(level: string) {
  if (level === "high") return "text-red-700 border-red-200 bg-red-50";
  if (level === "medium") return "text-amber-700 border-amber-200 bg-amber-50";
  return "text-emerald-700 border-emerald-200 bg-emerald-50";
}

function metricColor(val: number, danger = false) {
  if (danger) return val > 60 ? "#ef4444" : "#10b981";
  if (val >= 70) return "#10b981";
  if (val >= 45) return "#f59e0b";
  return "#ef4444";
}

function ScoreBar({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  const color = metricColor(value, danger);
  const textColor = danger
    ? value > 60 ? "text-red-600" : "text-emerald-600"
    : value >= 70 ? "text-emerald-600" : value >= 45 ? "text-amber-600" : "text-red-600";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <span className={`text-xs font-bold tabular-nums ${textColor}`}>{value.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

const ATTENDANCE_TREND = [
  { week: "W1", value: 92 }, { week: "W2", value: 88 }, { week: "W3", value: 80 },
  { week: "W4", value: 74 }, { week: "W5", value: 68 }, { week: "W6", value: 62 },
];

const PERFORMANCE_TREND = [
  { week: "W1", demo: 72, learning: 68, ai: 45 },
  { week: "W2", demo: 65, learning: 60, ai: 55 },
  { week: "W3", demo: 58, learning: 53, ai: 62 },
  { week: "W4", demo: 51, learning: 50, ai: 71 },
  { week: "W5", demo: 48, learning: 46, ai: 79 },
  { week: "W6", demo: 44, learning: 42, ai: 84 },
];

const STANDUP_HISTORY = [
  { date: "Jun 28, 2026", status: "missed",   notes: "No show — 3rd consecutive" },
  { date: "Jun 27, 2026", status: "missed",   notes: "No show — 2nd consecutive" },
  { date: "Jun 26, 2026", status: "missed",   notes: "No show" },
  { date: "Jun 25, 2026", status: "attended", notes: "Brief — no blockers shared" },
  { date: "Jun 24, 2026", status: "attended", notes: "Mentioned difficulty with closures" },
  { date: "Jun 23, 2026", status: "attended", notes: "On track per standup" },
  { date: "Jun 20, 2026", status: "missed",   notes: "Absent — no prior notice" },
];

const ATTENDANCE_HISTORY = [
  { week: "Jun 24–28", days: [true, true, false, false, false], pct: "40%" },
  { week: "Jun 17–21", days: [true, false, true, true, true], pct: "80%" },
  { week: "Jun 10–14", days: [true, true, true, false, true], pct: "80%" },
  { week: "Jun 3–7",   days: [true, true, true, true, true], pct: "100%" },
];

const AI_INSIGHT = {
  summary: "Rahul is showing increased disengagement due to declining attendance, deteriorating demo performance, and rising AI dependency — a pattern associated with high dropout risk if unaddressed within 7 days.",
  riskFactors: [
    "Attendance dropped 30% over 6 weeks — now at 62%",
    "AI dependency climbed from 45% to 84% — critical threshold",
    "Demo score falling week-over-week — down from 72% to 44%",
    "3 consecutive standup misses — possible complete withdrawal",
  ],
  immediateActions: [
    "Schedule emergency sync-up today",
    "Assign to Understudy AI — pair with Meena Iyer",
    "Create high-priority intervention",
    "Notify programme coordinator if unresponsive",
  ],
  verdict: "high" as const,
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-2.5 shadow-md">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>{p.name}: <strong>{p.value}%</strong></p>
      ))}
    </div>
  );
};

export default function POCTraineeProfile() {
  const [, params] = useRoute("/poc/trainee/:id");
  const id = params?.id || "";
  const [activeSection, setActiveSection] = useState<"overview" | "history" | "ai">("overview");

  const { data: trainee, isLoading } = useGetTrainee(id, {
    query: { enabled: !!id, queryKey: getGetTraineeQueryKey(id) },
  });
  const { data: evaluations = [] } = useGetLearnGuardEvaluations(
    { trainee_id: id },
    { query: { enabled: !!id, queryKey: getGetLearnGuardEvaluationsQueryKey({ trainee_id: id }) } }
  );
  const { data: demos = [] } = useGetDemoReports(
    { trainee_id: id },
    { query: { enabled: !!id, queryKey: getGetDemoReportsQueryKey({ trainee_id: id }) } }
  );
  const { data: allInterventions = [] } = useGetInterventions();
  const interventions = allInterventions.filter((i) => i.trainee_id === id);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!trainee) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-sm text-muted-foreground">Trainee not found.</p>
          <Link href="/poc/my-trainees" className="text-primary text-sm hover:underline">Back to My Trainees</Link>
        </div>
      </Layout>
    );
  }

  const overallScore = Math.round((trainee.learning_score + trainee.demo_score + trainee.attendance) / 3);
  const teachScore = Math.round((trainee.learning_score + trainee.demo_score) / 2);
  const sdiProgress = Math.round(trainee.learning_score * 0.4 + trainee.demo_score * 0.3 + trainee.attendance * 0.3);

  const radarData = evaluations[0] ? [
    { metric: "Understanding", value: evaluations[0].understanding_score },
    { metric: "Confidence", value: evaluations[0].confidence_score },
    { metric: "AI Safety", value: 100 - evaluations[0].ai_dependency_score },
    { metric: "Readiness", value: evaluations[0].readiness_score },
  ] : [];

  return (
    <Layout>
      <div className="p-6 space-y-6">

        {/* Back nav */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link href="/poc/my-trainees" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Trainees
          </Link>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Schedule Sync-up
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-red-200 text-red-600 hover:bg-red-50">
              <ShieldAlert className="w-3.5 h-3.5" /> Create Intervention
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
              <Download className="w-3.5 h-3.5" /> Export PDF
            </Button>
          </div>
        </div>

        {/* Hero */}
        <GlassCard className="p-6">
          <div className="flex items-start gap-5 flex-wrap mb-5">
            {/* Avatar */}
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0 ${
              trainee.risk_level === "high" ? "bg-red-50 text-red-600 border-2 border-red-200" :
              trainee.risk_level === "medium" ? "bg-amber-50 text-amber-600 border-2 border-amber-200" :
              "bg-emerald-50 text-emerald-600 border-2 border-emerald-200"
            }`}>
              {trainee.name.split(" ").map((n: string) => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl font-bold text-foreground">{trainee.name}</h2>
                <Badge variant="outline" className={`text-xs font-bold ${riskStyle(trainee.risk_level)}`}>
                  {trainee.risk_level.toUpperCase()} RISK
                </Badge>
                <Badge variant="outline" className="text-xs text-muted-foreground">{trainee.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{trainee.track} · {trainee.cohort}</p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> Assigned SDI: Sai Krishna</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last active: {trainee.last_active}</span>
              </div>
            </div>
            <div className="text-center shrink-0">
              <div className={`text-4xl font-black tabular-nums ${overallScore >= 70 ? "text-emerald-600" : overallScore >= 45 ? "text-amber-600" : "text-red-600"}`}>
                {overallScore}<span className="text-lg text-muted-foreground font-normal">%</span>
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Overall Score</div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Attendance", value: trainee.attendance, danger: false },
              { label: "Demo Score", value: trainee.demo_score, danger: false },
              { label: "Teach Score", value: teachScore, danger: false },
              { label: "SDI Progress", value: sdiProgress, danger: false },
              { label: "AI Dependency", value: trainee.ai_dependency, danger: true },
            ].map((m) => (
              <ScoreBar key={m.label} {...m} />
            ))}
          </div>
        </GlassCard>

        {/* Section nav */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1 border border-border w-fit">
          {(["overview", "history", "ai"] as const).map((s) => {
            const labels = { overview: "Performance Overview", history: "Attendance & Standups", ai: "AI Insights" };
            return (
              <button key={s} onClick={() => setActiveSection(s)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeSection === s ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {labels[s]}
              </button>
            );
          })}
        </div>

        {/* OVERVIEW */}
        {activeSection === "overview" && (
          <div className="space-y-4">
            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Attendance Trend */}
              <GlassCard className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Attendance Trend</h3>
                  <span className={`text-xs font-bold ml-auto tabular-nums ${trainee.attendance < 70 ? "text-red-600" : "text-emerald-600"}`}>
                    {trainee.attendance.toFixed(0)}%
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={ATTENDANCE_TREND} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis domain={[40, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#ef4444" fill="url(#attGrad)" strokeWidth={2} name="Attendance" />
                  </AreaChart>
                </ResponsiveContainer>
              </GlassCard>

              {/* Performance Trend */}
              <GlassCard className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <h3 className="text-sm font-semibold text-foreground">Performance Trend</h3>
                  <div className="ml-auto flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-primary inline-block rounded" /> Demo</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-amber-500 inline-block rounded" /> Learning</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-violet-500 inline-block rounded" /> AI Dep</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={PERFORMANCE_TREND} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      {[["demoGrad","#2563eb"],["learningGrad","#f59e0b"],["aiGrad","#8b5cf6"]].map(([id, color]) => (
                        <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="demo" stroke="#2563eb" fill="url(#demoGrad)" strokeWidth={2} name="Demo" />
                    <Area type="monotone" dataKey="learning" stroke="#f59e0b" fill="url(#learningGrad)" strokeWidth={2} name="Learning" />
                    <Area type="monotone" dataKey="ai" stroke="#8b5cf6" fill="url(#aiGrad)" strokeWidth={2} name="AI Dep" />
                  </AreaChart>
                </ResponsiveContainer>
              </GlassCard>
            </div>

            {/* LearnGuard Radar + Interventions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Radar */}
              <GlassCard className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">LearnGuard Snapshot</h3>
                </div>
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(0,0,0,0.08)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                      <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.12} strokeWidth={1.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-44 text-xs text-muted-foreground">No evaluations yet</div>
                )}
                {evaluations[0] && <p className="text-[10px] text-muted-foreground text-center mt-1">Topic: {evaluations[0].topic}</p>}
              </GlassCard>

              {/* Interventions */}
              <GlassCard className="p-5 col-span-1 lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-foreground">Intervention History</h3>
                  <span className="ml-auto text-xs font-bold tabular-nums text-muted-foreground">{interventions.length} total</span>
                </div>
                {interventions.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">No active interventions</div>
                ) : (
                  <div className="space-y-2.5">
                    {interventions.map((iv) => (
                      <div key={iv.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-card">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                          iv.status === "resolved" ? "bg-emerald-500" : iv.status === "acknowledged" ? "bg-blue-500" : "bg-amber-500"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground">{iv.issue}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{iv.recommendation}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize shrink-0 ${
                          iv.status === "resolved" ? "text-emerald-700 border-emerald-200 bg-emerald-50" :
                          iv.status === "acknowledged" ? "text-blue-700 border-blue-200 bg-blue-50" :
                          "text-amber-700 border-amber-200 bg-amber-50"
                        }`}>{iv.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>

            {/* LearnGuard evaluations */}
            {evaluations.length > 0 && (
              <GlassCard className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Evaluation History</h3>
                </div>
                <div className="space-y-4">
                  {evaluations.slice(0, 3).map((ev) => (
                    <div key={ev.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="text-sm font-semibold text-foreground">{ev.topic}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(ev.evaluated_at).toLocaleDateString("en-IN")}</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <ScoreBar label="Understanding" value={ev.understanding_score} />
                        <ScoreBar label="Confidence" value={ev.confidence_score} />
                        <ScoreBar label="AI Dependency" value={ev.ai_dependency_score} danger />
                        <ScoreBar label="Readiness" value={ev.readiness_score} />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">{ev.ai_feedback}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {/* HISTORY */}
        {activeSection === "history" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Attendance Calendar */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <CalendarCheck className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Attendance History</h3>
                <Badge variant="outline" className={`ml-auto text-xs ${trainee.attendance < 70 ? "text-red-700 border-red-200 bg-red-50" : "text-emerald-700 border-emerald-200 bg-emerald-50"}`}>
                  {trainee.attendance.toFixed(0)}%
                </Badge>
              </div>
              <div className="space-y-3">
                {/* Day headers */}
                <div className="grid grid-cols-5 text-center text-[10px] font-semibold text-muted-foreground mb-1">
                  {["Mon","Tue","Wed","Thu","Fri"].map((d) => <div key={d}>{d}</div>)}
                </div>
                {ATTENDANCE_HISTORY.map((week) => (
                  <div key={week.week} className="flex items-center gap-3">
                    <div className="w-20 shrink-0 text-[10px] text-muted-foreground">{week.week}</div>
                    <div className="grid grid-cols-5 gap-1.5 flex-1">
                      {week.days.map((present, i) => (
                        <div key={i} title={present ? "Present" : "Absent"}
                          className={`h-7 rounded-lg flex items-center justify-center text-xs font-bold border ${
                            present ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"
                          }`}>
                          {present ? "✓" : "✗"}
                        </div>
                      ))}
                    </div>
                    <div className={`text-xs font-bold tabular-nums shrink-0 w-10 text-right ${parseInt(week.pct) < 70 ? "text-red-600" : "text-emerald-600"}`}>{week.pct}</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Standup History */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Standup History</h3>
                <span className="ml-auto text-xs text-muted-foreground">Last 7 days</span>
              </div>
              <div className="space-y-2.5">
                {STANDUP_HISTORY.map((s, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                    s.status === "attended" ? "border-emerald-200 bg-emerald-50/30" : "border-red-200 bg-red-50/30"
                  }`}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      s.status === "attended" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}>
                      {s.status === "attended" ? "✓" : "✗"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground">{s.date}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{s.notes}</div>
                    </div>
                    <span className={`text-[10px] font-semibold capitalize shrink-0 ${s.status === "attended" ? "text-emerald-600" : "text-red-600"}`}>
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Demo Reports */}
            <GlassCard className="p-5 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Demo Report History</h3>
              </div>
              {demos.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">No demo reports on record</div>
              ) : (
                <div className="space-y-4">
                  {demos.map((d) => {
                    const avg = Math.round((d.technical_score + d.communication_score + d.confidence_score + d.teaching_readiness_score) / 4);
                    const isStrong = avg >= 70;
                    return (
                      <div key={d.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            {isStrong ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                            <p className="text-sm font-semibold text-foreground">{d.topic}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold tabular-nums ${isStrong ? "text-emerald-600" : "text-red-600"}`}>{avg}%</span>
                            <p className="text-[10px] text-muted-foreground">{new Date(d.reported_at).toLocaleDateString("en-IN")}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <ScoreBar label="Technical" value={d.technical_score} />
                          <ScoreBar label="Communication" value={d.communication_score} />
                          <ScoreBar label="Confidence" value={d.confidence_score} />
                          <ScoreBar label="Teaching" value={d.teaching_readiness_score} />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">{d.ai_feedback}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* AI INSIGHTS */}
        {activeSection === "ai" && (
          <div className="space-y-4">
            {/* Main insight */}
            <GlassCard className="p-6 border-red-200 bg-red-50/10">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-bold text-foreground">AI Analysis — {trainee.name}</h3>
                    <Badge variant="outline" className={`text-xs font-bold ${riskStyle(trainee.risk_level)}`}>{trainee.risk_level.toUpperCase()} RISK</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{AI_INSIGHT.summary}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Risk Factors */}
                <div className="p-4 rounded-xl border border-red-200 bg-red-50/40">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Risk Factors</span>
                  </div>
                  <ul className="space-y-2">
                    {AI_INSIGHT.riskFactors.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                        <span className="text-red-500 mt-0.5 shrink-0">▸</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Immediate Actions */}
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/[0.02]">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Immediate Actions</span>
                  </div>
                  <ul className="space-y-2">
                    {AI_INSIGHT.immediateActions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                        <span className="text-primary font-bold mt-0.5 shrink-0">{i + 1}.</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>

            {/* Quick Action buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: "Schedule Emergency Sync-up", icon: CalendarDays, color: "border-primary/30 text-primary bg-primary/5 hover:bg-primary/10" },
                { label: "Create High-Priority Intervention", icon: ShieldAlert, color: "border-red-200 text-red-600 bg-red-50 hover:bg-red-100" },
                { label: "Pair with Understudy AI", icon: Zap, color: "border-violet-200 text-violet-600 bg-violet-50 hover:bg-violet-100" },
              ].map(({ label, icon: Icon, color }) => (
                <button key={label} className={`flex items-center gap-3 p-4 rounded-xl border transition-colors text-left ${color}`}>
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-semibold">{label}</span>
                </button>
              ))}
            </div>

            {/* Latest eval detailed */}
            {evaluations[0] && (
              <GlassCard className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Latest LearnGuard Evaluation</h3>
                  <span className="text-xs text-muted-foreground ml-auto">{evaluations[0].topic}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <ScoreBar label="Understanding" value={evaluations[0].understanding_score} />
                  <ScoreBar label="Confidence" value={evaluations[0].confidence_score} />
                  <ScoreBar label="AI Dependency" value={evaluations[0].ai_dependency_score} danger />
                  <ScoreBar label="Readiness" value={evaluations[0].readiness_score} />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">{evaluations[0].ai_feedback}</p>
              </GlassCard>
            )}
          </div>
        )}

      </div>
    </Layout>
  );
}
