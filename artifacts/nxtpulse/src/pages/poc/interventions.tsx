import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ShieldAlert, Plus, CheckCheck, X, Archive,
  ClipboardList, Clock, UserCheck, Filter, Loader2,
  ChevronDown, AlertTriangle, Brain, Calendar, User,
  Flame, CheckCircle2
} from "lucide-react";
import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useGetInterventions,
  getGetInterventionsQueryKey,
  useCreateIntervention,
  useAcknowledgeIntervention,
  useResolveIntervention,
  useDismissIntervention,
} from "@workspace/api-client-react";
import type { Intervention } from "@workspace/api-client-react";

type ExtIntervention = Intervention & { assigned_to?: string; due_date?: string };

const TRAINEE_OPTIONS = [
  { id: "t1", name: "Rahul Verma", cohort: "Cohort-7" },
  { id: "t2", name: "Sai Krishna", cohort: "Cohort-7" },
  { id: "t3", name: "Kiran Patel", cohort: "Cohort-7" },
  { id: "t4", name: "Ananya Reddy", cohort: "Cohort-8" },
  { id: "t5", name: "Vikram Singh", cohort: "Cohort-8" },
  { id: "t7", name: "Arjun Das", cohort: "Cohort-8" },
  { id: "t8", name: "Pooja Menon", cohort: "Cohort-7" },
  { id: "t10", name: "Deepa Nair", cohort: "Cohort-8" },
  { id: "t11", name: "Rohit Joshi", cohort: "Cohort-7" },
];

const TYPE_LABELS: Record<string, string> = {
  attendance: "Attendance",
  demo_quality: "Demo Quality",
  ai_dependency: "AI Dependency",
  engagement: "Engagement",
  standup: "Standup",
};

const SEVERITY_MAP: Record<string, { label: string; cls: string }> = {
  attendance: { label: "High", cls: "text-red-700 border-red-200 bg-red-50" },
  demo_quality: { label: "Medium", cls: "text-amber-700 border-amber-200 bg-amber-50" },
  ai_dependency: { label: "High", cls: "text-red-700 border-red-200 bg-red-50" },
  engagement: { label: "Medium", cls: "text-amber-700 border-amber-200 bg-amber-50" },
  standup: { label: "Low", cls: "text-blue-700 border-blue-200 bg-blue-50" },
};

const TYPE_BORDER: Record<string, string> = {
  attendance: "border-l-red-400",
  demo_quality: "border-l-orange-400",
  ai_dependency: "border-l-violet-400",
  engagement: "border-l-amber-400",
  standup: "border-l-blue-400",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "text-amber-700 border-amber-200 bg-amber-50",
  acknowledged: "text-blue-700 border-blue-200 bg-blue-50",
  resolved: "text-emerald-700 border-emerald-200 bg-emerald-50",
  dismissed: "text-muted-foreground border-border bg-muted/40",
};

const AI_RECOMMENDATIONS: Record<string, string> = {
  attendance: "Schedule immediate 1-on-1 sync. Review blockers causing absence. Set attendance contract.",
  demo_quality: "Assign demo prep practice. Pair with a high-performer mentor for mock session.",
  ai_dependency: "Enforce no-AI coding challenges for 5 days. Track submissions manually.",
  engagement: "Check in via Slack DM. Flag for counselor if unresponsive after 48 hours.",
  standup: "Send reminder. If missed again, escalate to programme coordinator.",
};

const COHORTS = ["All Cohorts", "Cohort-6", "Cohort-7", "Cohort-8"];
const SEVERITIES = ["All Severity", "High", "Medium", "Low"];

type ActiveTab = "pending" | "escalated" | "completed" | "overdue";

function isOverdue(item: Intervention) {
  if (!item.due_date) return false;
  return new Date(item.due_date) < new Date() && item.status === "pending";
}

function getTabItems(interventions: Intervention[], tab: ActiveTab) {
  switch (tab) {
    case "pending": return interventions.filter((i) => i.status === "pending" && !isOverdue(i));
    case "escalated": return interventions.filter((i) => i.status === "acknowledged");
    case "completed": return interventions.filter((i) => i.status === "resolved" || i.status === "dismissed");
    case "overdue": return interventions.filter(isOverdue);
  }
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function dueDateLabel(due: string) {
  const diff = Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, cls: "text-red-600" };
  if (diff === 0) return { text: "Due today", cls: "text-red-600" };
  if (diff === 1) return { text: "Due tomorrow", cls: "text-amber-600" };
  return { text: `Due in ${diff}d`, cls: "text-muted-foreground" };
}

