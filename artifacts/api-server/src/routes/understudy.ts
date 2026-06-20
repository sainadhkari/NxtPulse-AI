import { Router } from "express";

const router = Router();

const OUTREACH: Array<{
  id: string;
  trainee_id: string;
  trainee_name: string;
  issue: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "acknowledged" | "resolved" | "dismissed";
}> = [
  { id: "o1", trainee_id: "t1", trainee_name: "Rahul Verma", issue: "Missed 3 consecutive standups + attendance critical", recommendation: "Send attendance warning + schedule emergency 1-on-1 call today", priority: "high", status: "pending" },
  { id: "o2", trainee_id: "t5", trainee_name: "Vikram Singh", issue: "AI dependency at critical level (88%) — no original code this week", recommendation: "Send AI-restriction notice + assign manual coding sprint for 5 days", priority: "high", status: "pending" },
  { id: "o3", trainee_id: "t8", trainee_name: "Pooja Menon", issue: "On leave with no communication for 5 days", recommendation: "Wellness check-in message + escalation if no response in 24 hours", priority: "high", status: "pending" },
  { id: "o4", trainee_id: "t2", trainee_name: "Sai Krishna", issue: "Demo submission delayed twice this week", recommendation: "Send gentle reminder + offer POC support session", priority: "medium", status: "pending" },
  { id: "o5", trainee_id: "t7", trainee_name: "Arjun Das", issue: "Learning score stagnant for 3 consecutive weeks", recommendation: "Schedule learning strategy review — consider alternate resources", priority: "medium", status: "acknowledged" },
  { id: "o6", trainee_id: "t11", trainee_name: "Rohit Joshi", issue: "Task completion rate below 40% this month", recommendation: "Assign structured daily task list with check-ins", priority: "high", status: "pending" },
];

router.get("/understudy/simulation", (_req, res) => {
  return res.json({
    id: "sim1",
    handled_count: 42,
    escalated_count: 3,
    missed_count: 1,
    pending_actions: OUTREACH.filter((o) => o.status === "pending").length,
    assigned_trainees: 58,
    resolved_today: 7,
    drafts_ready: 12,
    simulated_at: new Date().toISOString(),
  });
});

router.get("/understudy/outreach", (_req, res) => {
  return res.json(OUTREACH);
});

export default router;
