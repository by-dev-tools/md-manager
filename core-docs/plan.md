# Plan

The living document for what's being worked on right now, what's queued, and what to pick up next session. Longer-range work goes in `roadmap.md`. Decision history goes in `history.md`.

---

## Current Focus

**Mini design system adoption — PR A: Install.** Land the Mini files (primitives, archetypes, styles, skills, invariants, templates) in the canonical `packages/ui/` layout, wire the stylesheets and HTML root, and verify the build is still green — **without migrating any app code yet**. The current `src/styles/globals.css` and all components keep working unchanged after this PR. PR B (elicit + evolve the existing design language) and PR C (token + component migration) follow in later sessions.

Branch: `mini-install` (create when execution begins).

## Handoff Notes

- **PR #6 merged** (`3f5564a`) — sidebar hanging-icon redesign + section-spacing dev knob. Plan.md was not updated post-merge; that work obsoleted parts of the old Slice C (folder counts now live on collapsed sections via the NavSection/Collapse pattern). The remaining open polish items from Slice C/D (contrast audit on italic drafts, drafts visual-treatment revisit, toolbar glyph unification) are deferred — Mini adoption may absorb them and re-litigating before that lands is wasted effort.
- **PR #5 merged** (`8bede71`) — captured FB-0010..FB-0015 design-rule feedback. Read those before any UI work.
- **PR #2 merged** — Slices A (safety bundle) + B (editor performance + a11y + vitest) shipped. 20/20 tests passing. `npm run typecheck && npm run build && npm test` should remain clean throughout the Mini install.
- **md-manager is a sister app to Designer.** Designer is currently synced against Mini SHA `83df0b288523e51ba5ec54f4b126cc7591d1d1db` (`83df0b2`, April 2026). User decision needed: pin md-manager to the same SHA for family lockstep, or sync against Mini HEAD.
- **Design-language preservation is non-negotiable.** The existing `core-docs/design-language.md` (~1700 lines, hand-written, captures sister-app framing + page-tint rail + surface posture open question) is the **starting point** for PR B's elicitation, not something to overwrite. PR B's `/elicit-design-language` run will operate in **archaeology mode** if we move the existing doc out of the way first (e.g., rename to `design-language.legacy.md`) so the skill produces a fresh Mini-axiom-shaped doc, which we then **merge** with the legacy content (manual stitch). The legacy doc is preserved in git history regardless.
- **Polished-features doctrine is canonical.** CLAUDE.md § "Quality posture" + FB-0007 + FB-0008. Every scoping decision runs through wire-vs-defer.
- **Two open questions Mini will help close:**
  1. **Surface posture** (floating vs flat vs both) gets forced by Mini's "surface hierarchy depth" axiom (1–4 tiers). Resolve in PR B's elicitation.
  2. **CSS architecture** (1340-line globals.css, scattered z-index, raw `rgba()` in toast/toolbar) is intentionally deferred to be absorbed by Mini's token + per-component CSS structure in PR C.
- The `package.json` still says `"name": "mumbai"`. Low-priority cleanup; rename when next touching it.
- Persistence, repo sync, and search remain unresolved; see "Open questions" in `spec.md`. These come after Mini adoption settles.

## Active Work Items

### Mini design system adoption — PR A: Install

**Goal:** Land Mini's primitives, archetypes, stylesheets, skills, invariants, and templates in the canonical `packages/ui/` layout. Wire the four Mini stylesheets and the HTML root attributes so the system is *available* to the app. **Do not migrate any app code, tokens, or components in this PR.** The existing `src/styles/globals.css` keeps owning the visible UI; Mini's tokens and primitives sit alongside, ready for PR C to migrate against. Result: build/typecheck/tests green, app renders identically to today, Mini files committed and the sync wrapper installed.

**UX goals:**
- **Zero user-visible change.** The app must look and behave identically before/after this PR. Pixel parity, not just functional parity.
- No regressions in keyboard nav, focus visibility, or motion (Mini's `axioms.css` does global reset work; verify it doesn't disturb our current contenteditable, sidebar, modals, toast).
- Dev panel still works; color rail still works.

**Implementation steps:**

