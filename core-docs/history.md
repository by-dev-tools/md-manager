# History

Detailed record of shipped work. Reverse chronological (newest first). This is not a changelog — it captures the **why**, **tradeoffs**, and **decisions** behind each change so future sessions have full context on how the project evolved.

Use the `SAFETY` marker on any entry that modifies error handling, persistence, data loss prevention, or fallback behavior.

---

## How to Write an Entry

```
### [Short title of what was shipped]
**Date:** YYYY-MM-DD
**Branch:** branch-name
**Commit / PR:** [SHA, SHA range, or PR link — fill in after commit; "[this commit]" is fine at write time since /ship writes the entry before the commit]

**What was done:**
[Concrete deliverables — what changed in user-facing terms.]

**Why:**
[The problem this solved or the goal it served.]

**Design decisions:**
- [UX or product choice + reasoning]

**Technical decisions:**
- [Implementation choice + reasoning]

**Tradeoffs discussed:**
- [Option A vs Option B — why this one won]

**Lessons learned:**
- [What didn't work, what did, what to do differently]
```

---

## Entries

### Mini design system installed (PR A — no app migration) — SAFETY
**Date:** 2026-05-14
**Branch:** mini-install
**Commit / PR:** `0d17846..[this ship commit]` (3 commits) → [PR pending push]

