import { useState, useEffect, useCallback } from "react";

export type NotificationLevel = "high" | "medium" | "low";

export interface Notification {
  id: string;
  trainee: string;
  change: string;
  reason: string;
  level: NotificationLevel;
  timestamp: string;
  read: boolean;
}

const MAX_NOTIFICATIONS = 20;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const url = `${base}/api/notifications/stream`;
    const es = new EventSource(url);

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as Omit<Notification, "read">;
        setNotifications((prev) => {
          const next = [{ ...data, read: false }, ...prev];
          return next.slice(0, MAX_NOTIFICATIONS);
        });
      } catch {
      }
    };

    es.onerror = () => setConnected(false);

    return () => {
      es.close();
      setConnected(false);
    };
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, connected, markAllRead, clearAll };
}
