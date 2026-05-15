# Workflow

How features get built and shipped on md-manager. Every non-trivial change follows this loop. Skills automate the heavy steps — this doc is the canonical narrative. `CLAUDE.md` shows the same loop in cheat-sheet form; this is the full version.

---

## The loop

```
 1. Request         user proposes a feature / change / fix
 2. Clarify         Claude asks targeted questions, reviews relevant docs
 3. Plan            Claude writes a plan; runs /critique-plan; user approves or redirects
 4. Execute         Claude implements
 5. Commit          Claude commits with a clear "why" message
 6. Simplify        /simplify — reuse, clarity, efficiency; fix in-tree
 7. Staff review    /staff-review — three lenses in parallel; small fixes in-tree
 8. Present         Claude shares the review report + dev URL + branch state
 9. Iterate         user gives feedback; Claude addresses it
10. Ship            /ship — security + a11y final pass, doc updates, PR opens
11. (user merges)   Claude never merges
```

Each numbered step is described below.

---

## 1. Request

User states a feature, change, or fix. May be one line, may be a paragraph.

## 2. Clarify

Claude:
- Asks **2–4 focused questions** to fill in gaps. Don't ask a wall of 20.
- Reads relevant docs **before** asking — `spec.md`, `plan.md`, `feedback.md`, `design-language.md`, and any directly-related code.
- Surfaces conflicts with existing docs ("the spec says X, but you're asking for Y — which wins?").

The goal is to leave Step 2 with enough shared understanding to plan without ambiguity.

## 3. Plan

Claude writes a plan covering:
- **Scope** — what's in, what's deliberately out.
- **Approach** — high-level technical and UX direction.
- **Risk** — failure modes, files at risk, tradeoffs being made.
- **Files touched** — anticipated paths.
- **Doc updates expected** — which core docs will change as a result.

Then run `/critique-plan` (assumption-auditor plugin). The plan-critic reviews the plan against the user's request and `core-docs/*.md`, returning either `APPROVED` or a `CRITIQUE SUMMARY` with BLOCKER / REDIRECT / FOLLOW-UP findings.

- **BLOCKER** — fix in-plan before showing it to the user.
- **REDIRECT** — surface to the user as part of the approval conversation.
- **FOLLOW-UP** — capture to `plan.md` or `roadmap.md`, do not block.

If the assumption-auditor plugin is not installed, skip the critique step and rely on the human gate alone.

User approves, redirects, or asks for revision. **Claude does not start executing until the plan is approved.** The critic informs the user's decision; it does not replace the human gate.

## 4. Execute

Claude implements the approved plan. During execution:
- Stays in scope. New scope discovered mid-execution gets surfaced, not silently absorbed.
- Reads `feedback.md` and `design-language.md` before touching UI.
- Reads safety-critical files' recent git log before modifying them (see `.claude/rules/safety.md`).
- Uses tokens (`--sand-*`, `--space-*`, `--radius-*`) instead of hardcoded values.

## 5. Commit

