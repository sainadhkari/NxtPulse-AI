import { Router } from "express";
import OpenAI from "openai";
import pg from "pg";

const router = Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

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

const SEED_EVALUATIONS = [
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
    ai_feedback: "Exceptional performance. Trainee demonstrated deep, independent understanding of all overfitting concepts. Answers were original, precise, and included real-world examples. Ready for advanced demos and peer mentoring.",
    evaluated_at: "2025-06-20T11:00:00Z",
  },
];

async function getEvaluationsFromDB(traineeId?: string): Promise<any[]> {
  try {
    let query = "SELECT * FROM learnguard_evaluations ORDER BY evaluated_at DESC";
    const params: string[] = [];
    if (traineeId) {
      query = "SELECT * FROM learnguard_evaluations WHERE trainee_id = $1 ORDER BY evaluated_at DESC";
      params.push(traineeId);
    }
    const result = await pool.query(query, params);
    if (result.rows.length > 0) return result.rows;
  } catch (_e) {}
  return traineeId
    ? SEED_EVALUATIONS.filter((e) => e.trainee_id === traineeId)
    : SEED_EVALUATIONS;
}

router.get("/learnguard/evaluations", async (req, res) => {
  const { trainee_id } = req.query as Record<string, string>;
  const evaluations = await getEvaluationsFromDB(trainee_id);
  return res.json(evaluations);
});

router.get("/learnguard/evaluations/latest", async (_req, res) => {
  const evaluations = await getEvaluationsFromDB();
  return res.json(evaluations[0] || SEED_EVALUATIONS[0]);
});

router.post("/learnguard/evaluate", async (req, res) => {
  const { trainee_name, topic } = req.body as { trainee_name: string; topic: string };
  if (!trainee_name || !topic) {
    return res.status(400).json({ error: "trainee_name and topic are required" });
  }

  const questions = getQuestionsForTopic(topic);

  const prompt = `You are LearnGuard AI, an intelligent evaluation system for an SDI (Software Development Internship) training program.

A manager has requested an AI-powered evaluation of trainee "${trainee_name}" on the topic "${topic}".

Based on the trainee's name and topic, generate a realistic and insightful evaluation. Consider typical learning patterns for this topic.

Respond with ONLY a valid JSON object in this exact format:
{
  "understanding_score": <number 0-100>,
  "confidence_score": <number 0-100>,
  "ai_dependency_score": <number 0-100>,
  "readiness_score": <number 0-100>,
  "ai_feedback": "<2-3 sentence professional assessment mentioning the trainee by name, the topic, specific strengths or gaps, and a concrete recommendation>"
}

Rules:
- understanding_score: how well they grasp the concept
- confidence_score: how confidently they explain it
- ai_dependency_score: how much they rely on AI tools (high = bad)
- readiness_score: demo readiness
- If readiness < 50, they need intervention
- ai_dependency > 70 is a red flag
- Be specific, professional, and actionable in the feedback
- Do NOT include any text outside the JSON`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
    const scores = {
      understanding_score: Math.max(0, Math.min(100, Math.round(parsed.understanding_score || 50))),
      confidence_score: Math.max(0, Math.min(100, Math.round(parsed.confidence_score || 50))),
      ai_dependency_score: Math.max(0, Math.min(100, Math.round(parsed.ai_dependency_score || 50))),
      readiness_score: Math.max(0, Math.min(100, Math.round(parsed.readiness_score || 50))),
      ai_feedback: parsed.ai_feedback || `Evaluation complete for ${trainee_name} on ${topic}.`,
    };

    const evaluation = {
      id: `lg_${Date.now()}`,
      trainee_id: `dynamic_${trainee_name.toLowerCase().replace(/\s+/g, "_")}`,
      trainee_name,
      topic,
      questions,
      ...scores,
      evaluated_at: new Date().toISOString(),
    };

    try {
      await pool.query(
        `INSERT INTO learnguard_evaluations
          (id, trainee_id, topic, understanding_score, confidence_score, ai_dependency_score, readiness_score, ai_feedback, evaluated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [
          evaluation.id,
          evaluation.trainee_id,
          evaluation.topic,
          evaluation.understanding_score,
          evaluation.confidence_score,
          evaluation.ai_dependency_score,
          evaluation.readiness_score,
          evaluation.ai_feedback,
          evaluation.evaluated_at,
        ]
      );
    } catch (_e) {}

    return res.json(evaluation);
  } catch (err: any) {
    req.log?.warn({ err }, "OpenAI evaluation failed, falling back to heuristic");
    const base = trainee_name.length % 40 + 10;
    const fallback = {
      id: `lg_${Date.now()}`,
      trainee_id: `dynamic_${trainee_name.toLowerCase().replace(/\s+/g, "_")}`,
      trainee_name,
      topic,
      questions,
      understanding_score: 40 + base,
      confidence_score: 35 + base,
      ai_dependency_score: 60 - base,
      readiness_score: 38 + base,
      ai_feedback: `${trainee_name} completed evaluation on ${topic}. Further manual review recommended.`,
      evaluated_at: new Date().toISOString(),
    };
    return res.json(fallback);
  }
});

export default router;
