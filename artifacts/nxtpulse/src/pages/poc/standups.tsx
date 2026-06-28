import { useState } from "react";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare, CheckCircle2, XCircle, MinusCircle,
  AlertCircle, TrendingDown, Zap, Phone, Calendar,
  BarChart3, Users,
} from "lucide-react";

const TRAINEES = [
  {
    id: "t1", name: "Rahul Verma", track: "React + Node",
    attended: 2, missed: 3, total: 5, consecutive_miss: 3,
    participation: "low", comm_score: 42, risk: "high",
    last_standup: "Mon", reason: "No response to messages",
  },
  {
    id: "t2", name: "Sai Krishna", track: "Python + ML",
    attended: 4, missed: 1, total: 5, consecutive_miss: 0,
    participation: "medium", comm_score: 68, risk: "medium",
    last_standup: "Fri", reason: "Missed Thursday",
  },
  {
    id: "t3", name: "Kiran Patel", track: "React + Node",
    attended: 5, missed: 0, total: 5, consecutive_miss: 0,
    participation: "high", comm_score: 84, risk: "low",
    last_standup: "Fri", reason: null,
  },
  {
    id: "t8", name: "Pooja Menon", track: "React + Node",
    attended: 0, missed: 5, total: 5, consecutive_miss: 5,
    participation: "none", comm_score: 11, risk: "high",
    last_standup: null, reason: "On leave",
  },
  {
    id: "t11", name: "Rohit Joshi", track: "Data Science",
    attended: 1, missed: 4, total: 5, consecutive_miss: 4,
    participation: "low", comm_score: 28, risk: "high",
    last_standup: "Mon", reason: "Inactive, short responses",
  },
];

const HISTORY = [
  { day: "Mon", date: "Jun 23", records: [
    { id: "t1", status: "P" }, { id: "t2", status: "P" }, { id: "t3", status: "P" }, { id: "t8", status: "A" }, { id: "t11", status: "P" },
  ]},
  { day: "Tue", date: "Jun 24", records: [
    { id: "t1", status: "A" }, { id: "t2", status: "P" }, { id: "t3", status: "P" }, { id: "t8", status: "A" }, { id: "t11", status: "A" },
  ]},
  { day: "Wed", date: "Jun 25", records: [
    { id: "t1", status: "A" }, { id: "t2", status: "P" }, { id: "t3", status: "P" }, { id: "t8", status: "A" }, { id: "t11", status: "A" },
  ]},
  { day: "Thu", date: "Jun 26", records: [
    { id: "t1", status: "A" }, { id: "t2", status: "A" }, { id: "t3", status: "P" }, { id: "t8", status: "A" }, { id: "t11", status: "A" },
  ]},
  { day: "Fri", date: "Jun 27", records: [
    { id: "t1", status: "A" }, { id: "t2", status: "P" }, { id: "t3", status: "P" }, { id: "t8", status: "A" }, { id: "t11", status: "A" },
  ]},
];

const STATUS_STYLE = {
  P: { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle2 },
  A: { bg: "bg-red-100",     text: "text-red-700",     icon: XCircle     },
};

function participationColor(p: string) {
  if (p === "high") return "text-emerald-700 border-emerald-200 bg-emerald-50";
  if (p === "medium") return "text-amber-700 border-amber-200 bg-amber-50";
  if (p === "low") return "text-red-700 border-red-200 bg-red-50";
  return "text-muted-foreground border-border bg-muted";
}

function riskColor(r: string) {
  if (r === "high") return "text-red-700 border-red-200 bg-red-50";
  if (r === "medium") return "text-amber-700 border-amber-200 bg-amber-50";
  return "text-emerald-700 border-emerald-200 bg-emerald-50";
}

