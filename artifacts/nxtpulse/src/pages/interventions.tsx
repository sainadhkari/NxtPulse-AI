import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ShieldAlert, Plus, CheckCheck, X, Archive,
  ClipboardList, Clock, UserCheck, Filter, Loader2, ChevronDown,
  AlertTriangle, Brain, Calendar, User
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

const TRAINEE_OPTIONS = [
  { id: "t1", name: "Rahul Verma" },
  { id: "t2", name: "Sai Krishna" },
  { id: "t3", name: "Kiran Patel" },
  { id: "t4", name: "Ananya Reddy" },
  { id: "t5", name: "Vikram Singh" },
  { id: "t7", name: "Arjun Das" },
  { id: "t8", name: "Pooja Menon" },
  { id: "t10", name: "Deepa Nair" },
  { id: "t11", name: "Rohit Joshi" },
];

const TYPE_LABELS: Record<string, string> = {
  attendance: "Attendance",
  demo_quality: "Demo Quality",
  ai_dependency: "AI Dependency",
  engagement: "Engagement",
  standup: "Standup",
};

const TYPE_STYLES: Record<string, string> = {
  attendance: "text-red-700 border-red-200 bg-red-50",
  demo_quality: "text-orange-700 border-orange-200 bg-orange-50",
  ai_dependency: "text-violet-700 border-violet-200 bg-violet-50",
  engagement: "text-amber-700 border-amber-200 bg-amber-50",
  standup: "text-blue-700 border-blue-200 bg-blue-50",
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

const STATUS_TABS = ["all", "pending", "acknowledged", "resolved", "dismissed"] as const;
type StatusTab = typeof STATUS_TABS[number];

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
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

  return (
    <div
      data-testid={`row-intervention-${item.id}`}
      className={`flex flex-col gap-3 p-5 rounded-xl border border-border bg-card border-l-4 ${borderColor} hover:shadow-sm transition-shadow`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-foreground">{item.trainee_name}</span>
          <Badge variant="outline" className={`text-xs ${TYPE_STYLES[item.type] || ""}`}>
            {TYPE_LABELS[item.type] || item.type}
          </Badge>
          <Badge variant="outline" className={`text-xs ${STATUS_STYLES[item.status] || ""}`}>
            {item.status}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(item.created_at)}
          {item.assigned_to && (
            <>
              <span className="mx-1">·</span>
              <User className="w-3.5 h-3.5" />
              {item.assigned_to}
            </>
          )}
        </div>
      </div>

      {/* Issue + Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Issue</div>
          <p className="text-sm text-foreground leading-relaxed">{item.issue}</p>
        </div>
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Recommendation</div>
          <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">{item.recommendation}</p>
        </div>
      </div>

      {/* Due date if present */}
      {item.due_date && (
        <div className="flex items-center gap-1.5 text-xs text-amber-600">
          <Clock className="w-3.5 h-3.5" />
          Due: {formatDate(item.due_date)}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        {isActing && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        {!isActing && !isTerminal && (
          <>
            {item.status === "pending" && (
              <Button size="sm" variant="outline"
                data-testid={`button-ack-${item.id}`}
                onClick={() => onAck(item.id)}
                className="h-7 text-xs gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50">
                <CheckCheck className="w-3.5 h-3.5" /> Acknowledge
              </Button>
            )}
            <Button size="sm" variant="outline"
              data-testid={`button-resolve-${item.id}`}
              onClick={() => onResolve(item.id)}
              className="h-7 text-xs gap-1.5 border-emerald-200 text-emerald-600 hover:bg-emerald-50">
              <UserCheck className="w-3.5 h-3.5" /> Mark Resolved
            </Button>
            <Button size="sm" variant="outline"
              data-testid={`button-dismiss-${item.id}`}
              onClick={() => onDismiss(item.id)}
              className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-red-600 hover:border-red-200">
              <X className="w-3.5 h-3.5" /> Dismiss
            </Button>
          </>
        )}
        {isTerminal && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <UserCheck className="w-4 h-4" /> {item.status}
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

  const inputCls = "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors";
  const labelCls = "block text-xs font-semibold text-muted-foreground mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <GlassCard className="relative w-full max-w-lg shadow-xl">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-base font-semibold text-foreground">New Intervention Plan</h2>
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
                <select data-testid="select-trainee" value={traineeId} onChange={(e) => setTraineeId(e.target.value)}
                  required className={`${inputCls} appearance-none pr-8`}>
                  <option value="">Select trainee...</option>
                  {TRAINEE_OPTIONS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Intervention Type</label>
              <div className="relative">
                <select data-testid="select-type" value={type} onChange={(e) => setType(e.target.value)}
                  className={`${inputCls} appearance-none pr-8`}>
                  {Object.entries(TYPE_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Issue Description</label>
            <textarea data-testid="input-issue" value={issue} onChange={(e) => setIssue(e.target.value)}
              placeholder="What specific issue triggered this intervention?"
              required rows={2} className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className={labelCls}>Recommended Action</label>
            <textarea data-testid="input-recommendation" value={recommendation} onChange={(e) => setRecommendation(e.target.value)}
              placeholder="What specific steps should be taken?"
              required rows={2} className={`${inputCls} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Due Date (optional)</label>
              <input data-testid="input-due-date" type="date" value={dueDate}
                onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Assigned To (optional)</label>
              <input data-testid="input-assigned-to" value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="POC name..." className={inputCls} />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" data-testid="button-create-submit"
              disabled={create.isPending || !traineeId || !issue || !recommendation}
              className="flex-1 gap-2">
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

export default function InterventionsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const { data: interventions = [], isLoading } = useGetInterventions(
    activeTab !== "all" ? { status: activeTab } : undefined
  );

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

  const allData = interventions;
  const counts = {
    pending: allData.filter((i) => i.status === "pending").length,
    acknowledged: allData.filter((i) => i.status === "acknowledged").length,
    resolved: allData.filter((i) => i.status === "resolved").length,
    dismissed: allData.filter((i) => i.status === "dismissed").length,
  };

  return (
    <Layout>
      <div className="p-6 space-y-6 overflow-y-auto h-screen">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Intervention Workflows</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Create, assign, and track structured intervention plans for at-risk trainees
            </p>
          </div>
          <Button data-testid="button-new-intervention" onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Intervention
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Active", value: counts.pending + counts.acknowledged, icon: ClipboardList, color: "text-primary", bg: "bg-primary/8" },
            { label: "Pending Review", value: counts.pending, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Acknowledged", value: counts.acknowledged, icon: Brain, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Resolved", value: counts.resolved, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <GlassCard key={label} className="p-5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color} ${bg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-foreground tabular-nums">{isLoading ? "—" : value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 flex-wrap border-b border-border pb-0">
          <Filter className="w-3.5 h-3.5 text-muted-foreground/60 mr-2" />
          {STATUS_TABS.map((tab) => {
            const count = tab === "all" ? interventions.length : counts[tab as keyof typeof counts];
            return (
              <button
                key={tab}
                data-testid={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    activeTab === tab ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : interventions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Archive className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm font-medium">No interventions in this category</p>
            <button onClick={() => setShowCreate(true)} className="mt-3 text-sm text-primary hover:underline">
              Create the first one
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {interventions.map((item) => (
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
