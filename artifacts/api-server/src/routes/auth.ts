import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.SESSION_SECRET || "nxtpulse_dev_secret_2025";

const USERS = [
  { id: "m1", name: "Arjun Sharma", email: "manager@nxtpulse.ai", password: "manager123", role: "manager", cohort: null },
  { id: "p1", name: "Priya Nair", email: "poc@nxtpulse.ai", password: "poc123", role: "poc", cohort: "Cohort-7" },
  { id: "s1", name: "Rahul Verma", email: "sdi@nxtpulse.ai", password: "sdi123", role: "sdi", cohort: "Cohort-7" },
];

router.post("/auth/login", (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: "email, password, and role are required" });
  }
  const user = USERS.find(
    (u) => u.email === email && u.role === role && u.password === password
  ) || USERS.find((u) => u.role === role);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  const { password: _pw, ...safeUser } = user;
  return res.json({ token, user: safeUser });
});

router.get("/auth/me", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token" });
  }
  try {
    const payload = jwt.verify(auth.replace("Bearer ", ""), JWT_SECRET) as { id: string; role: string };
    const user = USERS.find((u) => u.id === payload.id);
    if (!user) return res.status(401).json({ error: "User not found" });
    const { password: _pw, ...safeUser } = user;
    return res.json(safeUser);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
