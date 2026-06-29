import { useState } from "react";
import {
  CalendarDays, Clock, CheckCircle2, X, AlertTriangle,
  Plus, Filter, User, Calendar, MessageSquare, Edit2,
  ChevronDown, Loader2, Video, PhoneCall
} from "lucide-react";
import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type SyncStatus = "pending" | "completed" | "missed" | "today";

interface SyncUp {
  id: string;
  trainee: string;
  cohort: string;
  track: string;
  date: string;
  time: string;
  type: "video" | "phone" | "in-person";
  status: SyncStatus;
  issue: string;
  notes?: string;
  outcome?: string;
  poc: string;
  priority: "high" | "medium" | "low";
}

const STATIC_SYNCUPS: SyncUp[] = [
  {
    id: "s1", trainee: "Rahul Verma", cohort: "Cohort-7", track: "React+Node",
    date: "2026-06-28", time: "3:00 PM", type: "video", status: "today",
    issue: "Attendance dropped to 62%. Has missed 3 consecutive standups.",
    poc: "You", priority: "high",
  },
  {
    id: "s2", trainee: "Vikram Singh", cohort: "Cohort-8", track: "React+Node",
    date: "2026-06-28", time: "5:00 PM", type: "video", status: "today",
    issue: "AI dependency at 88%. Requires structured practice plan review.",
    poc: "You", priority: "high",
  },
  {
    id: "s3", trainee: "Sai Krishna", cohort: "Cohort-7", track: "React+Node",
    date: "2026-06-29", time: "10:00 AM", type: "phone", status: "pending",
    issue: "Demo submission delayed twice. Score at 55%.",
    poc: "You", priority: "medium",
  },
  {
    id: "s4", trainee: "Arjun Das", cohort: "Cohort-8", track: "React+Node",
    date: "2026-06-30", time: "11:00 AM", type: "video", status: "pending",
    issue: "Medium risk — attendance inconsistent, demo at 44%.",
    poc: "You", priority: "medium",
  },
  {
    id: "s5", trainee: "Deepa Nair", cohort: "Cohort-8", track: "Data Science",
    date: "2026-07-01", time: "2:00 PM", type: "video", status: "pending",
    issue: "Flagged by LearnGuard — SQL gaps detected.",
    poc: "You", priority: "low",
  },
  {
    id: "s6", trainee: "Pooja Menon", cohort: "Cohort-7", track: "React+Node",
    date: "2026-06-26", time: "11:00 AM", type: "video", status: "completed",
    issue: "No communication for 5 days.",
    notes: "Trainee opened up about personal challenges. Plan: daily check-in for 1 week, reduced sprint target.",
    outcome: "Positive — trainee committed to re-engagement.",
    poc: "You", priority: "high",
  },
  {
    id: "s7", trainee: "Kiran Patel", cohort: "Cohort-7", track: "React+Node",
    date: "2026-06-25", time: "3:00 PM", type: "phone", status: "completed",
    issue: "Demo score at 63%. Needed prep support.",
    notes: "Walked through demo structure. Assigned 2 mock sessions.",
    outcome: "Demo score improved to 71% in follow-up.",
    poc: "You", priority: "medium",
  },
  {
    id: "s8", trainee: "Rohit Joshi", cohort: "Cohort-7", track: "Data Science",
    date: "2026-06-24", time: "4:00 PM", type: "video", status: "missed",
    issue: "High risk — attendance at 41%, demo at 22%.",
    poc: "You", priority: "high",
  },
  {
    id: "s9", trainee: "Ananya Reddy", cohort: "Cohort-8", track: "Data Science",
    date: "2026-06-23", time: "10:00 AM", type: "phone", status: "missed",
    issue: "Routine check-in for LearnGuard evaluation.",
    poc: "You", priority: "low",
  },
];

const TYPE_ICONS = {
  video: <Video className="w-3.5 h-3.5" />,
  phone: <PhoneCall className="w-3.5 h-3.5" />,
  "in-person": <User className="w-3.5 h-3.5" />,
};

const STATUS_STYLES: Record<SyncStatus, { card: string; badge: string; label: string }> = {
  today: { card: "border-primary/30 bg-primary/[0.02]", badge: "text-primary border-primary/30 bg-primary/10", label: "Today" },
  pending: { card: "", badge: "text-amber-700 border-amber-200 bg-amber-50", label: "Pending" },
  completed: { card: "opacity-80", badge: "text-emerald-700 border-emerald-200 bg-emerald-50", label: "Completed" },
  missed: { card: "border-red-200 bg-red-50/20", badge: "text-red-700 border-red-200 bg-red-50", label: "Missed" },
};

