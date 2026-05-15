# Plan

The living document for what's being worked on right now, what's queued, and what to pick up next session. Longer-range work goes in `roadmap.md`. Decision history goes in `history.md`.

---

## Current Focus

**Mini design system adoption — PR C: Token + component migration.** PR A (install) and PR B (elicit + amend design language) shipped. PR C migrates `src/styles/globals.css` tokens into `packages/ui/styles/tokens.css` and migrates components one at a time to Mini primitives + archetypes. Multi-session, iterative — each component is its own small PR with its own staff-review pass.

## Handoff Notes

- **PR C Step 1 (token name-collision audit) shipped on `pr-c-token-audit`** — `a7c6a07` (initial audit) + `6f27e49` (/simplify fixes for `--gray-a*` miss) + this ship commit. Output: `core-docs/token-migration.md` with the 14-token collision table and work lists for Step 3a + Step 3. Repo: `by-dev-tools/md-manager` (migrated from `byamron/md-manager`). FB-0022, FB-0023, FB-0024 captured. No code changed.
- **GitHub Org transfer complete** — `byamron/md-manager` is now `by-dev-tools/md-manager`. Branch protection + Rulesets preserved across transfer. Merge queue is **active** with required checks `typecheck` / `build` / `test`. Dependabot security updates enabled (two security PRs already opened: #12 esbuild+vite, #13 vite major). Secret Protection enabled. All git remotes (worktree config and Conductor workspaces) now use HTTPS.
- **Next two PRs unblock PR C Step 3 (tokens migration):**
  - **PR C Step 3a** — rename `--gray-a5/6/7` → `--tint-overlay-{light,medium,strong}` (or similar; final name decided at PR time). Touches every reference in `globals.css` + 3 component-manifest entries. Mechanical. Should be next.
  - **PR C Step 2** — `--accent-8` contrast matrix against every page-tint hue. Required before any component starts using `var(--accent-9)` for focus rings. Can run in parallel with Step 3a.
- **PR C Step 3 (tokens migration) blocked by both Step 2 and Step 3a.** When unblocked: rebind 4 radius tokens in `packages/ui/styles/tokens.css` to our values; move 29 md-manager-only tokens into a project-additions section of `tokens.css`; delete every `--*` declaration from `globals.css`. Plan in `core-docs/token-migration.md` § "PR C Step 3".
- **Surface posture is an open axiom with explicit resolution criteria** (FB-0019, `design-language.md` § "Axioms → Open axiom: surface posture"). Both floating and flat continue to ship in the DevPanel. PR C component migrations must support both postures.
- **Accent identity = `--page-tint`**, not a fixed Mini accent scale (axiom #3). Components using `var(--accent-9)` for focus/links must clear contrast against every page-tint hue (Step 2 above).
- **All components are `status: legacy`** in `core-docs/component-manifest.json`. PR C flips them to `managed` one at a time, each migration its own commit + manifest update.
- **The neutralization block at the bottom of `src/styles/globals.css`** stays until PR C migrates the components that depend on the legacy focus styling.
- **Mini per-generation log updates** are **mechanical contract artifacts** — they update inline with UI changes, not at `/ship` time.
- **Polished-features doctrine is canonical.** CLAUDE.md § "Quality posture" + FB-0007 + FB-0008.
- Persistence, repo sync, and search remain unresolved; see "Open questions" in `spec.md`. These come after Mini adoption settles.
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

### PR C / Step 3a: `--gray-a*` rename (next — mechanical, ~½ session)

**Goal:** Rename `--gray-a5/6/7` (our page-tint wash overlays) to `--tint-overlay-{light,medium,strong}` (final name decided at PR time) to remove the names-clash with Mini's Radix-imported `--gray-a*` scale. Mechanical rename across `globals.css` + 3 component-manifest entries. Lands before Step 3 so Step 3's diff stays purely about duplicate-removal + value-rebinding.

**Branch:** `pr-c-gray-a-rename` (off `main`).

**Scope: code change** (small) + manifest update.

**Implementation steps:**
- [ ] Decide final token names. Recommendation: `--tint-overlay-light`, `--tint-overlay-medium`, `--tint-overlay-strong`. Confirm with user at plan approval.
- [ ] Rename `--gray-a5/6/7` declarations in `:root` of `src/styles/globals.css`.
- [ ] Update every CSS selector in `globals.css` that references the old names.
- [ ] Update `core-docs/component-manifest.json` `tokens_referenced` arrays for any component listing `gray-a*` (search and verify).
- [ ] `npm run typecheck && npm run build` clean.
- [ ] Verify in `dist/assets/*.css`: our 3 declarations now use new names; Mini's Radix-imported `--gray-a*` (12-step) still present and untouched.
- [ ] /simplify + /ship.

**Risks / open questions:**
- **Token name bikeshed.** `--tint-overlay-*` is one option; `--page-overlay-*` is another. Decide at plan time.
- **Component-manifest accuracy.** Some components may already be `legacy` and accurate; some may be stale. Verify by grepping `src/components/` for `gray-a` usage and reconciling with manifest entries.

### PR C / Step 2: `--accent-8` contrast matrix (parallel to Step 3a, blocks Step 4+)

**Goal:** Verify that `var(--accent-8)` (Radix indigo-8 = `#8da4ef`) clears ≥3:1 contrast against every page-tint hue the color rail produces. Required before any component starts using `var(--accent-8)` or `var(--accent-9)` for focus rings, links, or selected state. Output: a contrast pass/fail table per hue + an axiom amendment if any hue fails.

**Branch:** `pr-c-accent-contrast` (off `main`).

**Scope: docs-only.** No code changes. Output is an entry in `core-docs/token-migration.md` (or its own doc — decide at plan time).

**Implementation steps:**
- [ ] Enumerate the color-rail hue space (the HSL gradient + the 8 preset swatches) from `src/components/ColorRail.tsx`.
- [ ] For each hue, compute the contrast ratio between `--accent-8` (indigo-8) and the corresponding `--page-tint` value.
- [ ] Flag any hue where contrast < 3:1 (WCAG AA for UI components).
- [ ] If any fail: propose a fix. Options include (a) using `--accent-9` instead, (b) re-binding accent to a different scale for that hue range, (c) adding axiom #10 (focus style) amendment that names the workaround.
- [ ] Update `core-docs/token-migration.md` (or new doc) with the matrix + decision.

**Risks / open questions:**
- **HSL gradient is continuous, not a finite set.** Sampling decision: test the 8 presets + a 16-step sweep of the gradient (24 total). Confirm at plan time.
- **Indigo-8 may fail on dark page tints.** If so, the resolution affects axiom #10 (focus style) and may force a change to the design-language `--accent-8`-reservation language.

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

- **PR C Step 1 — Token name-collision audit (branch `pr-c-token-audit`)** — Output: `core-docs/token-migration.md` with the 14-token collision table (4 radius, 4 space, 3 weight, 3 gray-a) + work lists for Step 3a (rename) and Step 3 (migration). Ours wins via cascade for every collision as expected. FB-0022/0023/0024 captured. No code changed. 2026-05-15.
- **GitHub Org transfer + HTTPS remote flip** — `byamron/md-manager` → `by-dev-tools/md-manager` (unlocks merge queue for personal-account repos). Branch protection / Rulesets preserved. Merge queue active with required checks `typecheck` / `build` / `test`. Dependabot security updates + Secret Protection enabled. All worktree remotes on HTTPS so Conductor workspaces can clone/push without SSH keys. FB-0022 captured. 2026-05-14.
- **Workflow: `/critique-plan` inserted into step 3** — Branch `pasted-text-import`. `.claude/rules/plan-discipline.md` reminds the planner to read `spec.md` / `feedback.md` / `design-language.md` before drafting. `core-docs/workflow.md` step 3 now runs `/critique-plan` (assumption-auditor plugin) between plan draft and user approval. Additive — human gate unchanged. 2026-05-14.
- **CI gates + Dependabot (PR #10)** — Three parallel jobs (typecheck/build/test) on `pull_request` and `merge_group` events; workflow-level `permissions: { contents: read }`. Dependabot configured for npm with version-updates suppressed. FB-0020, FB-0021 captured. 2026-05-14.
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
