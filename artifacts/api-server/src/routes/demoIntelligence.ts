import { Router } from "express";

const router = Router();

const REPORTS = [
  {
    id: "d1",
    trainee_id: "t1",
    trainee_name: "Rahul Verma",
    topic: "React Hooks — useEffect & useState",
    technical_score: 41,
    communication_score: 55,
    confidence_score: 37,
    teaching_readiness_score: 33,
    strengths: ["Decent use of hooks syntax", "Understood basic component lifecycle"],
    weaknesses: ["Could not explain useEffect dependency array", "Lost composure under follow-up questions", "Over-relied on notes during demo", "Did not connect concepts to real-world use cases"],
    ai_feedback: "The demo showed foundational awareness of React hooks but lacked depth under pressure. The trainee read directly from prepared notes rather than demonstrating internalized understanding. Communication was hesitant and confidence dropped significantly with follow-up questions. Recommend structured demo rehearsals with adversarial Q&A practice.",
    reported_at: "2025-06-18T16:00:00Z",
  },
  {
    id: "d2",
    trainee_id: "t4",
    trainee_name: "Ananya Reddy",
    topic: "Neural Network Architecture",
    technical_score: 94,
    communication_score: 91,
    confidence_score: 89,
    teaching_readiness_score: 93,
    strengths: ["Crystal-clear explanation of backpropagation", "Excellent use of diagrams", "Handled all follow-up questions confidently", "Connected theory to real ML projects"],
    weaknesses: ["Could improve pacing for beginners"],
    ai_feedback: "Outstanding demo performance. Ananya demonstrated not just understanding but genuine mastery — she explained complex concepts in multiple ways, adapted to the audience, and handled adversarial questions without hesitation. Ready to mentor peers and present at demo day.",
    reported_at: "2025-06-20T14:00:00Z",
  },
  {
    id: "d3",
    trainee_id: "t2",
    trainee_name: "Sai Krishna",
    topic: "Python APIs with FastAPI",
    technical_score: 67,
    communication_score: 71,
    confidence_score: 64,
    teaching_readiness_score: 62,
    strengths: ["Good understanding of REST principles", "Clear code walkthrough"],
    weaknesses: ["Struggled with async/await explanation", "Did not demo error handling"],
    ai_feedback: "Solid mid-tier performance. Sai has a good grasp of FastAPI basics but the demo revealed gaps in async programming understanding. Recommend targeted async Python practice and a follow-up demo focusing on error handling patterns.",
    reported_at: "2025-06-19T15:30:00Z",
  },
];

router.get("/demo-intelligence/reports", (req, res) => {
  const { trainee_id } = req.query as Record<string, string>;
  let result = [...REPORTS];
  if (trainee_id) result = result.filter((r) => r.trainee_id === trainee_id);
  return res.json(result);
});

router.get("/demo-intelligence/reports/latest", (_req, res) => {
  return res.json(REPORTS[0]);
});

export default router;
