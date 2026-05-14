---
paths:
  - "**/*"
---

# General Rules

These apply to all work in md-manager. They reinforce the workflow defined in `CLAUDE.md` and `core-docs/workflow.md` — they don't replace it.

## Workflow discipline

- **Plan before code.** Even small changes get a 3–5 line plan written to `core-docs/plan.md`. Wait for user approval before executing. The only exception is a single-line bug fix the user explicitly asked you to "just do."
- **Doc updates belong to `/ship`, not the implementation commit.** Don't update `history.md`, `plan.md`, `roadmap.md`, `spec.md`, or `feedback.md` mid-feature — let `/ship` synthesize them at the end so the entries reflect the full change, not a partial slice.
- **During a session, track corrections in your head (or scratchpad).** `/ship` will surface them and write the `feedback.md` entry as part of synthesis. Don't update `feedback.md` mid-conversation.
- **Read before writing.** At session start: `core-docs/plan.md` for "Current Focus" + "Handoff Notes." Before UI work: also `core-docs/feedback.md` and `core-docs/design-language.md`.
- **Never merge.** `gh pr merge` is not a Claude action.

## Scope discipline

- Do what was asked. Don't refactor adjacent code, add unrequested features, or "improve" things that work.
- No dead code, commented-out code, unused imports, or placeholder files.
- If something isn't needed yet, don't create it.
- New scope discovered mid-execution: surface it to the user, don't silently absorb it.

## Decision tracking

- When a change involves a non-trivial decision (a reasonable alternative existed), note the tradeoff so `/ship` can capture it in `history.md`. A one-line scratch note is fine; `/ship` will write the formal entry.
- "What" goes in the code change itself. "Why" goes in `history.md` at ship time.
- Tradeoffs are the most valuable part of `history.md` — they're what future sessions need to avoid re-litigating.

## Autonomous work guardrails

Always confirm with the user before proceeding if the action involves:

1. **Cost exposure** — API calls that could hit rate limits or incur charges, adding paid services.
2. **Permanence** — irreversible changes (deleting data models, breaking migration paths, force pushes, `rm -rf`).
3. **Risk** — security-sensitive changes, privacy implications, anything where a reasonable person might disagree.

Bug fixes, spec compliance, reliability work, and polish can proceed autonomously inside the workflow (still requires a plan + user approval at step 2).
