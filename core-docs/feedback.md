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
