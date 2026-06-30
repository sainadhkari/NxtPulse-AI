# NxtPulse AI — Full-Stack Engineering Audit Report
**Date:** 2026-06-30  
**Scope:** Frontend (nxtpulse), API server, shared libraries (api-client-react, api-zod, db)

---

## 1. TypeScript Errors

### Before
- **110 errors** in `artifacts/nxtpulse` (`tsc --noEmit`)
- **2 errors** in `artifacts/api-server`
- Root cause: `lib/api-client-react`, `lib/api-zod`, `lib/db` had `composite: true` tsconfigs but no compiled `dist/` output — cascading TS6305 (missing declaration files) and TS7006 (implicit `any`) errors.

### Actions Taken
1. **Built all three lib packages** (`tsc -p tsconfig.json`) — generated `dist/` with `.d.ts` declaration files.
2. **Extended `TelemetryRow` type** — added `cohort: string`, `attendance: number`, `ai_dependency: number` (backend returns these, type was incomplete).
3. **Extended `UnderstudySimulation` type** — added `active_pairings: number`.
4. **Extended `Intervention` type** — added `assigned_to?: string | null`, `due_date?: string | null`.
5. **Extended `RecommendedAction` type** — added `description?: string`.
6. **Extended `GetInterventionsStatus` enum** — added `acknowledged` (pages filter by it; enum was missing it).
7. **Fixed `GlassCard`** — added `onClick?: React.MouseEventHandler<HTMLDivElement>` prop and wired it to the `<div>`, with `cursor-pointer` class applied automatically when onClick is set.
8. **Fixed `understudy.tsx:239`** — union type `tab.urgent` doesn't exist on all union members; changed to `('urgent' in tab && tab.urgent)`.
9. **Fixed `dashboard/manager.tsx`** — removed dead local `ExtTelemetryRow` / `ExtRecommendedAction` type aliases; fixed `action.description` fallback to `action.description ?? action.action`.
10. **Fixed `poc/my-trainees.tsx`** — removed stale `ExtTelemetryRow` alias; fixed type cast via `(a as unknown as Record<string, unknown>)`.
11. **Updated telemetry API endpoint** (`routes/trainees.ts`) to include `cohort`, `attendance`, `ai_dependency` in the `/trainees/telemetry` response, matching the extended type.
12. Updated both `lib/api-client-react` and `lib/api-zod` generated type files in sync.

### After
- **0 errors** in `artifacts/nxtpulse`
- **0 errors** in `artifacts/api-server`

---

## 2. Unused File Cleanup

### Removed (40+ files)
**`artifacts/nxtpulse/src/components/ui/`** — shadcn/ui scaffold files that were never imported:
`accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `breadcrumb`, `calendar`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `drawer`, `hover-card`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `sidebar`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea` (shadcn), `toggle-group`

**Other unused components:**
- `src/components/charts/TrendLineChart.tsx` — never imported
- `src/components/metric-card.tsx` — never imported

### Kept (all actively used)
`badge`, `button`, `card`, `dialog`, `dropdown-menu`, `glass-card`, `input`, `label`, `separator`, `sheet`, `skeleton`, `textarea` (custom), `toaster`, `toast`, `toggle`, `tooltip`

---

## 3. Frontend Scroll Architecture Fix (Previous Session)

**Root cause:** Nested `overflow-y-auto` + `h-screen` inside `<Layout>`'s outer scroll container caused double-scroll and clipped chat pages.

**Fix:** `layout.tsx` root changed to `md:h-screen md:overflow-hidden` (mobile-safe; desktop viewport-locked). Chat pages changed from `h-screen` → `h-full`. Loading/error states changed from `h-screen` → `min-h-[60vh]`.

---

## 4. API Runtime Testing

All tested endpoints returned correct data after rebuilding the API server:

