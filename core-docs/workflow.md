# Workflow

How features get built and shipped on md-manager. Every non-trivial change follows this loop. Skills automate the heavy steps — this doc is the canonical narrative. `CLAUDE.md` shows the same loop in cheat-sheet form; this is the full version.

---

## The loop

```
1. Request         user proposes a feature / change / fix
2. Clarify         Claude asks targeted questions, reviews relevant docs
3. Plan            Claude writes a plan; user approves or redirects
4. Execute         Claude implements
5. Commit          Claude commits with a clear "why" message
6. Staff review    /staff-review — three lenses in parallel; small fixes in-tree
7. Present         Claude shares the review report + dev URL + PR (not merged)
8. Iterate         user gives feedback; Claude addresses it
9. Ship            /ship — security + a11y final pass, doc updates, PR opens
10. (user merges)  Claude never merges
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

User approves, redirects, or asks for revision. **Claude does not start executing until the plan is approved.**

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

## 6. Staff review

Run `/staff-review`. Three Explore agents review the diff in parallel from three lenses (staff engineer / staff UX / staff design engineer). Findings are triaged:
- **BLOCKER** — fix in-tree now. User-visible regression, crash, accessibility violation, broken build.
- **NIT** — fix in-tree if cheap. Single-file, no architectural change.
- **FOLLOW-UP** — capture to `roadmap.md` or `plan.md`, **never only in the PR body.** Mention in PR body for reviewer awareness; the doc entry is canonical.

**Bias toward fixing small, defined issues.** Larger questions and deferred items go to roadmap/plan with rationale, not into review-comment limbo.

If staff-review touches design rules, accessibility patterns, or product decisions that need to persist, the relevant rule goes into `design-language.md` or `feedback.md` so we don't relearn it next time.

## 7. Present

Claude returns:
- The Reviewer notes (findings, what was fixed, what was deferred and where).
- The dev server URL (`/link` if not running) so the user can verify in-browser.
- The PR link if one exists; otherwise the local branch state.

**Never merged.** The whole point of review is the human hand-off.

## 8. Iterate

User responds with feedback. Claude addresses it — code changes, doc updates, more review if scope changed materially. Each iteration is a normal request/clarify/plan/execute loop in miniature.

## 9. Ship

User says "ship it" (or `/ship`). Claude runs the ship pipeline:
1. Final-pass `/security-review` + `/accessibility-review` in parallel (sharper focus than staff-review's general lenses).
2. Apply blocker / cheap-nit fixes.
3. **Synthesize session feedback** — review the conversation since the last PR for corrections, preferences, decisions, and solved challenges. New entries go in `feedback.md`.
4. **Update core docs** — `history.md` (what + why + decisions + tradeoffs), `plan.md` (move shipped to completed, refresh current focus), `roadmap.md` (deferred follow-ups), `spec.md` (feature status / new surface area).
5. Commit doc updates.
6. Push and open the PR (or push to existing PR).
7. Output the PR URL.

**Still never merged.** The user merges.

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
| `/staff-review` | Three-lens parallel review, fix in-tree, capture follow-ups | After implementation, before presenting |
| `/security-review` | Diff-focused security audit | Standalone; also invoked by `/ship` |
| `/accessibility-review` | Diff-focused WCAG 2.1 AA audit | Standalone; also invoked by `/ship` |
| `/ship` | Final-pass reviews + doc updates + commit + push + PR (no merge) | When the user says "ship it" |

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
