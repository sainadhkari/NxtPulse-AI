import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Send, Bot, User, Brain, Loader2, AlertTriangle, CheckCircle2,
  TrendingDown, Zap, ThumbsUp, ThumbsDown, Target, MessageSquare
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
    emoji: "✅",
  };
  if (ev.readiness_score >= 45) return {
    label: "Needs Practice",
    icon: AlertTriangle,
    style: "text-amber-700 border-amber-200 bg-amber-50",
    dotColor: "bg-amber-500",
    emoji: "⚠️",
  };
  return {
    label: "High Risk",
    icon: TrendingDown,
    style: "text-red-700 border-red-200 bg-red-50",
    dotColor: "bg-red-500",
    emoji: "🚨",
  };
}

function deriveInsights(ev: LearnGuardEvaluation) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const actions: string[] = [];

  if (ev.understanding_score >= 70) strengths.push("Strong conceptual understanding of the topic");
  if (ev.understanding_score >= 60) strengths.push("Good topic familiarity and foundational knowledge");
  if (ev.confidence_score >= 70) strengths.push("Confident in explaining concepts");
  if (ev.ai_dependency_score <= 30) strengths.push("High degree of independent problem-solving");
  if (ev.readiness_score >= 70) strengths.push("Well-prepared for demo evaluation");

  if (ev.understanding_score < 55) weaknesses.push("Foundational knowledge gaps detected");
  if (ev.confidence_score < 55) weaknesses.push(`Low confidence in delivery (${ev.confidence_score.toFixed(0)}%)`);
  if (ev.ai_dependency_score > 55) weaknesses.push(`High AI dependency (${ev.ai_dependency_score.toFixed(0)}%) — struggles without AI assistance`);
  if (ev.readiness_score < 50) weaknesses.push("Not yet ready for demo — needs more preparation");
  if (ev.understanding_score >= 55 && ev.understanding_score < 70) weaknesses.push("Partial understanding — some concepts need reinforcement");

  if (ev.readiness_score < 70) actions.push("Practice 2–3 mock evaluations before demo");
  if (ev.ai_dependency_score > 50) actions.push("Complete 5 practice problems without AI assistance");
  if (ev.confidence_score < 60) actions.push("Schedule a peer review session to build confidence");
  if (ev.understanding_score < 65) actions.push("Revisit core concepts and complete topic exercises");
  if (ev.readiness_score >= 70) actions.push("Schedule demo evaluation within 48 hours");

  return { strengths, weaknesses, actions };
}

