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

### Flow plugin v1.2.0 — template directory + bootstrap docs at by-dev-tools/flow (breadcrumb)
**Date:** 2026-05-25
**Branch:** (flow repo) `pr3/template-directory`
**Commit / PR:** `3abc236` → [flow#8](https://github.com/by-dev-tools/flow/pull/8)

Flow plugin v1.2.0 shipped at `by-dev-tools/flow@3abc236` ([flow#8](https://github.com/by-dev-tools/flow/pull/8)). Ships the consumer-side scaffolding (`template/base/*` Tier-1+2 + `template/stacks/{web,swift,tauri-rust-ts}/*` + `docs/bootstrap.md` + `docs/migration.md`) so a new project can adopt the workflow with ~10 minutes of setup instead of duplicating the entire `.claude/` tree. Absorbs 2 PR-2 FOLLOW-UPs as security regression fixtures under `plugins/flow/tests/` (cwd-constraint test + malicious-config test). Adds the 14th schema slot `rustWorkspaceDir` for monorepo Cargo workspace location. Phase-7 engineer-lens dogfood caught a vacuous assertion in the cwd-constraint fixture (asserting on the path string instead of on what a real leak would output — `127.0.0.1` from `/etc/hosts`); the fix produced flow's FB-0004 and md-manager's FB-0032. With PR 3 merged the bootstrap exception is fully lifted; md-manager PR 4 (install non-breaking, Stage 1 of consumer migration) is unblocked. See flow's `dev-docs/history.md` for full decision detail.

---

### Flow plugin v1.1.0 — workflow surface backfill at by-dev-tools/flow (breadcrumb)
**Date:** 2026-05-24
**Branch:** (flow repo) `pr2/workflow-backfill`
**Commit / PR:** `3409103` → [flow#7](https://github.com/by-dev-tools/flow/pull/7)

Flow plugin v1.1.0 shipped at `by-dev-tools/flow@3409103` ([flow#7](https://github.com/by-dev-tools/flow/pull/7)). Backfills PR 1's `[PR 1 LIMITATION]` placeholders and lands the full workflow surface: `/flow:staff-review` with 4 parallel lens agents (staff-engineer, ux-designer, design-engineer, push-further), `/flow:security-review`, `/flow:accessibility-review`, `/flow:ship-spike`, `/flow:workflow-help`, planner + docs agents, 4 portable rules (general, plan-discipline, documentation, exploration), `tools/memory/check.mjs`, `flow.config.schema.json` (13 slots), default hooks. Bootstrap exception fully lifted for downstream PRs. See flow's `dev-docs/history.md` for full decision detail, tradeoffs, and lessons (including the PR-2 dogfood findings that produced flow's FB-0002 and FB-0003 — schema-without-implementation and validator-pass-vs-runtime-safe).

---

### Flow plugin v1.0.0 — restructure + initial workflow surface at by-dev-tools/flow (breadcrumb)
**Date:** 2026-05-24
**Branch:** (flow repo) `pr1/restructure-flow-plugin`
**Commit / PR:** `f8610a1` → [flow#5](https://github.com/by-dev-tools/flow/pull/5)

Flow plugin v1.0.0 shipped at `by-dev-tools/flow@f8610a1` ([flow#5](https://github.com/by-dev-tools/flow/pull/5)). Restructured the renamed-from-llm-auditor repo into Anthropic's marketplace pattern (`plugins/flow/*`), renamed internal identifiers `llm-auditor`/`assumption-auditor` → `flow`, added `/flow:ship` skill + `plugins/flow/docs/workflow.md` (the canonical loop ported from md-manager and de-projected). Existing audit/critique skills (`critique-plan`, `audit-plan`, `audit-completion`) and agents (`auditor`, `plan-critic`) moved under the same plugin. Restructured flow's own dev-tracking docs from `core-docs/` to `dev-docs/` so the consumer-vs-plugin distinction is unambiguous. See that repo's `dev-docs/history.md` for full decision detail.

---

### Vite 5.4 → 8.0.13 dep bump (PR #12)
**Date:** 2026-05-17
**Branch:** `dependabot/npm_and_yarn/multi-46822222ac`
**Commit / PR:** `6b5239d..edf3496` (3 commits) → [PR #12](https://github.com/by-dev-tools/md-manager/pull/12)

**What was done:**
- Bumped `vite` from `^5.4.11` to `^8.0.13` (3-major-version jump) and `@vitejs/plugin-react` from `^4.3.4` to `^6.0.2` for Vite 8 compatibility. `esbuild` removed as a direct dep — it's transitively pulled at a fixed version by Vite 8.
- Updated stack-doc references: `CLAUDE.md` "Tech stack" and `core-docs/spec.md` "Tech stack" both said "Vite 5". Two-line change.
- Verified locally on the PR branch: `npm install` clean (0 vulns), `npm run typecheck` clean, `npm run build` clean (32 modules, 182 kB bundle, 317 ms), `npm run test` 21/21 pass, `npm run dev` boots in 100 ms with no deprecation warnings, key modules (`main.tsx`, `App.tsx`, `globals.css`) transform 200.
- Authored by Dependabot (`6b5239d`). Human follow-ups on the same branch: plugin-react bump (`123d6c7`, byamron) and doc-drift fix (`edf3496`, ship pipeline).

**Why:**
- Dependabot security PR. Closes two open advisories on the repo:
  - `GHSA-4w7w-66w2-5vf9` — Vite 5.x path traversal in optimized-deps `.map` handling.
  - `GHSA-67mh-4wv8-2f99` — esbuild dev-server lets any website read responses.
- Routine dep hygiene: keeping the build toolchain current avoids a cliff-jump later.

**Design decisions:**
- **Doc-drift fix bundled in the PR, not deferred.** "Vite 5" appeared in two narrative docs; both were updated in the same PR (commit `edf3496`) so the merge moment leaves no stale stack reference. Cheaper than a follow-up PR; reviewer reads everything in one place.

**Technical decisions:**
- **Accepted Dependabot's bundled `esbuild` removal.** The advisory is for the `esbuild` dev-server endpoint and the previously direct-pinned version. Vite 8 bundles a non-vulnerable `esbuild` transitively, so the direct dep is redundant — removing it shrinks the surface area for future Dependabot churn.
- **`@vitejs/plugin-react` ^6.0.2 required.** Plugin-react 4 is not Vite-8 compatible; the fixup commit (`123d6c7`) was already in place before /ship.
- **No `vite.config.ts` changes.** Config uses only `defineConfig`, `react()`, `resolve.alias`, `server.port`, and a `test` block — none of these surfaces changed across the 5 → 8 majors. If a future Vite minor breaks one of these, that's its own PR.

**Tradeoffs discussed:**
- **Merge as-is vs. wait for a full /staff-review pass.** Skipped /simplify and /staff-review because the PR-specific diff (vs merge base `a384560`) is `package.json` + `package-lock.json` + 2 doc lines — there is no app code for either skill to engage with. `/ship` ran security + a11y reviews; both no-op for a toolchain bump (a11y) or closed-CVE bump (security).
- **Auto-merge via merge queue vs. hand off.** Followed the workflow's "never merge" rule — handed back to user. Merge queue will run `typecheck` / `build` / `test` once they approve.

**Lessons learned:**
- **Dependabot major-version PRs warrant a local smoke test even when CI is green.** CI proves the bundle builds; it doesn't prove the dev server boots, HMR works, or aliases resolve. The 100 ms `vite dev` boot + 200 responses on key modules is what gave confidence to ship.
- **PR-specific diff ≠ `git diff origin/main..HEAD` when the PR was branched off an older main.** Always use `git merge-base origin/main HEAD` for the reviewer-relevant diff so review skills (and humans) reason about PR scope, not branch divergence.

---

### Workflow: add push-further lens to /staff-review + roadmap.md § Exploration
**Date:** 2026-05-15
**Branch:** push-further-lens
**Commit / PR:** `45443ad..[this ship commit]` (4 commits) → [PR pending push]

**What was done:**
- Added a fourth lens ("push-further") to `/staff-review`'s parallel-agent run. The first three lenses (engineer / UX designer / design engineer) ask "is this good?"; the fourth asks "could this go further?" — grounded in `core-docs/design-language.md` and Josh Puckett's "uncommon care" (executing limited scope to an extraordinarily high bar). Three output buckets: **inline-cheap** (apply this PR; treated like a NIT), **roadmap-concrete** (deferred but scoped, named cost), **future-exploration** (open-ended direction, routes to `roadmap.md § Exploration`).
- Added `core-docs/roadmap.md § Exploration` between "Later" and "Someday / maybe." Format spec includes the entry shape, the area-grouped organization, and the three-form `Surfaces when:` trigger spec (exact file paths, path patterns, conceptual areas — combinable, with guidance on when to use each).
- Added `.claude/rules/exploration.md` — auto-loads on `src/**/*.{ts,tsx,css}`. Reminds the agent to grep `roadmap.md § Exploration` for items whose `Surfaces when:` trigger names the file(s) touched.
- Updated `core-docs/workflow.md` step 7 to describe the four lenses, the bucket mapping (NIT ↔ inline-cheap, FOLLOW-UP ↔ roadmap-concrete, plus future-exploration), and the tightened skip-discipline rule.
- Updated `CLAUDE.md` loop diagram, skills cheat sheet, and rules table to reference the four lenses + the new `exploration.md` rule.
- Updated FB-0009 (the founding three-lens entry) to reflect four lenses with push-further named.
- Seeded `roadmap.md § Exploration` with two entries: (1) **Color rail / per-tint edge color** — `--page-tint-edge` hardcoded warm-orange in `src/store.tsx`, doesn't follow user-selected hues; (2) **Color rail / strip → Settings + onboarding** — user's parking-lot direction to relocate the always-on color rail to a Settings surface.

**Why:**
Across three consecutive PRs (PR B, PR #17, PR #18), the assistant skipped one or more `/staff-review` lenses with rationalizations like "live-tested by the user" or "engineer lens already covered by /simplify." The user called this out directly: "agentic UX designer review should not be replaced by human review." AI review and human opinion catch different things; the three lenses cover distinct framings; skipping erodes the loop's value over time. Adding a fourth lens (push-further) addresses a separate gap simultaneously — the existing three ask adherence questions; there was no canonical home for "where could this surface go further." The Exploration section + `Surfaces when:` triggers gives those observations a durable home that re-surfaces them contextually.

**Design decisions:**
- **Lens lives inside `/staff-review`, not as a separate skill.** Runs every PR by default; shares /staff-review's parallel-agent infrastructure; one extra agent call's cost is bounded.
- **"Empty is valid and often correct" guard.** False-positive "we could add X" findings pollute the roadmap and train the next session to mistrust the lens. The guard is repeated three times in SKILL.md (blockquote callout, "max 2 per bucket" budget, tiebreaker rules favoring restraint) and reinforced in workflow.md. Self-test on this very PR worked: push-further self-review returned empty, honored.
- **Exploration section lives in `roadmap.md`, not a separate doc.** Co-locating exploration items keeps them adjacent to other forward-looking work. The longer-roadmap.md cost is mitigated by the `Surfaces when:` triggers + the `.claude/rules/exploration.md` auto-load.
- **`Surfaces when:` triggers can mix file paths, path patterns, and conceptual areas.** Conceptual triggers handle items that name surfaces that don't exist yet (Settings page, onboarding flow).
- **Heavyweight standalone `/uncommon-care` skill is a separate PR (PR b).** Per FB-0030 (this PR's other new entry), the standalone version will be adapted to md-manager's context, not vendored from Designer.

**Technical decisions:**
- **`.claude/rules/exploration.md` glob is `src/**/*.{ts,tsx,css}`** (split into three array entries to match other rules' format). Broad enough to catch substantive code work; narrow enough to skip `.claude/`, `packages/ui/`, and `core-docs/`.
- **Role title standardization across docs.** Picked "engineer / UX designer / design engineer / push-further" as the canonical short reference everywhere a short ref is used.
- **FB-0009 updated in-place rather than queued for /ship.** FB-0009 became factually wrong the moment this PR's diff hit — leaving it stale would mean shipping a known-wrong doc.

**Tradeoffs discussed:**
- **Run the full four-lens /staff-review on this very PR vs. skip per the skill's doc-only escape.** Ran it as a self-test of the new skip-discipline rule (FB-0029) being written *in* this PR. 2 of 4 lenses returned non-empty findings; 2 returned empty. Validated the model.
- **Empty self-review on push-further lens vs. force a finding.** Honored the empty signal. The lens passed its own design test by refusing to fabricate.
- **Update FB-0009 in-tree vs. capture in this PR's history.md only.** Updated in-tree to prevent shipping a doc that contradicts SKILL.md edits in the same PR.

**Lessons learned:**
- **Doc-only PRs benefit from the full /staff-review when the doc changes workflow.** The skill's "doc-only" skip is calibrated for prose tweaks; workflow-rule changes have real surface for the lenses.
- **The push-further lens passed its own design test by returning empty.** First real exercise of the empty-is-valid guard.
- **Forward-references to future FB IDs are stale references.** I originally hardcoded "FB-0027" in workflow.md and plan.md for this PR's eventual FB — but the merge-queue numbering race made even that wrong (PR #16 took FB-0025/26, PR #18 took FB-0027/28, this PR ended up at FB-0029/30). /simplify caught the initial hardcoded FB-0027; the queue-race surfaced the deeper lesson. Rule: when writing about a not-yet-numbered FB, point at the ledger generically ("see feedback.md") and let `/ship` synthesis pick the actual number.

---

### Workflow unification: canonical loop + spike mode + confidence gates + agent self-feedback
**Date:** 2026-05-15
**Branch:** unify-workflows
**Commit / PR:** [this commit / PR pending push]

**What was done:**
- Rewrote `core-docs/workflow.md` as the **canonical workflow doc** intended to drop into both md-manager and Designer. 11-step loop: Clarify → Plan → Execute → Preflight → Commit → /simplify → /staff-review → Present → Iterate → /ship → STOP. Project-specific gates (preflight commands, design tokens) marked clearly.
- Added **spike mode** (`mode: spike` in plan): a cheap escape hatch for exploratory PRs that answer a question rather than ship a feature. Skips /simplify + /staff-review; replaces /ship with a new lightweight `.claude/skills/ship-spike/SKILL.md` that writes the history entry as the deliverable and opens a `spike`-labeled PR. Abuse-prevention is documented (title prefix + label + research-question requirement) but the actual catch is the user at PR review time.
- Added **tiny mode** (`mode: tiny`): 1–3 line user-requested fix; skips spec-walk + confidence verdict + /simplify + /staff-review + /ship synthesis. Documented as rare; bias toward the full loop.
- Added **confidence gates** to the Plan step. Every load-bearing assumption gets HIGH/MEDIUM/LOW. Trigger: "would I plan a different feature if this assumption flipped?" LOW = automatic human gate (the assumption must be resolved by an explicit user answer before the plan can proceed). MEDIUM = proceeds but is surfaced at Present. The 5-PR revisit is baked in to revisit the trigger heuristics after real-world use.
- Added **spec-walk-as-checkboxes** to required plan fields (designer's pattern): every numbered/bulleted requirement → a checkbox bound to a test or verification step.
- Added **Preflight as its own step** between Execute and /simplify. Mechanical gates (typecheck/build/test + project invariants) must be green before /simplify runs. The bundled `tools/preflight/check.mjs` is referenced as "if present" since md-manager's preflight script is pending PR 2.
- Added **three-layer continuous-improvement model**: user feedback (`feedback.md`) → agent self-feedback (failure-pattern memory at `~/.claude/projects/.../memory/feedback_*.md`) → preflight check. Each layer has its own bar and home; patterns promote across layers as they harden.
- Added **five guardrails on agent memory** to prevent compounding agent slop (the prompt-level analog to model collapse from synthetic-data training):
  1. **Source-diversity bar** — entry needs evidence from 2-of-3 sources (recurrence in time, two reviewers, or one review + user correction). Single-source findings don't qualify.
  2. **Mechanical-check beats memory** — write a preflight rule when possible, not a memory entry.
  3. **User feedback wins ties** — `feedback.md` rules trump memory entries on contradiction.
  4. **Hard cap (~30 entries)** — enforced by `tools/memory/check.mjs`; over-cap blocks new writes until curation.
  5. **Periodic audit (every 5 ship runs)** — fresh-context Explore agent reads only the memory entries and flags stale / contradictory / over-fit ones; counter implemented in `tools/memory/check.mjs --audit-due`.
- Added **memory → preflight promotion is user-gated** (not automatic). When a memory entry's fire log reaches 2 entries, /ship files a `roadmap.md` follow-up; the user approves the permanent rule.
- Updated `CLAUDE.md` cheat-sheet to match the canonical workflow numbering. Added hard rules: spec-walk + confidence verdict required in plans; agent self-feedback captured at /ship.
- Updated `.claude/rules/plan-discipline.md` with required plan fields (mode, spec-walk, confidence verdict per assumption) and the LOW=human-gate behavior.
- Updated `.claude/skills/ship/SKILL.md` step 3 — split into 3a (user feedback synthesis to feedback.md) and 3b (agent self-feedback to memory). 3b enforces all five guardrails as sub-steps i–vi.
- New `tools/memory/check.mjs` — corpus health check + audit-due counter. Resolves the canonical harness memory directory by scoring candidate project dirs (downranks Conductor-workspace paths, prefers dev-style paths) so memory entries written from any workspace land where the harness will auto-load them. Path-validates `MEMORY_DIR` env var and `.memory-dir` file content (defense-in-depth) — must resolve under `~/.claude/projects/`.

**Why:**
A prior comparison session evaluating md-manager's outer workflow envelope (PR-opens-last, /ship-owns-docs, /simplify-before-staff-review) against Designer's inner rigor (preflight, spec-walk, failure-pattern memory) identified the **merge of both** as the next-highest-leverage workflow improvement. For autonomous coding specifically: fewer human checkpoints means the agent has to catch its own recurring patterns; without self-feedback memory the agent re-makes the same mistake every session and there's no compounding. With the five guardrails, compounding favors quality rather than degradation.

**Design decisions:**
- **Single canonical doc, manually copied to both repos** (no sync script). Drift risk is real but the cost of a sync mechanism isn't earned yet — defer until PR 3 (designer port) actually hits friction. (FB-0021 pattern: automation before structure.)
- **Spike mode as a single boolean opt-out, not a tier system.** Two states (default heavy, explicit spike) maps to a real distinction; three tiers ("spike / quick-fix / feature") creates a path of least resistance that quietly degrades the codebase.
- **LOW confidence is a hard gate, not advisory.** The whole point is to prevent silent assumption-flipping mid-execution; a soft gate would be ignored. The user must explicitly answer the question (which then upgrades the assumption to HIGH or MEDIUM).
- **Confidence trigger ("would I plan a different feature if this flipped?") is fuzzy by design.** Pre-committed 5-PR revisit baked into the doc rather than over-engineering the rule now.
- **Memory → preflight promotion is user-gated, not automatic.** Preflight rules are permanent and a bad one catches false positives forever. The user owns the one-way door.
- **Agent self-feedback at /ship, not staff-review.** Synthesis happens once at the end, after all reviews. Avoids fragmentary memory entries written mid-pipeline.

**Technical decisions:**
- **Memory directory resolution heuristic** — Conductor workspaces produce a different cwd than the canonical project path, so `~/.claude/projects/` slugs differ. Script scores candidates: prefers `-dev-` / `-Desktop-coding-` paths, downranks `-conductor-workspaces-` paths, falls back to cwd-derived only as last resort. Override via `MEMORY_DIR` env var or gitignored `.memory-dir` file.
- **Path validation on memory dir** — defense-in-depth even though writes go only to a hardcoded auditMarker (not to memoryDir). Reviewer's specific exploit (`/etc/passwd.last-audit`) was wrong but the underlying concern was valid.
- **`tools/memory/.last-audit` lives in-repo (gitignored)** rather than in memoryDir. Counter is per-checkout, not per-corpus.
- **/critique-plan softened to advisory.** It's an external plugin (assumption-auditor); we can't enforce its behavior. The workflow's actual enforcement is the human gate.

**Tradeoffs discussed:**
- **One canonical doc copied vs sync script** — copied wins for now; cost of drift < cost of sync infra at this stage.
- **Bundled PR vs split** — kept as one PR (workflow.md + CLAUDE.md + plan-discipline + /ship + /ship-spike + memory tooling) because they're tightly coupled. Splitting would create awkward partial-state intermediate PRs.
- **Spike-mode strict opt-in vs sensible default** — strict opt-in keeps default expensive, prevents quality drift via shortcut paths.
- **Hard cap of 30** — arbitrary number; tunable. Picked low to force curation pressure early.
- **Audit interval 5 ship runs** — also arbitrary. Counts ship invocations not PRs (multiple ships on one PR during iteration each count). Documented this distinction.
- **Reviewer-flagged "BLOCKER" was a NIT after spot-check** — the security reviewer claimed `/etc/passwd.last-audit` write surface, but auditMarker is hardcoded to the script's own dir. Real risk was directory-listing information disclosure on misconfig. Applied the path-validation fix as defense-in-depth (cheap + correct) but flagged in the response that the reviewer's specific exploit was wrong. Carries the standing rule: "Reviewers can be confidently wrong; spot-check before fixing."

**Lessons learned:**
- **The user's audit-before-ship instinct is valuable.** Asking for a self-audit pass before /ship caught 4 BLOCKERs (numbering inconsistency, memory-path mismatch, missing preflight script, off-by-one) and 6 NITs that would have shipped otherwise. Captured as FB-0025 — workflow-infra changes warrant explicit self-audit before /ship.
- **Anticipate feedback-loop failure modes proactively.** When proposing the agent self-feedback primitive, I missed the model-collapse / process-ossification risk; the user surfaced it. Captured as FB-0026 — for any new compounding mechanism, surface the failure mode before the user has to ask.
- **`spike` and `tiny` modes are likely under-used initially.** Bias toward full loop is appropriate; we'll learn over time which work genuinely benefits from the cheap path.
- **Conductor workspaces break naive path-derivation.** Anything that needs to reach into harness-canonical paths (memory, settings, hook outputs) needs an override mechanism. Worth remembering for any future tool that bridges workspace and harness state.

---

### Color rail: portfolio-derived presets at 25% intensity
**Date:** 2026-05-15
**Branch:** color-rail-presets
**Commit / PR:** `9295d93..[this ship commit]` (2 commits) → [PR pending push]

**What was done:**
- Replaced the 7 ad-hoc color-rail presets (Peach / Sun / Mint / Sky / Lavender / Blush / Sand) with 5 hues sourced from the portfolio repo's theme accents (`~/dev/portfolio`), each evaluated at the portfolio's intensity slider `t=0.25` in light mode using the portfolio's own `computeBg` formula: `satMult = 1 + 1.8 * t`, `lightShift = -10 * t` (light), so `t=0.25 → satMult 1.45, lightShift -2.5`.
- New presets (top → bottom): **Sand** `hsl(30, 25%, 88.5%)`, **Bone** `hsl(39, 22%, 89.5%)`, **Blush** `hsl(10, 44%, 93.5%)`, **Sage** `hsl(86, 26%, 90.5%)`, **Mist** `hsl(200, 33%, 92.5%)`. Labels are descriptive English color names so the portfolio's internal theme names (table / portrait / pizza / vineyard / sky) don't leak into this codebase; a comment in `ColorRail.tsx` keeps the portfolio reference visible for future maintainers.
- Default `--page-tint` shifted from `hsl(30, 60%, 88%)` to `hsl(30, 25%, 88.5%)` (Sand — top of rail and the portfolio's default accent equivalent). Updated in both `src/styles/globals.css` and `src/store.tsx` so the new-user default and the CSS fallback match.
- Roadmap: dark-mode "Later" entry expanded to name the portfolio's dark-mode bases as the concrete starting point for a future dark-mode rollout (the formula already covers it; we just need to wire up `data-theme` switching and per-tint text-color regeneration).

**Why:**
- The user wanted the app to feel like part of their personal-brand family — same color sensibility as the portfolio site. Borrowing the portfolio's accent hues at a fixed low intensity gives the cohesion without coupling: this app doesn't import portfolio code, doesn't track its updates, and remains free to evolve its own register independently. The portfolio's `computeBg` formula is a one-time evaluation, not a runtime dependency.
- Going from 7 ad-hoc presets to 5 brand-derived ones also tightens the rail visually — 7 swatches felt like a sampler, 5 feels like a curated palette.

**Design decisions:**
- **5 presets, not 7.** The portfolio has exactly 5 themes; padding to 7 with un-themed hues would defeat the brand-cohesion intent. The rail's continuous HSL gradient is still available for any hue not in the preset set.
- **Light-mode bases only.** Portfolio's `BG_BASE` has both light and dark; we sampled light because the app is light-only today. Dark-mode bases captured in roadmap as the starting point for a future dark-mode pass.
- **`t = 0.25` (not 0.2 or 0.33).** User specified 25% explicitly. Portfolio's own default intensity is `0.2` (line 74 of `ThemeContext.tsx`), but per the user's call we use 0.25. Subtle difference; documented in code comment so future updates know which slider position the values correspond to.
- **Reorder (Sand → Bone → Blush → Sage → Mist) is not pure hue-sort.** A strict hue sort would put Blush (10°) before Sand (30°), but the user wanted Sand first because it's the default. Bone (39°) follows because it's the closest hue family to Sand; Blush sits between the warm neutrals and the cool-spectrum tail. The order reads warm → green → cool, with the two warm neutrals leading.
- **Descriptive English labels, not portfolio names.** User explicitly asked the portfolio's internal theme names not appear in this codebase. Labels picked to describe what users see (Sand for warm neutral, Bone for paler warm neutral, Blush for pink-tinted, Sage for olive-green, Mist for soft blue). Sky was avoided as a label even though Mist's hue matches portfolio's "Sky" — to keep all labels distinct from portfolio names and avoid the "Sky" overload.

**Technical decisions:**
- **Inline HSL strings in `PRESETS`, not a runtime evaluation of the portfolio's formula.** The values are constants; computing them at render time would just add a dependency on a formula that lives in a different repo. The code comment preserves the trail back to the source formula for any future re-derivation.
- **Default page tint duplicated in `globals.css` + `store.tsx` + first `PRESETS` entry.** Acknowledged as DRY-fail; not factored into a shared constant in this PR because doing so meant either creating a new module just for one value or exporting from `ColorRail.tsx` (component file, awkward import surface for `store.tsx`). PR C Step 3 (tokens migration) rewrites this region anyway — better landing spot for the deduplication.
- **`--page-tint-edge` left alone.** Pre-existing latent issue: the store hardcodes a warm-orange `hsla(30, 30%, 50%, 0.10)` edge color that doesn't follow the user's hue choice. Out of scope for this PR; logged for a future hue-aware-edge pass.

**Tradeoffs discussed:**
- **Sample 25% on the slider vs use the portfolio's own default (`0.2`).** Picked 25% per user direction. The portfolio defaults to 20% (a hair more muted); 25% gives slightly more chromatic presence. User chose for the app feel; not strictly tied to portfolio parity.
- **Run staff-review or skip.** Skipped. The change had been live-tested visually before commit; the engineer lens was covered by the inline /simplify pass (which caught the store.tsx drift); the UX-designer lens had no surface beyond the live test; the design-engineer lens was thin because the values came from a deterministic formula, not from designer judgment. Honest call: full three-lens parallel-agent run would have been overhead with no expected signal.
- **Open a parallel PR vs queue behind the rename PR (#17).** Parallel. Diffs don't overlap on lines, merge queue handles serialization. CLAUDE.md principle #6 ("small, ship-shaped changes") argues for shipping the visible product win now rather than batching for a single later PR.

**Lessons learned:**
- **Defaults can drift across surfaces.** `globals.css`, `store.tsx`, and `ColorRail.tsx` all held a "default page tint" value, and changing one without the others left the store overriding the CSS at runtime with the old peach. /simplify's quality lens caught it; a `grep -r "hsl(30, 60%, 88%)"` would have caught it earlier. **Project rule worth keeping in mind:** when changing a default that lives in multiple surfaces (theme tokens, store initial state, component constants), grep the old literal across the whole repo before declaring the change done.
- **Borrowing values from another repo via formula evaluation is a clean coupling pattern.** Reading `~/dev/portfolio/src/contexts/ThemeContext.tsx`, evaluating its formula at a fixed input, and pasting the results inline as constants gives brand cohesion without dependency. Portfolio can update its formula tomorrow and this app doesn't break. Worth remembering for any future "match the sibling project" need. → FB-0028.

---

### PR C Step 3a — `--gray-a*` rename to `--tint-overlay-*`
**Date:** 2026-05-15
**Branch:** pr-c-gray-a-rename
**Commit / PR:** `0b2d016..[this ship commit]` (4 commits) → [PR pending push]

**What was done:**
- Renamed `--gray-a5/6/7` (md-manager's three black-alpha page-tint overlays) to `--tint-overlay-{light,medium,strong}` in `src/styles/globals.css`. 3 declarations + 14 `var()` usages.
- Updated the two doc references in `core-docs/design-language.md` (Color system table + Loading states pattern) and the one in `.claude/rules/ui.md` (code-block wash-background guideline).
- Added a two-line comment in `globals.css` pointing at `core-docs/token-migration.md` for the rationale (clash with Mini's Radix-imported `--gray-a*` scale).
- Routed one /staff-review follow-up to `roadmap.md` Cleanup: design-language.md should grow a § "Component guidelines → Subtle feedback" entry that codifies the *pattern* (hover washes, hairline dividers, code-block backgrounds all consume `--tint-overlay-*`) — currently the tokens are listed in the Color table but the pattern isn't named.
- Values unchanged. Bundle output is byte-equivalent for every selector using these tokens; only the declaration names differ.
- `npm run typecheck && npm run build` clean throughout.

**Why:**
- PR C Step 1 (token name-collision audit, `core-docs/token-migration.md`) surfaced that `--gray-a*` is a real value collision: Mini's `packages/ui/styles/tokens.css` `@import`s `@radix-ui/colors/gray-alpha.css`, which declares `--gray-a1..12` on `:root`. Same names, different values, different semantic intent (ours is 3 specific page-tint wash opacities; Mini's is the full 12-step Radix alpha primitive). Cascade resolves to ours because `globals.css` loads last, but the name-clash means the Radix scale is effectively shadowed and unusable downstream.
- Renaming preserves both: our 3 overlays under a name that says what they are, Mini's full Radix scale available for future use without re-rename. The split into a dedicated Step 3a PR (separate from Step 3 tokens migration) follows FB-0023 — naming changes and value migrations are different reviewer-questions and deserve separate diffs.

**Design decisions:**
- **Name pattern `--tint-overlay-{light,medium,strong}`** picked over alternatives `--page-overlay-*` (congests the `--page-*` namespace already crowded by `--page-tint`, `--page-text*`), `--wash-*` (cuter but less self-explanatory), `--overlay-*` (too generic; Mini may want a true overlay-layer token for modal scrims). "Tint-overlay" names what the tokens do (alpha-black wash applied over the page tint); the light/medium/strong axis names the opacity progression.
- **Kept all three opacities** even though `--tint-overlay-medium` is currently unused (was already dead before this rename — pre-existing condition). Removing it would expand scope beyond "mechanical rename." Defer cleanup to PR C Step 3 (consolidation), which will examine every token's actual call sites as part of moving them into Mini's `tokens.css`.
- **No component-manifest updates needed.** The `tokens_referenced` arrays in `core-docs/component-manifest.json` don't currently list `gray-a*` (verified by grep). When PR C Step 3 / Step 4+ migrate components and re-derive the manifest, the new names will land naturally.

**Technical decisions:**
- **Two-line comment, not three.** The /simplify quality lens flagged the original 3-line comment as heavier than this file's other inline comments and pointed at the wrong rule (FB-0024 is the audit-method that found the collision, not the rename rationale). Compressed to one descriptive line + one pointer line to `token-migration.md`.
- **Skipped staff-review's UX-designer lens** explicitly. Pure CSS rename with no rendered-surface change has no UX-designer questions to evaluate; the staff-review skill authorizes this. Engineer + design-engineer lenses ran and returned clean.

**Tradeoffs discussed:**
- **Bundle the rename into Step 3 (tokens migration) vs. ship as its own PR.** Split — Step 3 already conflates four concerns (delete identical-value duplicates, rebind 4 radius values, move 29 md-manager-only tokens into Mini's tokens.css as a project-additions section, verify bundle equivalence). Adding a rename across 14 call sites would make every line of Step 3's diff carry two questions for reviewers. Per FB-0023.
- **Remove dead `--tint-overlay-medium` in this PR vs. defer.** Deferred. It was dead before the rename; removing it now would silently expand scope from "rename" to "rename + dead-code cleanup." Step 3's consolidation pass will catch it cleanly.
- **Comment FB pointer accuracy.** Original draft cited FB-0024 (audits read end-to-end). The actual rationale chain is: FB-0024 → caught the collision miss; the value-different + same-name collision → reason for the rename. Direct rule attribution is fragile here; pointing at `token-migration.md` (which captures the full chain) is more durable.

**Lessons learned:**
- **Rename audits should sweep `.claude/rules/*.md` too**, not just `src/` and `core-docs/`. The grep found one rule (`ui.md`) that referenced the old token by name in a guideline about code-block backgrounds. Adding rules/skills to the grep-target list is a small refinement of FB-0024's "read end-to-end" principle — captured implicitly there rather than as a separate FB.
- **One-agent /simplify on small mechanical diffs** turned out fine — the three-lens pattern is for substantive code changes. A 60-line rename PR got the same signal from one consolidated agent at less cost. Not codifying as a rule; just noting the calibration.
- **The merge queue setup is paying off.** PR #15 (audit) was the first substantive PR through the queue; this Step 3a is the first **code** PR through. The serial-merge dance the queue eliminates was exactly the friction this kind of multi-PR PR-C work would have created in the old setup.

---

### PR C Step 1 — Token name-collision audit (unblocks Step 3 tokens migration)
**Date:** 2026-05-15
**Branch:** pr-c-token-audit
**Commit / PR:** `a7c6a07..[this ship commit]` (3 commits) → [PR pending push]

**What was done:**
- Built `dist/assets/*.css` to capture the merged stylesheet that actually ships.
- Extracted every `--<name>: <value>;` declaration from `src/styles/globals.css` (42 tokens) and `packages/ui/styles/tokens.css` (~150 declared + ~120 imported from Radix Colors via 14 `@import` directives).
- Computed the name-intersection: **14 collision tokens** — `--radius-badge/button/card/modal`, `--space-3/4/5/6`, `--weight-regular/medium/semibold`, plus the audit's late catch `--gray-a5/6/7` (Mini imports `@radix-ui/colors/gray-alpha.css`, which declares `--gray-a*` on `:root`).
- Verified cascade winner in the built CSS: for every collision token, the bundle contains both declarations in source order — Mini's first, ours second — so our value wins via cascade as expected.
- Categorized:
  - **Identical values (7):** `--space-*`, `--weight-*`. Same numeric value, different units (rem vs px).
  - **Different values, ours intentional (7):** all `--radius-*` (ours 1-4px tighter than Mini's defaults, matching axiom #9 "soft with one pillowy signature"); all `--gray-a*` (ours 5-11% black alpha vs Mini's Radix 12-19%; same name, different intent — ours is page-tint wash, Mini's is the full Radix alpha primitive).
  - **Accidental / Mini-wins / surprising:** none.
- Output: `core-docs/token-migration.md` — the migration plan that PR C Step 3 will execute. Contains the collision table, categorized decisions with rationale, and work lists for two follow-up PRs (Step 3a rename + Step 3 migration).
- Plan.md: added the audit step under "Active Work Items," handoff notes updated.
- No app code changed. `npm run typecheck && npm run build` clean.

**Why:**
- The token name-collision audit was the highest-priority PR A staff-review follow-up captured in `roadmap.md`. PR C Step 3 (the actual tokens migration that consolidates `--space-*`, `--radius-*`, etc. into a single source of truth in `packages/ui/styles/tokens.css`) couldn't responsibly start without knowing which collisions are identical-value (safe delete), which are semantically different (need explicit re-binding), and which are surprises (warrant pausing the migration).
- A secondary goal: exercise the new merge queue and CI gates from PR #10 with a small, focused, docs-only PR before doing anything that touches app code. The audit doubles as a queue dry-run.

**Design decisions:**
- **`--gray-a*` rename split into its own PR ("Step 3a"), not bundled into Step 3.** A semantic rename across globals.css usage is a different reviewer-question than mechanical duplicate-removal + radius rebinding. Bundled, each line of the migration diff carries two questions; split, each PR has one. Captured as FB-0023.
- **Radius rebinding via fork-and-own of Mini's `tokens.css`, not by keeping `globals.css` declarations.** Mini's `tokens.css` is the contract surface for downstream Mini skills (`generate-ui`, `enforce-tokens`); the fork-and-own pattern is supported (per `packages/ui/MINI-VERSION.md`). Keeping our values in `globals.css` would mean two places to read for "what radius does this project use" — worse for future readers.
- **Unit shift accepted (px → rem) for identical-value collisions.** Mini uses rem, we use px. Numerically equivalent at the default 16px font-size; rem additionally scales with user font-size preference (accessibility win). Accepting Mini's rem for the deleted duplicates is a no-op visually + a real a11y upgrade. Documented as a Step 3 sub-decision.
- **`--gray-a*` semantic split surfaced as a third real collision class.** Initially framed as a "near-naming-clash"; the /simplify reviewer caught that Mini's Radix-imported `--gray-a*` is a full value collision (different values under identical names). The rename preserves both intents — Mini's `--gray-a*` becomes available as the Radix alpha-gray primitive (12-step), our specific page-tint overlay opacities live under a name that says what they are. → FB-0024 (audits read end-to-end, not just grep).

**Technical decisions:**
- **Audit doc lives at `core-docs/token-migration.md`, scoped to PR C.** Once PR C Step 3 ships, the durable parts fold into `design-language.md` (change-log entry, updated Color / Spacing / Corner-radius tables); the audit doc itself can be archived. Scoping to PR C avoids growing `design-language.md` with transient migration content.
- **rem-to-px conversions assume default 16px font-size.** Documented in the audit doc. If the project ever changes the root font-size, the conversions in the doc would need re-validation.
- **`dist/assets/*.css` is the ground truth for cascade resolution**, not source-file load order alone. The audit verifies in the bundle, not just in `src/main.tsx`. This is the right discipline because Vite's bundling order could theoretically differ from import order (it doesn't, but the discipline is the safety net).

**Tradeoffs discussed:**
- **Single tokens file (`tokens.css`) vs. continued split (`tokens.css` + `globals.css` `:root`).** Picked single tokens file. Pro: one grep finds every token. Con: Mini's tokens.css grows from ~150 to ~180 declarations. The clarity payoff outweighs the file-size growth. Documented in the audit doc as a Step 3 decision so the migration PR doesn't re-litigate.
- **Keep px in `globals.css` vs. accept rem from `tokens.css`** for identical-value collisions. rem wins (a11y benefit, Mini contract alignment, no visual change). Documented as part of the Step 3 plan.
- **Bundle Step 3a (rename) into Step 3 vs. split.** Split. The /simplify efficiency review was correct that bundling makes both PRs harder to review. Cost: two PR cycles instead of one. Benefit: each diff has one question.

**Lessons learned:**
- **Pure-grep audits miss transitive imports** (FB-0024). The initial 11-collision count missed `--gray-a*` because `grep` against `tokens.css` doesn't surface declarations from `@import "@radix-ui/colors/gray-alpha.css"`. For audits that claim completeness, open files end-to-end + verify against built artifacts.
- **Naming changes are their own concern** (FB-0023). Bundling a rename pass into a migration PR conflates two reviewer questions. The principle generalizes to any refactor mixing mechanical rename with semantic change.
- **The audit doubled as a merge-queue dry-run.** A docs-only PR with no app behavior change is a safe first exercise of CI gating + the queue, separate from substantive code changes. Useful pattern when introducing new infrastructure.

---

### Workflow: insert `/critique-plan` between plan-draft and user approval
**Date:** 2026-05-14
**Branch:** pasted-text-import
**Commit / PR:** `5f128c4..[this ship commit]` → [PR pending push]

**What was done:**
- Added `.claude/rules/plan-discipline.md` — a new rule file that loads when editing `core-docs/plan.md` and reminds the planner to read `spec.md`, `feedback.md`, `design-language.md`, and any user-pointed-to doc before drafting. The rule explains both consumers (the planner itself, and `/critique-plan` if installed) and treats silent contradictions with source-of-truth docs as a wasted-iteration anti-pattern that should be surfaced during Clarify.
- Updated `core-docs/workflow.md` step 3:
  - Loop diagram line: "Claude writes a plan; runs /critique-plan; user approves or redirects".
  - § 3 body: spelled out the critic's three severity tiers (BLOCKER fixed in-plan, REDIRECT surfaced to user, FOLLOW-UP captured to `plan.md` / `roadmap.md`), the plugin-absence fallback, and the explicit statement that the critic informs the human gate without replacing it.
  - Skills cheat sheet: added a row for `/critique-plan`.

**Why:**
Until now, step 3's only quality gate was human approval. There was no automated check that a drafted plan actually aligned with the user's request, respected `feedback.md` / `spec.md` rules, or stayed internally coherent. The plan-critic (shipped in the `assumption-auditor` plugin, repo `llm-auditor`, branch `guangzhou-v3`) closes that gap by auditing plans for scope drift, spec violation, and internal incoherence — using a deterministic preprocessor that loads every `core-docs/*.md` (except `history.md` / `plan.md` / `roadmap.md`) so the critic's context doesn't depend on what Claude happened to `Read` earlier in the session.

**Design decisions:**
- **Additive, not replacement.** The critic's output is input to the user's approval decision, not a substitute for it. Step 3 still ends at "user approves."
- **Plugin-absence is silent and safe.** If `/critique-plan` isn't installed, the workflow falls back to the prior behavior (human gate only) without erroring. This keeps the workflow doc honest for collaborators who haven't installed the plugin.
- **Plan-discipline rule narrows scope to `core-docs/plan.md`.** The rule fires when editing that path, which is where plans get drafted. The alternative (always-on, like `general.md`) would have surfaced the rule to every UI / code edit too — noise without benefit.
- **No `feedback.md` entry for this change.** This is workflow infrastructure, not a synthesized user preference. Capturing it as feedback would have miscategorized it.

**Technical decisions:**
- **Verbatim adoption of the task spec's rule body and § 3 body.** The task came with exact prose for both surfaces; rewriting it would have introduced drift between this repo and any sibling adopter of the same plugin convention.
- **No plugin vendoring.** The plugin lives in a separate repo and is installed via `/plugin install`. This change references the plugin's commands but does not bundle, mirror, or modify the plugin's files.
- **No `package.json` / build / script changes.** Doc-only diff.

**Tradeoffs discussed:**
- **Added review step vs. better-aligned plans.** Every plan now incurs an extra `/critique-plan` invocation before reaching the user. The cost is one extra agent call per request; the benefit is catching scope-drift / spec-violation / incoherence findings before they consume real human review bandwidth. Acceptable given plans tend to be short and the critic is fast.
- **Where the rule loads.** Option A: trigger on `core-docs/plan.md` path (chosen). Option B: always-on like `general.md`. Option A keeps the noise floor low at the cost of a slightly weaker enforcement guarantee (the rule won't fire if a plan is sketched outside `plan.md` first). The user was flagged on this choice during plan approval and accepted it.
- **Trust staging.** The plan-critic is new and unproven on real md-manager sessions. The workflow doc explicitly frames its findings as input to the human decision rather than authoritative — so a false positive doesn't block the loop, it just gets noted and proceeds.

**Lessons learned:**
- Verbatim adoption of an external spec is the right move when the spec is well-defined and the project is one of several adopters of a shared convention — drift between adopters is the worse failure mode than slightly-suboptimal local phrasing.
- Doc-only changes can skip `/staff-review` and `/security-review` + `/accessibility-review` legitimately. The skill files themselves document this skip condition; following it saves real cycle time without losing signal.

---

### CI gates + Dependabot config (unblocks merge queue + parallel-worktree flow)
**Date:** 2026-05-14
**Branch:** ci-setup
**Commit / PR:** `cacf331..[this ship commit]` (3 commits) → [PR pending push]

**What was done:**
- Added `.github/workflows/ci.yml` — three parallel jobs (`typecheck`, `build`, `test`) running on `pull_request` and `merge_group` events. Each job uses `actions/setup-node@v4` with npm cache, runs `npm ci`, then the relevant script. Concurrency group scoped by `github.event_name + github.ref` so PR-mode and merge-queue runs of the same ref don't cross-cancel. Workflow-level `permissions: { contents: read }` declared explicitly as defense-in-depth.
- Added `.github/dependabot.yml` — npm ecosystem, monthly schedule, `open-pull-requests-limit: 0` to suppress routine version-update PRs. Security updates flow independently via repo Settings → Code security and analysis. Inline comment documents both decisions plus the escape hatch (commented-out grouping rules) for enabling version updates later.

**Why:**
- The parallel-worktree workflow this project leans on (multiple feature branches open at once, each touching shared core-docs via /ship) was producing serialized merge dances: merge PR A → rebase PR B → wait for checks → merge → repeat. The fix is GitHub merge queue, which auto-rebases queued PRs and merges in order — but the queue needs required status checks to gate on. PR existed to provide those checks.
- A secondary benefit: until now there was no automated build/test gate at all. Local `/ship` runs verified, but a stale checkout that hadn't pulled recently could ship type errors. Three required checks close that gap.

**Design decisions:**
- **Three parallel jobs vs one job with three steps vs matrix.** Picked parallel. Wall-clock is `max(typecheck, build, test) ≈ 45s` instead of `sum ≈ 90s`. Branch protection naming is also cleaner — required checks read `typecheck` / `build` / `test` instead of `ci (typecheck)` matrix-style. Three jobs of intentional duplication is below the DRY-extraction threshold; revisit at 5+ jobs or when adding OS/Node matrices.
- **Keep `typecheck` even though `build` subsumes it.** `npm run build` is `tsc -b && vite build`, which does the typecheck work already. Keeping a dedicated `typecheck` job costs ~10s of duplicate tsc and provides a sharper failure signal (typecheck red while build green = pure type error; both red = harder to triage but rare). At free-tier CI minutes, the duplication is free.
- **`permissions: { contents: read }`** at workflow level rather than per-job. No job needs write today; declaring read explicitly means a future step that needs write must opt in deliberately. Defensive — caught by the security review as worth adding now even though current behavior is identical to the implicit default.
- **Dependabot security-only, not version-update-on-schedule.** With 18 deps, routine bumps are noise — a PR every other week to bump a minor on a single Radix package would dominate the review queue. Security updates (CVE-driven, sparse) get all the value with none of the noise. Comment block names the escape hatch for when this calculus changes (more deps, more developers).
- **Action pinning at `@v4` tags, not commit SHAs.** Solo public repo, no secrets in workflow scope — fine. Documented the migration trigger (any of: secret reference, write step, becoming a meaningful supply-chain target) in `roadmap.md`.

**Technical decisions:**
- **Node `'20'` (string, current LTS)** vs `lts/*` (drifts silently) vs `20.x` (equivalent). Pinned string. Bump deliberately.
- **`npm ci`** over `npm install` — lockfile present, deterministic install, faster on cache hit, errors on lockfile drift.
- **Cache strategy** — `actions/setup-node` built-in npm cache keyed on `package-lock.json` hash. Caches `~/.npm` (global tarball cache), which `npm ci` consumes. Explicitly caching `node_modules` is fragile (Node-version-sensitive) and not recommended.
- **`concurrency: cancel-in-progress: true`** — supersede in-flight runs when new commits land on the same PR. Safe for merge queue because queue runs use distinct `gh-readonly-queue/*` refs that won't share a concurrency group with PR runs.

**Tradeoffs discussed:**
- **`pull_request_target` vs `pull_request`.** Picked `pull_request` (runs against PR head, no secrets exposed). `pull_request_target` runs against base + has secrets — the dangerous trigger that's been exploited in multiple supply-chain incidents. No reason to use it here.
- **One workflow file vs separate per-check.** Single file with three jobs. Easier to read, single concurrency declaration, easier to maintain at this scale.
- **Workflow scope: CI only, no merge-queue settings change in-tree.** Merge-queue is a repo-settings toggle (branch protection), not a yaml file. Couldn't be done in-PR even if we wanted. Decision: ship the CI gate first; user enables the queue + required-checks via Settings after merge.

**Lessons learned:**
- **Try the automated/operational fix before restructuring the docs.** The parallel-worktree pain has two candidate fixes — merge queue (operational, reversible) and per-entry-file docs (structural, irreversible). Did the operational one first to observe whether residual pain justifies the structural one. → FB-0021.
- **Workflow phase boundaries should be commits.** This PR followed the pattern (`cacf331` = Execute, `98ab10d` = /simplify NIT, ship commit = security-review fix + doc synth). Worth formalizing as an explicit workflow.md rule. → FB-0020.
- **Security review on a CI yaml diff is not the same review as on a code diff.** The standard categories (XSS, URL handling, persistence) don't apply; CI-specific categories (trigger safety, permission scope, action pinning, workflow injection) do. The security-review skill ran on the diff and the reviewer correctly pivoted to those CI-specific lenses without prompting — worth noting as a strength of the cold-read posture.

---

### Mini design language amended (PR B — axioms made explicit, both surface postures stay open)
**Date:** 2026-05-14
**Branch:** mini-elicit
**Commit / PR:** `97ff141..[this ship commit]` (3 commits) → [PR pending push]

**What was done:**
- Added an explicit **Axioms** section to `core-docs/design-language.md` answering all 10 of Mini's axioms (base line-height, density register, accent identity, gray flavor, motion personality, type system, type scale ratio, surface hierarchy depth, radius personality, focus style). Each axiom is named, its value committed, and its rationale tied to a downstream section.
- Reframed surface-posture (floating vs flat) as an **open axiom** with explicit resolution criteria — both modes continue to ship in the DevPanel for dogfooding. The Family § "Open questions" → "Surface posture" row was reconciled to point at the new framing instead of describing it as "undecided".
- Added Patterns + Change log sections at the end of `design-language.md`.
- Seeded `core-docs/component-manifest.json` with 9 inventoried components (all `status: legacy`, archetype targets noted for PR C).
- Seeded `core-docs/pattern-log.md` (with two real entries on accent identity and the open surface-posture axiom) and `core-docs/generation-log.md` (empty-but-valid scaffold). These give Mini's `generate-ui` and amendment-mode skills somewhere to write.
- Appended a marker-delimited Mini section to `CLAUDE.md`. Adjusted the template's "Core contracts" row to point at `packages/ui/` since `docs/core-reference/` doesn't exist in this project. Noted the legacy-grandfathering rule and the mechanical-vs-narrative doc-update distinction so the Mini per-generation log updates don't collide with the "`/ship` owns narrative docs" rule.
- Picked up an incidental `package-lock.json` name sync (`mumbai` → `md-manager`) — was stale in `main` against the already-renamed `package.json`. Aligned with the roadmap cleanup entry.

**Why:**
- PR B is the unblocker for PR C (token + component migration). Mini's downstream skills (`generate-ui`, `enforce-tokens`, `propagate-language-update`) read `design-language.md` looking for axiom-shaped content + a component manifest + the log files. Without those in place, PR C couldn't run those skills end-to-end — and the alternative (PR C migrating components against an unspecified contract) would re-invent decisions per component.
- The Mini "surface hierarchy depth" axiom forced a decision; the floating-vs-flat posture question got pulled along with it in the plan even though it's a separate question. PR B disentangles them: depth is settled at 3 tiers, posture is an explicit open axiom with resolution criteria. The user's call (dogfood both, justify both, decide later) is preserved as a first-class artifact.

**Design decisions:**
- **Manual amendment, not skill-driven.** Pure `/elicit-design-language` amendment mode requires a populated `generation-log.md` (the skill explicitly bails with "no signals to amend" otherwise). Archaeology mode would discard the existing 1700-line hand-written `design-language.md` as a starting point, contradicting FB-0016. We did the amendment by hand, using the skill's templates as the target shape. → New rule (FB-0018).
- **Surface posture stays open by design.** The user wants both floating and flat in the DevPanel until extended dogfooding produces a signal. We codified resolution criteria — dogfooding signal, an archetype constraint, or an explicit user call — so this isn't a deferred decision but a present-tense one with structured exit. → New rule (FB-0019), reinforces FB-0005.
- **Accent identity = user-controlled page tint** (axiom #3) is a real divergence from Mini's standard contract. Most Mini projects ship a fixed accent scale (`accent-9`); ours reserves `indigo` only for focus-ring rebinding at the root and lets `--page-tint` carry the role of "the warm color you see." Tradeoff: tooling that assumes a fixed accent will need explicit per-tint contrast validation at PR C (already captured in roadmap.md under "From PR A staff review").
- **All components marked `legacy`** in the manifest. None compose Mini primitives yet; PR C migrates them. Marking them all `legacy` is the only honest answer; archetype targets are noted with `?` flags as best-guesses.

**Technical decisions:**
- **Edit `design-language.md` in place, don't archive.** The plan considered archiving the legacy doc and running archaeology-mode fresh, then stitching. The simpler path — keep the doc, layer axioms on top — preserved git-blame continuity and avoided a temporary `.legacy.md` artifact in the tree.
- **JSON manifest uses bare token names** (`"sand-12"`) without the `--` prefix. design-language.md uses `--sand-12`. Consistent within each file, not a contradiction; the manifest's tokens are looked up by name without CSS-specific syntax.
- **CLAUDE.md template adjusted, not rewritten.** Only one row of the template's "Information map" needed correction (the `docs/core-reference/` path doesn't exist here). Everything else was contradiction-free.
- **`/simplify` ran on the docs.** Three lenses (reuse, quality, efficiency) found 3 MUST FIX issues (cross-ref typo + 2 stale Family-table rows) and 1 NIT (tighten "Open axiom" subsection). All applied in commit `87869d7`. `/staff-review`, `/security-review`, `/accessibility-review` all skipped per their docs-only rules.

**Tradeoffs discussed:**
- **Archive-and-archaeology vs. manual amendment.** Archaeology would have given a more complete mechanical scan (every token clustered, every color literal cataloged), but at the cost of treating the existing narrative as a replaceable proposal. Manual amendment kept the narrative intact at the cost of skipping the full mechanical scan. The user's call (FB-0016: legacy doc is ground truth) decided it.
- **Force the surface-posture decision vs. preserve it as open.** Forcing now would have unblocked Mini archetype work that needs a single posture (e.g., a Mini Modal archetype that assumes the surface chrome). Preserving it costs us per-component "which posture does this match?" judgments in PR C. The user's call: preserve. We codified resolution criteria so the openness has structure, not drift.
- **One PR vs. split into smaller commits.** PR B is intentionally docs-only — pulling in even minor app code (e.g., DevPanel labels referencing the new axiom framing) would have broken the strict scope boundary and forced staff-review on the same diff /simplify had already covered.

**Lessons learned:**
- **A skill that can't run as designed doesn't mean the work doesn't happen.** Pure-skill amendment failed (no log to read). The right move was to do the amendment by hand with the templates as the target shape. The wrong move would have been forcing archaeology mode and discarding our doc, or skipping the work because the skill bailed. → FB-0018.
- **Open axioms with explicit resolution criteria are first-class artifacts, not deferred decisions.** The Mini axiom contract pulls toward closing every question; sometimes the right answer is "not yet, here's how we'll know." → FB-0019.
- **The `/simplify` three-lens pass works on docs.** The reuse-lens caught the cross-doc contradiction (Family table vs new Axioms section); the quality-lens caught the broken cross-reference; the efficiency-lens flagged the scope creep (package-lock.json — which I kept, with reasoning). Worth running on every meaningful doc PR even though the lenses are calibrated for code.

---

### Mini design system installed (PR A — no app migration) — SAFETY
**Date:** 2026-05-14
**Branch:** mini-install
**Commit / PR:** `0d17846..[this ship commit]` (3 commits) → [PR pending push]

**What was done:**
- Installed the Mini design system into `packages/ui/` at pinned SHA `83df0b288523e51ba5ec54f4b126cc7591d1d1db` (Designer's current pin — sister-app lockstep). Ran Mini's `tools/sync/install.sh`, which landed: 8 primitives + 12 archetypes under `packages/ui/src/`, 4 stylesheets under `packages/ui/styles/` (tokens + archetypes are fork-and-own; axioms + primitives are track-closely), `packages/ui/{MINI-VERSION,DEFAULTS}.md`, 6 Mini skills under `.claude/skills/`, `tools/invariants/check.mjs`, `templates/`, and a thin `scripts/sync-mini.sh` wrapper.
- Installed 12 Radix peer dependencies (`@radix-ui/colors` + 11 `@radix-ui/react-*`) — the JS bundle is unchanged because nothing imports them yet (tree-shaken to zero in PR A).
- Wired the four Mini stylesheets at the top of `src/main.tsx` (tokens → axioms → primitives → archetypes → globals), with a load-order comment marking the sequence as load-bearing.
- Set `<html class="light-theme" data-accent="indigo">` in `index.html`; preserved `<body class="mode-floating">` (dev-panel surface-posture toggle, unaffected).
- Added Vite alias and tsconfig paths: `@mini/*` → `packages/ui/src/*` and `@mini-styles/*` → `packages/ui/styles/*`.
- Renamed `package.json` `"name"` from `"mumbai"` to `"md-manager"`.
- Removed `disable-model-invocation: true` from `.claude/skills/staff-review/SKILL.md` so the model loop can call the skill — FB-0017.
- **No file under `src/components/`, `src/store.tsx`, `src/lib/markdown.ts` was touched.** The visible UI is byte-identical to `main`. Three-lens staff review confirmed; security + a11y final-pass reviews confirmed.

**Why:**
- Mini is the Now/Next P0 workstream in `roadmap.md`. Adopting it unblocks the deferred CSS architecture work (1340-line `globals.css`, scattered z-index, raw `rgba()` overlays) and forces explicit decisions on the surface-posture and gray-flavor open questions. Doing the install as its own PR — no token migration, no component migration — keeps the change reviewable and decouples "does the system fit" from "does the new aesthetic fit".

**Design decisions:**
- **Three-PR split: install → elicit → migrate.** Bundling all three would have produced an unreviewable diff (5800+ lines of upstream Mini + 1300-line `globals.css` rewrite + every component refactor). Split keeps PR A reviewable as pure infrastructure, PR B reviewable as a design-language doc evolution, PR C reviewable per-component.
- **Preserve `design-language.md` as starting point** (FB-0016). The existing 1700-line doc encodes family framing, page-tint rail, surface-posture open question, polished-features doctrine, and FB-0010..FB-0015 rules. PR B will run `/elicit-design-language` in archaeology mode against the codebase, then *manually stitch* its output with the legacy content (archive as `.legacy.md`, merge narrative, delete legacy once verified). Mini's output is a proposal, never a replacement.
- **Family lockstep on Mini SHA.** Pinned to Designer's current sync (`83df0b2`, April 2026) rather than Mini HEAD. Tradeoff: family parity over latest-fixes. Next sync follows Designer's cadence.
- **Pixel parity as the UX goal.** PR A must look and behave identically to `main`. Verified visually in browser by the user. Two Mini-axiom selectors needed neutralization to keep parity: `img/video/svg { display: block }` (would break inline SVG icon alignment) and the universal `:focus-visible { outline: 2px solid var(--accent-8) }` (would replace browser-default focus rings with an indigo ring everywhere). Neutralized via a clearly-marked block at the end of `globals.css`; PR C removes the block as components migrate.

**Technical decisions:**
- **SAFETY — sync-mini.sh wraps Mini's destructive `rsync --delete`.** Mini's upstream `install.sh` and `update.sh` both `rsync --delete .claude/skills/`, which clobbered the project's 5 skills (`link`, `ship`, `staff-review`, `accessibility-review`, `security-review`) on first install. They were restored from HEAD immediately. The thin `exec`-wrapper that Mini's installer generates was replaced with a snapshot-and-restore version: `PROJECT_SKILLS=(...)` array, `mktemp -d`, copy before, `exec update.sh`, copy back, `trap cleanup EXIT`. Every future `./scripts/sync-mini.sh` now preserves project skills automatically. SAFETY because losing skills is invisible until a user types `/staff-review` and gets "Unknown skill".
- **`outline: revert` (not `unset` or `initial`) in the neutralization block.** `revert` returns to the user-agent default, which is what we want; `unset` would clear the property entirely (browser-default focus ring on `:focus-visible` becomes invisible on some elements); `initial` returns to the CSS spec default (`outline: none`), worse than `revert`. Verified by staff design engineer review.
- **Split alias scheme `@mini/*` vs `@mini-styles/*`.** Designer uses a single `@mini` aliased to `packages/ui/styles` so `@mini/tokens.css` works directly. We separated TS imports (`@mini/Box`) from CSS imports (`@mini-styles/tokens.css`) for explicit contracts. Diverges from Designer; PR B or C will reconcile if the divergence creates friction.
- **CSS bundle grew 0.12 KB, JS bundle unchanged.** Mini's 4 stylesheets contribute ~63.56 KB total (was 63.44 KB pre-PR), almost entirely the Radix color CSS imports inlined by Vite's CSS resolver. JS unchanged confirms zero React-side imports — Mini's primitives/archetypes sit on disk waiting for PR C.
- **`vitest` + jsdom still works.** The 21 existing tests are markdown-round-trip + sanitization; jsdom parses Mini's CSS imports without complaint. No new tests added in PR A — there's nothing functional to test.

**Tradeoffs discussed:**
- **Install layout — canonical `packages/ui/` vs `src/mini/`.** Canonical matches Designer (sister-app parity) and matches Mini's default invocation; `src/mini/` would have been closer to the existing flat-`src/` shape. Canonical won on family-lockstep grounds.
- **Stylesheet load order — Mini first or globals first.** Mini first lets our `globals.css` cascade-override Mini's resets, which is the only way to achieve PR-A pixel parity without editing Mini's track-closely files. Reverse order would have required prefixing every overriding rule in `globals.css` with `:where()` or similar — fragile and undocumented.
- **Token name collisions deferred.** Both systems define `--space-3..6`, `--radius-*`, `--weight-*`, and accent-N numbers. Our values currently win the cascade because `globals.css` loads last. PR C audits and resolves; `roadmap.md` captures the audit as a PR C prerequisite.
- **`disable-model-invocation` audit.** Removed from `staff-review` mid-session (FB-0017). Did NOT remove from `link` (genuinely user-initiated — starts a dev server with side effects) or `ship` (the user must explicitly opt into a push + PR). The line: review skills and orchestration composers should be model-callable; side-effecting actions can stay user-only.
- **Reviewer findings spot-checked, not blindly applied.** Staff design engineer flagged a "BLOCKER" claiming Vite couldn't resolve `@radix-ui/colors` from `packages/ui/styles/tokens.css` without an explicit alias. Empirically wrong — `npm run build` already passed (48 modules, 63.56 KB CSS). Vite's CSS resolver walks up to the project's `node_modules/`. Skipped the fix; flagged in the review report.

**Lessons learned:**
- **Upstream installers can be destructive in non-obvious ways.** Mini's `install.sh` is documented as "track-closely" overwrites — but the implementation uses `rsync --delete` on `.claude/skills/`, which deletes anything in the destination not in the source. A reasonable reading of "track-closely overwrites primitive source code and skills" does not anticipate "and also nukes your project's pre-existing project-owned skills." Always read the install script before running it on a brownfield project. Future SAFETY-tagged adoptions get the same scrutiny.
- **Pre-emptive neutralization beats post-hoc forensics.** Reading Mini's `axioms.css` line-by-line *before* the visual audit caught two real pixel-parity issues (svg display, focus-visible) that would have been hard to attribute later. Cheap up-front read, expensive late-detection retrofit.
- **A reviewer's confidence is not a proof.** Both staff design engineer and staff UX designer raised what they labeled "BLOCKER" — one was empirically wrong (Vite alias), one was logically a NIT (form-element font inheritance already explicit). Triage every finding against the actual code; never apply a reviewer fix without spot-check, even when three reviewers run in parallel.

### Safety bundle, editor performance, and polished-features doctrine — SAFETY
**Date:** 2026-05-13
**Branch:** address-agentation-comments (PR #2)
**Commit / PR:** `657dbe3..[this ship commit]` (5 commits) → https://github.com/byamron/md-manager/pull/2

**What was done:**
- Closed the original 6 agentation feedback comments on the prototype (dimmed JSON files, redundant sidebar +, drafts/files structure, swatch contrast, attach-vs-toggle clarity, dev opacity slider) plus a redesign of the editor header, the sidebar (files-then-hairline-then-drafts, italic muted drafts, GitHub-octicon repo icon, persistent + button, count indicator), and a new dev panel (opacity, radius, gutter, shadow, sidebar font, editor font, file-icons toggle, sans/mono toggle, tree-layout select, surface-mode select).
- **Slice A — safety bundle.** Drafts get a `wasEverEdited` flag; only drafts the user never typed into are eligible for the navigate-away auto-cleanup. `createDraft` routes through the same pristine-drop helper as `selectDoc` so chained `+` clicks don't leave empty drafts. Added `safeUrl()` allowlist (`http`/`https`/`mailto`/relative/fragment; everything else collapses to `#`) for markdown link rendering; rejects URLs with whitespace before the scheme separator (`java\tscript:` is now `#`). Rendered `<a>` tags carry `rel="noopener noreferrer"` and `target="_blank"`. `window.confirm` (Delete) and `window.prompt` (link URL) replaced — Delete now fires a Toast with **Undo**; link entry is an inline bubble at the toolbar with the editor selection stashed in a `Range` and restored at submit. ⌘/Ctrl-click on a rendered link opens it via `window.open(safe, '_blank', 'noopener,noreferrer')`. New `<ToastProvider>` primitive with `aria-live` priority and `prefers-reduced-motion` support.
- **Slice B — editor performance + a11y + tests.** Debounced preview-mode persist (150ms) using a snapshot pattern — pending work captures `docId`/`isDraft`/`viewMode` at typing time, not flush time, so a deferred flush can't misattribute content to the wrong doc when the user switches docs mid-debounce. `useLayoutEffect` flushes pending edits before swapping content on doc/view changes; `onBlur` flushes for snappy "Saved" feedback; `commitFromToolbar` flushes synchronously. contenteditable gets `role="textbox"`, `aria-multiline="true"`, static `aria-label`. Empty-editor state when no doc is selected (warm copy in `--sand-11` with ⌘N hint). ⌘E toggles Preview/Markdown (guarded against firing inside `<input>`/`<textarea>`). `vitest` + `jsdom` added with 20 tests covering `safeUrl` allowlist (including the whitespace bypass), `mdToHtml` link sanitization, and full `htmlToMd ↔ mdToHtml` round-trips. New scripts: `npm test`, `npm run test:watch`.
- **Polished-features doctrine.** Mid-work the user defined the project's quality posture: *"Ship polished, narrow features. Expand scope over time, not quality."* Integrated as a top-level § "Quality posture" in CLAUDE.md plus § "False affordances are a bug" in `design-language.md` under Component guidelines. The doctrine drove the decision to wire the link button properly (with click-to-navigate + safe URL handling) rather than ship a button that produces invisible output.
- **Three-lens staff review + final-pass security/accessibility review.** Caught and fixed: ⌘E firing inside other inputs; `pendingRef` cleared before write; `flushPendingPersistRef` assigned during render; pristine-drop racing the debounced flush; `restoreDraft` not restoring selection; silent rejection of unsafe URLs in the link bubble (false-affordance violation); focus not restored after link cancel; ⌘E and ⌘-click undiscoverable; 5s toast too short for Undo; dynamic-and-chatty contenteditable `aria-label`; empty-state action missing `:focus-visible`; Toast `aria-live` not escalating for destructive; `<kbd>` hardcoded `11px` (now `--type-micro`); whitespace bypass in `safeUrl`; missing `target="_blank"` on rendered links; `.saved` indicator missing `aria-live`; empty-state hint contrast.

**Why:**
- The prototype had real safety holes: silent draft auto-delete (data-loss potential), markdown link rendering that didn't sanitize URLs (`javascript:alert(1)` would have executed), and native `window.confirm`/`window.prompt` dialogs that clashed with the warm-sand surface and offered no recovery path. The agentation feedback also surfaced sidebar/editor clarity issues worth addressing in the same pass. Doing them as one PR kept the doctrine of "false affordances are a bug" applied uniformly: each fix shipped polished or didn't ship.

**Design decisions:**
- **Undo toast instead of confirmation modal.** Native confirm is jarring and slow; a themed modal adds friction; an undo toast is more forgiving (matches Gmail/Notion) and pairs naturally with the new toast primitive Slice C would need anyway. Tradeoff: users with motor impairments need more time to click Undo — addressed by defaulting action-toasts to 8s (passive toasts to 4s).
- **Italic + muted color for drafts.** Distinguishes drafts (loose, not committed) from repo files (committed) at every level. Collides with markdown's `<em>` rendering — flagged in roadmap for a Slice C revisit.
- **Files-then-hairline-then-drafts inside a repo.** Drafts attached to a repo aren't *in* the repo until they're committed. The hairline reinforces the conceptual boundary.
- **Chevron-on-left was tried and reverted.** First iteration moved chevrons to the leading slot (Conductor pattern); the user reverted to icon-only-with-state-via-open-folder-icon, accepting that expansion state is conveyed by children-visible + folder-open-icon. Documented in roadmap as a design-language entry to write up.
- **Auto-cleanup of pristine drafts.** A draft that was created but never typed into is removed silently on navigation. Touched drafts (anything with content) are preserved. The `wasEverEdited` flag protects the user's work; the silent removal keeps the sidebar clean. Roadmap flagged a follow-up to consider a "Untitled draft dismissed" toast if user testing shows surprise.
- **Polished-features doctrine = canonical project philosophy.** Integrated into CLAUDE.md, not relegated to feedback.md, because every future scoping decision needs to apply it. Decisions about whether to ship a partial feature now run through the wire-vs-defer cost test from FB-0038.

**Technical decisions:**
- **Snapshot debounce pattern.** The naive "debounce 150ms then read editor DOM and call updateDraftBody(currentDoc.id, ...)" is correct most of the time and catastrophically wrong when the user switches docs within the debounce window. The snapshot pattern captures `docId`/`isDraft`/`viewMode` at typing time, so a deferred flush always writes to the right target. Combined with a pre-swap flush in `useLayoutEffect`, switching docs flushes the previous doc's pending edits before the new doc's content overwrites the DOM.
- **Eager `wasEverEdited` flip on first keystroke.** Originally set inside the debounced flush. Surfaced by staff-review as a race: a fast switch-doc within 150ms could trip the pristine-drop helper and delete the draft. Now set immediately on first non-empty input.
- **`htmlToMd` parses in a detached `<div>`.** Setting `innerHTML` on a detached node does NOT fire event handlers (`<img onerror>`, `<svg onload>`) and does NOT execute `<script>` tags. A `SAFETY` comment in the function notes this assumption so a future refactor doesn't break it.
- **`safeUrl` rejects pre-colon whitespace.** Surfaced by the final-pass security review. Browsers strip whitespace inside the scheme portion of an href; `java\tscript:` would resolve as `javascript:`. The check rejects any whitespace before the first colon, catching tab/newline/space bypasses.
- **Toast lives in a single `<div role="status" aria-live={dynamic}>`.** Switching `aria-live` per host is the pragmatic compromise — per-toast live regions risk fragmentation. The host flips to `assertive` when any current toast carries `priority: 'assertive'` (Delete uses this).
- **execCommand remains the workhorse.** All formatting + insertHTML ops route through `document.execCommand` so the browser's native undo stack catches them. Deprecated long-term — roadmap has an editor-engine RFC (Slice E) to evaluate Tiptap / Lexical / ProseMirror.

**Tradeoffs discussed:**
- **Debounce window.** 150ms was picked over 100/300. Longer feels stale; shorter doesn't save much CPU on htmlToMd. Tunable later.
- **Toast surface tier diverges from card-on-tint.** Toasts are inverted dark (`--sand-12` bg, `--sand-1` text) instead of the warm-card-on-tint pattern used elsewhere. Justified because toasts are transient status messages that must break through the user's chosen tint to be legible. Documented in roadmap as a design-language entry to write up.
- **`window.open(_blank)` + caret-placement on plain click.** Plain click in a contenteditable places the caret (the browser default). ⌘/Ctrl-click follows the link. `target="_blank"` was added so screen readers announce the new-tab behavior. The "⌘-click to open" `title` is the discoverability cue for sighted users.
- **CSS architecture deferred.** `globals.css` is now ~1340 lines. A refactor into per-feature files is real debt, but Mini adoption (likely soon per design-language) will force the change anyway. Pre-investing here is throwaway work.
- **Hardcoded px in globals.css.** `.claude/rules/ui.md` permits raw values inside `globals.css`; the rule's bite is for component files. Some hardcoded heights (toast 36, toast-action 26, link-input 240) stayed for that reason. Tokenizing them is a future polish pass.

**Lessons learned:**
- The doctrine of "wire-vs-defer, default to wire if cheap" (from Designer's FB-0038) is hugely operational. Applied to the link button it turned a 1-LoC roadmap entry into a ½-day implementation that ships the feature whole.
- Snapshot patterns matter the moment async work outlives its initiator. The debounce-without-snapshot version was correct for 99% of cases and silently corrupted state in the 1% where it mattered.
- Three-lens staff-review (engineer / UX / design engineer) running in parallel against a single diff caught failures that no single lens would have. The engineer caught the race + the lifecycle bugs; the UX designer caught the silent-rejection false affordance + the keyboard nav holes; the design engineer caught the missing type token. None of the three would have caught all of them.

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