const PRIORITY_STYLES = {
  high: "text-red-700 border-red-200 bg-red-50",
  medium: "text-amber-700 border-amber-200 bg-amber-50",
  low: "text-muted-foreground border-border bg-muted/40",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function SyncUpCard({ item, onMarkComplete, onMarkMissed }: {
  item: SyncUp;
  onMarkComplete: (id: string) => void;
  onMarkMissed: (id: string) => void;
}) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(item.notes || "");
  const styles = STATUS_STYLES[item.status];
  const isTerminal = item.status === "completed" || item.status === "missed";
  const isToday = item.status === "today";

  return (
    <div className={`p-5 rounded-xl border border-border bg-card ${styles.card} hover:shadow-sm transition-shadow`}>
      {/* Top */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-foreground">{item.trainee}</span>
            <span className="text-xs text-muted-foreground">{item.cohort} · {item.track}</span>
            <Badge variant="outline" className={`text-xs ${styles.badge}`}>{styles.label}</Badge>
            <Badge variant="outline" className={`text-xs ${PRIORITY_STYLES[item.priority]}`}>
              {item.priority}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5 flex-wrap">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {formatDate(item.date)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {item.time}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md border border-border bg-muted/40 text-muted-foreground`}>
                {TYPE_ICONS[item.type]} {item.type}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap shrink-0">
          {isToday && (
            <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary text-white">
              <Video className="w-3 h-3" /> Join Now
            </Button>
          )}
        </div>
      </div>

      {/* Issue */}
      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{item.issue}</p>

      {/* Completed details */}
      {item.status === "completed" && item.notes && (
        <div className="mb-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1.5">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Notes</div>
          <p className="text-xs text-foreground leading-relaxed">{item.notes}</p>
          {item.outcome && (
            <>
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mt-1.5">Outcome</div>
              <p className="text-xs text-foreground">{item.outcome}</p>
            </>
          )}
        </div>
      )}

      {/* Missed follow-up */}
      {item.status === "missed" && (
        <div className="mb-3 flex items-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
          <AlertTriangle className="w-3.5 h-3.5" /> Follow up required — trainee didn't attend
        </div>
      )}

      {/* Notes textarea for pending/today */}
      {showNotes && !isTerminal && (
        <div className="mb-3">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            placeholder="Add session notes..."
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 resize-none" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        {!isTerminal && (
          <>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              onClick={() => onMarkComplete(item.id)}>
              <CheckCircle2 className="w-3 h-3" /> Mark Completed
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-red-600 hover:border-red-200"
              onClick={() => onMarkMissed(item.id)}>
              <X className="w-3 h-3" /> Mark Missed
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5"
              onClick={() => setShowNotes((v) => !v)}>
              <Edit2 className="w-3 h-3" /> {showNotes ? "Hide Notes" : "Add Notes"}
            </Button>
          </>
        )}
        {item.status === "missed" && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 border-amber-200 text-amber-600 hover:bg-amber-50">
            <CalendarDays className="w-3 h-3" /> Reschedule
          </Button>
        )}
      </div>
    </div>
  );
}

function CreateSyncUpModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (item: SyncUp) => void;
}) {
  const TRAINEES = [
    { name: "Rahul Verma", cohort: "Cohort-7", track: "React+Node" },
    { name: "Sai Krishna", cohort: "Cohort-7", track: "React+Node" },
    { name: "Kiran Patel", cohort: "Cohort-7", track: "React+Node" },
    { name: "Vikram Singh", cohort: "Cohort-8", track: "React+Node" },
    { name: "Ananya Reddy", cohort: "Cohort-8", track: "Data Science" },
    { name: "Arjun Das", cohort: "Cohort-8", track: "React+Node" },
    { name: "Pooja Menon", cohort: "Cohort-7", track: "React+Node" },
    { name: "Deepa Nair", cohort: "Cohort-8", track: "Data Science" },
    { name: "Rohit Joshi", cohort: "Cohort-7", track: "Data Science" },
  ];

  const [trainee, setTrainee] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<"video" | "phone" | "in-person">("video");
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");

  const inputCls = "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selected = TRAINEES.find((t) => t.name === trainee);
    if (!selected) return;
    const isToday = date === new Date().toISOString().split("T")[0];
    onCreate({
      id: `s${Date.now()}`,
      trainee: selected.name,
      cohort: selected.cohort,
      track: selected.track,
      date, time, type, issue, priority,
      status: isToday ? "today" : "pending",
      poc: "You",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <GlassCard className="relative w-full max-w-lg shadow-xl">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Schedule Sync-up</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Trainee</label>
            <div className="relative">
              <select value={trainee} onChange={(e) => setTrainee(e.target.value)} required className={`${inputCls} appearance-none pr-8`}>
                <option value="">Select trainee...</option>
                {TRAINEES.map((t) => <option key={t.name} value={t.name}>{t.name} ({t.cohort})</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputCls} min={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Type</label>
              <div className="relative">
                <select value={type} onChange={(e) => setType(e.target.value as any)} className={`${inputCls} appearance-none pr-8`}>
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="in-person">In Person</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Priority</label>
              <div className="relative">
                <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className={`${inputCls} appearance-none pr-8`}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Reason / Issue</label>
            <textarea value={issue} onChange={(e) => setIssue(e.target.value)} required rows={2}
              placeholder="What's the purpose of this sync-up?" className={`${inputCls} resize-none`} />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={!trainee || !date || !time || !issue} className="flex-1 gap-2">
              <CalendarDays className="w-4 h-4" /> Schedule Sync-up
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

export default function POCSyncUpsPage() {
  const [syncUps, setSyncUps] = useState<SyncUp[]>(STATIC_SYNCUPS);
  const [activeTab, setActiveTab] = useState<"all" | SyncStatus>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [filterPriority, setFilterPriority] = useState("All Priority");

  const markComplete = (id: string) => {
    setSyncUps((prev) => prev.map((s) => s.id === id ? { ...s, status: "completed" as const } : s));
  };
  const markMissed = (id: string) => {
    setSyncUps((prev) => prev.map((s) => s.id === id ? { ...s, status: "missed" as const } : s));
  };
  const addSyncUp = (item: SyncUp) => {
    setSyncUps((prev) => [item, ...prev]);
  };

  const counts = {
    all: syncUps.length,
    today: syncUps.filter((s) => s.status === "today").length,
    pending: syncUps.filter((s) => s.status === "pending").length,
    completed: syncUps.filter((s) => s.status === "completed").length,
    missed: syncUps.filter((s) => s.status === "missed").length,
  };

  let displayed = activeTab === "all" ? syncUps : syncUps.filter((s) => s.status === activeTab);
  if (filterPriority !== "All Priority") {
    displayed = displayed.filter((s) => s.priority === filterPriority.toLowerCase());
  }

  const TABS: { key: "all" | SyncStatus; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "all", label: "All", icon: <CalendarDays className="w-3.5 h-3.5" />, color: "text-foreground" },
    { key: "today", label: "Today", icon: <Clock className="w-3.5 h-3.5" />, color: "text-primary" },
    { key: "pending", label: "Pending", icon: <CalendarDays className="w-3.5 h-3.5" />, color: "text-amber-600" },
    { key: "completed", label: "Completed", icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-emerald-600" },
    { key: "missed", label: "Missed", icon: <X className="w-3.5 h-3.5" />, color: "text-red-600" },
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sync-ups</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Schedule and track 1-on-1 sessions with your trainees
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Schedule Sync-up
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: "today", label: "Today's Sync-ups", icon: <Clock className="w-5 h-5" />, color: "text-primary", bg: "bg-primary/8" },
            { key: "pending", label: "Pending", icon: <CalendarDays className="w-5 h-5" />, color: "text-amber-600", bg: "bg-amber-50" },
            { key: "completed", label: "Completed", icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
            { key: "missed", label: "Missed", icon: <AlertTriangle className="w-5 h-5" />, color: "text-red-600", bg: "bg-red-50" },
          ].map(({ key, label, icon, color, bg }) => (
            <GlassCard key={key}
              className={`p-5 cursor-pointer hover:border-primary/20 transition-colors ${activeTab === key ? "ring-2 ring-primary/20 border-primary/30" : ""}`}
              onClick={() => setActiveTab(key as any)}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color} ${bg}`}>{icon}</div>
              <div className="text-2xl font-bold text-foreground tabular-nums">{counts[key as keyof typeof counts]}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Tabs + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1 border-b border-border flex-1">
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                {tab.label}
                {counts[tab.key as keyof typeof counts] > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    activeTab === tab.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>{counts[tab.key as keyof typeof counts]}</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="relative">
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
                className="text-xs border border-border rounded-lg px-3 py-1.5 pr-7 bg-card text-foreground focus:outline-none focus:border-primary/60 appearance-none">
                {["All Priority", "High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Sync-up Cards */}
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <CalendarDays className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm font-medium">No sync-ups in this category</p>
            <button onClick={() => setShowCreate(true)} className="mt-3 text-sm text-primary hover:underline">
              Schedule one now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Today's banner */}
            {activeTab === "all" && counts.today > 0 && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-primary/20 bg-primary/5 text-sm font-medium text-primary">
                <Clock className="w-4 h-4" />
                You have {counts.today} sync-up{counts.today > 1 ? "s" : ""} today
              </div>
            )}
            {displayed.map((item) => (
              <SyncUpCard key={item.id} item={item} onMarkComplete={markComplete} onMarkMissed={markMissed} />
            ))}
          </div>
        )}

      </div>

      {showCreate && <CreateSyncUpModal onClose={() => setShowCreate(false)} onCreate={addSyncUp} />}
    </Layout>
  );
}