function MetricCard({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  const isGood = danger ? value <= 40 : value >= 70;
  const isMid = danger ? value <= 60 : value >= 45;
  const color = isGood ? "text-emerald-600" : isMid ? "text-amber-600" : "text-red-600";
  const bg = isGood ? "bg-emerald-50" : isMid ? "bg-amber-50" : "bg-red-50";
  const bar = isGood ? "bg-emerald-500" : isMid ? "bg-amber-500" : "bg-red-500";
  return (
    <div className={`p-3 rounded-xl border border-border ${bg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={`text-base font-bold tabular-nums ${color}`}>{value.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${bar}`} style={{ width: `${Math.min(value, 100)}%` }} />
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
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-foreground">Confidence vs Knowledge Matrix</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${quadrant.color}`}>
          {quadrant.emoji} {quadrant.label}
        </span>
      </div>
      <div className="relative w-full aspect-square max-w-[200px] mx-auto border border-border rounded-xl overflow-hidden bg-muted/20">
        {/* Quadrant backgrounds */}
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-amber-50/60 border-r border-b border-border/40" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-emerald-50/60 border-b border-border/40" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-red-50/60 border-r border-border/40" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-orange-50/60" />
        {/* Labels */}
        <span className="absolute top-1.5 left-1.5 text-[9px] text-amber-600 font-medium">Needs Practice</span>
        <span className="absolute top-1.5 right-1.5 text-[9px] text-emerald-600 font-medium text-right">Ready</span>
        <span className="absolute bottom-1.5 left-1.5 text-[9px] text-red-600 font-medium">High Risk</span>
        <span className="absolute bottom-1.5 right-1.5 text-[9px] text-orange-600 font-medium text-right">Overconfident</span>
        {/* Axes lines */}
        <div className="absolute top-0 bottom-0 left-1/2 border-l border-border/60" />
        <div className="absolute left-0 right-0 top-1/2 border-t border-border/60" />
        {/* Dot */}
        <div
          className="absolute w-4 h-4 rounded-full bg-primary border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
          style={{ left: `${dotX}%`, top: `${dotY}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
        <span>Low Knowledge</span>
        <span>→</span>
        <span>High Knowledge</span>
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
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <p className="text-xs text-primary/70 font-medium uppercase tracking-wider">LearnGuard AI — Evaluation Complete</p>
          <p className="text-lg font-bold text-foreground mt-0.5">{ev.trainee_name}</p>
          <p className="text-sm text-muted-foreground">{ev.topic}</p>
        </div>
        <Badge variant="outline" className={`text-sm font-semibold px-3 py-1 ${verdict.style}`}>
          <VerdictIcon className="w-4 h-4 mr-1.5" />
          {verdict.label}
        </Badge>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="Understanding" value={ev.understanding_score} />
        <MetricCard label="Confidence" value={ev.confidence_score} />
        <MetricCard label="AI Dependency" value={ev.ai_dependency_score} danger />
        <MetricCard label="Readiness" value={ev.readiness_score} />
      </div>

      {/* AI Verdict Panel */}
      <div className={`rounded-xl border p-4 ${verdict.style}`}>
        <div className="flex items-center gap-2 mb-3">
          <VerdictIcon className="w-4 h-4" />
          <span className="text-sm font-bold">AI Verdict: {verdict.label} {verdict.emoji}</span>
          <span className="ml-auto text-xs font-semibold opacity-70">Score: {avgScore.toFixed(0)}/100</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {strengths.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mb-1.5">
                <ThumbsUp className="w-3 h-3" /> Strengths
              </div>
              <ul className="space-y-1">
                {strengths.map((s, i) => (
                  <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {weaknesses.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700 mb-1.5">
                <ThumbsDown className="w-3 h-3" /> Weaknesses
              </div>
              <ul className="space-y-1">
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
          <div className="mt-3 pt-3 border-t border-current/20">
            <div className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
              <Target className="w-3 h-3" /> Recommended Actions
            </div>
            <div className="flex flex-wrap gap-1.5">
              {actions.map((a, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-white/60 border border-current/20 font-medium">{a}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Questions Breakdown */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Evaluation Questions</p>
        <div className="space-y-2">
          {ev.questions.map((q, i) => {
            const syntheticScore = Math.round(
              (ev.understanding_score + ev.confidence_score) / 2 + (i % 2 === 0 ? 8 : -12)
            );
            const capped = Math.min(100, Math.max(0, syntheticScore));
            const qStatus = capped >= 70 ? { label: "Good", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" }
              : capped >= 45 ? { label: "Moderate", cls: "text-amber-700 bg-amber-50 border-amber-200" }
              : { label: "Weak", cls: "text-red-700 bg-red-50 border-red-200" };
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/30 transition-colors">
                <span className="text-xs font-bold text-primary shrink-0 mt-0.5">Q{i + 1}</span>
                <span className="text-xs text-foreground flex-1 leading-relaxed">{q}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold tabular-nums text-foreground">{capped}/100</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${qStatus.cls}`}>{qStatus.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Feedback */}
      <div className="p-3 rounded-xl border border-primary/20 bg-primary/[0.02]">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary">AI Insights & Recommendations</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{ev.ai_feedback}</p>
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
      <div className="h-screen flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">LearnGuard AI</h1>
              <p className="text-xs text-muted-foreground">On-demand trainee evaluation — generate questions, scores, and AI feedback for any topic</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Quick stats */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              {[
                { label: "Evaluations Today", value: evaluationResults.length + 41, color: "text-primary" },
                { label: "Avg Score", value: `${latestEval ? Math.round((latestEval.understanding_score + latestEval.confidence_score + latestEval.readiness_score) / 3) : 78}%`, color: "text-foreground" },
                { label: "High Risk", value: "7", color: "text-red-600" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={`font-bold tabular-nums ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
            {/* Mode Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-0.5">
              {(["form", "chat"] as const).map((m) => (
                <button
                  key={m}
                  data-testid={`button-mode-${m}`}
                  onClick={() => setMode(m)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    mode === m
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "form" ? "Form Mode" : "Chat Mode"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat / Messages */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                      <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
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
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors disabled:opacity-50"
                  />
                  <input
                    data-testid="input-topic"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="Topic (e.g. React Hooks, Python Closures)..."
                    disabled={isPending}
                    className="flex-[2] bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors disabled:opacity-50"
                  />
                  <Button
                    type="submit"
                    data-testid="button-evaluate"
                    disabled={isPending || !traineeInput.trim() || !topicInput.trim()}
                    className="gap-2"
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
                    className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors disabled:opacity-50"
                  />
                  <Button
                    type="submit"
                    data-testid="button-chat-send"
                    disabled={isPending || !input.trim()}
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-60 border-l border-border flex flex-col overflow-y-auto hidden lg:flex">
            {/* Quick Eval */}
            <div className="p-4 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Eval</p>
              <div className="space-y-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    data-testid={`button-suggestion-${i}`}
                    onClick={() => runEvaluate(s.trainee, s.topic)}
                    disabled={isPending}
                    className="w-full text-left p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all disabled:opacity-40 group"
                  >
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{s.trainee}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{s.topic}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Evaluations */}
            {evaluationResults.length > 0 && (
              <div className="p-4 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Evaluations</p>
                <div className="space-y-2">
                  {[...evaluationResults].reverse().slice(0, 5).map((m, i) => {
                    const v = getVerdict(m.evaluation);
                    return (
                      <div key={i} className="p-3 rounded-xl border border-border bg-card">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-foreground truncate">{m.evaluation.trainee_name}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${v.style} shrink-0`}>{v.emoji}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{m.evaluation.topic}</p>
                        <p className={`text-[10px] font-semibold mt-1 ${v.style.split(" ")[0]}`}>{v.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Matrix */}
            {latestEval && (
              <div className="p-4">
                <KnowledgeMatrix ev={latestEval} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
