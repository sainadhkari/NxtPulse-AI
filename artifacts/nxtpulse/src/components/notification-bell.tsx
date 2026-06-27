import { useState, useRef, useEffect } from "react";
import {
  Bell, BellRing, Wifi, WifiOff, X, CheckCheck, Trash2,
  ShieldAlert, AlertTriangle, CheckCircle2, Clock, Sparkles
} from "lucide-react";
import { useNotifications, type NotificationLevel } from "@/hooks/use-notifications";

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function levelCfg(level: NotificationLevel) {
  if (level === "high") return {
    Icon: ShieldAlert,
    border: "border-l-red-500",
    iconBg: "bg-red-50 border-red-200 text-red-600",
    badge: "bg-red-100 border-red-300 text-red-700",
    label: "CRITICAL",
    bar: "bg-red-500",
    row: "hover:bg-red-50/50",
  };
  if (level === "medium") return {
    Icon: AlertTriangle,
    border: "border-l-amber-500",
    iconBg: "bg-amber-50 border-amber-200 text-amber-600",
    badge: "bg-amber-100 border-amber-300 text-amber-700",
    label: "WARNING",
    bar: "bg-amber-500",
    row: "hover:bg-amber-50/50",
  };
  return {
    Icon: CheckCircle2,
    border: "border-l-emerald-500",
    iconBg: "bg-emerald-50 border-emerald-200 text-emerald-600",
    badge: "bg-emerald-100 border-emerald-300 text-emerald-700",
    label: "RESOLVED",
    bar: "bg-emerald-500",
    row: "hover:bg-emerald-50/50",
  };
}

export function NotificationBell() {
  const { notifications, unreadCount, connected, markAllRead, clearAll, dismiss } = useNotifications();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | NotificationLevel>("all");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  // Smart panel positioning — stays within viewport
  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const panelWidth = 360;
    const panelHeight = 520;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = 12;

    let left = rect.left;
    if (left + panelWidth > vw - pad) left = vw - panelWidth - pad;
    if (left < pad) left = pad;

    let top = rect.bottom + 8;
    if (top + panelHeight > vh - pad) top = rect.top - panelHeight - 8;
    if (top < pad) top = pad;

    setPanelStyle({ position: "fixed", top, left, width: Math.min(panelWidth, vw - pad * 2), zIndex: 9999 });
  }, [open]);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) setTimeout(markAllRead, 1500);
  };

  const highCount = notifications.filter((n) => n.level === "high").length;
  const medCount = notifications.filter((n) => n.level === "medium").length;

  const filtered = filter === "all"
    ? [...notifications].sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.level] - order[b.level];
      })
    : notifications.filter((n) => n.level === filter);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        data-testid="button-notification-bell"
        onClick={handleOpen}
        className={`relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${
          open
            ? "bg-primary/10 border-primary/30 text-primary"
            : unreadCount > 0
            ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
            : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4 animate-[wiggle_1s_ease-in-out_infinite]" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white px-1 border-2 border-card shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {unreadCount === 0 && connected && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-card" />
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div
            data-testid="panel-notifications"
            style={panelStyle}
            className="flex flex-col max-h-[520px] rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-primary/6 to-transparent shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">Live Alerts</span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold">
                    {connected ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-600">Live</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3 text-red-400" />
                        <span className="text-red-500">Offline</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  {notifications.length > 0 && (
                    <>
                      <button
                        data-testid="button-mark-all-read"
                        onClick={markAllRead}
                        title="Mark all read"
                        className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        data-testid="button-clear-notifications"
                        onClick={clearAll}
                        title="Clear all"
                        className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Risk summary chips */}
              {notifications.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {highCount > 0 && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 border border-red-300 text-red-700 flex items-center gap-1">
                      <ShieldAlert className="w-2.5 h-2.5" /> {highCount} critical
                    </span>
                  )}
                  {medCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> {medCount} warnings
                    </span>
                  )}
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Filter tabs */}
            {notifications.length > 0 && (
              <div className="px-3 py-2 border-b border-border flex gap-1 shrink-0">
                {(["all", "high", "medium", "low"] as const).map((f) => {
                  const count = f === "all"
                    ? notifications.length
                    : notifications.filter((n) => n.level === f).length;
                  const isActive = filter === f;
                  const styles = {
                    all: isActive ? "bg-foreground text-background border-transparent" : "text-muted-foreground border-border hover:text-foreground",
                    high: isActive ? "bg-red-600 text-white border-transparent" : "text-red-600 border-transparent hover:bg-red-50",
                    medium: isActive ? "bg-amber-500 text-white border-transparent" : "text-amber-600 border-transparent hover:bg-amber-50",
                    low: isActive ? "bg-emerald-600 text-white border-transparent" : "text-emerald-600 border-transparent hover:bg-emerald-50",
                  };
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${styles[f]}`}
                    >
                      {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                      <span className="ml-1 opacity-70">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/60 min-h-0">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-muted-foreground/30" />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground">No alerts yet</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-1 leading-snug">
                    {connected
                      ? "Live monitoring active — alerts appear here as risks are detected"
                      : "Connecting to live stream…"}
                  </p>
                </div>
              ) : (
                filtered.map((n) => {
                  const cfg = levelCfg(n.level);
                  const { Icon } = cfg;
                  return (
                    <div
                      key={n.id}
                      data-testid={`notification-item-${n.id}`}
                      className={`flex items-start gap-3 px-4 py-3 border-l-2 transition-colors ${cfg.border} ${cfg.row} ${!n.read ? "bg-primary/[0.018]" : ""}`}
                    >
                      {/* Icon */}
                      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${cfg.iconBg}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="text-xs font-bold text-foreground truncate">{n.trainee}</span>
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ml-auto shrink-0 ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-foreground/80 leading-snug">{n.change}</p>
                        <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{n.reason}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className={`h-0.5 w-6 rounded-full opacity-60 ${cfg.bar}`} />
                          <span className="text-[9px] text-muted-foreground/50 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {timeAgo(n.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Dismiss */}
                      <button
                        onClick={() => dismiss(n.id)}
                        className="shrink-0 p-1 rounded-lg text-muted-foreground/25 hover:text-muted-foreground hover:bg-muted/60 transition-colors mt-0.5"
                        title="Dismiss"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border bg-muted/20 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-primary/40" />
                <span className="text-[10px] text-muted-foreground/50">Silent Detector AI · every 15s</span>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
