import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Send, Bot, User, Brain, Loader2, AlertTriangle, CheckCircle2, TrendingDown, Zap } from "lucide-react";
import { Layout } from "@/components/layout";
import { GlassCard, NeonTitle } from "@/components/ui/glass-card";
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

function ScoreBar({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  const color = danger
    ? value > 60 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
    : value >= 70 ? "bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
    : value >= 45 ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"
    : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-xs font-bold text-foreground tabular-nums">{value.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-card-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function riskBadge(readiness: number) {
  if (readiness >= 70) return { label: "DEMO READY", cls: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10", icon: CheckCircle2 };
  if (readiness >= 45) return { label: "NEEDS PRACTICE", cls: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10", icon: AlertTriangle };
  return { label: "HIGH RISK", cls: "text-red-400 border-red-500/40 bg-red-500/10", icon: TrendingDown };
}

function EvaluationCard({ ev }: { ev: LearnGuardEvaluation }) {
  const badge = riskBadge(ev.readiness_score);
  const BadgeIcon = badge.icon;
  return (
    <div className="mt-2 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-xs font-mono text-primary/70 uppercase tracking-widest">LearnGuard AI — Evaluation Complete</p>
          <p className="text-base font-bold text-foreground mt-0.5">{ev.trainee_name} <span className="text-muted-foreground font-normal">/ {ev.topic}</span></p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-bold uppercase tracking-widest ${badge.cls}`}>
          <BadgeIcon className="w-3.5 h-3.5" />
          {badge.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ScoreBar label="Understanding" value={ev.understanding_score} />
        <ScoreBar label="Confidence" value={ev.confidence_score} />
        <ScoreBar label="AI Dependency" value={ev.ai_dependency_score} danger />
        <ScoreBar label="Readiness" value={ev.readiness_score} />
      </div>

      <div>
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">Evaluation Questions</p>
        <ul className="space-y-1.5">
          {ev.questions.map((q, i) => (
            <li key={i} className="flex gap-2 text-xs text-foreground/80 leading-relaxed">
              <span className="text-primary/60 font-mono flex-shrink-0">Q{i + 1}.</span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-l-2 border-primary/40 pl-3">
        <p className="text-xs font-mono text-primary/70 uppercase tracking-widest mb-1">AI Feedback</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{ev.ai_feedback}</p>
      </div>
    </div>
  );
}

function parseInput(text: string): { trainee_name: string; topic: string } | null {
  const m = text.match(/evaluate\s+(.+?)\s+on\s+(.+)/i)
    || text.match(/^(.+?)\s*[,|:]\s*(.+)$/);
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
        { type: "bot-error", text: 'Use format: "Evaluate [Trainee Name] on [Topic]" or switch to Form Mode.' },
      ]);
      setInput("");
      return;
    }
    runEvaluate(parsed.trainee_name, parsed.topic);
    setInput("");
  };

  const isPending = evaluate.isPending;

  return (
    <Layout>
      <div className="h-screen flex flex-col overflow-hidden">
        <div className="p-6 border-b border-card-border flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <div>
              <NeonTitle className="text-base">LearnGuard AI</NeonTitle>
              <p className="text-xs text-muted-foreground mt-0.5">On-demand trainee evaluation — generate questions, scores, and AI feedback for any topic</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              data-testid="button-mode-form"
              onClick={() => setMode("form")}
              className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-widest border transition-colors ${mode === "form" ? "bg-primary/20 border-primary/60 text-primary" : "border-card-border text-muted-foreground hover:border-primary/40"}`}
            >
              Form Mode
            </button>
            <button
              data-testid="button-mode-chat"
              onClick={() => setMode("chat")}
              className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-widest border transition-colors ${mode === "chat" ? "bg-primary/20 border-primary/60 text-primary" : "border-card-border text-muted-foreground hover:border-primary/40"}`}
            >
              Chat Mode
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden gap-0">
          {/* Chat / Messages */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <div key={i}>
                  {msg.type === "user" && (
                    <div className="flex justify-end">
                      <div className="flex items-start gap-2 max-w-lg">
                        <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-2.5 text-sm text-foreground">
                          {msg.text}
                        </div>
                        <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5 text-primary" />
                        </div>
                      </div>
                    </div>
                  )}
                  {msg.type === "bot-thinking" && (
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-card border border-card-border flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <GlassCard className="px-4 py-3 max-w-sm">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                          <span>Running LearnGuard AI evaluation...</span>
                        </div>
                      </GlassCard>
                    </div>
                  )}
                  {msg.type === "bot-result" && (
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-card border border-primary/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Zap className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <GlassCard className="p-4 flex-1 max-w-2xl" glowing>
                        <EvaluationCard ev={msg.evaluation} />
                      </GlassCard>
                    </div>
                  )}
                  {msg.type === "bot-error" && (
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      </div>
                      <GlassCard className="px-4 py-3 border-red-500/30 max-w-md">
                        <p className="text-xs text-red-400">{msg.text}</p>
                      </GlassCard>
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-card-border bg-card/30">
              {mode === "form" ? (
                <form onSubmit={handleFormSubmit} className="flex gap-2">
                  <input
                    data-testid="input-trainee-name"
                    value={traineeInput}
                    onChange={(e) => setTraineeInput(e.target.value)}
                    placeholder="Trainee name..."
                    disabled={isPending}
                    className="flex-1 bg-card/60 border border-card-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors font-mono disabled:opacity-50"
                  />
                  <input
                    data-testid="input-topic"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="Topic (e.g. React Hooks, Python Closures)..."
                    disabled={isPending}
                    className="flex-[2] bg-card/60 border border-card-border rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors font-mono disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    data-testid="button-evaluate"
                    disabled={isPending || !traineeInput.trim() || !topicInput.trim()}
                    className="px-4 py-2.5 rounded-md bg-primary text-black font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Evaluate
                  </button>
                </form>
              ) : (
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input
                    data-testid="input-chat"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='e.g. "Evaluate Rahul Verma on React Hooks"'
                    disabled={isPending}
                    className="flex-1 bg-card/60 border border-card-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors font-mono disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    data-testid="button-chat-send"
                    disabled={isPending || !input.trim()}
                    className="px-4 py-2.5 rounded-md bg-primary text-black font-bold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar — Quick Suggestions */}
          <div className="w-56 border-l border-card-border p-4 overflow-y-auto hidden lg:block">
            <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest mb-3">Quick Eval</p>
            <div className="space-y-2">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  data-testid={`button-suggestion-${i}`}
                  onClick={() => runEvaluate(s.trainee, s.topic)}
                  disabled={isPending}
                  className="w-full text-left p-2.5 rounded border border-card-border bg-card/30 hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-40 group"
                >
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">{s.trainee}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5 leading-tight">{s.topic}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
