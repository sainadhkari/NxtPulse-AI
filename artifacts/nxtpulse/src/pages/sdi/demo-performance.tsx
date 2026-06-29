import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
  Target, TrendingUp, TrendingDown, Brain, CheckCircle2,
  AlertTriangle, Clock, ChevronDown, ChevronUp, Zap,
} from "lucide-react";
import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer,
  Tooltip, CartesianGrid,
} from "recharts";

const DEMO_HISTORY = [
  {
    id: "d1", topic: "React Hooks — useState & useEffect", date: "Jun 14, 2026", score: 78,
    technical: 82, communication: 74, confidence: 76, problemSolving: 80, aiDependency: 28,
    strengths: ["Clear state management explanation", "Good code structure", "Confident on hooks basics"],
    weaknesses: ["Hesitated on useEffect cleanup", "Verbose in explanation"],
    feedback: "Strong understanding of fundamental hooks. Work on concise explanation and edge case coverage for cleanup functions.",
    passed: true,
  },
  {
    id: "d2", topic: "JavaScript Closures & Scope", date: "Jun 3, 2026", score: 62,
    technical: 58, communication: 65, confidence: 60, problemSolving: 65, aiDependency: 45,
    strengths: ["Recognized closure pattern", "Good examples"],
    weaknesses: ["Confused lexical vs dynamic scope", "High AI dependency during coding"],
    feedback: "Closures are conceptually understood but practical application needs strengthening. Reduce AI tool usage.",
    passed: false,
  },
  {
    id: "d3", topic: "Node.js REST API Design", date: "May 22, 2026", score: 85,
    technical: 88, communication: 80, confidence: 85, problemSolving: 86, aiDependency: 20,
    strengths: ["Excellent REST design", "Clean middleware usage", "Confident delivery"],
    weaknesses: ["Minor gap in error handling patterns"],
    feedback: "Outstanding performance. REST principles applied correctly. Work on comprehensive error handling.",
    passed: true,
  },
  {
    id: "d4", topic: "SQL Joins & Subqueries", date: "May 10, 2026", score: 70,
    technical: 68, communication: 72, confidence: 70, problemSolving: 70, aiDependency: 38,
    strengths: ["INNER/LEFT JOIN correct", "Good query structure"],
    weaknesses: ["Struggled with nested subqueries", "Window functions unclear"],
    feedback: "Core SQL joins handled well. Focus on advanced query patterns especially window functions.",
    passed: true,
  },
];

const TREND_DATA = [
  { demo: "D4\nSQL",   score: 70 }, { demo: "D3\nNode",    score: 85 },
  { demo: "D2\nClosures", score: 62 }, { demo: "D1\nHooks", score: 78 },
];

const AVG_SCORE = Math.round(DEMO_HISTORY.reduce((s, d) => s + d.score, 0) / DEMO_HISTORY.length);
const PASS_RATE = Math.round((DEMO_HISTORY.filter((d) => d.passed).length / DEMO_HISTORY.length) * 100);

function ScoreBar({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  const color = danger
    ? value > 40 ? "#ef4444" : "#10b981"
    : value >= 75 ? "#10b981" : value >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function DemoCard({ d }: { d: typeof DEMO_HISTORY[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <GlassCard className={`p-5 ${d.passed ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-red-500"}`}>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {d.passed ? <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" /> : <TrendingDown className="w-4 h-4 text-red-500 shrink-0" />}
          <h3 className="text-sm font-semibold text-foreground">{d.topic}</h3>
          <Badge variant="outline" className={`text-xs ${d.passed ? "text-emerald-700 border-emerald-200 bg-emerald-50" : "text-red-700 border-red-200 bg-red-50"}`}>
            {d.passed ? "PASSED" : "NEEDS WORK"}
          </Badge>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-2xl font-black tabular-nums ${d.score >= 75 ? "text-emerald-600" : d.score >= 60 ? "text-amber-600" : "text-red-600"}`}>{d.score}%</span>
          <div className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Clock className="w-3 h-3" /> {d.date}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
        <ScoreBar label="Technical" value={d.technical} />
        <ScoreBar label="Communication" value={d.communication} />
        <ScoreBar label="Confidence" value={d.confidence} />
        <ScoreBar label="Problem Solving" value={d.problemSolving} />
        <ScoreBar label="AI Dependency" value={d.aiDependency} danger />
      </div>

      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {open ? "Hide" : "View"} AI Feedback
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {d.strengths.map((s, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700">{s}</span>)}
            {d.weaknesses.map((w, i) => <span key={`w${i}`} className="text-[10px] px-2 py-0.5 rounded border border-red-200 bg-red-50 text-red-700">{w}</span>)}
          </div>
          <div className="p-3 rounded-xl border border-primary/20 bg-primary/[0.02] flex items-start gap-2">
            <Brain className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">{d.feedback}</p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

export default function SDIDemoPerformancePage() {
  return (
    <Layout>
      <div className="p-6 space-y-6 overflow-y-auto h-screen">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Demo Performance</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track your demo history, scores, and AI-powered feedback</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 font-bold">Avg {AVG_SCORE}%</Badge>
            <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 font-bold">{PASS_RATE}% Pass Rate</Badge>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Average Score", value: `${AVG_SCORE}%`, color: "text-primary", bg: "bg-primary/5", border: "border-l-primary" },
            { label: "Pass Rate",     value: `${PASS_RATE}%`, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-l-emerald-500" },
            { label: "Demos Taken",   value: DEMO_HISTORY.length, color: "text-foreground", bg: "bg-muted/40", border: "border-l-border" },
            { label: "Latest Score",  value: `${DEMO_HISTORY[0].score}%`, color: "text-amber-600", bg: "bg-amber-50", border: "border-l-amber-500" },
          ].map(({ label, value, color, bg, border }) => (
            <GlassCard key={label} className={`p-5 border-l-4 ${border}`}>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Trend Chart */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Demo Score Trend</h2>
            <span className="text-xs text-muted-foreground ml-auto">Latest 4 demos</span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={TREND_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="demo" tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#2563eb" fill="url(#scoreGrad)" strokeWidth={2} name="Score" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Demo History */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Demo History</h2>
          </div>
          {DEMO_HISTORY.map((d) => <DemoCard key={d.id} d={d} />)}
        </div>

      </div>
    </Layout>
  );
}
