import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  BookOpen, CheckCircle2, Clock, Brain, Flame,
  TrendingUp, ChevronRight, AlertTriangle, Star,
  Circle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer,
  Tooltip, CartesianGrid,
} from "recharts";

const SUBJECTS = [
  { name: "HTML & CSS", done: 8, total: 8, color: "#f97316", textColor: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  { name: "JavaScript", done: 7, total: 10, color: "#f59e0b", textColor: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { name: "React",      done: 6, total: 9, color: "#2563eb", textColor: "text-primary", bg: "bg-primary/5", border: "border-primary/20" },
  { name: "Node.js",    done: 4, total: 7, color: "#10b981", textColor: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { name: "SQL",        done: 3, total: 6, color: "#8b5cf6", textColor: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  { name: "DSA",        done: 2, total: 7, color: "#ec4899", textColor: "text-pink-600", bg: "bg-pink-50", border: "border-pink-200" },
  { name: "Python",     done: 1, total: 3, color: "#06b6d4", textColor: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200" },
];

const TOTAL_DONE  = SUBJECTS.reduce((s, x) => s + x.done, 0);
const TOTAL_MODS  = SUBJECTS.reduce((s, x) => s + x.total, 0);
const CCBP_PCT    = Math.round((TOTAL_DONE / TOTAL_MODS) * 100);

const CURRENT_MODULE  = { subject: "React", name: "useReducer & Context Pattern", pct: 30, estimatedTime: "2 hrs" };
const NEXT_MODULE     = { subject: "React", name: "React Router v6 — Dynamic Routes", pct: 0 };

const WEAK_MODULES = [
  { subject: "JS",   name: "Closures & Lexical Scope", score: 52, severity: "critical" },
  { subject: "DSA",  name: "Binary Search Trees", score: 61, severity: "warning" },
  { subject: "SQL",  name: "Window Functions & CTEs", score: 65, severity: "warning" },
];

const RECENT_COMPLETED = [
  { subject: "Node", name: "Node.js Streams & Buffers", completedOn: "Jun 26" },
  { subject: "React", name: "useCallback & useMemo", completedOn: "Jun 22" },
  { subject: "JS",    name: "ES6 Generators & Iterators", completedOn: "Jun 18" },
];

const WEEKLY_PROGRESS = [
  { week: "W1", modules: 2 }, { week: "W2", modules: 3 },
  { week: "W3", modules: 1 }, { week: "W4", modules: 4 },
  { week: "W5", modules: 2 }, { week: "W6", modules: 3 },
];

export default function SDICCBPPage() {
  return (
    <Layout>
      <div className="p-6 space-y-6">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">CCBP Progress</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Full curriculum tracker — {TOTAL_DONE}/{TOTAL_MODS} modules complete</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-200 bg-orange-50">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-bold text-orange-700">12-Day Streak</span>
            </div>
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 text-xs font-bold">{CCBP_PCT}% Complete</Badge>
          </div>
        </div>

        {/* Overall progress */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <div className="text-3xl font-black text-primary tabular-nums">{CCBP_PCT}%</div>
              <div className="text-sm text-muted-foreground">{TOTAL_DONE} of {TOTAL_MODS} modules complete</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Remaining</div>
              <div className="text-2xl font-bold text-foreground">{TOTAL_MODS - TOTAL_DONE}</div>
            </div>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${CCBP_PCT}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
            <span>0%</span><span>Target: 100% by Aug 2026</span><span>100%</span>
          </div>
        </GlassCard>

        {/* Subject Progress */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Subject-wise Progress</h2>
          </div>
          <div className="space-y-3.5">
            {SUBJECTS.map((s) => {
              const pct = Math.round((s.done / s.total) * 100);
              return (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.bg} ${s.textColor} border ${s.border}`}>{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">{s.done}/{s.total} modules</span>
                      <span className="font-bold tabular-nums" style={{ color: s.color }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Current + Next + Weak + Completed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Current Module */}
          <GlassCard className="p-4 border-primary/20 bg-primary/[0.01]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                <Circle className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">In Progress</span>
            </div>
            <div className="text-[10px] font-bold text-primary mb-1">{CURRENT_MODULE.subject}</div>
            <div className="text-sm font-semibold text-foreground leading-tight mb-2">{CURRENT_MODULE.name}</div>
            <div className="h-1.5 bg-muted rounded-full mb-1.5 overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${CURRENT_MODULE.pct}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{CURRENT_MODULE.pct}% done</span>
              <span>~{CURRENT_MODULE.estimatedTime} left</span>
            </div>
          </GlassCard>

          {/* Next Module */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Up Next</span>
            </div>
            <div className="text-[10px] font-bold text-muted-foreground mb-1">{NEXT_MODULE.subject}</div>
            <div className="text-sm font-semibold text-foreground leading-tight mb-3">{NEXT_MODULE.name}</div>
            <Button size="sm" variant="outline" className="w-full h-7 text-xs">Start Module</Button>
          </GlassCard>

          {/* Weak Areas */}
          <GlassCard className="p-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-foreground">Weak Areas — Need Revision</h3>
            </div>
            <div className="space-y-2.5">
              {WEAK_MODULES.map((m) => (
                <div key={m.name} className={`flex items-center gap-3 p-3 rounded-xl border ${m.severity === "critical" ? "border-red-200 bg-red-50/30" : "border-amber-200 bg-amber-50/30"}`}>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${m.severity === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{m.subject}</span>
                  <span className="flex-1 text-xs text-foreground">{m.name}</span>
                  <span className={`text-xs font-bold tabular-nums ${m.severity === "critical" ? "text-red-600" : "text-amber-600"}`}>{m.score}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Weekly Progress Chart + Recently Completed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <GlassCard className="p-5 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Weekly Module Completion</h2>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={WEEKLY_PROGRESS} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="modules" stroke="#2563eb" fill="url(#wGrad)" strokeWidth={2} name="Modules" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-foreground">Recently Completed</h3>
            </div>
            <div className="space-y-2.5">
              {RECENT_COMPLETED.map((m) => (
                <div key={m.name} className="flex items-start gap-2.5 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-foreground leading-tight">{m.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{m.subject} · {m.completedOn}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* AI Plan */}
        <GlassCard className="p-5 border-primary/20 bg-primary/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-primary mb-1">AI Learning Recommendation</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Focus on <strong className="text-foreground">JavaScript Closures</strong> first — your weakest area at 52%. After revision, move to completing the <strong className="text-foreground">Node.js module</strong> before your Jul 2 demo. DSA can wait until next week.</p>
            </div>
            <Link href="/sdi/ai-coach" className="text-xs text-primary hover:underline font-medium shrink-0 flex items-center gap-1">
              Get Plan <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </GlassCard>

      </div>
    </Layout>
  );
}
