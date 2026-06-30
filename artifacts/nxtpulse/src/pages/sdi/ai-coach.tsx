import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import {
  Bot, Send, Loader2, Trash2, Sparkles, Brain,
  Target, BookOpen, Zap, TrendingUp, ChevronRight,
  MessageSquare, GraduationCap, BarChart3, ArrowUpRight,
  ArrowDownRight, Minus, Lightbulb, Code2, Mic, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

/* ─── Welcome message ───────────────────────────────────────────────────────── */
const WELCOME = `Hi! I'm **NxtPulse AI Coach for SDI**.

I help you:
- improve technical skills
- prepare for demos
- master CCBP topics
- improve communication
- reduce AI dependency
- become instructor-ready

Let's work on your growth together. 🚀`;

/* ─── Quick action categories (5, per brief) ────────────────────────────────── */
const CATEGORIES = [
  {
    id: "technical",
    label: "Technical Learning",
    icon: Code2,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    activeBg: "bg-blue-600 text-white border-blue-600",
    actions: [
      { label: "What should I learn today?", text: "What should I focus on learning today to improve the fastest?" },
      { label: "What are my weak topics?",   text: "What are my weakest technical topics right now with scores?" },
      { label: "Build learning roadmap",     text: "Build a personalised 2-week learning roadmap for my weak areas." },
    ],
  },
  {
    id: "demo",
    label: "Demo Preparation",
    icon: Target,
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-200",
    activeBg: "bg-violet-600 text-white border-violet-600",
    actions: [
      { label: "Help me prepare for demo",  text: "Help me prepare for my next demo — what should I focus on?" },
      { label: "Improve demo performance",  text: "How can I improve my demo performance score from 78%?" },
      { label: "Generate mock questions",   text: "Generate mock demo questions based on my weak SQL and DSA topics." },
    ],
  },
  {
    id: "techos",
    label: "Tech OS",
    icon: Mic,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    activeBg: "bg-amber-500 text-white border-amber-500",
    actions: [
      { label: "Improve communication",      text: "How can I improve my communication score from 72%?" },
      { label: "Improve standup delivery",   text: "Give me a framework and tips to improve my standup delivery." },
      { label: "Improve reporting skills",   text: "How can I write clearer reports and updates to my POC?" },
    ],
  },
  {
    id: "ai",
    label: "AI Dependency",
    icon: Brain,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    activeBg: "bg-emerald-600 text-white border-emerald-600",
    actions: [
      { label: "Analyze my AI dependency",      text: "Analyze my current AI dependency of 34% — is it good or concerning?" },
      { label: "Reduce AI dependency",          text: "Give me a practical plan to reduce my AI dependency further." },
      { label: "Improve independent thinking",  text: "What exercises help me solve problems independently without AI?" },
    ],
  },
  {
    id: "readiness",
    label: "Instructor Growth",
    icon: GraduationCap,
    color: "text-primary",
    bg: "bg-primary/5 border-primary/20",
    activeBg: "bg-primary text-white border-primary",
    actions: [
      { label: "Am I instructor ready?",    text: "Am I ready to become an instructor? Give me an honest assessment." },
      { label: "How can I improve?",        text: "What are the top 3 things I need to improve to reach instructor readiness?" },
      { label: "Build improvement plan",    text: "Build a 30-day improvement plan for me to reach 85% instructor readiness." },
    ],
  },
];

/* ─── AI Insights data ───────────────────────────────────────────────────────── */
const INSIGHTS = [
  { label: "React progress",        value: "+12%",  trend: "up",   sub: "this month",       color: "text-emerald-600", bg: "bg-emerald-50", icon: TrendingUp },
  { label: "AI dependency",         value: "−8%",   trend: "down", sub: "reduced (good)",   color: "text-emerald-600", bg: "bg-emerald-50", icon: ArrowDownRight },
  { label: "Demo confidence",       value: "+5%",   trend: "up",   sub: "last demo",        color: "text-blue-600",    bg: "bg-blue-50",    icon: ArrowUpRight },
  { label: "Communication",         value: "65%",   trend: "flat", sub: "needs improvement",color: "text-amber-600",   bg: "bg-amber-50",   icon: Minus },
];

/* ─── Follow-up chip derivation ─────────────────────────────────────────────── */
const FOLLOW_UP_MAP: Record<string, string[]> = {
  learn:    ["Build my 7-day revision plan", "Which topic should I start first?", "Show my topic scores"],
  demo:     ["Generate mock Q&A for SQL", "How did I do in my last demo?", "Tips for demo confidence"],
  comm:     ["Give me a standup script template", "How do I write better reports?", "Rate my communication"],
  ai:       ["Give me a no-AI coding challenge", "How long to get below 20%?", "Track my progress"],
  ready:    ["What's blocking my readiness?", "Build 30-day improvement plan", "Show full readiness breakdown"],
  default:  ["What should I do next?", "Show my weak areas", "Am I on track this week?"],
};

function deriveFollowUps(query: string): string[] {
  const q = query.toLowerCase();
  if (q.includes("learn") || q.includes("topic") || q.includes("roadmap") || q.includes("revision")) return FOLLOW_UP_MAP.learn;
  if (q.includes("demo") || q.includes("mock") || q.includes("prepare") || q.includes("performance")) return FOLLOW_UP_MAP.demo;
  if (q.includes("commun") || q.includes("standup") || q.includes("report") || q.includes("tech os")) return FOLLOW_UP_MAP.comm;
  if (q.includes("ai") || q.includes("depend") || q.includes("independent") || q.includes("thinking")) return FOLLOW_UP_MAP.ai;
  if (q.includes("ready") || q.includes("instructor") || q.includes("improve") || q.includes("plan")) return FOLLOW_UP_MAP.ready;
  return FOLLOW_UP_MAP.default;
}

/* ─── Markdown-to-React renderer ────────────────────────────────────────────── */
function AssistantMessage({ content }: { content: string }) {
  const lines = content.split("\n").filter(Boolean);
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const parts = (text: string) =>
          text.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
            p.startsWith("**") && p.endsWith("**")
              ? <strong key={j} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>
              : <span key={j}>{p}</span>
          );

        if (line.startsWith("- ") || line.startsWith("• "))
          return (
            <div key={i} className="flex gap-2 text-xs leading-relaxed text-foreground/85">
              <span className="text-primary mt-0.5 shrink-0">▸</span>
              <span>{parts(line.slice(2))}</span>
            </div>
          );
        if (/^#{1,3} /.test(line))
          return <p key={i} className="text-xs font-bold text-foreground mt-1.5">{parts(line.replace(/^#+\s/, ""))}</p>;
        if (line.match(/^(🔴|🟡|🟢|✅|📊|🎯|💡|🚀|⚡|🏆)/))
          return <p key={i} className="text-xs font-semibold text-foreground/90 mt-1 leading-relaxed">{parts(line)}</p>;
        return <p key={i} className="text-xs text-foreground/80 leading-relaxed">{parts(line)}</p>;
      })}
    </div>
  );
}

