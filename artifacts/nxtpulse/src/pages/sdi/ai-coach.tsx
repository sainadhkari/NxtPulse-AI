import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
  Bot, Send, Loader2, Trash2, Sparkles, Brain,
  Target, BookOpen, Zap, TrendingUp, ChevronRight,
  RefreshCw, Coffee, BarChart3,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const WELCOME = `Hi! I'm **NxtPulse AI Coach** — your personal technical growth assistant.

I help you:
- improve your technical skills and fill knowledge gaps
- prepare for upcoming demos and vivas
- reduce AI dependency and build independence
- improve communication and demo delivery
- track your path to becoming instructor-ready

Ask me anything about your learning journey! 🚀`;

const QUICK_PROMPTS = [
  { label: "Today's Focus",       text: "What should I focus on today to improve fastest?", icon: Coffee },
  { label: "My Weak Areas",       text: "What are my weakest areas right now?", icon: Brain },
  { label: "Improve Demo Score",  text: "How can I improve my demo score from 78%?", icon: Target },
  { label: "Am I Ready?",         text: "Am I ready to become an instructor?", icon: Zap },
  { label: "Revision Plan",       text: "Build a 7-day revision plan for my weak topics", icon: BookOpen },
  { label: "Reduce AI Dependency",text: "How can I reduce my AI dependency to under 25%?", icon: TrendingUp },
  { label: "Week Plan",           text: "Generate my weekly learning plan", icon: BarChart3 },
  { label: "Daily Brief",         text: "Give me my daily AI brief for today", icon: Sparkles },
];

const FOLLOW_UP_MAP: Record<string, string[]> = {
  focus:   ["What's my biggest risk right now?", "What demos are coming up?", "Show revision plan"],
  weak:    ["How do I fix my Closures gap?", "What practice should I do?", "Show topic scores"],
  demo:    ["Practice demo tips", "What did I do wrong last time?", "Simulate demo Q&A"],
  ready:   ["What's blocking my readiness?", "Show checklist", "How long to get to 85%?"],
  plan:    ["Start a practice session", "Which module first?", "Set weekly targets"],
  ai:      ["No-AI challenge ideas", "Track my progress", "Who else reduced fastest?"],
};

type Message = { id: string; role: "user" | "assistant"; content: string; ts: Date; followUps?: string[] };

function deriveFollowUps(query: string): string[] {
  const q = query.toLowerCase();
  if (q.includes("focus") || q.includes("today") || q.includes("brief")) return FOLLOW_UP_MAP.focus;
  if (q.includes("weak") || q.includes("gap") || q.includes("closure") || q.includes("improve")) return FOLLOW_UP_MAP.weak;
  if (q.includes("demo") || q.includes("score") || q.includes("performance")) return FOLLOW_UP_MAP.demo;
  if (q.includes("ready") || q.includes("instructor")) return FOLLOW_UP_MAP.ready;
  if (q.includes("plan") || q.includes("revision") || q.includes("week")) return FOLLOW_UP_MAP.plan;
  if (q.includes("ai") || q.includes("dependency") || q.includes("independent")) return FOLLOW_UP_MAP.ai;
  return ["Tell me more", "What action should I take?", "Show my progress"];
}

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "• $1")
    .replace(/\n/g, "<br/>");
}

export default function SDIAICoachPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome", role: "assistant", content: WELCOME, ts: new Date(),
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `sdi_${Date.now()}`);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = { id: `u_${Date.now()}`, role: "user", content, ts: new Date() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${BASE}/api/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: content,
          context: "SDI (Software Development Instructor). Personal growth platform. Focus: technical skills, demo prep, reducing AI dependency, instructor readiness. Profile: Arjun Kumar, Cohort-7, React+Node track. Attendance: 85%, CCBP: 62%, Demo Score: 78%, AI Dependency: 34%, Instructor Readiness: 72%.",
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, {
        id: `a_${Date.now()}`,
        role: "assistant",
        content: data.reply || "I'm here to help — what would you like to know?",
        ts: new Date(),
        followUps: deriveFollowUps(content),
      }]);
    } catch {
      setMessages((m) => [...m, {
        id: `err_${Date.now()}`, role: "assistant",
        content: "Sorry, I couldn't connect right now. Try again in a moment.",
        ts: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ id: "welcome2", role: "assistant", content: WELCOME, ts: new Date() }]);
  };

  return (
    <Layout>
      <div className="flex flex-col h-screen">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-sidebar shrink-0">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">NxtPulse AI Coach</h1>
            <p className="text-xs text-muted-foreground">Personal SDI growth assistant — always learning, always improving</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </div>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={clearChat}>
              <Trash2 className="w-3 h-3" /> Clear
            </Button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Left panel — quick prompts */}
          <div className="w-60 shrink-0 border-r border-border bg-sidebar p-4 overflow-y-auto hidden md:block">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">Quick Prompts</div>
            <div className="space-y-1.5">
              {QUICK_PROMPTS.map((p) => {
                const Icon = p.icon;
                return (
                  <button key={p.label} onClick={() => send(p.text)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors border border-transparent hover:border-border">
                    <Icon className="w-3.5 h-3.5 shrink-0 text-primary" />
                    <span>{p.label}</span>
                    <ChevronRight className="w-3 h-3 ml-auto opacity-30" />
                  </button>
                );
              })}
            </div>

            {/* Tip */}
            <div className="mt-4 p-3 rounded-xl border border-primary/20 bg-primary/[0.02]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-semibold text-primary">Daily Tip</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Practice speaking your answers out loud before demos — it builds confidence and exposes gaps you don't notice while reading.</p>
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-primary text-white" : "bg-primary/10 border border-primary/20"
                  }`}>
                    {msg.role === "user" ? <span className="text-xs font-bold">A</span> : <Bot className="w-4 h-4 text-primary" />}
                  </div>
                  <div className={`max-w-lg ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-tr-sm"
                        : "bg-card border border-border rounded-tl-sm"
                    }`}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    />
                    {msg.followUps && msg.followUps.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {msg.followUps.map((f) => (
                          <button key={f} onClick={() => send(f)}
                            className="text-[10px] px-2.5 py-1 rounded-lg border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors font-medium">
                            {f}
                          </button>
                        ))}
                      </div>
                    )}
                    <span className="text-[9px] text-muted-foreground/50">
                      {msg.ts.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Thinking…</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-4 shrink-0">
              <div className="flex items-end gap-2 p-3 rounded-2xl border border-border bg-card focus-within:border-primary/40 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Ask me anything — demo prep, weak areas, revision plan, daily focus..."
                  disabled={loading}
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none resize-none disabled:opacity-50 min-h-[24px] max-h-32"
                  style={{ scrollbarWidth: "none" }}
                />
                <Button
                  size="sm" className="h-8 w-8 p-0 shrink-0"
                  disabled={loading || !input.trim()} onClick={() => send()}>
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/40 text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
