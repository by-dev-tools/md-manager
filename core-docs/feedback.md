# Feedback Log

User feedback synthesized into actionable guidance. When the user gives feedback — corrections, preferences, reactions, direction changes — the relevant insight is captured here so it shapes all future work.

This is not a transcript. Each entry distills feedback into a rule or preference that applies going forward.

---

## How to Write an Entry

```
### FB-XXXX: [Short summary of the feedback]
**Date:** YYYY-MM-DD
**Source:** user correction | user preference | user direction | review feedback

**What was said:** Brief, factual summary of the feedback.

**Synthesized rule:** The actionable takeaway — what to do differently going forward.

**Applies to:** [areas this affects: ux, code, architecture, workflow, etc.]
```

### Numbering
Increment from the last entry. Use `FB-0001`, `FB-0002`, etc.

### Source types
- **user correction** — user fixed something you did wrong
- **user preference** — user expressed a stylistic or process preference
- **user direction** — user set strategic direction or priorities
- **review feedback** — issues found during code/design review

---

## Entries

### FB-0033: Don't skip /critique-plan or /simplify, even on docs-only diffs
**Date:** 2026-05-25
**Source:** user correction (user asked "did PR 23 go through the review process from workflow.md?" — surfacing that both steps had been skipped during PR 4 of the flow plugin migration)

**What was said:** PR #23 shipped via `/flow:ship` without `/critique-plan` (step 2 sub-step) or `/simplify` (step 6) running. The skip was implicit — neither this session nor the sibling explicitly justified it; the plausible defense ("docs+config diff has nothing for these to surface") never appeared in writing. Retro-running both after the PR opened produced a REDIRECT verdict on the plan (missing "base is current with main" load-bearing assumption — root cause of the stale-base BLOCKER that `/flow:staff-review` burned 4 lens spawns to discover) and a NIT-ONLY verdict on the diff (4 small polish items, 3 landed as a follow-up commit). Both findings were real, not theater.

**Synthesized rule:** Run `/critique-plan` and `/simplify` (or their `/flow:*` equivalents) per the canonical 11-step loop on every PR, including docs-only. The minute cost of running them is lower than the hours cost of catching what they would have caught downstream. Specifically:

- **`/critique-plan` between Plan and User Approval (step 2).** Even for a plan the agent feels confident about. The critic catches missing load-bearing assumptions the planner is too close to see — in PR 4's case, the base-currency assumption that staff-review later spent 4 lens spawns to surface.
- **`/simplify` between Commit and `/staff-review` (step 6).** Even for docs-only diffs. The pass surfaces cross-doc duplications, terminology drift, and verbose-but-legal artifacts (`$comment-` values, paraphrased rules) before staff-review has to.

Two anti-patterns to watch for: (a) "this diff is too thin for `/simplify` to find anything" — the bar isn't whether the pass *finds* something, it's whether running it is cheaper than skipping it; (b) "I'll just have staff-review catch it" — staff-review is for architecture and craft, not for code-quality cleanup that `/simplify` is purpose-built for.

If a step is genuinely being skipped for a defensible reason (e.g., `spike` mode for `/simplify` per `general.md`), declare the skip explicitly in the plan's Mode / Scope section. Implicit skips create precedent that grows into "small enough to skip" over time.

**Applies to:** workflow discipline; every PR going forward, including docs-only and config-only PRs.

