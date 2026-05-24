> **Superseded 2026-05-24 by the rename-host + bundling decisions.** This doc
> documents Decision 1 ("hybrid split, plugin at byamron/project-template") and
> Decision 7 ("UserPromptSubmit hook ON by default") among others. Two decisions
> have since been revised:
>
> 1. **Plugin host repo** is `by-dev-tools/flow` (renamed from `by-dev-tools/llm-auditor`
>    on 2026-05-23), NOT `byamron/project-template`. Reasoning: llm-auditor was the
>    natural ancestor of flow (already contained audit/critique skills + agents
>    tuned via DISAGREE.md). Renaming preserves git history. The `pre-flow-plugin`
>    tag on `byamron/project-template` and the closed PR 1 there remain as
>    artifacts of the original direction but aren't load-bearing for the new path.
>
> 2. **`/critique-plan`, `/audit-plan`, `/audit-completion` are BUNDLED into flow**,
>    not kept in a separate assumption-auditor plugin. Reasoning: they're used
>    together with the workflow skills 100% of the time; separation imposes
>    install friction without compositional value. Flow PR 1 (in the renamed
>    repo) restructures the existing auditor content from flat root into
>    `plugins/flow/*` and adds workflow surface alongside (ship + workflow.md +
>    dev-docs).
>
> The substantive content below (Anthropic doc verifications, Ramp posture, the
> 6-PR umbrella shape, the bootstrap doctrine, the feedback-capture layering,
> the `/simplify` re-plan event) all carries forward. The PR sequence's host
> repo changes from `byamron/project-template` to `by-dev-tools/flow` and the
> absorption happens implicitly in PR 1 (since llm-auditor's content is already
> there) rather than via a separate PR 2b.
>
> Cross-references:
> - `core-docs/plan.md` "Flow plugin extraction" Active Work Item — canonical
>   architecture as of 2026-05-24.
> - `core-docs/handoffs/visuals-design-2026-05-23.md` — visual artifacts +
>   HTML report design (v1.x+ post-extraction roadmap).
> - `core-docs/handoffs/design-pipeline-2026-05-23.md` — JTBD-grounded design
>   review pipeline (v1.x+).
> - `core-docs/handoffs/spec-and-intake-design-2026-05-23.md` — spec-writing
>   skill + intake mechanism for autonomous spec generation (v1.x+).

# Flow plugin extraction — full session consolidation

**Date:** 2026-05-23
**Source workspace:** md-manager pattaya-v1 (Conductor)
**Purpose:** Hand off complete state to another workspace so plugin work can continue without re-litigating decisions or losing context. This doc is self-contained — readable cold without the originating conversation.

---

## 1. Status snapshot

We are extracting md-manager's 11-step managed-autonomy workflow into an installable Claude Code plugin called **`flow`**, hosted at `byamron/project-template` (one-repo marketplace + plugin + template). The work spans 6 PRs across two repos.

**Where we paused:**
- **PR 1** (initial plugin skeleton + `/flow:ship` + workflow doc + README + `dev-docs/`) was in flight in a separate `byamron/project-template` Conductor workspace.
- That workspace's agent surfaced a mid-execution re-plan when they discovered `/simplify` is a Claude Code bundled native skill (not a thing the plugin should ship).
- I approved the re-plan (omit `flow:simplify` entirely; accept `/ship` port table with 3a/3b split) plus one enhancement (loud warning for unset `typecheckCmd`) plus an annotation rule (mark bundled skills explicitly in workflow.md).
- That workspace was told to continue executing. **Whether PR 1 is actually open right now is not confirmed in this workspace.** Next action for the consuming workspace: check `gh pr list --repo byamron/project-template`.

**Artifacts already in md-manager (this workspace):**
- `core-docs/project-template.md` — the original generalized blueprint that started this whole work stream.
- `core-docs/plan.md` — umbrella plan as "Active Work Items → Flow plugin extraction" (lines 35–186-ish).
- `core-docs/handoffs/pr1-flow-plugin-init.md` — the PR 1 brief that was pasted into the project-template workspace.
- `core-docs/handoffs/flow-plugin-consolidation-2026-05-23.md` — this file.

---

## 2. The big picture: what + why

### What

A Claude Code plugin that packages the **11-step managed-autonomy workflow** — the loop md-manager uses today, including:
- Plan-approval and merge as the two load-bearing human gates
- LOW-confidence automatic third gate
- Automated steps between (preflight, `/simplify`, four-lens `/staff-review`, `/security-review`, `/accessibility-review`, `/ship`, `/ship-spike`)
- Two-layer feedback capture (user feedback in `feedback.md`; agent self-feedback in cross-session memory, with 5 anti-slop guardrails)
- Promotion pipeline (memory → preflight when patterns recur)

### Why

Today md-manager and its sister project Designer each carry their own copy of all this workflow machinery. When the workflow improves, both repos have to be updated. As more repos adopt the pattern (and potentially Ramp-style internal teams or open-source consumers), duplication compounds.

