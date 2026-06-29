import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Award, Brain, Target, CheckCircle2, AlertTriangle,
  TrendingUp, Clock, ChevronRight, Star, Zap,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, AreaChart, Area,
  XAxis, YAxis, CartesianGrid,
} from "recharts";

const READINESS = 72;

const DIMENSIONS = [
  { name: "Technical Mastery",   score: 78, weight: 30, icon: Brain,         required: 85, color: "#2563eb" },
  { name: "Communication",       score: 68, weight: 20, icon: Target,         required: 80, color: "#f59e0b" },
  { name: "Demo Performance",    score: 78, weight: 25, icon: Award,          required: 80, color: "#8b5cf6" },
  { name: "AI Independence",     score: 66, weight: 15, icon: Zap,            required: 75, color: "#10b981" },
  { name: "Teaching Readiness",  score: 62, weight: 10, icon: Star,           required: 80, color: "#ec4899" },
];

const RADAR_DATA = DIMENSIONS.map((d) => ({ metric: d.name.split(" ")[0], value: d.score, target: d.required }));

const READINESS_TREND = [
  { week: "W1", score: 55 }, { week: "W2", score: 58 }, { week: "W3", score: 62 },
  { week: "W4", score: 65 }, { week: "W5", score: 68 }, { week: "W6", score: 72 },
];

const CHECKLIST = [
  { label: "Attendance ≥ 90%",                checked: false, actual: "85%" },
  { label: "CCBP 100% complete",              checked: false, actual: "62%" },
  { label: "Demo Score ≥ 80%",               checked: false, actual: "78%" },
  { label: "AI Dependency ≤ 25%",            checked: false, actual: "34%" },
  { label: "Tech OS Mastery ≥ 80%",          checked: false, actual: "74%" },
  { label: "Communication Score ≥ 80%",      checked: false, actual: "68%" },
  { label: "Teaching Readiness ≥ 80%",       checked: false, actual: "62%" },
  { label: "LearnGuard Average ≥ 75%",       checked: false, actual: "71%" },
  { label: "Pass all scheduled demos",        checked: true,  actual: "3/4 passed" },
  { label: "Complete AI Practice Lab sessions", checked: true, actual: "5 sessions done" },
];

const STATUS = READINESS >= 85 ? "ready" : READINESS >= 70 ? "almost" : "improving";
const STATUS_CONFIG = {
  ready:    { label: "Instructor Ready",  color: "text-emerald-700 border-emerald-200 bg-emerald-50", badge: "bg-emerald-600" },
  almost:   { label: "Almost Ready",      color: "text-amber-700 border-amber-200 bg-amber-50",       badge: "bg-amber-500" },
  improving:{ label: "Needs Improvement", color: "text-red-700 border-red-200 bg-red-50",             badge: "bg-red-600" },
};

const checkedCount = CHECKLIST.filter((c) => c.checked).length;

export default function SDIInstructorReadinessPage() {
  const sc = STATUS_CONFIG[STATUS];
  const gapToReady = 85 - READINESS;

  return (
    <Layout>
      <div className="p-6 space-y-6">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Instructor Readiness</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Your comprehensive readiness evaluation for becoming an instructor</p>
          </div>
          <Badge variant="outline" className={`text-sm font-bold px-4 py-1.5 ${sc.color}`}>{sc.label}</Badge>
        </div>

        {/* Hero Readiness Score */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-5">
              {/* Circular-ish score display */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#2563eb" strokeWidth="10"
                    strokeDasharray={`${READINESS * 2.51} 251`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-foreground tabular-nums">{READINESS}%</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Ready</span>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground mb-1">Instructor Readiness Score</h2>
                <Badge variant="outline" className={`text-xs font-bold ${sc.color}`}>{sc.label}</Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  {gapToReady > 0 ? `${gapToReady}% gap to reach "Instructor Ready" threshold (85%)` : "You've crossed the readiness threshold!"}
                </p>
              </div>
            </div>
            {/* AI Prediction */}
            <div className="p-4 rounded-2xl border border-primary/20 bg-primary/[0.02] max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary">AI Prediction</span>
              </div>
              <p className="text-sm text-foreground font-semibold mb-1">Likely instructor-ready in <span className="text-primary">~3 weeks</span></p>
              <p className="text-xs text-muted-foreground leading-relaxed">Focus on Communication, AI Independence, and completing CCBP to accelerate readiness. Current growth rate: +3.5% per week.</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
              <span>0% — Needs Work</span>
              <span className="text-amber-600 font-semibold">70% — Almost Ready</span>
              <span className="text-emerald-600 font-semibold">85%+ — Ready</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden relative">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${READINESS}%` }} />
              {/* Threshold line */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-500" style={{ left: "85%" }} />
            </div>
          </div>
        </GlassCard>

        {/* Dimensions radar + trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Dimension Radar</h2>
              <span className="text-[10px] text-muted-foreground ml-auto">vs 85% target</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="rgba(0,0,0,0.07)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} strokeWidth={2} name="Current" />
                <Radar dataKey="target" stroke="#10b981" fill="none" strokeDasharray="4 4" strokeWidth={1.5} name="Target" />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-semibold text-foreground">Readiness Trend</h2>
              <span className="text-xs text-emerald-600 font-bold ml-auto">+17% in 6 weeks</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={READINESS_TREND} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis domain={[40, 90]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#2563eb" fill="url(#rGrad)" strokeWidth={2} name="Readiness %" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-3 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs text-emerald-700 font-medium">
              📈 At this rate, you'll hit 85% (Instructor Ready) by mid-July 2026.
            </div>
          </GlassCard>
        </div>

        {/* Dimension Breakdown */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Dimension Breakdown</h2>
          </div>
          <div className="space-y-4">
            {DIMENSIONS.map((d) => {
              const Icon = d.icon;
              const gap = d.required - d.score;
              const met = d.score >= d.required;
              return (
                <div key={d.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: d.color }} />
                      <span className="text-sm font-medium text-foreground">{d.name}</span>
                      <span className="text-[10px] text-muted-foreground">({d.weight}% weight)</span>
                      {met && <Badge variant="outline" className="text-[9px] text-emerald-700 border-emerald-200 bg-emerald-50">Met</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold tabular-nums" style={{ color: d.color }}>{d.score}%</span>
                      {gap > 0 && <span className="text-[10px] text-muted-foreground">need +{gap}%</span>}
                    </div>
                  </div>
                  <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${d.score}%`, backgroundColor: d.color }} />
                    <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/20" style={{ left: `${d.required}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Readiness Checklist */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Instructor Readiness Checklist</h2>
            <span className="ml-auto text-xs text-muted-foreground">{checkedCount}/{CHECKLIST.length} met</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {CHECKLIST.map((c, i) => (
              <div key={i} className={`flex items-center gap-2.5 p-3 rounded-xl border ${c.checked ? "border-emerald-200 bg-emerald-50/30" : "border-red-200 bg-red-50/20"}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${c.checked ? "border-emerald-500 bg-emerald-500" : "border-red-400"}`}>
                  {c.checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-medium ${c.checked ? "text-foreground" : "text-foreground"}`}>{c.label}</span>
                </div>
                <span className={`text-[10px] font-semibold shrink-0 ${c.checked ? "text-emerald-600" : "text-red-600"}`}>{c.actual}</span>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>
    </Layout>
  );
}
