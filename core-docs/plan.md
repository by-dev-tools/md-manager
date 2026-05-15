# Plan

The living document for what's being worked on right now, what's queued, and what to pick up next session. Longer-range work goes in `roadmap.md`. Decision history goes in `history.md`.

---

## Current Focus

**Workflow unification — PR 2: Port preflight + failure-pattern memory infrastructure.** PR 1 (canonical workflow + spike mode + confidence gates + memory tooling + 5 anti-slop guardrails) shipped on `unify-workflows`. PR 2 ports designer's `tools/preflight/check.mjs` adapted to md-manager's TS-only stack, implements the `/ship-spike` runtime stubbed in PR 1, and ports designer's existing failure-pattern memory entries (filtered through guardrails 1–3 before importing). PR C (Mini token+component migration) is paused until workflow infra settles.

## Handoff Notes

- **PR 1 (workflow unification) shipped on `unify-workflows`.** Doc + tooling only. New canonical workflow.md (11 steps, 1=Clarify), spike/tiny modes, confidence gates, three-layer feedback model with 5 guardrails on agent memory. `tools/memory/check.mjs` resolves to harness-canonical memory dir via candidate scoring; override via `MEMORY_DIR` env var or gitignored `tools/memory/.memory-dir` file. Path-validates external inputs (defense-in-depth). PR C (Mini migration) paused until PR 2 settles.
- **CI setup shipped on `ci-setup`** — `cacf331` (workflow + dependabot) + `98ab10d` (/simplify concurrency-group fix) + this ship commit. Workflow-level `permissions: { contents: read }` added in this commit per security review. Required-check names that branch protection should gate on: `typecheck`, `build`, `test`.
- **After merging `ci-setup`, do these repo-settings steps** (none can be done in-tree): (1) Branch protection on `main` → require status checks `typecheck` + `build` + `test`; (2) Same rule → require merge queue (squash method, build concurrency 1, batch min/max 1/5, wait 5 min, timeout 60 min); (3) Settings → Code security and analysis → enable "Dependabot security updates"; (4) repo merge-button settings → restrict to squash-only.
- **PR B (Mini design-language amendment) shipped on `mini-elicit`** — `97ff141` (axioms + manifest + logs + CLAUDE.md) + `87869d7` (/simplify fixes) + ship commit. Merged as PR #9. `/simplify` ran 3 MUST FIX + 1 NIT; staff/security/a11y reviews skipped per their docs-only rules. No code changed; visible UI byte-identical to `main`.
- **Surface posture is an open axiom with explicit resolution criteria** (FB-0019, `design-language.md` § "Axioms → Open axiom: surface posture"). Both floating and flat continue to ship in the DevPanel. PR C component migrations must support both postures — do not assume one. Decision happens via dogfooding signal, an archetype constraint, or an explicit user call.
- **Accent identity = `--page-tint`**, not a fixed Mini accent scale (axiom #3). `indigo` is reserved at the root via `data-accent="indigo"` for focus-ring rebinding but is currently neutralized. PR C components that use `var(--accent-8)` / `var(--accent-9)` (focus rings, links, selected state) must clear ≥3:1 against every page-tint hue the color rail can produce. The contrast matrix is the first PR-C prerequisite (already in roadmap.md under "From PR A staff review").
- **All components are `status: legacy`** in `core-docs/component-manifest.json`. PR C flips them to `managed` one at a time, each migration its own commit + manifest update.
- **The neutralization block at the bottom of `src/styles/globals.css`** (`img/video/svg display`, universal `:focus-visible` ring) stays until PR C migrates the components that depend on the legacy focus styling. Remove the block incrementally as components migrate.
- **Mini per-generation log updates** (component-manifest.json, generation-log.md, pattern-log.md) are **mechanical contract artifacts** — they update inline with UI changes, not at `/ship` time. This is explicit in CLAUDE.md § "Mini Design System" → "Procedure for UI tasks". Narrative docs (history.md, plan.md, roadmap.md, spec.md, feedback.md) remain `/ship`-owned.
- **PR C prerequisites already captured in `roadmap.md`** under "From PR A staff review (Mini install)": token name collision audit (highest-priority), `--accent-8` contrast validation across user page tints, alias scheme reconciliation (single `@mini` vs split), tsconfig include expansion, sync-mini.sh error-handling hardening.
- **Polished-features doctrine is canonical.** CLAUDE.md § "Quality posture" + FB-0007 + FB-0008. Every scoping decision runs through wire-vs-defer.
- Persistence, repo sync, and search remain unresolved; see "Open questions" in `spec.md`. These come after Mini adoption settles.

## Active Work Items

### Workflow unification — PR 2: Port preflight + failure-pattern memory (current)

**Goal:** Adapt designer's `tools/preflight/check.mjs` to md-manager's TS-only stack and wire it as the required gate between Execute (step 3) and /simplify (step 6). Implement the `/ship-spike` runtime stubbed in PR 1. Port the relevant failure-pattern memory entries from designer (filtered through PR 1's source-diversity bar before importing).

**Mode:** feature

**Scope (in):**
- `tools/preflight/check.mjs` for md-manager: typecheck + build + test + token-invariant check + manifest check (drop cargo gates entirely; keep TS gates only). Wire as the bundled command referenced by `core-docs/workflow.md` § Preflight.
- Implement `.claude/skills/ship-spike/SKILL.md` runtime — currently a doc/spec; needs to actually orchestrate (read plan, write history entry, commit, push, open labeled PR).
- Port designer's failure-pattern memory entries through PR 1's source-diversity bar:
  - `feedback_verify_tokens.md` — likely passes (markdown app uses tokens too).
  - `feedback_aria_live_for_spec_announcements.md` — needs adaptation; markdown app has no spec-driven announcements yet.
  - `feedback_doc_orphans_after_merge.md` — TypeScript analog (orphan exports after merge).
- Add a preflight rule for "tool inputs that resolve to filesystem paths must be path-validated against an allow-list root" — the rule that would have caught the `tools/memory/check.mjs` finding before the security review did. Filed during PR 1's security review.

**Scope (out):**
- New invariants beyond what designer already has — port, don't extend.
- Designer-side adoption (PR 3 in a separate workspace).

**Spec-walk checkboxes:**
- [ ] `tools/preflight/check.mjs` exists and passes on the current tree
- [ ] Each gate (typecheck, build, test, invariants, manifest) is independently invocable
- [ ] `/ship-spike` skill orchestrates a real spike-mode commit + push + labeled PR (manual smoke test on a throwaway branch)
- [ ] Ported memory entries each meet PR 1's source-diversity bar (recurrence in time + at least one other source)
- [ ] Path-validation preflight rule added; `tools/memory/check.mjs` passes it
- [ ] `core-docs/workflow.md` § Preflight no longer says "if present" — the script is now real

**Confidence verdict:**
- **Preflight script port: HIGH** — designer's is well-trodden; adapting to TS-only is mechanical.
- **`/ship-spike` runtime shape: MEDIUM** — never built one; might need iteration on the smoke test. Risk: discovers the spec is incomplete; surfaces gaps to fold back into PR 1 doc. If it flips: one extra commit on this branch to fix the spec, no architectural change.
- **Memory-entry port through guardrails: MEDIUM** — Designer's entries were written before the source-diversity bar existed; some may not pass on import. If one fails: skip the import (it's not a regression — md-manager has zero memory entries today). If multiple fail: the bar may be too strict; revisit after PR 5 per the 5-PR review baked into PR 1.

**Risks / open questions:**
- The path-validation preflight rule is broader than just `tools/memory/check.mjs` — should it also cover any future `tools/*` script? Likely yes; scope explicitly during PR 2.
- `/ship-spike` smoke test requires creating a throwaway branch + PR + closing it. Choose a benign research question for the smoke (e.g. "does the harness load memory entries from the canonical path?").

**Files touched (anticipated):**
- `tools/preflight/check.mjs` (new)
- `tools/preflight/.gitignore` (probably empty initially)
- `.claude/skills/ship-spike/SKILL.md` (already exists; implementation may add helpers)
- `~/.claude/projects/<canonical>/memory/feedback_*.md` (~3 entries imported)
- `core-docs/workflow.md` (§ Preflight updated to point at real script)

### PR C: Token + component migration (multi-session, iterative — paused for workflow work)

**Goal:** Migrate `src/styles/globals.css` tokens to Mini's `packages/ui/styles/tokens.css`. Migrate components one at a time to Mini primitives + archetypes. Remove duplicate machinery (custom Toast → Mini Toast archetype). Pass the invariant check on `src/`. Flip each component's `status` in `core-docs/component-manifest.json` from `legacy` → `managed` as it migrates.

**Order (rough, sequenced for incremental review):**
1. **Token name-collision audit first** (highest-priority prerequisite from `roadmap.md` "From PR A staff review"). Build the project; grep `dist/assets/*.css` for each duplicated token name; document which value wins. Decide intentional re-bindings explicitly. Output: a token-migration plan that names every collision.
2. **`--accent-8` contrast matrix** against every page-tint hue the color rail produces. Required before the first component uses `var(--accent-9)` for focus rings or links. Output: contrast pass/fail per hue + an axiom amendment if a hue fails.
3. **Tokens migration.** Rewrite `packages/ui/styles/tokens.css` (fork-and-own) with our project values; delete duplicated `--space-*`, `--radius-*`, `--sand-*`, `--type-*` from `globals.css`.
4. **Toast.** Replace `src/components/Toast.tsx` with Mini's Toast archetype, keep our `<ToastProvider>` API surface so callers don't change. Flip manifest entry to `managed`.
5. **Dialogs / popovers.** AttachPopover, AddRepoModal → Mini Popover / Dialog archetypes. Each is its own PR.
6. **Layout primitives.** Sidebar, Editor frame, ColorRail → Mini Box/Stack/Cluster/Sidebar/Container primitives where they fit. Keep contenteditable + FloatingToolbar custom.
7. **Invariant check passes on `src/`** as each component migrates. Final pass: `node tools/invariants/check.mjs src/` clean.

**Constraints carried from PR B:**
- **Both surface postures must continue to work** through PR C. The DevPanel toggle stays. Any archetype migration must support both `mode-floating` and `mode-flat` body classes — do not pick one and remove the other without an explicit user call.
- **`--page-tint` is the accent**, not a fixed Mini accent scale. Components that use `var(--accent-9)` for focus/links must clear contrast against every hue on the color rail.

PR C is **iterative across sessions** — each component migration is its own small PR with its own `/simplify` + `/staff-review` pass.

### Template for a work item

```
### [Feature / Work Item Title]

**Goal:** [1–3 sentences in user terms.]

**UX goals:**
- [Desired experience bullet]
- [Desired experience bullet]

**Implementation steps:**
- [ ] [Step description]
- [ ] [Step description]
- [ ] Update history.md + plan.md as part of /ship

**Risks / open questions:**
- [Anything that might block or surprise]
```

---

## Recently Completed

_(Last 3–5 items. Older items live in `history.md`.)_

- **Workflow unification: canonical loop + spike mode + confidence gates + agent self-feedback** — Branch `unify-workflows`, this ship commit. Doc + tooling PR. New canonical `core-docs/workflow.md` (11 steps; intended to drop into both md-manager and Designer), spike/tiny mode escape hatches, confidence gates with LOW=human-gate, spec-walk-as-checkboxes, three-layer continuous-improvement model (user feedback → agent memory → preflight), 5 guardrails on agent memory to prevent compounding slop. New `.claude/skills/ship-spike/SKILL.md` (lightweight terminal for exploratory PRs), `tools/memory/check.mjs` (corpus health + audit-due counter with harness-canonical dir resolution + path validation). Updated `CLAUDE.md`, `.claude/rules/plan-discipline.md`, `.claude/skills/ship/SKILL.md`. FB-0022 (self-audit before /ship for workflow infra), FB-0023 (surface feedback-loop failure modes proactively) captured. 2026-05-15.
- **Workflow: `/critique-plan` inserted into step 3** — Branch `pasted-text-import`, commit `5f128c4..[ship]`. New `.claude/rules/plan-discipline.md` reminds the planner to read `spec.md` / `feedback.md` / `design-language.md` before drafting. `core-docs/workflow.md` step 3 now runs `/critique-plan` (assumption-auditor plugin) between plan draft and user approval, with BLOCKER / REDIRECT / FOLLOW-UP triage. Additive — human gate unchanged. Plugin-absence is a silent skip. No `feedback.md` entry per task scope. 2026-05-14.
- **CI gates + Dependabot (branch `ci-setup`)** — Three parallel jobs (typecheck/build/test) on `pull_request` and `merge_group` events; concurrency scoped by event-name + ref; workflow-level `permissions: { contents: read }`. Dependabot configured for npm with version-updates suppressed (security updates flow via repo settings). Unblocks the merge queue gate. FB-0020, FB-0021 captured. 2026-05-14.
- **Mini design language amended (PR B, #9)** — Branch `mini-elicit`, commits `97ff141..ship`. Explicit Axioms section answers all 10 Mini axioms; surface-posture flagged as an open axiom (both floating and flat ship for dogfooding). Component manifest, pattern-log, generation-log seeded. CLAUDE.md Mini section appended. FB-0018, FB-0019 captured. No code changed. 2026-05-14.
- **Mini design system installed (PR A)** — Branch `mini-install`, commits `0d17846..[ship]`. Primitives, archetypes, stylesheets, 6 skills, invariants, templates landed in `packages/ui/` at SHA `83df0b2` (Designer parity). 12 Radix peer deps installed. Stylesheets wired in `main.tsx`; HTML root `class="light-theme" data-accent="indigo"`. No app component migrated. SAFETY: `scripts/sync-mini.sh` snapshots+restores project skills around Mini's destructive `rsync --delete`. FB-0016, FB-0017 captured. 2026-05-14.
- **Sidebar hanging-icon nav redesign + section-spacing dev knob** — PR #6 (`3f5564a`). Replaced SourceRow with NavSection/Collapse/NavRow. Counts now on collapsed sections. Drafts grouped under synthetic folder. DevPanel renamed "Sidebar sans" → "Sidebar mono"; dropped inert File icons toggle + Tree layout select. 2026-05-13.
- **Design-rule feedback synthesis FB-0010..FB-0015** — PR #5 (`8bede71`). Captured design rules from the sidebar/editor redesign work. 2026-05-13.
- **Slices A + B of PR #2 staff-review triage** — Safety bundle (drafts, XSS, native dialogs, link wiring), editor performance + a11y + vitest, plus staff-review and ship-pass review fixes. Doctrine: polished features, expand scope not quality (FB-0007). PR #2, branch `address-agentation-comments`. 2026-05-13.

## Backlog

Quick captures that haven't been promoted to roadmap.md yet. Promote when an idea sharpens or gets picked up.

- Decide on persistence model (localStorage / IndexedDB / FSA API)
- Decide on repo-sync model (local FS watcher vs GitHub API vs both)
- Search across drafts and repo files
- Dark mode (or explicit decision to skip for v1)
- Tags / frontmatter
- Keyboard-shortcut help overlay (`?`)
- Export / share view
