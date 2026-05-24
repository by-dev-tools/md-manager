# Design pipeline: JTBD-grounded review of visual artifacts

**Date:** 2026-05-23 (consolidated 2026-05-24)
**Status:** Roadmap input for flow v1.2+ (post-extraction). Not implemented.
**Purpose:** Capture the design decisions on how user-centered criteria
(JTBDs) ground the design review pipeline, and the two distinct criteria
sets (functionality + craft) that gate design quality. Self-contained.

---

## The load-bearing principle

**Criteria are first-class artifacts that propagate through the workflow.**

A JTBD declared in `spec.md` is the same evaluation lens that gates the
design review, then the impl grader, then the final report. The criteria
don't get re-derived at each stage; they're written once and applied
everywhere. This is the architectural unlock.

Most design workflows fail because criteria fragment — design has one set,
eng has another, QA has a third. Holding the line that *the criteria live
in one place and every gate reads them* makes the workflow coherent and
makes inferred-quality drift impossible.

---

## Where criteria live (three sources, layered)

### 1. `spec.md` — per-feature, user-centered

Every feature declares JTBDs (Jobs to be Done) plus per-feature
functionality and craft criteria:

```yaml
features:
  - id: persistence-v0
    name: Persistence (drafts survive a reload)
    jtbds:
      - id: jtbd-001
        when: "I'm mid-thought and accidentally close the tab"
        want: "to come back to exactly where I was"
        so_that: "I don't lose the idea I was capturing"
        success_signal: "draft content visible immediately after reload, cursor restored"
      - id: jtbd-002
        when: "my browser storage is full"
        want: "to know my drafts are at risk before I lose work"
        so_that: "I can clear storage proactively"
        success_signal: "warning surfaces, in-progress draft remains editable"
    functionality_criteria:
      - "Drafts persist across hard reload (Cmd+Shift+R)"
      - "Quota errors surface visibly without data loss"
      - "Schema versioning is in place for future migrations"
    craft_criteria:
      - "Save indicator follows attention-economy axiom (subtle, not modal)"
      - "Quota warning uses warning-tier token, not error-tier (it's recoverable)"
```

JTBDs are the *why*. Functionality criteria are *what works*. Craft criteria
are *how it feels*.

### 2. `design-language.md` — cross-cutting craft

Craft criteria reference design-language axioms ("attention-economy axiom,"
"warning-tier vs error-tier"). Design-language.md is the authority on those.

Design-language template gains a "Craft criteria" section. Spec.md per-feature
craft criteria can *add emphasis* but cannot override design-language axioms.

### 3. Plan files (`core-docs/plans/<id>.md`) — derived, scoped

Plans inherit criteria from spec.md + design-language.md. They don't
redefine; they reference and may narrow:

```yaml
satisfies_jtbds: [jtbd-001]
defers_jtbds:
  - { id: jtbd-002, reason: "Quota surfacing lands in persistence-v0.1" }
craft_criteria_emphasis: ["attention-economy"]  # additive only
```

**Plans don't get to redefine the user's job.** Plans implement against given
criteria; they don't invent them. That's the discipline.

---

## JTBD on every feature (decided 2026-05-23)

Yes — every feature in spec.md gets JTBDs, including non-UI work (backend,
infra, refactor). For non-UI: JTBDs are terser but still grounded in user
value. Example: "When system load spikes, the API should respond within
500ms so users don't see timeouts." The discipline is uniform; the depth
varies.

**Backfill policy for existing md-manager features**: hybrid.
- Next 5 features touched get JTBDs added
- 6-month deadline for full coverage of existing features
- New features get JTBDs from inception (no exception)

---

## The design review pipeline (parallels /staff-review for code)

Code-side review = `/flow:staff-review` with 4 lenses (engineer, UX,
design-engineer, push-further).

Design-side review = `/flow:design-review` with 4 lenses, distinct from
code-side, operating on the plan's visual artifacts:

| Lens | What it checks | Reads | Operates on |
|---|---|---|---|
| `design-functionality` | Does the design satisfy each declared JTBD? Edge cases? Empty/error/loading states? | spec.md JTBDs + plan's `satisfies_jtbds` | Plan's visual artifacts |
| `design-craft` | Visual hierarchy, spacing rhythm, token discipline, motion purpose, alignment | design-language.md + plan's `craft_criteria_emphasis` | Plan's visual artifacts |
| `design-engineering` | Is it implementable cleanly with existing components? New primitives needed? | component-manifest.json + design-language.md | Plan's visual artifacts |
| `design-push-further` | Could this be more memorable while staying in scope? (Josh Puckett uncommon-care) | uncommon-care heuristics | The design as a whole |

