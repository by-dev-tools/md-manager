---
paths:
  - "core-docs/plan.md"
---

# Plan-discipline rule

Loads when writing a plan in response to a user request (step 3 of `core-docs/workflow.md`).

## Before drafting a plan

Read the source-of-truth docs that govern the change:
- `core-docs/spec.md` — feature scope and decisions
- `core-docs/feedback.md` — synthesized user preferences and corrections
- `core-docs/design-language.md` — visual and interaction rules
- Any doc the user pointed to in the request

A plan that contradicts one of these silently is a wasted iteration. Surface the conflict during Clarify (step 2) and resolve it before drafting.

## Why this matters

Two consumers benefit from these reads:
1. **You, the planner** — the plan is informed by documented decisions instead of inventing them.
2. **`/critique-plan`** (assumption-auditor plugin, if installed) — the critic loads these docs deterministically via its preprocessor regardless, but planner-side reads help avoid violations in the first place.
