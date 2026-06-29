import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
  Brain, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown,
  ChevronRight, Zap, Target,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
} from "recharts";
import { useGetLatestLearnGuardEvaluation } from "@workspace/api-client-react";
import { Link } from "wouter";

const TOPIC_MASTERY = [
  { topic: "React — useState & useEffect",     score: 92, trend: +4,  status: "mastered" },
  { topic: "React — Custom Hooks",             score: 85, trend: +6,  status: "mastered" },
  { topic: "React — useCallback & useMemo",    score: 78, trend: +8,  status: "good" },
  { topic: "Node.js — Express REST APIs",      score: 88, trend: +3,  status: "mastered" },
  { topic: "Node.js — Streams & Buffers",      score: 72, trend: +5,  status: "good" },
  { topic: "JavaScript — Closures",            score: 52, trend: -4,  status: "weak" },
  { topic: "JavaScript — Promises & Async",    score: 68, trend: +2,  status: "good" },
  { topic: "SQL — INNER/LEFT JOINs",           score: 80, trend: +0,  status: "good" },
  { topic: "SQL — Window Functions",           score: 44, trend: -2,  status: "critical" },
  { topic: "DSA — Arrays & Strings",           score: 74, trend: +1,  status: "good" },
  { topic: "DSA — Binary Search Trees",        score: 55, trend: 0,   status: "weak" },
  { topic: "Python — Basics",                  score: 61, trend: +3,  status: "good" },
];

const RADAR_DATA = [
  { metric: "React",   value: 85 },
  { metric: "Node",    value: 80 },
  { metric: "JS",      value: 60 },
  { metric: "SQL",     value: 62 },
  { metric: "DSA",     value: 65 },
  { metric: "Python",  value: 61 },
];

const AI_DEP_TREND = [
  { week: "W1", dep: 62 }, { week: "W2", dep: 58 }, { week: "W3", dep: 52 },
  { week: "W4", dep: 45 }, { week: "W5", dep: 39 }, { week: "W6", dep: 34 },
];

const STATUS_CONFIG = {
  mastered: { label: "Mastered",  border: "border-emerald-200 bg-emerald-50/40",  text: "text-emerald-700", badge: "text-emerald-700 border-emerald-200 bg-emerald-50" },
  good:     { label: "Good",      border: "border-primary/20 bg-primary/[0.02]",  text: "text-primary",     badge: "text-primary border-primary/20 bg-primary/5" },
  weak:     { label: "Needs Work",border: "border-amber-200 bg-amber-50/30",      text: "text-amber-700",   badge: "text-amber-700 border-amber-200 bg-amber-50" },
  critical: { label: "Critical",  border: "border-red-200 bg-red-50/30",          text: "text-red-700",     badge: "text-red-700 border-red-200 bg-red-50" },
};

const avgScore = Math.round(TOPIC_MASTERY.reduce((s, t) => s + t.score, 0) / TOPIC_MASTERY.length);
const aiDep = 34;