### FB-0032: Security regression tests must assert on what would actually leak, not on a proxy for it
**Date:** 2026-05-25
**Source:** review feedback (synthesized from flow's `dev-docs/feedback.md` FB-0004, surfaced during PR-3 umbrella close-out)

**What was said:** Flow's PR 3 Phase-7 engineer-lens caught that its cwd-constraint security regression test asserted `"/etc/hosts" not in result.stdout` — an assertion that passes trivially because a real path-traversal leak prints the *contents* of `/etc/hosts` (loopback addresses like `127.0.0.1` / `::1`), not the path string. A regression that drops the cwd check but doesn't print the path would pass the test silently. The sibling dotdot-traversal test in the same fixture got it right by asserting `"127.0.0.1" not in stdout and "::1" not in stdout` — content sentinels, not path proxies. Both tests were strengthened in flow's Phase-7 fix commit to use content sentinels uniformly.

**Synthesized rule:** When writing any security test in md-manager, **identify what a real leak/breach would actually output, then assert on THAT**. The path/URL string is a proxy: if the implementation silently stops blocking the breach but doesn't echo the original input verbatim (because it encodes / normalizes / wraps it), the proxy-based assertion still passes. Current-surface traps:

- **URL sanitization** (`src/lib/markdown.test.ts`, `isSafeUrl`): `"javascript:" not in result` passes vacuously against html-encoded `javascript&#58;...`, case-normalized `JAVASCRIPT:`, or `data:` wrappers. Assert on what a real XSS would *execute* (JSDOM render + marker-flag check) or on a normalized-payload fingerprint, not the raw input.
- **Dangerous HTML escapes**: don't assert `"<script>" not in output` — parse output as DOM, assert no `tagName === "SCRIPT"` in the subtree, or that an injected `window.__pwned` marker doesn't survive render.

Future scope (when surfaces materialize): repo-sync path validation should mirror flow's pattern — assert on loopback addresses, private-key fingerprints (`-----BEGIN`), or `.env` content sentinels, not on the path string itself.

**The verification ritual:** write a deliberately-broken implementation, run the test, verify it FAILS. If a known-broken implementation passes the test, the assert is vacuous. This is the only reliable check on assert-on-proxy bugs — they pass every code review (the assertion *looks* correct) and every CI run (the implementation isn't broken yet).

**Applies to:** `src/lib/markdown.test.ts`, any future security/sanitization tests, any test where the boundary being defended is between trusted and untrusted content.

### FB-0031: When building workflow infrastructure, dogfood every loop step that *can* be run — don't skip because the named skill isn't built yet
**Date:** 2026-05-24
**Source:** review feedback (synthesized from flow plugin extraction; flow's `dev-docs/feedback.md` FB-0001)

**What was said:** While shipping flow plugin PR 1 (which built the workflow infrastructure itself), the assistant initially treated "the plugin's own `/simplify` and `/staff-review` don't exist yet" as a license to skip those loop steps and rely solely on a manual cold-read (the bootstrap exception). The flow user pushed back: "even though all the skills may not be officially built out yet, follow the prompts from the skills in workflow.md to review the PR, taking it through all the stages of the intended workflow that we are implementing." Spawning 3-4 parallel review-lens Agents with the equivalent of the planned SKILL.md prompts caught 3 BLOCKERs the pre-merge cold-read missed (manifest redundancy, two stale `agents/auditor.md` references in shipped prompts, `eval` vs `sh -c`). All three would have been consumer-visible bugs if shipped.

**Synthesized rule:** When a PR builds workflow infrastructure itself (a new skill, a new lens, a new review pipeline, a new preflight gate — any change to the loop's *machinery* rather than to product surface), **dogfood every loop step that *can* be run by emulating the planned skill's prompt via Agent subagents**, even if the named skill doesn't exist yet. The loop's value is the *steps* (independent review framings, BLOCKER/NIT/FOLLOW-UP triage, source-diversity bar on feedback), not the skill packaging. Concrete pattern: spawn 3-4 parallel review-lens Agents (engineer, push-further, security, plan-critic emulation) with the equivalent of the planned SKILL.md prompts; triage via the same scheme; apply BLOCKER + cheap NIT inline; route FOLLOW-UPs to `plan.md` / `roadmap.md`. **The bootstrap exception (manual cold-read only) is the *fallback* when even manual emulation isn't feasible, not the *default* when emulation is cheap.** Don't pre-empt this rule with "no skill, no review" — that defeats the point of building workflow infrastructure at all.

This generalizes flow's FB-0001 (which was about the flow plugin specifically). It applies to md-manager any time a future PR adds or modifies a `.claude/skills/`, `.claude/agents/`, `.claude/rules/`, `tools/preflight/`, or `tools/memory/` file — including the eventual PR-4-through-PR-6 consumer migration of the flow plugin into md-manager itself.

**Applies to:** workflow-infrastructure PRs (any PR that touches `.claude/skills/`, `.claude/agents/`, `.claude/rules/`, `tools/preflight/`, `tools/memory/`, or `core-docs/workflow.md`); the bootstrap-exception escape clause in `core-docs/workflow.md`; agent self-feedback discipline.

### FB-0030: Adapt skills from sister repos, don't vendor them
**Date:** 2026-05-15
**Source:** user direction

**What was said:** While planning the heavyweight `/uncommon-care` skill (PR b, deferred), the user said: "I don't want to vendor skills — let's rewrite them specifically for md-manager's product and context." Designer has a `uncommon-care` skill at `~/dev/designer/.claude/skills/uncommon-care/SKILL.md` that ships with a structured `feedback/<date>-<slug>.md` ledger and references Designer-specific docs (`tensions.md`, `mini-gaps.md`, `decisions.md`). Vendoring that into md-manager would drag in conventions that don't apply (md-manager has no `tensions.md`; its equivalent of the feedback ledger is the `roadmap.md § Exploration` section + the `pattern-log.md` Mini contract artifact).

**Synthesized rule:** When importing a skill, agent, or rule pattern from a sister project (Designer, trio, ui-playground, etc.), **adapt it to this project's conventions rather than vendoring it verbatim**. The adaptation should: (a) re-read the source skill's intent and structure, (b) identify the project-specific surfaces it references that don't exist here, (c) map them to this project's equivalents (or remove the references if no equivalent exists), (d) re-test the prompt with this project's context in mind. Vendoring is appropriate only for tightly-versioned upstream infrastructure (e.g., Mini's `packages/ui/`, which uses an explicit re-vendor mechanism via `sync-mini.sh`). For *skills* — which encode workflow assumptions specific to a project's docs and review loops — adapt every time. Captures the brand-cohesion-without-coupling pattern (sister to FB-0028's value-borrowing rule, applied to skills as well as values).

**Applies to:** skill imports, agent imports, workflow rule borrowing across the project family.

### FB-0029: Don't skip a /staff-review lens because a human gave a visual opinion or another lens ran
**Date:** 2026-05-15
**Source:** user correction

**What was said:** Across three consecutive PRs (PR B, PR #17, PR #18), the assistant skipped one or more `/staff-review` lenses with reasoning like "live-tested by the user during iteration," "engineer lens already covered by /simplify," or "the change is tightly scoped, no design surface." The user pushed back directly: "agentic UX designer review should not be replaced by human review — the human can make final craft decisions, but just because they gave their opinion doesn't mean there shouldn't be an AI review." The same logic applies to "another lens ran" — `/simplify` and `/staff-review`'s engineer lens overlap on some surface (code-quality concerns) but cover distinct framings.

**Synthesized rule:** `/staff-review` runs all four lenses (engineer / UX designer / design engineer / push-further) on every PR with substantive diff. **Skip a lens only when it genuinely doesn't apply** — e.g., a backend-only change has no design-engineer or push-further surface; a pure CSS rename has no engineer surface. In those cases, say so explicitly ("lens N/A because X") rather than running an empty agent. **The following are NOT legitimate skip reasons:** "human live-tested" (AI catches what humans miss and vice versa), "scope is tight" (the lens decides what's worth pushing, not the scope), "/simplify already ran" (different framings — code-quality vs architecture vs UX vs craft vs uncommon-care), or "the diff is small" (small diffs still benefit from the four distinct lenses). The push-further lens's `Empty is valid and often correct` escape exists precisely so an honest empty pass beats a fake skip — use it.

**Applies to:** /staff-review invocations, workflow discipline, the loop's non-negotiable steps.

### FB-0028: Borrow values from a sibling repo via formula evaluation, not import
**Date:** 2026-05-15
**Source:** user direction

**What was said:** User asked for the md-manager color rail presets to match the portfolio repo's theme colors "at 25% on the intensity slider." Implementation: read the portfolio's `computeBg` formula from `~/dev/portfolio/src/contexts/ThemeContext.tsx`, evaluate it at `t=0.25` against each accent's base HSL, paste the five resulting HSL strings inline as constants in `src/components/ColorRail.tsx`. The portfolio is not imported, not symlinked, not a dependency — only the formula and the inputs are borrowed, the outputs are baked in.

**Synthesized rule:** When you want cohesion with a sibling repo (shared brand colors, shared spacing rhythm, shared typography choices) without coupling, **evaluate the sibling's formula at a fixed input and paste the result as a constant in the consuming repo**. This gives brand parity without making the consuming repo depend on the sibling's lifecycle — the sibling can update its formula tomorrow and the consumer doesn't break. Document the source trail in a code comment (file path + slider position + formula one-liner) so a future maintainer knows how to re-derive if the sibling's intent changes. Avoid the alternative anti-patterns: importing the sibling's TS (creates a runtime dependency), publishing the values to an npm package (creates versioning friction), or re-typing the values without a source comment (loses the trail).

**Applies to:** sibling-app cohesion, design tokens, shared color/spacing/type values across the family.

### FB-0027: Grep the old literal across the whole repo before declaring a default change done
**Date:** 2026-05-15
**Source:** review feedback

**What was said:** During the color-rail preset change, the new default `--page-tint` was updated in `src/styles/globals.css` and `src/components/ColorRail.tsx`, but `src/store.tsx` line 41 still held the old hardcoded value as the store's initial state. Since the store overrides the CSS default at runtime via `document.documentElement.style.setProperty`, new users would have seen the old peach tint until they picked a preset — the visible default would not have matched the documented default. /simplify caught it; a pre-commit `grep -r 'hsl(30, 60%, 88%)'` would have caught it sooner.

**Synthesized rule:** When changing a "default" value that conceptually has a single canonical answer but mechanically lives in multiple surfaces — CSS custom property, TypeScript store/state initializers, component-level constants, manifest entries — **grep the old literal across the entire repo before declaring the change done**. Specifically for md-manager's page-tint family: `globals.css` (`--page-tint` CSS var), `store.tsx` (runtime override on app init), `ColorRail.tsx` (preset list). For any token like this, the grep pass takes ~5 seconds and catches drift that a single-file edit would miss. Generalizes to any value that conceptually has one source of truth but is duplicated across persistence/state/UI layers.

**Applies to:** any default-value change, refactor of token-shaped constants, anything where "the canonical value" is duplicated across the layers (CSS / TS state / component literals).

### FB-0026: Surface failure modes proactively when proposing a feedback-loop primitive
**Date:** 2026-05-15
**Source:** user direction

**What was said:** While building agent self-feedback memory into the workflow, the user asked: "are there any checks that we should add with the self-feedback additions to prevent compounding ai slop? does this relate to the danger of the concept of ai training on its own data and getting further and further from reality over time?" The assistant had proposed the primitive without surfacing the model-collapse / process-ossification risk; the user had to ask. The right shape would have been to flag the risk and propose mitigations as part of the original proposal, not in response to a follow-up.

**Synthesized rule:** When proposing a primitive that creates a feedback loop (memory entries, learned heuristics, auto-promoted rules, anything where today's output shapes tomorrow's input), surface the failure mode and propose guardrails as part of the original proposal — don't wait for the user to ask. The rule generalizes beyond memory: any compounding mechanism (auto-applied lint suggestions from past PRs, learned formatting preferences, accumulated codegen templates) carries the same risk shape. The questions to pre-answer: (1) how does this compound? (2) what's the failure direction if it compounds badly? (3) what bounds it? The answer doesn't need to be perfect mitigations on day one — just naming the failure mode earns the user's trust that the primitive isn't naive.

**Applies to:** workflow design, memory/feedback systems, any auto-learning mechanism, scoping discussions.

### FB-0025: Self-audit pass on workflow-infra changes before /ship
**Date:** 2026-05-15
**Source:** user direction

**What was said:** Before shipping the workflow-unification PR, the user said: "review PR1 for any logical errors or oversights, then we will ship it and start PR 2." The audit caught 4 BLOCKERs (numbering inconsistency between workflow.md and CLAUDE.md, memory script defaulting to wrong harness path on Conductor workspaces, preflight script referenced but doesn't exist yet, off-by-one in plan-discipline.md) and 6 NITs that would have shipped if /ship had run directly. The audit took ~10 minutes; recovering from a stale or incoherent workflow rule across both repos would have taken much longer.

**Synthesized rule:** Workflow-infrastructure changes (edits to `core-docs/workflow.md`, `CLAUDE.md`, `.claude/rules/*`, `.claude/skills/*`, `tools/preflight/*`, `tools/memory/*`) get an explicit self-audit pass before /ship — distinct from /staff-review. The audit looks specifically for: cross-file numbering / step-reference consistency, dead references to files that don't exist yet, internal contradictions across CLAUDE.md / workflow.md / rules / skills, brittle path assumptions, "aspirational" enforcement claims that no actual code enforces. The asymmetric cost justifies the explicit gate: a stale workflow rule taxes every future PR; a 10-minute audit prevents that. Add this as a step in /ship for workflow-infra PRs, OR codify it as an anti-pattern reminder ("don't ship workflow infra without a coherence pass").

**Specific cross-file checks worth running explicitly:** When a workflow concept changes (a new mode, a new step number, a renamed primitive, a new required field), grep ALL of these files for references that may have gone stale: `CLAUDE.md`, `core-docs/workflow.md`, every `.claude/rules/*.md`, every `.claude/skills/*/SKILL.md`. A coherence audit on PR 1 caught that `.claude/rules/general.md` was still saying "3–5 line plan" after the new workflow required spec-walk + confidence verdict — a contradiction that would have actively misled every future session. The auto-loading rule files are the easiest to miss and the most damaging when stale.

**Applies to:** workflow, scoping decisions, /ship pipeline for infra PRs.

### FB-0024: Audits read source files end-to-end, not just grep
**Date:** 2026-05-15
**Source:** review feedback

**What was said:** During the PR C token name-collision audit, the assistant computed the intersection of token names between `src/styles/globals.css` and `packages/ui/styles/tokens.css` using `grep --oE '--[a-zA-Z0-9_-]+:'` and produced a collision count of 11. The `/simplify` quality reviewer caught a miss: `--gray-a5/6/7` collides with Mini's Radix-imported alpha-gray scale (declared by `@radix-ui/colors/gray-alpha.css`, which `tokens.css` `@import`s at line 35). A pure grep against `tokens.css` doesn't surface the imported declarations; the true Mini token surface includes transitive imports. Correct count was 14.

**Synthesized rule:** For audit-style work that claims completeness ("the intersection is N tokens", "this is every dependency", "all consumers of X are…"), don't rely solely on grep against immediate-file contents. Open the file end-to-end, follow `@import` / `import` / `require` / `include` directives one level (more if needed) to capture the transitive surface, and re-validate the claim against the union. Verify the audit against built artifacts (e.g., `dist/assets/*.css` after `npm run build`) when bundling exists — the bundle is the ground truth for "what actually ships." Cost: a few extra grep / Read calls per audit. Saves the embarrassing follow-up commit when a reviewer catches the miss.

**Applies to:** audits, codebase surveys, intersection / union claims, refactor scoping.

### FB-0023: Separate naming changes from value migrations — each its own PR
**Date:** 2026-05-15
**Source:** review feedback

**What was said:** The PR C audit initially bundled a `--gray-a*` → `--tint-overlay-*` rename into the Step 3 tokens-migration work list. `/simplify` (efficiency agent) flagged it as scope creep: a semantic rename touching every usage in `globals.css` is a different concern from mechanical duplicate-removal + value rebinding. Reviewing both in one diff conflates "did the rename touch all the right call sites?" with "did the duplicate removal preserve every token value?" Resolution: split into PR C Step 3a (rename only, lands first) and PR C Step 3 (migration, lands after).

**Synthesized rule:** When a refactor combines (a) renaming an identifier across many call sites with (b) changing the implementation / values / structure of related identifiers, split into separate PRs. The rename PR has a single question for reviewers ("did every reference get updated and nothing else?"); the migration PR has a different single question ("did the values / behavior change as documented?"). Bundled, both questions land on every line of the diff and review takes 2-3× longer. Order: rename first, migration second — the rename is mechanical, fast to land, and unblocks the migration's review by reducing its surface.

**Applies to:** refactors, migrations, token / API renames, anything that mixes mechanical-renaming with semantic-change.

### FB-0022: HTTPS over SSH for git remotes in this project (agent-heavy workflow)
**Date:** 2026-05-14
**Source:** user direction

**What was said:** During the GitHub org transfer, switching the remote from `git@github.com:by-dev-tools/md-manager.git` to `https://github.com/by-dev-tools/md-manager.git` was driven by a concrete failure: Conductor workspace creation couldn't `git fetch` because the workspace had no SSH key. The agent-heavy workflow spawns ephemeral workspaces frequently; provisioning SSH keys per environment is friction. HTTPS via `gh auth` (token in Keychain) works from any environment that has `gh` installed and authenticated, which is the standard tooling baseline. Security comparison: HTTPS + token and SSH + key are equivalent on every dimension that matters (both keychain-stored, both TLS-or-SSH transport-encrypted, both revocable in GitHub UI). The "SSH is more secure" intuition is a holdover from the password-over-HTTPS era and doesn't apply to modern token auth.

**Synthesized rule:** Default to HTTPS remotes (`https://github.com/...`) over SSH (`git@github.com:...`) for repos in this project. SSH may still be appropriate for non-GitHub remotes or when an organization-wide policy requires it; for this project (solo, public, agent-heavy, GitHub-only), HTTPS is the friction-minimizing default and incurs no security tax. The decision lives in this entry; verify any new clone, worktree, or workspace defaults to HTTPS.

**Applies to:** git remote configuration, workspace setup, environment provisioning.

### FB-0021: Try the automated/operational fix before restructuring the docs
**Date:** 2026-05-14
**Source:** user direction

**What was said:** Discussing the parallel-worktree merge-conflict pain (every PR touches the same shared docs — `history.md`, `feedback.md`, `plan.md` — so concurrent PRs serialize on conflicts even when their `src/` work doesn't overlap). The assistant proposed a structural fix (split append-only docs into per-entry files) alongside an automation fix (GitHub merge queue). User asked: "do you recommend the docs restructure over using merge queue? should i worry about creating a ton of files?" The right answer was: do merge queue first, watch what conflicts survive, only restructure docs if the residual pain is real.

**Synthesized rule:** When a workflow pain point has both an automation fix (zero-cost, observable, reversible) and a structural fix (real migration cost, changes file layout, harder to undo), do the automation fix first and measure the residual pain before paying for the structural one. The automation fix usually addresses the common case; the structural fix is only worth it if the residual is meaningful after automation. Generalizes: don't refactor docs/code structure to dodge friction that tooling can absorb. Applies to: merge automation before docs sharding, CI gates before manual review checklists, lint rules before convention docs.

**Applies to:** workflow, scoping decisions, friction reduction.

### FB-0020: Commit at each workflow phase boundary; squash on PR close
**Date:** 2026-05-14
**Source:** user direction

**What was said:** User asked whether intermediate commits between workflow phases (Execute → /simplify → /staff-review → /ship) matter for software-engineering best practices, or whether to leave commit timing to agent judgment. Discussion resolved on: commit at every phase boundary that produced changes (skip if no diff), preserve those commits during branch life for review/recovery/blame, then squash-merge on PR close so `main` stays linear (one commit per PR = one logical unit). Branch commits live on the GitHub PR page indefinitely, so the audit trail isn't lost on squash.

**Synthesized rule:** Every pipeline phase (Execute, /simplify, /staff-review, /ship) that produced changes gets its own commit. This is a deterministic rule, not a judgment call — agents should not skip a phase-boundary commit "because the diff is small." Repository default merge strategy is **squash** so `main` reads as one-commit-per-PR. Phase granularity is for branch-life clarity (mid-PR review, recovery, mental phase boundaries) and lives on the PR page after merge; it is intentionally not preserved on `main`. To formalize: add the explicit per-phase commit rule to `core-docs/workflow.md` and a one-paragraph "Merge strategy" note to `CLAUDE.md` (both deferred to a separate small PR — captured in `roadmap.md` Cleanup).

**Applies to:** workflow, git practice, merge configuration.

### FB-0019: Open axioms with explicit resolution criteria are first-class artifacts, not deferred decisions
**Date:** 2026-05-14
**Source:** user direction

**What was said:** During PR B planning, the assistant asked whether to resolve the surface-posture axiom (floating vs flat — Mini's "surface hierarchy depth" axiom forces a 1–4 tier choice during elicitation). The user said: "i still want both in the dev panel - i won't get a feel for this until dogfooding. We should be able to justify both in the design language, acknowledging the differences." This reframed the question — not "decide now or defer" but "the right answer is to keep it open and codify why both ship."

**Synthesized rule:** When upstream tooling (Mini axioms, schema fields, framework conventions) pulls toward closing a question that doesn't yet have a clear answer, the correct move is often a third option: codify the open question as a first-class artifact with explicit resolution criteria. Document both alternatives with their arguments, name the signal(s) that would resolve it (dogfooding pattern, archetype constraint, explicit user call), and treat the open state as the deliberate current answer — not as deferred indecision. Reinforces FB-0005 ("Don't lock open questions shut") with a structural pattern: a doc section, in the affected design system / spec / contract, that names both branches and the resolution criteria.

**Applies to:** design language, spec, contracts, any decision that benefits from dogfooding signal before commitment.

### FB-0018: When a skill can't run as designed, do the work by hand using its templates as the target shape
**Date:** 2026-05-14
**Source:** challenge solved

**What was said:** During PR B, the user asked for amendment mode on `/elicit-design-language`. The skill's amendment mode requires a populated `core-docs/generation-log.md` to read recurring deviations from — but the log doesn't exist yet (it's seeded as part of PR B itself). The skill explicitly bails with "design-language exists but generation-log is empty. No signals to amend." Archaeology mode (the other applicable mode) would discard the existing 1700-line hand-written `design-language.md`, contradicting FB-0016. Neither documented mode worked. The pragmatic resolution was to do the amendment by hand — read the skill's templates (`templates/design-language.md`, `templates/claude-md-mini-section.md`), use them as the target shape, and write the output directly.

**Synthesized rule:** A skill failing its preconditions does not mean the underlying work is impossible or should be skipped. The skill's templates encode the target output shape; copying that shape by hand is a legitimate fallback. Specifically: forcing the skill into a wrong mode (archaeology when amendment is what's wanted) corrupts the output; manually following the skill's procedure produces the right artifact. Capture why the skill couldn't run in `history.md` / `pattern-log.md` so future sessions don't re-discover the same dead end.

**Applies to:** workflow, skill use, .claude/skills/*, brownfield adoption of new tooling.

### FB-0017: Review skills must be model-invocable so /ship can compose them
**Date:** 2026-05-14
**Source:** user correction

**What was said:** When `/staff-review` couldn't be triggered from within the model loop because its SKILL.md set `disable-model-invocation: true`, the user said "should not be user-invoke-only — update this, then run the skill on the changes." `accessibility-review` and `security-review` were already model-invocable; `staff-review`, `ship`, and `link` were not. The mismatch made the documented workflow (where `/ship` composes `/security-review` and `/accessibility-review`, and the standard loop calls `/staff-review` after execution) inconsistent with what was actually wireable.

**Synthesized rule:** Project review skills (anything ending in `-review`) and pipeline skills that compose other skills (`ship`, `staff-review`) must NOT carry `disable-model-invocation: true` in their frontmatter. User-only skills are limited to tools that genuinely should not auto-fire (e.g., destructive operations, side-effecting actions like `link`'s dev-server start). Review and orchestration skills must be callable both by the user and by the model loop. Reaffirms FB-0003 — skills compose with skills via the Skill tool — by ensuring the composition path is mechanically possible.

**Applies to:** workflow, skills, .claude/skills/*/SKILL.md frontmatter.

### FB-0016: Adopting upstream tooling preserves hand-written docs as the starting point, never replaces them
**Date:** 2026-05-14
**Source:** user direction

**What was said:** Asked how to handle the existing `core-docs/design-language.md` (~1700 lines, hand-written, encodes family framing + page-tint rail + surface posture open question + polished-features doctrine + FB-0010..FB-0015 rules) when adopting Mini — whose `/elicit-design-language` skill in archaeology mode would produce its own design-language doc — the user said "I want to preserve the current design-language file as a starting point, but we can do the elicitation interview to supplement it (not replace it, but evolve it)."

**Synthesized rule:** When adopting an upstream tool that wants to generate a project doc (design-language, component-manifest, CLAUDE.md sections, etc.) and a hand-written version already exists, the hand-written doc is the starting point. The tool's output is a *proposal* to merge into ours, never a replacement. The merge protocol: archive the legacy file with a `.legacy.md` suffix, run the tool, manually stitch the legacy doc's narrative content into the tool's output, then verify and delete the `.legacy.md` once the stitch is sound. Applies to PR B (design-language elicitation) and any future Mini skill that proposes new doc shapes.

**Applies to:** workflow, core-docs, mini-adoption.

### FB-0015: Folder open/closed icon swap is the expansion affordance — no chevrons
**Date:** 2026-05-13
**Source:** user correction

**What was said:** A chevron-on-the-left (Conductor-style, replacing the icon when expanded) was prototyped during the sidebar redesign. After trying it the user said "take the chevrons away again, and use medium instead of semibold for the repos." Folder rows now show `FolderIcon` when collapsed and `FolderOpenIcon` when expanded — the icon itself carries the state. Children visibility + the folder-open glyph together communicate expansion; a separate chevron is redundant.

**Synthesized rule:** Default to icon-state-swap (folder vs folder-open, pencil-stable for drafts, repo-icon-stable for repos) over a chevron affordance. Children appearing under the row is the primary cue; the icon swap reinforces it. If a row type doesn't have a natural state-pair icon, prefer text-only with no chevron over adding one. Chevrons re-enter the design only with a strong rationale (e.g. very dense lists where the icon swap is too subtle).

**Applies to:** ux, design-language, sidebar.

### FB-0014: Cursor doesn't auto-focus on doc switch
**Date:** 2026-05-13
**Source:** user direction

**What was said:** "When I enter a file, right now the cursor defaults to being active at the beginning of the file — don't have the cursor be active by default unless I click into the main tab into the content."

**Synthesized rule:** Selecting a doc renders its content but does not focus the editor. The user clicks into the writing surface to start typing. This includes newly-created drafts via `createDraft` — focus is not stolen on creation. The empty-state's "start a new draft" link also creates without focusing. Rationale: the user often switches docs to read, not write; auto-focusing steals the page's scroll and keyboard target. If a draft is created via ⌘N from outside the editor, the user is one click away from typing.

**Applies to:** ux, editor behavior.

### FB-0013: Count next to label; action right-aligned; both visible simultaneously
**Date:** 2026-05-13
**Source:** user correction

**What was said:** "The number of files indicator should be aligned to the label with a small gap rather than right aligned with the plus." Earlier iteration had count and the `+` action occupying the same right-edge slot, swapping on hover (count visible at rest, `+` on hover). The user wanted them both visible at the same time, count hugging the label, `+` anchored at the far right.

**Synthesized rule:** In a sidebar row with both a count indicator and a row-level action, the layout is `[icon] [label] [6px gap] [count] · · auto-space · · [action]`. Count uses `margin-left: 6px`; action uses `margin-left: auto`. They never share a slot or swap on hover. Both are visible when applicable. The count hides when expanded (the children are visible — counting redundant); the action stays.

**Applies to:** ux, sidebar layout, row patterns.

### FB-0012: Empty containers have no expand affordance — just the persistent action
**Date:** 2026-05-13
**Source:** user direction

**What was said:** "Expanding or collapsing a folder with nothing in it changes the height of the folder and everything shifts — this makes no sense. There shouldn't even be an option to expand and collapse when the folder is empty, just add." Plus: "Unattached drafts and repos with files should also have a persistent add button the way you made it for empty repos."

**Synthesized rule:** A container row is collapsible only when it has children. Empty containers render `{icon, label, +action}` — no chevron, no toggle behavior, `cursor: default` on the row body (the `+` keeps its own pointer). The `+` action is **persistent across all states**, not hover-revealed — applies to empty containers AND containers with content. Hover-only affordances are reserved for rare optional actions; primary "add to this section" is too important to hide.

**Applies to:** ux, sidebar, row patterns.

### FB-0011: Drafts render italic + muted to signal "loose / not committed"
**Date:** 2026-05-13
**Source:** user direction

**What was said:** "We need a bit more hierarchy with weight, color, or icon. Especially for differentiating files and drafts from the actual files in the repo (this is the biggest UX issue we're facing right now — drafts aren't actually in the repo)."

**Synthesized rule:** Drafts are rendered italic in `--sand-9` (or `--sand-11` if contrast audit fails on light tints). Files (committed in the repo) are upright. The italic + muted treatment encodes "loose / not committed" at a glance. **Known caveat:** italic collides with markdown's `<em>` rendering when a draft title contains `*emphasized*` text — flagged in `roadmap.md` to revisit (drop italic in favor of color+weight, or pick a distinct token like a leading dot). When this revisit happens, the rule above is replaced; until then italic-muted is canonical for drafts.

**Applies to:** ux, sidebar, design-language.

### FB-0010: Repo layout is files-first, hairline, drafts-after
**Date:** 2026-05-13
**Source:** user direction

**What was said:** "To handle drafts, let's put files first within a repo, then add a hairline divider, then have the drafts tree." And later: "When a repo only has drafts, that hairline divider should still be there."

**Synthesized rule:** Inside an expanded repo:
1. `.repo-files` — the actual file tree, always first.
2. A 1px hairline divider (`--page-tint-edge`, 8px vertical margin) whenever the repo has drafts attached, regardless of whether there are files above.
3. `.repo-drafts` — italic-muted draft rows.

The hairline reads as "below this line is loose, not in the repo," reinforcing FB-0011's visual contract. The previous design had drafts and files as separate collapsible sub-groups inside each repo; that pattern is retired — the divider does the categorization work without the extra chrome.

**Applies to:** ux, sidebar architecture.

### FB-0009: Three-lens staff-review in parallel catches what one lens misses
**Date:** 2026-05-13
**Source:** user direction (staff-review demonstration on PR #2)

**What was said:** The user asked for a multi-perspective review on the PR's full diff. The independent reviews (engineer, UX, design engineer — and as of `push-further-lens`, a fourth push-further lens) running in parallel turned up bug classes none alone would have caught — the engineer found the snapshot/race issues + lifecycle bugs, the UX designer caught the silent-URL-rejection false affordance + keyboard nav holes, the design engineer caught the missing type-scale token. After fixes the user then asked for the final ship-pass (security + a11y) on top.

**Synthesized rule:** Default to the **four-lens** parallel staff-review for any non-trivial workstream — single-lens reviews systematically miss issues outside the reviewer's primary frame. The first three (engineer / UX designer / design engineer) ask "is this good?"; the fourth (push-further) asks "could this go further?" and routes findings to inline-cheap fixes, scoped roadmap entries, or `roadmap.md § Exploration`. Run the four reviews concurrently (one tool message, four `Agent` calls) so each is independent and their findings triangulate. `/ship`'s final-pass security + a11y review is additive, not a replacement.

**Applies to:** workflow, review discipline.

### FB-0008: Wire it for real over flag-it-off when the gap is under a day
**Date:** 2026-05-13
**Source:** user direction (link-button decision during PR #2 triage)

**What was said:** When proposing to defer the half-baked link feature, the user asked "where would the link be hosted? do we want this?" and pushed back: "we either need to ship the functional feature or leave it for now and document it for later. review some of designer's documentation about not shipping half-baked features." Designer's FB-0038 spelled out the inverse: when the wire-it-for-real cost is < 1 day and uses existing primitives, default to wiring. The cost estimate for click-to-navigate + safe URL handling + inline link bubble was ~½ day; the feature landed polished as part of Slice A.

**Synthesized rule:** When a feature is partly working, estimate the wire-it-for-real cost first and default to wiring whenever it's under a day with existing primitives. Hide-behind-a-flag is the exception, used only when the real implementation is multi-day, contract-breaking, or needs design input. Pairs with FB-0007 (no half-baked in prod): combined, they mean *ship working features, hide what's genuinely half-baked, but reach for "wire it" first when the gap between half-baked and shipping is small*.

**Applies to:** scope, release readiness, agent behavior.

### FB-0007: Ship polished, narrow features. Expand scope over time, not quality.
**Date:** 2026-05-13
**Source:** user direction (link-button decision during PR #2 triage)

**What was said:** "We either need to ship the functional feature or leave it for now and document it for later. Review some of Designer's documentation about not shipping half-baked features. This is important documentation for our project — we only want to ship polished features with limited scope. We expand scope over time, not quality." The user wanted this elevated to a top-level project principle, not buried in feedback.md alone.

**Synthesized rule:** A feature ships when it's fully functional, accessible, and polished — or it doesn't ship. Half-implementations get one of two paths: wire it (if cheap, < 1 day, existing primitives) or remove it from the visible surface (if not, with a roadmap entry capturing the deferred work). Visually present but non-functional ("false affordance") is a bug — equivalent to a crash. Documented as § "Quality posture" in CLAUDE.md (project philosophy) plus § "False affordances are a bug" in `design-language.md` (design enforcement). Mirrors Designer's FB-0036 ("no half-baked features in prod") and FB-0038 (wire-vs-defer cost test).

**Applies to:** product principles (canonical), workflow, design enforcement.

### FB-0006: Audit docs against framework best practices, not intuition
**Date:** 2026-05-13
**Source:** user direction

**What was said:** "Review this against Anthropic's best practices for docs. Let's make sure they will be enforced correctly."

**Synthesized rule:** When standing up or revising docs, explicitly audit against the framework's own published best practices (Anthropic's Claude Code docs in this case). Common gotchas the audit caught here: CLAUDE.md needs a Commands section so the model doesn't grep `package.json`; rules without explicit `paths:` frontmatter aren't reliably auto-loaded; the rules-table in CLAUDE.md must match the actual frontmatter of each rule file, or the model trusts contradictory information; uncompliable rules (e.g. "history.md must include commit SHA" when /ship writes the entry before committing) erode trust in the entire rule system.

**Applies to:** workflow, docs, agent infrastructure.

### FB-0005: Don't lock open questions shut by documenting them as decisions
**Date:** 2026-05-13
**Source:** user correction

**What was said:** "I haven't decided if we want to do all flat vs flat + floating, and we will likely implement Mini shortly — don't make hard decisions on these."

**Synthesized rule:** When framing divergences between sister apps (or anywhere documenting product or design decisions), distinguish **confirmed divergences** from **open questions**. Use explicit "Status: undecided" language for open questions and route them to plan.md / roadmap.md so they aren't accidentally closed by future sessions. Default to "current behavior" framing, not "committed choice" framing, when the user hasn't explicitly committed.

**Applies to:** docs, design-language, workflow.

### FB-0004: Sister-app framing — shared DNA, distinct personality, open to divergence
**Date:** 2026-05-13
**Source:** user direction

**What was said:** "We are a sister app with Designer and share DNA of the design language, but that shouldn't limit creating new patterns if there is a good rationalization. They are sister apps, not copies. There should be some unique personality and variation, but they should be cohesive."

**Synthesized rule:** md-manager and Designer are siblings, not clones. New divergent patterns are welcome **with rationalization** — log the reasoning in history.md. The page tint color rail is the canonical example of intentional divergence from Designer's monochrome policy. Don't reinvent foundations (radius scale, spacing rhythm, type roles, sand palette, Geist) without an axiom-style entry. Cross-check Designer before committing to a new pattern that could benefit both apps.

**Applies to:** design-language, ux, architecture.

### FB-0003: Skills should compose with skills via the Skill tool, not embed each other's prompts
**Date:** 2026-05-13
**Source:** user preference

**What was said:** "I'd rather the security review and accessibility review skills exist on their own so that I can call them individually if needed. The ship skill should invoke them."

**Synthesized rule:** When one skill needs to use another's logic, the parent skill should invoke the child via the Skill tool — don't copy-paste the child's lens prompt into an Agent call inside the parent. Implication: child skills need `disable-model-invocation: true` removed so they're reachable from the Skill tool (with a description specific enough that auto-invocation doesn't fire when not wanted). Keeps each skill standalone-callable and avoids prompt duplication that drifts over time.

**Applies to:** workflow, skill architecture.

### FB-0002: Context-isolation agents are escape hatches, not workflow defaults
**Date:** 2026-05-13
**Source:** user direction

**What was said:** Discussion about whether to keep the template's planner/domain/ui/testing/docs agents. User asked: "Are the agents of any use alongside the skills? Can the agents run the skills? ... If they aren't useful, we can delete them, but make sure we're not getting rid of something that will accelerate our workflow."

**Synthesized rule:** Default to skills, not agents. Agents (`planner`, `docs`) are useful only for **context isolation** — when the main thread is full of unrelated code and a clean slate produces a better artifact. Their `description:` should actively discourage default invocation ("use only when..."). Don't delete blindly; understand the role first.

**Applies to:** workflow, agent infrastructure.

### FB-0001: Workflow shape and discipline (canonical session loop)
**Date:** 2026-05-13
**Source:** user direction

**What was said:** "This is the workflow I want to follow: I make a request → Claude asks clarifying questions → reviews necessary docs → creates a plan → I approve → Claude executes → commits → goes into staff-review → presents review + dev URL + PR (not merged) → I may iterate → I'll tell Claude to ship → security + a11y review → fixes → update roadmap/plan/spec → synthesize feedback from chat into feedback.md → PR opened (not merged)."

**Synthesized rule:** Canonical loop is `clarify → plan → user approves → execute → commit → /staff-review → present → iterate → /ship → STOP`. Hard rules: never code without an approved plan; never merge; follow-ups go to roadmap.md / plan.md, not only the PR body; `/ship` owns all doc updates (don't update history/plan/roadmap/spec/feedback piecemeal mid-feature). `/ship` includes a feedback-synthesis step that reviews the session for corrections, preferences, and solved challenges and writes them here.

**Applies to:** workflow (canonical).
