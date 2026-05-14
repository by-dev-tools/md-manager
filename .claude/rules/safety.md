---
paths:
  - "src/store.tsx"
  - "src/data/**"
  - "src/lib/markdown.ts"
  - "src/main.tsx"
  - "src/App.tsx"
  - "**/*Storage*"
  - "**/*Persistence*"
  - "**/*Migration*"
  - "**/*Repository*"
---

# Safety-Critical Code Rules

This file loads automatically when you touch persistence, state, markdown processing, or app entry points in md-manager.

## Why these paths

- `src/store.tsx` — the single source of in-app state (drafts, repos, repo-files, selection). Mishandling here loses user notes.
- `src/data/seed.ts` — initial data shape; changes can break the store on reload once persistence ships.
- `src/lib/markdown.ts` — markdown rendering. If this doesn't sanitize, it's a security incident waiting to happen.
- `src/main.tsx` / `src/App.tsx` — entry points; errors here brick the app.

## Before modifying safety-critical code

1. Run `git log --oneline -10 -- <file>` to check for recent deliberate safety decisions.
2. If a commit mentions "crash", "data loss", "safety", "integrity", or "fallback" — read its diff first to understand what was deliberately added.
3. Preserve safety behavior through refactors. If restructuring, verify all safety-critical paths from the previous version still exist.
4. For markdown processing changes specifically: re-confirm the sanitization posture. Markdown is user-content-adjacent; treat it as untrusted.

## When committing safety changes

- Flag the commit message with `SAFETY`.
- Add a `SAFETY` marker to the `history.md` entry.
- Explain what safety behavior was preserved, modified, or added.

## Never silently downgrade error handling

- Don't replace explicit `try / catch` with silent fallbacks. Logging to `console.error` is fine; swallowing without any signal is not.
- Don't convert user-facing errors into debug-only logs.
- Don't remove validation without documenting why it's no longer needed in the commit message and `history.md`.

## Persistence-specific rules (apply once persistence ships)

- Write paths must be atomic where possible. localStorage writes are synchronous; IndexedDB requires explicit transaction handling.
- On schema/shape change, write a migration. Don't just hope old data deserializes — version it.
- A failed read should never delete the underlying data. Surface an error; keep the bytes.
- Quota-exceeded errors are real (localStorage caps around 5–10MB). Plan for them; don't crash.

## Markdown-specific rules

- All markdown that came from a user (typed, pasted, loaded from a repo) is **untrusted input**.
- Renderer must strip or escape raw HTML by default. If raw HTML is ever allowed, it's via an explicit opt-in with a sanitizer (DOMPurify or equivalent), and it's documented in `history.md` as a decision.
- URL handling: reject `javascript:` URLs in links and images. Prefer `rel="noopener noreferrer"` on any external link.
