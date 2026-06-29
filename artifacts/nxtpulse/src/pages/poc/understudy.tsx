import { useState, useEffect } from "react";
import {
  Users, Loader2, CheckCircle2, Clock, Sparkles,
  TrendingUp, MessageSquare, Copy, Check, AlertTriangle,
  ArrowRight, Brain, Award, BarChart3, ThumbsUp, Edit2
} from "lucide-react";
import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

type Outreach = {
  id: string; trainee_id: string; trainee_name: string;
  issue: string; recommendation: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "acknowledged" | "resolved" | "dismissed";
};

const STATIC_PAIRINGS = [
  {
    id: "p1",
    mentor: { name: "Meena Iyer", cohort: "Cohort-6", track: "Python+ML", score: 91 },
    mentee: { name: "Rahul Verma", cohort: "Cohort-7", track: "React+Node", score: 34 },
    matchScore: 82,
    reason: "Strong mentor in React + excellent communication. Meena has previously helped 3 trainees improve demo scores by 20%+.",
    focusAreas: ["Attendance", "Consistency", "Demo Prep"],
    status: "active" as const,
  },
  {
    id: "p2",
    mentor: { name: "Kavitha Rao", cohort: "Cohort-6", track: "React+Node", score: 88 },
    mentee: { name: "Pooja Menon", cohort: "Cohort-7", track: "React+Node", score: 22 },
    matchScore: 79,
    reason: "Same tech track. Kavitha excels at demo confidence. Strong peer communication skills.",
    focusAreas: ["Demo Confidence", "Communication", "Standups"],
    status: "suggested" as const,
  },
  {
    id: "p3",
    mentor: { name: "Ananya Reddy", cohort: "Cohort-8", track: "Data Science", score: 84 },
    mentee: { name: "Vikram Singh", cohort: "Cohort-8", track: "React+Node", score: 28 },
    matchScore: 71,
    reason: "Top performer in same cohort. Ananya has low AI dependency (22%) — ideal model for independent problem-solving.",
    focusAreas: ["AI Dependency", "Hands-on Practice", "Code Review"],
    status: "suggested" as const,
  },
  {
    id: "p4",
    mentor: { name: "Suresh Babu", cohort: "Cohort-6", track: "Python+ML", score: 74 },
    mentee: { name: "Rohit Joshi", cohort: "Cohort-7", track: "Data Science", score: 18 },
    matchScore: 76,
    reason: "Suresh consistently scores above 70% on tasks without AI help. Direct communication style matches Rohit's needs.",
    focusAreas: ["Task Completion", "AI Dependency", "Focus"],
    status: "active" as const,
  },
];

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

function matchColor(score: number) {
  if (score >= 80) return "#10b981";
  if (score >= 70) return "#f59e0b";
  return "#2563eb";
}

