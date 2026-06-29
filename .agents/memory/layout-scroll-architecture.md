---
name: NxtPulse layout scroll architecture
description: How the single-scroll-container layout works and what patterns to avoid when adding new pages
---

# Layout Scroll Architecture

## The rule
Only ONE scroll container exists: `<main className="flex-1 overflow-y-auto bg-background min-h-0">` inside `<Layout>`.

**Page components must NOT add their own `overflow-y-auto`, `overflow-auto`, or `h-screen`** — doing so creates a nested scroll that causes blank whitespace, clipped content, and double scrollbars.

## Correct page pattern
```tsx
<Layout>
  <div className="p-6 space-y-6">
    {/* content */}
  </div>
</Layout>
```

## Chat/full-height pages
Pages that need a fixed-height UI (chat, panels with internal scroll) should use `h-full` not `h-screen`:
```tsx
<Layout>
  <div className="h-full flex flex-col overflow-hidden">
    <div className="flex-1 overflow-y-auto">messages</div>
    <div className="shrink-0">input</div>
  </div>
</Layout>
```

## Root layout classes
- `<div className="bg-background text-foreground flex flex-col md:flex-row md:h-screen md:overflow-hidden">`
- Mobile (`flex-col`): natural height, body scrolls
- Desktop (`md:flex-row`): viewport-locked, only `<main>` scrolls

**Why:** `overflow-hidden` without the `md:` prefix clips mobile content when the sidebar takes vertical space in column layout.

## Loading/error centering
Use `min-h-[60vh]` for centered empty/loading states inside pages, not `h-screen`.
