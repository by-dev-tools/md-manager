# Plan

The living document for what's being worked on right now, what's queued, and what to pick up next session. Longer-range work goes in `roadmap.md`. Decision history goes in `history.md`.

---

## Current Focus

**Flow plugin extraction — make the workflow exportable across repos.** Multi-PR umbrella spanning two repos: `by-dev-tools/flow` (renamed from `by-dev-tools/llm-auditor` on 2026-05-23 — becomes a Claude Code plugin marketplace + plugin + template) and `by-dev-tools/md-manager` (becomes the first plugin consumer, validating the abstraction). PR 0 (operational rename + cleanup) shipped 2026-05-23. PR 1 begins next: restructure llm-auditor's flat layout into `plugins/flow/*`, rename internal identifiers to `flow`, bump to v1.0.0, add the new workflow surface (`/flow:ship` + `workflow.md` + `dev-docs/`). PR 2 ports remaining workflow skills + agents + rules + memory tool + schema. PR 3 ships template directory (web/swift/tauri-rust-ts stacks). PRs 4-6 stage md-manager as the consumer. **Post-extraction v1.x+** layers in JTBD/spec substrate, plan visuals + HTML reports, JTBD-grounded design review lenses, autonomous routines (Dispatch + Remote Control daily cadence). PR C (Mini token+component migration) remains paused until plugin work settles. Prior "Workflow unification PR 2" item below is SUPERSEDED — its scope absorbs into flow.

## Handoff Notes

