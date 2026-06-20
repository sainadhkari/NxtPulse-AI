import { Router } from "express";

const router = Router();

const INTERVENTIONS: Array<{
  id: string;
  trainee_id: string;
  trainee_name: string;
  type: "attendance" | "demo_quality" | "ai_dependency" | "engagement" | "standup";
  status: "pending" | "acknowledged" | "resolved" | "dismissed";
  recommendation: string;
  issue: string;
  created_at: string;
}> = [
  { id: "i1", trainee_id: "t1", trainee_name: "Rahul Verma", type: "attendance", status: "pending", recommendation: "Schedule 1-on-1 check-in immediately. Attendance dropped 30% in 2 weeks.", issue: "Attendance dropped from 92% to 62%", created_at: "2025-06-19T09:00:00Z" },
  { id: "i2", trainee_id: "t2", trainee_name: "Sai Krishna", type: "ai_dependency", status: "pending", recommendation: "Assign manual coding exercises with no AI tools for 5 days.", issue: "AI dependency at 52% — trending upward", created_at: "2025-06-18T14:00:00Z" },
  { id: "i3", trainee_id: "t5", trainee_name: "Vikram Singh", type: "demo_quality", status: "acknowledged", recommendation: "Pair with high performer for mock demos. Schedule daily standups.", issue: "Demo score declined 3 sessions in a row", created_at: "2025-06-17T10:00:00Z" },
  { id: "i4", trainee_id: "t8", trainee_name: "Pooja Menon", type: "engagement", status: "pending", recommendation: "Immediate escalation to manager. Low engagement + on leave signal burnout.", issue: "No standup participation for 5 days, on leave", created_at: "2025-06-16T08:00:00Z" },
  { id: "i5", trainee_id: "t11", trainee_name: "Rohit Joshi", type: "standup", status: "pending", recommendation: "Mandatory standup participation. Review task completion workflow.", issue: "Missed 8 consecutive standups", created_at: "2025-06-15T11:00:00Z" },
];

router.post("/interventions/create", (req, res) => {
  const { trainee_name, trainee_id, type, issue, recommendation, due_date, assigned_to } = req.body;
  if (!trainee_name || !trainee_id || !type || !issue || !recommendation) {
    return res.status(400).json({ error: "trainee_name, trainee_id, type, issue, and recommendation are required" });
  }
  const item = {
    id: `i${Date.now()}`,
    trainee_id,
    trainee_name,
    type,
    status: "pending" as const,
    recommendation,
    issue,
    due_date: due_date || null,
    assigned_to: assigned_to || null,
    created_at: new Date().toISOString(),
  };
  INTERVENTIONS.unshift(item as (typeof INTERVENTIONS)[0]);
  return res.status(201).json(item);
});

router.get("/interventions", (req, res) => {
  const { status } = req.query as Record<string, string>;
  let result = [...INTERVENTIONS];
  if (status) result = result.filter((i) => i.status === status);
  return res.json(result);
});

router.post("/interventions/:id/acknowledge", (req, res) => {
  const item = INTERVENTIONS.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  item.status = "acknowledged";
  return res.json(item);
});

router.post("/interventions/:id/resolve", (req, res) => {
  const item = INTERVENTIONS.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  item.status = "resolved";
  return res.json(item);
});

router.post("/interventions/:id/dismiss", (req, res) => {
  const item = INTERVENTIONS.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  item.status = "dismissed";
  return res.json(item);
});

export default router;
