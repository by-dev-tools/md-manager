# Spec-writing skill + intake mechanism for autonomous spec generation

**Date:** 2026-05-23 (consolidated 2026-05-24)
**Status:** Roadmap input for flow v1.2 (post-extraction). Not implemented.
**Purpose:** Capture the design decisions on a two-mode `/flow:spec` skill,
the intake mechanism that makes autonomous spec generation viable, and the
PR-based workflow for all spec changes. Self-contained.

---

## The timing asymmetry this solves

- Spec generation happens at 11pm (autonomous overnight routine)
- Human is asleep at 11pm
- Therefore: human input must happen BEFORE 11pm
- The system needs an **intake phase** during the day where the human gives
  raw input → night-run processes that input into polished JTBD-grounded
  spec entries

This doc defines the intake mechanism + the spec-writing skill that consumes
it. Both lands in flow v1.2.

---

## `/flow:spec` skill — two modes

### Mode A — Interactive (human present)

User invokes `/flow:spec <topic>` or describes a feature in conversation.
Skill uses `AskUserQuestion` to interview, capturing answers as it goes.
JTBD-grounded probe:

```
1. "What's the rough shape of this feature?" — open
2. JTBD probe (loop for each distinct job):
   - "When does the user encounter this need?" → situation
   - "What are they trying to do?" → motivation
   - "What outcome do they want?" → so-that
   - "What would tell us we got it right?" → success signal
3. "Are there other JTBDs this serves?" — multi
4. "Who's most affected if we don't ship this?" — user-centric priority
5. "What does 'minimum viable' look like vs 'polished'?" — wire-vs-defer call
6. "What's deliberately NOT in scope this round?" — out-of-scope
7. "Are there design or craft criteria that matter for this specifically?" — optional emphasis
```

Skill drafts spec.md entry inline, shows to user for confirmation, iterates
to final. ~5 minutes per feature. **The slow, deliberate path.**

### Mode B — Autonomous (night-run)

Skill reads an intake file (see below) and generates a spec entry from it.
Same output format as Mode A; no interview — the intake IS the interview's
output.

**Confidence-tagged.** If JTBDs are clear from intake: HIGH. If skill had to
infer significantly: MEDIUM (surfaces in morning review). If intake is too
thin to construct meaningful JTBDs: LOW (skill refuses, flags item as
`blocked: needs-interview`).

---

## The intake mechanism — three surfaces

Three intake surfaces, in order of fidelity. Match the user's actual capture
pattern across moods/time-availability.

### Surface 1 — `/flow:intake` skill (highest fidelity, fast)

User invokes during the day when they have an idea but not time for full
`/flow:spec`. 4-5 question interview, **answerable in under 90 seconds**.
Output: `core-docs/intake/<short-name>.md`:

```yaml
---
captured: 2026-05-23T14:30:00Z
status: ready          # ready | in-progress | speced | discarded
rough_title: "Keyboard shortcut help overlay"
---

# Keyboard shortcut help overlay

## Trigger / situation
When users want to learn the keyboard shortcuts. New users exploring,
returning users who forgot a binding.

## What they want
Quick visual reference of available shortcuts without leaving context.

## Outcome they're after
Discover or recall a shortcut, dismiss the overlay, get back to work.

## What success looks like
Press ?, see a clean overlay, dismiss with Esc or ?, no friction.

## Out of scope
Configurable bindings; just static display.

## Notes
- Match macOS-style help overlay aesthetic
- Probably 8-12 shortcuts max for v1
```

Night-run reads `core-docs/intake/*.md` with `status: ready`, generates spec
entries with JTBDs derived from the structured answers, marks intake
`status: speced`. **This is the intended primary path.**

### Surface 2 — Free-form intake (lower fidelity, fallback)

User drops a free-form note into `core-docs/intake.md` (single file,
chronological bullets):

```markdown
# Intake

- 2026-05-23 14:30 — keyboard shortcut help overlay; ? to open, Esc/? to
  dismiss; macOS-style aesthetic; static for v1
- 2026-05-23 16:45 — search across drafts + repo files; live filter in
  sidebar; might want fuzzy matching vs exact
```

