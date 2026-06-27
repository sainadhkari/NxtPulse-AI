import { useState, useRef, useEffect } from "react";
import {
  Bot, X, Send, Loader2, Trash2, Sparkles, ChevronDown,
  ShieldAlert, BarChart3, Users, Target, TrendingUp, Zap,
  ChevronRight, Coffee
} from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: Date;
  followUps?: string[];
};

// ─── Shortcut Categories ──────────────────────────────────────────────────────

const SHORTCUT_CATEGORIES = [
  {
    label: "Risk Monitoring",
    icon: ShieldAlert,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200 hover:bg-red-100",
    activeBg: "bg-red-600 text-white border-red-600",
    shortcuts: [
      "Who are my highest-risk trainees?",
      "Show critical alerts",
      "Who needs attention today?",
      "Which trainees may fail soon?",
    ],
  },
  {
    label: "Cohort Analytics",
    icon: BarChart3,
    color: "text-primary",
    bg: "bg-primary/5 border-primary/20 hover:bg-primary/10",
    activeBg: "bg-primary text-white border-primary",
    shortcuts: [
      "Summarize Cohort-7",
      "Compare all cohorts",
      "Which cohort is weakest?",
      "Show cohort risk trends",
    ],
  },
  {
    label: "Trainee Insights",
    icon: Users,
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-200 hover:bg-violet-100",
    activeBg: "bg-violet-600 text-white border-violet-600",
    shortcuts: [
      "Who has highest AI dependency?",
      "Lowest attendance trainees",
      "Show weak demo performers",
      "Who improved this week?",
    ],
  },
  {
    label: "Recommendations",
    icon: Target,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200 hover:bg-amber-100",
    activeBg: "bg-amber-500 text-white border-amber-500",
    shortcuts: [
      "What should I prioritize today?",
      "Recommend interventions",
      "Which trainees need mentoring?",
      "Suggest action plan",
    ],
  },
  {
    label: "Predictions",
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
    activeBg: "bg-emerald-600 text-white border-emerald-600",
    shortcuts: [
      "Who may become high risk next week?",
      "Predict demo failures",
      "Forecast cohort performance",
      "Burnout risk predictions",
    ],
  },
];

const MORNING_BRIEF = "Generate Morning Brief";

// ─── Follow-up suggestions per keyword ───────────────────────────────────────

function deriveFollowUps(userQuery: string): string[] {
  const q = userQuery.toLowerCase();
  if (q.includes("risk") || q.includes("fail") || q.includes("alert") || q.includes("attention"))
    return ["Why is the top trainee high risk?", "Show intervention plan", "Compare with cohort average", "Notify POC"];
  if (q.includes("cohort") || q.includes("compare") || q.includes("weakest"))
    return ["Which trainees in this cohort need help?", "Show risk trend for this cohort", "What actions should I take?"];
  if (q.includes("ai dependency") || q.includes("attendance") || q.includes("demo"))
    return ["What is causing this?", "Who else has similar issues?", "Recommend corrective actions"];
  if (q.includes("prioritize") || q.includes("mentor") || q.includes("intervention") || q.includes("action"))
    return ["Generate Morning Brief", "Who needs immediate 1-on-1?", "Show predicted outcomes"];
  if (q.includes("predict") || q.includes("forecast") || q.includes("burnout"))
    return ["What interventions can prevent this?", "Show current stress indicators", "Compare predictions vs last week"];
  if (q.includes("brief") || q.includes("morning") || q.includes("summary"))
    return ["Show critical trainees now", "What actions should I start with?", "Who needs a 1-on-1 today?"];
  return ["Tell me more", "What actions should I take?", "Show related risks"];
}

// ─── Text Formatter ───────────────────────────────────────────────────────────

function formatContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i} className="text-foreground font-semibold">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

