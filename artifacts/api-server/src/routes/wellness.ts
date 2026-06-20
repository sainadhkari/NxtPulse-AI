import { Router } from "express";

const router = Router();

router.get("/wellness/metrics", (req, res) => {
  const { trainee_id } = req.query as Record<string, string>;
  const tid = trainee_id || "s1";
  return res.json({
    trainee_id: tid,
    stress_level: "medium",
    burnout_risk: "low",
    motivation_trend: "improving",
    stress_score: 52,
    burnout_score: 31,
    motivation_score: 68,
    weekly_trend: [
      { day: "Mon", stress: 65, motivation: 55 },
      { day: "Tue", stress: 58, motivation: 60 },
      { day: "Wed", stress: 70, motivation: 48 },
      { day: "Thu", stress: 55, motivation: 65 },
      { day: "Fri", stress: 45, motivation: 72 },
      { day: "Sat", stress: 40, motivation: 75 },
      { day: "Sun", stress: 52, motivation: 68 },
    ],
  });
});

router.get("/wellness/suggestions", (_req, res) => {
  return res.json([
    { id: "ws1", category: "Rest", suggestion: "Take 10-minute breaks every 90 minutes during study sessions", priority: "high" },
    { id: "ws2", category: "Consistency", suggestion: "Establish a fixed daily learning schedule — consistency reduces cognitive load", priority: "high" },
    { id: "ws3", category: "Sleep", suggestion: "Maintain 7-8 hours of sleep to consolidate learning and reduce stress", priority: "medium" },
    { id: "ws4", category: "Social", suggestion: "Engage with at least 2 peer study sessions per week to reduce isolation", priority: "medium" },
    { id: "ws5", category: "Exercise", suggestion: "15 minutes of physical activity before study sessions improves focus by 20%", priority: "low" },
    { id: "ws6", category: "AI Dependency", suggestion: "Practice coding 1 hour daily without AI assistance to build genuine confidence", priority: "high" },
  ]);
});

export default router;
