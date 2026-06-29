import { useState } from "react";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarCheck, AlertCircle, CheckCircle2, Clock, XCircle,
  TrendingDown, Filter, ChevronLeft, ChevronRight,
} from "lucide-react";

const TRAINEES = [
  { id: "t1", name: "Rahul Verma", track: "React + Node", attendance: 62, absences: 2, late: 1, status: "absent", leave: false },
  { id: "t2", name: "Sai Krishna", track: "Python + ML", attendance: 85, absences: 0, late: 4, status: "present", leave: false },
  { id: "t3", name: "Kiran Patel", track: "React + Node", attendance: 78, absences: 1, late: 2, status: "present", leave: false },
  { id: "t8", name: "Pooja Menon", track: "React + Node", attendance: 48, absences: 4, late: 0, status: "on_leave", leave: true },
  { id: "t11", name: "Rohit Joshi", track: "Data Science", attendance: 41, absences: 5, late: 1, status: "absent", leave: false },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_DATA: Record<string, ("P" | "A" | "L" | "Late")[]> = {
  "t1":  ["P", "A", "P", "P", "A", "P", "P"],
  "t2":  ["Late", "P", "P", "Late", "P", "P", "P"],
  "t3":  ["P", "P", "Late", "P", "P", "P", "P"],
  "t8":  ["L", "L", "L", "L", "L", "L", "L"],
  "t11": ["A", "A", "P", "A", "A", "P", "A"],
};

const DAY_CELL: Record<string, { bg: string; text: string; label: string }> = {
  P:    { bg: "bg-emerald-100", text: "text-emerald-700", label: "P" },
  A:    { bg: "bg-red-100",     text: "text-red-700",     label: "A" },
  L:    { bg: "bg-blue-100",    text: "text-blue-700",    label: "L" },
  Late: { bg: "bg-amber-100",   text: "text-amber-700",   label: "Lt" },
};

const ALERTS = [
  { id: "t11", name: "Rohit Joshi", msg: "5 absences this week", severity: "high" as const },
  { id: "t8",  name: "Pooja Menon", msg: "On leave — 7 days", severity: "medium" as const },
  { id: "t1",  name: "Rahul Verma", msg: "2 absences + 1 late login", severity: "high" as const },
  { id: "t2",  name: "Sai Krishna", msg: "Late login 4 times", severity: "medium" as const },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AttendancePage() {
  return (
    <ProtectedRoute allowedRoles={["poc", "manager"]}>
      <Layout>
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <CalendarCheck className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
            </div>
            <p className="text-sm text-muted-foreground">Daily attendance tracking for Cohort-7 trainees</p>
          </div>
          <AttendanceContent />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function AttendanceContent() {
  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const [cohortFilter, setCohortFilter] = useState("Cohort-7");

  const displayMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const monthLabel = `${MONTHS[displayMonth.getMonth()]} ${displayMonth.getFullYear()}`;

  const present = TRAINEES.filter((t) => t.status === "present").length;
  const absent = TRAINEES.filter((t) => t.status === "absent").length;
  const leave = TRAINEES.filter((t) => t.leave).length;
  const late = TRAINEES.filter((t) => t.late > 0).length;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Present Today", value: present, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: "" },
          { label: "Absent Today",  value: absent,  icon: XCircle,      color: "text-red-500",     bg: "bg-red-50",     border: "border-red-200" },
          { label: "On Leave",      value: leave,   icon: CalendarCheck, color: "text-blue-500",   bg: "bg-blue-50",    border: "" },
          { label: "Late Logins",   value: late,    icon: Clock,         color: "text-amber-500",  bg: "bg-amber-50",   border: "border-amber-200" },
        ].map((k) => (
          <GlassCard key={k.label} className={`p-5 ${k.border}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-lg ${k.bg} flex items-center justify-center shrink-0`}>
                <k.icon className={`w-5 h-5 ${k.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold tabular-nums">{k.value}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{k.label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main attendance table */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
              <button onClick={() => setMonthOffset((m) => m - 1)} className="p-2 hover:bg-muted transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-semibold text-foreground min-w-[130px] text-center">{monthLabel}</span>
              <button onClick={() => setMonthOffset((m) => m + 1)} className="p-2 hover:bg-muted transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              {["Cohort-7", "Cohort-8", "All"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCohortFilter(c)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    cohortFilter === c ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly heatmap grid */}
          <GlassCard className="overflow-x-auto">
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="grid grid-cols-[1fr_repeat(7,_40px)] gap-2 items-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trainee</span>
                {DAYS.map((d) => (
                  <span key={d} className="text-xs font-semibold text-muted-foreground text-center">{d}</span>
                ))}
              </div>
            </div>
            <div className="divide-y divide-border">
              {TRAINEES.map((t) => {
                const week = WEEK_DATA[t.id] ?? [];
                return (
                  <div key={t.id} className="p-4">
                    <div className="grid grid-cols-[1fr_repeat(7,_40px)] gap-2 items-center">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.track}</div>
                      </div>
                      {week.map((day, i) => {
                        const style = DAY_CELL[day] ?? DAY_CELL["P"];
                        return (
                          <div key={i} className={`w-8 h-8 rounded-lg ${style.bg} ${style.text} flex items-center justify-center text-xs font-bold mx-auto`}>
                            {style.label}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-3 mt-2 ml-0.5">
                      <span className="text-xs text-muted-foreground">Overall: <span className={`font-semibold ${t.attendance < 65 ? "text-red-600" : t.attendance < 80 ? "text-amber-600" : "text-emerald-600"}`}>{t.attendance}%</span></span>
                      {t.absences > 0 && <span className="text-xs text-red-600">{t.absences} absent</span>}
                      {t.late > 0 && <span className="text-xs text-amber-600">{t.late} late</span>}
                      {t.leave && <span className="text-xs text-blue-600">On leave</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center gap-4 flex-wrap">
              {Object.entries(DAY_CELL).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded ${val.bg} ${val.text} flex items-center justify-center text-[10px] font-bold`}>{val.label}</div>
                  <span className="text-xs text-muted-foreground">{key === "P" ? "Present" : key === "A" ? "Absent" : key === "L" ? "Leave" : "Late"}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Standup attendance */}
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary" /> Standup Attendance — This Week
            </h3>
            <div className="space-y-2">
              {TRAINEES.map((t) => {
                const standupPct = t.attendance > 80 ? 90 : t.attendance > 60 ? 70 : 40;
                return (
                  <div key={t.id} className="flex items-center gap-3">
                    <span className="text-sm text-foreground w-32 shrink-0">{t.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${standupPct}%`,
                        backgroundColor: standupPct >= 80 ? "#10b981" : standupPct >= 60 ? "#f59e0b" : "#ef4444",
                      }} />
                    </div>
                    <span className={`text-xs font-semibold tabular-nums w-10 text-right ${standupPct >= 80 ? "text-emerald-600" : standupPct >= 60 ? "text-amber-600" : "text-red-600"}`}>
                      {standupPct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Alert panel */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Attendance Alerts</h2>
          </div>

          <div className="space-y-3">
            {ALERTS.map((a) => (
              <div key={a.id} className={`p-4 rounded-xl border ${a.severity === "high" ? "border-red-200 bg-red-50/30" : "border-amber-200 bg-amber-50/30"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-foreground">{a.name}</span>
                  <Badge variant="outline" className={`text-xs ${a.severity === "high" ? "text-red-700 border-red-200 bg-red-50" : "text-amber-700 border-amber-200 bg-amber-50"}`}>
                    {a.severity.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{a.msg}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs px-2">Follow Up</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs px-2">Dismiss</Button>
                </div>
              </div>
            ))}
          </div>

          {/* Trend */}
          <GlassCard className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" /> At-Risk Attendance
            </h3>
            <div className="space-y-2">
              {TRAINEES.filter((t) => t.attendance < 70).map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="text-sm text-foreground flex-1">{t.name}</span>
                  <span className="text-xs font-semibold text-red-600">{t.attendance}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
