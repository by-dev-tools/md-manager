---
paths:
  - "core-docs/plan.md"
---

# Plan-discipline rule

Loads when writing a plan in response to a user request (step 2 of the loop in `core-docs/workflow.md`).

## Before drafting a plan

Read the source-of-truth docs that govern the change:
- `core-docs/spec.md` — feature scope and decisions
- `core-docs/feedback.md` — synthesized user preferences and corrections
- `core-docs/design-language.md` — visual and interaction rules
- `core-docs/plan.md` — current focus + handoff notes
- Any doc the user pointed to in the request

A plan that contradicts one of these silently is a wasted iteration. Surface the conflict during Clarify (step 1) and resolve it before drafting.

## Required plan fields

Every plan written to `core-docs/plan.md` must include:

1. **Mode** — `feature` (default), `spike`, or `tiny`. See `core-docs/workflow.md` for what each skips.
2. **Goal** — 1–3 sentences in user terms.
3. **Scope (in)** / **Scope (out)** — what's deliberately not happening.
4. **Spec-walk checkboxes** — every numbered/bulleted requirement from the spec or user request becomes a checkbox. For each: the user-perceptible behavior, and the test or verification step that pins it. Test-first for spec contracts.
5. **Confidence verdict per load-bearing assumption** — see below.
6. **Risks / open questions**.
7. **Files touched** — anticipated paths.

`spike` mode replaces (4) with a single "Research question" line and (5) with a "Disposability" line. `tiny` mode skips (4) and (5) entirely but still names the file + the one-line change.

## Confidence verdict

The trigger for a "load-bearing assumption": **would I plan a different feature if this assumption flipped?**

For each load-bearing assumption, declare:

```
**Assumption:** <what you're assuming>
**Confidence:** HIGH | MEDIUM | LOW
**Why:** <one line — what evidence supports the rating>
**If it flips:** <one line — what would change in the approach>
```

If "If it flips" answers "the entire approach," confidence is automatically **LOW**.

### Behavior per level

- **HIGH** — proceed on user approval, normal path.
- **MEDIUM** — proceed; surface the assumption in step 8 (Present) so the user can redirect before /ship.
- **LOW** — **automatic human gate.** The plan cannot proceed. Surface the question to the user in the Clarify/Plan conversation and wait for an explicit answer that resolves the assumption (which then upgrades to HIGH or MEDIUM). The workflow's actual enforcement here is the human gate; `/critique-plan` is an external plugin and we treat its output as advisory.

Do not lower confidence to dodge the gate. If two reasonable answers would meaningfully change the implementation, that's MEDIUM at minimum.

## Why this matters

Three consumers benefit from these reads + structured output:
1. **You, the planner** — the plan is informed by documented decisions instead of inventing them.
2. **`/critique-plan`** (assumption-auditor plugin, if installed) — the critic loads these docs deterministically via its preprocessor regardless; planner-side reads help avoid violations in the first place. If the critic supports it, prefer treating LOW-confidence plans as REDIRECT findings — but the workflow doesn't require that the plugin enforce it.
3. **The user** — confidence verdicts make the plan's risk surface visible without forcing the user to re-derive it from the prose.
