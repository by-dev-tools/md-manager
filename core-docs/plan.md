# Plan

The living document for what's being worked on right now, what's queued, and what to pick up next session. Longer-range work goes in `roadmap.md`. Decision history goes in `history.md`.

---

## Current Focus

Slices A + B of the PR #2 staff-review triage **shipped** (`657dbe3..[head]`, branch `address-agentation-comments`, PR #2). The polished-features doctrine is canonical (FB-0007 / CLAUDE.md § "Quality posture"). Next session picks up **Slice C** (sidebar + feedback polish: folder-row counts, contrast audit, drafts visual treatment revisit) or pivots to Mini adoption per user call.

## Handoff Notes

- **PR #2 ready for human merge.** Branch `address-agentation-comments`. Slices A (safety bundle) and B (editor performance + a11y + vitest) plus the staff-review fixes and the ship-pass security/a11y fixes are committed and pushed. `npm run typecheck && npm run build && npm test` (20/20) all clean.
- Project init **shipped** in PR #3 (`6d2f0ad..d839127`). Workflow, skills, agents, rules, and core docs all in place.
- **md-manager is a sister app to Designer.** Shared design DNA (sand, Geist, 3/4/5/6 rhythm, surface tier model); page tint color rail is the confirmed divergence. See `design-language.md` § "Family".
- **Polished-features doctrine is canonical.** CLAUDE.md § "Quality posture" + FB-0007 + FB-0008. Every scoping decision runs through wire-vs-defer: if real wiring is < 1 day, default to wiring; otherwise remove the visible affordance until polished.
- **Two open questions to honor — do not lock them shut without an explicit user call:**
  1. **Surface posture:** keep both floating + flat, drop one, or rethink. Currently both ship via the dev panel.
  2. **Mini adoption:** likely the next feature. The CSS-architecture follow-ups in `roadmap.md` are intentionally deferred so Mini can drive the refactor.
- New rules captured in `feedback.md` (FB-0001 through FB-0009) — read these before doing anything novel.
- The `package.json` still says `"name": "mumbai"`. Rename when next touching it — low-priority cleanup in `roadmap.md`.
- Persistence, repo sync, and search remain unresolved; see "Open questions" in `spec.md`.

## Active Work Items

### Address staff-review findings on PR #2

**Goal:** Resolve the 30 concerns from the multi-lens review on PR #2 in shippable slices. Ship the safety-critical bundle first; defer architectural rework that Mini will obsolete.

**UX goals:**
- No silent data loss for drafts.
- No native browser dialogs interrupting the polished surface.
- Editor responds instantly on long docs.
- Accessibility baseline (contenteditable role, contrast, hit-targets) clears WCAG 2.1 AA.

**Slices in recommended order:**

#### Slice A — P0 safety bundle ✅ SHIPPED (`dc191db`)
- [x] Track `wasEverEdited` on drafts; only auto-cleanup drafts whose flag stays `false`.
- [x] Route `createDraft` through the same pristine-drop helper as `selectDoc`.
- [x] Validate `href` in `mdToHtml`'s link transform; allowlist + reject pre-colon whitespace.
- [x] Replace `window.confirm` (Delete) with undo-toast.
- [x] Replace `window.prompt` (link URL) with an inline bubble at the toolbar.
- [x] Wire ⌘/Ctrl-click link navigation (avoid false affordance per FB-0007).

#### Slice B — Editor performance + accessibility ✅ SHIPPED (`2ed26b0`)
- [x] Debounced preview-mode `htmlToMd` round-trip via snapshot pattern.
- [x] `role="textbox"`, `aria-multiline="true"`, static `aria-label` on the contenteditable.
- [x] Empty-editor state when no doc is selected (warm copy in `--sand-11`).
- [x] ⌘E toggles Preview/Markdown (with input/textarea guard).
- [x] vitest + jsdom: 20 round-trip + sanitization tests passing.

#### Slice C — Sidebar + feedback polish (one PR, ~½ day)
- [ ] Folder-row child counts in the file tree (parity with repo counts).
- [ ] Toast primitive (portal, auto-dismiss, undo slot). Used by Delete + sidebar collapse + draft cleanup.
- [ ] Contrast audit: `--sand-9` italic on representative page tints (light warm, light cool, mid-sat). Bump to `--sand-11` for any combo that fails 4.5:1.
- [ ] Revisit drafts visual treatment — italic for "loose / not committed" collides with markdown's `<em>` in titles. Either drop italic in favor of color+weight, or pick a distinct token (e.g., leading dot).

#### Slice D — Toolbar consistency (one PR, ~½ day)
- [ ] Unify the floating-toolbar glyphs into a single SVG set; remove the 🔗 emoji and the text H1/¶/• mix.
- [ ] Minimum 32px hit-target on toolbar buttons (keep visual footprint similar via SVG sizing).
- [ ] Toolbar surface uses a warm-sand tone (`--sand-11` or a desaturated dark sand) instead of near-black `--sand-12` — feels of the family.

#### Slice E — Editor engine migration RFC (no code)
- [ ] Write `core-docs/rfc-editor-engine.md` (or roadmap entry): stay-with-execCommand vs Tiptap vs Lexical vs ProseMirror. Cost, risk, blast radius, fit-with-Mini. Recommend a path.
- [ ] User approves the RFC; implementation lives in a later sprint, not this triage.

#### Slice F — Cleanup pass (one small PR)
- [ ] `DevPanel` lazy state init (`useState(() => load())`).
- [ ] Verify `transition: grid-template-columns` cross-browser; fall back to width-transition on `.sidebar` if Firefox regresses.
- [ ] Repo crumb separator: `›` (or `/` with consistent spacing) instead of the literal-slash mix.
- [ ] `addRepo` id collision: generate a uuid suffix on conflict; surface a friendly message.
- [ ] Dead-code review: `ChevronDown` export, `FolderOpenIcon` usage, the now-degenerate `minimal` tree variant.
- [ ] Storage migration helper scaffold (no-op for now, lets future shape changes ship without losing user data).

**Implementation rule:** Each slice ships as its own PR through the standard loop (plan → execute → `/staff-review` → present → `/ship`). Doc updates happen at `/ship`, not mid-slice.

**Risks / open questions:**

1. **Empty-draft cleanup design** — `wasEverEdited` flag (only delete truly never-typed drafts) **vs** drop the auto-cleanup entirely (drafts always persist, user deletes manually). Both are defensible; user call needed before Slice A starts.
2. **Delete confirmation** — themed modal **vs** no confirm + undo toast. Lean toast (fewer interruptions, more forgiving). User call.
3. **Toast primitive vs Mini** — building toasts now means building them again post-Mini. Slice C builds them anyway because the safety wins justify the cost. User call: build toasts now or defer the Slice C items that depend on them?
4. **CSS architecture (1006-line `globals.css`, 7 body classes and counting)** — flagged P1 in review. **Recommendation:** defer until Mini adoption forces the refactor. Don't pre-invest.
5. **`execCommand` deprecation** — real but slow. Slice E proposes RFC only; implementation gates on Mini decision and user appetite.
6. **PR sizing** — these are 6 PRs. Want to bundle (e.g. A+B together as a "safety + performance" PR)? Or keep them small for reviewability?

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
