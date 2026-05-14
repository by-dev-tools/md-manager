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

## Definition of done (for any feature)

A feature is "done" when:

- [ ] Code is in main behind a merged PR
- [ ] `history.md` has the entry with design + technical decisions and tradeoffs
- [ ] `plan.md` reflects current reality
- [ ] `spec.md` feature table status is updated
- [ ] Any new rule or pattern is captured in `design-language.md` or `feedback.md`
- [ ] `/staff-review`, `/security-review`, `/accessibility-review` all ran on the diff at some point
- [ ] Dev server URL was shared so the user could verify in-browser before merge
