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

`/simplify` and `/staff-review` should have already run during feature work — they're steps 6 and 7 of the standard loop (`core-docs/workflow.md`). `ship` is the **final safety net** with sharper focus on security and accessibility; it does not re-run the earlier two. If the diff has changed materially since they ran (e.g., several iteration cycles intervened), re-run them before continuing here.

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

## 3. Synthesize session feedback (two layers)

### 3a. User feedback → `core-docs/feedback.md`

Review this conversation (and any prior session since the last PR on this branch) for:
- User corrections — places you got it wrong and the user fixed your direction.
- User preferences — stylistic or process calls the user made.
- User direction — strategic priorities or scope changes.
- Challenges solved — a non-obvious problem and how it was resolved.

Add new entries to `core-docs/feedback.md` following the FB-XXXX format. Increment from the last ID. Skip anything already captured. The bar: would a future session benefit from this rule? If yes, write it down.

### 3b. Agent self-feedback → failure-pattern memory

This step has **five guardrails** designed to prevent compounding agent slop in the memory corpus. See `core-docs/workflow.md` § "Continuous improvement" for the full model.

#### Step 3b.i — Check corpus health first

```sh
node tools/memory/check.mjs
```

If `OVER CAP`, you must archive or merge an existing entry before writing a new one.

#### Step 3b.ii — Apply the source-diversity bar

For each finding from `/simplify`, `/staff-review`, `/security-review`, `/accessibility-review`, `/critique-plan`, ask:

1. **Recurrence-likely?** Could this same pattern resurface on a similar surface in a future session?
2. **Not mechanically checkable yet?** If a preflight rule could catch it deterministically, write the preflight rule (or file as follow-up). Don't write a memory entry for something a script can check.
3. **Source-diversity bar met?** Evidence must come from at least **two of three**:
   - Recurrence in time (same pattern on a previous PR — check existing memory entries' fire logs and `git log`-able past findings).
   - Two reviewers (e.g., `/staff-review` AND `/security-review` independently flagged it).
   - One review + user correction (this PR's finding aligns with a `core-docs/feedback.md` rule).

   **A single review pass on a single PR is not enough.** The first occurrence of a real pattern goes uncaptured intentionally — capture on the second occurrence when recurrence is evidence.

If 1, 2, AND 3 all yes, proceed to write the entry.

#### Step 3b.iii — Resolve contradictions with user feedback

Before writing, scan `core-docs/feedback.md` for any rule the proposed memory entry would contradict. If a contradiction exists, **user feedback wins**. Either revise the entry to align, or skip writing it. Note the contradiction in the PR body so the user can confirm.

#### Step 3b.iv — Write the entry

File at `~/.claude/projects/<project-path>/memory/feedback_<short_snake_name>.md`:

```markdown
# <one-line title>

**Source:** <which review surfaced it>
**First seen:** YYYY-MM-DD on branch <name>
**Source-diversity evidence:** <which 2-of-3 sources support this — be specific>
**Pattern:** <the failure mode in 1-3 sentences>
**Why I missed it:** <one line — what assumption or shortcut led to the bug>
**How to catch it next time:** <concrete check — re-read X, run Y, verify Z>
**Promotion target:** <if this becomes a preflight check, what would it look like>
**Fire log:**
- YYYY-MM-DD: first seen, branch <name>
```

#### Step 3b.v — Update fire log + flag promotion candidates

For each existing memory entry whose pattern recurred on this PR (you spotted it again, possibly because the memory entry primed you to see it):
- Append today's date to the entry's "Fire log".
- If the fire log now has **2+ entries**, the pattern is recurring despite the memory — that's the promotion signal. **Do not auto-promote.** File a follow-up entry in `core-docs/roadmap.md` Cleanup section: "Promote memory entry `<name>` to preflight check (fired 2× on <branches>)." The user approves promotion explicitly; preflight rules are permanent and a bad one catches false positives forever.

#### Step 3b.vi — Audit if due

```sh
node tools/memory/check.mjs --audit-due
```

If exit 1, the audit interval (every 5 ship runs) has elapsed or the cap was exceeded. Resolve the memory directory path by running `node tools/memory/check.mjs` (the default summary prints `Memory: N/30 entries at <path>`). Then spawn an `Explore` agent with this prompt:

> Read every `feedback_*.md` file in `<path>` (the memory directory resolved above). Do not look at any PR diff or other context. Answer: (1) Which entries' fire logs show no entries newer than 60 days? Candidates for archival. (2) Which entries contradict each other? Surface for resolution. (3) Which entries look like over-fitting on a single past incident — vague, narrow, or only-applicable-once? Candidates for revision or deletion. Report findings only; do not modify files.

Apply audit recommendations after user review. Audits are the cure for memory ossification; skipping them lets the corpus rot.

The bar throughout step 3b is intentionally high. A typical PR produces 0 memory entries; many PRs produce 0 across multiple sessions. Noise dilutes memory's value; silence loses it. Write only when guardrails 1–4 all pass.

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
