import { useState } from "react";
import { Bell, BellRing, Wifi, WifiOff, X, CheckCheck, Trash2 } from "lucide-react";
import { useNotifications, type NotificationLevel } from "@/hooks/use-notifications";

function levelColor(level: NotificationLevel) {
  if (level === "high") return "text-red-400 border-red-500/40 bg-red-500/10";
  if (level === "medium") return "text-yellow-400 border-yellow-500/40 bg-yellow-500/10";
  return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
}

function levelDot(level: NotificationLevel) {
  if (level === "high") return "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]";
  if (level === "medium") return "bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.8)]";
  return "bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.8)]";
}

function levelLabel(level: NotificationLevel) {
  if (level === "high") return "CRITICAL";
  if (level === "medium") return "WARNING";
  return "RESOLVED";
}

function formatTime(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function NotificationBell() {
  const { notifications, unreadCount, connected, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) {
      setTimeout(markAllRead, 1500);
    }
  };

  return (
    <div className="relative">
      <button
        data-testid="button-notification-bell"
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-md border border-border bg-card hover:bg-primary/10 hover:border-primary/40 transition-all"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4 text-primary animate-pulse" />
        ) : (
          <Bell className="w-4 h-4 text-muted-foreground" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-foreground px-1 shadow-[0_0_8px_rgba(239,68,68,0.7)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div
            data-testid="panel-notifications"
            className="absolute right-0 top-11 z-50 w-[380px] max-h-[520px] flex flex-col rounded-lg border border-border bg-card shadow-xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground tracking-tight">Live Alerts</span>
                <span className="flex items-center gap-1 text-[10px] font-mono uppercase">
                  {connected ? (
                    <><Wifi className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Live</span></>
                  ) : (
                    <><WifiOff className="w-3 h-3 text-red-400" /><span className="text-red-400">Offline</span></>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <>
                    <button
                      data-testid="button-mark-all-read"
                      onClick={markAllRead}
                      title="Mark all read"
                      className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                    <button
                      data-testid="button-clear-notifications"
                      onClick={clearAll}
                      title="Clear all"
                      className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-card-border/50">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/60">
                  <Bell className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-xs font-mono">Monitoring active. No alerts yet.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    data-testid={`notification-item-${n.id}`}
                    className={`px-4 py-3 transition-colors ${n.read ? "opacity-60" : "bg-primary/[0.02]"}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${levelDot(n.level)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${levelColor(n.level)}`}>
                            {levelLabel(n.level)}
                          </span>
                          {!n.read && (
                            <span className="text-[10px] font-mono text-primary/70">NEW</span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-foreground truncate">{n.trainee}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.reason}</p>
                        <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">{formatTime(n.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-2 border-t border-border bg-card">
              <p className="text-[10px] font-mono text-muted-foreground/50 text-center">
                Silent Detector AI — firing every 15 seconds
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
