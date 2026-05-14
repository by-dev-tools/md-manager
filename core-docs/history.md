# History

Detailed record of shipped work. Reverse chronological (newest first). This is not a changelog — it captures the **why**, **tradeoffs**, and **decisions** behind each change so future sessions have full context on how the project evolved.

Use the `SAFETY` marker on any entry that modifies error handling, persistence, data loss prevention, or fallback behavior.

---

## How to Write an Entry

```
### [Short title of what was shipped]
**Date:** YYYY-MM-DD
**Branch:** branch-name
**Commit:** [SHA or range]

**What was done:**
[Concrete deliverables — what changed in user-facing terms.]

**Why:**
[The problem this solved or the goal it served.]

**Design decisions:**
- [UX or product choice + reasoning]

**Technical decisions:**
- [Implementation choice + reasoning]

**Tradeoffs discussed:**
- [Option A vs Option B — why this one won]

**Lessons learned:**
- [What didn't work, what did, what to do differently]
```

---

## Entries

### Initialize project documentation + agent workflow
**Date:** 2026-05-13
**Branch:** seattle-v1
**Commit:** [pending — will land in the same PR as the scaffold OR the next one]

**What was done:**
- Ran `/init-project` against the existing prototype scaffold (Vite + React + TS Notes app).
- Authored CLAUDE.md as a high-level router pointing at `core-docs/` and `.claude/`.
- Populated `core-docs/spec.md` (vision, problem, solution, features, open questions), `core-docs/plan.md` (current focus + handoff notes), `core-docs/roadmap.md` (now / next / later / someday / cleanup), `core-docs/workflow.md` (the 10-step request→ship loop with explicit "never merge" rule), `core-docs/design-language.md` (tokens, typography, surface modes, component guidelines, a11y checklist).
- Authored 5 skills: `/staff-review` (three-lens parallel review, fixes in-tree, captures follow-ups to roadmap/plan), `/ship` (final security + a11y reviews, doc updates, commit, push, PR, never merge), `/security-review` and `/accessibility-review` (single-lens diff audits invoked by ship or standalone), and kept `/link` from the template (Vite dev-server starter).
- Removed template skills not in the user's list (`audit`, `dev-panel`, `setup`).
- Wiped stale forge cache files inherited from the template (`.claude/forge/cache/*`).
- Updated the user-scoped `/init-project` skill to source from `~/dev/project-template/` (was `~/Desktop/coding/project-template/`).

**Why:**
The prototype scaffold landed (#1) without the agent workflow infrastructure that the user runs across their other projects (language-app, manipulation-identifier, forge). Standing this up now — before any real feature work — means every feature from here on gets the full plan/review/ship discipline and the docs stay honest.

**Design decisions:**
- CLAUDE.md is a **router**, not a content doc. Decisions live in `core-docs/`. Rationale: a content-heavy CLAUDE.md goes stale; a router that points at canonical docs ages with the project.
- Three reviews exist (`staff-review`, `security-review`, `accessibility-review`) rather than one mega-review. Rationale: each lens has its own bar and gotchas; conflating them muddies findings.
- Follow-ups from reviews route to `roadmap.md` / `plan.md`, **not only** to the PR body. Rationale: PR bodies vanish after merge; docs are the source of truth.
- `/ship` never merges. Rationale: the human reviewer is the whole point of the review pass.

**Technical decisions:**
- Used language-app's `staff-perspective-review` skill as the structural reference for `staff-review` (three parallel `Agent` calls, BLOCKER/NIT/FOLLOW-UP triage, reviewer-notes template).
- Used language-app's `commands/ship.md` as the structural reference for `ship`, but extended it with the security + accessibility passes and the explicit feedback-synthesis step the user described.
- Skills use `disable-model-invocation: true` so they only fire when explicitly invoked, not auto-triggered by the model.
- `allowed-tools` on each skill lists `Agent` because they all spawn sub-agents.

**Tradeoffs discussed:**
- **One big "review" skill vs three focused ones.** Picked three — security and accessibility have distinct expertise bars; collapsing them into staff-review would dilute both.
- **PR-only follow-up capture vs roadmap.md.** Picked roadmap.md (canonical) + PR body mention (visibility). PR-only loses information at merge.
- **Auto-invoke skills vs explicit-only.** Picked explicit-only via `disable-model-invocation`. The user wants intentional triggers, not surprise pipelines.

**Lessons learned:**
- The `/init-project` skill itself had `disable-model-invocation: true`, which meant Claude couldn't fire it via the Skill tool even when the user typed `/init-project`. Workaround for this session: ran the steps manually. Long-term fix: either remove that flag from the skill or ensure the harness registers it as a real slash command in every workspace.
- The template's `settings.local.json` shipped with permissions specific to the personal-user-skills repo — flagged as cleanup in `roadmap.md`.

### Scaffold Notes app prototype (Vite + React + TS)
**Date:** 2026-05-13 (approx — based on commit timestamp)
**Branch:** seattle-v1 (PR #1)
**Commit:** d504073

**What was done:**
- Initialized Vite + React 18 + TypeScript project.
- Built the two-pane shell (sidebar + content surface), file tree, draft list, markdown editor with preview/markdown mode toggle, color rail (HSL gradient + presets + manual picker), attach popover, overflow menu, add-repo modal.
- Established CSS custom-property design tokens in `src/styles/globals.css` (sand neutrals, type scale, spacing scale, radius scale, surface shadow).
- Wired `agentation` dev toolbar (dev-only).

**Why:**
Get the visual and interaction shape on screen before any real persistence or sync work, so the design language and surface ergonomics can be evaluated against actual content rather than mockups.

**Design decisions:**
- Picked Radix-sand-inspired warm neutrals over cool grays for warmth without nostalgia.
- Geist + Geist Mono for a modern, technical-but-readable feel; mono for sidebar/file paths gives it the IDE-adjacent affordance.
- Two surface modes (floating / flat) as a thesis about giving the user control over posture, not just color.
- Color rail on the right edge as the user-controlled-tone signature — different from a settings-modal hidden theme.

**Technical decisions:**
- Vanilla CSS with custom properties rather than Tailwind. Rationale: runtime-settable tokens (page tint) are first-class; Tailwind's design-time JIT isn't a fit.
- Local store via `useStore` custom hook in `src/store.tsx` — no Redux, no Zustand. Prototype state is simple enough.
- In-memory persistence only. Real persistence is a deliberate next step, not a yak-shave at scaffold time.

**Tradeoffs discussed:**
N/A — initial scaffold, design decisions documented above are the substantive ones.

**Lessons learned:**
- `package.json` shipped with name `"mumbai"` (likely a working code name) — should be renamed to match the canonical project name. Captured in `roadmap.md` cleanup.
