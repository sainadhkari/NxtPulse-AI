import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ShieldAlert, Plus, CheckCheck, X, Archive,
  ClipboardList, Clock, UserCheck, Filter, Loader2, ChevronDown
} from "lucide-react";
import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
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

const TYPE_COLORS: Record<string, string> = {
  attendance: "text-red-400 border-red-500/30 bg-red-500/10",
  demo_quality: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  ai_dependency: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  engagement: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  standup: "text-blue-400 border-blue-500/30 bg-blue-500/10",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  acknowledged: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  resolved: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  dismissed: "text-muted-foreground border-border bg-card",
};

const STATUS_TABS = ["all", "pending", "acknowledged", "resolved", "dismissed"] as const;
type StatusTab = typeof STATUS_TABS[number];

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function InterventionRow({
  item,
  onAck,
  onResolve,
  onDismiss,
  pending,
}: {
  item: Intervention;
  onAck: (id: string) => void;
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
  pending: string | null;
}) {
  const isActing = pending === item.id;
  const isTerminal = item.status === "resolved" || item.status === "dismissed";
  return (
    <tr
      data-testid={`row-intervention-${item.id}`}
      className="border-b border-border/50 hover:bg-primary/[0.02] transition-colors group"
    >
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-foreground">{item.trainee_name}</p>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">{formatDate(item.created_at)}</p>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest ${TYPE_COLORS[item.type] || ""}`}>
          {TYPE_LABELS[item.type] || item.type}
        </span>
      </td>
      <td className="px-4 py-3 max-w-xs">
        <p className="text-xs text-muted-foreground leading-relaxed">{item.issue}</p>
      </td>
      <td className="px-4 py-3 max-w-xs">
        <p className="text-xs text-foreground/80 leading-relaxed">{item.recommendation}</p>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest ${STATUS_COLORS[item.status] || ""}`}>
          {item.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {isActing && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          {!isActing && !isTerminal && (
            <>
              {item.status === "pending" && (
                <button
                  data-testid={`button-ack-${item.id}`}
                  onClick={() => onAck(item.id)}
                  title="Acknowledge"
                  className="p-1.5 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                data-testid={`button-resolve-${item.id}`}
                onClick={() => onResolve(item.id)}
                title="Mark Resolved"
                className="p-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
              </button>
              <button
                data-testid={`button-dismiss-${item.id}`}
                onClick={() => onDismiss(item.id)}
                title="Dismiss"
                className="p-1.5 rounded border border-border text-muted-foreground hover:border-red-500/30 hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
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

  const inputCls = "w-full bg-card border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors font-mono";
  const labelCls = "block text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <GlassCard className="relative w-full max-w-lg shadow-md">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">New Intervention Plan</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Trainee</label>
              <div className="relative">
                <select
                  data-testid="select-trainee"
                  value={traineeId}
                  onChange={(e) => setTraineeId(e.target.value)}
                  required
                  className={`${inputCls} appearance-none pr-8`}
                >
                  <option value="">Select trainee...</option>
                  {TRAINEE_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Intervention Type</label>
              <div className="relative">
                <select
                  data-testid="select-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={`${inputCls} appearance-none pr-8`}
                >
                  {Object.entries(TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Issue Description</label>
            <textarea
              data-testid="input-issue"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="What specific issue triggered this intervention?"
              required
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <label className={labelCls}>Recommended Action</label>
            <textarea
              data-testid="input-recommendation"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="What specific steps should be taken?"
              required
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Due Date (optional)</label>
              <input
                data-testid="input-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Assigned To (optional)</label>
              <input
                data-testid="input-assigned-to"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="POC name..."
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              data-testid="button-create-submit"
              disabled={create.isPending || !traineeId || !issue || !recommendation}
              className="flex-1 py-2.5 rounded bg-primary text-black font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Intervention
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded border border-border text-sm text-muted-foreground hover:border-primary/30 transition-colors">
              Cancel
            </button>
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

  const counts = {
    pending: interventions.filter((i) => i.status === "pending").length,
    acknowledged: interventions.filter((i) => i.status === "acknowledged").length,
    resolved: interventions.filter((i) => i.status === "resolved").length,
  };

  return (
    <Layout>
      <div className="p-6 space-y-6 overflow-y-auto h-screen">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-base font-semibold text-foreground">Intervention Workflows</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Create, assign, and track structured intervention plans for at-risk trainees</p>
            </div>
          </div>
          <button
            data-testid="button-new-intervention"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded bg-primary text-black font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Intervention
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Active", value: counts.pending + counts.acknowledged, icon: ClipboardList, color: "text-primary" },
            { label: "Pending Review", value: counts.pending, icon: Clock, color: "text-yellow-400" },
            { label: "Acknowledged", value: counts.acknowledged, icon: CheckCheck, color: "text-blue-400" },
            { label: "Resolved", value: counts.resolved, icon: UserCheck, color: "text-emerald-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <GlassCard key={label} className="p-4 flex items-center gap-3" glowing>
              <div className={`w-9 h-9 rounded-md border border-current/20 flex items-center justify-center ${color} bg-current/5`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground/60 mr-1" />
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              data-testid={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-widest border transition-colors ${
                activeTab === tab
                  ? "bg-primary/20 border-primary/60 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <GlassCard>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : interventions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50">
              <Archive className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-mono">No interventions in this category.</p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-3 text-xs text-primary hover:underline"
              >
                Create the first one
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    {["Trainee", "Type", "Issue", "Recommendation", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {interventions.map((item) => (
                    <InterventionRow
                      key={item.id}
                      item={item}
                      onAck={(id) => ack.mutate({ id })}
                      onResolve={(id) => resolve.mutate({ id })}
                      onDismiss={(id) => dismiss.mutate({ id })}
                      pending={actingId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>

      {showCreate && <CreatePanel onClose={() => setShowCreate(false)} />}
    </Layout>
  );
}
