import { Router } from "express";

const router = Router();

const ALERTS = [
  {
    id: "sd1",
    trainee_id: "t1",
    trainee_name: "Rahul Verma",
    risk_level: "high",
    signals: [
      "Attendance dropped 30% in past 2 weeks",
      "Demo quality declined 3 consecutive sessions",
      "AI dependency increased from 45% to 78%",
      "Standup participation dropped significantly",
    ],
    recommendation: "Immediate 1-on-1 intervention. Assign dedicated mentor. Restrict AI tool access for 5 days.",
    detected_at: "2025-06-20T06:00:00Z",
  },
  {
    id: "sd2",
    trainee_id: "t2",
    trainee_name: "Sai Krishna",
    risk_level: "medium",
    signals: [
      "Confidence scores trending downward",
      "Late demo submissions (2 of last 3)",
      "Reduced engagement in group activities",
    ],
    recommendation: "Schedule check-in within 48 hours. Review recent task completion quality.",
    detected_at: "2025-06-19T07:00:00Z",
  },
  {
    id: "sd3",
    trainee_id: "t3",
    trainee_name: "Kiran Patel",
    risk_level: "medium",
    signals: [
      "High AI dependency (67%) trending upward",
      "Self-assessment scores inconsistent with evaluations",
    ],
    recommendation: "Assign AI-free coding challenges. Monitor next 2 evaluations closely.",
    detected_at: "2025-06-19T08:30:00Z",
  },
  {
    id: "sd4",
    trainee_id: "t5",
    trainee_name: "Vikram Singh",
    risk_level: "high",
    signals: [
      "Attendance below threshold (55%)",
      "Lowest demo score in cohort",
      "AI dependency at 88% — critical level",
      "Zero standup updates in past week",
    ],
    recommendation: "Escalate to manager immediately. Conduct full learning audit. Consider cohort reassignment.",
    detected_at: "2025-06-20T06:15:00Z",
  },
  {
    id: "sd5",
    trainee_id: "t7",
    trainee_name: "Arjun Das",
    risk_level: "medium",
    signals: [
      "Learning score plateau for 3 weeks",
      "Demo scores not improving despite practice",
    ],
    recommendation: "Review learning approach. Consider different track or additional resources.",
    detected_at: "2025-06-18T09:00:00Z",
  },
];

router.get("/silent-detector/alerts", (_req, res) => {
  return res.json(ALERTS);
});

export default router;
