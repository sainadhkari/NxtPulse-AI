import { useState, useEffect } from "react";
import {
  Users, Bot, Loader2, CheckCircle2, Clock, Sparkles,
  TrendingUp, MessageSquare, Copy, Check, AlertTriangle,
  ArrowRight, Zap, Target, Brain, Award, BarChart3,
  ThumbsUp, ThumbsDown, Edit2
} from "lucide-react";
import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetUnderstudySimulation } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

type Pairing = {
  id: string;
  mentor: { id: string; name: string; cohort: string; track: string; learning_score: number; demo_score: number; ai_dependency: number };
  mentee: { id: string; name: string; cohort: string; track: string; learning_score: number; demo_score: number; ai_dependency: number };
  compatibility_score: number;
  recommended_sessions: number;
  focus_areas: string[];
  projected_improvement: number;
  match_reason: string;
  status: "active" | "scheduled" | "suggested";
};

type Outreach = {
  id: string; trainee_id: string; trainee_name: string;
  issue: string; recommendation: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "acknowledged" | "resolved" | "dismissed";
};

function priorityStyle(p: string) {
  if (p === "high") return "text-red-700 border-red-200 bg-red-50";
  if (p === "medium") return "text-amber-700 border-amber-200 bg-amber-50";
  return "text-emerald-700 border-emerald-200 bg-emerald-50";
}

function statusStyle(s: string) {
  if (s === "active") return "text-emerald-700 border-emerald-200 bg-emerald-50";
  if (s === "scheduled") return "text-primary border-primary/30 bg-primary/8";
  return "text-muted-foreground border-border bg-muted/40";
}

function scoreColor(val: number, danger = false) {
  if (danger) return val > 60 ? "text-red-600" : "text-emerald-600";
  return val >= 70 ? "text-emerald-600" : val >= 45 ? "text-amber-600" : "text-red-600";
}

function CompatibilityRing({ score }: { score: number }) {
  const r = 30, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 65 ? "#f59e0b" : "#2563eb";
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg width="80" height="80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} stroke="#e5e7eb" strokeWidth="6" fill="none" />
        <circle cx="40" cy="40" r={r} stroke={color} strokeWidth="6" fill="none"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <div className="text-lg font-bold tabular-nums" style={{ color }}>{score}%</div>
        <div className="text-[9px] text-muted-foreground leading-none">match</div>
      </div>
    </div>
  );
}