1. **Decide Mini SHA pin** (user call before execution).
   - Option A: pin to Designer's current SHA `83df0b2` (family lockstep, slower).
   - Option B: pin to Mini HEAD at install time (latest fixes; family drifts).
   - Recommendation: **Option A** for sister-app parity, accept a follow-up sync later.

2. **Run the install script.**
   ```bash
   cd /Users/benyamron/dev/mini-design-system
   git checkout 83df0b2          # or stay on HEAD per step 1
   ./tools/sync/install.sh /Users/benyamron/conductor/workspaces/md-manager/worcester-v1
   ```
   This creates: `packages/ui/{src/primitives,src/archetypes,styles}/`, `packages/ui/{MINI-VERSION.md,DEFAULTS.md}`, `.claude/skills/{audit-a11y,check-component-reuse,elicit-design-language,enforce-tokens,generate-ui,propagate-language-update}/`, `tools/invariants/`, `templates/`, `scripts/sync-mini.sh`.
   - **Collision check passed in planning:** none of `packages/`, `tools/`, `scripts/`, `templates/` exist today; the 5 existing skills (link, ship, staff-review, accessibility-review, security-review) don't collide with Mini's 6.

3. **Install Radix peer deps.**
   ```bash
   npm i @radix-ui/colors @radix-ui/react-dialog @radix-ui/react-popover \
         @radix-ui/react-tooltip @radix-ui/react-dropdown-menu @radix-ui/react-select \
         @radix-ui/react-tabs @radix-ui/react-accordion @radix-ui/react-toast \
         @radix-ui/react-checkbox @radix-ui/react-radio-group @radix-ui/react-toggle
   ```
   Bumps `dependencies` in `package.json` by ~12 entries. Also opportunistically fix `"name": "mumbai" → "md-manager"` while we're touching the file (cleanup item on roadmap).

4. **Wire the Vite alias** so `@mini/*` and `@mini-styles/*` resolve.
   - `vite.config.ts`: add `resolve.alias` for `"@mini"` → `packages/ui/src` and `"@mini-styles"` → `packages/ui/styles`.
   - `tsconfig.json`: add `"baseUrl": "."` and `"paths": { "@mini/*": ["packages/ui/src/*"], "@mini-styles/*": ["packages/ui/styles/*"] }`.
   - Verify Designer's pattern: it uses `"@mini"` aliased to `packages/ui/styles` directly (so `@mini/tokens.css` works). We use the more explicit `@mini-styles/*` for CSS and `@mini/*` for TS imports to keep the contracts distinct — minor divergence, documented in `history.md` at /ship time.

5. **Import Mini stylesheets at the app root** (`src/main.tsx`).
   - Add the four imports **before** `./styles/globals.css` so our existing tokens override Mini's defaults at the cascade level (PR C is when we *remove* the override; PR A keeps it for pixel-parity guarantee).
   ```ts
   import '@mini-styles/tokens.css';
   import '@mini-styles/axioms.css';
   import '@mini-styles/primitives.css';
   import '@mini-styles/archetypes.css';
   import './styles/globals.css';
   ```

6. **Set HTML root attributes** (`index.html`).
   - Add `class="light-theme"` and `data-accent="indigo"` to `<html>`. Keep `class="mode-floating"` on `<body>` (that's our dev panel's surface-posture toggle; unaffected).
   - Pixel-parity risk: Mini's `axioms.css` may set `:root` styles that conflict with ours. Audit at execution time; if anything visibly shifts, scope a minimal override in `globals.css` (do **not** edit Mini's files).

