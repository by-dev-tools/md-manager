---
name: ship-spike
description: >
  Lightweight terminal pipeline for spike-mode PRs (exploratory work that
  answers a question rather than shipping a feature). Skips /simplify and
  /staff-review (they ran for the full /ship; spikes don't need them since
  the code is disposable). Writes the history.md entry — which IS the
  deliverable for a spike — commits, pushes, and opens a PR labeled `spike`.
  Never merges. Only invoke when the plan declared `mode: spike`. Trigger
  phrases: "ship the spike", "/ship-spike", "wrap up the spike".
disable-model-invocation: true
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Agent, TaskCreate, TaskUpdate
---

You are running the ship-spike pipeline for a spike-mode PR. **Never merge.**

## Pre-condition

The plan in `core-docs/plan.md` for the current work item must declare `**Mode:** spike`. If it doesn't, stop and tell the user — they want `/ship`, not `/ship-spike`. A spike-mode plan has:
- A research question.
- A disposability statement (deleted / kept behind flag / gates next PR).

If neither field exists, this is a feature plan and the wrong skill.

## 0. Pre-flight

In parallel:
- `git status --short`
- `git log --oneline origin/main..HEAD`
- `gh pr list --head $(git branch --show-current) --json number,url 2>/dev/null`

If clean tree at `origin/main`: stop, nothing to ship.
If on `main`: create a `spike/<short-name>` branch first.

## 1. Skip the heavy reviews

`/simplify` and `/staff-review` do not run for spikes. Reviewing throwaway code for craft is theater. **Do** ensure Preflight is green — that's still required:

```sh
node tools/preflight/check.mjs   # if present
npm run typecheck
npm run build
npm test
```

If preflight is red on spike code, that's a real bug in something the spike depends on (or the spike is broken in a way that invalidates the answer). Either fix it or note explicitly in the history entry that the answer is conditional on the broken state.

## 2. Write the history entry — the entry IS the deliverable

The point of a spike is the learning, not the code. The `core-docs/history.md` entry is the canonical artifact. Add an entry (newest first) with:

```markdown
### Spike: <one-line title>
**Date:** YYYY-MM-DD
**Branch:** <name>
**Mode:** spike

**Research question:** <the specific question the spike answers>

**What was built:** <smallest thing that answered the question; one paragraph max>

**What we learned:** <the answer, with any caveats>

**Recommendation:** proceed | pivot | abandon
- If proceed: what the next (real) PR looks like, in 1–3 sentences.
- If pivot: what the better question is, and what to try next.
- If abandon: why this direction is closed; what would re-open it.

**Disposability:** <code is being deleted / kept behind flag / gates next PR>
```

A spike's history entry is shorter than a feature's. Don't pad it with technical decisions or tradeoffs unless the spike itself surfaced them.

## 3. Capture agent self-feedback (if applicable)

Spikes often surface failure-pattern memory entries because the agent is operating with less guard-rail. Apply the same bar as `/ship` step 3b:

1. Recurrence likely?
2. Not mechanically checkable yet?

If yes, write a memory entry to `~/.claude/projects/<project-path>/memory/feedback_<short_snake_name>.md`. See `core-docs/workflow.md` § "Continuous improvement" for the format.

Do NOT synthesize user feedback to `core-docs/feedback.md` for spikes — the conversation density is different (less direction, more exploration). Spike-derived user preferences should wait until the follow-up feature PR confirms them.

## 4. Update plan.md

Move the spike from "Active Work Items" to "Recently Completed" with a one-line summary including the recommendation (proceed / pivot / abandon).

If the recommendation is "proceed," **add the next-PR scope to "Active Work Items" or roadmap.md** so the learning doesn't decay between sessions.

## 5. Commit

Stage code + doc updates. Commit with subject prefixed `spike:`:

```
spike: <one-line answer to the research question>

<optional body>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

## 6. Push and open PR

Push with `-u` if needed.

```sh
gh pr create --base main --label spike --title "spike: <answer>" --body "$(cat <<'EOF'
## Research question
<the question>

## Answer
<short answer>

## Recommendation
proceed | pivot | abandon — <one-line reasoning>

## Disposability
<what happens to the code: deleted, flagged, gates next PR>

## Full writeup
See `core-docs/history.md` entry "Spike: <title>".

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

The PR title MUST start with `spike:` and the PR MUST have the `spike` label. Both are spike-mode-abuse guards: a feature accidentally shipped through `/ship-spike` should be visually obvious and easy to reject.

## 7. Hand off

Output the PR URL and the recommendation (proceed / pivot / abandon). The user merges or closes.

**Do not merge. Do not approve.** The user handles merging.

## Gotchas

- **Spike PRs that grew into features.** If during execution you realize the work is no longer answering a question but building a feature, **stop and rewrite the plan as `mode: feature`**. Do not try to ship a feature through this skill — the heavy reviews exist for a reason. The user can redirect.
- **Spike code that's being kept** (behind a flag, gating next PR): the disposability statement matters. "Kept behind a flag" means the next PR has to either polish it or remove it — file a roadmap entry naming which.
- **Don't write to `feedback.md`.** That's `/ship` (feature mode). Spikes are too sparse on user direction to distill reliably.
