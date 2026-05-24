# Visual artifacts in the flow workflow — design notes

**Date:** 2026-05-23 (consolidated 2026-05-24)
**Status:** Roadmap input for flow v1.2+ (post-extraction). Not implemented.
**Purpose:** Capture the design decisions from the planning conversation on how
visuals (wireframes, prototypes, HTML reports) integrate with flow's plan and
impl pipelines. Self-contained — readable cold.

---

## The two threads this design covers

1. **Plan-time visuals** — wireframes / prototypes attached to plan files,
   reviewed before plan PR merge, used to lock UX intent
2. **Impl-time HTML report** — polished "here's what shipped" artifact
   attached to every impl PR, makes morning/evening review fast and
   high-fidelity

---

## Plan-time visuals: HTML-first fidelity ladder

After discussion, **HTML is the canonical format** for visual plan artifacts.
Figma is reserved as an escape hatch for visual exploration that HTML can't
easily reproduce. Reasoning: one format keeps the criteria-driven review
pipeline simple; HTML is in-repo, diffable, version-controllable, and can
progress from rough → polished within the same medium.

| Tier | Format | When |
|---|---|---|
| 0. Text-only | Prose | Non-UI features (backend, refactor) |
| 1. ASCII / Mermaid | Markdown fenced blocks | Quick flows, decision trees, tiny UI changes |
| 2. Low-fidelity HTML | Committed under `core-docs/plans/<id>/visuals/` | Layout decisions, structure |
| 3. Mid-fidelity HTML | Styled per design-language tokens | Most UI features |
| 4. High-fidelity HTML | Interactive prototype with state | Interaction-heavy or unfamiliar UX |
| 5. Figma frames | Escape hatch when needed | Visual exploration HTML doesn't fit |

The plan-template YAML schema gains:

```yaml
visuals:
  tier: 3
  artifacts:
    - path: core-docs/plans/persistence-v0/visuals/index.html
      describes: "save indicator + quota toast at editor's bottom-right"
  rationale: "Layout-critical; save-indicator position is the load-bearing UX call."
```

Enforcement (lands with v1.3):

- `/flow:plan-next` skill prompts for visual tier when `ui_surface: true`
- `/flow:critique-plan` flags REDIRECT if tier=0 without justification on UI items
- Hook on plan-PR-open verifies declared artifact paths exist

---

## Impl-time HTML report

Every impl PR produces `reports/<feature-id>/index.html` committed alongside
the code. Self-contained HTML (inline CSS/JS, relative-path screenshots).
Survives squash-merge into main as a durable changelog: over time `reports/`
becomes a browsable visual history of every shipped feature.

### Report structure (v1.5 scope)

Organized **by JTBD**, not by feature. Each section answers "did we satisfy
JTBD-N? Here's the proof":

1. Cover (feature name, summary, ship status)
2. Spec-walk results (table, PASS/FAIL per requirement, jump-links to evidence)
3. Per-JTBD section:
   - JTBD statement (situation / motivation / outcome / success signal)
   - Screenshots of the user-task scenario
   - Assertion results (chrome-verify subagent output)
4. Grader output (per-criterion pass/fail with evidence)
5. Visual regression check (pixelmatch diffs against baselines on unaffected routes)
6. Decisions absorbed (scope expansions, MEDIUM-confidence assumptions resolved)
7. Code summary (file list + LOC by area; collapsible)
8. Live demo link (`/link` URL for local, deployed URL if Layer 3 configured)

This is the *agent-PR template* — distinct in shape from human-author PR
templates because human reviewers process AI-generated PRs differently.
Pattern adopted from Devin's `DEVIN_PR_TEMPLATE.md`.

### How it's generated

Impl routine produces the report at impl time by composing outputs from:

- Plan's success_criteria + JTBDs (from spec.md) → section structure
- chrome-verify subagent → screenshots + assertion results per JTBD
- `tools/visual/diff.mjs` → pixelmatch regression results
- outcome-grader (`/flow:audit-completion`) → grader output
- The actual diff → code summary

Tooling lives in `plugins/flow/scripts/visual/`:

