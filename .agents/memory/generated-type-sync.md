---
name: Generated type sync rule
description: Type changes must be mirrored in BOTH api-client-react and api-zod generated files; they are separate packages that must stay in sync.
---

## Rule
Any interface/enum extension in the generated types must be applied to two locations:
1. `lib/api-client-react/src/generated/api.schemas.ts` (single flat file)
2. `lib/api-zod/src/generated/types/<TypeName>.ts` (one file per type)

**Why:** `api-client-react` is used by the React frontend for hooks and types. `api-zod` is used by the API server for Zod validation schemas. They are generated from the same OpenAPI spec but live in separate packages. Missing an update in one causes compile errors in the consuming package.

**How to apply:** After changing any interface in api-client-react, grep for the same interface name in api-zod and apply the same change. Rebuild both packages afterward.

**Interfaces that exist in both (as of last audit):**
- `TelemetryRow` — added `cohort`, `attendance`, `ai_dependency`
- `UnderstudySimulation` — added `active_pairings`
- `Intervention` — added `assigned_to?`, `due_date?`
- `RecommendedAction` — added `description?`
- `GetInterventionsStatus` enum — added `acknowledged`
