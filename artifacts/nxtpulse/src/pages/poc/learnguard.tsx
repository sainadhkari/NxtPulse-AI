import { useState } from "react";
import {
  Brain, AlertTriangle, TrendingDown, Target, Loader2,
  ChevronRight, BookOpen, Zap, Clock, CheckCircle2,
  ThumbsUp, ThumbsDown
} from "lucide-react";
import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useEvaluateLearnGuard,
  getGetLearnGuardEvaluationsQueryKey,
} from "@workspace/api-client-react";
import type { LearnGuardEvaluation } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const WEAKEST_TRAINEES = [
  {
    name: "Rohit Joshi", cohort: "Cohort-7", track: "Data Science",
    understanding: 32, confidence: 28, readiness: 35, aiDep: 94,
    weakTopics: ["SQL Joins", "Data Pipelines", "Model Evaluation"],
    recommendation: "Assign practice module + re-evaluate after 3 days.",
  },
  {
    name: "Pooja Menon", cohort: "Cohort-7", track: "React+Node",
    understanding: 28, confidence: 24, readiness: 30, aiDep: 91,
    weakTopics: ["React State", "API Integration", "Testing"],
    recommendation: "Schedule daily 30-min peer review. Restrict AI tools for 1 week.",
  },
  {
    name: "Vikram Singh", cohort: "Cohort-8", track: "React+Node",
    understanding: 38, confidence: 32, readiness: 36, aiDep: 88,
    weakTopics: ["JavaScript Closures", "Async JS", "Promises"],
    recommendation: "Focus on fundamentals. Pair with Ananya Reddy for hands-on sessions.",
  },
  {
    name: "Rahul Verma", cohort: "Cohort-7", track: "React+Node",
    understanding: 48, confidence: 42, readiness: 51, aiDep: 78,
    weakTopics: ["Closures", "Async JS", "Promises"],
    recommendation: "Assign practice module + re-evaluate after 3 days.",
  },
];

const WEAK_TOPICS = [
  { topic: "JavaScript Closures", trainees: 4, avg: 38, level: "critical" as const },
  { topic: "Async/Await & Promises", trainees: 3, avg: 42, level: "critical" as const },
  { topic: "React State Management", trainees: 3, avg: 47, level: "warning" as const },
  { topic: "SQL Joins & Indexing", trainees: 2, avg: 35, level: "critical" as const },
  { topic: "API Integration", trainees: 2, avg: 52, level: "warning" as const },
  { topic: "Data Pipelines", trainees: 2, avg: 40, level: "critical" as const },
];

const RECENT_EVALUATIONS: (LearnGuardEvaluation & { trainee_cohort?: string })[] = [
  {
    id: "lg1", trainee_id: "t11", trainee_name: "Rohit Joshi", trainee_cohort: "Cohort-7",
    topic: "SQL Joins", questions: ["Q1", "Q2", "Q3"],
    understanding_score: 32, confidence_score: 28, ai_dependency_score: 94, readiness_score: 35,
    ai_feedback: "Critical gaps in SQL fundamentals. Immediate intervention required.",
    evaluated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "lg2", trainee_id: "t1", trainee_name: "Rahul Verma", trainee_cohort: "Cohort-7",
    topic: "JavaScript Closures", questions: ["Q1", "Q2", "Q3", "Q4"],
    understanding_score: 48, confidence_score: 42, ai_dependency_score: 78, readiness_score: 51,
    ai_feedback: "Partial understanding of closures. Needs more practice on loop-closure edge cases.",
    evaluated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "lg3", trainee_id: "t5", trainee_name: "Vikram Singh", trainee_cohort: "Cohort-8",
    topic: "Async/Await Patterns", questions: ["Q1", "Q2", "Q3"],
    understanding_score: 38, confidence_score: 32, ai_dependency_score: 88, readiness_score: 36,
    ai_feedback: "Significant AI dependency detected. Cannot solve without assistance. Requires structured practice plan.",
    evaluated_at: new Date(Date.now() - 10800000).toISOString(),
  },
];