function InterventionCard({
  item, onAck, onResolve, onDismiss, pending,
}: {
  item: Intervention;
  onAck: (id: string) => void;
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
  pending: string | null;
}) {
  const isActing = pending === item.id;
  const isTerminal = item.status === "resolved" || item.status === "dismissed";
  const borderColor = TYPE_BORDER[item.type] || "border-l-border";
  const severity = SEVERITY_MAP[item.type] || { label: "Medium", cls: "text-amber-700 border-amber-200 bg-amber-50" };
  const aiRec = AI_RECOMMENDATIONS[item.type] || "Review issue and schedule a sync-up with the trainee.";

  return (
    <div className={`flex flex-col gap-3 p-5 rounded-xl border border-border bg-card border-l-4 ${borderColor} hover:shadow-sm transition-shadow`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-foreground">{item.trainee_name}</span>
          <Badge variant="outline" className={`text-xs ${severity.cls}`}>
            {severity.label} Severity
          </Badge>
          <Badge variant="outline" className={`text-xs ${STATUS_STYLES[item.status] || ""}`}>
            {item.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(item.created_at)}
          </div>
          {item.assigned_to && (
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {item.assigned_to}
            </div>
          )}
        </div>
      </div>

      {/* Type badge */}
      <div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-md border border-border bg-muted/40 text-muted-foreground">
          {TYPE_LABELS[item.type] || item.type}
        </span>
      </div>

      {/* Issue + AI Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Issue</div>
          <p className="text-sm text-foreground leading-relaxed">{item.issue}</p>
        </div>
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
            <Brain className="w-3 h-3 text-primary" /> AI Recommendation
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">{aiRec}</p>
        </div>
      </div>

      {/* Due date */}
      {item.due_date && (() => {
        const dl = dueDateLabel(item.due_date);
        return (
          <div className={`flex items-center gap-1.5 text-xs font-medium ${dl.cls}`}>
            <Clock className="w-3.5 h-3.5" />
            {dl.text}
          </div>
        );
      })()}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        {isActing && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        {!isActing && !isTerminal && (
          <>
            {item.status === "pending" && (
              <Button size="sm" variant="outline" onClick={() => onAck(item.id)}
                className="h-7 text-xs gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50">
                <CheckCheck className="w-3.5 h-3.5" /> Escalate
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => onResolve(item.id)}
              className="h-7 text-xs gap-1.5 border-emerald-200 text-emerald-600 hover:bg-emerald-50">
              <UserCheck className="w-3.5 h-3.5" /> Mark Resolved
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDismiss(item.id)}
              className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-red-600 hover:border-red-200">
              <X className="w-3.5 h-3.5" /> Dismiss
            </Button>
          </>
        )}
        {isTerminal && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <CheckCircle2 className="w-4 h-4" /> {item.status}
          </div>
        )}
      </div>
    </div>
  );
}

function CreatePanel({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [traineeId, setTraineeId] = useState("");
  const [type, setType] = useState("attendance");
  const [issue, setIssue] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const create = useCreateIntervention({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetInterventionsQueryKey() });
        onClose();
      },
    },
  });

  const selectedTrainee = TRAINEE_OPTIONS.find((t) => t.id === traineeId);
  const inputCls = "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors";
  const labelCls = "block text-xs font-semibold text-muted-foreground mb-1.5";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!traineeId || !issue || !recommendation) return;
    create.mutate({
      data: {
        trainee_id: traineeId,
        trainee_name: selectedTrainee?.name || "",
        type: type as "attendance" | "demo_quality" | "ai_dependency" | "engagement" | "standup",
        issue,
        recommendation,
        due_date: dueDate || null,
        assigned_to: assignedTo || null,
      },
    });
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
            <h2 className="text-base font-semibold text-foreground">New Intervention</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Trainee</label>
              <div className="relative">
                <select value={traineeId} onChange={(e) => setTraineeId(e.target.value)}
                  required className={`${inputCls} appearance-none pr-8`}>
                  <option value="">Select trainee...</option>
                  {TRAINEE_OPTIONS.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.cohort})</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <div className="relative">
                <select value={type} onChange={(e) => setType(e.target.value)} className={`${inputCls} appearance-none pr-8`}>
                  {Object.entries(TYPE_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
          <div>
            <label className={labelCls}>Issue Description</label>
            <textarea value={issue} onChange={(e) => setIssue(e.target.value)}
              placeholder="What specific issue triggered this intervention?" required rows={2} className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className={labelCls}>Recommended Action</label>
            <textarea value={recommendation} onChange={(e) => setRecommendation(e.target.value)}
              placeholder="What steps should be taken?" required rows={2} className={`${inputCls} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Due Date (optional)</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Assigned POC (optional)</label>
              <input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Your name..." className={inputCls} />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={create.isPending || !traineeId || !issue || !recommendation} className="flex-1 gap-2">
              {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Intervention
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

export default function POCInterventionsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTab>("pending");
  const [showCreate, setShowCreate] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState("All Severity");
  const [filterCohort, setFilterCohort] = useState("All Cohorts");

  const { data: interventions = [], isLoading } = useGetInterventions();

  const ack = useAcknowledgeIntervention({
    mutation: {
      onMutate: ({ id }) => setActingId(id),
      onSettled: () => setActingId(null),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetInterventionsQueryKey() }),
    },
  });
  const resolve = useResolveIntervention({
    mutation: {
      onMutate: ({ id }) => setActingId(id),
      onSettled: () => setActingId(null),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetInterventionsQueryKey() }),
    },
  });
  const dismiss = useDismissIntervention({
    mutation: {
      onMutate: ({ id }) => setActingId(id),
      onSettled: () => setActingId(null),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetInterventionsQueryKey() }),
    },
  });

  const counts = {
    pending: interventions.filter((i) => i.status === "pending" && !isOverdue(i)).length,
    escalated: interventions.filter((i) => i.status === "acknowledged").length,
    completed: interventions.filter((i) => i.status === "resolved" || i.status === "dismissed").length,
    overdue: interventions.filter(isOverdue).length,
  };

  let tabItems = getTabItems(interventions, activeTab);

  if (filterSeverity !== "All Severity") {
    tabItems = tabItems.filter((i) => {
      const s = SEVERITY_MAP[i.type]?.label || "Medium";
      return s === filterSeverity;
    });
  }

  const TABS: { key: ActiveTab; label: string; icon: typeof ShieldAlert; color: string }[] = [
    { key: "pending", label: "Pending", icon: AlertTriangle, color: "text-amber-600" },
    { key: "escalated", label: "Escalated", icon: Flame, color: "text-blue-600" },
    { key: "completed", label: "Completed", icon: CheckCircle2, color: "text-emerald-600" },
    { key: "overdue", label: "Overdue", icon: Clock, color: "text-red-600" },
  ];

  return (
    <Layout>
      <div className="p-6 space-y-6 overflow-y-auto h-screen">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Interventions</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track and manage intervention plans for your trainees
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Intervention
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TABS.map(({ key, label, icon: Icon, color }) => {
            const bg = key === "pending" ? "bg-amber-50" : key === "escalated" ? "bg-blue-50" : key === "completed" ? "bg-emerald-50" : "bg-red-50";
            return (
              <GlassCard key={key} className={`p-5 cursor-pointer hover:border-primary/20 transition-colors ${activeTab === key ? "ring-2 ring-primary/20 border-primary/30" : ""}`}
                onClick={() => setActiveTab(key)}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color} ${bg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-foreground tabular-nums">{isLoading ? "—" : counts[key]}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
              </GlassCard>
            );
          })}
        </div>

        {/* Tabs + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1 border-b border-border flex-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
                  activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {counts[tab.key] > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    activeTab === tab.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>{counts[tab.key]}</span>
                )}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="relative">
              <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}
                className="text-xs border border-border rounded-lg px-3 py-1.5 pr-7 bg-card text-foreground focus:outline-none focus:border-primary/60 appearance-none">
                {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative">
              <select value={filterCohort} onChange={(e) => setFilterCohort(e.target.value)}
                className="text-xs border border-border rounded-lg px-3 py-1.5 pr-7 bg-card text-foreground focus:outline-none focus:border-primary/60 appearance-none">
                {COHORTS.map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : tabItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Archive className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm font-medium">No interventions in this category</p>
            <button onClick={() => setShowCreate(true)} className="mt-3 text-sm text-primary hover:underline">
              Create the first one
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tabItems.map((item) => (
              <InterventionCard
                key={item.id}
                item={item}
                onAck={(id) => ack.mutate({ id })}
                onResolve={(id) => resolve.mutate({ id })}
                onDismiss={(id) => dismiss.mutate({ id })}
                pending={actingId}
              />
            ))}
          </div>
        )}

      </div>

      {showCreate && <CreatePanel onClose={() => setShowCreate(false)} />}
    </Layout>
  );
}
