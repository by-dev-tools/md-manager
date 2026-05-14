# Roadmap

Horizons for md-manager. This doc captures **what we plan to build, in roughly what order, and why** — distinct from `plan.md` (which is "what's happening right now") and `history.md` (which is "what already shipped").

Deferred follow-ups from `/staff-review` and `/ship` land here when they're real but not in-scope for the current PR.

---

## Now (current sprint / branch)

Work that's actively being designed or about to start.

_(No active workstream — init-project shipped in PR #3. Next session picks from "Next" below.)_

## Next (the next 1–2 features after the current one)

Picked, scoped, ready to start once `Now` clears.

| Workstream | Priority | Status | Notes |
|---|---|---|---|
| **Adopt Mini design system** | P0 | Not scoped | Swap vanilla CSS for Mini (`packages/ui/` style — same pattern Designer uses). User has signaled this is coming soon. Bridge any new tokens to Mini-compatible shapes so the migration is mechanical. |
| Persistence (drafts survive a reload) | P0 | Scoped | Pick localStorage vs IndexedDB vs FSA API. Open question in `spec.md`. Likely the first real feature after Mini. |
| Repo-sync v0 (read-only) | P1 | Not scoped | Browse a local path's `.md` files. Decide between FS Access API (browser-only, no install) or a local helper. |
| **Surface posture decision** | P1 | Open question | Decide: keep both floating + flat, drop one, or rethink. Currently both ship in the prototype; the design-language doc treats this as undecided. |

## Later (named but not designed yet)

Real intent, not yet ready to pick up.

- **Repo-sync v1 (write)** — write changes back to the connected repo
- **GitHub repo connections** — clone, read, write, commit via GitHub API or GitHub App
- **Search** — across drafts + repo files; live filter in the sidebar
- **Tags / frontmatter** — extract frontmatter; tag-based filtering
- **Dark mode** — explicit design pass; currently light-only. May get pulled forward by Mini adoption (Mini requires light + dark parity).
- **Keyboard-shortcut help overlay** — `?` opens a cheat sheet
- **Markdown rendering quality pass** — code blocks with syntax highlighting, task lists, tables
- **Dev panel** (if surface tuning becomes ambiguous) — same pattern as Designer's SurfaceDevPanel

## Someday / maybe

Nice-to-haves and explorations.

- Mobile-responsive treatment
- Multi-window or split-pane (compare two notes)
- Local-first sync between devices
- Export to PDF / HTML
- Backlinks (link one note to another by title)
- Inline images / attachments

## Cleanup (deferred follow-ups, no feature value but real debt)

Captured by `/staff-review` and `/ship` so they don't get lost.

- Rename `package.json` from `"mumbai"` to `"md-manager"`
- Review `.claude/settings.local.json` for stale template permissions
- Decide co-author trailer model version (currently Opus 4.7) and document the choice
- Audit `src/lib/markdown.ts` for sanitization posture before any user-content pasting feature ships

### From Slices A+B staff review (PR #2)

- **Defense-in-depth: URL-encoded scheme detection in `safeUrl`.** Today, `%6a%61%76%61%73%63%72%69%70%74%3a...` would slip past the scheme regex and get treated as a relative path. Markdown link grammar caps URLs at the first `)`, so encoded colons rarely appear in practice — but a decode-then-check pass would close the gap. Touch `src/lib/markdown.ts` `safeUrl()` plus its tests.
- **`mdToHtml` link regex captures the post-escape href.** The current ordering works (`safeUrl` is scheme-tolerant of HTML entities) but is non-obvious. Either re-order so links are extracted before escaping, or add a clarifying comment that names the layering as intentional.
- **Round-trip test coverage: nested lists / tabs vs spaces.** The library doesn't support nested lists yet, so the round-trip flattens them. Add an explicit "no nesting support, flattens to N items" test so a future nesting attempt is forced to update the test, not silently regress behavior.
- **Storage migration scaffold.** `loadState` currently backfills a single field (`wasEverEdited`). Build a versioned migration helper so future schema changes ship without per-load patches. Belongs to Slice F or a dedicated persistence PR.
- **Toast pause-on-hover.** Auto-dismiss countdown should pause while the cursor is over a toast (especially the Undo affordance). Add `onMouseEnter`/`onMouseLeave` handlers to `.toast` that clear/restore the timer.
- **Cmd+Z global undo for delete.** Currently undo lives only on the toast. A keyboard path through the editor's global key handler would catch the user who lets the toast time out.
- **Silent pristine cleanup feedback (decide).** Empty-but-never-touched drafts disappear silently on nav-away. Currently intentional ("no clutter"); reconsider if user reports surprise. If we want a signal, a minimal "Untitled draft dismissed" toast (no Undo since there's nothing to recover) is the cheapest option.
- **z-index tokens.** Values are scattered (30, 50, 80, 100, 200, 1000) with no canonical scale. Define `--z-rail`, `--z-popover`, `--z-modal`, `--z-floating-toolbar`, `--z-dev-panel`, `--z-toast`, `--z-drag-indicator` and document the depth model in `design-language.md`.
- **Toolbar / toast inline `rgba()` migration.** The floating toolbar (dark-on-light surface) uses raw `rgba(255, 255, 255, ...)` overlay colors. The toast inherits the pattern. Either define `--overlay-*` tokens for these or grandfather the toolbar as a documented special case. Decide as part of design-system maturity.
- **CSS organization.** `globals.css` is ~1340 lines, organized organically by feature. Add a table-of-contents comment at the top, and consider splitting by feature into per-component CSS files when Mini adoption happens anyway.
- **Toast position collision with agentation toolbar + dev panel.** Bottom-center toast may overlap bottom-right tooling on narrow viewports. Spec a guard margin or move to top-center if the issue becomes visible.
- **Document `<kbd>` and link-style-button patterns in `design-language.md`.** Both are emerging shared patterns introduced in Slice B; promote them so the next session reuses rather than re-invents.
- **Document the toast pattern in `design-language.md`.** New surface tier (inverted dark, bottom-anchored, transient) deserves its own entry under "Component guidelines" with the rationale for why it diverges from the warm card-on-tint norm.

## Definition of done (for any feature)

A feature is "done" when:

- [ ] Code is in main behind a merged PR
- [ ] `history.md` has the entry with design + technical decisions and tradeoffs
- [ ] `plan.md` reflects current reality
- [ ] `spec.md` feature table status is updated
- [ ] Any new rule or pattern is captured in `design-language.md` or `feedback.md`
- [ ] `/staff-review`, `/security-review`, `/accessibility-review` all ran on the diff at some point
- [ ] Dev server URL was shared so the user could verify in-browser before merge