Faster to capture (no interview), but night-run has to infer more. Spec
entries from free-form intake get **MEDIUM confidence on JTBDs** — surfaces
at morning review as "I had to make these calls, confirm or redirect."

### Surface 3 — Direct roadmap.md addition (lowest fidelity)

User adds a bullet to `roadmap.md § Now` with context:

```markdown
- Keyboard shortcut help overlay (? toggle, macOS-style)
```

Night-run sees roadmap item without spec entry, attempts JTBD inference.
If plausible at MEDIUM+: proceeds with confidence tags. If LOW only: leaves
item flagged "needs-spec," surfaces in morning. Forces the gap rather than
guessing.

### Why three surfaces

Match capture-pattern to moment:

- **Engaged + time** → Mode A (`/flow:spec` interactive) — slow, deliberate
- **Engaged + brief** → Surface 1 (`/flow:intake`) — 90-second guided capture
- **Hurried** → Surface 2 (intake.md) — drop a bullet, system asks tomorrow
- **Mid-roadmap-edit** → Surface 3 — roadmap edit becomes intake by default

Never have to context-switch to a heavier surface than the moment supports.

---

## Night-run sequence (updated for spec layer)

```
1. Sync state: read core-docs/intake/, intake.md, roadmap.md
2. For each intake item with status: ready:
   a. Generate spec.md entry (JTBDs derived from intake)
   b. Tag confidence on JTBD section (HIGH / MEDIUM / LOW)
   c. Mark intake status: speced
3. For each roadmap.md item without spec.md entry:
   a. Attempt JTBD inference from item text
   b. If MEDIUM+: generate spec entry with confidence tags
   c. If LOW only: leave roadmap item flagged "needs-spec"; surface in morning
4. For approved items now with spec entries:
   a. Run /flow:plan-next as before (planning routine)
5. Open spec PR(s) + plan PR(s) for morning review
```

**Spec entries are prerequisites to planning.** A roadmap.json item without
a corresponding spec.md entry can't be planned. Night-run's first task is
ensuring all "ready" roadmap items have spec entries; generate if missing.

---

## Spec PRs — load-bearing for transparency on inferred JTBDs

**All spec changes go through PRs** (interactive mode auto-merges after user
confirmation; autonomous mode opens PR for review).

### Rationale

- **Canonical surface for reasoning**: PR body has structured sections;
  commit messages don't render markdown well
- **Uniform pattern**: plans-as-PRs, impls-as-PRs, specs-as-PRs — no
  exception artifact type
- **Audit surface for inference cases**: when the night-run infers JTBDs
  from thin intake, the PR body's "Assumptions made" section surfaces each
  inference with confidence + reasoning + per-row review

### Spec PR labels (auto-applied by skill)

- `spec` + `interactive` — in-session origin; auto-merges fast after user
  confirms in real-time
- `spec` + `inferred` — autonomous from free-form intake or roadmap text;
  needs real review of inferences
- `spec` + `intake-direct` — autonomous from rich `/flow:intake` interview;
  can auto-merge if confidence is HIGH everywhere (per Option 3: fold into
  plan PR or auto-merge if zero LOW/MEDIUM)

Label tells you at a glance which PRs deserve attention. Most days: 0-2
spec PRs total, maybe one `inferred` needing real review.

### PR body structure (autonomous case)

```markdown
## Summary
Spec entry added for feature `keyboard-shortcut-overlay` (jtbd-007).

## Source
Generated from `core-docs/intake.md` line 23 (captured 2026-05-23 14:30 —
free-form note, no /flow:intake interview).

## Assumptions made

This intake was loose; the following JTBD details were inferred. Please
confirm or correct via PR review.

| Inference | Confidence | Reasoning |
|---|---|---|
| Target user is "anyone exploring the app" | MEDIUM | Intake didn't specify; default to broadest |
| Success = "dismissed within 5s without further action" | LOW | Inferred from "no friction" phrasing |
| Single overlay (not multiple shortcut groups) | MEDIUM | Intake brevity suggested simple v1 |

## Decisions
- Tier 1 success criteria assume keyboard-only, since intake didn't mention mouse
- Added craft criterion referencing design-language.md § "overlay hospitality"

## Spec diff
[the actual spec.md change rendered as GitHub diff]
```