7. **Verify pixel parity** by running `/link` and visually comparing against `main`. Critical surfaces to check:
   - Sidebar (post-PR-#6 hanging-icon nav) — section gap, indent, type sizes, draft italic.
   - Editor empty state, contenteditable, floating toolbar, link bubble.
   - Modals (AddRepoModal, AttachPopover), Toast.
   - Dev panel (all knobs respond as before).
   - Color rail tints don't shift.
   - Focus rings still visible on every focusable element.
   - `prefers-reduced-motion` still respected.

8. **Run the gates.**
   - `npm run typecheck` — clean.
   - `npm run build` — clean.
   - `npm test` — 20/20 still passing (no test should depend on Mini yet).
   - `node tools/invariants/check.mjs packages/ui` — clean by construction (Mini's own files).
   - **Do not** run the invariant check against `src/` yet — `globals.css` is full of hex/px which is *intentional* in PR A. PR C is when we tokenize and start passing the invariant.

9. **Reviews + ship.**
   - `/staff-review` — focus on the wiring, not the design.
   - `/security-review` — Radix bumps are the main vector; verify no new direct user-content paths.
   - `/accessibility-review` — confirm pixel parity ≈ a11y parity.
   - `/ship` — synthesize doc updates; PR title: "Mini: install primitives, archetypes, skills (no app migration)".

**Files expected to change in PR A:**
- **New (Mini-owned, do not edit):** `packages/ui/src/**`, `packages/ui/styles/{axioms,primitives}.css`, `packages/ui/{MINI-VERSION,DEFAULTS}.md`, `.claude/skills/{audit-a11y,check-component-reuse,elicit-design-language,enforce-tokens,generate-ui,propagate-language-update}/**`, `tools/invariants/**`, `templates/**`, `scripts/sync-mini.sh`.
- **New (fork-and-own, seeded only):** `packages/ui/styles/{tokens,archetypes}.css`.
- **Modified:** `package.json` (+ Radix deps, name fix), `package-lock.json`, `vite.config.ts` (alias), `tsconfig.json` (paths), `src/main.tsx` (4 imports + cascade-order comment), `index.html` (root attrs), `src/styles/globals.css` (PR-A neutralization block appended only; PR C removes it), `.claude/skills/staff-review/SKILL.md` (drop `disable-model-invocation` so the skill is callable from the model loop per FB-0003 spirit).
- **Unchanged:** every file in `src/components/`, `src/store.tsx`, `src/lib/markdown.ts`, all of `core-docs/` (except plan at this commit; history/spec/feedback/roadmap defer to /ship).

**Risks / open questions:**

1. **Mini SHA pin** — A: `83df0b2` (Designer parity) vs B: Mini HEAD. **Recommend A.** User call before step 1.
2. **`axioms.css` cascade conflict.** Mini's `axioms.css` is a global reset + base setup; ours is hand-rolled in `globals.css`. Importing Mini's first then our `globals.css` should let ours win, but specific selectors (`*`, `html`, `body`) might fight. Mitigation: visual audit at step 7; minimal override in `globals.css` if needed; document any conflict in `history.md` so PR C knows what to reconcile.
3. **Bundle size.** Adding 12 Radix packages without using them ships their code (tree-shaken at module boundary but not zero). Acceptable for a prototype; revisit if `npm run build` output grows by >100KB gzip.
4. **`.claude/skills/` namespace pollution.** Mini adds 6 skills that will surface in skill listings before any of them are exercised by md-manager. Cosmetic; resolved naturally as PR B + C use them.
5. **`/elicit-design-language` accidentally firing.** The skill description matches a wide trigger set ("set up Mini", "initialize the design system"). PR A explicitly does **not** run it. If a user prompt accidentally triggers it during PR A execution, decline and route to PR B.
6. **Existing `core-docs/design-language.md` strategy.** Confirmed: **preserve as starting point, evolve via PR B**, never overwrite. PR B's plan will specify the stitch protocol (likely: archive current doc as `design-language.legacy.md`, run `/elicit-design-language` in archaeology mode against the codebase, manually merge the legacy doc's narrative content into the Mini-shaped output). PR A doesn't touch `core-docs/design-language.md` at all.

### PR B: Elicit + evolve the design language (next session, ½ day)

**Goal:** Run `/elicit-design-language` in archaeology mode against the codebase, then manually merge the proposed Mini-axiom-shaped output with the existing `core-docs/design-language.md` content. Result: a single `design-language.md` that is both Mini-compatible (axiom format, token contract) and preserves the hand-written narrative (family framing, page-tint rail, surface posture decision, polished-features doctrine cross-references, FB-0010..FB-0015 rules).

**Strategy (not yet committed; finalize in PR B's plan):**
1. Archive the current doc to `core-docs/design-language.legacy.md` (preserves it in working tree as well as git history).
2. Run `/elicit-design-language` — archaeology mode auto-selects because the legacy doc is renamed and the codebase is non-empty.
3. Skill proposes a fresh `core-docs/design-language.md` plus seeded `core-docs/{component-manifest.json, pattern-log.md, generation-log.md}`.
4. **Manual stitch:** merge the legacy doc's hand-written sections (Family, page-tint rail, surface posture open question, false-affordances doctrine, component patterns documented from PR #2) into the new Mini-shaped doc.
5. Resolve the surface-posture axiom (1–4 tiers) explicitly — Mini forces this decision.
6. Delete `design-language.legacy.md` once the stitch is verified.

**Risks:**
- Archaeology mode may propose tokens that contradict our existing `--sand-*` values (e.g., different gray flavor). We override in the manual stitch — Mini's archaeology mode is a proposal, not a mandate.
- The 10 axioms include some we haven't been explicit about (motion personality, type scale ratio, focus style). Forced decisions are good — capture each rationale in the merged doc.

### PR C: Token + component migration (multi-session, iterative)

**Goal:** Migrate `src/styles/globals.css` tokens to Mini's `packages/ui/styles/tokens.css`. Migrate components one at a time to Mini primitives + archetypes. Remove duplicate machinery (custom Toast → Mini Toast archetype). Pass the invariant check on `src/`.

**Order (rough, subject to PR B outputs):**
1. **Tokens first.** Rewrite `packages/ui/styles/tokens.css` (fork-and-own) with our project values; delete duplicated `--space-*`, `--radius-*`, `--sand-*`, `--type-*` from `globals.css`.
2. **Toast.** Replace `src/components/Toast.tsx` with Mini's Toast archetype, keep our `<ToastProvider>` API surface so callers don't change.
3. **Dialogs / popovers.** AttachPopover, AddRepoModal → Mini Popover / Dialog archetypes.
4. **Layout primitives.** Sidebar, Editor frame, ColorRail → Mini Box/Stack/Cluster/Sidebar/Container primitives where they fit. Keep contenteditable + FloatingToolbar custom.
5. **Invariant check passes on `src/`** as each component migrates. Final pass: `node tools/invariants/check.mjs src/` clean.

PR C is **iterative across sessions** — each component migration is its own small PR with its own staff-review pass. PR B's plan will pre-decide which components migrate in what order.

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

- **Sidebar hanging-icon nav redesign + section-spacing dev knob** — PR #6 (`3f5564a`). Replaced SourceRow with NavSection/Collapse/NavRow. Counts now on collapsed sections. Drafts grouped under synthetic folder. DevPanel renamed "Sidebar sans" → "Sidebar mono"; dropped inert File icons toggle + Tree layout select. 2026-05-13.
- **Design-rule feedback synthesis FB-0010..FB-0015** — PR #5 (`8bede71`). Captured design rules from the sidebar/editor redesign work. 2026-05-13.
- **Slices A + B of PR #2 staff-review triage** — Safety bundle (drafts, XSS, native dialogs, link wiring), editor performance + a11y + vitest, plus staff-review and ship-pass review fixes. Doctrine: polished features, expand scope not quality (FB-0007). PR #2, branch `address-agentation-comments`. 2026-05-13.
- **Initialize project documentation + agent workflow** — `/init-project` run shipped in PR #3 (`6d2f0ad..d839127`). 5 skills, 8 core docs, 2 optional agents, 5 auto-loading rules, sister-app framing with Designer, 6 seeded feedback entries. 2026-05-13.
- **Scaffold Notes app prototype** — Vite + React + TS, in-memory store, full UI (sidebar / editor / color rail / modals). Commit `d504073` (#1). 2026-05-13.

## Backlog

Quick captures that haven't been promoted to roadmap.md yet. Promote when an idea sharpens or gets picked up.

- Decide on persistence model (localStorage / IndexedDB / FSA API)
- Decide on repo-sync model (local FS watcher vs GitHub API vs both)
- Search across drafts and repo files
- Dark mode (or explicit decision to skip for v1)
- Tags / frontmatter
- Keyboard-shortcut help overlay (`?`)
- Export / share view