Claude commits the changes with a message that explains **why**, not what. Subject under 70 chars; body if the why takes more than a line. Co-author trailer:
```
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

Why commit before review? It gives reviewers a stable artifact and avoids losing work to an accidental edit.

## 6. Simplify

Run `/simplify`. The skill cold-reads the changed code for **reuse, quality, and efficiency** and fixes issues in-tree:
- Duplicated logic that could collapse into a helper.
- Functions doing two unrelated things; split them.
- Premature abstractions to delete (one caller, no second one coming).
- Dead code, unused imports, commented-out blocks.
- Mid-function early-returns hiding state machines that want their own function.
- Performance footguns that match a known pattern (e.g. O(n²) where O(n) reads the same; useEffect deps misses that re-run heavy work).

Why before staff review? If staff-review ran first, half its NITs would be "this is overcomplicated" — `/simplify` removes that class of finding pre-emptively so the three-lens review can focus on architecture, correctness, and craft instead of "this could be shorter."

Commit the simplify fixes separately (or amend if a single line). Re-run `npm run typecheck && npm run build && npm test` before moving on; refactors are exactly where tests earn their keep.

## 7. Staff review

Run `/staff-review`. Three Explore agents review the diff in parallel from three lenses (staff engineer / staff UX / staff design engineer). Findings are triaged:
- **BLOCKER** — fix in-tree now. User-visible regression, crash, accessibility violation, broken build.
- **NIT** — fix in-tree if cheap. Single-file, no architectural change.
- **FOLLOW-UP** — capture to `roadmap.md` or `plan.md`, **never only in the PR body.** Mention in PR body for reviewer awareness; the doc entry is canonical.

**Bias toward fixing small, defined issues.** Larger questions and deferred items go to roadmap/plan with rationale, not into review-comment limbo.

If staff-review touches design rules, accessibility patterns, or product decisions that need to persist, the relevant rule goes into `design-language.md` or `feedback.md` so we don't relearn it next time.

## 8. Present

Claude returns:
- The Reviewer notes (findings, what was fixed, what was deferred and where).
- The dev server URL (`/link` if not running) so the user can verify in-browser.
- The branch and commit state. **No PR exists yet** — that's `/ship`'s job (see § 10 below for why).

**Never merged.** The whole point of review is the human hand-off.

## 9. Iterate

User responds with feedback. Claude addresses it — code changes, doc updates, more review if scope changed materially. Each iteration is a normal request/clarify/plan/execute loop in miniature.

## 10. Ship

User says "ship it" (or `/ship`). Claude runs the ship pipeline:
1. Final-pass `/security-review` + `/accessibility-review` in parallel (sharper focus than staff-review's general lenses).
2. Apply blocker / cheap-nit fixes.
3. **Synthesize session feedback** — review the conversation since the last PR for corrections, preferences, decisions, and solved challenges. New entries go in `feedback.md`.
4. **Update core docs** — `history.md` (what + why + decisions + tradeoffs), `plan.md` (move shipped to completed, refresh current focus), `roadmap.md` (deferred follow-ups), `spec.md` (feature status / new surface area).
5. Commit doc updates.
6. Push and open the PR (or push to existing PR).
7. Output the PR URL.

**Still never merged.** The user merges.

### Why the PR opens here, not earlier

The PR is **deliberately the last artefact created**, not the first. Three reasons:

1. **Single-reviewer workflow.** The PR isn't a team-collaboration surface; it's "the work is done, please merge." Opening it mid-pipeline would create a half-done state nobody benefits from — the user is the only human reader.
2. **Doc synthesis is load-bearing and has to be last.** `history.md` / `plan.md` / `roadmap.md` / `spec.md` / `feedback.md` only get written after every review has surfaced its findings. A PR opened before that would either lie about what's been done, or require repeated body edits as each review completed. The canonical "what shipped" record lives in those committed docs — not the PR body — and that record has to exist before the PR opens.
3. **CI doesn't help us earlier.** The local gates (`npm run typecheck && npm run build && npm test`) already cover what CI would tell us. There's no green/red signal we'd get from a remote that we don't have on the laptop.

**When this calculus changes:** a second human reviewer joins the project, deploy previews land (Vercel/Netlify) giving the PR a clickable URL, or CI starts running checks the laptop can't (visual regression, perf budget). Until then, end-of-pipeline PR creation is correct.

## Continuous improvement

Every PR pass adds to `feedback.md`. The point isn't to log every conversation — it's to capture rules that will save a future session from repeating a mistake. Examples:
- "User prefers single bundled PR over splitting cosmetic refactors" → FB entry.
- "Markdown sanitizer must run on paste, not just on render" → FB + history entry.
- "We chose CSS variables over Tailwind because we wanted color tokens to be runtime-settable" → DECISIONS-style note in `history.md`.

If a `staff-review` or `ship` finding suggests a missing rule, write the rule. If a debate happened during a feature and one option won, log the decision so we don't reopen it next month.

## Skills cheat sheet

| Skill | What it does | When |
|---|---|---|
| `/link` | Start the Vite dev server, return URL | Whenever you need a live preview |
| `/simplify` | Cold-read changed code for reuse, clarity, efficiency; fix in-tree | After commit, before staff-review |
| `/staff-review` | Three-lens parallel review, fix in-tree, capture follow-ups | After `/simplify`, before presenting |
| `/security-review` | Diff-focused security audit | Standalone; also invoked by `/ship` |
| `/accessibility-review` | Diff-focused WCAG 2.1 AA audit | Standalone; also invoked by `/ship` |
| `/ship` | Final-pass reviews + doc updates + commit + push + PR (no merge) | When the user says "ship it" |
| `/critique-plan` | Critique plan for scope/spec/coherence vs. core-docs | After writing a plan, before user approval |

## Optional: context-isolation agents

Two subagents exist for the rare case where a phase deserves its own clean context. They are **not** part of the default loop — the main model handles plan-writing and doc-writing in 90%+ of features. Reach for them when:

| Agent | Invoke when |
|---|---|
| `planner` (`claude --agent planner`) | The request is large enough that writing the plan in the main thread would contaminate execution context. Outputs the plan.md work item; no code. |
| `docs` (`claude --agent docs`) | The main thread is filled with code from a long implementation session and a clean context would produce a clearer `history.md` entry. Use when `/ship` isn't the right shape (e.g. mid-feature checkpoint). |

Neither agent can invoke skills or other agents. They produce file edits; the main model takes it from there.

## Anti-patterns

- **Implementing without an approved plan.** Even if the change feels small, write the plan; it takes 60 seconds and prevents 60 minutes of rework.
- **Putting follow-ups only in the PR body.** They get lost when the PR merges. Roadmap or plan is canonical.
- **Merging.** Claude doesn't merge. Ever.
- **Skipping `feedback.md` synthesis during ship.** That's where continuous improvement compounds.
- **Editing design tokens without updating `design-language.md`.** The doc is the source of truth.
- **Asking 12 questions in step 2.** Ask 2–4 high-leverage ones.
