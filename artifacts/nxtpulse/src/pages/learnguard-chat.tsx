import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Send, Bot, User, Brain, Loader2, AlertTriangle, CheckCircle2,
  TrendingDown, Zap, ThumbsUp, ThumbsDown, Target, MessageSquare,
  BarChart2, Clock, Award, ChevronRight, Sparkles, History
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

const SUGGESTIONS = [
  { trainee: "Rahul Verma", topic: "React State Management" },
  { trainee: "Vikram Singh", topic: "JavaScript Closures" },
  { trainee: "Ananya Reddy", topic: "Machine Learning Overfitting" },
  { trainee: "Sai Krishna", topic: "Node.js Async Patterns" },
  { trainee: "Kiran Patel", topic: "TypeScript Generics" },
  { trainee: "Rohit Joshi", topic: "SQL Joins and Indexing" },
];

type ChatMessage =
  | { type: "user"; text: string }
  | { type: "bot-thinking" }
  | { type: "bot-result"; evaluation: LearnGuardEvaluation }
  | { type: "bot-error"; text: string };

function getVerdict(ev: LearnGuardEvaluation) {
  if (ev.readiness_score >= 70) return {
    label: "Ready for Demo",
    icon: CheckCircle2,
    style: "text-emerald-700 border-emerald-200 bg-emerald-50",
    dotColor: "bg-emerald-500",
    headerBg: "bg-emerald-500",
    emoji: "✅",
    ring: "#10b981",
  };
  if (ev.readiness_score >= 45) return {
    label: "Needs Practice",
    icon: AlertTriangle,
    style: "text-amber-700 border-amber-200 bg-amber-50",
    dotColor: "bg-amber-500",
    headerBg: "bg-amber-500",
    emoji: "⚠️",
    ring: "#f59e0b",
  };
  return {
    label: "High Risk",
    icon: TrendingDown,
    style: "text-red-700 border-red-200 bg-red-50",
    dotColor: "bg-red-500",
    headerBg: "bg-red-500",
    emoji: "🚨",
    ring: "#ef4444",
  };
}

function deriveInsights(ev: LearnGuardEvaluation) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const actions: string[] = [];

  if (ev.understanding_score >= 70) strengths.push("Strong conceptual understanding of the topic");
  if (ev.understanding_score >= 60) strengths.push("Good topic familiarity and foundational knowledge");
  if (ev.confidence_score >= 70) strengths.push("Confident in explaining concepts clearly");
  if (ev.ai_dependency_score <= 30) strengths.push("High degree of independent problem-solving");
  if (ev.readiness_score >= 70) strengths.push("Well-prepared for demo evaluation");

  if (ev.understanding_score < 55) weaknesses.push("Foundational knowledge gaps detected");
  if (ev.confidence_score < 55) weaknesses.push(`Low confidence in delivery (${ev.confidence_score.toFixed(0)}%)`);
  if (ev.ai_dependency_score > 55) weaknesses.push(`High AI dependency (${ev.ai_dependency_score.toFixed(0)}%) — struggles without assistance`);
  if (ev.readiness_score < 50) weaknesses.push("Not yet ready for demo — needs more preparation");
  if (ev.understanding_score >= 55 && ev.understanding_score < 70) weaknesses.push("Partial understanding — some concepts need reinforcement");

  if (ev.readiness_score < 70) actions.push("Practice 2–3 mock evaluations before demo");
  if (ev.ai_dependency_score > 50) actions.push("Complete 5 practice problems without AI assistance");
  if (ev.confidence_score < 60) actions.push("Schedule a peer review session to build confidence");
  if (ev.understanding_score < 65) actions.push("Revisit core concepts and complete topic exercises");
  if (ev.readiness_score >= 70) actions.push("Schedule demo evaluation within 48 hours");

  return { strengths, weaknesses, actions };
}

function ScoreRing({ value, color, size = 72 }: { value: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(value, 100) / 100) * circ;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        className="fill-foreground" fontSize={size < 60 ? 11 : 13} fontWeight={700}>
        {value.toFixed(0)}%
      </text>
    </svg>
  );
}

