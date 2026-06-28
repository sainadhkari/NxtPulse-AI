import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();
const JWT_SECRET = process.env.SESSION_SECRET || "nxtpulse_dev_secret_2025";
const SALT_ROUNDS = 10;

const DEMO_USERS = [
  { name: "Arjun Sharma", email: "manager@nxtpulse.ai", password: "manager123", role: "manager" as const, cohort: null },
  { name: "Priya Nair",   email: "poc@nxtpulse.ai",     password: "poc123",     role: "poc" as const,     cohort: "Cohort-7" },
  { name: "Rahul Verma",  email: "sdi@nxtpulse.ai",     password: "sdi123",     role: "sdi" as const,     cohort: "Cohort-7" },
];

async function seedUsers() {
  try {
    for (const user of DEMO_USERS) {
      const existing = await db.select().from(usersTable).where(eq(usersTable.email, user.email)).limit(1);
      if (existing.length === 0) {
        const hashed = await bcrypt.hash(user.password, SALT_ROUNDS);
        await db.insert(usersTable).values({ ...user, password: hashed });
        console.log(`[auth] Seeded user: ${user.email}`);
      }
    }
  } catch (err) {
    console.error("[auth] Seed error:", err);
  }
}

seedUsers();

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _pw, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error("[auth] Login error:", err);
    return res.status(500).json({ error: "Authentication service unavailable" });
  }
});

router.get("/auth/me", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token" });
  }
  try {
    const payload = jwt.verify(auth.replace("Bearer ", ""), JWT_SECRET) as { id: number; role: string };
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, payload.id))
      .limit(1);

    if (!user) return res.status(401).json({ error: "User not found" });
    const { password: _pw, ...safeUser } = user;
    return res.json(safeUser);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
