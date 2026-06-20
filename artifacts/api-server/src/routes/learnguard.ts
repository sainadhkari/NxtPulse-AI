import { Router } from "express";

const router = Router();

const EVALUATIONS = [
  {
    id: "lg1",
    trainee_id: "t1",
    trainee_name: "Rahul Verma",
    topic: "React State Management",
    questions: [
      "Why do we use useState instead of a regular variable?",
      "What causes a React component to re-render?",
      "Explain the difference between state and props.",
      "When would you use useReducer over useState?",
    ],
    understanding_score: 38,
    confidence_score: 29,
    ai_dependency_score: 78,
    readiness_score: 31,
    ai_feedback: "Trainee demonstrates surface-level understanding of React hooks but cannot explain re-rendering mechanics without AI assistance. Answers were verbatim from documentation, indicating high AI dependency. Needs structured practice without AI tools. Not ready for demo — recommend 5-day hands-on sprint.",
    evaluated_at: "2025-06-19T10:30:00Z",
  },
  {
    id: "lg2",
    trainee_id: "s1",
    trainee_name: "Rahul Verma",
    topic: "JavaScript Closures",
    questions: [
      "What is a closure in JavaScript?",
      "How does closure relate to lexical scoping?",
      "Give a real-world use case of a closure.",
      "What is a common bug caused by closures in loops?",
    ],
    understanding_score: 62,
    confidence_score: 58,
    ai_dependency_score: 41,
    readiness_score: 64,
    ai_feedback: "Good conceptual understanding of closures demonstrated. The trainee explained lexical scoping correctly and provided a relevant use case. However, the loop-closure bug explanation was incomplete. AI dependency is moderate — recommend practice problems without assistance to solidify independent mastery.",
    evaluated_at: "2025-06-20T09:15:00Z",
  },
  {
    id: "lg3",
    trainee_id: "t4",
    trainee_name: "Ananya Reddy",
    topic: "Machine Learning — Overfitting",
    questions: [
      "What is overfitting and how do you detect it?",
      "Explain regularization techniques.",
      "What is cross-validation and why is it used?",
      "How does dropout work in neural networks?",
    ],
    understanding_score: 91,
    confidence_score: 88,
    ai_dependency_score: 14,
    readiness_score: 92,
    ai_feedback: "Exceptional performance. Trainee demonstrated deep, independent understanding of all overfitting concepts. Answers were original, precise, and included real-world examples not found in standard documentation. Ready for advanced demos and peer mentoring.",
    evaluated_at: "2025-06-20T11:00:00Z",
  },
];

router.get("/learnguard/evaluations", (req, res) => {
  const { trainee_id } = req.query as Record<string, string>;
  let result = [...EVALUATIONS];
  if (trainee_id) result = result.filter((e) => e.trainee_id === trainee_id);
  return res.json(result);
});

router.get("/learnguard/evaluations/latest", (_req, res) => {
  return res.json(EVALUATIONS[0]);
});

export default router;
