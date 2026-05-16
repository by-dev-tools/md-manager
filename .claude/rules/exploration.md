---
paths:
  - "src/**/*.tsx"
  - "src/**/*.ts"
  - "src/**/*.css"
---

# Exploration Surface Rule

Loads automatically when touching UI / code files (`src/**/*.tsx`, `src/**/*.ts`, `src/**/*.css`).

## What this rule does

`core-docs/roadmap.md § Exploration` collects open-ended directions surfaced by `/staff-review`'s push-further lens, the standalone `/uncommon-care` skill (when run), or user curiosity. Each entry carries a `Surfaces when:` trigger naming the file paths / area that should re-surface it.

**Before finishing UI / code work**, scan `core-docs/roadmap.md § Exploration` for items whose `Surfaces when:` trigger names the file(s) you touched. If any match:

1. **inline-cheap candidates** — propose applying inline if the user agrees; the work is small (≤30 min, single concern). Don't auto-apply without surfacing.
2. **roadmap-concrete candidates** — mention to the user for awareness. They may want to scope/queue the item as a real PR after the current one ships, or defer.
3. **future-exploration items** — mention only if the current change opens a path toward exploring the item, or directly demonstrates the gap the item names. Otherwise leave alone — the trigger fired, but if there's nothing to do about it on this PR, don't burden the conversation.

## Why this exists

Exploration items decay if no one looks at them. The Exploration section is in `roadmap.md` precisely so it's adjacent to the other planning docs an agent reads at session start — but a long Exploration section is hard to scan in full on every PR. The `Surfaces when:` trigger + this rule do the matching automatically so the right item shows up at the right moment without forcing every session to read the whole section.

## Don't

- **Don't auto-apply** an inline-cheap finding without proposing first. The exploration item is a suggestion, not a queued task.
- **Don't expand scope** of the current PR to address every triggered item. One inline-cheap fix bundled into a related PR is fine; three is scope creep. The remaining items wait for their own pass.
- **Don't add new exploration items here** — `/staff-review`'s push-further lens and `/uncommon-care` own that. This rule is read-only on the Exploration section.

## Coexists with `safety.md`

Both this rule and `safety.md` auto-load on `src/store.tsx` (and any future safety-critical persistence/markdown paths). They speak to different concerns:
- `safety.md` is about *not silently downgrading* existing safety behavior (error handling, persistence, sanitization) — protective, defensive.
- This rule is about *surfacing improvement opportunities* the push-further lens captured — generative, additive.

When both fire on the same file, honor `safety.md` first (preserve existing safety guarantees), then surface relevant Exploration items separately. The Exploration items themselves should already respect the safety surface (the push-further lens reads `safety.md` while running), so collisions in practice are rare.
