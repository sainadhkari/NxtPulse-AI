import { useRef, useState } from "react";
import { useRoute, Link } from "wouter";
import {
  ArrowLeft, Brain, Download, Loader2, MonitorPlay,
  ShieldAlert, TrendingDown, TrendingUp, User
} from "lucide-react";
import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
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
    <div className="bg-card border border-border rounded p-2 text-xs">
      <p className="text-muted-foreground font-mono mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-primary font-bold">{p.value?.toFixed(0)}</p>
      ))}
    </div>
  );
};

async function exportProfilePdf(
  trainee: { name: string; cohort: string; track: string; risk_level: string; learning_score: number; demo_score: number; attendance: number; ai_dependency: number },
  evaluations: any[],
  demos: any[],
  interventions: any[]
) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const overallScore = Math.round((trainee.learning_score + trainee.demo_score + trainee.attendance) / 3);
  const latestEval = evaluations[0];
  const latestDemo = demos[0];

  const printDiv = document.createElement("div");
  printDiv.style.cssText = `
    position: fixed; top: -9999px; left: -9999px;
    width: 794px; padding: 48px; background: #040914;
    font-family: 'Inter', 'Segoe UI', sans-serif; color: #e2e8f0;
  `;

  const riskHex = trainee.risk_level === "high" ? "#ef4444" : trainee.risk_level === "medium" ? "#eab308" : "#10b981";
  const scoreColor = (v: number, danger = false) =>
    danger ? (v > 60 ? "#ef4444" : "#10b981") : v >= 70 ? "#10b981" : v >= 45 ? "#eab308" : "#ef4444";

  const bar = (label: string, value: number, danger = false) => `
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;font-family:monospace">${label}</span>
        <span style="font-size:11px;font-weight:700;color:${scoreColor(value, danger)}">${value}%</span>
      </div>
      <div style="height:5px;background:#1a2744;border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${value}%;background:${scoreColor(value, danger)};border-radius:3px"></div>
      </div>
    </div>`;

  const interventionRows = interventions.length
    ? interventions.map(iv => `
      <tr>
        <td style="padding:8px 12px;font-size:11px;border-bottom:1px solid #1a2744">${iv.issue}</td>
        <td style="padding:8px 12px;font-size:11px;border-bottom:1px solid #1a2744;color:#6b7280">${iv.recommendation}</td>
        <td style="padding:8px 12px;font-size:11px;border-bottom:1px solid #1a2744;text-transform:uppercase;color:${iv.status === "resolved" ? "#10b981" : "#eab308"}">${iv.status}</td>
      </tr>`).join("")
    : `<tr><td colspan="3" style="padding:12px;font-size:11px;color:#6b7280;text-align:center">No active interventions</td></tr>`;

  const evalSection = latestEval ? `
    <div style="margin-top:28px">
      <h3 style="font-size:11px;color:#00f0ff;text-transform:uppercase;letter-spacing:0.12em;font-family:monospace;margin-bottom:14px">LearnGuard AI — Latest Evaluation</h3>
      <div style="background:#0a1628;border:1px solid #1a2744;border-radius:8px;padding:16px">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px">
          <span style="font-size:13px;font-weight:600">${latestEval.topic}</span>
          <span style="font-size:10px;color:#6b7280;font-family:monospace">${new Date(latestEval.evaluated_at).toLocaleDateString("en-IN")}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 32px">
          ${bar("Understanding", latestEval.understanding_score)}
          ${bar("Confidence", latestEval.confidence_score)}
          ${bar("AI Dependency", latestEval.ai_dependency_score, true)}
          ${bar("Readiness", latestEval.readiness_score)}
        </div>
        <p style="font-size:11px;color:#94a3b8;margin-top:12px;line-height:1.6;border-left:2px solid #00f0ff;padding-left:10px">${latestEval.ai_feedback}</p>
      </div>
    </div>` : "";

  const demoSection = latestDemo ? `
    <div style="margin-top:28px">
      <h3 style="font-size:11px;color:#00f0ff;text-transform:uppercase;letter-spacing:0.12em;font-family:monospace;margin-bottom:14px">Demo Intelligence — Latest Report</h3>
      <div style="background:#0a1628;border:1px solid #1a2744;border-radius:8px;padding:16px">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px">
          <span style="font-size:13px;font-weight:600">${latestDemo.topic}</span>
          <span style="font-size:10px;color:#6b7280;font-family:monospace">${new Date(latestDemo.reported_at).toLocaleDateString("en-IN")}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 32px">
          ${bar("Technical", latestDemo.technical_score)}
          ${bar("Communication", latestDemo.communication_score)}
          ${bar("Confidence", latestDemo.confidence_score)}
          ${bar("Teaching", latestDemo.teaching_readiness_score)}
        </div>
        <p style="font-size:11px;color:#94a3b8;margin-top:12px;line-height:1.6;border-left:2px solid #00f0ff;padding-left:10px">${latestDemo.ai_feedback}</p>
      </div>
    </div>` : "";

  printDiv.innerHTML = `
    <div style="border-bottom:1px solid #1a2744;padding-bottom:24px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div style="font-size:10px;color:#00f0ff;text-transform:uppercase;letter-spacing:0.15em;font-family:monospace;margin-bottom:6px">NxtPulse AI — Trainee Report</div>
        <h1 style="font-size:26px;font-weight:800;color:#ffffff;margin:0 0 6px">${trainee.name}</h1>
        <p style="font-size:12px;color:#94a3b8;margin:0">${trainee.track} · ${trainee.cohort}</p>
      </div>
      <div style="text-align:right">
        <div style="font-size:38px;font-weight:800;color:#ffffff">${overallScore}<span style="font-size:18px;color:#6b7280">%</span></div>
        <div style="font-size:10px;color:#6b7280;font-family:monospace;text-transform:uppercase">Overall Score</div>
        <div style="margin-top:8px;padding:4px 12px;border-radius:20px;border:1px solid ${riskHex};background:${riskHex}18;display:inline-block">
          <span style="font-size:10px;font-weight:700;color:${riskHex};text-transform:uppercase;letter-spacing:0.08em">${trainee.risk_level} risk</span>
        </div>
      </div>
    </div>

    <h3 style="font-size:11px;color:#00f0ff;text-transform:uppercase;letter-spacing:0.12em;font-family:monospace;margin-bottom:14px">Performance Metrics</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 48px;background:#0a1628;border:1px solid #1a2744;border-radius:8px;padding:20px">
      ${bar("Learning Score", trainee.learning_score)}
      ${bar("Demo Score", trainee.demo_score)}
      ${bar("Attendance", trainee.attendance)}
      ${bar("AI Dependency", trainee.ai_dependency, true)}
    </div>

    <div style="margin-top:28px">
      <h3 style="font-size:11px;color:#00f0ff;text-transform:uppercase;letter-spacing:0.12em;font-family:monospace;margin-bottom:14px">Active Interventions</h3>
      <table style="width:100%;border-collapse:collapse;background:#0a1628;border:1px solid #1a2744;border-radius:8px;overflow:hidden">
        <thead>
          <tr style="background:#0f1e38">
            <th style="padding:10px 12px;font-size:10px;text-align:left;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;font-family:monospace">Issue</th>
            <th style="padding:10px 12px;font-size:10px;text-align:left;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;font-family:monospace">Recommendation</th>
            <th style="padding:10px 12px;font-size:10px;text-align:left;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;font-family:monospace">Status</th>
          </tr>
        </thead>
        <tbody>${interventionRows}</tbody>
      </table>
    </div>

    ${evalSection}
    ${demoSection}

    <div style="margin-top:36px;padding-top:16px;border-top:1px solid #1a2744;display:flex;justify-content:space-between">
      <span style="font-size:10px;color:#6b7280;font-family:monospace">Generated by NxtPulse AI · SDI Training Management</span>
      <span style="font-size:10px;color:#6b7280;font-family:monospace">${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
    </div>
  `;

  document.body.appendChild(printDiv);
  const canvas = await html2canvas(printDiv, { backgroundColor: "#040914", scale: 2, useCORS: true });
  document.body.removeChild(printDiv);

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = (canvas.height * pdfW) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
  pdf.save(`NxtPulse_${trainee.name.replace(/\s+/g, "_")}_Report.pdf`);
}