**What was done:**
- Installed the Mini design system into `packages/ui/` at pinned SHA `83df0b288523e51ba5ec54f4b126cc7591d1d1db` (Designer's current pin — sister-app lockstep). Ran Mini's `tools/sync/install.sh`, which landed: 8 primitives + 12 archetypes under `packages/ui/src/`, 4 stylesheets under `packages/ui/styles/` (tokens + archetypes are fork-and-own; axioms + primitives are track-closely), `packages/ui/{MINI-VERSION,DEFAULTS}.md`, 6 Mini skills under `.claude/skills/`, `tools/invariants/check.mjs`, `templates/`, and a thin `scripts/sync-mini.sh` wrapper.
- Installed 12 Radix peer dependencies (`@radix-ui/colors` + 11 `@radix-ui/react-*`) — the JS bundle is unchanged because nothing imports them yet (tree-shaken to zero in PR A).
- Wired the four Mini stylesheets at the top of `src/main.tsx` (tokens → axioms → primitives → archetypes → globals), with a load-order comment marking the sequence as load-bearing.
- Set `<html class="light-theme" data-accent="indigo">` in `index.html`; preserved `<body class="mode-floating">` (dev-panel surface-posture toggle, unaffected).
- Added Vite alias and tsconfig paths: `@mini/*` → `packages/ui/src/*` and `@mini-styles/*` → `packages/ui/styles/*`.
- Renamed `package.json` `"name"` from `"mumbai"` to `"md-manager"`.
- Removed `disable-model-invocation: true` from `.claude/skills/staff-review/SKILL.md` so the model loop can call the skill — FB-0017.
- **No file under `src/components/`, `src/store.tsx`, `src/lib/markdown.ts` was touched.** The visible UI is byte-identical to `main`. Three-lens staff review confirmed; security + a11y final-pass reviews confirmed.

**Why:**
- Mini is the Now/Next P0 workstream in `roadmap.md`. Adopting it unblocks the deferred CSS architecture work (1340-line `globals.css`, scattered z-index, raw `rgba()` overlays) and forces explicit decisions on the surface-posture and gray-flavor open questions. Doing the install as its own PR — no token migration, no component migration — keeps the change reviewable and decouples "does the system fit" from "does the new aesthetic fit".

**Design decisions:**
- **Three-PR split: install → elicit → migrate.** Bundling all three would have produced an unreviewable diff (5800+ lines of upstream Mini + 1300-line `globals.css` rewrite + every component refactor). Split keeps PR A reviewable as pure infrastructure, PR B reviewable as a design-language doc evolution, PR C reviewable per-component.
- **Preserve `design-language.md` as starting point** (FB-0016). The existing 1700-line doc encodes family framing, page-tint rail, surface-posture open question, polished-features doctrine, and FB-0010..FB-0015 rules. PR B will run `/elicit-design-language` in archaeology mode against the codebase, then *manually stitch* its output with the legacy content (archive as `.legacy.md`, merge narrative, delete legacy once verified). Mini's output is a proposal, never a replacement.
- **Family lockstep on Mini SHA.** Pinned to Designer's current sync (`83df0b2`, April 2026) rather than Mini HEAD. Tradeoff: family parity over latest-fixes. Next sync follows Designer's cadence.
- **Pixel parity as the UX goal.** PR A must look and behave identically to `main`. Verified visually in browser by the user. Two Mini-axiom selectors needed neutralization to keep parity: `img/video/svg { display: block }` (would break inline SVG icon alignment) and the universal `:focus-visible { outline: 2px solid var(--accent-8) }` (would replace browser-default focus rings with an indigo ring everywhere). Neutralized via a clearly-marked block at the end of `globals.css`; PR C removes the block as components migrate.

**Technical decisions:**
- **SAFETY — sync-mini.sh wraps Mini's destructive `rsync --delete`.** Mini's upstream `install.sh` and `update.sh` both `rsync --delete .claude/skills/`, which clobbered the project's 5 skills (`link`, `ship`, `staff-review`, `accessibility-review`, `security-review`) on first install. They were restored from HEAD immediately. The thin `exec`-wrapper that Mini's installer generates was replaced with a snapshot-and-restore version: `PROJECT_SKILLS=(...)` array, `mktemp -d`, copy before, `exec update.sh`, copy back, `trap cleanup EXIT`. Every future `./scripts/sync-mini.sh` now preserves project skills automatically. SAFETY because losing skills is invisible until a user types `/staff-review` and gets "Unknown skill".
- **`outline: revert` (not `unset` or `initial`) in the neutralization block.** `revert` returns to the user-agent default, which is what we want; `unset` would clear the property entirely (browser-default focus ring on `:focus-visible` becomes invisible on some elements); `initial` returns to the CSS spec default (`outline: none`), worse than `revert`. Verified by staff design engineer review.
- **Split alias scheme `@mini/*` vs `@mini-styles/*`.** Designer uses a single `@mini` aliased to `packages/ui/styles` so `@mini/tokens.css` works directly. We separated TS imports (`@mini/Box`) from CSS imports (`@mini-styles/tokens.css`) for explicit contracts. Diverges from Designer; PR B or C will reconcile if the divergence creates friction.
- **CSS bundle grew 0.12 KB, JS bundle unchanged.** Mini's 4 stylesheets contribute ~63.56 KB total (was 63.44 KB pre-PR), almost entirely the Radix color CSS imports inlined by Vite's CSS resolver. JS unchanged confirms zero React-side imports — Mini's primitives/archetypes sit on disk waiting for PR C.
- **`vitest` + jsdom still works.** The 21 existing tests are markdown-round-trip + sanitization; jsdom parses Mini's CSS imports without complaint. No new tests added in PR A — there's nothing functional to test.

**Tradeoffs discussed:**
- **Install layout — canonical `packages/ui/` vs `src/mini/`.** Canonical matches Designer (sister-app parity) and matches Mini's default invocation; `src/mini/` would have been closer to the existing flat-`src/` shape. Canonical won on family-lockstep grounds.
- **Stylesheet load order — Mini first or globals first.** Mini first lets our `globals.css` cascade-override Mini's resets, which is the only way to achieve PR-A pixel parity without editing Mini's track-closely files. Reverse order would have required prefixing every overriding rule in `globals.css` with `:where()` or similar — fragile and undocumented.
- **Token name collisions deferred.** Both systems define `--space-3..6`, `--radius-*`, `--weight-*`, and accent-N numbers. Our values currently win the cascade because `globals.css` loads last. PR C audits and resolves; `roadmap.md` captures the audit as a PR C prerequisite.
- **`disable-model-invocation` audit.** Removed from `staff-review` mid-session (FB-0017). Did NOT remove from `link` (genuinely user-initiated — starts a dev server with side effects) or `ship` (the user must explicitly opt into a push + PR). The line: review skills and orchestration composers should be model-callable; side-effecting actions can stay user-only.
- **Reviewer findings spot-checked, not blindly applied.** Staff design engineer flagged a "BLOCKER" claiming Vite couldn't resolve `@radix-ui/colors` from `packages/ui/styles/tokens.css` without an explicit alias. Empirically wrong — `npm run build` already passed (48 modules, 63.56 KB CSS). Vite's CSS resolver walks up to the project's `node_modules/`. Skipped the fix; flagged in the review report.

**Lessons learned:**
- **Upstream installers can be destructive in non-obvious ways.** Mini's `install.sh` is documented as "track-closely" overwrites — but the implementation uses `rsync --delete` on `.claude/skills/`, which deletes anything in the destination not in the source. A reasonable reading of "track-closely overwrites primitive source code and skills" does not anticipate "and also nukes your project's pre-existing project-owned skills." Always read the install script before running it on a brownfield project. Future SAFETY-tagged adoptions get the same scrutiny.
- **Pre-emptive neutralization beats post-hoc forensics.** Reading Mini's `axioms.css` line-by-line *before* the visual audit caught two real pixel-parity issues (svg display, focus-visible) that would have been hard to attribute later. Cheap up-front read, expensive late-detection retrofit.
- **A reviewer's confidence is not a proof.** Both staff design engineer and staff UX designer raised what they labeled "BLOCKER" — one was empirically wrong (Vite alias), one was logically a NIT (form-element font inheritance already explicit). Triage every finding against the actual code; never apply a reviewer fix without spot-check, even when three reviewers run in parallel.

### Safety bundle, editor performance, and polished-features doctrine — SAFETY
**Date:** 2026-05-13
**Branch:** address-agentation-comments (PR #2)
**Commit / PR:** `657dbe3..[this ship commit]` (5 commits) → https://github.com/byamron/md-manager/pull/2

**What was done:**
- Closed the original 6 agentation feedback comments on the prototype (dimmed JSON files, redundant sidebar +, drafts/files structure, swatch contrast, attach-vs-toggle clarity, dev opacity slider) plus a redesign of the editor header, the sidebar (files-then-hairline-then-drafts, italic muted drafts, GitHub-octicon repo icon, persistent + button, count indicator), and a new dev panel (opacity, radius, gutter, shadow, sidebar font, editor font, file-icons toggle, sans/mono toggle, tree-layout select, surface-mode select).
- **Slice A — safety bundle.** Drafts get a `wasEverEdited` flag; only drafts the user never typed into are eligible for the navigate-away auto-cleanup. `createDraft` routes through the same pristine-drop helper as `selectDoc` so chained `+` clicks don't leave empty drafts. Added `safeUrl()` allowlist (`http`/`https`/`mailto`/relative/fragment; everything else collapses to `#`) for markdown link rendering; rejects URLs with whitespace before the scheme separator (`java\tscript:` is now `#`). Rendered `<a>` tags carry `rel="noopener noreferrer"` and `target="_blank"`. `window.confirm` (Delete) and `window.prompt` (link URL) replaced — Delete now fires a Toast with **Undo**; link entry is an inline bubble at the toolbar with the editor selection stashed in a `Range` and restored at submit. ⌘/Ctrl-click on a rendered link opens it via `window.open(safe, '_blank', 'noopener,noreferrer')`. New `<ToastProvider>` primitive with `aria-live` priority and `prefers-reduced-motion` support.
- **Slice B — editor performance + a11y + tests.** Debounced preview-mode persist (150ms) using a snapshot pattern — pending work captures `docId`/`isDraft`/`viewMode` at typing time, not flush time, so a deferred flush can't misattribute content to the wrong doc when the user switches docs mid-debounce. `useLayoutEffect` flushes pending edits before swapping content on doc/view changes; `onBlur` flushes for snappy "Saved" feedback; `commitFromToolbar` flushes synchronously. contenteditable gets `role="textbox"`, `aria-multiline="true"`, static `aria-label`. Empty-editor state when no doc is selected (warm copy in `--sand-11` with ⌘N hint). ⌘E toggles Preview/Markdown (guarded against firing inside `<input>`/`<textarea>`). `vitest` + `jsdom` added with 20 tests covering `safeUrl` allowlist (including the whitespace bypass), `mdToHtml` link sanitization, and full `htmlToMd ↔ mdToHtml` round-trips. New scripts: `npm test`, `npm run test:watch`.
- **Polished-features doctrine.** Mid-work the user defined the project's quality posture: *"Ship polished, narrow features. Expand scope over time, not quality."* Integrated as a top-level § "Quality posture" in CLAUDE.md plus § "False affordances are a bug" in `design-language.md` under Component guidelines. The doctrine drove the decision to wire the link button properly (with click-to-navigate + safe URL handling) rather than ship a button that produces invisible output.
- **Three-lens staff review + final-pass security/accessibility review.** Caught and fixed: ⌘E firing inside other inputs; `pendingRef` cleared before write; `flushPendingPersistRef` assigned during render; pristine-drop racing the debounced flush; `restoreDraft` not restoring selection; silent rejection of unsafe URLs in the link bubble (false-affordance violation); focus not restored after link cancel; ⌘E and ⌘-click undiscoverable; 5s toast too short for Undo; dynamic-and-chatty contenteditable `aria-label`; empty-state action missing `:focus-visible`; Toast `aria-live` not escalating for destructive; `<kbd>` hardcoded `11px` (now `--type-micro`); whitespace bypass in `safeUrl`; missing `target="_blank"` on rendered links; `.saved` indicator missing `aria-live`; empty-state hint contrast.

**Why:**
- The prototype had real safety holes: silent draft auto-delete (data-loss potential), markdown link rendering that didn't sanitize URLs (`javascript:alert(1)` would have executed), and native `window.confirm`/`window.prompt` dialogs that clashed with the warm-sand surface and offered no recovery path. The agentation feedback also surfaced sidebar/editor clarity issues worth addressing in the same pass. Doing them as one PR kept the doctrine of "false affordances are a bug" applied uniformly: each fix shipped polished or didn't ship.

**Design decisions:**
- **Undo toast instead of confirmation modal.** Native confirm is jarring and slow; a themed modal adds friction; an undo toast is more forgiving (matches Gmail/Notion) and pairs naturally with the new toast primitive Slice C would need anyway. Tradeoff: users with motor impairments need more time to click Undo — addressed by defaulting action-toasts to 8s (passive toasts to 4s).
- **Italic + muted color for drafts.** Distinguishes drafts (loose, not committed) from repo files (committed) at every level. Collides with markdown's `<em>` rendering — flagged in roadmap for a Slice C revisit.
- **Files-then-hairline-then-drafts inside a repo.** Drafts attached to a repo aren't *in* the repo until they're committed. The hairline reinforces the conceptual boundary.
- **Chevron-on-left was tried and reverted.** First iteration moved chevrons to the leading slot (Conductor pattern); the user reverted to icon-only-with-state-via-open-folder-icon, accepting that expansion state is conveyed by children-visible + folder-open-icon. Documented in roadmap as a design-language entry to write up.
- **Auto-cleanup of pristine drafts.** A draft that was created but never typed into is removed silently on navigation. Touched drafts (anything with content) are preserved. The `wasEverEdited` flag protects the user's work; the silent removal keeps the sidebar clean. Roadmap flagged a follow-up to consider a "Untitled draft dismissed" toast if user testing shows surprise.
- **Polished-features doctrine = canonical project philosophy.** Integrated into CLAUDE.md, not relegated to feedback.md, because every future scoping decision needs to apply it. Decisions about whether to ship a partial feature now run through the wire-vs-defer cost test from FB-0038.

**Technical decisions:**
- **Snapshot debounce pattern.** The naive "debounce 150ms then read editor DOM and call updateDraftBody(currentDoc.id, ...)" is correct most of the time and catastrophically wrong when the user switches docs within the debounce window. The snapshot pattern captures `docId`/`isDraft`/`viewMode` at typing time, so a deferred flush always writes to the right target. Combined with a pre-swap flush in `useLayoutEffect`, switching docs flushes the previous doc's pending edits before the new doc's content overwrites the DOM.
- **Eager `wasEverEdited` flip on first keystroke.** Originally set inside the debounced flush. Surfaced by staff-review as a race: a fast switch-doc within 150ms could trip the pristine-drop helper and delete the draft. Now set immediately on first non-empty input.
- **`htmlToMd` parses in a detached `<div>`.** Setting `innerHTML` on a detached node does NOT fire event handlers (`<img onerror>`, `<svg onload>`) and does NOT execute `<script>` tags. A `SAFETY` comment in the function notes this assumption so a future refactor doesn't break it.
- **`safeUrl` rejects pre-colon whitespace.** Surfaced by the final-pass security review. Browsers strip whitespace inside the scheme portion of an href; `java\tscript:` would resolve as `javascript:`. The check rejects any whitespace before the first colon, catching tab/newline/space bypasses.
- **Toast lives in a single `<div role="status" aria-live={dynamic}>`.** Switching `aria-live` per host is the pragmatic compromise — per-toast live regions risk fragmentation. The host flips to `assertive` when any current toast carries `priority: 'assertive'` (Delete uses this).
- **execCommand remains the workhorse.** All formatting + insertHTML ops route through `document.execCommand` so the browser's native undo stack catches them. Deprecated long-term — roadmap has an editor-engine RFC (Slice E) to evaluate Tiptap / Lexical / ProseMirror.

**Tradeoffs discussed:**
- **Debounce window.** 150ms was picked over 100/300. Longer feels stale; shorter doesn't save much CPU on htmlToMd. Tunable later.
- **Toast surface tier diverges from card-on-tint.** Toasts are inverted dark (`--sand-12` bg, `--sand-1` text) instead of the warm-card-on-tint pattern used elsewhere. Justified because toasts are transient status messages that must break through the user's chosen tint to be legible. Documented in roadmap as a design-language entry to write up.
- **`window.open(_blank)` + caret-placement on plain click.** Plain click in a contenteditable places the caret (the browser default). ⌘/Ctrl-click follows the link. `target="_blank"` was added so screen readers announce the new-tab behavior. The "⌘-click to open" `title` is the discoverability cue for sighted users.
- **CSS architecture deferred.** `globals.css` is now ~1340 lines. A refactor into per-feature files is real debt, but Mini adoption (likely soon per design-language) will force the change anyway. Pre-investing here is throwaway work.
- **Hardcoded px in globals.css.** `.claude/rules/ui.md` permits raw values inside `globals.css`; the rule's bite is for component files. Some hardcoded heights (toast 36, toast-action 26, link-input 240) stayed for that reason. Tokenizing them is a future polish pass.

**Lessons learned:**
- The doctrine of "wire-vs-defer, default to wire if cheap" (from Designer's FB-0038) is hugely operational. Applied to the link button it turned a 1-LoC roadmap entry into a ½-day implementation that ships the feature whole.
- Snapshot patterns matter the moment async work outlives its initiator. The debounce-without-snapshot version was correct for 99% of cases and silently corrupted state in the 1% where it mattered.
- Three-lens staff-review (engineer / UX / design engineer) running in parallel against a single diff caught failures that no single lens would have. The engineer caught the race + the lifecycle bugs; the UX designer caught the silent-rejection false affordance + the keyboard nav holes; the design engineer caught the missing type token. None of the three would have caught all of them.

### Initialize project documentation + agent workflow
**Date:** 2026-05-13
**Branch:** init-project (PR #3)
**Commit / PR:** `6d2f0ad..d839127` (4 commits) → https://github.com/byamron/md-manager/pull/3

**What was done:**
- Ran `/init-project` against the existing prototype scaffold (Vite + React + TS Notes app).
- Authored CLAUDE.md as a high-level router pointing at `core-docs/` and `.claude/`, with the canonical workflow loop and Hard Rules up top so every loaded session sees them. Added a Commands section listing `npm` scripts so the model doesn't grep `package.json`.
- Populated `core-docs/spec.md` (vision, problem, solution, features, open questions), `core-docs/plan.md` (current focus + handoff notes), `core-docs/roadmap.md` (now / next / later / someday / cleanup), `core-docs/workflow.md` (the canonical session loop with explicit "never merge" rule and anti-patterns), `core-docs/design-language.md` (tokens, typography, surface modes, component guidelines, a11y checklist, + a "Family" section mapping shared DNA vs. open-question divergences from Designer), `core-docs/feedback.md` (seeded with 6 entries synthesizing this session's directional moments — see FB-0001 through FB-0006).
- Authored 5 skills: `/staff-review` (three-lens parallel review, fixes in-tree, captures follow-ups to roadmap/plan), `/ship` (final security + a11y reviews via Skill tool, doc updates, commit, push, PR, never merge), `/security-review` and `/accessibility-review` (single-lens diff audits invokable directly OR by `/ship`), and kept `/link` from the template (Vite dev-server starter).
- Removed template skills not in the user's list (`audit`, `dev-panel`, `setup`). Kept `planner` and `docs` agents in slimmed form as optional context-isolation escape hatches.
- Wiped stale forge cache files inherited from the template (`.claude/forge/cache/*`). Added `.claude/forge/cache/` to `.gitignore` so future cache regeneration doesn't get committed. Cleaned `.claude/settings.local.json` of stale template-specific permissions.
- Framed md-manager as a sister app to Designer (`~/dev/designer/`) — shared DNA (sand neutrals, Geist, 3/4/5/6 rhythm, surface tier model), with the page tint color rail as the signature confirmed divergence. Surface posture and Mini adoption explicitly marked as open questions.
- Updated the user-scoped `/init-project` skill to source from `~/dev/project-template/` (was `~/Desktop/coding/project-template/`).
- Audited the whole setup against Anthropic Claude Code best practices: added the Commands section, made CLAUDE.md's rules-loading table match actual frontmatter, added explicit `paths: ["**/*"]` to `general.md` so always-load is guaranteed, relaxed the uncompliable commit-SHA requirement in `documentation.md` (forward-references allowed).

**Why:**
The prototype scaffold landed (#1) without the agent workflow infrastructure that the user runs across their other projects (language-app, manipulation-identifier, forge). Standing this up now — before any real feature work — means every feature from here on gets the full plan/review/ship discipline and the docs stay honest.

**Design decisions:**
- CLAUDE.md is a **router**, not a content doc. Decisions live in `core-docs/`. Rationale: a content-heavy CLAUDE.md goes stale; a router that points at canonical docs ages with the project. The workflow loop and Hard Rules are the exception — they're enforcement-critical and need to load every session.
- Three reviews exist (`staff-review`, `security-review`, `accessibility-review`) rather than one mega-review. Rationale: each lens has its own bar and gotchas; conflating them muddies findings.
- Follow-ups from reviews route to `roadmap.md` / `plan.md`, **not only** to the PR body. Rationale: PR bodies vanish after merge; docs are the source of truth.
- `/ship` never merges. Rationale: the human reviewer is the whole point of the review pass.
- Sister-app framing splits divergences into **confirmed** (page tint color rail — won't undo) vs **open questions** (surface posture, Mini adoption, dark mode, dev panel). Rationale: documenting an open question as a decision locks it shut on every CLAUDE.md load; framing matters.

**Technical decisions:**
- Used language-app's `staff-perspective-review` skill as the structural reference for `staff-review` (three parallel `Agent` calls, BLOCKER/NIT/FOLLOW-UP triage, reviewer-notes template).
- Used language-app's `commands/ship.md` as the structural reference for `ship`, but extended it with the security + accessibility passes (via Skill tool, sequential) and the explicit feedback-synthesis step the user described.
- `/staff-review`, `/ship`, `/link` keep `disable-model-invocation: true` (user-triggered only). `/security-review` and `/accessibility-review` had the flag removed so `/ship` can call them via the Skill tool while remaining standalone-callable.
- `general.md` rule got explicit `paths: ["**/*"]` frontmatter to guarantee always-load rather than relying on implicit behavior.
- Two-commit pattern for ship was considered (code commit, then docs commit with SHA reference) but rejected in favor of single-commit + relaxed SHA requirement — friction wasn't worth the marginal traceability benefit. `git log` recovers SHAs.

**Tradeoffs discussed:**
- **One big "review" skill vs three focused ones.** Picked three — security and accessibility have distinct expertise bars; collapsing them into staff-review would dilute both.
- **PR-only follow-up capture vs roadmap.md.** Picked roadmap.md (canonical) + PR body mention (visibility). PR-only loses information at merge.
- **Auto-invoke skills vs explicit-only.** Picked mostly explicit-only via `disable-model-invocation`. Exception: security + a11y reviews, removed so `/ship` can chain them.
- **All-in-one ship commit vs split code-then-docs.** Picked all-in-one; relaxed the SHA requirement to match.
- **Template agents kept or deleted.** Deleted `domain`, `ui`, `testing` (redundant with rules system). Kept `planner` + `docs` as context-isolation escape hatches with descriptions that actively discourage default invocation.

**Lessons learned:**
- The `/init-project` skill itself had `disable-model-invocation: true`, which meant Claude couldn't fire it via the Skill tool even when the user typed `/init-project`. Workaround for this session: ran the steps manually. Long-term fix: remove that flag from the skill so it's reachable via slash command in any workspace.
- When initializing a project, the docs should distinguish "confirmed divergences" from "open questions" up front — documenting an undecided thing as decided locks the question shut.
- Rules without explicit `paths:` frontmatter aren't reliably auto-loaded. Always add a wildcard if you want always-on.
- Reviewer skills' workflow rules need to be writable at the time they fire. `/ship` writing history.md *before* the commit means the SHA-in-history requirement was uncompliable until relaxed.
- See `feedback.md` FB-0001 through FB-0006 for additional synthesized rules from this session.

### Scaffold Notes app prototype (Vite + React + TS)
**Date:** 2026-05-13 (approx — based on commit timestamp)
**Branch:** seattle-v1 (PR #1)
**Commit:** d504073

**What was done:**
- Initialized Vite + React 18 + TypeScript project.
- Built the two-pane shell (sidebar + content surface), file tree, draft list, markdown editor with preview/markdown mode toggle, color rail (HSL gradient + presets + manual picker), attach popover, overflow menu, add-repo modal.
- Established CSS custom-property design tokens in `src/styles/globals.css` (sand neutrals, type scale, spacing scale, radius scale, surface shadow).
- Wired `agentation` dev toolbar (dev-only).

**Why:**
Get the visual and interaction shape on screen before any real persistence or sync work, so the design language and surface ergonomics can be evaluated against actual content rather than mockups.

**Design decisions:**
- Picked Radix-sand-inspired warm neutrals over cool grays for warmth without nostalgia.
- Geist + Geist Mono for a modern, technical-but-readable feel; mono for sidebar/file paths gives it the IDE-adjacent affordance.
- Two surface modes (floating / flat) as a thesis about giving the user control over posture, not just color.
- Color rail on the right edge as the user-controlled-tone signature — different from a settings-modal hidden theme.

**Technical decisions:**
- Vanilla CSS with custom properties rather than Tailwind. Rationale: runtime-settable tokens (page tint) are first-class; Tailwind's design-time JIT isn't a fit.
- Local store via `useStore` custom hook in `src/store.tsx` — no Redux, no Zustand. Prototype state is simple enough.
- In-memory persistence only. Real persistence is a deliberate next step, not a yak-shave at scaffold time.

**Tradeoffs discussed:**
N/A — initial scaffold, design decisions documented above are the substantive ones.

**Lessons learned:**
- `package.json` shipped with name `"mumbai"` (likely a working code name) — should be renamed to match the canonical project name. Captured in `roadmap.md` cleanup.
