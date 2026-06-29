import { useState } from "react";
import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot, Brain, Code2, MessageSquare, Mic, Play,
  Sparkles, Target, Zap, ChevronRight, Lightbulb,
  RefreshCw, Send, Loader2, X, CheckCircle2,
} from "lucide-react";

type Mode = "mock" | "demo" | "questions" | "coding" | "viva" | null;

const PRACTICE_MODES = [
  {
    key: "mock" as Mode,
    icon: Bot,
    label: "Mock Interviewer",
    desc: "Simulate a real SDI interview — technical + communication",
    color: "text-primary bg-primary/10 border-primary/20",
    activeColor: "bg-primary text-white",
    tag: "AI-Powered",
  },
  {
    key: "demo" as Mode,
    icon: Target,
    label: "Demo Simulator",
    desc: "Practice your next demo topic end-to-end with AI feedback",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    activeColor: "bg-amber-500 text-white",
    tag: "Demo Prep",
  },
  {
    key: "questions" as Mode,
    icon: Lightbulb,
    label: "Question Generator",
    desc: "Get practice questions on your weak topics — Closures, SQL, DSA",
    color: "text-violet-600 bg-violet-50 border-violet-200",
    activeColor: "bg-violet-600 text-white",
    tag: "Smart",
  },
  {
    key: "coding" as Mode,
    icon: Code2,
    label: "Coding Practice",
    desc: "No-AI coding challenges — build independence",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    activeColor: "bg-emerald-600 text-white",
    tag: "No AI",
  },
  {
    key: "viva" as Mode,
    icon: Mic,
    label: "Viva Practice",
    desc: "Rapid-fire oral Q&A — build confidence and clarity",
    color: "text-rose-600 bg-rose-50 border-rose-200",
    activeColor: "bg-rose-600 text-white",
    tag: "Verbal",
  },
];

const MOCK_QUESTIONS: Record<NonNullable<Mode>, string[]> = {
  mock: [
    "Explain how the React Virtual DOM works and why it's faster than direct DOM manipulation.",
    "Walk me through how you'd design a RESTful API for a task management app.",
    "What is the difference between synchronous and asynchronous JavaScript? Give examples.",
    "How do you approach debugging a production issue you've never seen before?",
    "Explain the concept of database normalization with a real example.",
  ],
  demo: [
    "Start your demo — introduce the topic and its real-world relevance.",
    "Explain your code step by step without reading from notes.",
    "Handle this edge case in your current demo topic.",
    "What could go wrong in production with this approach?",
    "Summarize the key takeaways from your demo in 2 minutes.",
  ],
  questions: [
    "What is a closure in JavaScript? Write an example using a counter.",
    "Explain the difference between INNER JOIN and LEFT JOIN with a table example.",
    "What is memoization? Implement it in JavaScript without libraries.",
    "How does useCallback differ from useMemo in React?",
    "Write a SQL query to find the second highest salary from an Employees table.",
  ],
  coding: [
    "Build a debounce function from scratch — no Google, no AI.",
    "Implement a stack using two queues in JavaScript.",
    "Write a recursive function to flatten a deeply nested array.",
    "Create a simple event emitter class (subscribe/emit/off) in vanilla JS.",
    "Build a basic memoization decorator without using any libraries.",
  ],
  viva: [
    "What is event delegation in JavaScript?",
    "Explain the React component lifecycle in 30 seconds.",
    "Difference between == and === in JavaScript?",
    "What does 'this' refer to in an arrow function?",
    "Name 3 HTTP status codes and what they mean.",
  ],
};

const RECENT_SESSIONS = [
  { mode: "Mock Interviewer", date: "Jun 25, 2026", score: 74, feedback: "Good technical depth. Work on concise answers." },
  { mode: "Demo Simulator",   date: "Jun 22, 2026", score: 82, feedback: "Confident delivery. Improve edge case coverage." },
  { mode: "Viva Practice",    date: "Jun 20, 2026", score: 68, feedback: "Rushed some answers — slow down and structure." },
];

