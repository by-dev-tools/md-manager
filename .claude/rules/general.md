---
paths:
  - "**/*"
---

# General Rules

These apply to all work in md-manager. They reinforce the workflow defined in `CLAUDE.md` and `core-docs/workflow.md` — they don't replace it. If a rule here contradicts `workflow.md`, `workflow.md` wins (and the contradiction is itself a bug to fix).

## Workflow discipline

- **Plan before code.** Every non-trivial request gets a plan in `core-docs/plan.md` with the **required fields from `.claude/rules/plan-discipline.md`**: mode, goal, scope (in/out), spec-walk checkboxes, confidence verdict per load-bearing assumption, risks, files touched. Wait for user approval before executing. The exception is `mode: tiny` (a 1–3 line bug fix the user explicitly asked you to "just do") which skips spec-walk + confidence verdict but still gets a one-line plan.
- **Confidence verdicts gate the plan.** Every load-bearing assumption gets HIGH/MEDIUM/LOW per `.claude/rules/plan-discipline.md`. **LOW = automatic human gate** — the assumption must be resolved by an explicit user answer before the plan can proceed. `/critique-plan` is advisory; the workflow's enforcement is the human gate.
- **Preflight is a required step, not a tool.** Mechanical gates (`tools/preflight/check.mjs` if present + typecheck + build + test + project invariants) must be green before `/simplify` runs. Both `spike` and `tiny` modes still run preflight.
- **Run `/simplify` after commit, before `/staff-review`.** Code-quality pass (reuse, clarity, efficiency) lands first so staff-review can focus on architecture and craft instead of "this could be shorter." Both are part of the standard loop — not optional, not just for "big" changes. **Spike mode skips both** (the code is disposable; craft review on throwaway is theater).
- **The PR opens at `/ship`, not before.** Mid-pipeline PRs create half-done state and force the PR body to lie about completed reviews / doc synthesis. See `core-docs/workflow.md` § "Why the PR opens here, not earlier" for the full rationale. Spike-mode PRs open at `/ship-spike` (also end-of-pipeline, just lighter).
- **`/ship` owns narrative doc updates** (history.md, plan.md "Recently Completed", roadmap.md, spec.md, feedback.md). Don't update them piecemeal during execution. The carve-outs: **mechanical contract artifacts** (component-manifest.json, generation-log.md, pattern-log.md) update inline with the change; `plan.md` "Active Work Items" is allowed to update mid-feature for handoff/checkpoint purposes.
- **During a session, track corrections in your head (or scratchpad).** `/ship` will surface them and write the `feedback.md` entry as part of synthesis (step 3a). Don't update `feedback.md` mid-conversation.
- **Agent self-feedback is captured at `/ship` step 3b**, not earlier. Memory entries (`~/.claude/projects/.../memory/feedback_*.md`) must clear the 5 guardrails in `core-docs/workflow.md` § "Continuous improvement" — especially the source-diversity bar (evidence from 2-of-3 sources). Single-source findings don't earn an entry.
- **Read before writing.** At session start: `core-docs/plan.md` for "Current Focus" + "Handoff Notes." Before UI work: also `core-docs/feedback.md` and `core-docs/design-language.md`. Before any plan: also `core-docs/spec.md`.
- **Never merge.** `gh pr merge` is not a Claude action.

## Mode flags

Every plan declares one of three modes:

- **`feature`** (default) — full 11-step loop in `core-docs/workflow.md`.
- **`spike`** — exploratory PR that answers a question, not a feature ship. Skips `/simplify` + `/staff-review`; uses `/ship-spike` (which still runs preflight and writes a history entry as the deliverable). See `workflow.md` § "Spike mode" for the abuse-prevention guards.
- **`tiny`** — 1–3 line fix the user said "just do." Skips spec-walk, confidence verdict, `/simplify`, `/staff-review`. `/ship` for tiny mode skips synthesis (step 3) and goes straight to commit + push + PR. Rarely the right call; bias toward the full loop.

## Scope discipline

- Do what was asked. Don't refactor adjacent code, add unrequested features, or "improve" things that work.
- No dead code, commented-out code, unused imports, or placeholder files.
- If something isn't needed yet, don't create it.
- **New scope discovered mid-execution: surface to the user, don't silently absorb.** Update the plan with a fresh confidence verdict for the new assumption, get approval, then continue. This is the implicit human gate during Execute (workflow.md step 3).

## Decision tracking

- When a change involves a non-trivial decision (a reasonable alternative existed), note the tradeoff so `/ship` can capture it in `history.md`. A one-line scratch note is fine; `/ship` will write the formal entry.
- "What" goes in the code change itself. "Why" goes in `history.md` at ship time.
- Tradeoffs are the most valuable part of `history.md` — they're what future sessions need to avoid re-litigating.

## Autonomous work guardrails

This workflow is **hybrid managed autonomy** — human-gated at Plan (step 2) and Merge (step 11), with autonomy-friendly primitives between. Even inside the autonomous portion, always confirm with the user before proceeding if the action involves:

1. **Cost exposure** — API calls that could hit rate limits or incur charges, adding paid services.
2. **Permanence** — irreversible changes (deleting data models, breaking migration paths, force pushes, `rm -rf`).
3. **Risk** — security-sensitive changes, privacy implications, anything where a reasonable person might disagree.

Bug fixes, spec compliance, reliability work, and polish can proceed autonomously inside the workflow (still requires a plan + user approval at step 2).

## When this file goes stale

If you notice this file contradicts `CLAUDE.md` or `core-docs/workflow.md`, **update it** as part of the workflow-infrastructure self-audit (FB-0022). A stale rule file actively misleads every future session. The cost of fixing it is one PR; the cost of leaving it is every PR after.
