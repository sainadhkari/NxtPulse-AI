---
name: bcrypt vs bcryptjs
description: Why bcryptjs is used instead of bcrypt in this workspace
---

Use `bcryptjs` (pure JavaScript) instead of `bcrypt` (native C++ bindings).

**Why:** pnpm's security policy in this workspace blocks native build scripts during install (`Ignored build scripts: bcrypt@6.0.0`). The native bcrypt package requires running a post-install build step to compile bindings, which is blocked.

**How to apply:** Always install `bcryptjs` + `@types/bcryptjs` when password hashing is needed. Import: `import bcrypt from "bcryptjs"` — the API is identical to the `bcrypt` package.
