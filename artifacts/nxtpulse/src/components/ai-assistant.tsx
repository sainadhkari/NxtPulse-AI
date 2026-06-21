import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, Trash2, Sparkles, ChevronDown } from "lucide-react";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: Date;
};

const SUGGESTIONS = [
  "Who are my highest-risk trainees?",
  "Summarize Cohort-7 performance",
  "Which trainees have critical AI dependency?",
  "Who should I prioritize today?",
  "Compare all cohorts",
];

function formatContent(text: string) {
  // Bold **text**
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
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <div key={i} className="flex gap-2 text-xs text-foreground/85 leading-relaxed">
              <span className="text-primary mt-0.5 flex-shrink-0">▸</span>
              <span>{formatContent(line.slice(2))}</span>
            </div>
          );
        }
        if (/^#{1,3} /.test(line)) {
          return <p key={i} className="text-xs font-bold text-foreground mt-1">{formatContent(line.replace(/^#+\s/, ""))}</p>;
        }
        if (line.match(/^(🔴|🟡|🟢|⚠️|✅)/)) {
          return <p key={i} className="text-xs font-semibold text-foreground/90 mt-1 leading-relaxed">{formatContent(line)}</p>;
        }
        return <p key={i} className="text-xs text-foreground/80 leading-relaxed">{formatContent(line)}</p>;
      })}
    </div>
  );
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm **NxtPulse GPT**. Ask me anything about your trainees, cohorts, or program — like:\n- Who needs attention today?\n- Summarize Cohort-7\n- Who has the highest AI dependency?",
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const [showSuggestions, setShowSuggestions] = useState(true);
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
    setShowSuggestions(false);

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
    setShowSuggestions(true);
  };

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full bg-primary shadow-[0_0_24px_rgba(0,240,255,0.5)] flex items-center justify-center hover:scale-110 transition-all group"
        >
          <Bot className="w-6 h-6 text-[#0a0f1e]" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0a0f1e] animate-pulse" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 z-[9998] w-[360px] rounded-xl border border-primary/30 bg-[#0a0f1e]/97 shadow-[0_0_40px_rgba(0,240,255,0.12)] flex flex-col overflow-hidden transition-all duration-200 ${
            minimised ? "h-14" : "h-[520px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-card-border bg-primary/5 flex-shrink-0">
            <div className="relative">
              <Bot className="w-5 h-5 text-primary" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0a0f1e]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-primary tracking-wide">NxtPulse GPT</p>
              <p className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest">AI Program Assistant</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear chat"
                className="p-1.5 rounded text-muted-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMinimised((m) => !m)}
                className="p-1.5 rounded text-muted-foreground/40 hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${minimised ? "rotate-180" : ""}`} />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded text-muted-foreground/40 hover:text-foreground hover:bg-white/5 transition-colors"
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
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                        <Bot className="w-3 h-3 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] rounded-xl px-3 py-2.5 ${
                        msg.role === "user"
                          ? "bg-primary/15 border border-primary/25 rounded-tr-sm"
                          : "bg-card/60 border border-card-border rounded-tl-sm"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <p className="text-xs text-foreground/90">{msg.content}</p>
                      ) : (
                        <AssistantMessage content={msg.content} />
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                      <Bot className="w-3 h-3 text-primary" />
                    </div>
                    <div className="bg-card/60 border border-card-border rounded-xl rounded-tl-sm px-3 py-2.5">
                      <div className="flex gap-1 items-center h-4">
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

              {/* Suggestions */}
              {showSuggestions && messages.length <= 1 && (
                <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary/70 text-[10px] font-mono hover:bg-primary/15 hover:text-primary hover:border-primary/40 transition-all"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-3 pb-3 pt-2 border-t border-card-border flex-shrink-0">
                <div className="flex items-center gap-2 bg-card/50 border border-card-border rounded-lg px-3 py-2 focus-within:border-primary/50 transition-colors">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                    placeholder="Ask about trainees, cohorts…"
                    disabled={loading}
                    className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/40 outline-none font-mono disabled:opacity-50"
                  />
                  <button
                    onClick={() => send()}
                    disabled={!input.trim() || loading}
                    className="w-7 h-7 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3 h-3" />}
                  </button>
                </div>
                <p className="text-[9px] font-mono text-muted-foreground/25 text-center mt-1.5">Powered by GPT-4o-mini · knows all 12 trainees</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
