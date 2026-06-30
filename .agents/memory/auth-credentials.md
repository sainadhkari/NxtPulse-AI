---
name: API auth credentials
description: Demo login credentials and API routing conventions for NxtPulse AI.
---

## Demo Credentials
| Role | Email | Password |
|---|---|---|
| manager | manager@nxtpulse.ai | manager123 |
| poc | poc@nxtpulse.ai | poc123 |
| sdi | sdi@nxtpulse.ai | sdi123 |

## API Routing
- API base: `http://localhost:8080/api`
- Health check: `GET /api/healthz` (NOT `/api/health`)
- Auth: `POST /api/auth/login` with `{email, password, role}`
- No auth middleware on non-auth routes (bearer token accepted but not enforced server-side)

**Why:** The auth emails are `@nxtpulse.ai` not `@nxtpulse.in`. The health route is `/healthz` (Kubernetes convention), not `/health`.
