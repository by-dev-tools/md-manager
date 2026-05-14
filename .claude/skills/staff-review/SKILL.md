---
name: staff-review
description: >
  Reviews the current workspace's pending changes from three parallel
  staff-level perspectives — staff engineer, staff UX designer, and staff
  design engineer — to catch bugs, regressions, accessibility gaps, and
  craft issues before requesting human review. Works on any branch with
  changes vs `origin/main`, whether or not a PR exists. Triages findings
  into BLOCKER, NIT, FOLLOW-UP; fixes blockers and cheap nits in the same
  workspace; captures follow-ups to roadmap.md/plan.md (not just the PR
  body); updates the PR body with reviewer notes when a PR exists; never
  merges. Use whenever a workstream is implementation-complete, when the
  user asks for a "staff" or "multi-perspective" review, or before opening
  a PR. Defer to `security-review` for security-specific audits.
disable-model-invocation: true
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Agent
---

# Staff-perspective review

A workstream is implementation-complete. Run three independent reviews **in parallel**, each from a distinct staff-level lens, then triage and fix before requesting human review. **Never merge.**

The source of truth is the workspace diff vs `origin/main`, **not** the PR. Uncommitted edits, committed-but-unpushed work, and an open PR are all valid inputs.

## When to invoke

- A feature's implementation is complete and the user is ready for review.
- The user asks for a "staff", "multi-perspective", or "design + engineering" review.
- Before opening a PR on any non-trivial change.

Skip if:
- The change is doc-only or a typo fix.
- The change is already merged into `main`.
- The user asked for a security review — use `security-review`.
- There is no diff vs `origin/main`.

## Why three perspectives, in parallel

Three lenses catch different classes of issue. Running them sequentially lets each prime the next; running them in parallel keeps each independent so the findings actually triangulate.

## The three perspectives

Each is a separate `Agent` call (`subagent_type: Explore`) in **a single tool message with multiple tool uses**, so they run concurrently.

### Staff engineer

Hunts: correctness, edge cases, error handling, state-management bugs, race conditions, regressions, hardcoded values that should be tokens, dead code, missing tests, contract breaks, accidental coupling.

Specifically asks:
- Does each replaced value match the new abstraction byte-for-byte (when the change claims that)?
- Are there other places in the codebase that should have been migrated but weren't? (Run a `Grep` independent of the diff.)
- Are React state updates correct under StrictMode? Any stale closures in `useEffect`?
- Is persistence (localStorage / IndexedDB / file I/O) handled with try/catch and graceful fallback?
- Are tests covering actual contracts, or are they shallow?

### Staff UX designer

Hunts: copy quality, empty/loading/error states, **accessibility** (semantic HTML, keyboard nav, focus management, ARIA, contrast, screen reader), keyboard shortcut clashes, friction in the user path, dark-mode treatment (if applicable), content-vs-chrome balance, alignment with `core-docs/design-language.md`.

Specifically asks:
- Does every error surface use the project's tone? Are raw error strings reaching the user?
- Does keyboard-only navigation cover every interactive element? Tab order sensible?
- Are focus rings visible on all focusable elements?
- Do modals trap focus and restore on close?
- Does the design hold at 200% browser zoom? At a narrow window?
- Are loading states present?
- Does this change require an addition to `design-language.md`, or does it drift from existing rules?

### Staff design engineer

Hunts: visual craft, palette fidelity, motion quality, perceptual quality across surfaces (sidebar, surface card, modals, popovers), CSS architecture (token use vs hardcoded values), micro-interactions, alignment with the existing visual system.

Specifically asks:
- Does the visible craft match the design intent in `core-docs/design-language.md`?
- Are any hardcoded hex/px values present that should be tokens (`--sand-*`, `--space-*`, `--radius-*`)?
- Do animations respect `prefers-reduced-motion`?
- Does motion duration/easing match existing patterns?
- Where the change introduces a new surface (modal, popover, card), does the chrome match the rest of the system — same radii, same shadow scale, same hue tier?

## Workflow

1. **Detect what artefact exists.** Run in parallel:
   ```sh
   git status --short
   git log --oneline origin/main..HEAD
   gh pr list --head $(git branch --show-current) --json number,url 2>/dev/null
   ```
   Classify into **PR-OPEN**, **LOCAL-ONLY**, or **NOTHING-TO-REVIEW** (stop if the last).

