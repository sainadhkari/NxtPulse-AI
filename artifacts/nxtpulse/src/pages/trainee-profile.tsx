import { useRoute, Link } from "wouter";
import { ArrowLeft, Brain, Loader2, MonitorPlay, ShieldAlert, TrendingDown, TrendingUp, User } from "lucide-react";
import { Layout } from "@/components/layout";
import { GlassCard, NeonTitle } from "@/components/ui/glass-card";
import {
  useGetTrainee,
  useGetLearnGuardEvaluations,
  useGetDemoReports,
  useGetInterventions,
  getGetTraineeQueryKey,
  getGetLearnGuardEvaluationsQueryKey,
  getGetDemoReportsQueryKey,
} from "@workspace/api-client-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

function riskColor(level: string) {
  if (level === "high") return "text-red-400 border-red-500/30 bg-red-500/10";
  if (level === "medium") return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
  return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
}

function ScoreBar({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  const color = danger
    ? value > 60 ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" : "bg-emerald-500"
    : value >= 70 ? "bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
    : value >= 45 ? "bg-yellow-500"
    : "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]";
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-xs font-bold tabular-nums text-foreground">{value.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-card-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#040914]/95 border border-card-border rounded p-2 text-xs">
      <p className="text-muted-foreground font-mono mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-primary font-bold">{p.value?.toFixed(0)}</p>
      ))}
    </div>
  );
};

