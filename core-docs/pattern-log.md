# Pattern log

> Decision rationale for non-obvious design-language or component choices. See Mini plan §13.1 for usage.

## How this differs from the design language

- `design-language.md` is the **current state**: axioms, tokens, approved patterns.
- `pattern-log.md` is the **history of decisions**: why we chose each axiom value, why we made that tradeoff, what we tried and abandoned.
- `generation-log.md` is the **mechanical record** of every skill firing (prompt, tokens used, invariants, feedback).

A minor token tweak (one value change) is logged here. An axiom change is logged in `design-language.md`'s change log AND here.

## How to write an entry

Each entry is a dated heading plus 3–6 sentences. Focus on the *why*. Reference code or commits where helpful.

## Entries

## 2026-05-14 — Accent identity is the user-controlled page tint, not a brand color

When the Mini axioms were inventoried (PR B, `mini-elicit`), accent identity (axiom #3) had to be answered. The family default — Designer's monochrome / no-accent stance — was rejected outright: notes are personal artifacts, the user owns the tone, and the color rail is the signature interaction. We also rejected picking a single accent (e.g., indigo from Radix) because it would compete with the page tint for ownership of "the warm color you see." Resolution: `--page-tint` is the accent for content surfaces; `indigo` is reserved at the root (`data-accent="indigo"`) for any focus-ring rebinding Mini may need at PR C time, currently neutralized via the `:focus-visible { outline: revert }` block at the bottom of `globals.css`. Tradeoff: this is a real divergence from Mini's standard contract — most Mini projects ship a fixed accent scale. Documented as axiom #3 with the Family-divergence rationale; tooling that assumes a fixed `accent-9` (focus rings, links, selected state) will need explicit per-tint contrast validation at PR C.

## 2026-05-14 — Surface posture is an intentional open axiom

Mini's "surface hierarchy depth" axiom is settled at 3 tiers (page / surface / float layer), but the orthogonal posture question — floating card vs flat full-bleed — is intentionally unresolved. The DevPanel ships both for dogfooding. Tradeoff considered and rejected: picking one early would close a question the user explicitly wants to feel out across extended writing sessions. Resolution criteria are explicit in `design-language.md` § "Axioms → Open axiom: surface posture" — dogfooding signal, an archetype constraint, or an explicit user call. This is not a deferred decision; it's a present-tense one with structured resolution.
