import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Search, X, User, LayoutDashboard, Brain, BarChart3, Activity, Users, ShieldAlert, Bot, ArrowRight } from "lucide-react";
import { useGetTrainees } from "@workspace/api-client-react";

type Trainee = {
  id: string;
  name: string;
  cohort: string;
  track: string;
  risk_level: "high" | "medium" | "low";
  learning_score: number;
  attendance: number;
};

const PAGES = [
  { label: "Command Center",   href: "/dashboard/manager", icon: LayoutDashboard, hint: "Manager dashboard" },
  { label: "Cohort Compare",   href: "/cohorts",            icon: Users,          hint: "Compare cohort performance" },
  { label: "Interventions",    href: "/interventions",      icon: ShieldAlert,    hint: "Manage risk interventions" },
  { label: "Understudy AI",    href: "/understudy",         icon: Bot,            hint: "Peer mentoring engine" },
  { label: "LearnGuard AI",    href: "/learnguard",         icon: Brain,          hint: "Evaluate trainee topics" },
  { label: "Executive Insights", href: "/insights",         icon: BarChart3,      hint: "Program analytics" },
  { label: "Wellness AI",      href: "/wellness",           icon: Activity,       hint: "Wellness monitoring" },
];

function riskColor(r: string) {
  if (r === "high")   return "text-red-400 bg-red-500/10 border-red-500/30";
  if (r === "medium") return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
  return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();
  const { data: trainees = [] } = useGetTrainees();

  const q = query.trim().toLowerCase();

  const matchedTrainees = q
    ? (trainees as Trainee[]).filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.cohort.toLowerCase().includes(q) ||
          t.track.toLowerCase().includes(q) ||
          t.risk_level.toLowerCase().includes(q)
      )
    : [];

  const matchedPages = PAGES.filter(
    (p) => !q || p.label.toLowerCase().includes(q) || p.hint.toLowerCase().includes(q)
  );

  const totalResults = matchedTrainees.length + matchedPages.length;

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      setSelectedIdx(0);
      setLocation(href);
    },
    [setLocation]
  );

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIdx(0);
    }
  }, [open]);

  // Arrow key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, totalResults - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      // Trainees first, then pages
      if (selectedIdx < matchedTrainees.length) {
        navigate(`/trainee/${matchedTrainees[selectedIdx].id}`);
      } else {
        const pageIdx = selectedIdx - matchedTrainees.length;
        if (matchedPages[pageIdx]) navigate(matchedPages[pageIdx].href);
      }
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl mx-4 rounded-xl border border-primary/30 bg-[#0a0f1e]/95 shadow-[0_0_40px_rgba(0,240,255,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-card-border">
          <Search className="w-4 h-4 text-primary flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search trainees, cohorts, pages…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none font-mono"
          />
          <div className="flex items-center gap-1.5">
            {query && (
              <button onClick={() => setQuery("")} className="text-muted-foreground/40 hover:text-muted-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-card-border text-[10px] font-mono text-muted-foreground/50">ESC</kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {/* Trainees */}
          {matchedTrainees.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">
                Trainees
              </p>
              {matchedTrainees.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => navigate(`/trainee/${t.id}`)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    selectedIdx === i ? "bg-primary/10" : "hover:bg-white/5"
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground/60 font-mono">{t.cohort} · {t.track}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-widest ${riskColor(t.risk_level)}`}>
                      {t.risk_level}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground/50">{t.learning_score}%</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground/30" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Pages */}
          {matchedPages.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">
                {q ? "Pages" : "Quick Navigate"}
              </p>
              {matchedPages.map((page, i) => {
                const absIdx = matchedTrainees.length + i;
                return (
                  <button
                    key={page.href}
                    onClick={() => navigate(page.href)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      selectedIdx === absIdx ? "bg-primary/10" : "hover:bg-white/5"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-card/80 border border-card-border flex items-center justify-center flex-shrink-0">
                      <page.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground/90">{page.label}</p>
                      <p className="text-[10px] text-muted-foreground/50 font-mono">{page.hint}</p>
                    </div>
                    <ArrowRight className="w-3 h-3 text-muted-foreground/30 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {q && totalResults === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground/50 font-mono">No results for "{query}"</p>
            </div>
          )}

          {/* No query — hint */}
          {!q && (
            <div className="px-4 pb-3 pt-1 text-center">
              <p className="text-[10px] font-mono text-muted-foreground/30">Type a name, cohort (Cohort-6/7/8), track, or risk level</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-card-border flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground/30">
            <span><kbd className="border border-card-border px-1 rounded">↑↓</kbd> navigate</span>
            <span><kbd className="border border-card-border px-1 rounded">↵</kbd> open</span>
            <span><kbd className="border border-card-border px-1 rounded">esc</kbd> close</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/30">
            {totalResults > 0 ? `${totalResults} result${totalResults > 1 ? "s" : ""}` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

// Trigger button for the sidebar
export function SearchTrigger() {
  return (
    <button
      onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))}
      className="flex items-center gap-3 px-4 py-3 w-full rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/30 group"
    >
      <Search className="w-4 h-4" />
      <span className="flex-1 text-left">Search</span>
      <kbd className="hidden group-hover:inline-flex items-center px-1.5 py-0.5 rounded border border-card-border text-[10px] font-mono opacity-60">⌘K</kbd>
    </button>
  );
}