export default function TraineeProfile() {
  const [, params] = useRoute("/trainee/:id");
  const id = params?.id || "";

  const { data: trainee, isLoading: tLoading } = useGetTrainee(id, {
    query: { enabled: !!id, queryKey: getGetTraineeQueryKey(id) },
  });
  const { data: evaluations = [], isLoading: evLoading } = useGetLearnGuardEvaluations(
    { trainee_id: id },
    { query: { enabled: !!id, queryKey: getGetLearnGuardEvaluationsQueryKey({ trainee_id: id }) } }
  );
  const { data: demos = [], isLoading: demoLoading } = useGetDemoReports(
    { trainee_id: id },
    { query: { enabled: !!id, queryKey: getGetDemoReportsQueryKey({ trainee_id: id }) } }
  );
  const { data: allInterventions = [] } = useGetInterventions();
  const interventions = allInterventions.filter((i) => i.trainee_id === id);

  const latestEval = evaluations[0];

  const radarData = latestEval
    ? [
        { metric: "Understanding", value: latestEval.understanding_score },
        { metric: "Confidence", value: latestEval.confidence_score },
        { metric: "AI Safety", value: 100 - latestEval.ai_dependency_score },
        { metric: "Readiness", value: latestEval.readiness_score },
      ]
    : [];

  if (tLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!trainee) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <p className="text-muted-foreground font-mono">Trainee not found.</p>
          <Link href="/dashboard/manager" className="text-primary text-sm hover:underline">Back to Dashboard</Link>
        </div>
      </Layout>
    );
  }

  const overallScore = Math.round((trainee.learning_score + trainee.demo_score + trainee.attendance) / 3);

  return (
    <Layout>
      <div className="p-6 space-y-6 overflow-y-auto h-screen">
        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/manager"
            className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
            data-testid="link-back"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>

        {/* Hero Card */}
        <GlassCard className="p-6" glowing>
          <div className="flex items-start gap-5 flex-wrap">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <NeonTitle className="text-xl">{trainee.name}</NeonTitle>
                <span className={`px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest ${riskColor(trainee.risk_level)}`}>
                  {trainee.risk_level} risk
                </span>
                <span className="px-2 py-0.5 rounded border border-card-border text-[10px] font-mono text-muted-foreground uppercase">
                  {trainee.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{trainee.track} · {trainee.cohort}</p>
              <p className="text-[10px] font-mono text-muted-foreground/50 mt-1">Last active: {trainee.last_active}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold tabular-nums text-foreground">{overallScore}<span className="text-lg text-muted-foreground">%</span></p>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">Overall Score</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <ScoreBar label="Learning" value={trainee.learning_score} />
            <ScoreBar label="Demo Score" value={trainee.demo_score} />
            <ScoreBar label="Attendance" value={trainee.attendance} />
            <ScoreBar label="AI Dependency" value={trainee.ai_dependency} danger />
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-primary" />
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">LearnGuard Snapshot</p>
            </div>
            {evLoading ? (
              <div className="flex items-center justify-center h-48"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "monospace" }} />
                  <Radar dataKey="value" stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.12} strokeWidth={1.5} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-muted-foreground/50 font-mono text-center py-12">No evaluations yet</p>
            )}
            {latestEval && (
              <p className="text-[10px] font-mono text-muted-foreground/50 text-center mt-1">
                Last eval: {latestEval.topic}
              </p>
            )}
          </GlassCard>

          {/* Active Interventions */}
          <GlassCard className="p-5 col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-yellow-400" />
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Active Interventions</p>
              <span className="ml-auto text-xs font-bold tabular-nums text-foreground">{interventions.length}</span>
            </div>
            {interventions.length === 0 ? (
              <p className="text-xs text-muted-foreground/50 font-mono py-6 text-center">No active interventions</p>
            ) : (
              <div className="space-y-2.5">
                {interventions.map((iv) => (
                  <div key={iv.id} className="p-3 rounded border border-card-border bg-card/30 flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${iv.status === "pending" ? "bg-yellow-500" : iv.status === "resolved" ? "bg-emerald-500" : "bg-blue-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{iv.issue}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{iv.recommendation}</p>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-muted-foreground/60 flex-shrink-0">{iv.status}</span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* LearnGuard History */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-primary" />
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">LearnGuard AI — Evaluation History</p>
          </div>
          {evLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : evaluations.length === 0 ? (
            <p className="text-xs text-muted-foreground/50 font-mono text-center py-8">No evaluations on record</p>
          ) : (
            <div className="space-y-4">
              {evaluations.map((ev) => (
                <div key={ev.id} className="border border-card-border rounded p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-sm font-semibold text-foreground">{ev.topic}</p>
                    <p className="text-[10px] font-mono text-muted-foreground/60">{new Date(ev.evaluated_at).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <ScoreBar label="Understanding" value={ev.understanding_score} />
                    <ScoreBar label="Confidence" value={ev.confidence_score} />
                    <ScoreBar label="AI Dependency" value={ev.ai_dependency_score} danger />
                    <ScoreBar label="Readiness" value={ev.readiness_score} />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">{ev.ai_feedback}</p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Demo Reports */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <MonitorPlay className="w-4 h-4 text-primary" />
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Demo Intelligence — Report Timeline</p>
          </div>
          {demoLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : demos.length === 0 ? (
            <p className="text-xs text-muted-foreground/50 font-mono text-center py-8">No demo reports on record</p>
          ) : (
            <div className="space-y-4">
              {demos.map((d) => {
                const avg = Math.round((d.technical_score + d.communication_score + d.confidence_score + d.teaching_readiness_score) / 4);
                const isStrong = avg >= 70;
                return (
                  <div key={d.id} className="border border-card-border rounded p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {isStrong ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                        <p className="text-sm font-semibold text-foreground">{d.topic}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold tabular-nums ${isStrong ? "text-emerald-400" : "text-red-400"}`}>{avg}%</span>
                        <p className="text-[10px] font-mono text-muted-foreground/60">{new Date(d.reported_at).toLocaleDateString("en-IN")}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <ScoreBar label="Technical" value={d.technical_score} />
                      <ScoreBar label="Communication" value={d.communication_score} />
                      <ScoreBar label="Confidence" value={d.confidence_score} />
                      <ScoreBar label="Teaching" value={d.teaching_readiness_score} />
                    </div>
                    {d.strengths.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {d.strengths.map((s, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">{s}</span>
                        ))}
                        {d.weaknesses.map((w, i) => (
                          <span key={`w${i}`} className="text-[10px] px-2 py-0.5 rounded border border-red-500/30 bg-red-500/10 text-red-400">{w}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">{d.ai_feedback}</p>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </Layout>
  );
}