export default function TraineeProfile() {
  const [, params] = useRoute("/trainee/:id");
  const id = params?.id || "";
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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

  const handleExport = async () => {
    if (!trainee) return;
    setExporting(true);
    try {
      await exportProfilePdf(trainee, evaluations, demos, interventions);
    } finally {
      setExporting(false);
    }
  };

  if (tLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!trainee) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-muted-foreground font-mono">Trainee not found.</p>
          <Link href="/dashboard/manager" className="text-primary text-sm hover:underline">Back to Dashboard</Link>
        </div>
      </Layout>
    );
  }

  const overallScore = Math.round((trainee.learning_score + trainee.demo_score + trainee.attendance) / 3);

  return (
    <Layout>
      <div ref={contentRef} className="p-6 space-y-6">
        {/* Back + Export */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/manager"
            className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded border border-primary/40 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 hover:border-primary/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</>
            ) : (
              <><Download className="w-3.5 h-3.5" /> Export PDF</>
            )}
          </button>
        </div>

        {/* Hero Card */}
        <GlassCard className="p-6" glowing>
          <div className="flex items-start gap-5 flex-wrap">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h2 className="text-xl font-bold text-foreground">{trainee.name}</h2>
                <span className={`px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest ${riskColor(trainee.risk_level)}`}>
                  {trainee.risk_level} risk
                </span>
                <span className="px-2 py-0.5 rounded border border-border text-[10px] font-mono text-muted-foreground uppercase">
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
                  <div key={iv.id} className="p-3 rounded border border-border bg-card flex items-start gap-3">
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
                <div key={ev.id} className="border border-border rounded p-4 space-y-3">
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
                  <div key={d.id} className="border border-border rounded p-4 space-y-3">
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
                        {d.strengths.map((s: string, i: number) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">{s}</span>
                        ))}
                        {d.weaknesses.map((w: string, i: number) => (
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
