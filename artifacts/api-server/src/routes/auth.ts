import { Router } from "express";

const router = Router();

const USERS = [
  { id: "m1", name: "Arjun Sharma", email: "manager@nxtpulse.ai", role: "manager", cohort: null },
  { id: "p1", name: "Priya Nair", email: "poc@nxtpulse.ai", role: "poc", cohort: "Cohort-7" },
  { id: "s1", name: "Rahul Verma", email: "sdi@nxtpulse.ai", role: "sdi", cohort: "Cohort-7" },
];

router.post("/auth/login", (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: "email, password, and role are required" });
  }
  const user = USERS.find((u) => u.email === email && u.role === role)
    || USERS.find((u) => u.role === role);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = `nxtpulse_token_${user.id}_${Date.now()}`;
  return res.json({ token, user });
});

router.get("/auth/me", (req, res) => {
  const auth = req.headers.authorization;
  let user = USERS[0];
  if (auth) {
    const parts = auth.replace("Bearer ", "").split("_");
    const uid = parts[2];
    user = USERS.find((u) => u.id === uid) || USERS[0];
  }
  return res.json(user);
});

export default router;
