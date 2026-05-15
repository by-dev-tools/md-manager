# Roadmap

Horizons for md-manager. This doc captures **what we plan to build, in roughly what order, and why** — distinct from `plan.md` (which is "what's happening right now") and `history.md` (which is "what already shipped").

Deferred follow-ups from `/staff-review` and `/ship` land here when they're real but not in-scope for the current PR.

---

## Now (current sprint / branch)

Work that's actively being designed or about to start.

- **Workflow unification — PR 2: Port preflight + failure-pattern memory.** PR 1 (canonical workflow + spike mode + confidence gates + memory tooling + 5 anti-slop guardrails) shipped on `unify-workflows`. PR 2 ports designer's preflight script (TS-only adaptation), implements `/ship-spike` runtime, and ports designer's memory entries through PR 1's source-diversity bar. See `plan.md` Active Work Items for the full scope.
- **Mini adoption — PR C: Token + component migration (paused).** Resumes after PR 2 settles. PR A (install) and PR B (axioms + manifest + logs + CLAUDE.md) shipped. PR C migrates tokens first, then Toast → Mini Toast archetype, then dialogs/popovers, then layout primitives. Each component is its own PR. Prerequisites captured under "From PR A staff review" below; constraints from PR B captured in `plan.md` "Active Work Items".

## Next (the next 1–2 features after the current one)

Picked, scoped, ready to start once `Now` clears.

| Workstream | Priority | Status | Notes |
|---|---|---|---|
| **Workflow unification — PR 3: designer-side port** | P0 | Scoped (separate workspace) | Copy the canonical `core-docs/workflow.md`, `/ship`, `/simplify`, `/ship-spike`, and `tools/memory/check.mjs` from md-manager into the designer repo. Preserve designer's Build/Harden cadence + ADR 0009 release-tag discipline as a layer ABOVE the per-PR loop, not inside it. Designer-specific adaptations: cargo gates in Preflight, Rust-aware invariants. Done in a designer Conductor workspace, not here. |
| Persistence (drafts survive a reload) | P0 | Scoped | Pick localStorage vs IndexedDB vs FSA API. Open question in `spec.md`. First real feature after Mini settles. |
| Repo-sync v0 (read-only) | P1 | Not scoped | Browse a local path's `.md` files. Decide between FS Access API (browser-only, no install) or a local helper. |
| **Surface posture decision** | P2 (open axiom) | Dogfooded | Resolved into an explicit open axiom in PR B — both floating and flat continue to ship in the DevPanel. Resolution criteria are explicit: dogfooding signal, an archetype constraint surfaces during PR C, or an explicit user call. Promote out of "Next" only when one of those fires. |

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

