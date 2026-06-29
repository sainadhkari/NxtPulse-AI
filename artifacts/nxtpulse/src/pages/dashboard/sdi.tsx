import { useState } from "react";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  BookOpen, Target, CalendarCheck, Zap, Award,
  Brain, CheckCircle2, Clock, Flame, Star, TrendingUp,
  TrendingDown, ChevronRight, Circle, Activity, Bot,
  AlertTriangle, Sparkles, BarChart3,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer,
  Tooltip, CartesianGrid,
} from "recharts";
import { useGetLatestLearnGuardEvaluation } from "@workspace/api-client-react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const SDI_PROFILE = {
  name: "Arjun Kumar",
  cohort: "Cohort-7",
  track: "React + Node",
  attendance: 85,
  ccbp: { done: 31, total: 50 },
  techOS: 74,
  demoScore: 78,
  aiDependency: 34,
  readiness: 72,
  streak: 12,
  bestStreak: 21,
};

const WEEKLY_GROWTH = [
  { week: "W1", demo: 62, learning: 58, readiness: 55 },
  { week: "W2", demo: 67, learning: 62, readiness: 60 },
  { week: "W3", demo: 70, learning: 67, readiness: 64 },
  { week: "W4", demo: 73, learning: 70, readiness: 68 },
  { week: "W5", demo: 75, learning: 74, readiness: 70 },
  { week: "W6", demo: 78, learning: 78, readiness: 72 },
];

const TODAYS_TASKS = [
  { label: "Complete Node.js module — Streams & Buffers", done: true,  priority: "high" },
  { label: "Prepare demo slides for React Hooks presentation", done: false, priority: "high" },
  { label: "Practice 30 mins without AI assistance", done: false, priority: "medium" },
  { label: "Review SQL Joins weak area", done: false, priority: "medium" },
  { label: "Attend 10:00 AM standup", done: true,  priority: "low" },
];

const UPCOMING_DEMOS = [
  { topic: "React Hooks — useMemo & useCallback", date: "Jun 29, 2026", time: "2:00 PM", type: "technical", status: "scheduled" },
  { topic: "Node.js Streams & Buffer APIs", date: "Jul 2, 2026", time: "3:00 PM", type: "technical", status: "upcoming" },
  { topic: "SQL Joins & Subqueries", date: "Jul 5, 2026", time: "11:00 AM", type: "assessment", status: "upcoming" },
];

const AI_RECOMMENDATIONS = [
  { text: "Revise JavaScript Closures — scored 52% in last evaluation", type: "critical", icon: Brain },
  { text: "Practice demo communication — reduce filler words", type: "warning", icon: Target },
  { text: "Reduce AI dependency further — currently at 34%, target is 20%", type: "warning", icon: Activity },
  { text: "Complete pending Node.js modules before Jul 2 demo", type: "info", icon: BookOpen },
];

const PENDING_MODULES = [
  { name: "Node.js — Streams & Buffers", subject: "Node", pct: 60, dueIn: "2 days" },
  { name: "React — useReducer Pattern", subject: "React", pct: 30, dueIn: "4 days" },
  { name: "SQL — Window Functions", subject: "SQL", pct: 0, dueIn: "7 days" },
  { name: "DSA — Binary Search Trees", subject: "DSA", pct: 0, dueIn: "10 days" },
];

const BADGES = [
  { label: "12-Day Streak", icon: Flame, color: "text-orange-600 bg-orange-50 border-orange-200", unlocked: true },
  { label: "Demo Improver", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50 border-emerald-200", unlocked: true },
  { label: "AI Independent", icon: Zap, color: "text-violet-600 bg-violet-50 border-violet-200", unlocked: true },
  { label: "Perfect Attendance", icon: Star, color: "text-amber-600 bg-amber-50 border-amber-200", unlocked: false },
  { label: "Demo Topper", icon: Award, color: "text-blue-600 bg-blue-50 border-blue-200", unlocked: false },
  { label: "Fast Learner", icon: Sparkles, color: "text-pink-600 bg-pink-50 border-pink-200", unlocked: false },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg p-2.5 shadow-md text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}%</strong></p>
      ))}
    </div>
  );
};