- **Flow plugin PR 1 + PR 2 shipped 2026-05-24 at `by-dev-tools/flow`.** PR 1 (v1.0.0, `f8610a1`, [flow#5](https://github.com/by-dev-tools/flow/pull/5)) restructured the repo into `plugins/flow/*`, renamed `llm-auditor`/`assumption-auditor` → `flow`, added `/flow:ship` + `plugins/flow/docs/workflow.md`. PR 2 (v1.1.0, `3409103`, [flow#7](https://github.com/by-dev-tools/flow/pull/7)) backfilled PR 1's `[PR 1 LIMITATION]` placeholders and ported the full workflow surface: `/flow:security-review`, `/flow:accessibility-review`, `/flow:staff-review` (4-lens parallel), `/flow:ship-spike`, `/flow:workflow-help`; planner + docs + 4 lens agents; 4 portable rules; memory tool; `flow.config.schema.json` (13 slots); default hooks. PR-1 FOLLOW-UPs addressed. Bootstrap exception fully lifted for downstream PRs. **Next at flow: PR 3 (template directory — `template/base/*` Tier-1+2 + `template/stacks/{web,swift,tauri-rust-ts}/*`).** **Next at md-manager: PR 4 (install flow alongside existing local skills, non-breaking Stage 1 of consumer migration) — starts only after flow PR 3 merges**, per `gh api repos/by-dev-tools/flow/contents/dev-docs/handoffs/md-manager-pr4-6-spec.md`. See flow's `dev-docs/history.md` for canonical PR 1 + PR 2 narrative; md-manager's `core-docs/history.md` has one-line breadcrumbs only.
- **PR 0 (operational rename + cleanup) shipped 2026-05-23.** Actions executed: `by-dev-tools/llm-auditor` → `by-dev-tools/flow` (GitHub rename, redirect maintained), local `~/dev/llm-auditor` → `~/dev/flow`, `~/.claude/settings.json` URL updated (marketplace key stays "llm-auditor" until PR 1 lands the internal marketplace.json + plugin.json renames), plugin cache cleared, two stale conductor worktrees removed (`guangzhou-v3`, `warsaw-v1`), `byamron/project-template#1` CLOSED without merge with explanatory comment. Settings.json backup at `~/.claude/settings.json.bak.20260523-144832`. Flow checkout synced (was 5 commits behind origin/main).
- **Flow plugin architecture decisions (2026-05-23, consolidating two parallel planning streams).** Plugin host: `by-dev-tools/flow` (the renamed llm-auditor). Plugin name: `flow`. Bundled scope: `flow` absorbs the audit/critique skills (`critique-plan`, `audit-plan`, `audit-completion`) + agents (`auditor`, `plan-critic`) that already existed in llm-auditor, plus adds workflow skills (`ship`, `staff-review`, `security-review`, `accessibility-review`, `ship-spike`, `workflow-help`). `/simplify` is a Claude Code bundled native skill — flow references it in `workflow.md` (annotated as "(bundled with Claude Code)") and does NOT duplicate it. Slash command convention: `/flow:ship`, `/flow:critique-plan`, etc. (Claude Code namespaces plugin skills automatically). Migration of md-manager is staged across PRs 4-6 to never break working state. See `core-docs/handoffs/flow-plugin-consolidation-2026-05-23.md` for the full decision rationale (with 2026-05-24 superseded headers for the two architecture revisions: rename-host + bundling).
- **Pattaya-v1 conductor workspace closed.** Its planning content (`project-template.md`, `pr1-flow-plugin-init.md`, `flow-plugin-consolidation-2026-05-23.md`) was consolidated into this worktree on 2026-05-24 with superseded headers noting the architectural revisions. The branch `extract-project-structure-doc` can be abandoned.
- **Post-extraction v1.x+ roadmap.** After PR 6 retires the extraction umbrella, flow gets layered enhancements: v1.1 autonomous routines (plan-next, impl-approved, approve, redirect, chrome-verify; Dispatch + Remote Control daily cadence); v1.2 JTBD/spec substrate + interactive spec+intake skills; v1.3 plan visuals (HTML-first fidelity ladder); v1.4 design review lenses (functionality + craft + engineering + push-further, parallel to /staff-review for code); v1.5 impl HTML report (JTBD-organized); v1.6 Claude-driven preview skills; v2.x higher-fidelity visuals, Figma escape hatch, deploy previews. Detailed design notes in `core-docs/handoffs/{visuals,design-pipeline,spec-and-intake}-design-2026-05-23.md`. **None of these v1.x+ items are in the extraction umbrella's scope.** See "Post-extraction roadmap" section near the bottom of this file.
- **Prior "Workflow unification PR 2" item is SUPERSEDED.** Its scope (preflight + memory tooling + /ship-spike runtime + path-validation rule) splits across the new architecture: `/ship-spike` and the memory tooling live in flow; md-manager's `tools/preflight/check.mjs` stays as a project-specific override of flow's stack-template; path-validation rule becomes part of flow's default hooks. Memory-entry port from designer is deferred to v1.1 (since md-manager has zero memory entries today). Kept in place below as a paused reference rather than deleted.
- **Push-further lens + roadmap.md § Exploration shipped on `push-further-lens`** — `45443ad` (lens + Exploration + rule + doc updates) + `4ff1fc9` (/simplify fixes) + `4a47708` (/staff-review fixes) + this ship commit. `/staff-review` now runs four lenses; SKILL.md / workflow.md / CLAUDE.md / FB-0009 all updated. `.claude/rules/exploration.md` auto-loads on UI/code work to surface relevant Exploration items. FB-0029 (no lens-skipping) and FB-0030 (adapt skills, don't vendor) captured (renumbered from FB-0025/0026 after PR #16, #18 merged first and took those numbers). Heavyweight `/uncommon-care` skill is PR b — not in this PR.
- **Color-rail portfolio-derived presets merged as PR #18** on `color-rail-presets`. Rail now shows 5 portfolio-derived presets at t=0.25 (Sand, Bone, Blush, Sage, Mist); default page tint is Sand. FB-0027 / FB-0028 captured.
- **PR 1 (workflow unification) merged as PR #16** on `unify-workflows`. Doc + tooling only. New canonical workflow.md (11 steps), spike/tiny modes, confidence gates, three-layer feedback model with 5 guardrails on agent memory. FB-0025 / FB-0026 captured.
- **PR C Step 3a (`--gray-a*` rename) merged as PR #17.** All `--tint-overlay-*` references now in place; Mini's Radix `--gray-a*` scale is available for future use.
- **PR C Step 1 (token name-collision audit) merged as PR #15** on branch `pr-c-token-audit`. Output: `core-docs/token-migration.md` with the 14-token collision table.
- **GitHub Org transfer complete** — `byamron/md-manager` is now `by-dev-tools/md-manager`. Branch protection + Rulesets preserved across transfer. Merge queue is **active** with required checks `typecheck` / `build` / `test`. Dependabot security updates enabled. PR #12 (esbuild+vite → vite 8) /ship-passed and awaiting user merge — closes the two open advisories (`GHSA-4w7w-66w2-5vf9` vite path traversal + `GHSA-67mh-4wv8-2f99` esbuild dev-server leak). PR #13 (separate vite major) still open. Secret Protection enabled. All git remotes (worktree config and Conductor workspaces) now use HTTPS.
- **Next two PRs unblock PR C Step 3 (tokens migration):**
  - **PR C Step 3a** — DONE (see above).
  - **PR C Step 2** — `--accent-8` contrast matrix against every page-tint hue. Required before any component starts using `var(--accent-9)` for focus rings. Can run in parallel with Step 3a.
- **PR C Step 3 (tokens migration) blocked by Step 2.** When unblocked: rebind 4 radius tokens in `packages/ui/styles/tokens.css` to our values; move 29 md-manager-only tokens into a project-additions section of `tokens.css`; delete every `--*` declaration from `globals.css`. Plan in `core-docs/token-migration.md` § "PR C Step 3".
- **Surface posture is an open axiom with explicit resolution criteria** (FB-0019, `design-language.md` § "Axioms → Open axiom: surface posture"). Both floating and flat continue to ship in the DevPanel. PR C component migrations must support both postures — do not assume one. Decision happens via dogfooding signal, an archetype constraint, or an explicit user call.
- **Accent identity = `--page-tint`**, not a fixed Mini accent scale (axiom #3). `indigo` is reserved at the root via `data-accent="indigo"` for focus-ring rebinding but is currently neutralized. PR C components that use `var(--accent-8)` / `var(--accent-9)` (focus rings, links, selected state) must clear ≥3:1 against every page-tint hue the color rail can produce. The contrast matrix is the first PR-C prerequisite (already in roadmap.md under "From PR A staff review").
- **All components are `status: legacy`** in `core-docs/component-manifest.json`. PR C flips them to `managed` one at a time, each migration its own commit + manifest update.
- **The neutralization block at the bottom of `src/styles/globals.css`** (`img/video/svg display`, universal `:focus-visible` ring) stays until PR C migrates the components that depend on the legacy focus styling. Remove the block incrementally as components migrate.
- **Mini per-generation log updates** (component-manifest.json, generation-log.md, pattern-log.md) are **mechanical contract artifacts** — they update inline with UI changes, not at `/ship` time. This is explicit in CLAUDE.md § "Mini Design System" → "Procedure for UI tasks". Narrative docs (history.md, plan.md, roadmap.md, spec.md, feedback.md) remain `/ship`-owned.
- **PR C prerequisites already captured in `roadmap.md`** under "From PR A staff review (Mini install)": token name collision audit (highest-priority), `--accent-8` contrast validation across user page tints, alias scheme reconciliation (single `@mini` vs split), tsconfig include expansion, sync-mini.sh error-handling hardening.
- **Polished-features doctrine is canonical.** CLAUDE.md § "Quality posture" + FB-0007 + FB-0008. Every scoping decision runs through wire-vs-defer.
- Persistence, repo sync, and search remain unresolved; see "Open questions" in `spec.md`. These come after Mini adoption settles.

## Active Work Items

### Flow plugin extraction — umbrella close-out through PR 2 (docs-only, current)

**Mode:** feature
**Goal:** Close out md-manager's umbrella tracking of the Flow plugin extraction through PR 2. PR 1 (flow v1.0.0, `f8610a1`, [flow#5](https://github.com/by-dev-tools/flow/pull/5)) and PR 2 (flow v1.1.0, `3409103`, [flow#7](https://github.com/by-dev-tools/flow/pull/7)) both shipped 2026-05-24 in the flow repo. md-manager's umbrella plan was authored before those merges and still tracks them as pending. This is a docs-only update to reflect what shipped, route the next-step pointer at flow PR 3, and add breadcrumbs so future sessions can find the canonical narrative in flow's `dev-docs/history.md` without re-deriving it.

**Scope (in):**
- Check off every PR 1 + PR 2 spec-walk checkbox in the umbrella tracker. Add the SHA + PR-link headers under PR 1 and PR 2.
- Update "Handoff Notes": PR 1 + PR 2 shipped at flow; flow PR 3 (template directory) is next; md-manager PR 4 starts only after flow PR 3 merges.
- Add two breadcrumb entries to `core-docs/history.md` pointing at flow's canonical narrative (PR 1 entry + PR 2 entry).
- Add one synthesized `core-docs/feedback.md` entry (FB-0031) capturing the portable half of flow's FB-0001 (dogfood the workflow even when the named skills don't exist yet).

**Scope (out):**
- Any code changes to `src/`, `.claude/skills/`, `.claude/agents/`, `.claude/rules/`, `tools/`, or any non-docs file. md-manager's actual consumer migration is PRs 4–6 in separate sessions.
- Re-writing the umbrella PR 1 / PR 2 sections from scratch. The spec-walk and confidence verdicts authored pre-merge stand as historical record; we just flip checkboxes and add headers.
- Writing the PR-2 brief the original plan said was owed. PR 2 shipped without the brief; the brief is no longer needed.
- Touching the Post-extraction roadmap section — unchanged by the PR 1 + PR 2 ships.

**Spec-walk checkboxes:**
- [ ] PR 1 spec-walk checkboxes all checked, with `f8610a1` + [flow#5](https://github.com/by-dev-tools/flow/pull/5) at the section header.
- [ ] PR 2 spec-walk checkboxes all checked, with `3409103` + [flow#7](https://github.com/by-dev-tools/flow/pull/7) at the section header.
- [ ] "Handoff Notes" has a new bullet recording PR 1 + PR 2 shipped status, next pointer = flow PR 3, md-manager PR 4 sequencing dependency.
- [ ] `core-docs/history.md` has two new breadcrumb entries (PR 1 + PR 2). Each cross-links flow's `dev-docs/history.md` as source-of-truth.
- [ ] `core-docs/feedback.md` has a new FB-0031 entry synthesizing the portable principle from flow's FB-0001.
- [ ] Manual cold-read of full diff: no code-shaped files touched.
- [ ] Preflight green: `npm run typecheck && npm run build && npm run test`.

**Confidence verdicts:**

**Assumption:** PR 1 + PR 2 spec-walks as authored pre-merge match what actually shipped, modulo small in-session deviations that are documented in flow's `dev-docs/history.md` and don't change the umbrella's checkbox state.
**Confidence:** HIGH
**Why:** Flow's history entries for both PRs explicitly enumerate what shipped; spot-checking the spec-walk items (PR 2's schema, memory tool, placeholder backfill) all appear in flow's history as done.
**If it flips:** A specific checkbox doesn't have a real deliverable in flow. Strike it through with a one-line note pointing at flow's history for why it was skipped or absorbed.

**Assumption:** Flow's FB-0001 generalizes to md-manager beyond just the plugin-extraction context — i.e. it's a portable feedback entry, not a flow-only one.
**Confidence:** MEDIUM
**Why:** The underlying principle is project-agnostic. But md-manager's `feedback.md` historically captures md-manager-specific corrections; importing a flow-discovered principle is novel.
**If it flips:** Skip the FB entry. PR 1 + PR 2 close-out doesn't depend on it.

**Risks / open questions:**
- The umbrella's `**Workflow unification — PR 2** (SUPERSEDED)` section is unchanged by this work — it remains superseded.

**Files touched (anticipated):**
- `core-docs/plan.md` (Active Work Items: checkbox flips + Handoff Notes update + this work item)
- `core-docs/history.md` (two new breadcrumb entries at top)
- `core-docs/feedback.md` (one FB-0031 entry)

---

### Flow plugin extraction (current — multi-PR umbrella)

**Mode:** feature (each sub-PR is its own `feature`-mode run with its own plan-approval gate before execution).

**Goal:** Extract the 11-step loop, generic skills, agents, rules, and memory tooling into the renamed `by-dev-tools/flow` plugin (ex-llm-auditor; auditor + plan-critic agents and the critique-plan / audit-plan / audit-completion skills are already there and become the foundation). md-manager becomes the first consumer, validating that the plugin works end-to-end on a real codebase. Designer adopts later in a separate session. Result: a new repo can adopt the workflow with ~10 minutes of setup (CLAUDE.md stub + `flow.config.json` + project-shaped rule stubs + preflight wired to local commands) instead of duplicating the entire `.claude/` tree. The renamed flow repo also hosts a `template/` directory shipped with the plugin (PR 3) covering web / swift / tauri-rust-ts stacks.

**Scope (in):**
- `by-dev-tools/flow` restructured to Anthropic's marketplace pattern: marketplace.json at root + `plugins/flow/` (the plugin) + `template/` (PR 3) + `docs/` + `README.md` + `dev-docs/` (plugin's own dev-tracking).
- Plugin contains: workflow skills (`ship`, `ship-spike`, `staff-review`, `security-review`, `accessibility-review`, `workflow-help`); audit/critique skills already present (`critique-plan`, `audit-plan`, `audit-completion`); agents (`auditor`, `plan-critic` already; `planner`, `docs`, and the 4 staff-review lens agents added); rules (`general`, `plan-discipline`, `documentation`, `exploration`); tools (`memory/check.mjs`, `preflight/check.mjs.template`); docs (`workflow.md`).
- Skills use dynamic context injection (`` !`<command>` ``) to read project-specific facts at invocation time rather than hardcoding paths.
- Project config schema (`flow.config.json`) with documented slots: paths, default branch, branch prefix, preflight script + outputs, dev-server skill name + port, verification config, review_lenses, memory hard cap. Three stack templates ship: web / swift / tauri-rust-ts.
- Template directory: CLAUDE.md stub template, blank `core-docs/` scaffolds with format headers, `flow.config.json` example + schema, project-shaped rule stubs (`safety.md`, `ui.md`, `dev-server.md`), `tools/preflight/check.{mjs,sh}` per-stack starters. Per the tiering decided in this session: Tier 1 (7 files required) + Tier 2 (4 files recommended, ship empty) + Tier 3 (per-stack overlay, ~5 files).
- md-manager migration in staged PRs: install flow alongside existing skills (PR 4, no removal) → smoke-test end-to-end (PR 5, dogfood) → remove duplicates only after validation (PR 6).
- `byamron/llm-auditor` archived after PR 2 lands (redirect URL already in place from PR 0).

**Scope (out):**
- Publishing to a public Anthropic marketplace. Available via `/plugin marketplace add by-dev-tools/flow`.
- Designer-side migration (separate workspace, separate PR sequence later — validates flow's tauri-rust-ts stack template).
- New autonomous-routine skills (`plan-next`, `impl-approved`, `review-pending`, `approve`, `redirect`, `chrome-verify`, `flow:spec`, `flow:intake`) — these are post-extraction v1.x+ work; see "Post-extraction roadmap" section.
- Visual artifact + HTML report tooling, JTBD-grounded design review lenses — also post-extraction v1.x+; see "Post-extraction roadmap".
- Mini design system extraction — Mini skills (`generate-ui`, `enforce-tokens`, etc.) stay in md-manager until Mini graduates to its own plugin (separate future work).
- Changes to the workflow itself (loop steps, gate semantics, mode flags). Extraction preserves current behavior; redesign happens in separate PRs.
- UserPromptSubmit hook for deterministic enforcement — design it in PR 2 but ship only as opt-in via template's `settings.json.example`; default behavior stays model-invocation + CLAUDE.md stub.

**Spec-walk checkboxes** (each maps to a sub-PR; each sub-PR gets its own plan + approval gate before execution):

**PR 0 — operational rename + cleanup (SHIPPED 2026-05-23)**
- [x] `by-dev-tools/llm-auditor` → `by-dev-tools/flow` (GitHub rename; redirect maintained)
- [x] `byamron/project-template#1` CLOSED without merge (with explanatory comment)
- [x] Local `~/dev/llm-auditor` → `~/dev/flow` + remote URL updated to HTTPS
- [x] `~/.claude/settings.json` URL updated; backup at `settings.json.bak.20260523-144832`
- [x] Plugin cache cleared (`~/.claude/plugins/{cache,marketplaces}/llm-auditor` removed)
- [x] Two stale conductor worktrees removed (`guangzhou-v3`, `warsaw-v1`)
- [x] Local flow checkout synced (was 5 commits behind; now at 8857ebd)

**PR 1 — `by-dev-tools/flow`: restructure + initial workflow surface (SHIPPED 2026-05-24, `f8610a1`, [flow#5](https://github.com/by-dev-tools/flow/pull/5))**
- [x] Pre-restructure tag (`pre-flow-plugin` already exists from prior work) verified
- [x] Restructure: move existing root content (`skills/`, `agents/`, `scripts/`, `evals/`, `DISAGREE.md`) into `plugins/flow/*`
- [x] Update `.claude-plugin/marketplace.json`: name "llm-auditor" → "flow", plugin name "assumption-auditor" → "flow", homepage/repository URLs to by-dev-tools/flow
- [x] Update `.claude-plugin/plugin.json`: name → "flow", version → "1.0.0", description updated to reflect expanded scope
- [x] Add `plugins/flow/skills/ship/SKILL.md` — port from md-manager's `.claude/skills/ship` per the /ship port table (Step 3a/3b split; placeholders for security+a11y reviews until PR 2; loud warning for unset typecheckCmd; default-branch discovery; config-slot doc paths)
- [x] Add `plugins/flow/docs/workflow.md` — port from md-manager's `core-docs/workflow.md`, de-projected; annotate `/simplify` as "(bundled with Claude Code)"; document `flow.config.json` slot table
- [x] Restructure existing `core-docs/` (flow's own dev-tracking) → `dev-docs/` per the convention; ensure consumer-vs-plugin distinction is clear
- [x] Update README.md for flow plugin identity; include History section pointing at `pre-flow-plugin` tag for archeology
- [x] Second `~/.claude/settings.json` update: `enabledPlugins.assumption-auditor@llm-auditor` → `flow@flow`; marketplace key `llm-auditor` → `flow`
- [x] Workflow.md annotations: `/critique-plan`, `/audit-plan`, `/audit-completion` are now flow-internal (not external assumption-auditor plugin)
- [x] Manual cold-read of full diff (the plugin's own `/simplify` and `/staff-review` don't exist yet — bootstrap exception)
- [x] Verification: `claude plugin validate .` passes; marketplace.json + plugin.json parse with jq; install in `/tmp/flow-smoke` and confirm `/help` lists `flow:ship`, `flow:critique-plan`, etc.

**PR 2 — `by-dev-tools/flow`: rest of plugin + config schema (SHIPPED 2026-05-24, `3409103`, [flow#7](https://github.com/by-dev-tools/flow/pull/7))**
- [x] Port remaining workflow skills: `/flow:staff-review` (with four-lens orchestration intact), `/flow:security-review`, `/flow:accessibility-review`, `/flow:ship-spike`
- [x] Add `/flow:workflow-help` skill that prints the loop on demand
- [x] Port agents: `planner`, `docs`. Refactor to read paths from `flow.config.json` rather than hardcoding `core-docs/`
- [x] Add the 4 staff-review lens agents: `staff-engineer.md`, `ux-designer.md`, `design-engineer.md`, `push-further.md` (`uncommon-care.md` lens optional, gated by flow.config.json `review_lenses`)
- [x] Port portable rules: `general.md`, `plan-discipline.md`, `documentation.md`, `exploration.md`. Strip md-manager-specific references; use config-slot syntax
- [x] Port `tools/memory/check.mjs` (cap + audit-due — already generic)
- [x] Define `plugins/flow/schema/flow.config.schema.json` — JSON Schema for the project config. Document every slot. Omit `$schema` URL reference per Anthropic's convention
- [x] Default-fallback table documented in `docs/workflow.md`: which slots have defaults, what they default to, what happens if missing
- [x] Optional `plugins/flow/hooks/` with a UserPromptSubmit reminder hook (tier-3 deterministic enforcement, opt-in via template's settings example in PR 3)
- [x] Backfill PR 1's `/flow:ship` placeholders: wire up `/flow:security-review` + `/flow:accessibility-review` invocations and the memory machinery
- [x] Add path-validation hook in `hooks/default-hooks.json` (the rule that would have caught the prior `tools/memory/check.mjs` finding)
- [x] Archive `by-dev-tools/llm-auditor` URL — repo's already renamed; just close it as a separate entity in any internal docs. (The rename redirect remains in place forever.)
- [x] Verification: install updated plugin; smoke-test `/flow:staff-review` against a sample diff in an empty project (no `core-docs/`) — confirm graceful degradation
- [x] Watch list during port: don't re-port other Claude-bundled skills (`/batch`, `/debug`, `/loop`, `/claude-api`)
- [x] Verify `/flow:staff-review` parallel agent spawning works inside plugin context (vs md-manager's local Task-based spawning)
- [x] Verify `tools/memory/check.mjs` canonical-path derivation handles plugin-at-user-scope vs consumer-at-project-scope correctly

**PR 3 — `by-dev-tools/flow`: template directory + bootstrap docs**
- [ ] `template/base/CLAUDE.md.template` — minimal 5-10 line stub with `{{PROJECT_NAME}}`, `{{STACK}}`, `{{SAFETY_PATHS}}` placeholders
- [ ] `template/base/core-docs/{spec,plan,roadmap,history,feedback}.md` — blank scaffolds with format headers
- [ ] `template/base/flow.config.json.example` — sensible defaults + inline comments or sibling README
- [ ] `template/base/.claude/rules/safety.md.template` — stub with `{{SAFETY_PATHS}}` placeholder
- [ ] `template/base/.claude/settings.json.example` — explicit minimal allow/deny baseline (read-only commands allowed, destructive commands denied); UserPromptSubmit hook ON by default with comments
- [ ] `template/base/README.md` — placeholder skeleton with `{{PROJECT_NAME}}`, `{{ONE_LINE_DESCRIPTION}}`, `{{LIFECYCLE_STATUS}}`, `{{INSTALLATION_STEPS}}` placeholders
- [ ] `template/base/.gitignore` — universal entries (`.DS_Store`, `.env*`, `*.log`, `.claude/local-*`, etc.)
- [ ] `template/stacks/web/` — web overlay: `tools/preflight/check.mjs` (typecheck + build + test), `.claude/skills/link/SKILL.md`, `.claude/rules/ui.md`, `.github/workflows/ci.yml`, stack-specific `.gitignore` append
- [ ] `template/stacks/swift/` — swift overlay: `tools/preflight/check.sh` (xcodebuild + test + swift-format), `.claude/rules/safety.md.append`, `.github/workflows/ci.yml` (Xcode action)
- [ ] `template/stacks/tauri-rust-ts/` — tauri overlay: `tools/preflight/check.mjs` (typecheck + build + test + cargo fmt/clippy/test), `.claude/skills/link/SKILL.md` (tauri dev), `.claude/rules/ui.md`, `.github/workflows/ci.yml` (Node + Cargo)
- [ ] `docs/bootstrap.md` — step-by-step manual copy + edit instructions; include "what to do first after install" guidance
- [ ] `docs/migration.md` — instructions for migrating an existing project that already has `.claude/` content (the md-manager case for PRs 4-6)
- [ ] Verification: follow `bootstrap.md` from scratch in an empty dir for each stack; confirm working setup

**PR 4 — md-manager: add config layer (Stage 1 of migration, non-breaking)**
- [ ] Install flow plugin: `/plugin marketplace add by-dev-tools/flow && /plugin install flow` (in this case marketplace is already known via settings.json; just enable)
- [ ] Add `md-manager/flow.config.json` declaring md-manager's specific slots (stack: web, target_branch: main, branch_prefix: claude, paths, preflight command, safety paths, modes)
- [ ] Add a note to md-manager's `CLAUDE.md` referencing the plugin
- [ ] Existing local skills remain in place — no deletion. Belt and suspenders
- [ ] Verify both can coexist: `/staff-review` (local) and `/flow:staff-review` (plugin) both work. Confirm no namespace collisions (plugins auto-namespace; should be clean)
- [ ] Smoke test: trigger `/flow:staff-review` on the diff for this PR itself

**PR 5 — md-manager: end-to-end validation (small dogfood PR)**
- [ ] Pick a small, real change (typo fix or tiny refactor) and ship it using only plugin skills (`/flow:staff-review`, `/flow:ship`) — not local duplicates
- [ ] Capture any plugin bugs / friction in `dev-docs/feedback.md` in the flow repo (NOT in md-manager — feedback about the plugin belongs in the plugin's own dev-docs)
- [ ] Fix bugs in `by-dev-tools/flow` as follow-up PRs before continuing to PR 6
- [ ] Output: a real shipped PR in md-manager driven by the plugin, validating the abstraction

**PR 6 — md-manager: remove local duplicates (Stage 2 of migration, breaking)**
- [ ] Delete from md-manager:
  - `.claude/skills/{simplify,staff-review,security-review,accessibility-review,ship,ship-spike}/`
  - `.claude/rules/{general,plan-discipline,documentation,exploration}.md`
  - `.claude/agents/{planner,docs}.md`
  - Portable bits of `tools/` (memory tooling)
- [ ] Keep md-manager-shaped files: `.claude/rules/safety.md` (project paths), `ui.md` (project tokens), `dev-server.md`, `.claude/skills/link/` (project dev server), `core-docs/*` (project content), `tools/preflight/check.mjs` (wired to md-manager commands)
- [ ] Update md-manager's `CLAUDE.md` to remove now-redundant references; point all workflow/skill questions at the plugin
- [ ] Run the full plugin loop on this PR itself end-to-end to validate
- [ ] Verification: md-manager has zero `.claude/skills/`, `.claude/agents/`, or generic `.claude/rules/` files left
- [ ] **Retire the umbrella**: move this "Flow plugin extraction" Active Work Item from `core-docs/plan.md` to `core-docs/history.md` as "Flow plugin extraction complete." Plugin work goes solely to `by-dev-tools/flow/dev-docs/` from here on

**Confidence verdicts (per assumption):**

**Assumption:** llm-auditor's existing content (skills, agents, scripts, evals, DISAGREE.md) restructures cleanly from flat root into `plugins/flow/*` without behavior change.
**Confidence:** HIGH
**Why:** It's a file-move + manifest-rename operation. All references are within the plugin; no external consumers depend on path structure.
**If it flips:** Discover during PR 1 that some skill references hardcode a root-relative path. Fix the reference; the file move stands. Surface at Present.

**Assumption:** `/simplify` is a Claude Code bundled native skill (not something flow should ship).
**Confidence:** HIGH
**Why:** Verified during prior planning session against Anthropic's skill docs; user explicitly confirmed.
**If it flips:** Flow's `/staff-review` SKILL.md and workflow.md would need adjustment. Single-source correction; not architectural.

**Assumption:** One repo with marketplace + plugin + template subdirs is the right shape per Anthropic's docs.
**Confidence:** HIGH
**Why:** Verified against `code.claude.com/docs/en/plugin-marketplaces`; matches `anthropics/claude-plugins-official` precedent and forge's pattern.
**If it flips:** Split into two repos (template repo + plugin repo). Not catastrophic; one extra repo to maintain.

**Assumption:** `flow.config.json` schema captures all per-project variance without bloat.
**Confidence:** MEDIUM
**Why:** Most variance fits clean slots (paths, branch, commands, mode flags, lenses). Some edge cases (e.g., Designer's Build/Harden release cadence) might not — those are meant to live outside the per-PR plugin, but boundary-drawing might surface gaps in PR 2.
**If it flips:** Add a second config file or escape hatch (`.claude/workflow-extensions.md` for narrative project-specific guidance the plugin treats as standing context). Surface at PR 2 review.

**Assumption:** md-manager's current skill behaviors can be reproduced 1:1 by parameterized plugin skills.
**Confidence:** MEDIUM
**Why:** Most behaviors are project-agnostic; a few (e.g., `/staff-review`'s push-further lens reading `design-language.md`) depend on file presence + structure. flow.config.json should cover this; won't know for sure until PR 5 dogfood.
**If it flips:** Diff-and-fix in `by-dev-tools/flow` follow-up PRs; defer PR 6 (duplicate removal) until parity is achieved. PRs 4 and 5 are explicitly designed to surface this before any deletion.

**Assumption:** Dynamic context injection (`` !`<command>` ``) reliably handles missing project files via shell fallback (`|| echo "(no foo.md)"`).
**Confidence:** HIGH
**Why:** Documented behavior per Anthropic skills docs; standard shell idiom.
**If it flips:** Plugin breaks in projects without `core-docs/*`. Mitigation: PR 2 verification step runs against an empty project.

**Risks / open questions:**
- **Plugin install/update friction.** `/plugin marketplace update` is on the user; mitigation: version flow (start at 1.0.0), pin flow version in md-manager's `~/.claude/settings.json` during PRs 4-6 to avoid mid-migration plugin updates.
- **Namespace collisions during PR 4 (coexistence).** Local `/staff-review` vs plugin `/flow:staff-review`. Plugin skills are namespaced (`flow:*`) so no actual collision; verify in PR 4.
- **`memory/check.mjs` path assumptions.** Need to verify "canonical project path" derivation works when plugin installed at user scope vs consumer at project scope. Test in PR 2.
- **`workflow.md` `@path` import.** Same MEDIUM-confidence question as my prior plan: workflow.md may need to be a one-time copy from flow's template + md-manager overlay, rather than a true import. Surface at PR 4.
- **By-dev-tools/md-manager is the canonical md-manager remote.** All PRs 4-6 target that remote, not `byamron/md-manager`. Confirmed.

**Files touched (anticipated):**

**PR 1** (in `by-dev-tools/flow`):
- `.claude-plugin/marketplace.json` (updated)
- `.claude-plugin/plugin.json` (renamed + version bump)
- `plugins/flow/skills/{audit-completion,audit-plan,critique-plan,log-disagreement}/` (moved from root)
- `plugins/flow/skills/ship/` (new, from md-manager port)
- `plugins/flow/agents/{auditor,plan-critic}.md` (moved from root)
- `plugins/flow/scripts/{extract_session.py,log_disagreement.py,bounding_logic.py}` (moved from root)
- `plugins/flow/evals/` (moved from root)
- `plugins/flow/DISAGREE.md` (moved from root)
- `plugins/flow/docs/workflow.md` (new, port from md-manager)
- `dev-docs/{plan,history,feedback,roadmap}.md` (restructure: existing core-docs/ becomes dev-docs/ if not already)
- `README.md` (rewritten)
- `~/.claude/settings.json` (second update: `flow@flow` and marketplace key rename)

**PR 2** (in `by-dev-tools/flow`):
- `plugins/flow/skills/{staff-review,security-review,accessibility-review,ship-spike,workflow-help}/SKILL.md` (new)
- `plugins/flow/agents/{planner,docs,staff-engineer,ux-designer,design-engineer,push-further,uncommon-care}.md` (new)
- `plugins/flow/rules/{general,plan-discipline,documentation,exploration}.md` (new)
- `plugins/flow/tools/memory/check.mjs` (new)
- `plugins/flow/schema/flow.config.schema.json` (new)
- `plugins/flow/hooks/{default-hooks.json,user-prompt-submit-reminder.json}` (new)
- `plugins/flow/docs/workflow.md` (updated — config-slot semantics, flow-internal critique-plan etc.)
- `plugins/flow/skills/ship/SKILL.md` (backfill placeholders)

**PR 3** (in `by-dev-tools/flow`):
- `template/base/*` (Tier 1 + 2 = 11 files)
- `template/stacks/{web,swift,tauri-rust-ts}/*` (~5 files per stack)
- `docs/{bootstrap,migration}.md`

**PR 4** (md-manager):
- `flow.config.json` (new, repo root)
- `CLAUDE.md` (small addition — plugin reference)
- No deletions

**PR 5** (md-manager):
- A small real change (chosen at PR-5-plan time)
- Possibly `~/dev/flow/dev-docs/feedback.md` if friction surfaces

**PR 6** (md-manager):
- Deletions per spec-walk above
- `CLAUDE.md` cleanup
- `core-docs/plan.md` umbrella retired to `core-docs/history.md`

### Workflow unification — PR 2: Port preflight + failure-pattern memory (SUPERSEDED — work absorbed into Flow plugin extraction)

The preflight runner and memory tooling that this item planned to add as md-manager-local become **plugin-owned** instead. `tools/memory/check.mjs` ports as part of Flow extraction PR 2. `tools/preflight/check.mjs` is project-specific by definition (wired to project's typecheck/build/test commands), so it stays in md-manager (added per project needs, not at any specific umbrella PR), but the template ships a generic skeleton per stack (Flow extraction PR 3). `/ship-spike` moves into flow as a workflow skill. Path-validation preflight rule becomes part of flow's `hooks/default-hooks.json` baseline. Memory-entries port from designer is deferred to post-extraction v1.1 since md-manager has zero memory entries today.

Original scope retained below for reference; **do not execute as a standalone PR** — items will be absorbed.

#### (Superseded scope — reference only)

**Goal:** Adapt designer's `tools/preflight/check.mjs` to md-manager's TS-only stack and wire it as the required gate between Execute (step 3) and /simplify (step 6). Implement the `/ship-spike` runtime stubbed in PR 1. Port the relevant failure-pattern memory entries from designer (filtered through PR 1's source-diversity bar before importing).

**Mode:** feature

**Scope (in):**
- `tools/preflight/check.mjs` for md-manager: typecheck + build + test + token-invariant check + manifest check (drop cargo gates entirely; keep TS gates only). Wire as the bundled command referenced by `core-docs/workflow.md` § Preflight.
- Implement `.claude/skills/ship-spike/SKILL.md` runtime — currently a doc/spec; needs to actually orchestrate (read plan, write history entry, commit, push, open labeled PR).
- Port designer's failure-pattern memory entries through PR 1's source-diversity bar:
  - `feedback_verify_tokens.md` — likely passes (markdown app uses tokens too).
  - `feedback_aria_live_for_spec_announcements.md` — needs adaptation; markdown app has no spec-driven announcements yet.
  - `feedback_doc_orphans_after_merge.md` — TypeScript analog (orphan exports after merge).
- Add a preflight rule for "tool inputs that resolve to filesystem paths must be path-validated against an allow-list root" — the rule that would have caught the `tools/memory/check.mjs` finding before the security review did. Filed during PR 1's security review.

**Scope (out):**
- New invariants beyond what designer already has — port, don't extend.
- Designer-side adoption (PR 3 in a separate workspace).

**Spec-walk checkboxes:**
- [ ] `tools/preflight/check.mjs` exists and passes on the current tree
- [ ] Each gate (typecheck, build, test, invariants, manifest) is independently invocable
- [ ] `/ship-spike` skill orchestrates a real spike-mode commit + push + labeled PR (manual smoke test on a throwaway branch)
- [ ] Ported memory entries each meet PR 1's source-diversity bar (recurrence in time + at least one other source)
- [ ] Path-validation preflight rule added; `tools/memory/check.mjs` passes it
- [ ] `core-docs/workflow.md` § Preflight no longer says "if present" — the script is now real

**Confidence verdict:**
- **Preflight script port: HIGH** — designer's is well-trodden; adapting to TS-only is mechanical.
- **`/ship-spike` runtime shape: MEDIUM** — never built one; might need iteration on the smoke test. Risk: discovers the spec is incomplete; surfaces gaps to fold back into PR 1 doc. If it flips: one extra commit on this branch to fix the spec, no architectural change.
- **Memory-entry port through guardrails: MEDIUM** — Designer's entries were written before the source-diversity bar existed; some may not pass on import. If one fails: skip the import (it's not a regression — md-manager has zero memory entries today). If multiple fail: the bar may be too strict; revisit after PR 5 per the 5-PR review baked into PR 1.

**Risks / open questions:**
- The path-validation preflight rule is broader than just `tools/memory/check.mjs` — should it also cover any future `tools/*` script? Likely yes; scope explicitly during PR 2.
- `/ship-spike` smoke test requires creating a throwaway branch + PR + closing it. Choose a benign research question for the smoke (e.g. "does the harness load memory entries from the canonical path?").

**Files touched (anticipated):**
- `tools/preflight/check.mjs` (new)
- `tools/preflight/.gitignore` (probably empty initially)
- `.claude/skills/ship-spike/SKILL.md` (already exists; implementation may add helpers)
- `~/.claude/projects/<canonical>/memory/feedback_*.md` (~3 entries imported)
- `core-docs/workflow.md` (§ Preflight updated to point at real script)

### PR C: Token + component migration (multi-session, iterative — paused for workflow work)

**Goal:** Migrate `src/styles/globals.css` tokens to Mini's `packages/ui/styles/tokens.css`. Migrate components one at a time to Mini primitives + archetypes. Remove duplicate machinery (custom Toast → Mini Toast archetype). Pass the invariant check on `src/`. Flip each component's `status` in `core-docs/component-manifest.json` from `legacy` → `managed` as it migrates.

**Order (rough, sequenced for incremental review):**
1. **Token name-collision audit first** (highest-priority prerequisite from `roadmap.md` "From PR A staff review"). Build the project; grep `dist/assets/*.css` for each duplicated token name; document which value wins. Decide intentional re-bindings explicitly. Output: a token-migration plan that names every collision.
2. **`--accent-8` contrast matrix** against every page-tint hue the color rail produces. Required before the first component uses `var(--accent-9)` for focus rings or links. Output: contrast pass/fail per hue + an axiom amendment if a hue fails.
3. **Tokens migration.** Rewrite `packages/ui/styles/tokens.css` (fork-and-own) with our project values; delete duplicated `--space-*`, `--radius-*`, `--sand-*`, `--type-*` from `globals.css`.
4. **Toast.** Replace `src/components/Toast.tsx` with Mini's Toast archetype, keep our `<ToastProvider>` API surface so callers don't change. Flip manifest entry to `managed`.
5. **Dialogs / popovers.** AttachPopover, AddRepoModal → Mini Popover / Dialog archetypes. Each is its own PR.
6. **Layout primitives.** Sidebar, Editor frame, ColorRail → Mini Box/Stack/Cluster/Sidebar/Container primitives where they fit. Keep contenteditable + FloatingToolbar custom.
7. **Invariant check passes on `src/`** as each component migrates. Final pass: `node tools/invariants/check.mjs src/` clean.

**Constraints carried from PR B:**
- **Both surface postures must continue to work** through PR C. The DevPanel toggle stays. Any archetype migration must support both `mode-floating` and `mode-flat` body classes — do not pick one and remove the other without an explicit user call.
- **`--page-tint` is the accent**, not a fixed Mini accent scale. Components that use `var(--accent-9)` for focus/links must clear contrast against every hue on the color rail.

PR C is **iterative across sessions** — each component migration is its own small PR with its own `/simplify` + `/staff-review` pass.

### Workflow PR b: Heavyweight `/uncommon-care` skill (next workflow item)

**Goal:** Standalone, manual-invoke skill that runs Josh Puckett's full uncommon-care lens (8 dimensions: fidgetability, flow continuity, three-slider problem, hospitality, conceptual range→depth, reduction, metaphor integrity, materiality) against a target surface. Sister to the lightweight push-further lens shipped in PR a but with deeper output and an episodic cadence (not every PR).

**Constraints:**
- **Adapt, don't vendor** (FB-0030). Designer has `~/dev/designer/.claude/skills/uncommon-care/SKILL.md` — re-write for md-manager's context, don't copy verbatim. Drop references to Designer-specific docs (`tensions.md`, `mini-gaps.md`, `decisions.md`); map outputs to md-manager's surfaces (`roadmap.md § Exploration`, `pattern-log.md`).
- Output routes to `roadmap.md § Exploration` (using the same `Surfaces when:` format the push-further lens uses), not a separate ledger.
- Manual-invoke only (`user_invocable: true`); not auto-loaded by `/staff-review` or `/ship`.

**Out of scope:** changes to the lightweight push-further lens — PR a is its baseline.

### PR C / Step 2: `--accent-8` contrast matrix (queued — investigation, ~1 session)

**Goal:** Verify that `var(--accent-8)` (Radix indigo-8 = `#8da4ef`) clears ≥3:1 contrast against every page-tint hue the color rail produces. Required before any component starts using `var(--accent-8)` or `var(--accent-9)` for focus rings, links, or selected state. Output: a contrast pass/fail table per hue + an axiom amendment if any hue fails.

**Branch:** `pr-c-accent-contrast` (off `main`).

**Scope: docs-only.** No code changes. Output is an entry in `core-docs/token-migration.md` (or its own doc — decide at plan time).

**Implementation steps:**
- [ ] Enumerate the color-rail hue space (the HSL gradient + the 8 preset swatches) from `src/components/ColorRail.tsx`.
- [ ] For each hue, compute the contrast ratio between `--accent-8` (indigo-8) and the corresponding `--page-tint` value.
- [ ] Flag any hue where contrast < 3:1 (WCAG AA for UI components).
- [ ] If any fail: propose a fix. Options include (a) using `--accent-9` instead, (b) re-binding accent to a different scale for that hue range, (c) adding axiom #10 (focus style) amendment that names the workaround.
- [ ] Update `core-docs/token-migration.md` (or new doc) with the matrix + decision.

**Risks / open questions:**
- **HSL gradient is continuous, not a finite set.** Sampling decision: test the 8 presets + a 16-step sweep of the gradient (24 total). Confirm at plan time.
- **Indigo-8 may fail on dark page tints.** If so, the resolution affects axiom #10 (focus style) and may force a change to the design-language `--accent-8`-reservation language.

### Template for a work item

```
### [Feature / Work Item Title]

**Goal:** [1–3 sentences in user terms.]

**UX goals:**
- [Desired experience bullet]
- [Desired experience bullet]

**Implementation steps:**
- [ ] [Step description]
- [ ] [Step description]
- [ ] Update history.md + plan.md as part of /ship

**Risks / open questions:**
- [Anything that might block or surprise]
```

---

## Post-extraction roadmap (flow v1.x+)

After PR 6 retires the Flow plugin extraction umbrella and md-manager is a clean consumer of flow, the following layered enhancements ship as separate PR series in `by-dev-tools/flow`. **None of these are in the extraction umbrella's scope** — they're future work. Captured here as one-liner breadcrumbs with cross-references to the detailed design notes in `core-docs/handoffs/`.

Each version is small enough to ship in 1-2 PRs. They serialize (broadly) but can interleave with other priorities. Detailed design rationale lives in the three handoff docs noted below; this section is the index.

### v1.1 — Autonomous routines + daily cadence

- `/flow:plan-next` skill: drafts per-item plan from `core-docs/roadmap.json`. /goal-driven with transcript-explicit completion conditions + turn-budget clause.
- `/flow:impl-approved` skill: /goal-driven implementation against plan's success_criteria. RESUME/FRESH state machine in prompt for cap-hit recovery.
- `/flow:review-pending`, `/flow:approve`, `/flow:redirect` skills (all `disable-model-invocation: true`). Auto-detect spec/plan/impl PR type from labels.
- Narrows "Claude never merges" rule to "Claude never merges AUTONOMOUSLY" — user-typed approval skill is allowed.
- 2-revision cap on plan and impl redirects.
- Scope-expansion 5 mechanical checks (mechanical not directional, same surface, no new spec-walk, ≤50 LOC or 20%, not safety-critical) before in-lane absorption.
- Outcomes-grader composition with existing `/flow:audit-completion` (fresh context, plan success_criteria + diff verbatim).
- Hooks: `PreToolUse: Bash` on `gh pr merge` allowlist; `PreToolUse: Edit|Write` outside `files_touched` scope-check; `Stop` hook for preflight enforcement.
- Standardized agent-PR template at `.github/CLAUDE_PR_TEMPLATE.md` (Devin pattern) with per-file confidence labels.
- Dispatch + Remote Control integration: daily cadence with scheduled Dispatch firing `/flow:plan-next` overnight; mobile approval triggers `/flow:impl-approved` during workday; evening PR review on laptop.
- Memory-entry port from designer (deferred from prior PR 2) lands here once autonomous routines start writing memory.

### v1.2 — JTBD/spec substrate (split into 2 PRs)

See `core-docs/handoffs/spec-and-intake-design-2026-05-23.md` for full design.

**v1.2a** — JTBD schema in `spec.md`; plan-template references JTBDs; design-language gains "Craft criteria" section; `/flow:critique-plan` + `/flow:audit-plan` enforce JTBD checks on UI plans; `/flow:spec` Mode B (autonomous spec generation from intake); intake conventions (3 surfaces: `/flow:intake` skill, free-form `core-docs/intake.md`, roadmap.md fallback); night-run wired to process intake before planning; spec PRs with auto-detect labels (`spec`+`interactive`/`inferred`/`intake-direct`).

**v1.2b** — `/flow:spec` Mode A (interactive interview with `AskUserQuestion` JTBD probe, ~5 min); `/flow:intake` skill (90-second guided 4-5 question capture, writes to `core-docs/intake/<name>.md`); `/flow:approve` auto-detect for spec PRs; interactive Mode A's auto-merge cycle (one user confirmation → branch + commit + push + PR + auto-approve).

Backfill policy for existing md-manager features: hybrid (next-5-touched + 6-month deadline for full JTBD coverage).

### v1.3 — Plan visuals (HTML-first)

See `core-docs/handoffs/visuals-design-2026-05-23.md` for full design.

Plan-template adds `visuals: { tier, artifacts[], rationale }`. Supports Tiers 0-3 (text, ASCII/Mermaid, low-fi HTML, mid-fi HTML committed under `core-docs/plans/<id>/visuals/`). `/flow:plan-next` prompts for tier on `ui_surface: true` items; `/flow:critique-plan` REDIRECTs tier=0 without justification on UI items. Hook on plan-PR-open verifies declared artifact paths exist. Figma deliberately omitted as default — escape hatch only when HTML can't fit (Tier 5).

### v1.4 — Design review lenses (split into 2 PRs)

See `core-docs/handoffs/design-pipeline-2026-05-23.md` for full design.

**v1.4 PR 1** — `/flow:design-review` skill orchestrator + 2 lens-agents: `design-functionality.md` (does design satisfy JTBDs? edge/empty/error states?), `design-craft.md` (visual hierarchy, spacing rhythm, token discipline, motion purpose per design-language). Wired into plan PR review pipeline.

**v1.4 PR 2** — Adds `design-engineering.md` lens (implementable cleanly with existing components?), repurposes existing push-further lens for design context, 2-revision cap on design redirects.

### v1.5 — Impl HTML report (Layer 1 access, JTBD-organized)

Impl routine produces `reports/<feature-id>/index.html` committed alongside code. Organized by JTBD: each section answers "did we satisfy JTBD-N? Here's the proof." `tools/visual/{capture,diff}.mjs` (Playwright + Pixelmatch wrappers); `chrome-verify` subagent runs JTBD-derived test scenarios. Layer 1 access: `gh pr checkout && open reports/<id>/index.html`. Report's structural shape: single-page scrollable for v1.5.

### v1.6 — Claude-driven preview (Layer 2)

`/flow:show-report <pr-number>` and `/flow:show-prototype <id>` skills use Claude in Chrome extension to render local HTML files. One command instead of two.

### v2.0+ — Higher-fidelity tiers, MCP integration, deploy previews

- Tier 4-5 plan visuals (interactive HTML prototypes, optional Figma frames).
- Subframe MCP + Pencil MCP integration: routines generate higher-fidelity HTML candidates from design-language tokens.
- Figma MCP integration: plan YAML supports `visuals.figma_frame_url`; design lenses can read Figma frames.
- Deploy previews (Layer 3): optional Vercel/Netlify per-PR integration via `flow.config.json` `deploy_previews: { provider: vercel | netlify }`. Report cover includes deployed URL when configured.
- Optional `/flow:init --stack=<web|swift|tauri-rust-ts>` skill: one-command bootstrap after plugin install (vs the manual `cp -r` from PR 3's `docs/bootstrap.md`).
- Multi-screen HTML report structure (vs v1.5's single-page) if external sharing becomes a use case.
- Live iframe embed in HTML report (requires Layer 3 deploy previews).

---

## Recently Completed

_(Last 3–5 items. Older items live in `history.md`.)_

- **Vite 5.4 → 8.0.13 dep bump (PR #12, branch `dependabot/npm_and_yarn/multi-46822222ac`)** — Dependabot security PR. Bumps `vite` 3 majors and `@vitejs/plugin-react` to ^6.0.2; removes direct `esbuild` (now transitive at a fixed version). Closes two open Dependabot advisories. Doc-drift fix bundled in same PR (CLAUDE.md + spec.md "Vite 5" → "Vite 8"). Locally smoke-tested: typecheck/build/test clean, `vite dev` boots in 100 ms with no warnings. No app code changed. 2026-05-17.
- **Color-rail portfolio-derived presets (PR #18, merged)** — Visible product change: 5 brand-aligned presets (Sand/Bone/Blush/Sage/Mist) at portfolio-formula t=0.25; default page tint = Sand. /simplify caught the store.tsx default drift (MUST FIX); /staff-review skipped (live-tested + tight scope — captured retroactively as FB-0029 — see push-further-lens PR #19). Dark-mode roadmap entry expanded with the portfolio formula as the concrete starting point. FB-0027 + FB-0028 captured. 2026-05-15.
- **Workflow unification: canonical loop + spike mode + confidence gates + agent self-feedback** — Branch `unify-workflows`, PR #16 (merged). New canonical `core-docs/workflow.md` (11 steps), spike/tiny mode escape hatches, confidence gates with LOW=human-gate, three-layer continuous-improvement model with 5 guardrails on agent memory. FB-0025 (self-audit before /ship for workflow infra) + FB-0026 (surface feedback-loop failure modes proactively) captured. 2026-05-15.
- **PR C Step 3a — `--gray-a*` → `--tint-overlay-*` rename (PR #17, merged)** — CSS-only mechanical rename in `src/styles/globals.css` + 2 doc refs + 1 rule ref. Values unchanged, bundle byte-equivalent. Unblocked PR C Step 3 from the rename side. /simplify NIT applied (comment compression); /staff-review surfaced one FOLLOW-UP routed to roadmap.md (subtle-feedback pattern doc gap). 2026-05-15.
- **PR C Step 1 — Token name-collision audit (PR #15)** — Output: `core-docs/token-migration.md` with the 14-token collision table (4 radius, 4 space, 3 weight, 3 gray-a) + work lists for Step 3a (rename) and Step 3 (migration). Ours wins via cascade for every collision as expected. FB-0022/0023/0024 captured. No code changed. 2026-05-15.
- **GitHub Org transfer + HTTPS remote flip** — `byamron/md-manager` → `by-dev-tools/md-manager` (unlocks merge queue for personal-account repos). Branch protection / Rulesets preserved. Merge queue active with required checks `typecheck` / `build` / `test`. Dependabot security updates + Secret Protection enabled. All worktree remotes on HTTPS so Conductor workspaces can clone/push without SSH keys. FB-0022 captured. 2026-05-14.
- **Workflow: `/critique-plan` inserted into step 3** — Branch `pasted-text-import`. `.claude/rules/plan-discipline.md` reminds the planner to read `spec.md` / `feedback.md` / `design-language.md` before drafting. `core-docs/workflow.md` step 3 now runs `/critique-plan` (assumption-auditor plugin) between plan draft and user approval. Additive — human gate unchanged. 2026-05-14.
- **CI gates + Dependabot (PR #10)** — Three parallel jobs (typecheck/build/test) on `pull_request` and `merge_group` events; workflow-level `permissions: { contents: read }`. Dependabot configured for npm with version-updates suppressed. FB-0020, FB-0021 captured. 2026-05-14.
- **Mini design language amended (PR B, #9)** — Branch `mini-elicit`, commits `97ff141..ship`. Explicit Axioms section answers all 10 Mini axioms; surface-posture flagged as an open axiom (both floating and flat ship for dogfooding). Component manifest, pattern-log, generation-log seeded. CLAUDE.md Mini section appended. FB-0018, FB-0019 captured. No code changed. 2026-05-14.
- **Mini design system installed (PR A)** — Branch `mini-install`, commits `0d17846..[ship]`. Primitives, archetypes, stylesheets, 6 skills, invariants, templates landed in `packages/ui/` at SHA `83df0b2` (Designer parity). 12 Radix peer deps installed. Stylesheets wired in `main.tsx`; HTML root `class="light-theme" data-accent="indigo"`. No app component migrated. SAFETY: `scripts/sync-mini.sh` snapshots+restores project skills around Mini's destructive `rsync --delete`. FB-0016, FB-0017 captured. 2026-05-14.
- **Sidebar hanging-icon nav redesign + section-spacing dev knob** — PR #6 (`3f5564a`). Replaced SourceRow with NavSection/Collapse/NavRow. Counts now on collapsed sections. Drafts grouped under synthetic folder. DevPanel renamed "Sidebar sans" → "Sidebar mono"; dropped inert File icons toggle + Tree layout select. 2026-05-13.
- **Design-rule feedback synthesis FB-0010..FB-0015** — PR #5 (`8bede71`). Captured design rules from the sidebar/editor redesign work. 2026-05-13.
- **Slices A + B of PR #2 staff-review triage** — Safety bundle (drafts, XSS, native dialogs, link wiring), editor performance + a11y + vitest, plus staff-review and ship-pass review fixes. Doctrine: polished features, expand scope not quality (FB-0007). PR #2, branch `address-agentation-comments`. 2026-05-13.

## Backlog

Quick captures that haven't been promoted to roadmap.md yet. Promote when an idea sharpens or gets picked up.

- Decide on persistence model (localStorage / IndexedDB / FSA API)
- Decide on repo-sync model (local FS watcher vs GitHub API vs both)
- Search across drafts and repo files
- Dark mode (or explicit decision to skip for v1)
- Tags / frontmatter
- Keyboard-shortcut help overlay (`?`)
- Export / share view