export default function StandupsPage() {
  return (
    <ProtectedRoute allowedRoles={["poc", "manager"]}>
      <Layout>
        <div className="p-6 space-y-6 overflow-y-auto h-screen">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Standups</h1>
            </div>
            <p className="text-sm text-muted-foreground">Trainee participation tracking — Cohort-7 · This Week</p>
          </div>
          <StandupsContent />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

function StandupsContent() {
  const [tab, setTab] = useState<"overview" | "history">("overview");

  const totalAttended = TRAINEES.reduce((a, t) => a + t.attended, 0);
  const totalMissed   = TRAINEES.reduce((a, t) => a + t.missed, 0);
  const totalSessions = TRAINEES.reduce((a, t) => a + t.total, 0);
  const avgComm = Math.round(TRAINEES.reduce((a, t) => a + t.comm_score, 0) / TRAINEES.length);
  const atRisk  = TRAINEES.filter((t) => t.risk === "high" || t.consecutive_miss >= 3).length;

  return (
    <div className="space-y-5">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Sessions Attended", value: `${totalAttended}/${totalSessions}`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: "" },
          { label: "Sessions Missed",   value: totalMissed,  icon: XCircle,      color: "text-red-500",     bg: "bg-red-50",     border: "border-red-200" },
          { label: "Avg Comm Score",    value: `${avgComm}%`, icon: BarChart3,    color: "text-primary",    bg: "bg-primary/10", border: "" },
          { label: "Disengaged",        value: atRisk,       icon: AlertCircle,  color: "text-amber-500",  bg: "bg-amber-50",   border: "border-amber-200" },
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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["overview", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t === "overview" ? "Trainee Overview" : "Weekly History"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-3">
          {TRAINEES.sort((a, b) => b.consecutive_miss - a.consecutive_miss).map((t) => {
            const pct = Math.round((t.attended / t.total) * 100);
            const isAlert = t.consecutive_miss >= 3;
            return (
              <div key={t.id} className={`rounded-xl border p-5 ${isAlert ? "border-red-200 bg-red-50/20" : "border-border"}`}>
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    t.risk === "high" ? "bg-red-100 text-red-700" : t.risk === "medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {t.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-foreground">{t.name}</span>
                      <Badge variant="outline" className={`text-xs ${riskColor(t.risk)}`}>{t.risk.toUpperCase()} RISK</Badge>
                      <Badge variant="outline" className={`text-xs ${participationColor(t.participation)}`}>
                        {t.participation.toUpperCase()} PARTICIPATION
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{t.track}</p>

                    {/* Attendance bar */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444" }} />
                      </div>
                      <span className="text-xs font-semibold tabular-nums w-20 shrink-0">
                        {t.attended}/{t.total} attended ({pct}%)
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Comm score: <span className={`font-semibold ${t.comm_score >= 70 ? "text-emerald-600" : t.comm_score >= 50 ? "text-amber-600" : "text-red-600"}`}>{t.comm_score}%</span></span>
                      {t.consecutive_miss > 0 && (
                        <span className="text-red-600 font-medium">{t.consecutive_miss} consecutive misses</span>
                      )}
                      {t.last_standup && <span>Last: {t.last_standup}</span>}
                      {t.reason && <span className="text-muted-foreground italic">"{t.reason}"</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                      <Phone className="w-3 h-3" /> Call
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                      <Calendar className="w-3 h-3" /> 1:1
                    </Button>
                  </div>
                </div>

                {/* AI Alert */}
                {isAlert && (
                  <div className="mt-4 flex items-start gap-3 p-3 rounded-lg bg-red-100/50 border border-red-200">
                    <Zap className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-semibold text-red-700">AI Recommendation: </span>
                      <span className="text-xs text-red-700">
                        {t.consecutive_miss >= 5
                          ? "Escalate to Manager — this trainee has not attended any standup this week. Immediate intervention required."
                          : `Schedule an immediate 1-on-1 call. ${t.consecutive_miss} consecutive misses indicates active disengagement.`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "history" && (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trainee</th>
                  {HISTORY.map((h) => (
                    <th key={h.day} className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      <div>{h.day}</div>
                      <div className="font-normal normal-case">{h.date}</div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {TRAINEES.map((t) => {
                  const pct = Math.round((t.attended / t.total) * 100);
                  return (
                    <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.track}</div>
                      </td>
                      {HISTORY.map((h) => {
                        const rec = h.records.find((r) => r.id === t.id);
                        const status = rec?.status as "P" | "A" || "A";
                        const style = STATUS_STYLE[status];
                        const Icon = style.icon;
                        return (
                          <td key={h.day} className="px-4 py-3 text-center">
                            <div className={`w-7 h-7 rounded-lg ${style.bg} flex items-center justify-center mx-auto`}>
                              <Icon className={`w-3.5 h-3.5 ${style.text}`} />
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold tabular-nums ${pct >= 80 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-red-600"}`}>{pct}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border bg-muted/20 flex items-center gap-4">
            {[
              { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-100", label: "Attended" },
              { icon: XCircle,      color: "text-red-600 bg-red-100",         label: "Missed" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded ${l.color} flex items-center justify-center`}>
                  <l.icon className="w-3 h-3" />
                </div>
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Disengaged Summary */}
      <GlassCard className="p-5 border-red-200 bg-red-50/10">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-red-500" />
          <h3 className="text-sm font-semibold text-foreground">Disengaged Trainees — Needs Immediate Action</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TRAINEES.filter((t) => t.consecutive_miss >= 3).map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-red-200 bg-red-50">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-sm font-bold shrink-0">
                {t.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{t.name}</div>
                <div className="text-xs text-red-600">Missed {t.consecutive_miss} consecutive standups</div>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-red-200 text-red-600 hover:bg-red-100 shrink-0">
                <Phone className="w-3 h-3" /> Reach out
              </Button>
            </div>
          ))}
        </div>
      </GlassCard>

    </div>
  );
}