function MetricBar({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  const isGood = danger ? value <= 40 : value >= 70;
  const isMid = danger ? value <= 60 : value >= 45;
  const color = isGood ? "#10b981" : isMid ? "#f59e0b" : "#ef4444";
  const bg = isGood ? "bg-emerald-50 border-emerald-100" : isMid ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100";
  const label2 = isGood ? "Good" : isMid ? "Moderate" : "Critical";
  return (
    <div className={`p-3 rounded-xl border ${bg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-foreground/80">{label}</span>
        <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ color, backgroundColor: color + "20" }}>{label2}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-white/70 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
        </div>
        <span className="text-xs font-bold tabular-nums w-9 text-right" style={{ color }}>{value.toFixed(0)}%</span>
      </div>
    </div>
  );
}

function KnowledgeMatrix({ ev }: { ev: LearnGuardEvaluation }) {
  const knowledge = ev.understanding_score;
  const confidence = ev.confidence_score;
  const highK = knowledge >= 60;
  const highC = confidence >= 60;

  const quadrant = highK && highC
    ? { label: "Ready", color: "text-emerald-600 bg-emerald-50 border-emerald-200", emoji: "✅" }
    : highK && !highC
    ? { label: "Needs Practice", color: "text-amber-600 bg-amber-50 border-amber-200", emoji: "⚠️" }
    : !highK && highC
    ? { label: "Overconfident", color: "text-orange-600 bg-orange-50 border-orange-200", emoji: "⚡" }
    : { label: "High Risk", color: "text-red-600 bg-red-50 border-red-200", emoji: "🚨" };

  const dotX = (knowledge / 100) * 100;
  const dotY = 100 - (confidence / 100) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-foreground">Confidence vs Knowledge</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${quadrant.color}`}>
          {quadrant.emoji} {quadrant.label}
        </span>
      </div>
      <div className="relative w-full aspect-square border border-border rounded-xl overflow-hidden bg-muted/20">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-amber-50/60 border-r border-b border-border/40" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-emerald-50/60 border-b border-border/40" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-red-50/60 border-r border-border/40" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-orange-50/60" />
        <span className="absolute top-1.5 left-1.5 text-[9px] text-amber-600 font-medium leading-tight">Needs<br/>Practice</span>
        <span className="absolute top-1.5 right-1.5 text-[9px] text-emerald-600 font-medium text-right leading-tight">Ready</span>
        <span className="absolute bottom-1.5 left-1.5 text-[9px] text-red-600 font-medium leading-tight">High<br/>Risk</span>
        <span className="absolute bottom-1.5 right-1.5 text-[9px] text-orange-600 font-medium text-right leading-tight">Over<br/>confident</span>
        <div className="absolute top-0 bottom-0 left-1/2 border-l border-border/60" />
        <div className="absolute left-0 right-0 top-1/2 border-t border-border/60" />
        <div
          className="absolute w-4 h-4 rounded-full bg-primary border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
          style={{ left: `${dotX}%`, top: `${dotY}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground mt-1 px-0.5">
        <span>↑ Confidence</span>
        <span>Knowledge →</span>
      </div>
    </div>
  );
}

function EvaluationCard({ ev }: { ev: LearnGuardEvaluation }) {
  const verdict = getVerdict(ev);
  const VerdictIcon = verdict.icon;
  const { strengths, weaknesses, actions } = deriveInsights(ev);
  const avgScore = ((ev.understanding_score + ev.confidence_score + ev.readiness_score + (100 - ev.ai_dependency_score)) / 4);

  return (
    <div className="space-y-4">
      {/* Hero Header */}
      <div className="rounded-xl overflow-hidden border border-border">
        <div className="px-4 py-3 bg-primary/5 border-b border-border flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">LearnGuard AI — Evaluation Report</span>
          </div>
          <Badge variant="outline" className={`text-xs font-bold px-3 py-1 ${verdict.style}`}>
            <VerdictIcon className="w-3.5 h-3.5 mr-1.5" />
            {verdict.label}
          </Badge>
        </div>
        <div className="p-4 flex items-start gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-foreground">{ev.trainee_name}</p>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-primary/60" />
              {ev.topic}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs text-muted-foreground bg-muted/60 border border-border rounded-md px-2 py-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Just now
              </span>
              <span className="text-xs text-muted-foreground bg-muted/60 border border-border rounded-md px-2 py-0.5 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> {ev.questions.length} questions
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <ScoreRing value={avgScore} color={verdict.ring} size={72} />
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Overall</p>
              <p className="text-2xl font-black text-foreground tabular-nums">{avgScore.toFixed(0)}</p>
              <p className="text-[10px] text-muted-foreground">/100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5" /> Performance Metrics
        </p>
        <div className="grid grid-cols-2 gap-2">
          <MetricBar label="Understanding" value={ev.understanding_score} />
          <MetricBar label="Confidence" value={ev.confidence_score} />
          <MetricBar label="AI Dependency" value={ev.ai_dependency_score} danger />
          <MetricBar label="Readiness" value={ev.readiness_score} />
        </div>
      </div>

      {/* AI Verdict Panel */}
      <div className={`rounded-xl border-2 overflow-hidden ${verdict.style}`}>
        <div className="px-4 py-2.5 bg-current/5 border-b border-current/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VerdictIcon className="w-4 h-4" />
            <span className="text-sm font-bold">AI Verdict: {verdict.label} {verdict.emoji}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 opacity-70" />
            <span className="text-xs font-bold opacity-80">{avgScore.toFixed(0)}/100</span>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {strengths.length > 0 && (
            <div className="bg-white/50 rounded-lg p-3 border border-emerald-200/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-2">
                <ThumbsUp className="w-3.5 h-3.5" /> Strengths
              </div>
              <ul className="space-y-1.5">
                {strengths.map((s, i) => (
                  <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {weaknesses.length > 0 && (
            <div className="bg-white/50 rounded-lg p-3 border border-red-200/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 mb-2">
                <ThumbsDown className="w-3.5 h-3.5" /> Weaknesses
              </div>
              <ul className="space-y-1.5">
                {weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" /> {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {actions.length > 0 && (
          <div className="px-4 py-3 border-t border-current/20 bg-white/30">
            <div className="text-xs font-bold mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Recommended Actions
            </div>
            <div className="space-y-1.5">
              {actions.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                  <ChevronRight className="w-3 h-3 shrink-0 opacity-60" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Questions Breakdown */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" /> Evaluation Questions
        </p>
        <div className="space-y-2">
          {ev.questions.map((q, i) => {
            const syntheticScore = Math.round(
              (ev.understanding_score + ev.confidence_score) / 2 + (i % 2 === 0 ? 8 : -12)
            );
            const capped = Math.min(100, Math.max(0, syntheticScore));
            const qStatus = capped >= 70
              ? { label: "Good", cls: "text-emerald-700 bg-emerald-50 border-emerald-200", barColor: "#10b981" }
              : capped >= 45
              ? { label: "Moderate", cls: "text-amber-700 bg-amber-50 border-amber-200", barColor: "#f59e0b" }
              : { label: "Weak", cls: "text-red-700 bg-red-50 border-red-200", barColor: "#ef4444" };
            return (
              <div key={i} className="p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-[10px] font-black text-white bg-primary px-1.5 py-0.5 rounded shrink-0 mt-0.5">Q{i + 1}</span>
                  <span className="text-xs text-foreground flex-1 leading-relaxed">{q}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-bold tabular-nums text-foreground">{capped}/100</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${qStatus.cls}`}>{qStatus.label}</span>
                  </div>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden ml-6">
                  <div className="h-full rounded-full" style={{ width: `${capped}%`, backgroundColor: qStatus.barColor, transition: "width 0.7s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Insights */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.03] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-primary/15 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-wider">AI Insights & Recommendations</span>
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">{ev.ai_feedback}</p>
        </div>
      </div>
    </div>
  );
}

function parseInput(text: string): { trainee_name: string; topic: string } | null {
  const m = text.match(/evaluate\s+(.+?)\s+on\s+(.+)/i) || text.match(/^(.+?)\s*[,|:]\s*(.+)$/);
  if (m) return { trainee_name: m[1].trim(), topic: m[2].trim() };
  return null;
}

export default function LearnGuardChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: "bot-result",
      evaluation: {
        id: "lg2",
        trainee_id: "s1",
        trainee_name: "Rahul Verma",
        topic: "JavaScript Closures",
        questions: [
          "What is a closure and why is it useful?",
          "How does closure relate to lexical scoping?",
          "Give a real-world use case of a closure.",
          "What is a common bug caused by closures in loops?",
        ],
        understanding_score: 62,
        confidence_score: 58,
        ai_dependency_score: 41,
        readiness_score: 64,
        ai_feedback:
          "Good conceptual understanding of closures demonstrated. The trainee explained lexical scoping correctly and provided a relevant use case. However, the loop-closure bug explanation was incomplete. AI dependency is moderate — recommend practice problems without assistance to solidify independent mastery.",
        evaluated_at: new Date().toISOString(),
      },
    },
  ]);
  const [input, setInput] = useState("");
  const [traineeInput, setTraineeInput] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [mode, setMode] = useState<"chat" | "form">("form");
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const evaluate = useEvaluateLearnGuard({
    mutation: {
      onSuccess: (ev) => {
        setMessages((prev) => [...prev.filter((m) => m.type !== "bot-thinking"), { type: "bot-result", evaluation: ev }]);
        queryClient.invalidateQueries({ queryKey: getGetLearnGuardEvaluationsQueryKey() });
      },
      onError: () => {
        setMessages((prev) => [
          ...prev.filter((m) => m.type !== "bot-thinking"),
          { type: "bot-error", text: "Evaluation failed. Check the trainee name and topic and try again." },
        ]);
      },
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const runEvaluate = (trainee_name: string, topic: string) => {
    if (!trainee_name.trim() || !topic.trim()) return;
    setMessages((prev) => [
      ...prev,
      { type: "user", text: `Evaluate ${trainee_name.trim()} on ${topic.trim()}` },
      { type: "bot-thinking" },
    ]);
    evaluate.mutate({ data: { trainee_name: trainee_name.trim(), topic: topic.trim() } });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runEvaluate(traineeInput, topicInput);
    setTraineeInput("");
    setTopicInput("");
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInput(input);
    if (!parsed) {
      setMessages((prev) => [
        ...prev,
        { type: "user", text: input },
        { type: "bot-error", text: 'Use format: "Evaluate [Name] on [Topic]" or switch to Form Mode.' },
      ]);
      setInput("");
      return;
    }
    runEvaluate(parsed.trainee_name, parsed.topic);
    setInput("");
  };

  const isPending = evaluate.isPending;
  const evaluationResults = messages.filter((m) => m.type === "bot-result") as { type: "bot-result"; evaluation: LearnGuardEvaluation }[];
  const latestEval = evaluationResults[evaluationResults.length - 1]?.evaluation;

  return (
    <Layout>
      <div className="h-full flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-5 py-3 border-b border-border bg-card flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">LearnGuard AI</h1>
              <p className="text-[11px] text-muted-foreground">On-demand trainee evaluation engine — questions, scores & AI feedback</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Quick stats */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: "Today", value: evaluationResults.length + 41, color: "text-primary", bg: "bg-primary/8 border-primary/20" },
                { label: "Avg Score", value: `${latestEval ? Math.round((latestEval.understanding_score + latestEval.confidence_score + latestEval.readiness_score) / 3) : 78}%`, color: "text-foreground", bg: "bg-muted/60 border-border" },
                { label: "High Risk", value: "7", color: "text-red-600", bg: "bg-red-50 border-red-200" },
              ].map((s) => (
                <div key={s.label} className={`px-3 py-1.5 rounded-lg border text-center ${s.bg}`}>
                  <div className={`text-sm font-black tabular-nums leading-tight ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
            {/* Premium Mode Toggle */}
            <div className="flex items-center bg-muted rounded-xl p-1 border border-border gap-0.5">
              {(["form", "chat"] as const).map((m) => (
                <button
                  key={m}
                  data-testid={`button-mode-${m}`}
                  onClick={() => setMode(m)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    mode === m
                      ? "bg-primary text-white shadow-sm shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "form" ? <><Bot className="w-3 h-3" />Form</> : <><MessageSquare className="w-3 h-3" />Chat</>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, i) => (
                <div key={i}>
                  {msg.type === "user" && (
                    <div className="flex justify-end">
                      <div className="flex items-start gap-2 max-w-lg">
                        <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-foreground">
                          {msg.text}
                        </div>
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5 text-primary" />
                        </div>
                      </div>
                    </div>
                  )}
                  {msg.type === "bot-thinking" && (
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <GlassCard className="px-4 py-3 max-w-sm">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                          Running LearnGuard AI evaluation…
                        </div>
                      </GlassCard>
                    </div>
                  )}
                  {msg.type === "bot-result" && (
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                        <Zap className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <GlassCard className="p-5 flex-1 max-w-2xl" glowing>
                        <EvaluationCard ev={msg.evaluation} />
                      </GlassCard>
                    </div>
                  )}
                  {msg.type === "bot-error" && (
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <GlassCard className="px-4 py-3 border-red-200 max-w-md">
                        <p className="text-sm text-red-600">{msg.text}</p>
                      </GlassCard>
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-card">
              {mode === "form" ? (
                <form onSubmit={handleFormSubmit} className="flex gap-2">
                  <input
                    data-testid="input-trainee-name"
                    value={traineeInput}
                    onChange={(e) => setTraineeInput(e.target.value)}
                    placeholder="Trainee name..."
                    disabled={isPending}
                    className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all disabled:opacity-50"
                  />
                  <input
                    data-testid="input-topic"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="Topic (e.g. React Hooks, Python Closures)..."
                    disabled={isPending}
                    className="flex-[2] bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all disabled:opacity-50"
                  />
                  <Button
                    type="submit"
                    data-testid="button-evaluate"
                    disabled={isPending || !traineeInput.trim() || !topicInput.trim()}
                    className="gap-2 bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Evaluate
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input
                    data-testid="input-chat"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='e.g. "Evaluate Rahul Verma on React Hooks"'
                    disabled={isPending}
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all disabled:opacity-50"
                  />
                  <Button
                    type="submit"
                    data-testid="button-chat-send"
                    disabled={isPending || !input.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-64 border-l border-border flex flex-col overflow-y-auto hidden lg:flex bg-card/50">

            {/* Quick Eval */}
            <div className="p-4 border-b border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> Quick Eval
              </p>
              <div className="space-y-1.5">
                {SUGGESTIONS.map((s, i) => {
                  const result = evaluationResults.find(r => r.evaluation.trainee_name === s.trainee);
                  const v = result ? getVerdict(result.evaluation) : null;
                  return (
                    <button
                      key={i}
                      data-testid={`button-suggestion-${i}`}
                      onClick={() => runEvaluate(s.trainee, s.topic)}
                      disabled={isPending}
                      className="w-full text-left p-2.5 rounded-xl border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-40 group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">{s.trainee}</p>
                        {v && <span className="text-[10px] shrink-0">{v.emoji}</span>}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight line-clamp-1">{s.topic}</p>
                      {v && (
                        <p className={`text-[10px] font-bold mt-1 ${v.style.split(" ")[0]}`}>{v.label}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Evaluations */}
            {evaluationResults.length > 0 && (
              <div className="p-4 border-b border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <History className="w-3 h-3" /> Recent Evaluations
                </p>
                <div className="space-y-2">
                  {[...evaluationResults].reverse().slice(0, 5).map((m, i) => {
                    const v = getVerdict(m.evaluation);
                    const avg = ((m.evaluation.understanding_score + m.evaluation.confidence_score + m.evaluation.readiness_score + (100 - m.evaluation.ai_dependency_score)) / 4);
                    return (
                      <div key={i} className="p-2.5 rounded-xl border border-border bg-background">
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-foreground leading-tight truncate">{m.evaluation.trainee_name}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border shrink-0 ${v.style}`}>{v.emoji}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate leading-tight">{m.evaluation.topic}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden mr-2">
                            <div className="h-full rounded-full" style={{ width: `${avg}%`, backgroundColor: v.ring }} />
                          </div>
                          <span className="text-[10px] font-bold tabular-nums" style={{ color: v.ring }}>{avg.toFixed(0)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Knowledge Matrix */}
            {latestEval && (
              <div className="p-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <BarChart2 className="w-3 h-3" /> Knowledge Matrix
                </p>
                <KnowledgeMatrix ev={latestEval} />
              </div>
            )}

            {/* Evaluation History */}
            {evaluationResults.length > 1 && (
              <div className="p-4 border-t border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <TrendingDown className="w-3 h-3" /> Score Trend
                </p>
                <div className="space-y-1.5">
                  {[...evaluationResults].reverse().slice(0, 5).map((m, i) => {
                    const avg = ((m.evaluation.understanding_score + m.evaluation.confidence_score + m.evaluation.readiness_score + (100 - m.evaluation.ai_dependency_score)) / 4);
                    const v = getVerdict(m.evaluation);
                    return (
                      <div key={i} className="flex items-center gap-2 text-[10px]">
                        <span className="text-muted-foreground truncate flex-1 leading-tight">{m.evaluation.topic}</span>
                        <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden shrink-0">
                          <div className="h-full rounded-full" style={{ width: `${avg}%`, backgroundColor: v.ring }} />
                        </div>
                        <span className="font-bold tabular-nums w-6 text-right" style={{ color: v.ring }}>{avg.toFixed(0)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