function MessageGenerator({ outreach }: { outreach: Outreach }) {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const generate = async (tone: string) => {
    setLoading(true);
    setOpen(true);
    try {
      const res = await fetch(`${BASE}/api/understudy/generate-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainee_name: outreach.trainee_name, issue: outreach.issue, recommendation: outreach.recommendation, tone }),
      });
      const data = await res.json();
      setMsg(data.message || "");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-2 flex-wrap">
        {["supportive", "urgent", "firm"].map((tone) => (
          <Button key={tone} size="sm" variant="outline" onClick={() => generate(tone)} disabled={loading}
            className="h-7 text-xs gap-1.5 px-3 capitalize">
            <Sparkles className="w-3 h-3" /> {tone}
          </Button>
        ))}
      </div>
      {open && (
        <div className="rounded-xl border border-border bg-background p-4 relative">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Generating AI message…
            </div>
          ) : (
            <>
              <p className="text-sm text-foreground leading-relaxed pr-8">{msg}</p>
              <button onClick={copy} className="absolute top-3 right-3 text-muted-foreground hover:text-primary transition-colors">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function UnderstudyPage() {
  const { data: sim, isLoading: simLoading } = useGetUnderstudySimulation();
  const [outreachList, setOutreachList] = useState<Outreach[]>([]);
  const [outLoading, setOutLoading] = useState(true);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [pairingsLoading, setPairingsLoading] = useState(false);
  const [pairingsLoaded, setPairingsLoaded] = useState(false);
  const [outreachStates, setOutreachStates] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"pairings" | "outreach">("pairings");
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE}/api/understudy/outreach`)
      .then((r) => r.json())
      .then((data) => setOutreachList(data))
      .finally(() => setOutLoading(false));
  }, []);

  const loadPairings = async () => {
    setPairingsLoading(true);
    try {
      const res = await fetch(`${BASE}/api/understudy/pairings`);
      const data = await res.json();
      setPairings(data);
      setPairingsLoaded(true);
    } finally {
      setPairingsLoading(false);
    }
  };

  const acknowledgeOutreach = async (id: string) => {
    setOutreachStates((s) => ({ ...s, [id]: "acknowledged" }));
    await fetch(`${BASE}/api/understudy/outreach/${id}/acknowledge`, { method: "POST" });
  };
  const resolveOutreach = async (id: string) => {
    setOutreachStates((s) => ({ ...s, [id]: "resolved" }));
    await fetch(`${BASE}/api/understudy/outreach/${id}/resolve`, { method: "POST" });
  };

  const pendingCount = outreachList.filter((o) => (outreachStates[o.id] || o.status) === "pending").length;
  const urgentCount = outreachList.filter((o) => o.priority === "high" && (outreachStates[o.id] || o.status) === "pending").length;

  return (
    <Layout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Understudy AI</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI-powered peer mentoring engine — matches high performers with struggling trainees and automates outreach
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {simLoading
            ? Array(4).fill(0).map((_, i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)
            : sim && [
              { label: "Actions Handled", value: sim.handled_count, sub: "+8 this week", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Pending Outreach", value: sim.pending_actions, sub: `${urgentCount} urgent`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Active Pairings", value: sim.active_pairings ?? 1, sub: "1 currently running", icon: Users, color: "text-primary", bg: "bg-primary/8" },
              { label: "Drafts Ready", value: sim.drafts_ready, sub: "Awaiting approval", icon: MessageSquare, color: "text-violet-600", bg: "bg-violet-50" },
            ].map(({ label, value, sub, icon: Icon, color, bg }) => (
              <GlassCard key={label} className="p-5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color} ${bg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-foreground tabular-nums">{value}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
                <div className={`text-xs mt-1 font-medium ${color}`}>{sub}</div>
              </GlassCard>
            ))}
        </div>

        {/* Success Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Pairing Success Rate", value: "82%", icon: <Award className="w-4 h-4 text-emerald-600" />, color: "text-emerald-600" },
            { label: "Avg Learning Improvement", value: "+24%", icon: <TrendingUp className="w-4 h-4 text-primary" />, color: "text-primary" },
            { label: "Avg AI Dependency Reduction", value: "−17%", icon: <BarChart3 className="w-4 h-4 text-violet-600" />, color: "text-violet-600" },
          ].map((m) => (
            <GlassCard key={m.label} className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">{m.icon}</div>
              <div>
                <div className={`text-lg font-bold tabular-nums ${m.color}`}>{m.value}</div>
                <div className="text-xs text-muted-foreground">{m.label}</div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {([
            { key: "pairings", label: "Peer Pairings", count: pairings.length || null },
            { key: "outreach", label: "Outreach Queue", count: pendingCount > 0 ? `${pendingCount} pending` : null, urgent: urgentCount > 0 },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); if (tab.key === "pairings" && !pairingsLoaded) loadPairings(); }}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.key === "pairings" ? "🔗" : "📣"} {tab.label}
              {tab.count && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  ('urgent' in tab && tab.urgent) ? "bg-red-50 text-red-600" : "bg-primary/10 text-primary"
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* PAIRINGS TAB */}
        {activeTab === "pairings" && (
          <div className="space-y-5">
            {!pairingsLoaded ? (
              <GlassCard className="p-12 flex flex-col items-center gap-5 text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">AI Peer Matching Engine</p>
                  <p className="text-sm text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
                    Analyses learning scores, track alignment, and AI dependency to pair each struggling trainee with their ideal mentor.
                  </p>
                </div>
                <Button onClick={loadPairings} disabled={pairingsLoading} className="gap-2">
                  {pairingsLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</>
                    : <><Zap className="w-4 h-4" /> Run Pairing Analysis</>
                  }
                </Button>
              </GlassCard>
            ) : pairingsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              pairings.map((pair, idx) => (
                <GlassCard key={pair.id} className={`overflow-hidden ${pair.status === "active" ? "border-emerald-200" : ""}`}>
                  {/* Card header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-3">
                      {idx === 0 && <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Top Match</span>}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusStyle(pair.status)}`}>
                        {pair.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground">{pair.recommended_sessions} sessions recommended</span>
                    </div>
                    <CompatibilityRing score={pair.compatibility_score} />
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Mentor → Mentee */}
                    <div className="flex items-stretch gap-3">
                      {/* Mentor */}
                      <div className="flex-1 p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                        <div className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wide">Mentor</div>
                        <div className="font-bold text-foreground">{pair.mentor.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{pair.mentor.cohort} · {pair.mentor.track}</div>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {[
                            { label: "Learning", value: pair.mentor.learning_score },
                            { label: "Demo", value: pair.mentor.demo_score },
                            { label: "AI Dep.", value: pair.mentor.ai_dependency, danger: true },
                          ].map(({ label, value, danger }) => (
                            <div key={label} className="text-center">
                              <div className={`text-sm font-bold tabular-nums ${scoreColor(value, danger)}`}>{value}%</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center px-1">
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>

                      {/* Mentee */}
                      <div className="flex-1 p-4 rounded-xl border border-red-200 bg-red-50/40">
                        <div className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wide">Mentee</div>
                        <div className="font-bold text-foreground">{pair.mentee.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{pair.mentee.cohort} · {pair.mentee.track}</div>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {[
                            { label: "Learning", value: pair.mentee.learning_score },
                            { label: "Demo", value: pair.mentee.demo_score },
                            { label: "AI Dep.", value: pair.mentee.ai_dependency, danger: true },
                          ].map(({ label, value, danger }) => (
                            <div key={label} className="text-center">
                              <div className={`text-sm font-bold tabular-nums ${scoreColor(value, danger)}`}>{value}%</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* AI Reasoning + Projected Outcomes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Why this pairing */}
                      <div className="p-4 rounded-xl border border-border bg-primary/[0.02]">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-foreground">Why This Pairing?</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{pair.match_reason}</p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {pair.focus_areas.map((f) => (
                            <span key={f} className="text-xs px-2 py-0.5 rounded-md border border-primary/20 bg-primary/5 text-primary font-medium">{f}</span>
                          ))}
                        </div>
                      </div>

                      {/* Projected outcomes */}
                      <div className="p-4 rounded-xl border border-border bg-emerald-50/30">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-semibold text-foreground">Expected After 2 Weeks</span>
                        </div>
                        {[
                          { label: "Learning Score", delta: `+${pair.projected_improvement}%`, positive: true },
                          { label: "Demo Performance", delta: "+12%", positive: true },
                          { label: "AI Dependency", delta: "−20%", positive: true },
                        ].map((o) => (
                          <div key={o.label} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                            <span className="text-xs text-muted-foreground">{o.label}</span>
                            <span className="text-xs font-bold text-emerald-600">{o.delta}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button size="sm" className="gap-2 h-8">
                        <ThumbsUp className="w-3.5 h-3.5" /> Approve Pairing
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2 h-8">
                        <Edit2 className="w-3.5 h-3.5" /> Edit Pairing
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2 h-8">
                        <MessageSquare className="w-3.5 h-3.5" /> Message Mentor
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2 h-8 border-red-200 text-red-600 hover:bg-red-50 ml-auto">
                        <ThumbsDown className="w-3.5 h-3.5" /> Reject
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        )}

        {/* OUTREACH TAB */}
        {activeTab === "outreach" && (
          <div className="space-y-4">
            {outLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              (outreachList as Outreach[]).map((item) => {
                const currentStatus = outreachStates[item.id] || item.status;
                const isDone = currentStatus === "resolved" || currentStatus === "acknowledged";
                const isHigh = item.priority === "high";
                return (
                  <GlassCard key={item.id} className={`p-5 ${isDone ? "opacity-60" : ""} ${isHigh && !isDone ? "border-red-200" : ""}`}>
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground">{item.trainee_name}</span>
                        <Badge variant="outline" className={`text-xs ${priorityStyle(item.priority)}`}>
                          {item.priority.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">{currentStatus}</span>
                      </div>
                      {isDone && (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                          <CheckCircle2 className="w-4 h-4" /> {currentStatus}
                        </div>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-foreground mb-1">{item.issue}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">{item.recommendation}</p>

                    {isHigh && currentStatus === "pending" && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-3">
                        <AlertTriangle className="w-3.5 h-3.5" /> High priority — action needed within 24 hours
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {/* Generate AI Message */}
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5"
                        onClick={() => setExpandedMsg(expandedMsg === item.id ? null : item.id)}>
                        <MessageSquare className="w-3 h-3" />
                        {expandedMsg === item.id ? "Hide Message" : "Generate AI Message"}
                      </Button>

                      {!isDone && (
                        <>
                          <Button size="sm" variant="outline"
                            className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                            onClick={() => acknowledgeOutreach(item.id)}>
                            <Clock className="w-3 h-3" /> Acknowledge
                          </Button>
                          <Button size="sm" variant="outline"
                            className="h-7 text-xs gap-1.5 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            onClick={() => resolveOutreach(item.id)}>
                            <CheckCircle2 className="w-3 h-3" /> Resolved
                          </Button>
                        </>
                      )}
                    </div>

                    {expandedMsg === item.id && <MessageGenerator outreach={item} />}
                  </GlassCard>
                );
              })
            )}
          </div>
        )}

      </div>
    </Layout>
  );
}
