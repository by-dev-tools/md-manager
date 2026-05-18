# Workflow

How features get built and shipped. **Canonical across md-manager and Designer** — same loop, same primitives, same discipline. Project-specific bits (preflight gate lists, design tokens, skill names that differ between repos) are clearly marked.

This is the long-form narrative. `CLAUDE.md` carries the cheat-sheet. The two **must agree**; if you change one, change the other.

## What this workflow is (and isn't)

This is **hybrid managed autonomy**, not pure autonomous coding. The human stays in the loop at two load-bearing gates: (1) **Plan approval** before any code is written, and (2) **Merge** at the end. Between those, the agent operates with autonomy-friendly primitives — spec-walk checkboxes, confidence verdicts, preflight gates, /simplify, four-lens staff-review (engineer / UX designer / design engineer / push-further), agent self-feedback memory.

Confidence gates explicitly add a third gate when an assumption is LOW — surfacing a question that must be resolved before the plan can proceed. The implicit gate at Execute time (new scope discovered → re-plan → re-approve) is currently judgment-based, not enforced; extending the confidence-gate primitive into Execute and into /staff-review BLOCKER triage is a roadmap item.

The doctrine is: **more human gates than pure autonomous, fewer than fully manual.** The agent does the work it can do well; the human stays in the loop where the cost of being wrong is high.

---

## The unified loop

The user's request kicks the loop off (input, not a Claude step). From there:

```
 1. Clarify          read source-of-truth docs; surface conflicts; ask 2–4
                     targeted questions (or list assumptions if autonomous)
 2. Plan             write a plan with spec-walk checkboxes + confidence
                     verdict; run /critique-plan; WAIT for human gate
 3. Execute          implement against the checkboxes; stay in scope
 4. Preflight        mechanical gates (typecheck/build/test + project
                     invariants) — MUST be green before /simplify runs
 5. Commit           explain "why" not what; co-author trailer; per-phase
 6. /simplify        cold-read for reuse, clarity, efficiency; fix in-tree;
                     re-run preflight; commit
 7. /staff-review    four lenses in parallel (engineer / UX designer /
                     design engineer / push-further); fix BLOCKER + cheap
                     NIT in-tree; FOLLOW-UP → roadmap / plan; EXPLORATION
                     → roadmap.md § Exploration; commit
 8. Present          reviewer notes + dev URL + branch state; NO PR yet;
                     flag MEDIUM-confidence assumptions for user redirect
 9. Iterate          apply user feedback (mini-loop of 1–7)
10. /ship            security + a11y final pass → feedback synthesis →
                     doc updates → commit → push → open PR
11. STOP             the user merges; Claude never does
```

**Spike mode** (`mode: spike` in the plan): a cheap escape hatch for throwaway exploratory PRs. Skips steps 6 and 7; replaces step 10 with `/ship-spike`. See § "Spike mode" below.

**Tiny mode** (`mode: tiny` in the plan): a 1–3 line bug fix the user explicitly asked you to "just do." Skips spec-walk + confidence verdict + steps 6 and 7; preflight still runs. `/ship` for tiny mode skips synthesis (step 3 of the ship pipeline) and goes straight to commit + push + PR — feedback synthesis is overhead a 1-line fix doesn't earn. Rarely the right call; bias toward the full loop.

---

## Request (input)

User states a feature, change, or fix. May be one line, may be a paragraph. The request is the input that starts the loop; the numbered steps below are Claude's actions.

## 1. Clarify

