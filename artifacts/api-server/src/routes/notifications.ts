import { Router, type Request, type Response } from "express";

const router = Router();

const RISK_EVENTS = [
  { trainee: "Rahul Verma", change: "escalated to HIGH RISK", reason: "Attendance dropped below 60% threshold", level: "high" },
  { trainee: "Pooja Menon", change: "new SILENT DETECTOR alert", reason: "Zero standup participation for 6 consecutive days", level: "high" },
  { trainee: "Vikram Singh", change: "AI dependency CRITICAL", reason: "AI dependency score exceeded 90% — no original code this week", level: "high" },
  { trainee: "Sai Krishna", change: "escalated to MEDIUM RISK", reason: "Demo score declined for third session in a row", level: "medium" },
  { trainee: "Arjun Das", change: "learning score stagnant", reason: "No improvement across 4 consecutive evaluations", level: "medium" },
  { trainee: "Kiran Patel", change: "missed demo submission", reason: "Demo deadline passed with no submission or update", level: "medium" },
  { trainee: "Rohit Joshi", change: "escalated to HIGH RISK", reason: "Task completion rate fell to 32% this week", level: "high" },
  { trainee: "Deepa Nair", change: "attendance warning triggered", reason: "Attendance dropped 18% over the past 10 days", level: "medium" },
  { trainee: "Ananya Reddy", change: "demo score EXCEPTIONAL", reason: "Scored 94% — ready for peer mentor assignment", level: "low" },
  { trainee: "Suresh Babu", change: "cleared LOW RISK status", reason: "Consistent improvement across all three metrics for 2 weeks", level: "low" },
];

let eventIndex = 0;

router.get("/notifications/stream", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const sendEvent = () => {
    const event = RISK_EVENTS[eventIndex % RISK_EVENTS.length];
    eventIndex++;
    const payload = JSON.stringify({
      id: `notif_${Date.now()}`,
      trainee: event.trainee,
      change: event.change,
      reason: event.reason,
      level: event.level,
      timestamp: new Date().toISOString(),
    });
    res.write(`data: ${payload}\n\n`);
  };

  sendEvent();
  const interval = setInterval(sendEvent, 15000);

  req.on("close", () => {
    clearInterval(interval);
  });
});

export default router;
