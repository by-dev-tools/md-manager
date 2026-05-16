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

**What was said:** The user asked for a multi-perspective review on the PR's full diff. The three independent reviews (engineer, UX, design engineer) running in parallel turned up bug classes none of the three would have caught alone — the engineer found the snapshot/race issues + lifecycle bugs, the UX designer caught the silent-URL-rejection false affordance + keyboard nav holes, the design engineer caught the missing type-scale token. After fixes the user then asked for the final ship-pass (security + a11y) on top.

**Synthesized rule:** Default to the three-lens parallel staff-review for any non-trivial workstream — single-lens reviews systematically miss issues outside the reviewer's primary frame. Run the three reviews concurrently (one tool message, three `Agent` calls) so each is independent and their findings triangulate. `/ship`'s final-pass security + a11y review is additive, not a replacement.

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
