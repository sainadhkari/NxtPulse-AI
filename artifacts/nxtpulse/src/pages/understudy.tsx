import { useState, useEffect } from "react";
import {
  Users, Bot, Loader2, CheckCircle2, Clock, Sparkles,
  TrendingUp, MessageSquare, Copy, Check, AlertTriangle,
  ArrowRight, Zap, Target
} from "lucide-react";
import { Layout } from "@/components/layout";
import { GlassCard, NeonTitle } from "@/components/ui/glass-card";
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

function priorityColor(p: string) {
  if (p === "high") return "text-red-400 border-red-500/30 bg-red-500/10";
  if (p === "medium") return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
  return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
}

function statusColor(s: string) {
  if (s === "active") return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (s === "scheduled") return "text-blue-400 border-blue-500/30 bg-blue-500/10";
  return "text-muted-foreground border-card-border bg-card/30";
}

function ScorePill({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  const color = danger
    ? value > 60 ? "text-red-400" : "text-emerald-400"
    : value >= 70 ? "text-emerald-400" : value >= 45 ? "text-yellow-400" : "text-red-400";
  return (
    <div className="text-center">
      <p className={`text-base font-bold tabular-nums ${color}`}>{value}%</p>
      <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}

function CompatibilityRing({ score }: { score: number }) {
  const r = 28, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 65 ? "#eab308" : "#00f0ff";
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} stroke="rgba(255,255,255,0.07)" strokeWidth="5" fill="none" />
        <circle cx="32" cy="32" r={r} stroke={color} strokeWidth="5" fill="none"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      </svg>
      <span className="absolute text-sm font-bold tabular-nums" style={{ color }}>{score}%</span>
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
        body: JSON.stringify({
          trainee_name: outreach.trainee_name,
          issue: outreach.issue,
          recommendation: outreach.recommendation,
          tone,
        }),
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
          <button
            key={tone}
            onClick={() => generate(tone)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-primary/30 bg-primary/5 text-primary text-[10px] font-mono uppercase tracking-widest hover:bg-primary/15 transition-all disabled:opacity-40"
          >
            <Sparkles className="w-3 h-3" />
            {tone}
          </button>
        ))}
      </div>

      {open && (
        <div className="rounded border border-card-border bg-card/50 p-3 relative">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> Generating AI message…
            </div>
          ) : (
            <>
              <p className="text-xs text-foreground/90 leading-relaxed pr-6">{msg}</p>
              <button onClick={copy} className="absolute top-2 right-2 text-muted-foreground/50 hover:text-primary transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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

  return (
    <Layout>
      <div className="p-6 space-y-6 overflow-y-auto h-screen">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-primary" />
          <div>
            <NeonTitle className="text-base">Understudy AI</NeonTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI-powered peer mentoring engine — matches high performers with struggling trainees and automates outreach
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {simLoading
            ? Array(4).fill(0).map((_, i) => <div key={i} className="h-24 rounded-lg bg-card/50 border border-card-border animate-pulse" />)
            : sim && [
              { label: "Actions Handled", value: sim.handled_count, icon: CheckCircle2, color: "text-emerald-400" },
              { label: "Pending Outreach", value: sim.pending_actions, icon: Clock, color: "text-yellow-400" },
              { label: "Active Pairings", value: sim.active_pairings ?? 1, icon: Users, color: "text-primary" },
              { label: "Drafts Ready", value: sim.drafts_ready, icon: MessageSquare, color: "text-purple-400" },
            ].map(({ label, value, icon: Icon, color }) => (
              <GlassCard key={label} className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg bg-card/60 border border-card-border flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
                  <p className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider">{label}</p>
                </div>
              </GlassCard>
            ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-card-border pb-0">
          {(["pairings", "outreach"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); if (tab === "pairings" && !pairingsLoaded) loadPairings(); }}
              className={`px-4 py-2.5 text-xs font-mono uppercase tracking-widest border-b-2 transition-colors -mb-px ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "pairings" ? "🔗 Peer Pairings" : "📣 Outreach Queue"}
            </button>
          ))}
        </div>

        {/* PAIRINGS TAB */}
        {activeTab === "pairings" && (
          <div className="space-y-4">
            {!pairingsLoaded ? (
              <GlassCard className="p-10 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">AI Peer Matching Engine</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Analyses learning scores, track alignment, and AI dependency to pair each struggling trainee with their ideal mentor.
                  </p>
                </div>
                <button
                  onClick={loadPairings}
                  disabled={pairingsLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded border border-primary/50 bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 hover:border-primary transition-all disabled:opacity-50"
                >
                  {pairingsLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</>
                    : <><Zap className="w-4 h-4" /> Run Pairing Analysis</>
                  }
                </button>
              </GlassCard>
            ) : pairingsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              pairings.map((pair) => (
                <GlassCard key={pair.id} className={`p-5 ${pair.status === "active" ? "border-emerald-500/30" : ""}`}>
                  <div className="flex items-start gap-4 flex-wrap">
                    {/* Compatibility Ring */}
                    <CompatibilityRing score={pair.compatibility_score} />

                    {/* Mentor + Mentee */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-3">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest ${statusColor(pair.status)}`}>
                          {pair.status}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground/50">{pair.recommended_sessions} sessions recommended</span>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Mentor */}
                        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-lg p-3 flex-1 min-w-[160px]">
                          <p className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-widest mb-1">Mentor</p>
                          <p className="text-sm font-bold text-foreground">{pair.mentor.name}</p>
                          <p className="text-[10px] text-muted-foreground">{pair.mentor.cohort} · {pair.mentor.track}</p>
                          <div className="flex gap-3 mt-2">
                            <ScorePill label="Learning" value={pair.mentor.learning_score} />
                            <ScorePill label="Demo" value={pair.mentor.demo_score} />
                          </div>
                        </div>

                        <ArrowRight className="w-5 h-5 text-primary/50 flex-shrink-0" />

                        {/* Mentee */}
                        <div className="bg-red-500/10 border border-red-500/25 rounded-lg p-3 flex-1 min-w-[160px]">
                          <p className="text-[10px] font-mono text-red-400/70 uppercase tracking-widest mb-1">Mentee</p>
                          <p className="text-sm font-bold text-foreground">{pair.mentee.name}</p>
                          <p className="text-[10px] text-muted-foreground">{pair.mentee.cohort} · {pair.mentee.track}</p>
                          <div className="flex gap-3 mt-2">
                            <ScorePill label="Learning" value={pair.mentee.learning_score} />
                            <ScorePill label="Demo" value={pair.mentee.demo_score} />
                          </div>
                        </div>
                      </div>

                      {/* Focus + Projection */}
                      <div className="flex items-start gap-4 mt-3 flex-wrap">
                        <div className="flex-1">
                          <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-1">Focus Areas</p>
                          <div className="flex flex-wrap gap-1.5">
                            {pair.focus_areas.map((f) => (
                              <span key={f} className="text-[10px] px-2 py-0.5 rounded border border-primary/25 bg-primary/5 text-primary/80">{f}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-1">Projected Gain</p>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-sm font-bold text-emerald-400">+{pair.projected_improvement}%</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[10px] text-muted-foreground/60 mt-2 italic">{pair.match_reason}</p>
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
                return (
                  <GlassCard key={item.id} className={`p-5 ${isDone ? "opacity-60" : ""}`}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-sm font-bold text-foreground">{item.trainee_name}</span>
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest ${priorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground/50 uppercase">{currentStatus}</span>
                        </div>
                        <p className="text-xs font-semibold text-foreground/90 mb-1">{item.issue}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-2">{item.recommendation}</p>

                        {/* AI Message Generator */}
                        <div className="mt-3">
                          <button
                            onClick={() => setExpandedMsg(expandedMsg === item.id ? null : item.id)}
                            className="flex items-center gap-1.5 text-[10px] font-mono text-primary/70 hover:text-primary uppercase tracking-widest transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" />
                            {expandedMsg === item.id ? "Hide" : "Generate AI Message"}
                          </button>
                          {expandedMsg === item.id && <MessageGenerator outreach={item} />}
                        </div>
                      </div>

                      {!isDone && (
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button
                            onClick={() => acknowledgeOutreach(item.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-blue-500/40 bg-blue-500/10 text-blue-400 text-[10px] font-mono uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                          >
                            <Clock className="w-3 h-3" /> Acknowledge
                          </button>
                          <button
                            onClick={() => resolveOutreach(item.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Resolved
                          </button>
                        </div>
                      )}
                      {isDone && (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono">
                          <CheckCircle2 className="w-4 h-4" />
                          {currentStatus}
                        </div>
                      )}
                    </div>
                    {item.priority === "high" && currentStatus === "pending" && (
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-red-400/80 font-mono">
                        <AlertTriangle className="w-3 h-3" /> High priority — action needed within 24 hours
                      </div>
                    )}
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