export default function SDILearnGuardPage() {
  const { data: latestEval } = useGetLatestLearnGuardEvaluation();

  return (
    <Layout>
      <div className="p-6 space-y-6 overflow-y-auto h-screen">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">LearnGuard AI</h1>
            <p className="text-sm text-muted-foreground mt-0.5">AI learning evaluation — topic mastery, knowledge gaps, dependency tracking</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 font-bold">Avg Mastery: {avgScore}%</Badge>
            <Badge variant="outline" className={`font-bold ${aiDep <= 30 ? "text-emerald-700 border-emerald-200 bg-emerald-50" : aiDep <= 50 ? "text-amber-700 border-amber-200 bg-amber-50" : "text-red-700 border-red-200 bg-red-50"}`}>
              AI Dep: {aiDep}%
            </Badge>
          </div>
        </div>

        {/* Top row: Radar + AI Dep trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Subject Radar */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Knowledge Radar</h2>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="rgba(0,0,0,0.07)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* AI Dependency Tracker */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-violet-600" />
              <h2 className="text-sm font-semibold text-foreground">AI Dependency Tracker</h2>
              <div className="ml-auto flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <TrendingDown className="w-3 h-3" /> Reducing ✓
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Lower is better — target: under 25%</p>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={AI_DEP_TREND} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis domain={[20, 70]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip />
                <Area type="monotone" dataKey="dep" stroke="#8b5cf6" fill="url(#depGrad)" strokeWidth={2} name="AI Dependency %" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <p className="text-xs text-emerald-700 font-medium">📉 Dropped from 62% → 34% over 6 weeks. Keep going — target is 25%.</p>
            </div>
          </GlassCard>
        </div>

        {/* Latest Evaluation from API */}
        {latestEval && (
          <GlassCard className="p-5 border-primary/20 bg-primary/[0.02]">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Latest LearnGuard Evaluation</h2>
              <span className="text-xs text-muted-foreground ml-auto">{latestEval.topic}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { label: "Understanding", value: latestEval.understanding_score, danger: false },
                { label: "Confidence",    value: latestEval.confidence_score,    danger: false },
                { label: "AI Dependency", value: latestEval.ai_dependency_score, danger: true },
                { label: "Readiness",     value: latestEval.readiness_score,     danger: false },
              ].map(({ label, value, danger }) => {
                const color = danger ? (value > 40 ? "#ef4444" : "#10b981") : value >= 70 ? "#10b981" : value >= 50 ? "#f59e0b" : "#ef4444";
                return (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-xs font-bold" style={{ color }}>{value}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">{latestEval.ai_feedback}</p>
          </GlassCard>
        )}

        {/* Topic Mastery Grid */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Topic Mastery — All Subjects</h2>
            <div className="ml-auto flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Mastered
              <span className="w-2 h-2 rounded-full bg-primary inline-block" /> Good
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Needs Work
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Critical
            </div>
          </div>
          <div className="space-y-2.5">
            {TOPIC_MASTERY.map((t) => {
              const cfg = STATUS_CONFIG[t.status as keyof typeof STATUS_CONFIG];
              return (
                <div key={t.topic} className={`flex items-center gap-3 p-3 rounded-xl border ${cfg.border}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground truncate">{t.topic}</span>
                      <Badge variant="outline" className={`text-[9px] shrink-0 ${cfg.badge}`}>{cfg.label}</Badge>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${t.score}%`,
                        backgroundColor: t.status === "mastered" ? "#10b981" : t.status === "good" ? "#2563eb" : t.status === "weak" ? "#f59e0b" : "#ef4444",
                      }} />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className={`text-sm font-bold tabular-nums ${cfg.text}`}>{t.score}%</div>
                    <div className={`text-[10px] flex items-center gap-0.5 justify-end ${t.trend > 0 ? "text-emerald-600" : t.trend < 0 ? "text-red-600" : "text-muted-foreground"}`}>
                      {t.trend > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : t.trend < 0 ? <TrendingDown className="w-2.5 h-2.5" /> : null}
                      {t.trend !== 0 && `${Math.abs(t.trend)}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* AI Action Plan */}
        <GlassCard className="p-5 border-primary/20 bg-primary/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-primary mb-1">AI Revision Plan</p>
              <div className="space-y-1">
                {[
                  "1. Revise JavaScript Closures — scored 52%, critical gap",
                  "2. Practice SQL Window Functions with 5 LeetCode problems",
                  "3. Complete DSA Binary Search Tree exercises",
                  "4. Reduce AI dependency to 25% by next evaluation",
                ].map((a, i) => (
                  <p key={i} className="text-xs text-muted-foreground">{a}</p>
                ))}
              </div>
            </div>
            <Link href="/sdi/ai-coach" className="text-xs text-primary hover:underline font-medium shrink-0 flex items-center gap-1">
              Full Plan <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </GlassCard>

      </div>
    </Layout>
  );
}
