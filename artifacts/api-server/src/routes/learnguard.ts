import { Router } from "express";

const TOPIC_QUESTIONS: Record<string, string[]> = {
  react: [
    "What problem does useState solve that a regular variable cannot?",
    "Explain what triggers a re-render in React.",
    "When would you choose useReducer over useState?",
    "What is the purpose of the dependency array in useEffect?",
    "How does React's virtual DOM differ from the real DOM?",
  ],
  javascript: [
    "What is a closure and why is it useful?",
    "Explain the difference between == and ===.",
    "How does the event loop work in JavaScript?",
    "What is the difference between var, let, and const?",
    "Explain promises vs async/await.",
  ],
  python: [
    "What is the difference between a list and a tuple?",
    "Explain Python's GIL and when it matters.",
    "How do decorators work in Python?",
    "What is the difference between deepcopy and shallow copy?",
    "Explain generators and when you'd use them over a list.",
  ],
  machine: [
    "What is overfitting and how do you detect it?",
    "Explain bias-variance tradeoff in your own words.",
    "When would you use precision vs recall as your primary metric?",
    "How does gradient descent work?",
    "What is cross-validation and why is it important?",
  ],
  node: [
    "How does Node.js handle asynchronous operations?",
    "What is the difference between require and import?",
    "Explain the purpose of middleware in Express.",
    "How would you handle errors in an async Express route?",
    "What is the event emitter pattern in Node.js?",
  ],
  sql: [
    "What is the difference between INNER JOIN and LEFT JOIN?",
    "Explain what an index does and when you'd add one.",
    "What is a transaction and why is ACID important?",
    "How does GROUP BY differ from HAVING?",
    "Explain the N+1 query problem.",
  ],
  css: [
    "Explain the CSS box model.",
    "What is the difference between Flexbox and Grid?",
    "How does specificity work in CSS?",
    "What is a CSS custom property and how do you use it?",
    "Explain how z-index stacking context works.",
  ],
  typescript: [
    "What is the difference between interface and type in TypeScript?",
    "Explain what generics are and when to use them.",
    "What is a discriminated union?",
    "How does TypeScript's structural typing differ from nominal typing?",
    "What is the purpose of the unknown type vs any?",
  ],
};

function getQuestionsForTopic(topic: string): string[] {
  const lower = topic.toLowerCase();
  for (const [key, qs] of Object.entries(TOPIC_QUESTIONS)) {
    if (lower.includes(key)) return qs.slice(0, 4);
  }
  return [
    `What are the core principles of ${topic}?`,
    `Explain a real-world use case for ${topic}.`,
    `What are the most common mistakes beginners make with ${topic}?`,
    `How would you explain ${topic} to someone with no prior experience?`,
  ];
}

function seedRandom(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (Math.abs(h) % 40) + 1;
}

function generateScores(trainee: string, topic: string) {
  const base = seedRandom(trainee + topic);
  const isAtRisk = ["rahul", "vikram", "pooja", "rohit"].some((n) =>
    trainee.toLowerCase().includes(n)
  );
  const isStrong = ["ananya", "meena", "kavitha", "suresh"].some((n) =>
    trainee.toLowerCase().includes(n)
  );

  if (isAtRisk) {
    return {
      understanding_score: 25 + (base % 20),
      confidence_score: 20 + (base % 18),
      ai_dependency_score: 65 + (base % 25),
      readiness_score: 22 + (base % 18),
    };
  }
  if (isStrong) {
    return {
      understanding_score: 82 + (base % 15),
      confidence_score: 80 + (base % 16),
      ai_dependency_score: 10 + (base % 18),
      readiness_score: 85 + (base % 12),
    };
  }
  return {
    understanding_score: 50 + (base % 30),
    confidence_score: 48 + (base % 28),
    ai_dependency_score: 35 + (base % 30),
    readiness_score: 52 + (base % 28),
  };
}

function generateFeedback(trainee: string, topic: string, scores: ReturnType<typeof generateScores>): string {
  const { understanding_score, confidence_score, ai_dependency_score, readiness_score } = scores;
  const avg = (understanding_score + confidence_score + readiness_score) / 3;

  if (avg < 40) {
    return `${trainee} shows early-stage familiarity with ${topic} but cannot yet demonstrate independent understanding. Answers relied heavily on memorised phrases rather than internalized concepts. AI dependency at ${ai_dependency_score}% is critically high — recommend a 5-day AI-restricted sprint with daily check-ins. Not ready for demo assessment.`;
  }
  if (avg < 65) {
    return `${trainee} has a working understanding of core ${topic} concepts but struggles under follow-up questioning. Confidence dips when questions move beyond surface material. AI dependency at ${ai_dependency_score}% needs monitoring. Recommend 2 mock evaluations with adversarial Q&A before next demo submission.`;
  }
  return `${trainee} demonstrates solid, independent mastery of ${topic}. Answers were original, precise, and included real-world context. Confidence remained stable under follow-up pressure. AI dependency at ${ai_dependency_score}% is within healthy range. Ready for demo — consider peer mentoring assignment.`;
}

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

router.post("/learnguard/evaluate", (req, res) => {
  const { trainee_name, topic } = req.body as { trainee_name: string; topic: string };
  if (!trainee_name || !topic) {
    return res.status(400).json({ error: "trainee_name and topic are required" });
  }
  const questions = getQuestionsForTopic(topic);
  const scores = generateScores(trainee_name, topic);
  const feedback = generateFeedback(trainee_name, topic, scores);
  const evaluation = {
    id: `lg_${Date.now()}`,
    trainee_id: `dynamic_${trainee_name.toLowerCase().replace(/\s+/g, "_")}`,
    trainee_name,
    topic,
    questions,
    ...scores,
    ai_feedback: feedback,
    evaluated_at: new Date().toISOString(),
  };
  EVALUATIONS.unshift(evaluation as (typeof EVALUATIONS)[0]);
  if (EVALUATIONS.length > 50) EVALUATIONS.pop();
  return res.json(evaluation);
});

export default router;
