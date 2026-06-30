import { Router } from "express";

const router = Router();

const TRAINEES = [
  { id: "t1", name: "Rahul Verma", cohort: "Cohort-7", track: "React + Node", attendance: 62, learning_score: 34, demo_score: 38, ai_dependency: 78, risk_level: "high", status: "active", last_active: "2025-06-19" },
  { id: "t2", name: "Sai Krishna", cohort: "Cohort-7", track: "Python + ML", attendance: 85, learning_score: 58, demo_score: 55, ai_dependency: 52, risk_level: "medium", status: "active", last_active: "2025-06-20" },
  { id: "t3", name: "Kiran Patel", cohort: "Cohort-7", track: "React + Node", attendance: 78, learning_score: 61, demo_score: 63, ai_dependency: 67, risk_level: "medium", status: "active", last_active: "2025-06-20" },
  { id: "t4", name: "Ananya Reddy", cohort: "Cohort-8", track: "Data Science", attendance: 92, learning_score: 84, demo_score: 87, ai_dependency: 22, risk_level: "low", status: "active", last_active: "2025-06-20" },
  { id: "t5", name: "Vikram Singh", cohort: "Cohort-8", track: "React + Node", attendance: 55, learning_score: 28, demo_score: 31, ai_dependency: 88, risk_level: "high", status: "active", last_active: "2025-06-18" },
  { id: "t6", name: "Meena Iyer", cohort: "Cohort-6", track: "Python + ML", attendance: 96, learning_score: 91, demo_score: 89, ai_dependency: 11, risk_level: "low", status: "active", last_active: "2025-06-20" },
  { id: "t7", name: "Arjun Das", cohort: "Cohort-8", track: "Data Science", attendance: 70, learning_score: 47, demo_score: 44, ai_dependency: 61, risk_level: "medium", status: "active", last_active: "2025-06-19" },
  { id: "t8", name: "Pooja Menon", cohort: "Cohort-7", track: "React + Node", attendance: 48, learning_score: 22, demo_score: 19, ai_dependency: 91, risk_level: "high", status: "on_leave", last_active: "2025-06-15" },
  { id: "t9", name: "Suresh Babu", cohort: "Cohort-6", track: "Python + ML", attendance: 88, learning_score: 74, demo_score: 72, ai_dependency: 33, risk_level: "low", status: "active", last_active: "2025-06-20" },
  { id: "t10", name: "Deepa Nair", cohort: "Cohort-8", track: "React + Node", attendance: 67, learning_score: 52, demo_score: 49, ai_dependency: 58, risk_level: "medium", status: "active", last_active: "2025-06-19" },
  { id: "t11", name: "Rohit Joshi", cohort: "Cohort-7", track: "Data Science", attendance: 41, learning_score: 18, demo_score: 22, ai_dependency: 94, risk_level: "high", status: "active", last_active: "2025-06-17" },
  { id: "t12", name: "Kavitha Rao", cohort: "Cohort-6", track: "React + Node", attendance: 94, learning_score: 88, demo_score: 86, ai_dependency: 16, risk_level: "low", status: "graduated", last_active: "2025-06-20" },
];

router.get("/trainees", (req, res) => {
  const { risk_level, cohort, search } = req.query as Record<string, string>;
  let result = [...TRAINEES];
  if (risk_level) result = result.filter((t) => t.risk_level === risk_level);
  if (cohort) result = result.filter((t) => t.cohort === cohort);
  if (search) result = result.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
  return res.json(result);
});

router.get("/trainees/stats/summary", (_req, res) => {
  return res.json({
    total_trainees: 4882,
    avg_learning_score: 67.3,
    high_risk_count: 384,
    pending_demos: 127,
    active_interventions: 43,
    ai_dependency_avg: 27,
    prediction_accuracy: 91,
  });
});

router.get("/trainees/stats/cohorts", (_req, res) => {
  const cohortNames = ["Cohort-6", "Cohort-7", "Cohort-8"];
  const buckets = ["0–20", "21–40", "41–60", "61–80", "81–100"];

  const result = cohortNames.map((cohort) => {
    const members = TRAINEES.filter((t) => t.cohort === cohort);
    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const scores = members.map((t) => t.learning_score);
    const distribution = buckets.map((range, i) => ({
      range,
      count: scores.filter((s) => s >= i * 20 && s < (i + 1) * 20).length,
    }));
    const sorted = [...members].sort((a, b) => b.learning_score - a.learning_score);
    return {
      cohort,
      total_trainees: members.length,
      avg_learning_score: Math.round(avg(members.map((t) => t.learning_score)) * 10) / 10,
      avg_demo_score: Math.round(avg(members.map((t) => t.demo_score)) * 10) / 10,
      avg_ai_dependency: Math.round(avg(members.map((t) => t.ai_dependency)) * 10) / 10,
      avg_attendance: Math.round(avg(members.map((t) => t.attendance)) * 10) / 10,
      high_risk_count: members.filter((t) => t.risk_level === "high").length,
      medium_risk_count: members.filter((t) => t.risk_level === "medium").length,
      low_risk_count: members.filter((t) => t.risk_level === "low").length,
      top_performer: sorted[0],
      bottom_performer: sorted[sorted.length - 1],
      score_distribution: distribution,
    };
  });
  return res.json(result);
});

router.get("/trainees/stats/risk-distribution", (_req, res) => {
  return res.json({ high: 384, medium: 1205, low: 3293 });
});

router.get("/trainees/telemetry", (_req, res) => {
  return res.json(
    TRAINEES.map((t) => ({
      trainee_id: t.id,
      trainee_name: t.name,
      track: t.track,
      cohort: t.cohort,
      learning_score: t.learning_score,
      demo_score: t.demo_score,
      attendance: t.attendance,
      ai_dependency: t.ai_dependency,
      risk_level: t.risk_level,
      status: t.status,
    }))
  );
});

router.get("/trainees/:id", (req, res) => {
  const trainee = TRAINEES.find((t) => t.id === req.params.id);
  if (!trainee) return res.status(404).json({ error: "Not found" });
  return res.json(trainee);
});

export default router;