Three new lens-agents (functionality, craft, engineering) + the existing
push-further lens repurposed for design context.

**They run on the plan PR**, before merge to main, alongside `/flow:critique-plan`
and `/flow:audit-plan`. The plan PR doesn't merge until all four design lenses
return clean (or findings get fixed in revision).

2-revision cap on design redirects, parallel to the plan-redirect cap.

---

## When designs are produced

The plan-design phase determines who/what produces the design candidate.
Mapping fidelity tier → producer:

| Tier | Producer |
|---|---|
| 0-2 (text, ASCII, Mermaid) | Agent (no external tool) |
| 3 (mid-fi HTML) | Agent (HTML generation from design-language tokens) |
| 4 (high-fi HTML interactive) | Agent + Subframe MCP / Pencil MCP |
| 5 (Figma frames) | Human (escape hatch) |

For autonomous workflows, **agent-generated through Tier 4** is the dream.
Subframe ships React components from design specs; Pencil generates layouts.
Both can be invoked via MCP from inside the impl routine. Quality is variable
at higher tiers — the design review lenses do the quality enforcement.

---

## The validation loop (impl-side use of JTBDs)

JTBDs feed into the chrome-verify subagent. For each JTBD, generate a test
scenario:

```yaml
jtbd-001:
  given: editor open with content "Hello world"
  when: hard reload triggered (Cmd+Shift+R simulated)
  then:
    - assertion: editor content === "Hello world"
    - assertion: cursor position restored
    - visual: save indicator visible briefly (diff capture)
  success_signal_check: "draft content visible immediately after reload, cursor restored"
```

chrome-verify runs each JTBD scenario, captures screenshots at each step,
checks assertions.

**The impl HTML report is then JTBD-organized**, not feature-organized. Each
section answers "did we satisfy JTBD-N? Here's the proof." Far stronger
artifact than "here are some screenshots of the feature."

This connects ship to user value mechanically. The agent can't ship without
demonstrating each JTBD is satisfied; the user can't review without seeing
each JTBD's proof.

---

## Open questions resolved (2026-05-23)

### 1. JTBDs required on every spec.md feature, or only UI?

**Every feature.** Non-UI gets terser JTBDs grounded in user value (latency,
correctness, recovery). Discipline is uniform.

### 2. Where do craft criteria live: spec.md per-feature, or design-language.md only?

**Both, with spec-level being additive only.** Design-language.md is the
source of truth for axioms; specs can emphasize but not override.

### 3. Does the design review pipeline apply to spike mode?

**Partial.** `design-functionality` applies (does this design even answer
the research question?). `design-craft` and `design-engineering` are
skipped — disposable design doesn't earn craft critique. Mirrors how
`/staff-review` skips most lenses in spike mode.

---

## Phasing summary

| Version | Adds |
|---|---|
| **v1.2a** | JTBD substrate (spec.md schema, plan-template schema, critique-plan check) + autonomous spec generation from intake |
| **v1.2b** | Interactive spec interview skill + intake skill |
| **v1.3** | Plan visuals (HTML tiers 0-3) — see visuals-design doc |
| **v1.4** | Design review lenses (PR 1: functionality + craft; PR 2: engineering + push-further) — this doc's main contribution |
| **v1.5** | HTML report + JTBD-organized chrome-verify — see visuals-design doc |
| **v2.0+** | Higher-fidelity tiers, MCP integration (Subframe/Pencil), Figma escape hatch |

---

## Cross-references

- `core-docs/plan.md` "Flow plugin extraction" — canonical umbrella
- `core-docs/handoffs/visuals-design-2026-05-23.md` — visual artifact tiers,
  HTML report shape, hosting layers
- `core-docs/handoffs/spec-and-intake-design-2026-05-23.md` — spec-writing
  skill + intake mechanism (how JTBDs get into spec.md)
- `core-docs/spec.md` — current md-manager spec; will gain JTBDs per
  backfill policy starting v1.2a
- `core-docs/design-language.md` — will gain "Craft criteria" section
  at v1.2a