- Rename `package.json` from `"mumbai"` to `"md-manager"` — **done** (lockfile sync landed in PR #9)
- Review `.claude/settings.local.json` for stale template permissions
- Decide co-author trailer model version (currently Opus 4.7) and document the choice
- Audit `src/lib/markdown.ts` for sanitization posture before any user-content pasting feature ships
- **GitHub Actions pinning policy.** Currently using `@v4` tags for `actions/checkout` and `actions/setup-node` — acceptable for a solo public repo with no secrets in workflow scope. Document the policy in `core-docs/workflow.md` (or a dedicated `core-docs/ci.md`) so the next session knows when to migrate to commit SHAs: any of (a) workflow gains a `${{ secrets.* }}` reference, (b) a step writes to the repo (auto-fix, coverage badge, etc.), (c) project grows to a meaningful supply-chain target. Captured by `/ship` security review on `ci-setup`.
- **Document the `agentation` dependency** in `core-docs/spec.md` § "Tech stack" — what it provides (dev-mode visual feedback toolbar), why it's a dev-only concern, and a note on the caret pin (`^3.0.2` allows patch + minor). Captured by `/ship` security review on `ci-setup`.
- **Workflow.md commit-boundary rule.** Formalize the per-phase commit pattern (Execute / /simplify / /staff-review / /ship) as an explicit step in `core-docs/workflow.md` rather than relying on agent judgment. See FB-0020. Cheap doc edit; deferred from `ci-setup` to keep that PR's scope tight.
- **CLAUDE.md merge-strategy note.** Add a one-paragraph note to `CLAUDE.md` § "Where to look" or a new short § "Merge strategy" pointing out that the repo squash-merges PRs to keep `main` linear, and that intermediate branch commits live on the PR page. Cheap; deferred from `ci-setup`.
- **Lint pattern: reject `github.event.pull_request.*.body` / `.title` interpolation in CI yaml.** Premature at one workflow file; revisit if the `.github/workflows/` set grows past 2-3 files. Captured by `/ship` security review on `ci-setup`.

### From PR 1 security review (workflow unification)

- **Preflight rule: tool inputs that resolve to filesystem paths must be path-validated against an allow-list root.** Would have caught the unvalidated `MEMORY_DIR` / `.memory-dir` inputs in `tools/memory/check.mjs` before the security reviewer did (defense-in-depth fix already applied in PR 1; the rule is the mechanization). Belongs in `tools/preflight/check.mjs` once it lands in PR 2. Scope: any `tools/**/*.mjs` script that takes a path from env var or external file. Reject if `path.resolve(input)` doesn't startWith an allow-list prefix (cwd, `~/.claude/projects/`, `/tmp/`, etc.).

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

### From PR A staff review (Mini install)

- **Token name collision verification before PR C.** Both md-manager's `globals.css` and Mini's `tokens.css` define overlapping token names (`--weight-{regular,medium,semibold}`, `--space-3..6`, `--radius-{badge,button,card,modal}`, and accent-N numbers). The cascade currently favors ours (globals.css loads last), but PR C — which migrates *components* to use Mini's token contract — needs an explicit audit: build the project, grep `dist/assets/*.css` for each duplicated token name, confirm which value wins, and document any intentional re-binding in PR C's history entry. If two values are semantically different (e.g., `--space-3: 8px` vs Mini's `0.5rem`), name-collide them out or rebind explicitly.
- **`scripts/sync-mini.sh` error-handling hardening.** Current wrapper uses `trap cleanup EXIT` which removes the snapshot dir even when `update.sh` exits non-zero. For future syncs (post-PR-A), add exit-code awareness so a failed sync preserves the backup and prints the recovery path. Touch `scripts/sync-mini.sh`; no code-change risk to the app.
- **`tsconfig.json` `include` expansion at PR C entry.** Currently `"include": ["src"]`. The `@mini/*` path alias is defined but inert until the first TS file imports from `@mini/primitives` (PR C). When that happens, TypeScript will need `"packages/ui/src"` added to `include` (or path-mapping alone may suffice, depending on `moduleResolution: "bundler"` behavior). Verify at PR C start; if a test import from `@mini/Box` typechecks without an include change, this is moot.
- **Alias scheme decision: single `@mini` vs split `@mini`/`@mini-styles`.** Designer uses a single `@mini` aliased to `packages/ui/styles`, so `@mini/tokens.css` works directly. We split into `@mini-styles/*.css` (CSS) and `@mini/*` (TS) for explicit contracts. Both work; PR B or C should pick one for family lockstep with Designer.
- **`PROJECT_SKILLS` array maintenance burden.** `scripts/sync-mini.sh` hardcodes the 5 project skills to back up. Any new project-owned skill must be added by hand or it silently disappears on the next Mini sync. Cheap mitigation: have the wrapper read `find .claude/skills -maxdepth 1 -mindepth 1 -type d` and subtract Mini's skills (from `templates/` or an explicit list). Defer until a project skill actually gets added without updating the array.
- **`--accent-8` contrast validation across user page tints.** PR A adds `data-accent="indigo"` to `<html>`, making `var(--accent-8)` resolve to Radix indigo. The neutralization block reverts Mini's `:focus-visible` ring back to browser default, so indigo isn't visible yet in PR A. **PR C is when this becomes load-bearing:** the moment a migrated component uses `var(--accent-8)` (focus rings, links, selected state), it must clear ≥3:1 against every page tint the color rail can produce. Build a contrast matrix (indigo accent × full color-rail hue space) before the first PR C component lands.

## Definition of done (for any feature)

A feature is "done" when:

- [ ] Code is in main behind a merged PR
- [ ] `history.md` has the entry with design + technical decisions and tradeoffs
- [ ] `plan.md` reflects current reality
- [ ] `spec.md` feature table status is updated
- [ ] Any new rule or pattern is captured in `design-language.md` or `feedback.md`
- [ ] `/staff-review`, `/security-review`, `/accessibility-review` all ran on the diff at some point
- [ ] Dev server URL was shared so the user could verify in-browser before merge
