# Plan

The living document for what's being worked on right now, what's queued, and what to pick up next session. Longer-range work goes in `roadmap.md`. Decision history goes in `history.md`.

---

## Current Focus

**Mini design system adoption — PR C: Token + component migration.** PR A (install) and PR B (elicit + amend design language) shipped. PR C migrates `src/styles/globals.css` tokens into `packages/ui/styles/tokens.css` and migrates components one at a time to Mini primitives + archetypes. Multi-session, iterative — each component is its own small PR with its own staff-review pass.

## Handoff Notes

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

### PR C: Token + component migration (multi-session, iterative — current)

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

### PR C / Step 1: Token name-collision audit (current — ½ session, ~1 hour)

**Goal:** Identify every token name that exists in both `src/styles/globals.css` and `packages/ui/styles/tokens.css`. Determine which value wins via cascade, flag semantically-different values, and output a migration plan that names every collision and its explicit re-binding decision. This is the prerequisite for PR C Step 3 (tokens migration).

**Branch:** `pr-c-token-audit` (off `main`).

**Scope: docs-only.** No code changes. Output is a new doc `core-docs/token-migration.md`.

**Steps:**
1. `npm run build` to regenerate `dist/assets/*.css` (the merged stylesheet that ships).
2. Extract every `--<token-name>: <value>;` declaration from `src/styles/globals.css` and from `packages/ui/styles/tokens.css`. Normalize values (e.g., `0.5rem` → `8px` for comparison).
3. Compute the intersection — every token name appearing in both.
4. For each duplicate: grep `dist/assets/*.css` to confirm which value the built bundle uses (cascade winner — should be ours since `globals.css` loads last in `src/main.tsx`, but verify).
5. Categorize into:
   - **Identical values** — no migration needed; pick one source of truth in Step 3
   - **Different values, ours wins, intentional** — document the re-binding rationale (e.g., "our `--space-3: 8px` over Mini's `0.5rem` — same value, different unit, prefer px for math clarity")
   - **Different values, ours wins, accidental** — surface for explicit decision (keep ours, or accept Mini's at Step 3?)
   - **Different values, Mini's wins** — surprising; investigate cascade order assumption
6. Write `core-docs/token-migration.md` with the collision table, categorized decisions, and the Step-3 work list.
7. `npm run typecheck && npm run build` — should be no-op (no code changed).

**Out of scope (for this PR):**
- Actually changing any token values (Step 3)
- The `--accent-8` contrast matrix (Step 2)
- Component migration (Steps 4+)

**Risks / open questions:**
- **Token indirection.** Some of our tokens are derived (e.g., `--page-text: var(--sand-12)`). The audit should record the resolved value, not just the literal RHS, where indirection matters.
- **Mini exports fewer tokens than we have.** Likely — Mini's `tokens.css` is structural (axiom-driven); our `globals.css` has many project-specific tokens (`--page-tint`, `--surface-gutter`, etc.) that won't collide. The audit only needs to cover the intersection.
- **Vite bundling order.** The cascade winner depends on import order in `src/main.tsx` (Mini stylesheets → `globals.css` last) AND Vite's bundling behavior. Worth confirming by inspecting `dist/assets/*.css` directly, not assuming.

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