function AssistantMessage({ content }: { content: string }) {
  const lines = content.split("\n").filter(Boolean);
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("- ") || line.startsWith("• "))
          return (
            <div key={i} className="flex gap-2 text-xs text-foreground/85 leading-relaxed">
              <span className="text-primary mt-0.5 flex-shrink-0">▸</span>
              <span>{formatContent(line.slice(2))}</span>
            </div>
          );
        if (/^#{1,3} /.test(line))
          return <p key={i} className="text-xs font-bold text-foreground mt-1">{formatContent(line.replace(/^#+\s/, ""))}</p>;
        if (line.match(/^(🔴|🟡|🟢|⚠️|✅|📊|🎯|🚨|📈|💡)/))
          return <p key={i} className="text-xs font-semibold text-foreground/90 mt-1 leading-relaxed">{formatContent(line)}</p>;
        return <p key={i} className="text-xs text-foreground/80 leading-relaxed">{formatContent(line)}</p>;
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm **NxtPulse GPT** — your AI program assistant.\n\nI help you:\n- identify trainee risks\n- analyze cohort performance\n- prioritize interventions\n- recommend actions\n- predict future issues\n\nYou can ask me anything about trainees, cohorts, risks, and performance.",
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !minimised) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [messages, open, minimised]);

  useEffect(() => {
    if (open && !minimised) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, minimised]);

  const send = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");
    setShowShortcuts(false);

    const userMsg: Message = { id: `u_${Date.now()}`, role: "user", content, ts: new Date() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${BASE}/api/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, session_id: sessionId }),
      });
      const data = await res.json();
      setMessages((m) => [...m, {
        id: `a_${Date.now()}`,
        role: "assistant",
        content: data.reply || "Sorry, something went wrong.",
        ts: new Date(),
        followUps: deriveFollowUps(content),
      }]);
    } catch {
      setMessages((m) => [...m, {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: "Connection error. Please try again.",
        ts: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    await fetch(`${BASE}/api/assistant/chat/${sessionId}`, { method: "DELETE" });
    setMessages([{
      id: "welcome2",
      role: "assistant",
      content: "Chat cleared. What would you like to know?",
      ts: new Date(),
    }]);
    setShowShortcuts(true);
    setActiveCategory(null);
  };

  const activeCat = SHORTCUT_CATEGORIES.find((c) => c.label === activeCategory);

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 hover:shadow-xl hover:shadow-primary/40 transition-all group"
        >
          <Bot className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 z-[9998] w-[380px] rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 flex flex-col overflow-hidden transition-all duration-200 ${
            minimised ? "h-14" : "h-[580px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-gradient-to-r from-primary/8 to-primary/4 flex-shrink-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-card" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground tracking-wide flex items-center gap-1.5">
                NxtPulse GPT
                <span className="text-[9px] font-normal px-1.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700">Online</span>
              </p>
              <p className="text-[10px] text-muted-foreground">AI Program Intelligence Assistant</p>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={clearChat}
                title="Clear chat"
                className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMinimised((m) => !m)}
                className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${minimised ? "rotate-180" : ""}`} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!minimised && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.map((msg) => (
                  <div key={msg.id}>
                    <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                          <Bot className="w-3 h-3 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 ${
                          msg.role === "user"
                            ? "bg-primary/12 border border-primary/20 rounded-tr-sm"
                            : "bg-background border border-border rounded-tl-sm"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <p className="text-xs text-foreground/90 leading-relaxed">{msg.content}</p>
                        ) : (
                          <AssistantMessage content={msg.content} />
                        )}
                      </div>
                    </div>

                    {/* Follow-up chips after assistant messages */}
                    {msg.role === "assistant" && msg.followUps && msg.followUps.length > 0 && !loading && (
                      <div className="ml-8 mt-2 flex flex-wrap gap-1.5">
                        {msg.followUps.map((f) => (
                          <button
                            key={f}
                            onClick={() => send(f)}
                            disabled={loading}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-medium hover:bg-primary/15 hover:border-primary/40 transition-all disabled:opacity-40"
                          >
                            <ChevronRight className="w-2.5 h-2.5 shrink-0" />
                            {f}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                      <Bot className="w-3 h-3 text-primary" />
                    </div>
                    <div className="bg-background border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1 items-center">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Shortcut Panel */}
              {showShortcuts && messages.length <= 1 && (
                <div className="flex-shrink-0 border-t border-border bg-muted/20">
                  {/* Morning Brief — special CTA */}
                  <div className="px-3 pt-3 pb-2">
                    <button
                      onClick={() => send(MORNING_BRIEF)}
                      disabled={loading}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-primary/30 bg-primary/8 hover:bg-primary/15 hover:border-primary/50 transition-all group disabled:opacity-40"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-sm shadow-primary/30">
                        <Coffee className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-xs font-bold text-primary">Generate Morning Brief</p>
                        <p className="text-[10px] text-muted-foreground">Daily AI summary — risks, actions & priorities</p>
                      </div>
                      <Zap className="w-3.5 h-3.5 text-primary/60 shrink-0 group-hover:text-primary transition-colors" />
                    </button>
                  </div>

                  {/* Category tabs */}
                  <div className="px-3 pb-2 flex gap-1 overflow-x-auto scrollbar-none">
                    {SHORTCUT_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isActive = activeCategory === cat.label;
                      return (
                        <button
                          key={cat.label}
                          onClick={() => setActiveCategory(isActive ? null : cat.label)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                            isActive ? cat.activeBg : cat.bg + " " + cat.color
                          }`}
                        >
                          <Icon className="w-3 h-3 shrink-0" />
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Shortcut buttons for active category */}
                  {activeCat && (
                    <div className="px-3 pb-3 grid grid-cols-2 gap-1.5">
                      {activeCat.shortcuts.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          disabled={loading}
                          className={`text-left px-2.5 py-2 rounded-lg border text-[10px] font-medium leading-snug transition-all disabled:opacity-40 ${activeCat.bg} ${activeCat.color}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Default quick pills when no category selected */}
                  {!activeCat && (
                    <div className="px-3 pb-3 flex flex-wrap gap-1.5">
                      {[
                        "Who are my highest-risk trainees?",
                        "Summarize Cohort-7",
                        "Who needs attention today?",
                      ].map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          disabled={loading}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-border bg-background text-muted-foreground text-[10px] font-medium hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-40"
                        >
                          <Sparkles className="w-2.5 h-2.5 shrink-0" />
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Input */}
              <div className="px-3 pb-3 pt-2 border-t border-border flex-shrink-0 bg-card">
                <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2.5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                    placeholder="Ask about trainees, cohorts, risks, interventions, or predictions..."
                    disabled={loading}
                    className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/40 outline-none disabled:opacity-50"
                  />
                  <button
                    onClick={() => send()}
                    disabled={!input.trim() || loading}
                    className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 shadow-sm shadow-primary/30"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-[9px] text-muted-foreground/30 text-center mt-1.5">Powered by GPT-4o-mini · NxtPulse AI</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
