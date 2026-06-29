import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3, CheckCircle2, Clock, Brain,
  TrendingUp, MessageSquare, BookOpen, Target,
  Users, FileText, Video, Zap, AlertTriangle,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from "recharts";

const TECH_OS_OVERALL = 74;

const SKILLS = [
  { name: "Standup Delivery",     score: 88, target: 90, icon: MessageSquare, color: "#2563eb", mastered: true },
  { name: "Session Preparation",  score: 72, target: 85, icon: BookOpen,      color: "#8b5cf6", mastered: false },
  { name: "Communication",        score: 68, target: 80, icon: Users,          color: "#f59e0b", mastered: false },
  { name: "Reporting",            score: 80, target: 85, icon: FileText,       color: "#10b981", mastered: true },
  { name: "Internal Workflows",   score: 77, target: 85, icon: Zap,            color: "#ec4899", mastered: true },
  { name: "Demo Handling",        score: 62, target: 80, icon: Video,          color: "#ef4444", mastered: false },
];

const RADAR_DATA = SKILLS.map((s) => ({ metric: s.name.split(" ")[0], value: s.score, full: 100 }));

const COMMUNICATION_BREAKDOWN = [
  { aspect: "Clarity",       score: 72 },
  { aspect: "Pace",          score: 78 },
  { aspect: "Confidence",    score: 65 },
  { aspect: "Technical Exp", score: 60 },
  { aspect: "Storytelling",  score: 55 },
];

const AI_INSIGHTS = [
  { type: "warning", text: "Demo handling score (62%) is below target — needs 2 practice sessions before next demo." },
  { type: "info",    text: "Communication is improving (+5% this month) but storytelling ability needs work." },
  { type: "warning", text: "Session preparation dipped after attendance issues. Recommend structured prep time." },
  { type: "positive",text: "Standup delivery is near-mastery. You are consistent and on-time 88% of the time." },
];

export default function SDITechOSPage() {
  const mastered = SKILLS.filter((s) => s.mastered).length;
  const pending  = SKILLS.filter((s) => !s.mastered).length;

  return (
    <Layout>
      <div className="p-6 space-y-6">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tech OS Mastery</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Operational skills — standups, communication, workflows, demo handling</p>
          </div>
          <Badge variant="outline" className={`text-base font-black px-3 py-1 ${TECH_OS_OVERALL >= 80 ? "text-emerald-700 border-emerald-200 bg-emerald-50" : "text-amber-700 border-amber-200 bg-amber-50"}`}>
            {TECH_OS_OVERALL}% Mastery
          </Badge>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Tech OS Score", value: `${TECH_OS_OVERALL}%`, color: "text-primary", bg: "bg-primary/5", border: "border-primary/20" },
            { label: "Skills Mastered", value: `${mastered}/${SKILLS.length}`, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
            { label: "Pending Skills", value: `${pending}`, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
          ].map(({ label, value, color, bg, border }) => (
            <GlassCard key={label} className={`p-5 border ${border} ${bg}`}>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Radar + Skills list */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Radar */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Skills Radar</h2>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="rgba(0,0,0,0.07)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Skills list */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Skills Breakdown</h2>
            </div>
            <div className="space-y-3.5">
              {SKILLS.map((s) => {
                const Icon = s.icon;
                const gap = s.target - s.score;
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: s.color }} />
                        <span className="text-xs text-foreground font-medium">{s.name}</span>
                        {s.mastered && <Badge variant="outline" className="text-[9px] text-emerald-700 border-emerald-200 bg-emerald-50 h-4 px-1">Mastered</Badge>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold tabular-nums" style={{ color: s.color }}>{s.score}%</span>
                        {gap > 0 && <span className="text-[10px] text-muted-foreground">/{s.target}%</span>}
                      </div>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${s.score}%`, backgroundColor: s.color }} />
                      {/* Target marker */}
                      <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/20" style={{ left: `${s.target}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Communication Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Communication Deep Dive</h2>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={COMMUNICATION_BREAKDOWN} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis type="category" dataKey="aspect" tick={{ fontSize: 10, fill: "#94a3b8" }} width={80} />
                <Tooltip />
                <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                  {COMMUNICATION_BREAKDOWN.map((d, i) => (
                    <Cell key={i} fill={d.score >= 75 ? "#10b981" : d.score >= 60 ? "#f59e0b" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* AI Insights */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">AI Insights</h2>
            </div>
            <div className="space-y-2.5">
              {AI_INSIGHTS.map((n, i) => (
                <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                  n.type === "warning"  ? "border-amber-200 bg-amber-50/40" :
                  n.type === "positive" ? "border-emerald-200 bg-emerald-50/40" :
                  "border-primary/20 bg-primary/[0.02]"
                }`}>
                  {n.type === "warning" ? <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" /> :
                   n.type === "positive" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" /> :
                   <Brain className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />}
                  <p className="text-xs text-foreground leading-relaxed">{n.text}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>
    </Layout>
  );
}