A plugin lets us improve once and propagate everywhere. It also forces the workflow to be **project-agnostic**, which surfaces md-manager-specific assumptions we'd otherwise miss.

### Verified-against-Anthropic-docs claims

From `code.claude.com/docs/en/skills` and `code.claude.com/docs/en/plugin-marketplaces` (fetched during this session):

| Claim | Source |
|---|---|
| Skills can live at 4 scopes: enterprise > personal > project > plugin (plugins are namespaced as `plugin:skill`) | Skills doc |
| CLAUDE.md is always loaded; skills load on demand | Skills doc + best-practices doc |
| Skills support dynamic context injection via `` !`<command>` `` | Skills doc |
| Plugins can be installed at user OR project scope (`--project` flag) | Plugins doc |
| Marketplace = `.claude-plugin/marketplace.json` at repo root | Marketplaces doc |
| Plugins in same repo: relative path source starting with `./`; can be parameterized via `metadata.pluginRoot` | Marketplaces doc |
| Bundled native skills: `/simplify`, `/batch`, `/debug`, `/loop`, `/claude-api` | Skills doc — this is what triggered the PR 1 re-plan |
| `/plugin marketplace add owner/repo` is the install pattern | Marketplaces doc |
| Hooks (e.g., UserPromptSubmit) provide deterministic enforcement | Hooks doc |

### Verified-against-Ramp claims

Public Ramp posture (per their published examples and Geoff Charles content fetched during this session):
- Ramp's product-shaping skill is distributed as a **shared skill across the org**, not per-repo files.
- They keep CLAUDE.md slim; push procedure into skills.
- Treat *ways of working* as the unit of reuse.

This is the precedent for our plugin-extraction approach.

---

## 3. Architectural decisions (with full reasoning)

This is the load-bearing section. Every decision below was made deliberately during this session, with alternatives considered.

### Decision 1: Plugin vs in-repo workflow

**Decision:** Hybrid split. Project-agnostic process → plugin (user scope). Project-specific knowledge → repo.

**Reasoning:** Anthropic's explicit guidance is "CLAUDE.md loads every session; for workflows that are only relevant sometimes, use skills which Claude loads on demand." So skills are the natural home for process. Plugins are the distribution mechanism for skills.

**Classification table** (definitive — use this to decide where any future artifact goes):

| Artifact category | Home | Reason |
|---|---|---|
| Workflow loop documentation (workflow.md) | **plugin** | Process, not product |
| `/simplify`, `/staff-review`, `/ship`, `/ship-spike`, `/security-review`, `/accessibility-review` | **plugin** | Project-agnostic |
| `/critique-plan` advisory critic | **external plugin** (assumption-auditor — not part of `flow`) | Already external |
| `/link` (dev server) | **repo** | Project-specific (port, build tool) |
| Rules: `general.md`, `plan-discipline.md`, `documentation.md`, `exploration.md` | **plugin** | Pure workflow enforcement |
| Rules: `safety.md`, `ui.md`, `dev-server.md` | **repo** | `paths:` frontmatter references project files |
| Agents: `planner`, `docs` | **plugin** | Their prompts reference doc paths that are part of the plugin's convention |
| `tools/memory/check.mjs` | **plugin** | Generic memory-corpus cap + audit-due; identical across projects |
| `tools/preflight/check.mjs` | **repo** | Wired to project's typecheck/build/test commands |
| `tools/invariants/check.mjs` (if used) | **repo** | Domain invariants |
| Memory entries (`feedback_*.md`) | **already user-scoped** at `~/.claude/projects/.../memory/` | Outside the repo by design |
| `CLAUDE.md` (router/thesis) | **repo** (slim) | Per-project; always-loaded so kept tight |
| `core-docs/spec.md`, `plan.md`, `history.md`, `feedback.md`, `roadmap.md`, `design-language.md` | **repo** | Project knowledge — earned per project, can't share |

### Decision 2: One repo or two for the plugin distribution

**Decision:** One repo. `byamron/project-template` hosts marketplace + plugin + (future) template + (future) docs in subdirectories.

**Reasoning verified against Anthropic docs:**
- `.claude-plugin/marketplace.json` at repo root is the marketplace declaration
- `metadata.pluginRoot: "./plugins"` lets the marketplace list plugins by short name (e.g., `"source": "flow"` resolves to `./plugins/flow/`)
- "For plugins in the same repository, use a path starting with `./`" — directly endorsed in docs
- Pattern matches Anthropic's own `claude-plugins-official` repo
- Other content in the repo (a `template/` directory, README, docs) is **ignored by the plugin system** — only marketplace.json + listed plugin paths matter

**Alternative considered:** Two repos (template repo + plugin repo). Cleaner separation of concerns but doubles maintenance burden. Rejected for now; can be split later if needed.

### Decision 3: Plugin name

**Decision:** `flow`. Skills are namespaced `flow:simplify`, `flow:ship`, etc.

