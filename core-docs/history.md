# History

Detailed record of shipped work. Reverse chronological (newest first). This is not a changelog — it captures the **why**, **tradeoffs**, and **decisions** behind each change so future sessions have full context on how the project evolved.

Use the `SAFETY` marker on any entry that modifies error handling, persistence, data loss prevention, or fallback behavior.

---

## How to Write an Entry

```
### [Short title of what was shipped]
**Date:** YYYY-MM-DD
**Branch:** branch-name
**Commit / PR:** [SHA, SHA range, or PR link — fill in after commit; "[this commit]" is fine at write time since /ship writes the entry before the commit]

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
**Branch:** init-project (PR #3)
**Commit / PR:** `6d2f0ad..d839127` (4 commits) → https://github.com/byamron/md-manager/pull/3

**What was done:**
- Ran `/init-project` against the existing prototype scaffold (Vite + React + TS Notes app).
- Authored CLAUDE.md as a high-level router pointing at `core-docs/` and `.claude/`, with the canonical workflow loop and Hard Rules up top so every loaded session sees them. Added a Commands section listing `npm` scripts so the model doesn't grep `package.json`.
- Populated `core-docs/spec.md` (vision, problem, solution, features, open questions), `core-docs/plan.md` (current focus + handoff notes), `core-docs/roadmap.md` (now / next / later / someday / cleanup), `core-docs/workflow.md` (the canonical session loop with explicit "never merge" rule and anti-patterns), `core-docs/design-language.md` (tokens, typography, surface modes, component guidelines, a11y checklist, + a "Family" section mapping shared DNA vs. open-question divergences from Designer), `core-docs/feedback.md` (seeded with 6 entries synthesizing this session's directional moments — see FB-0001 through FB-0006).
- Authored 5 skills: `/staff-review` (three-lens parallel review, fixes in-tree, captures follow-ups to roadmap/plan), `/ship` (final security + a11y reviews via Skill tool, doc updates, commit, push, PR, never merge), `/security-review` and `/accessibility-review` (single-lens diff audits invokable directly OR by `/ship`), and kept `/link` from the template (Vite dev-server starter).
- Removed template skills not in the user's list (`audit`, `dev-panel`, `setup`). Kept `planner` and `docs` agents in slimmed form as optional context-isolation escape hatches.
- Wiped stale forge cache files inherited from the template (`.claude/forge/cache/*`). Added `.claude/forge/cache/` to `.gitignore` so future cache regeneration doesn't get committed. Cleaned `.claude/settings.local.json` of stale template-specific permissions.
- Framed md-manager as a sister app to Designer (`~/dev/designer/`) — shared DNA (sand neutrals, Geist, 3/4/5/6 rhythm, surface tier model), with the page tint color rail as the signature confirmed divergence. Surface posture and Mini adoption explicitly marked as open questions.
- Updated the user-scoped `/init-project` skill to source from `~/dev/project-template/` (was `~/Desktop/coding/project-template/`).
- Audited the whole setup against Anthropic Claude Code best practices: added the Commands section, made CLAUDE.md's rules-loading table match actual frontmatter, added explicit `paths: ["**/*"]` to `general.md` so always-load is guaranteed, relaxed the uncompliable commit-SHA requirement in `documentation.md` (forward-references allowed).

**Why:**
The prototype scaffold landed (#1) without the agent workflow infrastructure that the user runs across their other projects (language-app, manipulation-identifier, forge). Standing this up now — before any real feature work — means every feature from here on gets the full plan/review/ship discipline and the docs stay honest.

**Design decisions:**
- CLAUDE.md is a **router**, not a content doc. Decisions live in `core-docs/`. Rationale: a content-heavy CLAUDE.md goes stale; a router that points at canonical docs ages with the project. The workflow loop and Hard Rules are the exception — they're enforcement-critical and need to load every session.
- Three reviews exist (`staff-review`, `security-review`, `accessibility-review`) rather than one mega-review. Rationale: each lens has its own bar and gotchas; conflating them muddies findings.
- Follow-ups from reviews route to `roadmap.md` / `plan.md`, **not only** to the PR body. Rationale: PR bodies vanish after merge; docs are the source of truth.
- `/ship` never merges. Rationale: the human reviewer is the whole point of the review pass.
- Sister-app framing splits divergences into **confirmed** (page tint color rail — won't undo) vs **open questions** (surface posture, Mini adoption, dark mode, dev panel). Rationale: documenting an open question as a decision locks it shut on every CLAUDE.md load; framing matters.

**Technical decisions:**
- Used language-app's `staff-perspective-review` skill as the structural reference for `staff-review` (three parallel `Agent` calls, BLOCKER/NIT/FOLLOW-UP triage, reviewer-notes template).
- Used language-app's `commands/ship.md` as the structural reference for `ship`, but extended it with the security + accessibility passes (via Skill tool, sequential) and the explicit feedback-synthesis step the user described.
- `/staff-review`, `/ship`, `/link` keep `disable-model-invocation: true` (user-triggered only). `/security-review` and `/accessibility-review` had the flag removed so `/ship` can call them via the Skill tool while remaining standalone-callable.
- `general.md` rule got explicit `paths: ["**/*"]` frontmatter to guarantee always-load rather than relying on implicit behavior.
- Two-commit pattern for ship was considered (code commit, then docs commit with SHA reference) but rejected in favor of single-commit + relaxed SHA requirement — friction wasn't worth the marginal traceability benefit. `git log` recovers SHAs.

**Tradeoffs discussed:**
- **One big "review" skill vs three focused ones.** Picked three — security and accessibility have distinct expertise bars; collapsing them into staff-review would dilute both.
- **PR-only follow-up capture vs roadmap.md.** Picked roadmap.md (canonical) + PR body mention (visibility). PR-only loses information at merge.
- **Auto-invoke skills vs explicit-only.** Picked mostly explicit-only via `disable-model-invocation`. Exception: security + a11y reviews, removed so `/ship` can chain them.
- **All-in-one ship commit vs split code-then-docs.** Picked all-in-one; relaxed the SHA requirement to match.
- **Template agents kept or deleted.** Deleted `domain`, `ui`, `testing` (redundant with rules system). Kept `planner` + `docs` as context-isolation escape hatches with descriptions that actively discourage default invocation.

**Lessons learned:**
- The `/init-project` skill itself had `disable-model-invocation: true`, which meant Claude couldn't fire it via the Skill tool even when the user typed `/init-project`. Workaround for this session: ran the steps manually. Long-term fix: remove that flag from the skill so it's reachable via slash command in any workspace.
- When initializing a project, the docs should distinguish "confirmed divergences" from "open questions" up front — documenting an undecided thing as decided locks the question shut.
- Rules without explicit `paths:` frontmatter aren't reliably auto-loaded. Always add a wildcard if you want always-on.
- Reviewer skills' workflow rules need to be writable at the time they fire. `/ship` writing history.md *before* the commit means the SHA-in-history requirement was uncompliable until relaxed.
- See `feedback.md` FB-0001 through FB-0006 for additional synthesized rules from this session.

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