| Endpoint | Method | Status | Notes |
|---|---|---|---|
| `GET /api/healthz` | GET | ✅ `{"status":"ok"}` | — |
| `POST /api/auth/login` | POST | ✅ 189-char JWT | Credentials: `manager@nxtpulse.ai` / `poc@nxtpulse.ai` / `sdi@nxtpulse.ai` |
| `GET /api/trainees/telemetry` | GET | ✅ 12 rows | Now includes `cohort`, `attendance`, `ai_dependency` |
| `GET /api/interventions` | GET | ✅ 5 items | DB-backed with seed fallback |
| `POST /api/interventions/:id/acknowledge` | POST | ✅ status=acknowledged | — |
| `GET /api/understudy/simulation` | GET | ✅ | `active_pairings: 1` confirmed |
| `GET /api/insights/recommended-actions` | GET | ✅ 7 items | 4 priority levels |
| `GET /api/trainees/stats/cohorts` | GET | ✅ 3 cohorts | — |
| `GET /api/wellness/metrics` | GET | ✅ object | — |
| `GET /api/learnguard/evaluations` | GET | ✅ 2 items | — |
| `GET /api/notifications/stream` | GET (SSE) | ✅ live | Events emitted every ~2s |
| `POST /api/assistant/chat` | POST | ✅ 110-char reply | OpenAI fallback active |

**Note:** Auth middleware is not enforced on most routes (no JWT verification middleware attached). The login endpoint works correctly, but non-auth routes accept any request. This is fine for the demo/prototype phase but should be addressed before production.

---

## 5. Performance Audit

### SSE Notifications
- Hook (`use-notifications.ts`) is clean — `useEffect` has an empty dependency array, so no reconnection loop.
- Browser-native EventSource handles automatic reconnection on error.
- Max 30 notifications buffered with deduplication by `id`. ✅

### Memoization
- `React.memo`: 0 components wrapped (acceptable for current data scale)
- `useMemo`: 11 call sites, covering the data-heavy pages (manager dashboard priority-trainee sort, poc dashboard cohort filter, my-trainees sort/filter pipeline)
- `useCallback`: Used in the notifications hook

### Bundle / Dependencies
- `html2canvas` + `jspdf` are dynamic-imported in `trainee-profile.tsx` — lazy loaded, no impact on initial bundle ✅
- `recharts`: Statically imported — the largest runtime dep. Vite tree-shakes individual chart components.
- Many Radix UI packages remain in `package.json` as dependencies even though their UI components were removed. Vite tree-shaking prevents them from bloating the bundle in practice, but package.json cleanup would reduce install time.

### Recommendations (not blocking)
1. **Add auth middleware** on API routes before production deployment.
2. **Prune Radix UI deps from `package.json`** — run `pnpm remove` for the ~20 packages whose shadcn components were deleted.
3. **Add `React.memo`** to the telemetry table row components in manager and poc dashboards if data set grows beyond ~50 rows.
4. **Consider paginating telemetry** on the API side for larger cohorts.

---

## 6. Code Review Fixes (Post-Audit)

Three issues were caught and fixed during post-build code review:

1. **`api-zod/types/recommendedAction.ts` missing `description?`** — `RecommendedAction` in api-zod was not updated to match the api-client-react change. Added `description?: string` to both packages so they stay in sync.

2. **Intervention tab count bug** — `interventions.tsx` computed status counts from a server-filtered result (e.g., when the "pending" tab was active, only pending items were fetched, making acknowledged/resolved counts show 0). Fixed: now always fetches the full list; client-side filters applied for both counts and display via a `displayedInterventions` derived variable.

3. **Client-side display not filtered** — After switching to always-fetch, the rendered card list still needed to respect the active tab. Fixed by replacing `interventions.map(...)` with `displayedInterventions.map(...)` in the render path.

---

## 7. Summary

| Category | Before | After |
|---|---|---|
| TS errors (nxtpulse) | 110 | 0 |
| TS errors (api-server) | 2 | 0 |
| Unused UI components | 40+ | 0 |
| API endpoints tested | — | 12/12 passing |
| SSE reconnection loop | Risk flagged | None (clean) |
| GlassCard onClick | Prop accepted, not wired | Wired + cursor-pointer |
| Type/backend field mismatch | 8 locations | 0 |
