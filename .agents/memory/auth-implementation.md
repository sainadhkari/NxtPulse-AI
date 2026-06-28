---
name: Auth implementation
description: How NxtPulse auth works — DB-backed users, bcryptjs hashing, JWT tokens
---

Users are stored in the PostgreSQL `users` table (defined in `lib/db/src/schema/index.ts`).

On every API server start, `seedUsers()` in `artifacts/api-server/src/routes/auth.ts` inserts the 3 demo users if they don't already exist (idempotent check by email).

**Why:** Previous auth had a critical security hole — `|| USERS.find((u) => u.role === role)` allowed any password to work. Replaced with bcrypt.compare against DB-stored hash.

**How to apply:** If new demo users are needed, add them to the `DEMO_USERS` array in auth.ts. Push schema with `pnpm --filter @workspace/db run push` if schema changes.

- JWT secret: `SESSION_SECRET` env var or fallback dev secret, 7-day expiry
- Token stored in `localStorage` via `lib/auth.ts`
- `/api/auth/login` — POST { email, password } → { token, user }
- `/api/auth/me` — GET with Bearer token → user object
