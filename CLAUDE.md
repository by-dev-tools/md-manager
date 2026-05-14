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
7. **Polished, narrow features. Expand scope over time, not quality.** A feature ships when it's fully functional, accessible, and polished — or it doesn't ship. Half-implementations are removed from the surface or wired to completion; they are never visibly present in a broken state. See § "Quality posture" below — this principle is load-bearing for every decision.

---

## Quality posture: ship polished, expand over time

This is the core development philosophy. Read it before scoping any change.

**The rule:** Every feature on the visible surface does what it appears to do — today, in the default build, for every user. We expand scope by adding new fully-functional features over time. We never expand scope by lowering quality.

**Three corollaries follow:**

### 1. No false affordances

A button, input, link, menu item, or any other control visible on the surface must do its job today. If it doesn't, it's a bug — equivalent to a crash, equivalent to broken data. The user's mental model is "controls work"; rendering a control that doesn't is a teaching moment that the app is unreliable, and that lesson is hard to unwind.

The mic icon that doesn't record. The Models pane that's not wired up. The link button that creates markup nothing opens. The "Settings" entry that opens an empty panel. All forbidden in the default build.

### 2. The wire-vs-defer decision

When a feature is partly working, ask: **is the gap between what's there and what's polished < 1 day, using existing primitives?**

- **Yes → wire it.** Default to shipping the complete feature. The user's mental model already expects it to work; meeting that expectation is cheaper than the cost of training them otherwise.
- **No → defer it.** Remove the visible affordance entirely. Capture the work in `core-docs/roadmap.md` for a future polished pass. The roadmap entry must name the surface, the gap, and the rough cost — so the next session knows what "polished" looks like.

Hide-behind-a-flag is the exception, not the default. Use only when the visual placeholder has a legitimate dogfood purpose (e.g., we want internal users to evaluate the rough version) — and even then, flag it off in default builds and document why.

### 3. Scope expansion is additive, never deductive

A feature ships in its smallest polished form. We add capabilities to it later — new options, new edge cases, new integrations — as separate polished increments. We do not ship the full vision in a degraded state and then incrementally fix it. The first version is the one users see; it sets their expectations for the entire app.

**Sister-app reference.** Designer documents the same doctrine in its [`CLAUDE.md`](file:///Users/benyamron/dev/designer/CLAUDE.md) "Quality bar", [`design-language.md`](file:///Users/benyamron/dev/designer/core-docs/design-language.md) "False affordances", and `feedback.md` entries FB-0036 and FB-0038. The principle is shared across the family.

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
- **Polished** — no false affordances. Every visible control does what it appears to do, today. Half-implementations are wired (if cheap, per "Quality posture" § 2) or removed from the surface (if not). See "Quality posture" above — this is non-negotiable.
- **Accessible** — WCAG 2.1 AA. Keyboard-navigable, focus-visible, contrast-passing, reduced-motion-respecting.
- **Performant** — no visible jank on a 4-year-old laptop. Interactions feel instant (<100ms perceived).
- **On-brand** — uses design tokens, respects `design-language.md`, no hardcoded hex/px values.
- **Documented** — `history.md` entry exists (added by `/ship`); any new rule lives in the right doc.
