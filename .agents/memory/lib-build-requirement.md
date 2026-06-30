---
name: Lib package build requirement
description: The three shared lib packages must be compiled before the frontend can type-check; missing dist/ causes cascading TS6305 errors.
---

## Rule
Before running `tsc --noEmit` in `artifacts/nxtpulse` or `artifacts/api-server`, ensure all three lib packages have been built:
```
cd lib/api-client-react && npx tsc -p tsconfig.json
cd lib/api-zod          && npx tsc -p tsconfig.json
cd lib/db               && npx tsc -p tsconfig.json
```

**Why:** Each lib has `composite: true` in its tsconfig. Without built `dist/` output, TypeScript can't resolve the workspace imports, causing TS6305 "output file not built from input" errors that then cascade into TS7006 implicit-any errors across ~100 locations.

**How to apply:** Run all three builds whenever starting a fresh session that involves TypeScript checking. The builds are fast (<2s each).