/* ─── Types ─────────────────────────────────────────────────────────────────── */
type Msg = { id: string; role: "user" | "assistant"; content: string; ts: Date; followUps?: string[] };

/* ─── Main page ─────────────────────────────────────────────────────────────── */
export default function SDIAICoachPage() {
  return (
    <ProtectedRoute allowedRoles={["sdi"]}>
      <Layout>
        <SDICoachContent />
      </Layout>
    </ProtectedRoute>
  );
}

function SDICoachContent() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: "welcome", role: "assistant", content: WELCOME, ts: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `sdi_${Date.now()}`);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");
    setShowWelcome(false);

    const userMsg: Msg = { id: `u_${Date.now()}`, role: "user", content, ts: new Date() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${BASE}/api/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, session_id: sessionId, role: "sdi" }),
      });
      const data = await res.json();
      setMessages((m) => [...m, {
        id: `a_${Date.now()}`,
        role: "assistant",
        content: data.reply || "I'm here to help — what would you like to work on?",
        ts: new Date(),
        followUps: deriveFollowUps(content),
      }]);
    } catch {
      setMessages((m) => [...m, {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: "Sorry, I couldn't connect right now. Try again in a moment.",
        ts: new Date(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    fetch(`${BASE}/api/assistant/chat/${sessionId}`, { method: "DELETE" }).catch(() => {});
    setMessages([{ id: "welcome2", role: "assistant", content: WELCOME, ts: new Date() }]);
    setShowWelcome(true);
    setActiveCategory(null);
  };

  const activeCat = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="flex h-full min-h-0 overflow-hidden">

      {/* ── Left Panel ─────────────────────────────────────────────── */}
      <div className="w-72 shrink-0 border-r border-border bg-sidebar flex flex-col overflow-y-auto hidden md:flex">

        {/* Welcome card */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">NxtPulse AI Coach</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-600 font-medium">Online · SDI Coach</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-primary/[0.04] border border-primary/10 p-3">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Your personal AI technical mentor. Ask me anything about your learning journey, demo prep, or growth.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {["Demos", "CCBP", "Tech OS", "AI Independence", "Readiness"].map((tag) => (
                <span key={tag} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/15">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights panel */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">AI Insights</span>
          </div>
          <div className="space-y-2">
            {INSIGHTS.map(({ label, value, sub, color, bg, icon: Icon }) => (
              <div key={label} className={`flex items-center gap-2.5 p-2.5 rounded-lg ${bg} border border-transparent`}>
                <div className={`w-7 h-7 rounded-lg bg-white/70 flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-foreground truncate">{label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{sub}</p>
                </div>
                <span className={`text-xs font-bold shrink-0 ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="p-4 flex-1">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Quick Actions</span>
          </div>

          {/* Category tabs */}
          <div className="space-y-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <div key={cat.id}>
                  <button
                    onClick={() => setActiveCategory(isActive ? null : cat.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isActive
                        ? cat.activeBg
                        : `${cat.bg} ${cat.color} hover:opacity-80`
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex-1">{cat.label}</span>
                    <ChevronRight className={`w-3 h-3 shrink-0 transition-transform ${isActive ? "rotate-90" : "opacity-40"}`} />
                  </button>

                  {isActive && (
                    <div className="mt-1 ml-2 space-y-1">
                      {cat.actions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => send(action.text)}
                          disabled={loading}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-[11px] font-medium transition-all disabled:opacity-40 ${cat.bg} ${cat.color} hover:opacity-80`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Daily tip */}
          <div className="mt-4 p-3 rounded-xl border border-amber-200 bg-amber-50">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lightbulb className="w-3 h-3 text-amber-600" />
              <span className="text-[10px] font-bold text-amber-700">Daily Tip</span>
            </div>
            <p className="text-[10px] text-amber-800/80 leading-relaxed">
              Solve at least one DSA problem today without AI. Independence builds faster through daily practice than weekly sprints.
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Chat Area ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">

        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-sidebar shrink-0">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">NxtPulse AI Coach · SDI</p>
            <p className="text-[10px] text-muted-foreground">Personal technical mentor — Arjun Kumar · Cohort-7</p>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 shrink-0" onClick={clearChat}>
            <Trash2 className="w-3 h-3" /> Clear
          </Button>
        </div>

        {/* Welcome action strips — shown before first user message */}
        {showWelcome && messages.length <= 1 && (
          <div className="border-b border-border bg-muted/20 px-5 py-3 shrink-0">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Suggested prompts</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "What should I learn today?",   text: "What should I focus on learning today to improve the fastest?" },
                { label: "Am I instructor ready?",       text: "Am I ready to become an instructor? Give me an honest assessment." },
                { label: "Help me prepare for demo",     text: "Help me prepare for my next demo — what should I focus on?" },
                { label: "Analyze my AI dependency",     text: "Analyze my current AI dependency of 34% — is it good or concerning?" },
                { label: "Show my weak topics",          text: "What are my weakest technical topics right now with scores?" },
                { label: "Build revision plan",          text: "Build a personalised 2-week revision plan for SQL and DSA." },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => send(p.text)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[11px] font-medium hover:bg-primary/10 hover:border-primary/40 transition-all disabled:opacity-40"
                >
                  <Sparkles className="w-2.5 h-2.5 shrink-0" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
          {messages.map((msg) => (
            <div key={msg.id}>
              <div className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-primary/10 border border-primary/20"
                }`}>
                  {msg.role === "user"
                    ? <span className="text-xs font-bold">A</span>
                    : <Bot className="w-4 h-4 text-primary" />}
                </div>

                {/* Bubble */}
                <div className={`flex flex-col gap-1 max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-card border border-border rounded-tl-sm"
                  }`}>
                    {msg.role === "user"
                      ? <p className="text-xs leading-relaxed">{msg.content}</p>
                      : <AssistantMessage content={msg.content} />}
                  </div>
                  <span className="text-[9px] text-muted-foreground/40 px-1">
                    {msg.ts.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              {/* Follow-up chips */}
              {msg.role === "assistant" && msg.followUps && msg.followUps.length > 0 && !loading && (
                <div className="flex flex-wrap gap-1.5 mt-2 ml-11">
                  {msg.followUps.map((f) => (
                    <button
                      key={f}
                      onClick={() => send(f)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-medium hover:bg-primary/15 hover:border-primary/40 transition-all"
                    >
                      <ChevronRight className="w-2.5 h-2.5 shrink-0" />
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border px-5 py-4 shrink-0 bg-card">
          <div className="flex items-end gap-2 px-4 py-3 rounded-2xl border border-border bg-background focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask me about demos, weak topics, revision plans, standup delivery, AI dependency..."
              disabled={loading}
              rows={1}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none resize-none min-h-[22px] max-h-28 disabled:opacity-50"
              style={{ scrollbarWidth: "none" }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-sm shadow-primary/30"
            >
              {loading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-[9px] text-muted-foreground/30 text-center mt-2">
            Enter to send · Shift+Enter for new line · Powered by GPT-4o-mini
          </p>
        </div>
      </div>
    </div>
  );
}