2. **Save the workspace diff for the reviewers** (both committed and uncommitted):
   ```sh
   { git diff origin/main..HEAD; git diff HEAD; } > /tmp/pr-diff.patch
   git ls-files --others --exclude-standard > /tmp/pr-untracked.txt
   ```
   Reviewers reference both so the prompt stays small.

3. **Launch the three reviews in parallel.** A single tool message with three `Agent` calls, each `subagent_type: Explore`. Each prompt names its lens, the diff path, the untracked-files list, the changed files, the relevant docs to read (`core-docs/design-language.md`, `core-docs/spec.md`, `core-docs/feedback.md`, and the PR body or workstream prompt if relevant), and asks for findings classified **BLOCKER / NIT / FOLLOW-UP**. Cap each review at ~1200 words.

4. **Triage.** A finding is:
   - **BLOCKER** — user-visible regression, crash, data loss, accessibility violation, contract break, broken build. **Fix in this workspace.**
   - **NIT** — real improvement, cheap (single-file, no architectural change, no new tests). **Fix in this workspace.**
   - **FOLLOW-UP** — real issue but expanding scope here is wrong (different workstream, requires design input, large refactor). **Capture, don't fix.**

   Spot-check high-impact findings against the actual code before fixing — reviewers can be confidently wrong.

5. **Apply blocker + cheap-nit fixes.** Re-run `npm run typecheck` and `npm run build` after the fixes. If a test suite exists, run it.

6. **Capture follow-ups so they aren't lost.** **Never only in the PR body.** Route them:
   - Belongs to active work → `core-docs/plan.md` under the current work item.
   - Larger / future work → `core-docs/roadmap.md` under the relevant horizon.
   - Can also mention in the PR body for reviewer awareness, but the doc entry is canonical.

7. **Communicate reviewer notes.**
   - **PR-OPEN**: `gh pr edit <number> --body "..."` — prepend/append the Reviewer notes section using the template below.
   - **LOCAL-ONLY**: send the same content as the final user-facing message of this skill. Also include the dev server URL (start it via `/link` if not running) so the user can verify in-browser.

8. **Stop.** Do not `gh pr merge`. Do not approve. Tell the user the work is ready for their review and link to the PR if one exists.

## "Reviewer notes" template

```markdown
## Reviewer notes

Three parallel reviews ran before this opened for human review.

**Staff engineer.** _Findings:_ [one-line summary]. _Acted on:_ [what was fixed]. _Deferred:_ [follow-ups → roadmap.md/plan.md location].

**Staff UX designer.** _Findings:_ ... _Acted on:_ ... _Deferred:_ ...

**Staff design engineer.** _Findings:_ ... _Acted on:_ ... _Deferred:_ ...

Build (`npm run typecheck && npm run build`) re-run after fixes: [pass/fail].
Dev URL for in-browser check: [link from /link, if running].
```

The bar is honesty over polish — if a review found nothing of consequence, say so. If you disagreed with a finding and didn't fix it, say so and why.

## Don't merge

`gh pr merge` is not part of this skill. The whole point is to hand a polished, pre-vetted change to a human reviewer; merging short-circuits that hand-off. If the user explicitly asks to merge after review, use the `ship` skill or a direct `gh pr merge` — do not infer permission from a clean review.

## Gotchas

- **Reviewers don't see the diff path automatically.** Each review prompt must include the diff path, the untracked-files list, and the changed files. Don't make the reviewer grep.
- **Untracked files are invisible to `git diff`.** Hand reviewers the `git ls-files --others --exclude-standard` list and tell them to `Read` each one.
- **Reviewers can be confidently wrong.** Spot-check high-impact findings before acting.
- **Grep finds what reviewers miss.** After the reviews, run a focused grep for patterns this change claims to introduce or migrate. Treat survivors as findings.
- **One review missing isn't a deal-breaker.** If a perspective genuinely doesn't apply (e.g. a pure data-layer change has nothing for the design engineer), say so explicitly rather than running empty reviews.
- **Scope creep is the failure mode.** "While you're here" suggestions are FOLLOW-UPs.
- **The skill ends with work ready, not merged.** No merge, no approval, no LGTM comment.
