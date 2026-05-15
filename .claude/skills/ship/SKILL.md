---
name: ship
description: >
  Final-pass pipeline for a completed workstream. Runs security-review and
  accessibility-review as a final safety net (assuming staff-review already
  ran during the feature work), applies any blocker/cheap-nit fixes, then
  synthesizes session feedback, updates core docs (history, plan, roadmap,
  spec, feedback) with the rationale, commits, pushes, and opens a PR. Never
  merges. Trigger phrases: "ship it", "ship this", "/ship", "push and open
  the PR", "wrap this up".
disable-model-invocation: true
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Agent, TaskCreate, TaskUpdate
---

You are running the ship pipeline. Follow every step in order. **Never merge.**

## 0. Pre-flight

Confirm there is something to ship. In parallel:
- `git status --short`
- `git log --oneline origin/main..HEAD`
- `gh pr list --head $(git branch --show-current) --json number,url 2>/dev/null`

Classify:
- **PR-OPEN** — at least one PR returned. Note the number for body updates.
- **LOCAL-ONLY** — commits ahead and/or dirty tree, no PR yet.
- **NOTHING-TO-SHIP** — clean tree at `origin/main`. Stop and tell the user.

If on `main`, create a descriptive kebab-case branch first.

## 1. Final-pass reviews

`/simplify` and `/staff-review` should have already run during feature work — they're steps 5 and 6 of the standard loop (`core-docs/workflow.md`). `ship` is the **final safety net** with sharper focus on security and accessibility; it does not re-run the earlier two. If the diff has changed materially since they ran (e.g., several iteration cycles intervened), re-run them before continuing here.

Invoke the two specialized review skills via the Skill tool, in sequence:
1. **`/security-review`** — diff-focused security audit for this stack. The skill saves its own diff, runs its own greps, spawns its own cold-read Agent, triages findings, and applies BLOCKER/NIT fixes itself. It returns the findings back to this pipeline.
2. **`/accessibility-review`** — same shape, WCAG 2.1 AA focus.

Run them sequentially (one after the other) rather than in parallel — the Skill tool doesn't parallelize, and each review is self-contained. Total wall time is the sum of the two, which is fine for a final-pass step.

Each skill handles its own triage and in-tree fixes (BLOCKER + cheap NIT). Capture the FOLLOW-UP findings returned by each skill so step 2 below can route them.

## 2. Route follow-ups

The review skills handled in-tree fixes themselves. Your job here is to ensure any FOLLOW-UP findings they surfaced land in the right doc:

- Belongs to active work → `core-docs/plan.md` under the current work item.
- Larger / future work → `core-docs/roadmap.md` under the relevant horizon.

Mention follow-ups in the PR body for reviewer awareness, but **never only in the PR body** — the doc entry is canonical.

If any new BLOCKER fix changed code, re-run `npm run typecheck` once before moving on.

## 3. Synthesize session feedback

Review this conversation (and any prior session since the last PR on this branch) for:
- User corrections — places you got it wrong and the user fixed your direction.
- User preferences — stylistic or process calls the user made.
- User direction — strategic priorities or scope changes.
- Challenges solved — a non-obvious problem and how it was resolved.

Add new entries to `core-docs/feedback.md` following the FB-XXXX format. Increment from the last ID. Skip anything already captured. The bar: would a future session benefit from this rule? If yes, write it down.

## 4. Update core docs

For each meaningful change in the diff:

- **`core-docs/history.md`** — add an entry (newest first) with: title, date, branch, what was done, why, design decisions, technical decisions, tradeoffs, lessons learned. Flag with `SAFETY` if it touches persistence, error handling, or fallback behavior.
- **`core-docs/plan.md`** — move shipped items from "Current Focus" → "Recently Completed". Update "Current Focus" to reflect what's next. Clear stale "Handoff Notes" if the work is done.
- **`core-docs/roadmap.md`** — log any deferred follow-ups from review under the relevant horizon. Update workstream status if a workstream completed.
- **`core-docs/spec.md`** — if features changed status (planned → shipped) or new features were added, update the features table. If the product surface area changed materially, update the relevant section.

Do **not** add entries that already exist. Skip silently.

## 5. Commit

Stage code changes + doc updates together (or in two commits if cleaner). Never stage `.env`, secrets, or credentials.

Commit message style: explain **why**, not what. Short subject line, blank line, body if needed. End with:
```
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

If safety-critical code changed, include `SAFETY` in the commit subject.

## 6. Push and PR

Push with `-u` if the branch isn't tracking yet.

**LOCAL-ONLY**: `gh pr create --base main` with:
- Short title (under 70 chars).
- Body:
  ```markdown
  ## Summary
  - <1-3 bullets on why this exists>

  ## Test plan
  - [ ] <how to verify>

  ## Reviews
  Security and accessibility reviews ran in ship; staff-review ran during feature work. Deferred follow-ups: see `core-docs/roadmap.md` and `core-docs/plan.md`.

  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  ```

**PR-OPEN**: push the new commits. Update the PR body if the summary/test plan needs to reflect the latest scope; otherwise leave it.

## 7. Hand off

Output the PR URL and a one-line summary of what shipped. If the dev server isn't running, start it via `/link` and include the URL so the user can verify in-browser before they review.

**Do not merge.** Do not approve. Do not run `gh pr merge`. The user handles merging.

## Gotchas

- **Untracked files are invisible to `git diff`.** Use `git ls-files --others --exclude-standard` and hand the list to reviewers.
- **Don't double-document.** If staff-review already updated history.md or plan.md for this work, don't duplicate — extend.
- **Reviewers can be confidently wrong.** Spot-check findings before fixing.
- **Scope creep is the failure mode.** A reviewer suggestion that expands scope is a FOLLOW-UP for roadmap/plan, not a blocker.
- **`npm run typecheck` is cheap.** Run it after any code fix from review; it catches the silly mistakes.
