import { Router } from "express";
import OpenAI from "openai";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TRAINEES = [
  { id: "t1",  name: "Rahul Verma",   cohort: "Cohort-7", track: "React + Node",  learning_score: 34, demo_score: 38, ai_dependency: 78, attendance: 62, risk_level: "high"   },
  { id: "t2",  name: "Sai Krishna",   cohort: "Cohort-7", track: "Python + ML",   learning_score: 58, demo_score: 55, ai_dependency: 52, attendance: 85, risk_level: "medium" },
  { id: "t3",  name: "Kiran Patel",   cohort: "Cohort-7", track: "React + Node",  learning_score: 61, demo_score: 63, ai_dependency: 67, attendance: 78, risk_level: "medium" },
  { id: "t4",  name: "Ananya Reddy",  cohort: "Cohort-8", track: "Data Science",  learning_score: 84, demo_score: 87, ai_dependency: 22, attendance: 92, risk_level: "low"    },
  { id: "t5",  name: "Vikram Singh",  cohort: "Cohort-8", track: "React + Node",  learning_score: 28, demo_score: 31, ai_dependency: 88, attendance: 55, risk_level: "high"   },
  { id: "t6",  name: "Meena Iyer",    cohort: "Cohort-6", track: "Python + ML",   learning_score: 91, demo_score: 89, ai_dependency: 11, attendance: 96, risk_level: "low"    },
  { id: "t7",  name: "Arjun Das",     cohort: "Cohort-8", track: "Data Science",  learning_score: 47, demo_score: 44, ai_dependency: 61, attendance: 70, risk_level: "medium" },
  { id: "t8",  name: "Pooja Menon",   cohort: "Cohort-7", track: "React + Node",  learning_score: 22, demo_score: 19, ai_dependency: 91, attendance: 48, risk_level: "high"   },
  { id: "t9",  name: "Suresh Babu",   cohort: "Cohort-6", track: "Python + ML",   learning_score: 74, demo_score: 72, ai_dependency: 33, attendance: 88, risk_level: "low"    },
  { id: "t10", name: "Deepa Nair",    cohort: "Cohort-8", track: "React + Node",  learning_score: 52, demo_score: 49, ai_dependency: 58, attendance: 67, risk_level: "medium" },
  { id: "t11", name: "Rohit Joshi",   cohort: "Cohort-7", track: "Data Science",  learning_score: 18, demo_score: 22, ai_dependency: 94, attendance: 41, risk_level: "high"   },
  { id: "t12", name: "Kavitha Rao",   cohort: "Cohort-6", track: "React + Node",  learning_score: 88, demo_score: 86, ai_dependency: 16, attendance: 94, risk_level: "low"    },
];

const OUTREACH: Array<{
  id: string; trainee_id: string; trainee_name: string;
  issue: string; recommendation: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "acknowledged" | "resolved" | "dismissed";
}> = [
  { id: "o1", trainee_id: "t1",  trainee_name: "Rahul Verma",  issue: "Missed 3 consecutive standups + attendance critical",       recommendation: "Send attendance warning + schedule emergency 1-on-1 call today",           priority: "high",   status: "pending"      },
  { id: "o2", trainee_id: "t5",  trainee_name: "Vikram Singh",  issue: "AI dependency at critical level (88%) — no original code", recommendation: "Send AI-restriction notice + assign manual coding sprint for 5 days",      priority: "high",   status: "pending"      },
  { id: "o3", trainee_id: "t8",  trainee_name: "Pooja Menon",   issue: "On leave with no communication for 5 days",                recommendation: "Wellness check-in message + escalation if no response in 24 hours",      priority: "high",   status: "pending"      },
  { id: "o4", trainee_id: "t2",  trainee_name: "Sai Krishna",   issue: "Demo submission delayed twice this week",                  recommendation: "Send gentle reminder + offer POC support session",                       priority: "medium", status: "pending"      },
  { id: "o5", trainee_id: "t7",  trainee_name: "Arjun Das",     issue: "Learning score stagnant for 3 consecutive weeks",          recommendation: "Schedule learning strategy review — consider alternate resources",        priority: "medium", status: "acknowledged" },
  { id: "o6", trainee_id: "t11", trainee_name: "Rohit Joshi",   issue: "Task completion rate below 40% this month",                recommendation: "Assign structured daily task list with check-ins",                       priority: "high",   status: "pending"      },
];

