# NxtPulse Frontend Audit Report
**Date:** 2026-06-29  
**Scope:** Full UI audit — all three user modules (Manager, POC, SDI)  
**Status:** ✅ Complete

---

## Root Cause

Every page inside `<Layout>` wrapped its content in `overflow-y-auto h-screen`. The Layout's `<main>` element was also `overflow-auto`. This created **nested scroll containers** — the inner `h-screen` claimed 100vh inside an already-scrolling parent, causing:

- Blank whitespace at the bottom of every page (the inner h-screen was taller than the actual content area available)
- Content clipped at viewport boundaries
- Double scrollbars in some browsers
- Chat UIs rendering outside the visible area

---

## Files Modified

### Layout Architecture

| File | Change |
|------|--------|
| `src/components/layout.tsx` | Root: `bg-background flex flex-col md:flex-row md:h-screen md:overflow-hidden`. Main: `flex-1 overflow-y-auto bg-background min-h-0`. Mobile now scrolls naturally; desktop locks to viewport via `md:` prefix. |

### Standard Pages (24 files) — Nested Scroll Removal

Removed `overflow-y-auto h-screen` (and variant `h-screen overflow-y-auto`) from page wrapper `<div>` elements. Pattern: `p-6 space-y-6 overflow-y-auto h-screen` → `p-6 space-y-6`.

Files updated via bulk sed:
- `src/pages/cohorts.tsx`
- `src/pages/interventions.tsx`
- `src/pages/trainee-profile.tsx`
- `src/pages/understudy.tsx`
- `src/pages/wellness.tsx`
- `src/pages/insights.tsx`
- `src/pages/dashboard/manager.tsx`
- `src/pages/dashboard/poc.tsx`
- `src/pages/dashboard/sdi.tsx`
- `src/pages/poc/attendance.tsx`
- `src/pages/poc/calendar.tsx`
- `src/pages/poc/cohorts.tsx`
- `src/pages/poc/interventions.tsx`
- `src/pages/poc/learnguard.tsx`
- `src/pages/poc/my-trainees.tsx`
- `src/pages/poc/notifications.tsx`
- `src/pages/poc/standups.tsx`
- `src/pages/poc/syncups.tsx`
- `src/pages/poc/trainee-profile.tsx`
- `src/pages/poc/understudy.tsx`
- `src/pages/sdi/alerts.tsx`
- `src/pages/sdi/attendance.tsx`
- `src/pages/sdi/ccbp.tsx`
- `src/pages/sdi/demo-performance.tsx`
- `src/pages/sdi/instructor-readiness.tsx`
- `src/pages/sdi/learnguard.tsx`
- `src/pages/sdi/tech-os.tsx`
- `src/pages/sdi/understudy.tsx`

### Chat UIs — h-screen → h-full

| File | Change |
|------|--------|
| `src/pages/learnguard-chat.tsx` | Outer wrapper: `h-screen flex flex-col overflow-hidden` → `h-full flex flex-col overflow-hidden` |
| `src/pages/sdi/ai-coach.tsx` | Outer wrapper: `flex flex-col h-screen` → `flex flex-col h-full` |

### Loading/Error State Centering

| File | Change |
|------|--------|
| `src/pages/cohorts.tsx` | `h-screen` centering → `min-h-[60vh]` |
| `src/pages/trainee-profile.tsx` | `h-screen` centering → `min-h-[60vh]` |
| `src/pages/poc/cohorts.tsx` | `h-screen` centering → `min-h-[60vh]` |
| `src/pages/poc/trainee-profile.tsx` | `h-screen` centering → `min-h-[60vh]` |

### Responsive Fixes

| File | Change |
|------|--------|
| `src/pages/poc/calendar.tsx` | Main grid: `flex gap-4 items-start` → `flex flex-col xl:flex-row gap-4 items-start`. Calendar view wrapped in `flex-1 min-w-0 overflow-x-auto`. Right panel got responsive width wrapper `w-full xl:w-72`. |
| `src/pages/poc/attendance.tsx` | Heatmap card: `overflow-hidden` → `overflow-x-auto`. Layout column: added `min-w-0`. |
| `src/pages/sdi/tech-os.tsx` | Summary strip: `grid-cols-3 gap-4` → `grid-cols-1 sm:grid-cols-3 gap-4` |
| `src/pages/understudy.tsx` | Progress strip: `grid-cols-3 gap-4` → `grid-cols-1 sm:grid-cols-3 gap-4` |
| `src/pages/poc/understudy.tsx` | Progress strip: `grid-cols-3 gap-4` → `grid-cols-1 sm:grid-cols-3 gap-4` |

---

## Pages Intentionally Not Changed

| File | Reason |
|------|--------|
| `src/pages/auth.tsx` | Standalone page outside `<Layout>` — `min-h-screen` is correct |
| `src/pages/index.tsx` | Redirect page — no layout issues |
| `src/pages/not-found.tsx` | Standalone page — `min-h-screen` is correct |
| `src/pages/wellness.tsx` | Used `max-w-[1400px] mx-auto` correctly — no h-screen issue |
| `src/pages/insights.tsx` | Used `max-w-[1400px] mx-auto` correctly — no h-screen issue |

---

## Issues Found vs. Fixed

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | Nested scroll containers (h-screen inside overflow-auto main) | Critical | ✅ Fixed |
| 2 | Chat UIs claiming h-screen inside layout, rendering outside viewport | Critical | ✅ Fixed |
| 3 | Loading/error divs using h-screen for centering, creating blank whitespace | Medium | ✅ Fixed |
| 4 | Mobile layout: h-screen + overflow-hidden clipping content in flex-col mode | High | ✅ Fixed (md: prefix) |
| 5 | Calendar right panel not stacking on smaller screens | Medium | ✅ Fixed |
| 6 | Attendance heatmap grid potentially overflowing horizontally | Low | ✅ Fixed |
| 7 | grid-cols-3 without responsive breakpoints on small screens | Low | ✅ Fixed |

---

## Remaining Recommendations (Not In Scope)

1. **Mobile sidebar collapse** — On very small screens (< 768px) the full sidebar nav shows before page content. A hamburger/drawer pattern would improve mobile UX.
2. **Auth security** — API routes lack auth middleware (routes accessible without valid token). Flagged in prior session, not in UI audit scope.
3. **Password strength** — Demo seed accounts use weak passwords (poc123, sdi123). Not in UI audit scope.
4. **UI consistency pass** — Minor variations in card padding (p-4 vs p-5) and shadow weight across components. Low priority.
