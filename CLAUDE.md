# CLAUDE.md — md-manager

A markdown notes app with a content-forward, warm-neutral interface. Drafts live unattached or get attached to a connected repo; repo-files render in a file tree alongside drafts.

**Core thesis:** Notes should feel like a calm, single surface — content over chrome, warmth over sterility, with the user always in control of the visual tone.

**Family:** sister app to [Designer](/Users/benyamron/dev/designer/) — shared design DNA, distinct personality. Mini adoption + surface posture are open questions. See `core-docs/design-language.md` § "Family" for what's confirmed vs. undecided.

---

## Default workflow

**Every non-trivial request follows this loop.** Full detail in [`core-docs/workflow.md`](core-docs/workflow.md); the rules below are non-negotiable.

```
1. Clarify       ask 2–4 focused questions; read relevant docs before asking
2. Plan          write a plan in core-docs/plan.md; WAIT for user approval
3. Execute       implement the approved plan; stay in scope
4. Commit        explain "why", not what; co-author trailer at end
5. /staff-review three lenses in parallel; fix BLOCKERs + cheap NITs in-tree;
                 capture FOLLOW-UPs to roadmap.md / plan.md (never PR-body-only)
6. Present       share review report + dev URL (/link) + PR link
7. Iterate       apply user feedback
8. /ship         security + a11y final pass → synthesize feedback.md → update
                 history.md / plan.md / roadmap.md / spec.md → commit → push → PR
9. STOP          the user merges. Claude never merges.
```

**Hard rules — these apply even if the user's phrasing seems to skip a step:**

- **Never start coding without an approved plan.** Even a "small" change. Write the plan, wait.
- **Never merge.** `gh pr merge` is not a Claude action. Hand to the user with a PR link.
- **Follow-ups go to `roadmap.md` or `plan.md`**, not only the PR body. PR bodies vanish at merge.
- **Read before writing.** `plan.md` at session start; `feedback.md` + `design-language.md` before any UI work.
- **Use tokens, not raw values.** `--sand-*`, `--space-*`, `--radius-*` in `src/styles/globals.css` — never hardcode hex or px.
- **`/ship` owns doc updates** (history, plan, roadmap, spec, feedback). Don't update them piecemeal during execution — let `/ship` synthesize at the end.

---

## Tech stack

- **Platform:** Web (modern browsers)
- **Language/UI:** TypeScript + React 18 + vanilla CSS (CSS custom properties for tokens — no Tailwind, no UI lib; Mini adoption pending)
- **Build:** Vite 5
- **Backend:** None (local-only prototype; persistence story TBD — see `core-docs/spec.md`)
- **Persistence:** Currently in-memory via `src/store.tsx`. localStorage / file-system / repo-sync are open questions.
- **Notable deps:** `agentation` (dev-mode toolbar only)

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server (default port 5173). Use `/link` instead — it handles port conflicts. |
| `npm run build` | TypeScript build + Vite production build. |
| `npm run typecheck` | `tsc -b --noEmit` — fast type-only pass. Run after any code change in a review pipeline. |
| `npm run preview` | Preview the production build locally. |

Dependencies install via `npm install`. The repo doesn't commit `node_modules`; expect a fresh clone to need install before any command runs.

## Product principles

1. **Content over chrome.** UI recedes; the writing surface dominates.
2. **Warmth without nostalgia.** Sand neutrals, Geist typography, subtle depth — modern, not retro.
3. **User-controlled tone.** Page tint is the user's call (color rail). The app adapts.
4. **Surface posture is the user's choice (open question).** Prototype ships both floating and flat; final answer undecided. See `core-docs/design-language.md` § "Family".
5. **Markdown is the data.** Files are `.md`. No proprietary format, no lock-in.
6. **Small, ship-shaped changes.** Bias toward shipping a tight slice over batching ambition.

---

## Where to look

This file is a **router**. Decisions live in `core-docs/` and `.claude/`.

### Core docs (`core-docs/`)

| Doc | Read when | Purpose |
|---|---|---|
| [`workflow.md`](core-docs/workflow.md) | Once per session, whenever the loop above isn't enough | The loop in full, with anti-patterns |
| [`spec.md`](core-docs/spec.md) | Starting any new feature; debating scope | Product vision, problem, solution, feature list with status |
| [`plan.md`](core-docs/plan.md) | Every session, at the start | Current focus, active work, handoff notes, recently completed, backlog |
| [`roadmap.md`](core-docs/roadmap.md) | Capturing deferred follow-ups; mid-term planning | Horizons (now / next / later), workstreams |
| [`history.md`](core-docs/history.md) | When you need the **why** behind past work | Decision log per shipped change: what, why, design decisions, tradeoffs, lessons |
| [`feedback.md`](core-docs/feedback.md) | Before any UI/UX work; during `/ship` synthesis | User corrections and preferences, distilled into rules |
| [`design-language.md`](core-docs/design-language.md) | Any UI change | Visual tokens, typography, spacing, components, motion rules |

### Skills (`.claude/skills/`) — explicit `/`-invoke only

| Skill | Trigger | What it does |
|---|---|---|
| `/link` | "start the dev server", "show me" | Starts Vite, handles port conflicts, returns the URL |
| `/staff-review` | After implementation, before presenting | Three parallel review lenses (engineer / UX / design engineer); fixes small issues in-tree |
| `/security-review` | Markdown rendering, URL/file handling changes; auto by `/ship` | Diff-focused security audit for this stack |
| `/accessibility-review` | Any UI change; auto by `/ship` | Diff-focused WCAG 2.1 AA audit |
| `/ship` | "ship it" | Final security + a11y pass, doc updates, commit, push, open PR (no merge) |

### Optional agents (`.claude/agents/` — context-isolation escape hatches)

| Agent | When to use |
|---|---|
| `planner` | Large/complex feature where writing the plan in the main thread would muddy execution. `claude --agent planner`. |
| `docs` | Long implementation session — main context is code-heavy and you want a clean slate for the `history.md` entry. `claude --agent docs`. |

Default path handles plan-writing and doc-writing in the main thread; reach for these only when context-isolation has real value.

### Rules (`.claude/rules/` — auto-load by path match)

| Rule | Loads on | Enforces |
|---|---|---|
| `general.md` | Always (`**/*`) | Workflow discipline, scope, autonomous-work guardrails |
| `ui.md` | `src/components/**`, `src/styles/**`, `**/*.tsx`, `**/*.css` | Read design-language.md first; use tokens; a11y baseline |
| `safety.md` | `src/store.tsx`, `src/data/**`, `src/lib/markdown.ts`, app entry | Don't silently downgrade error handling; flag `SAFETY` changes |
| `documentation.md` | `core-docs/**` | Format rules for history.md / feedback.md / plan.md |
| `dev-server.md` | UI files (`*.tsx`, `*.css`, etc.) | Surface the dev URL after UI work |

---

## Quality bar

Code doesn't ship unless it meets all of these:

- **Functional** — does what it's supposed to; edge cases handled; `npm run typecheck && npm run build` clean.
- **Accessible** — WCAG 2.1 AA. Keyboard-navigable, focus-visible, contrast-passing, reduced-motion-respecting.
- **Performant** — no visible jank on a 4-year-old laptop. Interactions feel instant (<100ms perceived).
- **On-brand** — uses design tokens, respects `design-language.md`, no hardcoded hex/px values.
- **Documented** — `history.md` entry exists (added by `/ship`); any new rule lives in the right doc.