function buildPairings() {
  const strong = TRAINEES.filter((t) => t.learning_score >= 75 && t.risk_level === "low")
    .sort((a, b) => b.learning_score - a.learning_score);
  const struggling = TRAINEES.filter((t) => t.risk_level === "high" || t.learning_score < 45)
    .sort((a, b) => a.learning_score - b.learning_score);

  return struggling.map((weak, i) => {
    const mentor = strong[i % strong.length];
    const gap = mentor.learning_score - weak.learning_score;
    const compatibility = Math.round(
      (mentor.track === weak.track ? 35 : 15) +
      Math.min(gap / 2, 30) +
      (mentor.cohort !== weak.cohort ? 10 : 0) +
      15
    );
    const sessions = Math.ceil(gap / 15);
    return {
      id: `pair_${mentor.id}_${weak.id}`,
      mentor,
      mentee: weak,
      compatibility_score: Math.min(compatibility, 98),
      recommended_sessions: sessions,
      focus_areas: weak.ai_dependency > 70
        ? ["AI Independence", "Hands-on Practice", weak.track]
        : weak.demo_score < 40
        ? ["Demo Confidence", "Presentation Skills", weak.track]
        : ["Core Concepts", weak.track, "Code Review"],
      projected_improvement: Math.min(Math.round(gap * 0.4), 28),
      match_reason: mentor.track === weak.track
        ? `Same track (${mentor.track}) — direct knowledge transfer`
        : `Cross-track pairing — broadens perspective and reduces AI crutch`,
      status: i === 0 ? "active" : i === 1 ? "scheduled" : "suggested",
    };
  });
}

const PAIRINGS = buildPairings();

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
    active_pairings: PAIRINGS.filter((p) => p.status === "active").length,
    simulated_at: new Date().toISOString(),
  });
});

router.get("/understudy/outreach", (_req, res) => res.json(OUTREACH));

router.post("/understudy/outreach/:id/acknowledge", (req, res) => {
  const item = OUTREACH.find((o) => o.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  item.status = "acknowledged";
  return res.json(item);
});

router.post("/understudy/outreach/:id/resolve", (req, res) => {
  const item = OUTREACH.find((o) => o.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  item.status = "resolved";
  return res.json(item);
});

router.get("/understudy/pairings", (_req, res) => res.json(PAIRINGS));

router.post("/understudy/generate-message", async (req, res) => {
  const { trainee_name, issue, recommendation, tone } = req.body as {
    trainee_name: string; issue: string; recommendation: string; tone?: string;
  };
  if (!trainee_name || !issue) return res.status(400).json({ error: "trainee_name and issue are required" });

  const prompt = `You are an SDI (Software Development Internship) program coordinator writing a professional outreach message to a trainee named ${trainee_name}.

Issue detected: ${issue}
Recommendation: ${recommendation || "Support the trainee"}
Tone: ${tone || "supportive but direct"}

Write a short, professional message (3-4 sentences max) to send to ${trainee_name}. 
- Start with their name
- Acknowledge the observation without being harsh
- State the specific action needed
- End with an offer of support
- Keep it under 80 words
- Do NOT use placeholders like [your name] — sign off as "The NxtPulse Team"`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });
    return res.json({ message: completion.choices[0]?.message?.content?.trim() || "" });
  } catch (_e) {
    return res.json({
      message: `Hi ${trainee_name}, we noticed ${issue.toLowerCase()}. ${recommendation} Please reach out if you need support. — The NxtPulse Team`,
    });
  }
});

export default router;
