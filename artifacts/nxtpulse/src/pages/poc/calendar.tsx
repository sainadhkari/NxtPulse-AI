import { useState } from "react";
import {
  ChevronLeft, ChevronRight, CalendarDays, Clock,
  Plus, AlertTriangle, CheckCircle2, X, Video,
  MessageSquare, BookOpen, UserX, PhoneCall
} from "lucide-react";
import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

type EventType = "standup" | "syncup" | "demo" | "followup" | "leave" | "assessment";
type ViewMode = "daily" | "weekly" | "monthly";

interface CalEvent {
  id: string;
  type: EventType;
  title: string;
  trainee?: string;
  cohort?: string;
  time: string;
  date: string; // YYYY-MM-DD
  duration?: string;
  notes?: string;
  status: "upcoming" | "completed" | "missed";
}

const EVENT_CFG: Record<EventType, { color: string; bg: string; border: string; dot: string; icon: typeof Clock; label: string }> = {
  standup:    { color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200",    dot: "bg-blue-500",    icon: MessageSquare, label: "Standup" },
  syncup:     { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", icon: Video,         label: "Sync-up" },
  demo:       { color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   dot: "bg-amber-500",   icon: BookOpen,      label: "Demo" },
  followup:   { color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200",     dot: "bg-red-500",     icon: AlertTriangle, label: "Follow-up" },
  leave:      { color: "text-muted-foreground", bg: "bg-muted/40", border: "border-border",   dot: "bg-gray-400",    icon: UserX,         label: "Leave" },
  assessment: { color: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200",  dot: "bg-violet-500",  icon: BookOpen,      label: "Assessment" },
};

const BASE_DATE = "2026-06-";
const EVENTS: CalEvent[] = [
  // Monday Jun 29
  { id: "e1",  type: "standup",    title: "Standup — Cohort-7",  cohort: "Cohort-7", time: "10:00 AM", date: "2026-06-28", duration: "30 min",  status: "completed" },
  { id: "e2",  type: "syncup",     title: "Rahul Verma Sync-up", trainee: "Rahul Verma",   cohort: "Cohort-7", time: "3:00 PM",  date: "2026-06-28", duration: "45 min",  status: "upcoming" },
  { id: "e3",  type: "syncup",     title: "Vikram Singh Sync-up",trainee: "Vikram Singh",  cohort: "Cohort-8", time: "5:00 PM",  date: "2026-06-28", duration: "45 min",  status: "upcoming" },
  { id: "e4",  type: "standup",    title: "Standup — Cohort-8",  cohort: "Cohort-8", time: "10:30 AM", date: "2026-06-29", duration: "30 min",  status: "upcoming" },
  { id: "e5",  type: "syncup",     title: "Sai Krishna Sync-up", trainee: "Sai Krishna",   cohort: "Cohort-7", time: "10:00 AM", date: "2026-06-29", duration: "45 min",  status: "upcoming" },
  { id: "e6",  type: "demo",       title: "Demo Review — Meena", trainee: "Meena Iyer",    cohort: "Cohort-6", time: "2:00 PM",  date: "2026-06-29", duration: "1 hr",    status: "upcoming" },
  { id: "e7",  type: "followup",   title: "Rohit Follow-up",     trainee: "Rohit Joshi",   cohort: "Cohort-7", time: "4:30 PM",  date: "2026-06-29", duration: "30 min",  status: "upcoming", notes: "Critical — attendance 41%" },
  { id: "e8",  type: "standup",    title: "Standup — Cohort-7",  cohort: "Cohort-7", time: "10:00 AM", date: "2026-06-30", duration: "30 min",  status: "upcoming" },
  { id: "e9",  type: "assessment", title: "JS Assessment — C7",  cohort: "Cohort-7", time: "11:00 AM", date: "2026-06-30", duration: "2 hrs",   status: "upcoming" },
  { id: "e10", type: "syncup",     title: "Arjun Das Sync-up",   trainee: "Arjun Das",     cohort: "Cohort-8", time: "11:00 AM", date: "2026-06-30", duration: "45 min",  status: "upcoming" },
  { id: "e11", type: "demo",       title: "Demo — Sai Krishna",  trainee: "Sai Krishna",   cohort: "Cohort-7", time: "2:00 PM",  date: "2026-06-30", duration: "1 hr",    status: "upcoming", notes: "Score 55% — low readiness" },
  { id: "e12", type: "standup",    title: "Standup — Cohort-8",  cohort: "Cohort-8", time: "10:30 AM", date: "2026-07-01", duration: "30 min",  status: "upcoming" },
  { id: "e13", type: "syncup",     title: "Deepa Nair Sync-up",  trainee: "Deepa Nair",    cohort: "Cohort-8", time: "2:00 PM",  date: "2026-07-01", duration: "45 min",  status: "upcoming" },
  { id: "e14", type: "leave",      title: "Ananya — Leave",      trainee: "Ananya Reddy",  cohort: "Cohort-8", time: "All day",  date: "2026-07-01",                       status: "upcoming" },
  { id: "e15", type: "standup",    title: "Standup — All",       cohort: "All",      time: "10:00 AM", date: "2026-07-02", duration: "30 min",  status: "upcoming" },
  { id: "e16", type: "followup",   title: "Pooja Follow-up",     trainee: "Pooja Menon",   cohort: "Cohort-7", time: "3:00 PM",  date: "2026-07-02", duration: "30 min",  status: "upcoming" },
  { id: "e17", type: "demo",       title: "Demo — Kiran Patel",  trainee: "Kiran Patel",   cohort: "Cohort-7", time: "11:00 AM", date: "2026-07-01", duration: "1 hr",    status: "upcoming" },
  // past missed
  { id: "e18", type: "syncup",     title: "Rohit Joshi Sync-up", trainee: "Rohit Joshi",   cohort: "Cohort-7", time: "4:00 PM",  date: "2026-06-24", duration: "45 min",  status: "missed" },
  { id: "e19", type: "standup",    title: "Standup — Cohort-7",  cohort: "Cohort-7", time: "10:00 AM", date: "2026-06-26", duration: "30 min",  status: "completed" },
];

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_FULL  = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS     = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const HOURS      = ["8 AM","9 AM","10 AM","11 AM","12 PM","1 PM","2 PM","3 PM","4 PM","5 PM","6 PM"];
const HOUR_VALUES = [8,9,10,11,12,13,14,15,16,17,18];

function dateToStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function parseHour(time: string): number {
  if (time === "All day") return 8;
  const [h, period] = time.split(" ");
  const [hr] = h.split(":");
  let n = parseInt(hr);
  if (period === "PM" && n !== 12) n += 12;
  if (period === "AM" && n === 12) n = 0;
  return n;
}

function getWeekDates(base: Date): Date[] {
  const d = new Date(base);
  d.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(d);
    dd.setDate(d.getDate() + i);
    return dd;
  });
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function EventChip({ ev, compact }: { ev: CalEvent; compact?: boolean }) {
  const cfg = EVENT_CFG[ev.type];
  const Icon = cfg.icon;
  const isCompleted = ev.status === "completed";
  const isMissed = ev.status === "missed";
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium leading-tight ${cfg.bg} ${cfg.border} ${cfg.color} ${isCompleted ? "opacity-60" : ""} ${isMissed ? "opacity-50 line-through" : ""}`}>
      <Icon className="w-3 h-3 shrink-0" />
      <span className="truncate">{compact ? ev.title.split("—")[0].trim() : ev.title}</span>
      {!compact && <span className="text-[10px] opacity-70 shrink-0 ml-auto">{ev.time}</span>}
    </div>
  );
}

function RightPanel({ selectedDate }: { selectedDate: Date }) {
  const todayStr = dateToStr(selectedDate);
  const todayEvents = EVENTS.filter((e) => e.date === todayStr).sort((a, b) => parseHour(a.time) - parseHour(b.time));
  const upcoming = EVENTS.filter((e) => e.date > todayStr && e.status === "upcoming")
    .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const missed = EVENTS.filter((e) => e.status === "missed");

  return (
    <div className="space-y-4">
      {/* Legend */}
      <GlassCard className="p-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Event Types</div>
        <div className="space-y-1.5">
          {(Object.entries(EVENT_CFG) as [EventType, typeof EVENT_CFG[EventType]][]).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
              <span className="text-xs text-muted-foreground">{cfg.label}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Today's Events */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Today's Events</span>
          <span className="text-xs text-muted-foreground ml-auto">{todayEvents.length}</span>
        </div>
        {todayEvents.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">No events today</p>
        ) : (
          <div className="space-y-2">
            {todayEvents.map((ev) => {
              const cfg = EVENT_CFG[ev.type];
              const Icon = cfg.icon;
              return (
                <div key={ev.id} className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${cfg.border} ${cfg.bg}`}>
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${cfg.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold truncate ${cfg.color}`}>{ev.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {ev.time} {ev.duration && `· ${ev.duration}`}
                    </div>
                    {ev.notes && <div className="text-[10px] text-red-600 mt-0.5">{ev.notes}</div>}
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${ev.status === "completed" ? "bg-emerald-500" : ev.status === "missed" ? "bg-red-500" : cfg.dot}`} />
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Upcoming */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold text-foreground">Upcoming Events</span>
        </div>
        <div className="space-y-2">
          {upcoming.map((ev) => {
            const cfg = EVENT_CFG[ev.type];
            const d = new Date(ev.date + "T00:00:00");
            const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
            return (
              <div key={ev.id} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-foreground font-medium truncate">{ev.title}</div>
                  <div className="text-[10px] text-muted-foreground">{label} · {ev.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Missed */}
      {missed.length > 0 && (
        <GlassCard className="p-4 border-red-200 bg-red-50/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-semibold text-red-700">Missed Events</span>
            <span className="text-xs font-bold text-red-600 ml-auto">{missed.length}</span>
          </div>
          <div className="space-y-2">
            {missed.map((ev) => {
              const d = new Date(ev.date + "T00:00:00");
              const label = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
              return (
                <div key={ev.id} className="flex items-start gap-2 p-2 rounded-lg border border-red-200 bg-red-50/40">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-red-700 truncate">{ev.title}</div>
                    <div className="text-[10px] text-muted-foreground">{label} · {ev.time}</div>
                    {ev.trainee && <div className="text-[10px] text-red-600 mt-0.5">→ Reschedule with {ev.trainee}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function DailyView({ date, onAddEvent }: { date: Date; onAddEvent: () => void }) {
  const dateStr = dateToStr(date);
  const dayEvents = EVENTS.filter((e) => e.date === dateStr).sort((a, b) => parseHour(a.time) - parseHour(b.time));

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-foreground">
            {DAYS_FULL[date.getDay()]}, {date.getDate()} {MONTHS[date.getMonth()]} {date.getFullYear()}
          </h3>
          <p className="text-xs text-muted-foreground">{dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""} scheduled</p>
        </div>
        <Button size="sm" className="gap-1.5 h-8" onClick={onAddEvent}>
          <Plus className="w-3.5 h-3.5" /> Add Event
        </Button>
      </div>
      <div className="space-y-0 border border-border rounded-xl overflow-hidden">
        {HOURS.map((h, idx) => {
          const hourVal = HOUR_VALUES[idx];
          const eventsAtHour = dayEvents.filter((e) => parseHour(e.time) === hourVal);
          return (
            <div key={h} className={`flex items-start gap-4 px-4 py-2.5 border-b border-border/50 last:border-b-0 min-h-[52px] ${eventsAtHour.length ? "bg-card" : "bg-muted/10"}`}>
              <div className="w-14 shrink-0 text-xs text-muted-foreground font-mono pt-0.5">{h}</div>
              <div className="flex-1 flex flex-col gap-1.5 py-0.5">
                {eventsAtHour.map((ev) => {
                  const cfg = EVENT_CFG[ev.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={ev.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border ${cfg.border} ${cfg.bg} ${ev.status === "missed" ? "opacity-50" : ""}`}>
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${cfg.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-semibold ${cfg.color}`}>{ev.title}</div>
                        {ev.trainee && <div className="text-[10px] text-muted-foreground">{ev.cohort} · {ev.duration}</div>}
                        {ev.notes && <div className="text-[10px] text-red-500 mt-0.5">{ev.notes}</div>}
                      </div>
                      {ev.status === "completed" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      {ev.status === "missed" && <X className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyView({ weekDates, onAddEvent }: { weekDates: Date[]; onAddEvent: () => void }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">
          Week of {weekDates[0].getDate()} {MONTHS[weekDates[0].getMonth()]} — {weekDates[6].getDate()} {MONTHS[weekDates[6].getMonth()]}
        </h3>
        <Button size="sm" className="gap-1.5 h-8" onClick={onAddEvent}>
          <Plus className="w-3.5 h-3.5" /> Add Event
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((day, idx) => {
          const dayStr = dateToStr(day);
          const dayEvents = EVENTS.filter((e) => e.date === dayStr).sort((a, b) => parseHour(a.time) - parseHour(b.time));
          const isToday = dayStr === "2026-06-28";
          return (
            <div key={idx} className={`rounded-xl border ${isToday ? "border-primary/40 bg-primary/[0.02]" : "border-border bg-card"} p-2.5 min-h-[200px]`}>
              <div className={`text-center mb-2 ${isToday ? "text-primary font-bold" : ""}`}>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{DAYS_SHORT[idx]}</div>
                <div className={`text-base font-bold mt-0.5 w-7 h-7 rounded-full flex items-center justify-center mx-auto ${isToday ? "bg-primary text-white" : "text-foreground"}`}>
                  {day.getDate()}
                </div>
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 4).map((ev) => <EventChip key={ev.id} ev={ev} compact />)}
                {dayEvents.length > 4 && (
                  <div className="text-[10px] text-muted-foreground text-center pt-0.5">+{dayEvents.length - 4} more</div>
                )}
                {dayEvents.length === 0 && (
                  <div className="text-[10px] text-muted-foreground/40 text-center pt-4">No events</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthlyView({ year, month, onAddEvent }: { year: number; month: number; onAddEvent: () => void }) {
  const days = getDaysInMonth(year, month);
  const firstDay = days[0].getDay();

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">{MONTHS[month]} {year}</h3>
        <Button size="sm" className="gap-1.5 h-8" onClick={onAddEvent}>
          <Plus className="w-3.5 h-3.5" /> Add Event
        </Button>
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/40">
          {DAYS_SHORT.map((d) => (
            <div key={d} className="text-center py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{d}</div>
          ))}
        </div>
        {/* Days */}
        <div className="grid grid-cols-7">
          {Array(firstDay).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="border-r border-b border-border/40 min-h-[90px] bg-muted/10" />
          ))}
          {days.map((day, idx) => {
            const dayStr = dateToStr(day);
            const dayEvents = EVENTS.filter((e) => e.date === dayStr);
            const isToday = dayStr === "2026-06-28";
            const col = (firstDay + idx) % 7;
            return (
              <div key={dayStr} className={`border-r border-b border-border/40 min-h-[90px] p-1.5 ${isToday ? "bg-primary/[0.03]" : ""} ${col === 6 ? "border-r-0" : ""}`}>
                <div className={`text-xs font-bold mb-1 w-6 h-6 rounded-full flex items-center justify-center ${isToday ? "bg-primary text-white" : "text-foreground"}`}>
                  {day.getDate()}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((ev) => {
                    const cfg = EVENT_CFG[ev.type];
                    return (
                      <div key={ev.id} className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium truncate ${cfg.bg} ${cfg.color}`}>
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                        {ev.title.split("—")[0].trim()}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-[9px] text-muted-foreground pl-1">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function POCCalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [currentDate, setCurrentDate] = useState(new Date("2026-06-28"));
  const [showAddModal, setShowAddModal] = useState(false);

  const weekDates = getWeekDates(currentDate);

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (viewMode === "daily") d.setDate(d.getDate() + dir);
    else if (viewMode === "weekly") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const todayStr = "2026-06-28";
  const todayEvents = EVENTS.filter((e) => e.date === todayStr);

  return (
    <Layout>
      <div className="p-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage daily schedules and trainee-related events</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* View toggle */}
            <div className="flex items-center bg-muted rounded-xl p-1 border border-border gap-0.5">
              {(["daily", "weekly", "monthly"] as ViewMode[]).map((v) => (
                <button key={v} onClick={() => setViewMode(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${viewMode === v ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {v}
                </button>
              ))}
            </div>
            {/* Navigation */}
            <div className="flex items-center gap-1">
              <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentDate(new Date("2026-06-28"))} className="px-3 h-8 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Today</button>
              <button onClick={() => navigate(1)} className="w-8 h-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Button size="sm" className="gap-1.5 h-8" onClick={() => setShowAddModal(true)}>
              <Plus className="w-3.5 h-3.5" /> New Event
            </Button>
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: "Today's Events", value: todayEvents.length, dot: "bg-primary" },
            { label: "Standups", value: EVENTS.filter((e) => e.type === "standup").length, dot: "bg-blue-500" },
            { label: "Sync-ups", value: EVENTS.filter((e) => e.type === "syncup").length, dot: "bg-emerald-500" },
            { label: "Demos", value: EVENTS.filter((e) => e.type === "demo").length, dot: "bg-amber-500" },
            { label: "Missed", value: EVENTS.filter((e) => e.status === "missed").length, dot: "bg-red-500" },
          ].map(({ label, value, dot }) => (
            <GlassCard key={label} className="p-3 flex items-center gap-2.5">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
              <div>
                <div className="text-base font-bold text-foreground tabular-nums">{value}</div>
                <div className="text-[10px] text-muted-foreground">{label}</div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Main grid */}
        <div className="flex flex-col xl:flex-row gap-4 items-start">
          {/* Calendar view */}
          <div className="flex-1 min-w-0 overflow-x-auto">
            {viewMode === "daily" && <DailyView date={currentDate} onAddEvent={() => setShowAddModal(true)} />}
            {viewMode === "weekly" && <WeeklyView weekDates={weekDates} onAddEvent={() => setShowAddModal(true)} />}
            {viewMode === "monthly" && <MonthlyView year={currentDate.getFullYear()} month={currentDate.getMonth()} onAddEvent={() => setShowAddModal(true)} />}
          </div>

          {/* Right panel */}
          <div className="w-full xl:w-72 shrink-0">
            <RightPanel selectedDate={currentDate} />
          </div>
        </div>

        {/* Add Event Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <GlassCard className="relative w-full max-w-md shadow-xl">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">Add Event</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {(["standup","syncup","demo","followup","leave","assessment"] as EventType[]).map((type) => {
                  const cfg = EVENT_CFG[type];
                  const Icon = cfg.icon;
                  return (
                    <button key={type} onClick={() => setShowAddModal(false)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border ${cfg.border} ${cfg.bg} hover:opacity-90 transition-opacity`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</div>
                        <div className="text-[10px] text-muted-foreground">Schedule a {cfg.label.toLowerCase()} event</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        )}

      </div>
    </Layout>
  );
}