const TRAINEE_OPTIONS = [
  "Rahul Verma", "Sai Krishna", "Kiran Patel", "Vikram Singh",
  "Pooja Menon", "Rohit Joshi", "Arjun Das", "Deepa Nair",
];

function getVerdict(score: number) {
  if (score >= 70) return { label: "Ready", cls: "text-emerald-700 border-emerald-200 bg-emerald-50", color: "#10b981" };
  if (score >= 45) return { label: "Needs Practice", cls: "text-amber-700 border-amber-200 bg-amber-50", color: "#f59e0b" };
  return { label: "High Risk", cls: "text-red-700 border-red-200 bg-red-50", color: "#ef4444" };
}

function ScoreBar({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  const isGood = danger ? value <= 40 : value >= 70;
  const isMid = danger ? value <= 60 : value >= 45;
  const color = isGood ? "#10b981" : isMid ? "#f59e0b" : "#ef4444";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-bold tabular-nums" style={{ color }}>{value.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5">
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h === 1) return "1h ago";
  return `${h}h ago`;
}

export default function POCLearnGuardPage() {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<"weakest" | "topics" | "evaluate">("weakest");
  const [traineeInput, setTraineeInput] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [latestEval, setLatestEval] = useState<LearnGuardEvaluation | null>(null);
  const [recentEvals, setRecentEvals] = useState(RECENT_EVALUATIONS);

  const evaluate = useEvaluateLearnGuard({
    mutation: {
      onSuccess: (ev) => {
        setLatestEval(ev);
        setRecentEvals((prev) => [{ ...ev, trainee_cohort: "Cohort-7" }, ...prev.slice(0, 4)]);
        queryClient.invalidateQueries({ queryKey: getGetLearnGuardEvaluationsQueryKey() });
      },
    },
  });

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!traineeInput || !topicInput) return;
    evaluate.mutate({ data: { trainee_name: traineeInput, topic: topicInput } });
  };

  const inputCls = "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors";

  return (
    <Layout>
      <div className="p-6 space-y-6 overflow-y-auto h-screen">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">LearnGuard AI</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Identify learning gaps, weak trainees, and topics needing support
            </p>
          </div>
          <div className="flex items-center gap-2 bg-muted rounded-xl p-1 border border-border">
            {([
              { key: "weakest", label: "Weakest Trainees" },
              { key: "topics", label: "Weak Topics" },
              { key: "evaluate", label: "Evaluate" },
            ] as const).map((s) => (
              <button key={s.key} onClick={() => setActiveSection(s.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSection === s.key ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "High Risk", value: "4", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
            { label: "Weak Topics", value: WEAK_TOPICS.length.toString(), icon: TrendingDown, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Evaluations Today", value: "42", icon: Brain, color: "text-primary", bg: "bg-primary/8" },
            { label: "Ready for Demo", value: "3", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <GlassCard key={label} className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color} ${bg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className={`text-xl font-bold tabular-nums ${color}`}>{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* WEAKEST TRAINEES */}
        {activeSection === "weakest" && (
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" /> Trainees Needing Learning Support
            </h2>
            {WEAKEST_TRAINEES.map((t) => {
              const verdict = getVerdict(t.readiness);
              return (
                <GlassCard key={t.name} className="p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground text-base">{t.name}</span>
                        <span className="text-xs text-muted-foreground">{t.cohort} · {t.track}</span>
                        <Badge variant="outline" className={`text-xs ${verdict.cls}`}>{verdict.label}</Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 shrink-0"
                      onClick={() => { setActiveSection("evaluate"); setTraineeInput(t.name); }}>
                      <Brain className="w-3 h-3" /> Evaluate Now
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Scores */}
                    <div className="space-y-2.5">
                      <ScoreBar label="Understanding" value={t.understanding} />
                      <ScoreBar label="Confidence" value={t.confidence} />
                      <ScoreBar label="Readiness" value={t.readiness} />
                      <ScoreBar label="AI Dependency" value={t.aiDep} danger />
                    </div>

                    {/* Weak topics + recommendation */}
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Weak Topics</div>
                        <div className="flex flex-wrap gap-1.5">
                          {t.weakTopics.map((topic) => (
                            <span key={topic} className="text-xs px-2 py-0.5 rounded-md border border-red-200 bg-red-50 text-red-700 font-medium">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl border border-primary/20 bg-primary/[0.02]">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Zap className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-semibold text-primary">AI Recommendation</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{t.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}

            {/* Recent evaluations */}
            <div className="mt-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Recent Evaluations
              </h2>
              <div className="space-y-2">
                {recentEvals.map((ev) => {
                  const verdict = getVerdict(ev.readiness_score);
                  return (
                    <div key={ev.id} className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-foreground">{ev.trainee_name}</span>
                          <span className="text-xs text-muted-foreground">{(ev as any).trainee_cohort}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{ev.topic}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{ev.ai_feedback}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={`text-xs ${verdict.cls}`}>{verdict.label}</Badge>
                        <span className="text-xs text-muted-foreground">{timeAgo(ev.evaluated_at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* WEAK TOPICS */}
        {activeSection === "topics" && (
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Topics with Low Comprehension
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {WEAK_TOPICS.map((t) => {
                const isCritical = t.level === "critical";
                return (
                  <div key={t.topic} className={`flex items-center justify-between gap-4 p-4 rounded-xl border ${
                    isCritical ? "border-red-200 bg-red-50/30" : "border-amber-200 bg-amber-50/30"
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isCritical ? "bg-red-500" : "bg-amber-500"}`} />
                        <span className="text-sm font-semibold text-foreground">{t.topic}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{t.trainees} trainees struggling · Avg score: {t.avg}%</div>
                      <div className="mt-2 w-full bg-white/60 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${isCritical ? "bg-red-500" : "bg-amber-500"}`}
                          style={{ width: `${t.avg}%` }} />
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className={`h-8 text-xs gap-1 shrink-0 ${
                      isCritical ? "border-red-200 text-red-600 hover:bg-red-50" : "border-amber-200 text-amber-600 hover:bg-amber-50"
                    }`}>
                      <Target className="w-3 h-3" /> Assign Module
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Topic distribution by cohort */}
            <GlassCard className="p-5 mt-2">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" /> Repeated Failures by Topic
              </h3>
              <div className="space-y-3">
                {WEAK_TOPICS.filter((t) => t.level === "critical").map((t) => (
                  <div key={t.topic} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-36 shrink-0 truncate">{t.topic}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="h-2 rounded-full bg-red-500" style={{ width: `${t.avg}%` }} />
                    </div>
                    <span className="text-xs font-bold text-red-600 w-8 text-right tabular-nums">{t.avg}%</span>
                    <span className="text-xs text-muted-foreground w-16 shrink-0">{t.trainees} trainees</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* EVALUATE */}
        {activeSection === "evaluate" && (
          <div className="space-y-4">
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Run Evaluation</h3>
                  <p className="text-xs text-muted-foreground">Assess a trainee's understanding on a specific topic</p>
                </div>
              </div>
              <form onSubmit={handleEvaluate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Trainee</label>
                    <div className="relative">
                      <select value={traineeInput} onChange={(e) => setTraineeInput(e.target.value)} required className={`${inputCls} appearance-none`}>
                        <option value="">Select trainee...</option>
                        {TRAINEE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Topic to Evaluate</label>
                    <input value={topicInput} onChange={(e) => setTopicInput(e.target.value)}
                      placeholder="e.g. JavaScript Closures" required className={inputCls} />
                  </div>
                </div>
                {/* Quick topic suggestions */}
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Quick select weak topics:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {WEAK_TOPICS.map((t) => (
                      <button key={t.topic} type="button" onClick={() => setTopicInput(t.topic)}
                        className="text-xs px-2 py-0.5 rounded-md border border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                        {t.topic}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" disabled={evaluate.isPending || !traineeInput || !topicInput} className="gap-2">
                  {evaluate.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Run Evaluation
                </Button>
              </form>
            </GlassCard>

            {/* Latest evaluation result */}
            {latestEval && (() => {
              const verdict = getVerdict(latestEval.readiness_score);
              const avg = Math.round((latestEval.understanding_score + latestEval.confidence_score + latestEval.readiness_score) / 3);
              return (
                <GlassCard className="overflow-hidden">
                  <div className={`px-5 py-3 border-b border-border flex items-center justify-between flex-wrap gap-2 bg-muted/20`}>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Evaluation Report</span>
                    </div>
                    <Badge variant="outline" className={`text-xs font-bold ${verdict.cls}`}>{verdict.label}</Badge>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-lg font-bold text-foreground">{latestEval.trainee_name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5 text-primary/60" /> {latestEval.topic}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-black text-foreground tabular-nums">{avg}</div>
                        <div className="text-xs text-muted-foreground">/100 overall</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <ScoreBar label="Understanding" value={latestEval.understanding_score} />
                      <ScoreBar label="Confidence" value={latestEval.confidence_score} />
                      <ScoreBar label="AI Dependency" value={latestEval.ai_dependency_score} danger />
                      <ScoreBar label="Readiness" value={latestEval.readiness_score} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-2">
                          <ThumbsUp className="w-3.5 h-3.5" /> Strengths
                        </div>
                        <ul className="space-y-1">
                          {latestEval.understanding_score >= 60 && <li className="text-xs text-foreground flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" /> Good topic familiarity</li>}
                          {latestEval.confidence_score >= 60 && <li className="text-xs text-foreground flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" /> Confident in delivery</li>}
                          {latestEval.ai_dependency_score <= 40 && <li className="text-xs text-foreground flex items-start gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" /> Strong independent problem-solving</li>}
                          {latestEval.understanding_score < 60 && latestEval.confidence_score < 60 && <li className="text-xs text-muted-foreground">No strengths detected in this evaluation</li>}
                        </ul>
                      </div>
                      <div className="p-3 rounded-xl border border-red-200 bg-red-50/40">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700 mb-2">
                          <ThumbsDown className="w-3.5 h-3.5" /> Areas to Improve
                        </div>
                        <ul className="space-y-1">
                          {latestEval.understanding_score < 55 && <li className="text-xs text-foreground flex items-start gap-1.5"><AlertTriangle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" /> Knowledge gaps detected</li>}
                          {latestEval.confidence_score < 55 && <li className="text-xs text-foreground flex items-start gap-1.5"><AlertTriangle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" /> Low confidence in delivery</li>}
                          {latestEval.ai_dependency_score > 55 && <li className="text-xs text-foreground flex items-start gap-1.5"><AlertTriangle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" /> High AI dependency ({latestEval.ai_dependency_score.toFixed(0)}%)</li>}
                        </ul>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-primary/20 bg-primary/[0.02]">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Zap className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary">AI Feedback</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{latestEval.ai_feedback}</p>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" /> Recommended Actions
                      </div>
                      <div className="space-y-1.5">
                        {latestEval.readiness_score < 70 && <div className="flex items-center gap-2 text-xs text-foreground"><ChevronRight className="w-3 h-3 opacity-60" /> Practice 2–3 mock evaluations before demo</div>}
                        {latestEval.ai_dependency_score > 50 && <div className="flex items-center gap-2 text-xs text-foreground"><ChevronRight className="w-3 h-3 opacity-60" /> Complete 5 practice problems without AI assistance</div>}
                        {latestEval.confidence_score < 60 && <div className="flex items-center gap-2 text-xs text-foreground"><ChevronRight className="w-3 h-3 opacity-60" /> Schedule a peer review session to build confidence</div>}
                        {latestEval.understanding_score < 65 && <div className="flex items-center gap-2 text-xs text-foreground"><ChevronRight className="w-3 h-3 opacity-60" /> Revisit core concepts and complete topic exercises</div>}
                        {latestEval.readiness_score >= 70 && <div className="flex items-center gap-2 text-xs text-emerald-600"><ChevronRight className="w-3 h-3 opacity-60" /> Schedule demo evaluation within 48 hours</div>}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })()}
          </div>
        )}

      </div>
    </Layout>
  );
}
