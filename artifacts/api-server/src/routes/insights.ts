import { Router } from "express";

const router = Router();

const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];

router.get("/insights/summary", (_req, res) => {
  return res.json({
    student_health_score: 72.4,
    learning_health_score: 67.8,
    manager_efficiency_score: 84.2,
    risk_forecast_score: 91.0,
    total_trainees: 4882,
    at_risk_count: 384,
    ai_dependency_avg: 27,
    prediction_accuracy: 91,
  });
});

router.get("/insights/trends", (_req, res) => {
  return res.json({
    risk_trend: weeks.map((week, i) => ({ week, value: 7.8 - i * 0.3 + (i % 2) * 0.4 })),
    demo_trend: weeks.map((week, i) => ({ week, value: 61 + i * 1.5 - (i % 3) * 0.8 })),
    ai_dependency_trend: weeks.map((week, i) => ({ week, value: 34 - i * 0.9 + (i % 2) * 0.5 })),
    attendance_trend: weeks.map((week, i) => ({ week, value: 78 + i * 0.8 - (i % 3) * 0.4 })),
  });
});

router.get("/insights/recommended-actions", (_req, res) => {
  return res.json([
    { id: "ra1", priority: "critical", action: "Immediate intervention required for 12 high-risk trainees with attendance below 60%", affected_count: 12, category: "Intervention" },
    { id: "ra2", priority: "critical", action: "Restrict AI tool access for 8 trainees with dependency score above 85%", affected_count: 8, category: "AI Dependency" },
    { id: "ra3", priority: "high", action: "Schedule mock demo sessions for 25 trainees before end-of-cohort assessment", affected_count: 25, category: "Demo Quality" },
    { id: "ra4", priority: "high", action: "Assign POC mentors to 18 trainees showing stagnant learning scores for 3+ weeks", affected_count: 18, category: "Learning" },
    { id: "ra5", priority: "medium", action: "Conduct wellness surveys for 31 trainees showing burnout risk signals", affected_count: 31, category: "Wellness" },
    { id: "ra6", priority: "medium", action: "Review standup process for Cohort-8 — 40% completion rate below threshold", affected_count: 42, category: "Engagement" },
    { id: "ra7", priority: "low", action: "Celebrate 6 trainees ready for peer mentoring — assign them as study leads", affected_count: 6, category: "Recognition" },
  ]);
});

export default router;
