---
paths:
  - "core-docs/**"
---

# Documentation Format Rules

These rules ensure consistent formatting across core-docs files.

## history.md format

Every entry must include:
- **Date** (YYYY-MM-DD)
- **Branch** (the branch the work shipped from)
- **Commit / PR reference** when available. `/ship` writes the entry before committing, so this field can be a forward reference ("[this commit]" or "[range pending push]") at write time; `git log` and the PR link recover the SHAs later. Don't block on the SHA — branch + entry content are the load-bearing parts.
- **What was done** in user-facing terms
- **Why** — the problem or goal
- **Design decisions** with reasoning
- **Technical decisions** with reasoning
- **Tradeoffs discussed** — the most valuable part for future reference

Entries that modify error handling, persistence, fallback behavior, or markdown sanitization must include a `SAFETY` marker.

## feedback.md format

Every entry must include:
- **Sequential ID** (FB-XXXX)
- **Date** (YYYY-MM-DD)
- **Source type** (user correction, user preference, user direction, review feedback)
- **What was said** -- factual summary, not raw quote
- **Synthesized rule** -- the actionable takeaway
- **Applies to** -- which areas of the project this affects

## plan.md maintenance

- "Current focus" must reflect reality at all times
- "Handoff Notes" should be populated at the end of each session and cleared when the next session picks them up
- Completed items move to "Recently Completed" (keep last 3-5), then to history.md
- Never delete planned items without documenting why in history.md
