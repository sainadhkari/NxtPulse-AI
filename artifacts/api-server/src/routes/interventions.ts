import { Router } from "express";
import pg from "pg";

const router = Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const SEED_INTERVENTIONS = [
  { id: "i1", trainee_id: "t1", trainee_name: "Rahul Verma", type: "attendance", status: "pending", recommendation: "Schedule 1-on-1 check-in immediately. Attendance dropped 30% in 2 weeks.", issue: "Attendance dropped from 92% to 62%", created_at: "2025-06-19T09:00:00Z" },
  { id: "i2", trainee_id: "t2", trainee_name: "Sai Krishna", type: "ai_dependency", status: "pending", recommendation: "Assign manual coding exercises with no AI tools for 5 days.", issue: "AI dependency at 52% — trending upward", created_at: "2025-06-18T14:00:00Z" },
  { id: "i3", trainee_id: "t5", trainee_name: "Vikram Singh", type: "demo_quality", status: "acknowledged", recommendation: "Pair with high performer for mock demos. Schedule daily standups.", issue: "Demo score declined 3 sessions in a row", created_at: "2025-06-17T10:00:00Z" },
  { id: "i4", trainee_id: "t8", trainee_name: "Pooja Menon", type: "engagement", status: "pending", recommendation: "Immediate escalation to manager. Low engagement + on leave signal burnout.", issue: "No standup participation for 5 days, on leave", created_at: "2025-06-16T08:00:00Z" },
  { id: "i5", trainee_id: "t11", trainee_name: "Rohit Joshi", type: "standup", status: "pending", recommendation: "Mandatory standup participation. Review task completion workflow.", issue: "Missed 8 consecutive standups", created_at: "2025-06-15T11:00:00Z" },
];

async function seedInterventionsIfEmpty() {
  try {
    const count = await pool.query("SELECT COUNT(*) FROM interventions");
    if (parseInt(count.rows[0].count) === 0) {
      for (const iv of SEED_INTERVENTIONS) {
        await pool.query(
          `INSERT INTO interventions (id, trainee_id, trainee_name, issue, recommendation, status, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
          [iv.id, iv.trainee_id, iv.trainee_name, iv.issue, iv.recommendation, iv.status, iv.created_at, iv.created_at]
        );
      }
    }
  } catch (_e) {}
}

seedInterventionsIfEmpty();

async function getAll(status?: string) {
  try {
    let query = "SELECT * FROM interventions ORDER BY created_at DESC";
    const params: string[] = [];
    if (status) {
      query = "SELECT * FROM interventions WHERE status = $1 ORDER BY created_at DESC";
      params.push(status);
    }
    const result = await pool.query(query, params);
    if (result.rows.length > 0) return result.rows;
  } catch (_e) {}
  return status ? SEED_INTERVENTIONS.filter((i) => i.status === status) : SEED_INTERVENTIONS;
}

router.post("/interventions/create", async (req, res) => {
  const { trainee_name, trainee_id, type, issue, recommendation } = req.body;
  if (!trainee_name || !trainee_id || !type || !issue || !recommendation) {
    return res.status(400).json({ error: "trainee_name, trainee_id, type, issue, and recommendation are required" });
  }
  const id = `i${Date.now()}`;
  const now = new Date().toISOString();
  const item = { id, trainee_id, trainee_name, type, status: "pending", recommendation, issue, created_at: now };
  try {
    await pool.query(
      `INSERT INTO interventions (id, trainee_id, trainee_name, issue, recommendation, status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,'pending',$6,$6)`,
      [id, trainee_id, trainee_name, issue, recommendation, now]
    );
  } catch (_e) {}
  return res.status(201).json(item);
});

router.get("/interventions", async (req, res) => {
  const { status } = req.query as Record<string, string>;
  return res.json(await getAll(status));
});

async function updateStatus(id: string, status: string, res: any) {
  try {
    const result = await pool.query(
      "UPDATE interventions SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *",
      [status, id]
    );
    if (result.rows.length > 0) return res.json(result.rows[0]);
  } catch (_e) {}
  const seed = SEED_INTERVENTIONS.find((i) => i.id === id);
  if (!seed) return res.status(404).json({ error: "Not found" });
  return res.json({ ...seed, status });
}

router.post("/interventions/:id/acknowledge", (req, res) => updateStatus(req.params.id, "acknowledged", res));
router.post("/interventions/:id/resolve", (req, res) => updateStatus(req.params.id, "resolved", res));
router.post("/interventions/:id/dismiss", (req, res) => updateStatus(req.params.id, "dismissed", res));

export default router;
