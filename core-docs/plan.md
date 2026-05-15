# Plan

The living document for what's being worked on right now, what's queued, and what to pick up next session. Longer-range work goes in `roadmap.md`. Decision history goes in `history.md`.

---

## Current Focus

**Mini design system adoption — PR B: Elicit + evolve the design language.** PR A (install) shipped on branch `mini-install`. Next session runs `/elicit-design-language` in archaeology mode against the codebase, then manually stitches its output with the existing 1700-line hand-written `design-language.md`. PR C (token + component migration) follows.

## Handoff Notes

- **PR A (Mini install) shipped on `mini-install`** — `0d17846` (install) + `a140412` (staff-review fixes) + this ship commit. PR pending push. Three-lens staff review + security review + a11y review all clean. The visible UI is byte-identical to `main`. Mini files sit in `packages/ui/` and `.claude/skills/`, ready for PR B/C consumption.
- **SAFETY: `scripts/sync-mini.sh` was hardened** to snapshot+restore project skills around Mini syncs. Mini's upstream `install.sh`/`update.sh` use `rsync --delete` on `.claude/skills/`, which clobbered our 5 project skills on first install. The wrapper's `PROJECT_SKILLS` array must be updated whenever a new project-owned skill is added.
- **`disable-model-invocation` was removed from `staff-review` SKILL.md** so the model loop can call it (FB-0017). `link` and `ship` remain user-only by design.
- **Two Mini-axiom selectors are neutralized** at the bottom of `globals.css` (`img/video/svg display`, universal `:focus-visible` ring). The block is clearly marked and lists which Mini-axiom rules are intentionally allowed to cascade through. PR C removes the block as components migrate.
- **PR B's open question — design-language doc strategy.** Confirmed by FB-0016: preserve the existing hand-written `design-language.md` as the starting point; Mini's archaeology-mode output is a proposal to merge into ours, never a replacement. Stitch protocol (archive as `.legacy.md`, run elicit, manual merge, delete legacy) is captured in this plan's "PR B" section below and FB-0016.
- **PR B will force the surface-posture decision** via Mini's "surface hierarchy depth" axiom (1–4 tiers). The dev panel currently ships both floating and flat — PR B picks one.
- **PR C prerequisites already captured in `roadmap.md`** under "From PR A staff review (Mini install)": token name collision audit (highest-priority), `--accent-8` contrast validation across user page tints, alias scheme reconciliation (single `@mini` vs split), tsconfig include expansion, sync-mini.sh error-handling hardening.
- **Polished-features doctrine is canonical.** CLAUDE.md § "Quality posture" + FB-0007 + FB-0008. Every scoping decision runs through wire-vs-defer.
- Persistence, repo sync, and search remain unresolved; see "Open questions" in `spec.md`. These come after Mini adoption settles.

## Active Work Items

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

- **Mini design system installed (PR A)** — Branch `mini-install`, commits `0d17846..[ship]`. Primitives, archetypes, stylesheets, 6 skills, invariants, templates landed in `packages/ui/` at SHA `83df0b2` (Designer parity). 12 Radix peer deps installed. Stylesheets wired in `main.tsx`; HTML root `class="light-theme" data-accent="indigo"`. No app component migrated. SAFETY: `scripts/sync-mini.sh` snapshots+restores project skills around Mini's destructive `rsync --delete`. FB-0016, FB-0017 captured. 2026-05-14.
- **Sidebar hanging-icon nav redesign + section-spacing dev knob** — PR #6 (`3f5564a`). Replaced SourceRow with NavSection/Collapse/NavRow. Counts now on collapsed sections. Drafts grouped under synthetic folder. DevPanel renamed "Sidebar sans" → "Sidebar mono"; dropped inert File icons toggle + Tree layout select. 2026-05-13.
- **Design-rule feedback synthesis FB-0010..FB-0015** — PR #5 (`8bede71`). Captured design rules from the sidebar/editor redesign work. 2026-05-13.
- **Slices A + B of PR #2 staff-review triage** — Safety bundle (drafts, XSS, native dialogs, link wiring), editor performance + a11y + vitest, plus staff-review and ship-pass review fixes. Doctrine: polished features, expand scope not quality (FB-0007). PR #2, branch `address-agentation-comments`. 2026-05-13.
- **Initialize project documentation + agent workflow** — `/init-project` run shipped in PR #3 (`6d2f0ad..d839127`). 5 skills, 8 core docs, 2 optional agents, 5 auto-loading rules, sister-app framing with Designer, 6 seeded feedback entries. 2026-05-13.

## Backlog

Quick captures that haven't been promoted to roadmap.md yet. Promote when an idea sharpens or gets picked up.

- Decide on persistence model (localStorage / IndexedDB / FSA API)
- Decide on repo-sync model (local FS watcher vs GitHub API vs both)
- Search across drafts and repo files
- Dark mode (or explicit decision to skip for v1)
- Tags / frontmatter
- Keyboard-shortcut help overlay (`?`)
- Export / share view