export default function SDIDashboard() {
  return (
    <ProtectedRoute allowedRoles={["sdi", "manager", "poc"]}>
      <Layout>
        <div className="p-6 space-y-6 overflow-y-auto h-screen">
          <DashboardContent />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { data: evaluation } = useGetLatestLearnGuardEvaluation();
  const ccbpPct = Math.round((SDI_PROFILE.ccbp.done / SDI_PROFILE.ccbp.total) * 100);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{getGreeting()}, {SDI_PROFILE.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{SDI_PROFILE.track} · {SDI_PROFILE.cohort} · Technical Growth Platform</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Streak */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-200 bg-orange-50">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-700">{SDI_PROFILE.streak}-Day Streak</span>
          </div>
          {/* Readiness */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${SDI_PROFILE.readiness >= 80 ? "border-emerald-200 bg-emerald-50" : SDI_PROFILE.readiness >= 60 ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50"}`}>
            <Award className={`w-4 h-4 ${SDI_PROFILE.readiness >= 80 ? "text-emerald-600" : SDI_PROFILE.readiness >= 60 ? "text-amber-600" : "text-red-600"}`} />
            <span className={`text-sm font-bold ${SDI_PROFILE.readiness >= 80 ? "text-emerald-700" : SDI_PROFILE.readiness >= 60 ? "text-amber-700" : "text-red-700"}`}>{SDI_PROFILE.readiness}% Instructor Ready</span>
          </div>
        </div>
      </div>

      {/* ── Daily AI Brief ── */}
      <div className="flex items-start gap-4 p-5 rounded-2xl border border-primary/20 bg-primary/[0.02]">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">AI Daily Brief</span>
            <span className="text-xs text-muted-foreground">— Jun 28, 2026</span>
          </div>
          <p className="text-sm text-foreground font-medium mb-1">Your React Hooks demo is tomorrow. Focus on demo prep today.</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {["Complete Node module", "Demo prep", "Practice no-AI coding", "Revise Closures"].map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-lg border border-primary/20 bg-primary/5 text-primary font-medium">{t}</span>
            ))}
          </div>
        </div>
        <Link href="/sdi/ai-coach" className="text-xs text-primary hover:underline font-medium shrink-0 flex items-center gap-1">
          Open AI Coach <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Attendance", value: SDI_PROFILE.attendance, suffix: "%", icon: CalendarCheck, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", trend: -3, href: "/sdi/attendance" },
          { label: "CCBP Progress", value: ccbpPct, suffix: "%", sub: `${SDI_PROFILE.ccbp.done}/${SDI_PROFILE.ccbp.total}`, icon: BookOpen, color: "text-primary", bg: "bg-primary/5", border: "border-primary/20", trend: +5, href: "/sdi/ccbp" },
          { label: "Tech OS", value: SDI_PROFILE.techOS, suffix: "%", icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", trend: +2, href: "/sdi/tech-os" },
          { label: "Demo Score", value: SDI_PROFILE.demoScore, suffix: "%", icon: Target, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", trend: +6, href: "/sdi/demo-performance" },
          { label: "AI Dependency", value: SDI_PROFILE.aiDependency, suffix: "%", icon: Zap, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", trend: -8, href: "/sdi/learnguard", lower: true },
        ].map(({ label, value, suffix, sub, icon: Icon, color, bg, border, trend, href, lower }) => (
          <Link key={label} href={href}>
            <GlassCard className={`p-4 cursor-pointer hover:shadow-sm transition-shadow border-l-4 ${border}`}>
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className={`text-2xl font-bold tabular-nums ${color}`}>{value}{suffix}</div>
              {sub && <div className="text-[10px] text-muted-foreground">{sub} modules</div>}
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              <div className={`text-[10px] flex items-center gap-0.5 mt-1 font-medium ${
                lower ? (trend < 0 ? "text-emerald-600" : "text-red-600") : (trend > 0 ? "text-emerald-600" : "text-red-600")
              }`}>
                {trend > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {Math.abs(trend)}% this week
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Today's Tasks */}
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Today's Tasks</h2>
            <span className="ml-auto text-xs text-muted-foreground">
              {TODAYS_TASKS.filter((t) => t.done).length}/{TODAYS_TASKS.length} done
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(TODAYS_TASKS.filter((t) => t.done).length / TODAYS_TASKS.length) * 100}%` }} />
          </div>
          <div className="space-y-2.5">
            {TODAYS_TASKS.map((task, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                task.done ? "border-emerald-200 bg-emerald-50/40" : "border-border bg-card"
              }`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  task.done ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/30"
                }`}>
                  {task.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm flex-1 ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {task.label}
                </span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                  task.priority === "high" ? "text-red-700 border-red-200 bg-red-50" :
                  task.priority === "medium" ? "text-amber-700 border-amber-200 bg-amber-50" :
                  "text-muted-foreground border-border bg-muted/40"
                }`}>{task.priority}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Upcoming Demos */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <Target className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Upcoming Demos</h2>
          </div>
          <div className="space-y-3">
            {UPCOMING_DEMOS.map((d, i) => (
              <div key={i} className={`p-3.5 rounded-xl border ${i === 0 ? "border-amber-200 bg-amber-50/40" : "border-border bg-card"}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-foreground leading-tight">{d.topic}</span>
                  {i === 0 && <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">TOMORROW</span>}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Clock className="w-3 h-3" /> {d.date} · {d.time}
                </div>
                <div className="mt-2">
                  <Link href="/sdi/demo-performance" className="text-[10px] text-primary hover:underline font-medium">Prepare →</Link>
                </div>
              </div>
            ))}
          </div>
          <Button size="sm" variant="outline" className="w-full mt-3 h-7 text-xs gap-1" asChild>
            <Link href="/sdi/demo-performance"><Target className="w-3 h-3" /> All Demos</Link>
          </Button>
        </GlassCard>
      </div>

      {/* ── Growth chart + AI Recommendations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Weekly Growth Chart */}
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">6-Week Growth Trend</h2>
            <div className="ml-auto flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-primary inline-block rounded" /> Demo</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-amber-500 inline-block rounded" /> Learning</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-emerald-500 inline-block rounded" /> Readiness</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={WEEKLY_GROWTH} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                {[["dGrad","#2563eb"],["lGrad","#f59e0b"],["rGrad","#10b981"]].map(([id, c]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={c} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="demo" stroke="#2563eb" fill="url(#dGrad)" strokeWidth={2} name="Demo" />
              <Area type="monotone" dataKey="learning" stroke="#f59e0b" fill="url(#lGrad)" strokeWidth={2} name="Learning" />
              <Area type="monotone" dataKey="readiness" stroke="#10b981" fill="url(#rGrad)" strokeWidth={2} name="Readiness" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* AI Recommendations */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">AI Recommendations</h2>
          </div>
          <div className="space-y-2.5">
            {AI_RECOMMENDATIONS.map((r, i) => {
              const Icon = r.icon;
              return (
                <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                  r.type === "critical" ? "border-red-200 bg-red-50/40" :
                  r.type === "warning" ? "border-amber-200 bg-amber-50/40" :
                  "border-primary/20 bg-primary/[0.02]"
                }`}>
                  <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${r.type === "critical" ? "text-red-600" : r.type === "warning" ? "text-amber-600" : "text-primary"}`} />
                  <p className="text-xs text-foreground leading-relaxed">{r.text}</p>
                </div>
              );
            })}
          </div>
          <Button size="sm" variant="outline" className="w-full mt-3 h-7 text-xs gap-1" asChild>
            <Link href="/sdi/ai-coach"><Bot className="w-3 h-3" /> Ask AI Coach</Link>
          </Button>
        </GlassCard>
      </div>

      {/* ── Pending Modules + Achievement Badges ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Pending Modules */}
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Pending Modules</h2>
            <span className="ml-auto text-xs text-muted-foreground">{PENDING_MODULES.length} remaining</span>
          </div>
          <div className="space-y-3">
            {PENDING_MODULES.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card">
                <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-center shrink-0 text-[10px] font-bold text-primary">{m.subject}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">{m.name}</div>
                  <div className="h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-muted-foreground tabular-nums">{m.pct}%</div>
                  <div className="text-[10px] text-muted-foreground/60">Due in {m.dueIn}</div>
                </div>
              </div>
            ))}
          </div>
          <Button size="sm" variant="outline" className="w-full mt-3 h-7 text-xs gap-1" asChild>
            <Link href="/sdi/ccbp"><BookOpen className="w-3 h-3" /> Full CCBP Progress</Link>
          </Button>
        </GlassCard>

        {/* Achievement Badges */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Achievements</h2>
            <span className="ml-auto text-xs text-muted-foreground">{BADGES.filter((b) => b.unlocked).length}/{BADGES.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {BADGES.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.label} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-opacity ${b.unlocked ? b.color : "border-border bg-muted/20 text-muted-foreground/30 opacity-40"}`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-semibold leading-tight">{b.label}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