function MatchRing({ score }: { score: number }) {
  const r = 26, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = matchColor(score);
  return (
    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} stroke="#e5e7eb" strokeWidth="5" fill="none" />
        <circle cx="32" cy="32" r={r} stroke={color} strokeWidth="5" fill="none"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <div className="text-xs font-bold tabular-nums" style={{ color }}>{score}%</div>
        <div className="text-[8px] text-muted-foreground leading-none">match</div>
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

export default function POCUnderstudyPage() {
  const [outreachList, setOutreachList] = useState<Outreach[]>([]);
  const [outLoading, setOutLoading] = useState(true);
  const [outreachStates, setOutreachStates] = useState<Record<string, string>>({});
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pairings" | "outreach">("pairings");
  const [approvedPairings, setApprovedPairings] = useState<Set<string>>(new Set(["p1", "p4"]));

  useEffect(() => {
    fetch(`${BASE}/api/understudy/outreach`)
      .then((r) => r.json())
      .then((data) => setOutreachList(data))
      .catch(() => setOutreachList([]))
      .finally(() => setOutLoading(false));
  }, []);

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
            Action-oriented peer mentoring — approve pairings and manage outreach for struggling trainees
          </p>
        </div>

        {/* Pairing Success Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Active Pairings", value: approvedPairings.size.toString(), icon: <Users className="w-4 h-4 text-primary" />, color: "text-primary", bg: "bg-primary/8" },
            { label: "Successful Pairings", value: "6", icon: <Award className="w-4 h-4 text-emerald-600" />, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Pending Outreach", value: pendingCount.toString(), icon: <Clock className="w-4 h-4 text-amber-600" />, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((m) => (
            <GlassCard key={m.label} className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${m.bg}`}>{m.icon}</div>
              <div>
                <div className={`text-xl font-bold tabular-nums ${m.color}`}>{m.value}</div>
                <div className="text-xs text-muted-foreground">{m.label}</div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {([
            { key: "pairings", label: "Recommended Pairings", count: STATIC_PAIRINGS.length },
            { key: "outreach", label: "Outreach Queue", count: pendingCount > 0 ? pendingCount : null, urgent: urgentCount > 0 },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.key === "pairings" ? "🔗" : "📣"} {tab.label}
              {tab.count != null && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  "urgent" in tab && tab.urgent ? "bg-red-50 text-red-600" : "bg-primary/10 text-primary"
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* PAIRINGS TAB */}
        {activeTab === "pairings" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              AI-recommended mentor–mentee pairings based on track alignment, performance scores, and communication style.
            </p>
            {STATIC_PAIRINGS.map((pair, idx) => {
              const isApproved = approvedPairings.has(pair.id);
              return (
                <GlassCard key={pair.id} className={`overflow-hidden ${isApproved ? "border-emerald-200" : ""}`}>
                  <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-2 flex-wrap">
                      {idx === 0 && <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Top Match</span>}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusStyle(isApproved ? "active" : pair.status)}`}>
                        {isApproved ? "ACTIVE" : pair.status.toUpperCase()}
                      </span>
                    </div>
                    <MatchRing score={pair.matchScore} />
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Mentor → Mentee */}
                    <div className="flex items-stretch gap-3">
                      <div className="flex-1 p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                        <div className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wide">Mentor</div>
                        <div className="font-bold text-foreground">{pair.mentor.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{pair.mentor.cohort} · {pair.mentor.track}</div>
                        <div className="mt-2 text-xs font-semibold text-emerald-600">{pair.mentor.score}% score</div>
                      </div>
                      <div className="flex items-center px-1">
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 p-4 rounded-xl border border-red-200 bg-red-50/40">
                        <div className="text-xs font-semibold text-red-600 mb-1 uppercase tracking-wide">Mentee</div>
                        <div className="font-bold text-foreground">{pair.mentee.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{pair.mentee.cohort} · {pair.mentee.track}</div>
                        <div className="mt-2 text-xs font-semibold text-red-600">{pair.mentee.score}% score</div>
                      </div>
                    </div>

                    {/* Reason + Focus */}
                    <div className="p-4 rounded-xl border border-border bg-primary/[0.02]">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">Why This Pairing?</span>
                        <span className="text-xs font-semibold text-primary ml-auto">Match: {pair.matchScore}%</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{pair.reason}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {pair.focusAreas.map((f) => (
                          <span key={f} className="text-xs px-2 py-0.5 rounded-md border border-primary/20 bg-primary/5 text-primary font-medium">{f}</span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {!isApproved ? (
                        <Button size="sm" className="gap-2 h-8" onClick={() => setApprovedPairings((s) => new Set([...s, pair.id]))}>
                          <ThumbsUp className="w-3.5 h-3.5" /> Approve Pairing
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Active
                        </div>
                      )}
                      <Button size="sm" variant="outline" className="gap-2 h-8">
                        <Edit2 className="w-3.5 h-3.5" /> Edit Pairing
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2 h-8">
                        <MessageSquare className="w-3.5 h-3.5" /> Message Mentor
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {/* OUTREACH TAB */}
        {activeTab === "outreach" && (
          <div className="space-y-4">
            {outLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : outreachList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Users className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm font-medium">No trainees in outreach queue</p>
              </div>
            ) : (
              outreachList.map((item) => {
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