function PracticeSession({ mode, onClose }: { mode: NonNullable<Mode>; onClose: () => void }) {
  const [qIndex, setQIndex] = useState(0);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const questions = MOCK_QUESTIONS[mode];
  const cfg = PRACTICE_MODES.find((m) => m.key === mode)!;
  const Icon = cfg.icon;

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${cfg.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">{cfg.label}</h3>
            <p className="text-[10px] text-muted-foreground">Question {qIndex + 1} of {questions.length}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/60 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/[0.02] mb-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Question {qIndex + 1}</span>
        </div>
        <p className="text-sm text-foreground font-medium leading-relaxed">{questions[qIndex]}</p>
      </div>

      {/* Answer area */}
      {!answered.has(qIndex) ? (
        <div className="space-y-3">
          <textarea
            className="w-full h-24 text-sm p-3 rounded-xl border border-border bg-card resize-none outline-none focus:border-primary/40 placeholder:text-muted-foreground/40"
            placeholder="Type your answer here or speak your response..."
          />
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 h-8 gap-1.5" onClick={() => setAnswered((prev) => new Set([...prev, qIndex]))}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Submit Answer
            </Button>
            <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => setAnswered((prev) => new Set([...prev, qIndex]))}>
              <Mic className="w-3.5 h-3.5" /> Speak
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40">
            <div className="flex items-center gap-2 mb-1.5">
              <Brain className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">AI Feedback</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Good attempt. Focus on using concrete examples and avoid vague terms. For the next question, aim for a structured response: Definition → Example → Use case.</p>
          </div>
          <div className="flex gap-2">
            {qIndex < questions.length - 1 ? (
              <Button size="sm" className="flex-1 h-8 gap-1.5" onClick={() => setQIndex((i) => i + 1)}>
                Next Question <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button size="sm" className="flex-1 h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={onClose}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Complete Session
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => { setQIndex(0); setAnswered(new Set()); }}>
              <RefreshCw className="w-3 h-3" /> Restart
            </Button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

export default function SDIUnderstudyPage() {
  const [activeMode, setActiveMode] = useState<Mode>(null);

  return (
    <Layout>
      <div className="p-6 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Practice Lab</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Powered by Understudy AI — practice demos, interviews, vivas, and coding challenges</p>
        </div>

        {/* Mode selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRACTICE_MODES.map((m) => {
            const Icon = m.icon;
            const isActive = activeMode === m.key;
            return (
              <button key={m.key} onClick={() => setActiveMode(isActive ? null : m.key)} className="text-left">
                <GlassCard className={`p-5 cursor-pointer transition-all h-full ${isActive ? "ring-2 ring-primary border-primary/30" : "hover:shadow-sm"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${isActive ? "bg-primary text-white border-primary" : `border ${m.color}`}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground">{m.label}</h3>
                        <Badge variant="outline" className="text-[9px] border-border text-muted-foreground">{m.tag}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    <div className={`flex-1 text-xs font-semibold flex items-center gap-1 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {isActive ? <><X className="w-3 h-3" /> Close</> : <><Play className="w-3 h-3" /> Start Practice</>}
                    </div>
                    {!isActive && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />}
                  </div>
                </GlassCard>
              </button>
            );
          })}
        </div>

        {/* Active Practice Session */}
        {activeMode && <PracticeSession mode={activeMode} onClose={() => setActiveMode(null)} />}

        {/* Recent Sessions */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Recent Practice Sessions</h2>
          </div>
          <div className="space-y-3">
            {RECENT_SESSIONS.map((s, i) => (
              <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl border border-border bg-card">
                <div className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground">{s.mode}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{s.date} · {s.feedback}</div>
                </div>
                <div className={`text-sm font-bold tabular-nums shrink-0 ${s.score >= 80 ? "text-emerald-600" : s.score >= 65 ? "text-amber-600" : "text-red-600"}`}>
                  {s.score}%
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* AI Mentor tips */}
        <GlassCard className="p-5 border-primary/20 bg-primary/[0.02]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">AI Mentor Tip</h2>
          </div>
          <p className="text-sm text-foreground font-medium mb-1">Prepare for tomorrow's React Hooks demo.</p>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">Start with the Demo Simulator now — run through your React Hooks explanation 3 times. Focus on the cleanup function in useEffect, which was flagged in your last evaluation.</p>
          <Button size="sm" className="h-8 gap-1.5" onClick={() => setActiveMode("demo")}>
            <Play className="w-3.5 h-3.5" /> Start Demo Simulator
          </Button>
        </GlassCard>

      </div>
    </Layout>
  );
}