Interactive PRs have a simpler body (no "Assumptions made" section, since
nothing was inferred).

---

## `/flow:approve` skill — auto-detects spec PRs

`/flow:approve <id>` works for any open PR with that id. The skill detects
the PR type from label (`spec` / `plan-only` / `implementation`) and runs
the appropriate merge action. Users never have to remember which flag.

Interactive Mode A wraps the full PR cycle into one user confirmation:

```
/flow:spec --interactive "<topic>"
  → Interview (~2-3 min, the slow part)
  → Generate spec entry, show for confirmation
  → User: "looks good"
  → Skill auto-runs: branch, commit, push, open PR with label `spec`+`interactive`
  → Skill auto-invokes /flow:approve <pr-number>
  → CI green → merge queue → main updated
  → Done. PR exists as durable artifact. ~10s after "looks good"
```

User's click count is unchanged from a hypothetical direct-commit version.
The PR is the artifact; the workflow doesn't make the user think about it.

---

## What goes through PRs vs not

| Artifact | PR-based? |
|---|---|
| Spec entries (any mode) | Yes — `spec` label |
| Plan files | Yes (existing) — `plan-only` label |
| Impl changes | Yes (existing) — `implementation` label |
| Intake files (`core-docs/intake/*.md`) | **No** — direct commit; intake is scratchpad-quality input, processed into specs which DO get PRs |
| Roadmap.md edits | Direct commit; high-volume rough updates |
| History.md, feedback.md (at /ship time) | Already covered by impl PRs |

The rule: **specs are PRs always; intake is direct/local; impl/plan continue per existing pattern.**

---

## Hooks needed (lands with v1.2)

- `/flow:critique-plan` extended: UI plan must declare `satisfies_jtbds`
  non-empty
- `/flow:audit-plan` extended: referenced JTBD ids must exist in spec.md
- Plan PR body template references `satisfies_jtbds` and `defers_jtbds` sections
- Hook on intake-file commits: validate frontmatter schema (`status`, `captured`,
  `rough_title` present)

---

## Open questions resolved (2026-05-23)

### 1. Intake morning-review surface — separate PRs or fold into plan?

**Folded into plan PRs when confidence is HIGH; separate spec PRs for
MEDIUM/LOW.** Minimizes morning surface area; preserves gate where it earns
its keep.

### 2. Interactive `/flow:spec` — direct commit or PR?

**PR-based.** ~5 seconds extra vs direct commit; gains canonical artifact,
uniform pattern, and inference-transparency surface for the autonomous case.
Interactive case wraps the PR cycle into one user confirmation.

### 3. Backfill policy for existing md-manager features?

**Hybrid**: next-5-touched features get JTBDs added; 6-month deadline for
full coverage; new features get JTBDs from inception.

---

## Phasing

| Version | Adds |
|---|---|
| **v1.2a** (1 PR) | JTBD schema in spec.md; plan-template references JTBDs; design-language "Craft criteria" section; `/flow:critique-plan` + `/flow:audit-plan` JTBD checks; `/flow:spec` Mode B (autonomous from intake); intake conventions (3 surfaces); night-run wired to process intake before planning; spec PRs with auto-detect labels |
| **v1.2b** (1 PR) | `/flow:spec` Mode A (interactive interview); `/flow:intake` skill (90-second guided capture); `/flow:approve` auto-detect for spec PRs; interactive Mode A's auto-merge cycle |

Two PRs land as one logical version. PR 2a is purely additive (no behavior
change without intake content). PR 2b adds the front-end skills.

---

## Cross-references

- `core-docs/plan.md` "Flow plugin extraction" — canonical umbrella
- `core-docs/handoffs/design-pipeline-2026-05-23.md` — design review lenses
  that consume the JTBDs defined by /flow:spec
- `core-docs/handoffs/visuals-design-2026-05-23.md` — visual artifacts +
  HTML report; the report is JTBD-organized using the spec.md JTBDs
- `core-docs/spec.md` — current md-manager spec; will gain JTBDs per
  backfill policy starting v1.2a
- `core-docs/feedback.md` — captured separately from this doc; intake is
  *input* to spec generation, feedback.md is *output* of user correction