**Reasoning:** Short name (long names appear in every namespaced reference). Doesn't presuppose stack. Alternatives considered: `managed-autonomy`, `loop`, `engineering-loop`, `claude-flow`.

### Decision 4: Cross-repo planning tracking — Option C (hybrid)

**Decision:** During the extraction phase, planning splits between two repos:
- **Cross-repo umbrella** (the 6-PR plan with dependencies) lives in `md-manager/core-docs/plan.md`.
- **Per-PR plans + history + feedback** for plugin work live in `byamron/project-template/dev-docs/` (NOT in any `template/core-docs/` which is the scaffold for consumers, NOT in any `core-docs/` because the project-template repo doesn't have a "product" to plan for).
- `md-manager/history.md` gets one-line breadcrumbs per plugin ship: "Flow plugin v0.1.0 shipped at `byamron/project-template@<sha>` — see that repo's `dev-docs/history.md` for detail."
- **Retirement:** Once PR 6 ships and md-manager fully consumes the plugin, the umbrella retires (moves to `md-manager/history.md` as "Flow plugin extraction complete"). From that point forward, plugin work happens solely in `byamron/project-template/dev-docs/`.

**Alternatives considered:**
- **Option A** (all tracking in md-manager): rejected because it permanently couples md-manager to plugin development and confuses anyone reading `byamron/project-template` directly.
- **Option B** (all tracking in project-template): rejected because the cross-repo coordination doc has no natural home in either repo alone during the extraction phase.

**Option C is the bootstrap-and-decouple pattern** — couple during extraction (it's a single coherent multi-repo effort), decouple after (project-template stands alone as a library would).

### Decision 5: Migration scope — full migration, staged

**Decision:** Md-manager will eventually be a **pure consumer** of the plugin (no local duplicates of skills/rules/agents/portable tools). But migration happens staged across PRs 4–6 so nothing breaks:
- PR 4: install plugin alongside existing local skills (both work simultaneously)
- PR 5: dogfood the plugin on a real small PR; capture any plugin bugs
- PR 6: remove md-manager's local duplicates only after validation passes

**Alternatives considered:**
- **Config-only ("compatible")**: just add `workflow.config.json` and a CLAUDE.md note; keep all md-manager skills. Rejected because we wouldn't actually discover plugin bugs.
- **Full migration in one shot**: rejected — riskier, no validation phase, harder to roll back.

### Decision 6: Git history preservation

**Decision:** Preserve `byamron/project-template`'s history. Specifically:
- Tag the last pre-conversion commit as **`pre-flow-plugin`** before any new commits.
- Conversion commit message explicit: "Convert repo: from project to flow plugin marketplace + template. Old content recoverable via `git checkout pre-flow-plugin`."
- Reference the tag in the new README's "History" section.
- **Never force-push.** Standard commits only.

**Alternative considered:** `archive/pre-flow-plugin` (more conventional GitHub namespacing). Rejected as churn — `pre-flow-plugin` is already baked into the brief, README plan, and commit message. If we want an `archive/*` convention later, set it in PR 2.

### Decision 7: UserPromptSubmit reminder hook ON by default

**Decision:** When the template ships (PR 3), `template/.claude/settings.json.example` will include a UserPromptSubmit hook that fires a 1-line workflow reminder on every user message. **On by default.**

**Reasoning:** This is the "tier 3 deterministic enforcement" from the discussion. Skill auto-invocation is probabilistic; CLAUDE.md is always loaded but doesn't enforce; only hooks fire deterministically every turn. Making the hook opt-in defeats the point of plugin-ifying the workflow — the whole reason to extract is to make the loop more reliable across projects, not less.

**Tradeoff:** It's a permission-prompting hook. Users see the prompt on first run. Acceptable cost for deterministic enforcement.

### Decision 8: Handoff pattern — brief-to-fresh-agent, not clone-to-/tmp

**Decision:** Plugin work happens in a Conductor workspace anchored to `byamron/project-template`. To bridge context, this workspace prepares a self-contained **handoff brief** (saved in `core-docs/handoffs/`) that the user pastes into the project-template workspace's first turn. The fresh agent has zero context from md-manager but doesn't need it — the brief is fully self-contained.

**Cross-workspace source-file dependencies** (e.g., md-manager's existing SKILL.md content) are resolved via `gh api repos/by-dev-tools/md-manager/contents/<path>` from inside the project-template workspace. No clone-to-`/tmp` hacks; no manual file copying.

**Alternatives considered:**
- Clone md-manager to `/tmp` inside the project-template workspace: rejected as hacky, not Conductor-native.
- Manual file copies between workspaces: rejected as fragile.
- Cross-workspace shared filesystem: not a real option in Conductor.

### Decision 9 (from PR 1 re-plan): `/simplify` is native — omit `flow:simplify`

**Decision:** Do NOT ship `flow:simplify` in the plugin. `/simplify` is a Claude Code bundled native skill, available in every session. Annotate workflow.md anywhere it references `/simplify` as "(bundled with Claude Code)" so consumers know it's native, not plugin-provided.

**Reasoning:**
- Wrappers add weight without value.
- Bundled skills get Anthropic's ongoing maintenance; a wrapper either parrots that or drifts from it.
- Namespace consistency (consumers typing `flow:*` for everything workflow-related) is a weak argument — the doc annotation closes the gap cleanly.

**Other bundled skills to watch for during ports:** `/batch`, `/debug`, `/loop`, `/claude-api`. The agent should check `/ship`'s source for accidental refs to any of these and use the bundled versions rather than re-implementing.

### Decision 10 (from PR 1 re-plan): `/ship` port table — 3a/3b split

**Decision:** When porting `/ship` from md-manager to the plugin, treat each pipeline step independently:

| Source section | PR 1 treatment |
|---|---|
| Step 0 (pre-flight) | Port as-is |
| Step 1 (`/security-review`, `/accessibility-review`) | `[PR 1 LIMITATION]` placeholder (these skills land in PR 2) |
| Step 2 (route follow-ups) | Port; config-slot doc paths |
| Step 3a (user feedback → feedback.md) | **Port active** — pure markdown work, no tooling dep |
| Step 3b (memory machinery — `tools/memory/check.mjs`) | `[PR 1 LIMITATION]` placeholder ("Memory tooling lands in PR 2 at `plugins/flow/tools/memory/`. Skip Step 3b in this version.") |
| Step 4 (update core docs) | Port; config-slot all paths |
| Step 5 (commit) | Port as-is |
| Step 6 (push + PR) | Port; replace hardcoded `--base main` with default-branch discovery (`git symbolic-ref` → config slot → literal `main` fallback) |
| Step 7 (hand off; `/link` for dev server) | Replace `/link` with generic "if your project has a dev-server skill, invoke it now" note |
| `npm run typecheck` refs | Config-slot as `workflow.config.json.typecheckCmd`; **loud warning** if unset (not silent no-op) |

**Reasoning for the 3a/3b split:** 3a and 3b are independent operations that happen to be neighbors in the source. 3a depends on no external tooling (pure markdown). 3b depends on memory machinery shipping in PR 2. Placeholdering all of Step 3 would lose feedback synthesis capability for the PR-1-through-PR-2 window — bad trade.

**Coupling metric:** Agent reported ~155 of 191 source lines port directly; ~36 lines get placeholder/slot replacements. That's ~19% replacement rate — within the "light coupling" threshold I'd set (re-plan trigger was >30%).

### Decision 11 (from PR 1 re-plan enhancement): Loud warning for unset `typecheckCmd`

**Decision:** When `/ship` references project commands via `workflow.config.json`, an unset slot must print a visible warning, **not silently no-op**.

Example output: `⚠️ workflow.config.json.typecheckCmd not set; skipping preflight re-run. Set this slot to enable typecheck on /ship.`

**Reasoning:** Silent no-op risks a consumer thinking preflight ran when it didn't — a false-affordance issue. Pattern applies to any config slot referenced by `/ship` (or future skills), not just typecheck.

---

## 4. The 6-PR umbrella plan

Full breakdown of every PR, with scope and dependencies. **Each PR gets its own plan-approval gate** when actually started — this umbrella is the strategic plan, not a substitute for per-PR plans.

### PR 1 — `byamron/project-template`: marketplace skeleton + first skill

**Scope:**
- `.claude-plugin/marketplace.json` at repo root (declares `flow` plugin at `./plugins/flow`).
- `plugins/flow/.claude-plugin/plugin.json` (name, version 0.1.0, description, author, license MIT).
- `plugins/flow/skills/ship/SKILL.md` — minimal `/flow:ship` per the port table (with placeholders for security+a11y reviews and memory tooling until PR 2).
- ~~`plugins/flow/skills/simplify/SKILL.md`~~ — **OMITTED per Decision 9**. Native `/simplify` is bundled; workflow.md annotates references to indicate it's native.
- `plugins/flow/docs/workflow.md` — canonical 11-step loop, de-projected. Includes "Project config slots" section (narrative documentation; JSON Schema lands PR 2). Includes "Bootstrap status" section noting v0.1.0 scope.
- `README.md` at repo root — what the marketplace is, install command, link to workflow.md, "History" section referencing `pre-flow-plugin` tag + conversion commit.
- `dev-docs/` directory init: `plan.md` (PR 1 as first Active Work Item), `history.md` (format header), `feedback.md` (format header), `roadmap.md` (Now/Next/Later headers with PRs 2 + 3 under Now).
- Pre-conversion tag: `pre-flow-plugin` on `origin/main` before any commits.

**Out of scope:** any other skills, agents, rules, hooks, schema, template directory, md-manager edits.

**Bootstrap exception (the irony tax):** Cannot dogfood the plugin's own loop in this PR because most of the skills don't exist yet. Replacement: manual cold-read of the diff with security + simplification + project-agnostic lenses. PR 2 onward can dogfood.

### PR 2 — `byamron/project-template`: rest of plugin + config schema

**Scope:**
- Port remaining skills: `/staff-review` (with four-lens orchestration intact), `/security-review`, `/accessibility-review`, `/ship-spike`.
- Add `/workflow-help` skill that prints the loop on demand.
- Port agents: `planner`, `docs`. Refactor to read paths from `workflow.config.json`.
- Port portable rules: `general.md`, `plan-discipline.md`, `documentation.md`, `exploration.md`. Strip md-manager-specific references; use config-slot syntax.
- Port `tools/memory/check.mjs` (cap + audit-due — already generic).
- **Backfill `/ship` placeholders** from PR 1: wire up the `/security-review` + `/accessibility-review` invocations and the memory machinery (Step 3b).
- Define `plugins/flow/schema/workflow.config.schema.json` — JSON Schema for the project config file. Document every slot.
- Default-fallback table documented in `docs/workflow.md`: which slots have defaults, what they default to, what happens if missing.
- Optional `plugins/flow/hooks/` with a UserPromptSubmit reminder hook (opt-in via template's settings example — see PR 3).

**Verification:** install updated plugin; run mock `/flow:staff-review` against a sample diff in a throwaway project that has no `core-docs/`; confirm it degrades gracefully.

**Watch for during execution:** other bundled native skills the agent might inadvertently try to port (`/batch`, `/debug`, `/loop`, `/claude-api` per Anthropic docs).

### PR 3 — `byamron/project-template`: template directory + bootstrap docs

**Scope:**
- `template/CLAUDE.md.template` — minimal 5–10 line stub with `{{PROJECT_NAME}}`, `{{STACK}}`, `{{SAFETY_PATHS}}` placeholders.
- `template/core-docs/` — blank scaffolds with format headers (no entries): `spec.md`, `plan.md`, `roadmap.md`, `history.md`, `feedback.md`, `design-language.md`.
- `template/.claude/workflow.config.json` — example config with sensible defaults + inline comments (JSONC) or sibling README.
- `template/.claude/settings.json.example` — UserPromptSubmit hook **ON by default** (per Decision 7) + permission baseline.
- `template/.claude/rules/safety.md.template`, `ui.md.template`, `dev-server.md.template` — project-shaped stubs with `paths:` slot for the user to fill in.
- `template/tools/preflight/check.mjs.template` — generic skeleton, points at a configurable command list.
- `docs/bootstrap.md` — step-by-step instructions for adopting the plugin in a new project.
- `docs/migration.md` — instructions for migrating an existing project that already has `.claude/` content (the md-manager case).

**Verification:** follow `bootstrap.md` from scratch in an empty dir; confirm the result is a working project with the plugin installed.

### PR 4 — `by-dev-tools/md-manager`: add config layer (Stage 1, non-breaking)

**Scope:**
- Install `flow` plugin via `/plugin marketplace add byamron/project-template && /plugin install flow`.
- Add `md-manager/.claude/workflow.config.json` declaring md-manager's specific slots (paths, default branch `main`, preflight command, safety paths, modes).
- Add a note to md-manager's `CLAUDE.md` referencing the plugin ("This project follows the `flow` plugin's workflow — same loop as before, now sourced from a plugin").
- Existing local skills remain in place. **No deletion.**
- Verify both can coexist: `/staff-review` from local skills and `/flow:staff-review` from plugin both work (plugins are namespaced — no actual conflict per Anthropic docs).
- Smoke test: trigger `/flow:simplify` on the diff for this PR itself.

### PR 5 — `by-dev-tools/md-manager`: end-to-end validation (small dogfood)

**Scope:**
- Pick a small, real change (typo fix, tiny refactor) and ship it using **only plugin skills** (`/flow:staff-review`, `/flow:ship`) — not local duplicates.
- Capture any plugin bugs / friction in a new `feedback_*` memory entry per the agent self-feedback bar (likely warrants the source-diversity bar via "first seen during plugin extraction + would surface again on next consumer").
- Fix bugs in `byamron/project-template` as a follow-up PR before continuing.
- Output: a real shipped PR in md-manager driven by the plugin, validating the abstraction.

### PR 6 — `by-dev-tools/md-manager`: remove local duplicates (Stage 2, breaking)

**Scope:**
- Delete from md-manager:
  - `.claude/skills/simplify/`, `staff-review/`, `security-review/`, `accessibility-review/`, `ship/`, `ship-spike/`
  - `.claude/rules/general.md`, `plan-discipline.md`, `documentation.md`, `exploration.md`
  - `.claude/agents/planner.md`, `docs.md`
  - The portable bits of `tools/` (memory tooling)
- **Keep md-manager-shaped files:** `.claude/rules/safety.md` (project paths), `ui.md` (project tokens), `dev-server.md`, `.claude/skills/link/` (project dev server), `core-docs/*` (project content), `tools/preflight/check.mjs` (wired to md-manager commands).
- Update md-manager's `CLAUDE.md` to remove now-redundant references; point all workflow/skill questions at the plugin.
- Run the full plugin loop on this PR itself end-to-end to validate.
- Verification: md-manager has zero `.claude/skills/`, `.claude/agents/`, or generic `.claude/rules/` files left.
- **Retire the umbrella** (per Decision 4 exit criteria): move the "Flow plugin extraction" Active Work Item from `md-manager/plan.md` to `md-manager/history.md` as "Flow plugin extraction complete."

---

## 5. Confidence verdicts and risks (from the umbrella plan)

### Load-bearing assumptions with confidence ratings

**Assumption:** One repo with marketplace + plugin + template subdirs is the right shape per Anthropic's docs.
- **Confidence:** HIGH
- **Why:** Verified directly against `code.claude.com/docs/en/plugin-marketplaces`; matches `anthropics/claude-plugins-official` precedent.
- **If it flips:** Split into two repos. One extra repo to maintain; same skill content. Not catastrophic.

**Assumption:** Dynamic context injection (`` !`<command>` ``) reliably handles missing project files via shell fallback.
- **Confidence:** HIGH
- **Why:** Documented behavior per Anthropic skills docs; standard shell idiom.
- **If it flips:** Plugin breaks in projects without `core-docs/*`. Mitigation: PR 2 verification step runs against an empty project.

**Assumption:** `.claude/workflow.config.json` schema can capture all per-project variance without bloat.
- **Confidence:** MEDIUM
- **Why:** Most variance fits clean slots. Some edge cases (e.g. Designer's Build/Harden release cadence) might not — they're meant to live outside the per-PR plugin, but boundary-drawing might surface gaps in PR 2.
- **If it flips:** Add a second config file or escape hatch (e.g. `.claude/workflow.extensions.md` for narrative project-specific guidance the plugin treats as standing context).

**Assumption:** md-manager's current skill behaviors can be reproduced 1:1 by parameterized plugin skills.
- **Confidence:** MEDIUM
- **Why:** Most behaviors are project-agnostic; a few depend on file presence + structure. Won't know for sure until PR 5 dogfood.
- **If it flips:** Diff-and-fix in `byamron/project-template` follow-up PRs; defer PR 6 (duplicate removal) until parity is achieved.

**Assumption:** Preserving git history via content-replacing commit is acceptable.
- **Confidence:** HIGH (user-confirmed).

### Open risks tracked in the umbrella

- **Plugin install/update friction.** `/plugin marketplace update` is on the user; mitigation = version the plugin (start at 0.1.0), document a deprecation policy in `plugins/flow/CHANGELOG.md`.
- **Namespace collisions during PR 4 coexistence.** Plugin skills are namespaced (`flow:skill-name`) per Anthropic docs, so no actual collision; verify in PR 4.
- **UserPromptSubmit hook permission prompt friction.** Documented; consumers accept once.
- **`memory/check.mjs` path assumptions.** Need to verify "canonical project path" derivation works when the plugin is installed at user scope vs the consumer at project scope. Test in PR 2.
- **`/critique-plan` is an external plugin** (assumption-auditor) — not part of `flow`. Plugin's `/ship` and `general.md` rule must continue to say "advisory, human gate is enforcement."

---

## 6. Plan changes made during this session (chronological)

For audit purposes — what changed in md-manager's `core-docs/plan.md` during this conversation:

1. **Updated `Current Focus`** to point at "Flow plugin extraction" (superseding the prior "Workflow unification PR 2" item).
2. **Added Handoff Notes entry** documenting the locked decisions and pointing at this file + `project-template.md` + `pr1-flow-plugin-init.md`.
3. **Added new top Active Work Item** "Flow plugin extraction (current — multi-PR umbrella)" with all 6 PRs spec-walked, confidence verdicts, risks, files touched.
4. **Marked the prior "Workflow unification — PR 2" item as SUPERSEDED** (work absorbed into Flow plugin extraction). Retained its original scope text for reference; flagged "DO NOT EXECUTE as a standalone PR."
5. **Resolved the Option C question inline in the umbrella plan's open-questions section** with the full hybrid + retirement criteria.
6. **Added `dev-docs/` setup tasks to PR 1** (per Option C).
7. **Added `pre-flow-plugin` tag tasks to PR 1** (per git history preservation decision).
8. **Added umbrella-retirement task to PR 6.**

---

## 7. PR 1 handoff brief — what was sent to the project-template workspace

The brief lives in full at `core-docs/handoffs/pr1-flow-plugin-init.md`. Summary of its structure:

1. **Locked decisions section** — plugin name, repo shape, history preservation, Option C, PR 1 scope ceiling.
2. **Workflow the fresh agent must follow** — plan first, surface, wait for approval; execute; commit per phase; manual review pass; push + open PR; never merge.
3. **Bootstrap exception** — no plugin loop ironically yet; manual cold-read replaces `/simplify` and `/staff-review` for this PR.
4. **Step-by-step execution** (A through K):
   - A: tag old commit + branch
   - B: remove pre-conversion content
   - C: marketplace + plugin manifests
   - D: port `/simplify` skill (**later removed in re-plan — see §8**)
   - E: port `/ship` skill (minimal)
   - F: port `core-docs/workflow.md`
   - G: rewrite README
   - H: initialize `dev-docs/`
   - I: manual review pass
   - J: verification (local plugin smoke test)
   - K: push + open PR
5. **What NOT to do** — don't merge, don't force-push, don't port skills beyond named, don't add template directory, don't expand scope, don't introduce md-manager tokens.
6. **Confidence verdicts to include in the agent's plan.**
7. **Risks** — plugin install across workspace boundary, gh api base64 quirk, description auto-trigger tuning.
8. **Reference URLs to Anthropic docs.**

The agent's responding plan adhered closely to this brief.

---

## 8. The PR 1 re-plan event (mid-execution)

During PR 1 execution, the agent in the project-template workspace surfaced a re-plan. This is documented here in full because it sets precedent for future ports.

### What the agent discovered

1. **`/simplify` is a Claude Code bundled native skill.** Anthropic's docs explicitly list it alongside `/batch`, `/debug`, `/loop`, `/claude-api` as bundled. Creating `flow:simplify` would either shadow native (wrong) or be a dead wrapper (also wrong).
2. **`/ship` source had heavier coupling than first estimated.** Specifically: it references memory machinery (`tools/memory/check.mjs`) which IS planned to be plugin-resident (PR 2), but is NOT yet present in PR 1.

### What the agent proposed

1. **Omit `flow:simplify` entirely.** Workflow.md annotates `/simplify` as "(bundled with Claude Code)" wherever referenced.
2. **`/ship` port table** with explicit per-section treatment (see Decision 10 above for the full table). Keep 3a (user feedback) active; placeholder 3b (memory machinery) until PR 2.
3. **Coupling metric:** ~155 / 191 source lines port directly; ~36 get placeholder/slot replacements. ~19% replacement — within the "light coupling" threshold (re-plan trigger was >30%).

### What I approved

Both proposed changes, plus:

- **Loud warning for unset `typecheckCmd`** (Decision 11) — `/ship` must print a visible warning, not silently no-op, when a config slot is missing.
- **Annotate bundled skills explicitly** in workflow.md anywhere they're referenced. Check `/ship`'s source for accidental refs to other bundled skills (`/batch`, `/debug`, `/loop`, `/claude-api`).
- **Lesson capture note** for `dev-docs/history.md` at /ship time: "Discovered during execution: `/simplify` is a Claude Code bundled skill. Decision: omit `flow:simplify` entirely; reference native `/simplify` in workflow.md. Pattern for future ports: before porting any skill from md-manager, check whether Claude Code now ships a bundled equivalent — prefer native over plugin reimplementation." (Single-source so doesn't earn a memory entry yet, but promotion-eligible if the same pattern recurs.)

### The reply the user sent to the agent

> Approved. Omit `flow:simplify` entirely (your read is correct — it's bundled). Accept the `/ship` port table including the 3a/3b split.
>
> One enhancement: when `typecheckCmd` is unset, make the no-op loud — print a visible warning so consumers don't think preflight ran when it didn't. Silent no-op is a false-affordance risk.
>
> Update workflow.md anywhere it references `/simplify` to annotate as "(bundled with Claude Code)" so consumers know it's native. Same for any other bundled skills you find while porting (the docs list `/simplify`, `/batch`, `/debug`, `/loop`, `/claude-api` as bundled — check `/ship`'s source for accidental refs to any of them).
>
> Capture the `/simplify`-is-native discovery in dev-docs/history.md at /ship time as a lesson learned (single-source so no memory entry yet, but file it so it can promote later if the same pattern recurs).
>
> Continue executing.

---

## 9. Existing artifacts and references

### In md-manager (this workspace)

- **`core-docs/project-template.md`** — the original blueprint that started this work. ~570 lines. Describes the full structure abstractly. Required reading for context.
- **`core-docs/plan.md`** — umbrella plan. Section "Active Work Items → Flow plugin extraction" is the operational doc.
- **`core-docs/handoffs/pr1-flow-plugin-init.md`** — the PR 1 brief in full.
- **`core-docs/handoffs/flow-plugin-consolidation-2026-05-23.md`** — this file.
- **`core-docs/workflow.md`** — md-manager's canonical 11-step workflow. This is the source the plugin's `workflow.md` was ported from (de-projected).
- **`.claude/skills/ship/SKILL.md`** — source for the `/flow:ship` port.
- **`.claude/skills/staff-review/SKILL.md`** — source for the `/flow:staff-review` port (PR 2).
- **`.claude/skills/ship-spike/SKILL.md`** — source for the `/flow:ship-spike` port (PR 2).
- **`.claude/rules/`** — source for the portable rules ports (PR 2): `general.md`, `plan-discipline.md`, `documentation.md`, `exploration.md`. NOT to port: `safety.md`, `ui.md`, `dev-server.md` (project-shaped).
- **`.claude/agents/planner.md`, `docs.md`** — source for the agent ports (PR 2).

### External references (verified during session)

- Skills: https://code.claude.com/docs/en/skills
- Plugins: https://code.claude.com/docs/en/plugins
- Plugin marketplaces: https://code.claude.com/docs/en/plugin-marketplaces
- Hooks: https://code.claude.com/docs/en/hooks (UserPromptSubmit and other event hooks)
- Best practices: https://code.claude.com/docs/en/best-practices
- Anthropic's official marketplace: https://github.com/anthropics/claude-plugins-official
- Anthropic's public skills repo: https://github.com/anthropics/skills

### Background research surfaced during session

- Ramp's plugin-distribution posture: treats *ways of working* as the unit of reuse; skills shared across the org; CLAUDE.md slim, push procedure into skills. References: https://creatoreconomy.so/p/inside-ramp-the-32b-company-ai-agents-geoff-charles, https://claude.com/customers/ramp, https://github.com/rampstackco/claude-skills.

---

## 10. Where the next workspace should pick up

### Immediate next actions

1. **Check PR 1 status:** `gh pr list --repo byamron/project-template` to see if PR 1 is open. If it is, capture the URL.
2. **If PR 1 is merged:** check off the umbrella's PR 1 checkboxes in `md-manager/core-docs/plan.md` and add a one-line breadcrumb to `md-manager/core-docs/history.md` at next `/ship`.
3. **If PR 1 is open but unmerged:** wait. User merges. Then proceed to (2).
4. **If PR 1 stalled or unresolved:** read `byamron/project-template`'s `dev-docs/plan.md` to see where the other agent left off. Coordinate via the user if there's a blocker.

### PR 2 handoff brief

When PR 1 is merged and the user is ready for PR 2, the next deliverable is the PR 2 handoff brief at `core-docs/handoffs/pr2-flow-plugin-rest.md`. It should follow the same shape as PR 1's brief:

- Locked decisions section (carry forward from this doc)
- Step-by-step execution covering: port `/staff-review` (four-lens orchestration — most complex), `/security-review`, `/accessibility-review`, `/ship-spike`, `/workflow-help`; port `planner` + `docs` agents; port portable rules; port `tools/memory/check.mjs`; define `workflow.config.schema.json`; backfill `/ship` placeholders from PR 1; opt-in UserPromptSubmit hook (default ON in PR 3's template).
- Watch list for bundled native skills (don't re-port any of `/batch`, `/debug`, `/loop`, `/claude-api`).
- Verification: install updated plugin; run mock `/flow:staff-review` against a sample diff in an empty project; confirm graceful degradation.
- Standard "what not to do" guardrails (no merge, no force-push, surface re-plan if scope creep, no md-manager edits).

### Heads-up for PR 2

Given that PR 1 surfaced a coupling re-plan, **expect PR 2 to surface more.** `/staff-review` and `/ship-spike` are more complex than `/ship`; they likely have heavier coupling assumptions. Build in the re-plan budget.

Also, `/staff-review` orchestrates 4 parallel Explore agents — verify how this works inside a plugin context vs the way md-manager's local skill spawns them. Might need adjustment.

### Heads-up for PR 4–6 (md-manager migration)

The validation gate at PR 5 (dogfood the plugin on a real PR) is the **single most important checkpoint** in the umbrella. Do not rush PR 6 (deletion) until PR 5 surfaces zero blockers. If PR 5 surfaces blockers, fix in `byamron/project-template` follow-up PRs and re-run PR 5 dogfood before proceeding to PR 6.

---

## 11. Anti-patterns to watch for (carried over from md-manager's workflow.md)

- **Implementing without an approved plan.** Even on small PRs. Each sub-PR in this umbrella gets its own plan-approval gate.
- **Approving a LOW-confidence plan.** The gate exists because the assumption is load-bearing.
- **Smuggling features through spike mode.** None of these PRs are spike mode; all are `feature`.
- **Updating `history.md` / `feedback.md` mid-feature.** Let `/ship` synthesize at the end (or the PR-1-equivalent manual review pass).
- **Putting follow-ups only in the PR body.** They vanish at merge. Use `dev-docs/roadmap.md` (project-template) or `core-docs/roadmap.md` (md-manager).
- **Merging.** Claude doesn't merge. Ever. The user merges.
- **Silently absorbing new scope.** Surface re-plan instead. Both PR 1's `/simplify`-is-native discovery and the `/ship` coupling discovery were correctly surfaced — that pattern must continue.
- **Writing memory entries from single-source findings.** Source-diversity bar exists to prevent slop. The `/simplify`-is-native lesson is currently single-source; document in history.md and promote to memory only if it recurs.

---

## End

If anything in this doc contradicts what's in `md-manager/core-docs/plan.md`, **the plan.md is the live operational doc**; this consolidation is a snapshot taken 2026-05-23. Check plan.md for current state if uncertain.