Before asking anything, **read the source-of-truth docs that govern the change**:
- `core-docs/spec.md` — feature scope and decisions.
- `core-docs/plan.md` — current focus + handoff notes.
- `core-docs/feedback.md` — synthesized user preferences and corrections.
- `core-docs/design-language.md` — visual and interaction rules (for UI changes).
- Any doc the user explicitly pointed to in the request.
- The directly-related code (one or two files; don't pre-implement).

Then:

- **Synchronous mode** (user present): ask **2–4 focused questions** to fill in gaps. Don't ask twenty. Surface conflicts ("the spec says X, you're asking for Y — which wins?").
- **Autonomous mode** (no user present at planning): replace questions with **explicit assumption list** in the plan. Each load-bearing assumption gets a confidence rating (see § "Confidence gates").

The goal: leave step 1 with enough shared understanding to plan without ambiguity.

## 2. Plan

Write the plan to `core-docs/plan.md` under "Active Work Items". The plan **must include**:

### Required fields

- **Mode** — one of `feature` (default, full loop), `spike` (exploratory), `tiny` (1–3 line fix).
- **Goal** — 1–3 sentences in user terms.
- **Scope (in)** / **Scope (out)** — what's deliberately not happening.
- **Spec-walk checkboxes** — every numbered/bulleted requirement from the spec or user request becomes a checkbox. For each: name the user-perceptible behavior, and decide what test or verification step pins it. Test-first for spec contracts. If you find yourself implementing from memory, walk back to the source.
- **Confidence verdict per load-bearing assumption** — see § "Confidence gates" below.
- **Risks / open questions** — failure modes, files at risk, tradeoffs being made.
- **Files touched** — anticipated paths.

### After drafting, run `/critique-plan`

The plan-critic reviews the plan against the user's request and `core-docs/*.md`, returning either `APPROVED` or a `CRITIQUE SUMMARY` with BLOCKER / REDIRECT / FOLLOW-UP findings.

- **BLOCKER** — fix in-plan before showing it to the user.
- **REDIRECT** — surface to the user as part of the approval conversation.
- **FOLLOW-UP** — capture to `plan.md` or `roadmap.md`, do not block.

If the assumption-auditor plugin isn't installed, skip the critique step and rely on the human gate alone.

### Human gate

**User approves, redirects, or asks for revision. Claude does not start executing until the plan is approved.**

The critic informs the user's decision; it does not replace the human gate. **LOW-confidence plans cannot proceed until the assumption is resolved by an explicit user answer** — see § "Confidence gates". `/critique-plan` is an external plugin and we don't enforce its behavior in code; the workflow's enforcement is the human gate.

## 3. Execute

Implement the approved plan against the spec-walk checkboxes. During execution:

- **Check off each checkbox as the code that satisfies it lands** alongside the test/verification that pins it. If a requirement is silently dropped, that's a workflow violation.
- Stay in scope. New scope discovered mid-execution gets **surfaced**, not silently absorbed. Update the plan (with confidence verdict for the new assumption), get approval, then continue.
- Read `feedback.md` and `design-language.md` before touching UI.
- Read safety-critical files' recent git log before modifying them (per `.claude/rules/safety.md`).
- Use design tokens, not hardcoded values.

## 4. Preflight

**Mechanical gates that MUST be green before /simplify runs.** Sub-second to seconds.

```sh
# Project-specific bundled check — run if present (md-manager: pending PR 2; Designer: present)
[ -f tools/preflight/check.mjs ] && node tools/preflight/check.mjs

# Standard TypeScript/web stack (md-manager, Designer frontend):
npm run typecheck
npm run build
npm test

# Designer additional gates:
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
node tools/invariants/check.mjs <changed files>
node tools/manifest/check.mjs
```

Until a project's `tools/preflight/check.mjs` exists, run the explicit gates list directly. The bundled check is the consolidation step, not the contract — the contract is "all the mechanical gates green."

**Why preflight has its own step.** Without it, `/simplify` and `/staff-review` waste their judgment budget on mechanical issues a script catches in milliseconds. The preflight check fails fast, locally, before any reviewer-agent runs. If preflight is red, the loop pauses here.

**Failure-pattern memory** is the agent's running record of "things I've gotten wrong before." Memory entries (`~/.claude/projects/.../memory/feedback_*.md`) load automatically across sessions. They name patterns that aren't yet mechanically checkable. New entries are written at `/ship` step 3 (see § "Continuous improvement"). Patterns that fire repeatedly graduate to preflight checks — that's the **promotion path** that keeps the loop closing.

## 5. Commit

Commit the implementation with a message explaining **why**, not what. Subject under 70 chars; body if the why takes more than a line. Co-author trailer:

```
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

If safety-critical code changed, include `SAFETY` in the subject.

**Commit at every phase boundary that produced changes** (Execute, /simplify, /staff-review, /ship). Deterministic rule, not judgment. Squash-merge on PR close keeps `main` linear; intermediate commits live on the PR page indefinitely for review/recovery/blame.

## 6. /simplify

Cold-read the changed code for **reuse, quality, and efficiency** and fix issues in-tree:

- Duplicated logic that could collapse into a helper.
- Functions doing two unrelated things; split them.
- Premature abstractions to delete (one caller, no second one coming).
- Dead code, unused imports, commented-out blocks.
- Mid-function early-returns hiding state machines that want their own function.
- Performance footguns matching known patterns (O(n²) where O(n) reads the same; useEffect deps misses that re-run heavy work).

**Why before staff-review.** If staff-review ran first, ~half its NITs would be "this is overcomplicated." `/simplify` removes that class of finding pre-emptively so the four-lens review focuses on architecture, correctness, craft, and push-further opportunities instead of bloat.

Re-run **Preflight** before committing the simplify fixes. Refactors are exactly where mechanical gates earn their keep.

## 7. /staff-review

**Four** Explore agents review the diff in parallel from four lenses (engineer / UX designer / design engineer / push-further). The first three ask "is this good?"; the fourth asks "could this be pushed further?" — grounded in `design-language.md` and Josh Puckett's "uncommon care" (executing limited scope to an extraordinarily high bar).

Findings triaged:

- **BLOCKER** — fix in-tree now. User-visible regression, crash, accessibility violation, broken build.
- **NIT** / **inline-cheap** — fix in-tree if cheap (single-file, no architectural change). (`inline-cheap` is the push-further lens's equivalent of NIT.)
- **FOLLOW-UP** / **roadmap-concrete** — capture to `roadmap.md` or `plan.md`, **never only in the PR body.** Mention in PR body for reviewer awareness; the doc entry is canonical.
- **future-exploration** — open-ended direction without a clear shape yet. Routes to `roadmap.md` § Exploration with a `Surfaces when:` trigger naming the file paths / area that should re-surface the item later. `.claude/rules/exploration.md` auto-loads on UI / code work and reminds the agent to grep this section for trigger matches.

**Bias toward fixing small, defined issues.** Larger questions and deferred items go to roadmap/plan with rationale, not into review-comment limbo. **For FOLLOW-UPs, prefer doing over filing** — if it's small enough to land in the same PR without meaningfully expanding scope, just do it now. The push-further lens is permitted to return "Nothing to push — surface at ceiling for its scope" — empty is valid and often correct; false-positive "we could add X" findings are worse than no findings.

**Don't skip a lens** because a human gave a visual opinion or because another lens already ran. AI review and human opinion catch different things; the four lenses cover distinct surfaces. The only legitimate skip is when a lens genuinely doesn't apply (e.g., a backend-only change has nothing for the design-engineer or push-further lens) — in that case say so explicitly rather than running an empty review. "Live-tested" and "scope is tight" are not legitimate skip reasons; see `feedback.md` for the captured rule on this.

If staff-review touches design rules, accessibility patterns, or product decisions that need to persist, the relevant rule goes into `design-language.md` or `feedback.md` so we don't relearn it next time.

## 8. Present

Claude returns:
- Reviewer notes (findings, what was fixed, what was deferred and where).
- The dev server URL (`/link` if not running) so the user can verify in-browser.
- The branch and commit state. **No PR exists yet** — that's `/ship`'s job.
- **Any MEDIUM-confidence assumptions from the plan that turned out to be load-bearing** — surface them now (this is the step-8 redirect window) so the user can redirect before /ship locks the PR.

**Never merged.** The whole point of review is the human hand-off.

## 9. Iterate

User responds with feedback. Claude addresses it — code changes, doc updates, more review if scope changed materially. Each iteration is a normal request → clarify → plan → execute mini-loop. New scope = new plan (or amended plan with fresh confidence verdict).

## 10. /ship

User says "ship it" (or `/ship`). Claude runs the ship pipeline:

1. Final-pass `/security-review` + `/accessibility-review` in sequence (sharper focus than staff-review's general lenses).
2. Apply blocker / cheap-nit fixes; re-run Preflight if code changed.
3. **Synthesize session feedback (two layers)**:
   - **User feedback** — review the conversation since the last PR for corrections, preferences, decisions, and solved challenges. New entries go in `core-docs/feedback.md`.
   - **Agent self-feedback (pattern capture)** — scan the findings from /simplify, /staff-review, /security-review, /accessibility-review. For each finding, ask: *would this same pattern recur on a similar surface, and is it not already mechanically checkable?* If yes, write a failure-pattern memory entry to `~/.claude/projects/.../memory/feedback_<short_name>.md`. See § "Agent self-feedback (memory)" for the bar and format.
4. **Update core docs**:
   - `history.md` — what + why + decisions + tradeoffs.
   - `plan.md` — move shipped to completed; refresh current focus.
   - `roadmap.md` — deferred follow-ups under the relevant horizon.
   - `spec.md` — feature status changes; new surface area.
5. Commit doc updates.
6. Push and open the PR (or push to existing PR).
7. Output the PR URL.

**Still never merged.** The user merges.

### Why the PR opens here, not earlier

The PR is **deliberately the last artifact created**, not the first:

1. **Single-reviewer workflow.** The PR isn't a team-collaboration surface; it's "the work is done, please merge." Opening it mid-pipeline would create a half-done state nobody benefits from.
2. **Doc synthesis is load-bearing and has to be last.** `history.md` / `plan.md` / `roadmap.md` / `spec.md` / `feedback.md` only get written after every review has surfaced its findings. A PR opened before that would either lie about what's done or require repeated body edits. The canonical "what shipped" record lives in those committed docs — not the PR body — and that record has to exist before the PR opens.
3. **CI doesn't help earlier.** Local gates (Preflight) already cover what CI would tell us.

**When this calculus changes:** a second human reviewer joins, deploy previews land, or CI starts running checks the laptop can't. Until then, end-of-pipeline PR creation is correct.

### Why doc updates centralize at /ship

The temptation is to update `history.md` as soon as a decision is made. **Resist it.** Mid-feature doc updates produce fragmentary slices that have to be reconciled later anyway. `/ship` synthesizes the full change once, coherently. Two carve-outs:

- **Mechanical contract artifacts update inline** — `component-manifest.json`, `generation-log.md`, `pattern-log.md` (and analogous machine-checkable contracts in Designer). They're not narrative; they're tracked state.
- **`plan.md` "Active Work Items"** is allowed to update mid-feature for handoff/checkpoint purposes. The "Recently Completed" section is `/ship`-owned.

## 11. STOP

Claude does not merge. Ever. `gh pr merge` is not a Claude action. The user merges.

---

## Spike mode

A **spike** is a time-boxed exploratory PR whose goal is to *answer a question*, not to ship a feature. Examples:

- "Can we sync 50k notes to a repo without blocking the UI?"
- "Does Radix's `Popover` work inside our portal-less overlay system?"
- "What does the data model need to look like to support multi-repo drafts?"

The output is a learning, captured as a `history.md` entry (or ADR). The prototype code is usually thrown away, or it gates a follow-up "real" PR.

### Triggering spike mode

In the plan, set:

```
**Mode:** spike
**Research question:** <the specific question this PR answers>
**Disposability:** <what happens to the code: deleted, kept behind a flag, gates next PR>
```

### What spike mode skips

| Step | Default loop | Spike mode |
|---|---|---|
| 1. Clarify | Full docs read + questions | Only docs directly relevant to the question |
| 2. Plan | Spec-walk + confidence verdict | Research question + minimal approach |
| 3. Execute | Polish-bar implementation | Smallest thing that answers the question |
| 4. Preflight | Required | Required (cheap, keep it) |
| 5. Commit | Required | Required |
| 6. /simplify | Required | **SKIPPED** — code is disposable |
| 7. /staff-review | Required | **SKIPPED** — review craft on throwaway code is theater |
| 8. Present | Required (the deliverable is the answer) | Required (same — present the answer) |
| 9. Iterate | If user has feedback | If user has feedback |
| 10. /ship | Full pipeline | Replaced by `/ship-spike` |

### `/ship-spike`

Lightweight terminal pipeline:

1. Write the `history.md` entry — the entry IS the deliverable. Must include: research question, what was built, what was learned, recommendation (proceed / pivot / abandon).
2. Commit doc + code.
3. Push.
4. Open PR with `spike` label. PR body must include the research question + the answer. The user merges or closes — Claude does not.

### Spike-mode abuse prevention

Claude doesn't merge anything (spike or feature), so abuse-prevention is the user's call at PR review time. Two signals make abuse visible:

- The PR title must start with `spike:` and the PR carries a `spike` label.
- The PR body must answer the research question. If the body reads like a feature PR (no question, no answer, no recommendation), the user should redirect or close.

The deeper check is on Claude's side: if you're in spike mode and realize you're building a feature, **stop and rewrite the plan as `mode: feature`**. Don't smuggle features through spike mode — the heavy reviews exist for a reason.

---

## Confidence gates

Every plan must declare confidence per load-bearing assumption. The trigger for "load-bearing": **would I plan a different feature if this assumption flipped?**

### Three levels

| Level | Meaning | Effect on the loop |
|---|---|---|
| **HIGH** | The assumption is well-supported by docs, prior decisions, or unambiguous user direction. Proceed normally. | Plan can be approved; Execute proceeds on user OK. |
| **MEDIUM** | Reasonable assumption but a different choice was defensible. The plan works either way; the specific solution might not. | Plan can be approved; **the assumption is flagged in step 8 (Present)** so the user can redirect before /ship locks the PR. |
| **LOW** | A load-bearing assumption could flip the entire approach. Examples: ambiguous user intent, unresolved spec, conflicting prior decisions, unknown user preference on a one-way-door choice. | **Automatic human gate. The plan cannot proceed.** Surface the question to the user in step 2 and wait for an explicit answer that resolves the assumption (which then becomes HIGH or MEDIUM). `/critique-plan` should treat LOW-confidence plans as REDIRECT findings; the human gate is the actual enforcement. |

### How to write a confidence verdict

In the plan, for each load-bearing assumption:

```
**Assumption:** <what you're assuming>
**Confidence:** HIGH | MEDIUM | LOW
**Why:** <one line — what evidence supports the rating>
**If it flips:** <one line — what would change in the approach>
```

If "If it flips" answers "the entire approach," confidence is automatically LOW.

### Worked examples

```
Assumption: User wants Toast to dismiss on click anywhere.
Confidence: MEDIUM
Why: Common pattern but two reasonable alternatives (X-button only, swipe).
If it flips: Implementation is 5 lines different; surface posture unaffected.
```

```
Assumption: Drafts persist via localStorage rather than IndexedDB.
Confidence: LOW
Why: spec.md "Open questions" lists persistence model as undecided; user has not picked.
If it flips: Entire storage layer changes shape; tests differ; quota handling differs.
```

The first proceeds and gets flagged at Present. The second halts the plan.

### Maintenance and the 5-PR revisit

The "would I plan differently if this flipped?" trigger is fuzzy by design. After 5 real-world PRs using confidence gates, revisit whether:

- LOW is firing too often (gate is a nag).
- LOW is never firing (gate is theater).
- MEDIUM flags at Present are catching real issues or being ignored.

Adjust the trigger or rename the levels based on what we learned. Don't over-engineer the rule now.

---

## Continuous improvement

The workflow has three compounding layers of feedback, each with its own home and its own bar. **The layers form a strict precedence hierarchy** — user feedback wins ties against agent memory; preflight wins ties against both because it's mechanically verifiable.

| Layer | Home | Captures | Bar to write |
|---|---|---|---|
| **User feedback** | `core-docs/feedback.md` (FB-XXXX) | "The user wants X" — preferences, scoping calls, corrections | A future session would benefit from the rule |
| **Agent self-feedback** | `~/.claude/projects/.../memory/feedback_<name>.md` (cross-session memory) | "I tend to do X wrong; watch for it" — recurring failure patterns | Source-diversity bar (see below) + not yet mechanically checkable |
| **Preflight check** | `tools/preflight/check.mjs` | Mechanically verifiable patterns promoted from memory | The rule can be expressed as a deterministic check + user approved promotion |

The three layers are a **promotion pipeline**: user feedback shapes what gets built, agent memory shapes how it gets built, and patterns that fire repeatedly graduate from agent memory into preflight checks. Each promotion takes work off the next session's plate.

### Why agent memory needs guardrails

The risk: agent writes a memory entry → next session reads it → agent is primed to "find" the same pattern → confirmation reinforces the entry → memory shapes review behavior → next memory entry written from the shaped behavior. The compounding direction is the same as the model-collapse failure mode in synthetic-data training. The mechanism is different (prompt-level bias amplification, not weight-level drift) and the consequences are smaller (no gradient updates; user-in-loop on every PR; bounded corpus), but the direction is real.

The bigger novel risk is **process ossification**: memory entries accumulate as load-bearing rules, no one prunes them, the corpus becomes a thicket of half-true patterns the agent feels obligated to honor. Same failure mode as human-team coding standards; memory makes it worse because the entries feel authoritative when context-injected.

The five guardrails below are designed to make the asymmetry favor compounding rather than degradation.

### Agent self-feedback (memory)

Captured at `/ship` step 3b. **All five guardrails apply.**

#### Guardrail 1: Source-diversity bar (must hold before writing)

A memory entry requires evidence from **at least two of these three sources**:

- **Recurrence in time** — the same pattern appeared on a previous PR (not just the current one).
- **Two reviewers** — `/staff-review` AND `/security-review` (or any two distinct review skills) independently flagged it.
- **One review + user correction** — a review caught it AND `core-docs/feedback.md` confirms the user has flagged the same pattern.

A single review pass on a single PR is **not enough**. This kills single-source noise — the most common form of memory slop. Trade-off: the first occurrence of a real pattern goes uncaptured. That's the right trade — write on the second occurrence when the recurrence is evidence the pattern is real.

#### Guardrail 2: Mechanical-check beats memory (write the check instead, when you can)

If a preflight rule could catch the pattern deterministically, write the preflight rule (or file it as a follow-up). Memory is for judgment-level patterns that resist mechanization.

#### Guardrail 3: User feedback wins ties

If a memory entry contradicts a `core-docs/feedback.md` rule, **user feedback wins automatically**. The memory entry gets revised or archived. At session start, when reading both, surface any contradictions explicitly.

#### Guardrail 4: Hard cap (~30 entries)

Run `node tools/memory/check.mjs` to see current count. When the corpus reaches the cap, you cannot write a new entry without archiving or merging an existing one. Forces curation pressure rather than unbounded growth. Cap is tunable; revisit when it bites.

#### Guardrail 5: Periodic audit (every 5 ship runs)

`/ship` runs `node tools/memory/check.mjs --audit-due` and, if exit 1, runs a fresh-context audit pass on the memory corpus. The audit reads only the memory entries (no PR diff, no other context) and answers:
- Which entries' fire logs show no entries newer than 60 days? Candidates for archival.
- Which entries contradict each other? Surface for resolution.
- Which entries look like over-fitting on a single past incident? Revise or delete.

The audit is the cure for ossification. Cost: a few minutes every fifth ship run. (The script counts ship-skill invocations, not PRs — multiple ships on one PR during iteration each count as one tick.)

#### Format

File at `~/.claude/projects/<project-path>/memory/feedback_<short_snake_name>.md`:

```markdown
# <one-line title>

**Source:** <which review surfaced it: /staff-review, /security-review, /critique-plan, etc.>
**First seen:** YYYY-MM-DD on branch <name>
**Source-diversity evidence:** <which 2-of-3 of the guardrail-1 sources support this entry>
**Pattern:** <the failure mode in 1-3 sentences — what to watch for>
**Why I missed it:** <one line — what assumption or shortcut led to the bug>
**How to catch it next time:** <concrete check — re-read X, run Y, verify Z>
**Promotion target:** <if this becomes a preflight check someday, what would it look like>
**Fire log:** <append YYYY-MM-DD on each subsequent firing; promotion candidate at 2+ fires>
```

### Promotion path: memory → preflight (user-gated)

When a memory entry's "Fire log" reaches 2+ entries, the pattern is recurring despite the memory being there — that's the promotion signal. **Promotion is not automatic.** `/ship` surfaces the candidate to the user as a follow-up entry in `roadmap.md` ("Promote memory entry X to preflight check Y"). The user approves the promotion explicitly because preflight rules are permanent and shape every future PR — a bad rule catches false positives forever.

After approval: write the rule into `tools/preflight/check.mjs`, append "**Superseded by preflight check `<name>`**" to the memory entry, and move the file to a `memory/superseded/` subdirectory (kept for audit, not loaded into context).

### Workflow infrastructure is living

If a `staff-review` or `ship` finding suggests a missing rule, write the rule. If a debate happened during a feature and one option won, log the decision. If a step becomes friction without value, prune it. If a missed pattern would have been caught by a tighter checklist, tighten it.

Surfaces in scope: `CLAUDE.md`, `core-docs/workflow.md`, the skills under `.claude/skills/`, `tools/preflight/check.mjs`, the failure-pattern memory entries, the rules under `.claude/rules/`. **The cost of evolving the framework is one PR; the cost of running on a stale framework is every PR after.** Treat infrastructure changes with the same rigor as feature work, but don't hesitate to propose them.

### Why this matters more in autonomous mode

With more human checkpoints, the human catches recurring patterns and corrects them per-PR — the cost is the human's attention. With fewer human checkpoints (spike mode, autonomous coding), the agent has to catch its own recurring patterns. **Without self-feedback memory, the agent re-makes the same mistake every session and there's no compounding.** Memory + preflight is the mechanism that keeps quality compounding when the human steps back.

---

## Skills cheat sheet

| Skill | What it does | When |
|---|---|---|
| `/link` | Start the dev server, return URL | Whenever you need a live preview |
| `/critique-plan` | Critique plan vs. core-docs (assumption-auditor plugin) | After writing a plan, before user approval |
| `/simplify` | Cold-read changed code for reuse, clarity, efficiency; fix in-tree | After commit, before staff-review |
| `/staff-review` | Four-lens parallel review (engineer / UX / design-engineer / push-further), fix in-tree, capture follow-ups + exploration | After `/simplify`, before presenting |
| `/security-review` | Diff-focused security audit | Standalone; also invoked by `/ship` |
| `/accessibility-review` | Diff-focused WCAG 2.1 AA audit | Standalone; also invoked by `/ship` |
| `/ship` | Final-pass reviews + doc updates + commit + push + PR (no merge) | When the user says "ship it" |
| `/ship-spike` | Lightweight ship for spike-mode PRs | When the spike plan finishes |

## Optional: context-isolation agents

Two subagents exist for the rare case where a phase deserves its own clean context. They are **not** part of the default loop — the main model handles plan-writing and doc-writing in 90%+ of features. Reach for them when:

| Agent | Invoke when |
|---|---|
| `planner` | The request is large enough that writing the plan in the main thread would contaminate execution context. Outputs the plan.md work item; no code. |
| `docs` | The main thread is filled with code from a long implementation session and a clean context would produce a clearer `history.md` entry. Use when `/ship` isn't the right shape (e.g. mid-feature checkpoint). |

Neither agent can invoke skills or other agents. They produce file edits; the main model takes it from there.

---

## Anti-patterns

- **Implementing without an approved plan.** Even if the change feels small, write the plan; it takes 60 seconds and prevents 60 minutes of rework.
- **Approving a LOW-confidence plan.** The gate exists because the assumption is load-bearing. Resolve it, don't bypass it.
- **Smuggling features through spike mode.** If the deliverable is a feature, not an answer, it's a feature PR.
- **Updating `history.md` / `feedback.md` mid-feature.** Let `/ship` synthesize at the end.
- **Putting follow-ups only in the PR body.** They get lost when the PR merges. Roadmap or plan is canonical.
- **Merging.** Claude doesn't merge. Ever.
- **Skipping Preflight before /simplify.** `/simplify` is judgment work; preflight is mechanical. Don't waste the former on the latter.
- **Asking 12 questions in step 1 (Clarify).** Ask 2–4 high-leverage ones, or list assumptions with confidence.
- **Editing design tokens without updating `design-language.md`.** The doc is the source of truth.
