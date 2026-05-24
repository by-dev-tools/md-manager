# Project Template: Hybrid Managed-Autonomy Workflow

A generalized blueprint for replicating this project's structure in other repos. The doctrine is **hybrid managed autonomy**: maximize automation between two load-bearing human gates (plan approval, merge), and treat feedback (from both the AI and the user) as a first-class artifact that compounds across sessions.

This doc is the **portable contract**. It names the files, the gates, the automation surfaces, and the feedback loops — without the md-manager-specific tokens, features, or branch history. To bootstrap a new project, copy this doc, then create the listed files with project-appropriate content.

---

## Three load-bearing ideas

1. **Automation between gates.** The agent runs an 11-step loop autonomously; mechanical checks (preflight) and AI reviews (simplify, four-lens staff-review, security, a11y) are scripted, not improvised. The human appears at exactly two enforced gates.
2. **Specific human-approval gates.** Plan approval (step 2) and merge (step 11) are non-negotiable. A third gate fires automatically on `LOW` confidence assumptions. Everything else is delegated.
3. **Two-source feedback capture.** The user's feedback becomes durable rules in `feedback.md`. The agent's own recurring mistakes become durable rules in a memory directory. Patterns that recur enough graduate into mechanical preflight checks. Quality compounds.

---

## Repository layout

```
<repo-root>/
├── CLAUDE.md                       # Router. Cheat-sheet of the loop, quality bar,
│                                   # links to every doc + skill + rule. ~200 lines.
├── core-docs/                      # Durable knowledge. Source of truth.
│   ├── workflow.md                 # The full 11-step loop, long-form.
│   ├── spec.md                     # Product vision, problem, solution, feature table.
│   ├── plan.md                     # Current focus, active work items, handoff notes.
│   ├── roadmap.md                  # Horizons (now / next / later) + Exploration section.
│   ├── history.md                  # Per-PR decision log: what + why + tradeoffs.
│   ├── feedback.md                 # USER feedback, synthesized to rules (FB-XXXX).
│   └── design-language.md          # (Optional, for UI projects) Tokens, axioms, components.
├── .claude/
│   ├── settings.json               # Permissions, hooks, env vars.
│   ├── rules/                      # Auto-load on path match. Reinforce, don't restate.
│   │   ├── general.md              # Workflow discipline, scope, autonomy guardrails.
│   │   ├── plan-discipline.md      # Required plan fields + confidence-gate behavior.
│   │   ├── documentation.md        # Format rules for the core-docs files.
│   │   ├── safety.md               # Paths where regressions are expensive.
│   │   ├── exploration.md          # Surfaces "Exploration" items on matching edits.
│   │   ├── dev-server.md           # (UI only) Surface dev URL after UI work.
│   │   └── ui.md                   # (UI only) Tokens + a11y + design-system enforcement.
│   ├── skills/                     # /-invocable commands. Each is a directory with SKILL.md.
│   │   ├── link/                   # Start dev server, return URL.
│   │   ├── simplify/               # Cold-read changed code for reuse/clarity/efficiency.
│   │   ├── staff-review/           # Four parallel lenses; triage to BLOCKER/NIT/FOLLOW-UP/EXPLORATION.
│   │   ├── security-review/        # Diff-focused security audit.
│   │   ├── accessibility-review/   # Diff-focused WCAG audit (UI projects).
│   │   ├── ship/                   # Final reviews → synthesis → docs → commit → push → PR.
│   │   └── ship-spike/             # Light ship pipeline for exploratory PRs.
│   └── agents/                     # Optional context-isolation subagents.
│       ├── planner.md              # Fresh-context plan-writer.
│       └── docs.md                 # Fresh-context history-entry writer.
├── tools/
│   ├── preflight/check.mjs         # Bundled mechanical gate (typecheck/build/test + invariants).
│   ├── memory/check.mjs            # Memory-corpus audit (cap + audit-due).
│   └── invariants/check.mjs        # (Optional) Design-system or stack-specific invariants.
└── ~/.claude/projects/<canonical-path>/memory/   # Cross-session AGENT feedback.
    ├── feedback_<short_name>.md    # Failure-pattern entries, one per pattern.
    └── superseded/                 # Archived entries promoted to preflight checks.
```

---

## The 11-step loop (canonical)