- `capture.mjs` — Playwright wrapper, takes element-locator screenshots
- `diff.mjs` — Pixelmatch wrapper, diff image + percentage
- `report-gen.mjs` — composes the HTML from inputs

---

## Hosting: three layers, ship Layer 1 first

The hosting question is much smaller than it looks. Three layers, in order
of increasing setup:

### Layer 1 — Local open (zero setup)

```bash
gh pr checkout <branch>
open reports/<feature-id>/index.html
```

Works today. No server. Browser renders the file; screenshots resolve from
relative paths. Limitation: can't share URL externally.

**Ship this in v1.5.** Sufficient for solo workflow.

### Layer 2 — Claude-driven preview (small flow feature)

Skill: `/flow:show-report <pr-number>` — wraps `gh pr checkout` + opens the
report in Chrome via Claude in Chrome extension. One command instead of two.

Same skill works for plan-time prototypes: `/flow:show-prototype <id>`.

**Ship this in v1.6.** Quality-of-life over Layer 1.

### Layer 3 — Deploy previews (optional, when sharing matters)

Vercel/Netlify GitHub integration, deploying `claude/impl-*` branches per PR.
Each PR gets a unique URL. Free tier handles personal use. ~5 minutes one-time
setup per repo.

**Defer until needed.** Trigger: you actually want to share with someone external
(designer collaborator, stakeholder). For solo work, Layers 1+2 suffice
indefinitely.

flow.config.json gets a `deploy_previews` field that, when set, makes the
report's cover include the deployed URL. Backward-compatible.

---

## Enforcement

| Concern | Mechanism | Where |
|---|---|---|
| UI plan must declare a visual tier (or justify tier=0) | `/flow:plan-next` prompts; `/flow:critique-plan` REDIRECTs | Plan-critic prompt + plan-template YAML schema |
| Declared visual artifacts must exist at given paths | Hook on plan-PR-open scans plan YAML, verifies file existence | `hooks/check-plan-visuals.sh` |
| Impl PR must include HTML report on UI items | Impl routine's /goal condition requires `reports/<id>/index.html` exists | `/flow:impl-approved` skill prompt |
| Report conforms to template | JSON-LD metadata in HTML head; schema check | `tools/visual/report-lint.mjs` |
| Screenshots aren't stale | chrome-verify subagent timestamps each capture; report links must match latest run | chrome-verify writes manifest |

First three are load-bearing. Last two are polish for later versions.

---

## Phasing summary

| Version | Adds |
|---|---|
| **v1.2** | (spec/JTBD/intake substrate — see spec-and-intake-design doc) |
| **v1.3** | Plan visuals (Tiers 0-3) + tier declaration + hook enforcement |
| **v1.4** | Design review lenses (see design-pipeline doc) |
| **v1.5** | Impl HTML report (Layer 1 access) + JTBD-organized verification |
| **v1.6** | Claude-driven preview (`/flow:show-report`, `/flow:show-prototype`) |
| **v2.0** | Higher-fidelity plan visuals (Tier 4-5) + Subframe/Pencil MCP integration |
| **v2.1** | Figma escape hatch (Tier 5 frames via Figma MCP) |
| **v2.x** | Deploy previews (Layer 3) optional |

---

## Open question resolved

**Single-page vs multi-screen HTML report?**

Resolution: **single-page scrollable for v1.5; multi-screen as v2.x polish.**
Reason: single-page is enough for review (skim with jump-links); multi-screen
adds craft for sharing externally — which requires Layer 3 hosting anyway.

**Interactive embed vs screenshots only in the report?**

Resolution: **screenshots in v1.5, recorded GIF in v1.6 optional, live iframe
embed only when deploy previews are configured (v2.x).** Each tier adds value
without breaking the prior.

---

## Cross-references

- `core-docs/plan.md` "Flow plugin extraction" — canonical umbrella; visuals
  work lands post-extraction (v1.2+)
- `core-docs/handoffs/design-pipeline-2026-05-23.md` — JTBD-grounded design
  review pipeline; the design lenses that operate on the visual artifacts
  defined here
- `core-docs/handoffs/spec-and-intake-design-2026-05-23.md` — spec-writing
  skill + intake mechanism; the JTBDs in spec.md feed the chrome-verify
  scenarios for the HTML report
