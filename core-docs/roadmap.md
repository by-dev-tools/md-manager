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
- **Dark mode** — explicit design pass; currently light-only. May get pulled forward by Mini adoption (Mini requires light + dark parity). **Concrete starting point now in place:** the color-rail presets are derived from the portfolio repo's `BG_BASE[<theme>].dark` values at the same `t=0.25` intensity, so a dark-mode rollout can mirror the portfolio's `data-theme="dark"` switch and produce dark-mode preset variants via the same formula. Per-tint text-color regeneration (today's `--sand-12` text would invert to a near-white) and a sensible default `--page-tint` for dark mode (probably the dark equivalent of Sand / table) are the open questions.
- **Keyboard-shortcut help overlay** — `?` opens a cheat sheet
- **Markdown rendering quality pass** — code blocks with syntax highlighting, task lists, tables
- **Dev panel** (if surface tuning becomes ambiguous) — same pattern as Designer's SurfaceDevPanel

## Exploration

Open-ended directions surfaced by review (especially the `/staff-review` push-further lens) or curiosity. **Not planned work** — these become roadmap items when scoped, or get applied inline when working in the named area. Each carries a **Surfaces when:** trigger so future sessions encounter the right item at the right moment instead of having to scan the whole list.

`.claude/rules/exploration.md` auto-loads on UI/code work and reminds the agent to grep this section for trigger matches before finishing.

### Format

```
### <Area>
- **<Headline>** — <one paragraph: what's there now, what could be pushed,
  a concrete shape if one exists.> Surfaces when: <triggers, comma-separated>.
  Cost: <small | medium | large>.
```

**Group by area** (Color rail, Sidebar, Markdown, Editor, etc.), not by date or priority. The area heading is the retrieval index.

**`Surfaces when:` triggers** can mix three forms — combine them freely with commas; `.claude/rules/exploration.md` greps the section for matches:
- **Exact file paths** — `src/components/ColorRail.tsx`, `src/store.tsx` — best for known surfaces; greppable verbatim.
- **Path patterns** — `src/components/*.tsx`, `src/styles/**/*.css` — best for cross-cutting concerns.
- **Conceptual areas or future surfaces** — `Settings page`, `onboarding flow`, `persistence layer` — best when the item should fire on work that hasn't been scaffolded yet. Use a noun phrase a future session would naturally name when starting the relevant work.

Use the most specific form available. Conceptual triggers are looser — write them so a grep for the area name during related work will hit.

### Color rail

- **Per-tint edge color.** Today, `--page-tint-edge` is hardcoded to `hsla(30, 30%, 50%, 0.10)` in `src/store.tsx` — a warm-orange wash that doesn't follow the user's selected page tint. Visually subtle but real: when the user picks the Mist preset (hue 200), the page-edge wash still reads warm-orange, breaking the tint coherence. A function `edgeFor(hue)` already exists in `ColorRail.tsx` for the gradient marker; the same approach could derive the edge color from the active tint. Surfaces when: editing `src/components/ColorRail.tsx`, `src/store.tsx` page-tint handling, or `src/styles/globals.css` page-tint section. Cost: small.

- **Color strip → Settings page; onboarding "pick your favorite color" step.** The color rail currently lives on the right edge of every page. Direction: relocate it to a Settings page (very visible when Settings is open, recedes everywhere else), and adapt it into an onboarding step ("Pick your favorite color") that sets the user's initial default preset. Reduces ambient chrome on the main writing surface; gives the personalization moment a deliberate location. Implies introducing a Settings surface and a first-run flow — substantive scope. Surfaces when: building a Settings page, building first-run / onboarding, redesigning the main-surface chrome, or anyone proposes "where should this control live." Cost: medium (new surface + relocation).

### Security testing

- **Test-design pattern: content-sentinels vs proxy assertions.** FB-0032 captures the specific anti-pattern (asserting on path/URL strings instead of on what a real breach would output) and three current/future md-manager surfaces it applies to. The underlying skill — "how to write tests that catch the failure they're named for" — has applicability beyond the named surfaces. If md-manager's security/sanitization test footprint grows (especially when repo-sync lands and adds path-validation tests), there's a case for codifying the broader pattern in `design-language.md` § "Testing posture" or as a dedicated skill. Today the rule lives one layer down in FB-0032; promotion happens when the pattern fires a second time. Surfaces when: editing `src/lib/markdown.test.ts`, writing repo-sync path-validation tests, building any test that asserts on a threat model rather than implementation details. Cost: small (doc-only codification) once the second firing happens. Source: PR #22 push-further lens.

### Cross-repo provenance

- **Optional `Source repo:` field in feedback.md template.** FB-0032 establishes the precedent of citing cross-repo provenance ("synthesized from flow's `dev-docs/feedback.md` FB-0004, surfaced during PR-3 umbrella close-out"). One-off prose works today. If/when this pattern fires again (next flow→md-manager or designer→md-manager synthesis), update `.claude/rules/documentation.md` to add an optional `Source repo:` field in the feedback.md entry-format template so cross-repo learnings become machine-scannable. Single-repo entries omit the field. Surfaces when: writing a feedback.md entry whose insight came from a sibling repo, editing `.claude/rules/documentation.md`, or noticing the cross-repo citation pattern repeating. Cost: small (≤5 min, one file). Source: PR #22 push-further lens.

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
- **Document the subtle-feedback pattern in `design-language.md`.** Hover washes (8 sites), hairline dividers/borders, and code-block backgrounds all consume the `--tint-overlay-*` tokens. The design language mentions the tokens by name in the Color table but doesn't codify the *pattern* — a short § "Component guidelines → Subtle feedback" entry would teach future contributors when to reach for an overlay token vs `--sand-3` (which `Buttons` already calls out as the hover surface for the primary button). Captured by `/staff-review` on `pr-c-gray-a-rename`.

### From PR 1 security review (workflow unification)

- **Preflight rule: tool inputs that resolve to filesystem paths must be path-validated against an allow-list root.** Would have caught the unvalidated `MEMORY_DIR` / `.memory-dir` inputs in `tools/memory/check.mjs` before the security reviewer did (defense-in-depth fix already applied in PR 1; the rule is the mechanization). Belongs in `tools/preflight/check.mjs` once it lands in PR 2. Scope: any `tools/**/*.mjs` script that takes a path from env var or external file. Reject if `path.resolve(input)` doesn't startWith an allow-list prefix (cwd, `~/.claude/projects/`, `/tmp/`, etc.).

### From PR 1 coherence audit (workflow unification)

- **Extend confidence gates beyond Plan time.** PR 1 added HIGH/MEDIUM/LOW assumption confidence at the Plan step (workflow.md step 2). The user's original ask covered "plan/clarify and/or other stages" — only the first half landed. Future extensions: (a) **Execute-time scope gate** — when new scope is discovered mid-execution, currently judgment-based ("surface, don't silently absorb"). Could be enforced as a "new-scope assumption needs its own confidence verdict; LOW = stop and re-plan." (b) **Review-time BLOCKER triage gate** — /staff-review and /security-review BLOCKERs are currently fixed in-tree by the agent without explicit user signoff. Could add a "BLOCKER touches an architectural choice → human gate before fix" rule, parallel to LOW-confidence. Defer until we have enough real-PR data to know which gate would actually catch real issues vs add friction.
- **`/ship` doc-synthesis audit after a Build phase that spans multiple PRs.** Currently each /ship synthesizes its own slice; over a multi-PR phase, history.md accumulates parallel entries that could be consolidated. Designer's Build/Harden cadence will surface this when we port to PR 3; revisit then.
- **Memory-corpus health metrics.** Once memory entries accumulate (currently 0), add instrumentation: fire rate per entry, false-positive rate (entries fired but the prediction was wrong), promotion rate. Inform the 5-PR confidence-gate revisit and the hard-cap-of-30 calibration. Not needed at 0–3 entries; will matter at 20+.

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

- ✅ **Token name collision verification before PR C** — **done** in PR C Step 1 (branch `pr-c-token-audit`, 2026-05-15). 14 collisions found; output in `core-docs/token-migration.md`. Surfaced one PR-A-prerequisite extension: `--gray-a*` rename (PR C Step 3a).
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