```
 1. Clarify          read source-of-truth docs; surface conflicts; ask 2–4
                     targeted questions (or list assumptions if autonomous)
 2. Plan             write plan with spec-walk checkboxes + confidence
                     verdict; /critique-plan; WAIT for HUMAN GATE
 3. Execute          implement against checkboxes; stay in scope
                     (new scope → re-plan → re-approve)
 4. Preflight        MECHANICAL GATES (typecheck/build/test + invariants)
                     must be green before /simplify runs
 5. Commit           "why" not "what"; co-author trailer; per-phase
 6. /simplify        cold-read for reuse/clarity/efficiency; fix in-tree;
                     re-run preflight; commit
 7. /staff-review    AI REVIEW — four lenses in parallel (engineer / UX /
                     design-eng / push-further); BLOCKER + cheap NIT in-tree;
                     FOLLOW-UP → roadmap/plan; EXPLORATION → roadmap §
                     Exploration; commit
 8. Present          reviewer notes + dev URL + branch state; flag MEDIUM-
                     confidence assumptions for user redirect
 9. Iterate          apply user feedback (mini-loop of 1–7)
10. /ship            security + a11y final pass → synthesize feedback
                     (USER + AGENT) → update docs → commit → push → open PR
11. STOP             HUMAN GATE — the user merges. AI never merges.
```

**Mode flags** declared in the plan: `feature` (default, full loop), `spike` (skips /simplify + /staff-review; uses `/ship-spike`), `tiny` (1–3 line fix; skips spec-walk + confidence verdict).

---

## Human approval gates (load-bearing)

The agent runs autonomously between these gates. The gates themselves are non-negotiable. **Naming them explicitly is the point** — they are the contract that distinguishes managed autonomy from "vibe coding."

| Gate | When | Why it can't be delegated |
|---|---|---|
| **Plan approval** (step 2) | After the plan is written, before any code runs | The plan encodes scope and risk. A bad plan wastes the rest of the loop. Cheap to fix here; expensive later. |
| **LOW-confidence resolution** (automatic, inside step 2) | Any load-bearing assumption rated LOW | A LOW-confidence assumption can flip the entire approach. The user must answer before planning continues. |
| **MEDIUM redirect window** (step 8, soft gate) | Before /ship locks the PR | The agent surfaces MEDIUM assumptions; user can redirect or accept. Soft because the work proceeds if the user doesn't intervene. |
| **Merge** (step 11) | After PR is open and all reviews are clean | One-way door. The user merges. Ever. |

**Confidence verdict format** — required for each load-bearing assumption in the plan:

```
**Assumption:** <what you're assuming>
**Confidence:** HIGH | MEDIUM | LOW
**Why:** <one line — what evidence supports the rating>
**If it flips:** <one line — what would change in the approach>
```

Trigger for "load-bearing": *would I plan a different feature if this assumption flipped?* If "If it flips" answers "the entire approach," confidence is automatically LOW.

---

## Automation layer

Everything outside the human gates runs through automation. Each automated step has a purpose distinct from the others — there are no redundant gates.

| Automation | Step | What it catches |
|---|---|---|
| `tools/preflight/check.mjs` | 4 | Mechanical violations (types, build, tests, invariants). Sub-second to seconds. Runs again after /simplify. |
| `/simplify` | 6 | Reuse, clarity, efficiency. Removes "this is overcomplicated" findings before staff-review wastes judgment on them. |
| `/staff-review` (4 lenses parallel) | 7 | Engineer (correctness, architecture), UX designer (interaction, hierarchy), design engineer (craft, tokens), push-further (uncommon-care, missed opportunities). |
| `/security-review` | 10 | Diff-focused: XSS, secrets, unsafe deps, dangerous URL handling. |
| `/accessibility-review` | 10 | Diff-focused: WCAG 2.1 AA, keyboard, focus, contrast, reduced-motion. |
| Auto-loading **rules** (`.claude/rules/*.md`) | always (path-matched) | Inject domain rules into every relevant edit — "read X before changing Y," "use tokens, not raw values." |

