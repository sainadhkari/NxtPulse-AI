import { useState } from "react";
import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck, AlertTriangle, TrendingDown, TrendingUp,
  Clock, Brain, CheckCircle2, X, Minus,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer,
  Tooltip, CartesianGrid, BarChart, Bar, Cell,
} from "recharts";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Jun 2026 — status per day (working days only)
type DayStatus = "present" | "absent" | "leave" | "late" | "weekend" | "future";
const JUNE_DATA: { day: number; status: DayStatus }[] = [
  { day: 1, status: "present" }, { day: 2, status: "present" }, { day: 3, status: "present" },
  { day: 4, status: "present" }, { day: 5, status: "present" }, { day: 6, status: "weekend" },
  { day: 7, status: "weekend" }, { day: 8, status: "present" }, { day: 9, status: "absent" },
  { day: 10, status: "present" }, { day: 11, status: "present" }, { day: 12, status: "late" },
  { day: 13, status: "weekend" }, { day: 14, status: "weekend" }, { day: 15, status: "present" },
  { day: 16, status: "present" }, { day: 17, status: "present" }, { day: 18, status: "leave" },
  { day: 19, status: "leave" }, { day: 20, status: "weekend" }, { day: 21, status: "weekend" },
  { day: 22, status: "present" }, { day: 23, status: "absent" }, { day: 24, status: "present" },
  { day: 25, status: "late" }, { day: 26, status: "present" }, { day: 27, status: "weekend" },
  { day: 28, status: "weekend" }, { day: 29, status: "future" }, { day: 30, status: "future" },
];

const STATUS_CONFIG: Record<DayStatus, { bg: string; text: string; border: string; label: string }> = {
  present: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", label: "Present" },
  absent:  { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200",     label: "Absent" },
  leave:   { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200",   label: "Leave" },
  late:    { bg: "bg-orange-100",  text: "text-orange-700",  border: "border-orange-200",  label: "Late" },
  weekend: { bg: "bg-muted/30",    text: "text-muted-foreground/30", border: "border-transparent", label: "Weekend" },
  future:  { bg: "bg-muted/10",    text: "text-muted-foreground/20", border: "border-dashed border-border/30", label: "—" },
};

const TREND_DATA = [
  { month: "Feb", pct: 95 }, { month: "Mar", pct: 92 }, { month: "Apr", pct: 90 },
  { month: "May", pct: 88 }, { month: "Jun", pct: 85 },
];

const STANDUP_WEEK = [
  { day: "Mon", attended: true,  note: "On time — discussed blockers" },
  { day: "Tue", attended: true,  note: "On time — demo prep update" },
  { day: "Wed", attended: false, note: "Absent — no prior notice" },
  { day: "Thu", attended: true,  note: "Late by 8 min" },
  { day: "Fri", attended: true,  note: "On time" },
];

const working = JUNE_DATA.filter((d) => d.status !== "weekend" && d.status !== "future");
const presentCount = JUNE_DATA.filter((d) => d.status === "present").length;
const absentCount  = JUNE_DATA.filter((d) => d.status === "absent").length;
const leaveCount   = JUNE_DATA.filter((d) => d.status === "leave").length;
const lateCount    = JUNE_DATA.filter((d) => d.status === "late").length;
const totalWorking = working.filter((d) => d.status !== "future").length;
const attPct = Math.round(((presentCount + lateCount) / totalWorking) * 100);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg p-2.5 shadow-md text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.value}%</p>
      ))}
    </div>
  );
};

export default function SDIAttendancePage() {
  const firstDayOfWeek = 1; // June 1 2026 is a Monday

  return (
    <Layout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track your presence, leaves, and standup participation</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Present Days",  value: presentCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-l-emerald-500" },
            { label: "Absent Days",   value: absentCount,  icon: X,            color: "text-red-600",     bg: "bg-red-50",     border: "border-l-red-500" },
            { label: "Leave Days",    value: leaveCount,   icon: Minus,        color: "text-amber-600",   bg: "bg-amber-50",   border: "border-l-amber-500" },
            { label: "Attendance %",  value: `${attPct}%`, icon: CalendarCheck,color: "text-primary",     bg: "bg-primary/5",  border: "border-l-primary" },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <GlassCard key={label} className={`p-5 border-l-4 ${border}`}>
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Monthly Calendar */}
          <GlassCard className="p-5 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <CalendarCheck className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">June 2026 — Attendance Calendar</h2>
            </div>
            {/* Day labels */}
            <div className="grid grid-cols-7 mb-1">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {JUNE_DATA.map(({ day, status }) => {
                const cfg = STATUS_CONFIG[status];
                return (
                  <div key={day} title={`Jun ${day} — ${cfg.label}`}
                    className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    {status !== "weekend" && status !== "future" ? day : (
                      <span className="text-[9px] opacity-40">{day}</span>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border">
              {(["present","absent","leave","late"] as DayStatus[]).map((s) => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <div key={s} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded ${cfg.bg} border ${cfg.border}`} />
                    <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Stats + AI Insight */}
          <div className="space-y-4">
            {/* AI Insight */}
            <GlassCard className="p-5 border-amber-200 bg-amber-50/10">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-foreground">AI Insight</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Attendance Declining</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Dropped from 92% to 85% over 4 months. 2 missed standups this week correlated with lower demo score.</p>
                </div>
                <div className="p-3 rounded-xl border border-red-200 bg-red-50/40">
                  <p className="text-xs font-semibold text-red-700 mb-1">Risk: Demo Impact</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Attendance below 90% may affect your Instructor Readiness score. Target 95% this month.</p>
                </div>
              </div>
            </GlassCard>

            {/* This week standups */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">This Week — Standups</h3>
              </div>
              <div className="space-y-2">
                {STANDUP_WEEK.map((s) => (
                  <div key={s.day} className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${s.attended ? "border-emerald-200 bg-emerald-50/30" : "border-red-200 bg-red-50/30"}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${s.attended ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                      {s.attended ? "✓" : "✗"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground">{s.day}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{s.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Trend Chart */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-semibold text-foreground">Attendance Trend — Feb to Jun 2026</h2>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={TREND_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis domain={[75, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="pct" stroke="#2563eb" fill="url(#attGrad)" strokeWidth={2} name="Attendance %" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

      </div>
    </Layout>
  );
}