**Why the order matters.** Preflight before /simplify (don't waste judgment on mechanical bugs). /simplify before /staff-review (don't waste lenses on bloat). Staff-review before /ship (don't ship before the full surface is reviewed). Security + a11y in /ship (sharper focus than staff-review's general lenses, and they're the *last* thing before PR creation).

**Why the PR opens last.** The PR is the merge-handoff artifact, not a collaboration surface. Opening earlier creates a half-done state where the body lies about what's done. Doc synthesis (history, plan, roadmap, spec, feedback) has to land *first* so the canonical record exists before the PR opens.

---

## Feedback capture (the two-layer system)

Feedback is captured in two layers that flow into a third: **user feedback shapes what gets built; agent self-feedback shapes how it gets built; mechanically-checkable patterns graduate to preflight.** Each layer has its own home, format, and bar to write.

### Layer 1: User feedback → `core-docs/feedback.md`

When the user corrects, prefers, or directs, capture it as a synthesized rule (not a transcript). Sequential IDs (`FB-XXXX`) make entries citable across PRs.

```markdown
### FB-XXXX: [Short summary]
**Date:** YYYY-MM-DD
**Source:** user correction | user preference | user direction | review feedback

**What was said:** Brief, factual summary.
**Synthesized rule:** The actionable takeaway.
**Applies to:** [ux, code, architecture, workflow, …]
```

- **Bar to write:** would a future session benefit from this rule?
- **When written:** synthesized at `/ship` step 3a (not mid-session — let the ship pipeline distill the whole conversation).
- **Read at:** session start, before any UI work, before any plan.

### Layer 2: Agent self-feedback → `~/.claude/projects/<canonical>/memory/feedback_*.md`

Cross-session memory that loads automatically. Captures patterns the agent gets wrong, so the next session doesn't re-make the mistake. **The risk is slop** (memory-amplification feedback loop), so writes are guarded.

```markdown
# <one-line title>

**Source:** <which review surfaced it>
**First seen:** YYYY-MM-DD on branch <name>
**Source-diversity evidence:** <which 2-of-3 sources support this entry>
**Pattern:** <the failure mode in 1–3 sentences>
**Why I missed it:** <one line — what assumption led to the bug>
**How to catch it next time:** <concrete check>
**Promotion target:** <what the preflight rule would look like>
**Fire log:** <append YYYY-MM-DD on each subsequent firing>
```

**Five guardrails** prevent slop:

1. **Source-diversity bar** — evidence from at least **2 of 3** sources before writing: recurrence in time (saw it on a prior PR), two reviewers (`/staff-review` AND `/security-review` independently flagged), or one review + a `feedback.md` rule. Single-source findings don't earn an entry.
2. **Mechanical beats memory** — if a preflight rule could catch it deterministically, write the rule, not the memory entry.
3. **User feedback wins ties** — if memory contradicts `feedback.md`, the user wins; revise or archive the memory entry.
4. **Hard cap (~30 entries)** — forces curation pressure. New entry requires archiving or merging an existing one.
5. **Periodic audit (every 5 ship runs)** — fresh-context pass over the corpus identifies stale, contradicting, or over-fitted entries.

**When written:** `/ship` step 3b only. Single PRs don't earn memory entries unless the source-diversity bar is met.

### Layer 3: Promotion to preflight → `tools/preflight/check.mjs`

When a memory entry's `Fire log` reaches 2+ entries, the pattern is recurring despite the agent having the memory — that's the signal to promote. **Promotion is user-gated** (preflight rules are permanent; a bad rule generates false positives forever). After approval: write the rule, append `Superseded by preflight check <name>` to the memory entry, move the file to `memory/superseded/`.

The three layers form a **promotion pipeline**. Each promotion takes work off the next session's plate. This is what makes the loop close.

---

## The core-docs files (purpose + when to read/write)

| Doc | Purpose | When to read | When to write |
|---|---|---|---|
| `CLAUDE.md` | Router. Cheat-sheet + quality bar + index of everything else. | Session start. | When the loop, quality bar, or doc index changes. |
| `workflow.md` | Full 11-step loop, long-form. The canonical narrative. | Whenever the cheat-sheet in CLAUDE.md isn't enough. | When the loop itself changes. |
| `spec.md` | Product vision, problem, solution, feature table with status, open questions. | Starting any new feature; debating scope. | When scope, status, or open questions change. |
| `plan.md` | Current focus + Active Work Items + Handoff Notes + Recently Completed. | **Every session start.** | Mid-session for handoff/checkpoint; `/ship` owns "Recently Completed." |
| `roadmap.md` | Horizons (Now / Next / Later) + Exploration section with `Surfaces when:` triggers. | When capturing deferred follow-ups; mid-term planning. | `/staff-review` and `/ship` route follow-ups + exploration items here. |
| `history.md` | Per-PR decision log: date, branch, what, why, design decisions, technical decisions, tradeoffs. | When you need the **why** behind past work. | `/ship` step 3, one entry per shipped PR. |
| `feedback.md` | User feedback synthesized into rules (FB-XXXX). | Session start; before any UI work. | `/ship` step 3a. Never mid-session. |
| `design-language.md` (UI projects) | Tokens, axioms, components, motion rules. | Any UI change. | When tokens, axioms, or components change. |

**Two carve-outs from the "/ship owns narrative docs" rule:**
- **Mechanical contract artifacts** (a component manifest, a generation log, a pattern log) update **inline** with the change — they're tracked state, not narrative.
- **`plan.md` "Active Work Items"** may update mid-feature for handoff. "Recently Completed" stays `/ship`-owned.

---

## Skills (`.claude/skills/`)

Each skill is a directory containing `SKILL.md`. Skills are `/-invocable`. The set below is the canonical workflow surface; project-specific skills (e.g. `/link` for a dev server) layer on top.

| Skill | Triggers automation step | Notes |
|---|---|---|
| `/link` (or equivalent) | — | Starts dev server, returns URL. Project-specific. |
| `/critique-plan` (external plugin) | end of step 2 | Advisory critic; workflow's actual enforcement is the human gate. |
| `/simplify` | step 6 | Cold-read for reuse/clarity/efficiency. Reruns preflight. |
| `/staff-review` | step 7 | Four lenses in parallel. Triage to BLOCKER/NIT/FOLLOW-UP/EXPLORATION. |
| `/security-review` | step 10 (also standalone) | Diff-focused security audit. |
| `/accessibility-review` | step 10 (also standalone, UI only) | Diff-focused WCAG audit. |
| `/ship` | step 10 | Final reviews → synthesize feedback (both layers) → update docs → commit → push → open PR. **Never merges.** |
| `/ship-spike` | step 10 (spike mode) | Light pipeline: write history entry as the deliverable + commit + push + labeled PR. |

---

## Rules (`.claude/rules/`)

Rules are markdown with optional `paths:` frontmatter — they auto-load when an edit matches. They **reinforce** the workflow (don't restate it) and inject domain rules at the exact moment the agent needs them.

| Rule | Loads on | Enforces |
|---|---|---|
| `general.md` | always | Workflow discipline, scope, autonomy guardrails, "never merge." |
| `plan-discipline.md` | when writing a plan | Required plan fields + LOW=auto-human-gate behavior. |
| `documentation.md` | core-docs edits | Format rules (history entry, FB entry, plan work-item shape, memory entry). |
| `safety.md` | safety-critical paths (state, persistence, sanitization) | Read git log for safety-tagged commits before modifying; never silently downgrade error handling. |
| `exploration.md` | UI / code edits | Grep `roadmap.md § Exploration` for items whose `Surfaces when:` trigger matches the file(s) touched. |
| `dev-server.md` (UI) | UI file edits | Surface dev URL after UI work. |
| `ui.md` (UI) | UI file edits | Read design-language.md first; use tokens; a11y baseline. |

**Stale-rule check:** if a rule contradicts `CLAUDE.md` or `workflow.md`, fix it. A stale rule misleads every future session.

---

## Optional context-isolation agents (`.claude/agents/`)

Subagents are escape hatches for the rare case where a phase deserves its own clean context.

| Agent | When to invoke |
|---|---|
| `planner` | Large/complex feature where writing the plan in the main thread would contaminate execution context. Returns `plan.md` work item; no code. |
| `docs` | Long implementation session where main context is code-heavy and a clean slate would produce a clearer `history.md` entry. Use when `/ship` isn't the right shape (e.g. mid-feature checkpoint). |

Neither agent invokes other skills or agents. They produce file edits; the main model takes it from there. **Default path handles plan- and doc-writing in the main thread; reach for these only when context-isolation has real value.**

---

## Mechanical contracts (`tools/`)

These scripts are the **deterministic** layer. They don't replace judgment — they free judgment to focus on what scripts can't catch.

| Tool | Purpose | Run when |
|---|---|---|
| `tools/preflight/check.mjs` | Bundled mechanical gate: typecheck + build + test + project invariants. | Step 4; also after /simplify. |
| `tools/invariants/check.mjs` (optional) | Domain invariants (e.g. design-system token usage, no hardcoded values). | Inside preflight. |
| `tools/memory/check.mjs` | Memory-corpus size cap + audit-due signal. | Inside /ship (audit every 5 ships). |

**Promotion path:** when a memory entry's fire log shows the agent keeps making the same mistake, the rule becomes a script in `tools/preflight/check.mjs`. Memory shrinks; preflight grows; quality compounds.

---

## Quality posture (the philosophy that makes the rest work)

Three corollaries, copied directly so they survive the port:

### 1. No false affordances

Every visible control does its job today. A button that doesn't work is a bug equivalent to a crash. Mic icons that don't record, menu items that open empty panels, "Settings" entries with nothing inside — all forbidden in the default build.

### 2. Wire-vs-defer

When a feature is partly working, ask: *is the gap < 1 day, using existing primitives?*
- **Yes → wire it.** Default to shipping complete.
- **No → defer it.** Remove the visible affordance. Capture in `roadmap.md` with surface + gap + cost.

Hide-behind-a-flag is the exception, not the default.

### 3. Scope expansion is additive

Ship the smallest polished form first. Add capabilities later as separate polished increments. Never ship the full vision degraded and "fix it incrementally" — the first version sets user expectations for the entire app.

---

## Anti-patterns (project-portable)

- **Implementing without an approved plan.** Even "small" changes. Write the plan; wait.
- **Approving a LOW-confidence plan.** The gate exists because the assumption is load-bearing.
- **Smuggling features through spike mode.** If the deliverable is a feature, it's a feature PR.
- **Updating `history.md` / `feedback.md` mid-feature.** Let `/ship` synthesize at the end.
- **Putting follow-ups only in the PR body.** They vanish at merge. Roadmap or plan is canonical.
- **Merging.** The AI doesn't merge. Ever.
- **Skipping Preflight before /simplify.** Don't waste judgment on mechanical bugs.
- **Skipping a staff-review lens** because "a human gave a visual opinion" or "scope is tight." Run all four or say explicitly which one doesn't apply.
- **Writing a memory entry from a single-source finding.** The source-diversity bar exists to prevent slop.

---

## Bootstrap checklist for a new project

To replicate this structure:

- [ ] Copy this `project-template.md` to the new repo's `core-docs/`.
- [ ] Create `CLAUDE.md` at the repo root. Include: project thesis, the 11-step loop cheat-sheet, the quality bar, the doc/skill/rule index, and any project-specific tech stack notes.
- [ ] Create `core-docs/workflow.md` — full long-form version of the loop.
- [ ] Create `core-docs/spec.md` — vision, problem, solution, feature table (start with "Planned"), open questions.
- [ ] Create `core-docs/plan.md` — empty "Current Focus" + "Active Work Items" + "Handoff Notes" + "Recently Completed" headers.
- [ ] Create `core-docs/roadmap.md` — Now / Next / Later headers + Exploration section with format reference.
- [ ] Create `core-docs/history.md` — entry format reference + empty Entries section.
- [ ] Create `core-docs/feedback.md` — entry format reference (FB-XXXX) + empty Entries section.
- [ ] (UI projects) Create `core-docs/design-language.md` — tokens, axioms, components, motion rules.
- [ ] Create `.claude/rules/general.md`, `plan-discipline.md`, `documentation.md`, `safety.md`, `exploration.md`. Add `ui.md` and `dev-server.md` if the project has UI.
- [ ] Create `.claude/skills/` with `SKILL.md` for: `simplify`, `staff-review`, `security-review`, `ship`, `ship-spike` (and `link`, `accessibility-review` if UI).
- [ ] (Optional) Create `.claude/agents/planner.md` and `.claude/agents/docs.md`.
- [ ] Create `tools/preflight/check.mjs` — wire to the project's test/build/typecheck commands + any invariants.
- [ ] Create `tools/memory/check.mjs` — cap + audit-due.
- [ ] Create `~/.claude/projects/<canonical-path>/memory/` (empty directory). Memory entries get written by `/ship` over time; do not seed.
- [ ] Verify each rule's `paths:` frontmatter matches the new project's file layout.
- [ ] Run one trivial PR end-to-end (a typo fix in `spec.md`) to validate the loop, all gates, and that the PR opens via `/ship` rather than being created manually.

---

## What's intentionally project-specific (don't try to port verbatim)

- The **tech stack** (build commands, typecheck, test runner) — `tools/preflight/check.mjs` is project-shaped.
- The **design tokens** in `design-language.md` — every project picks its own.
- The **safety-critical paths** in `.claude/rules/safety.md` — each project has different files where regressions are expensive.
- The **feature table** in `spec.md` — obviously project-shaped.
- **Specific FB entries** in `feedback.md` and **specific memory entries** — each project earns these by running PRs; copying them is anti-pattern (the source-diversity bar exists for a reason).
- **Specific Exploration items** in `roadmap.md § Exploration` — each project's push-further lens surfaces its own.

The **shape** ports; the **content** is earned per-project.
