# Plan

The living document for what's being worked on right now, what's queued, and what to pick up next session. Longer-range work goes in `roadmap.md`. Decision history goes in `history.md`.

---

## Current Focus

Documenting the project and standing up the agent workflow. Prototype scaffold (Vite + React + TS) is in place; next step is deciding what feature to build first against the open questions in `spec.md`.

## Handoff Notes

- Project initialized via `/init-project` on 2026-05-13. Skills (`/staff-review`, `/ship`, `/link`, `/security-review`, `/accessibility-review`) are wired up. Workflow is documented in `workflow.md`.
- The `package.json` still says `"name": "mumbai"` from the original scaffold. Rename to `md-manager` (or whatever the canonical name is) the next time we touch it — flagged as low-priority cleanup in `roadmap.md`.
- Stale forge-cache files were wiped from `.claude/forge/cache/`. `.claude/settings.local.json` was inherited from the template and may have stale permission entries — review next session.
- Persistence, repo sync, and search are all unresolved; see "Open questions" in `spec.md`. The first feature work probably starts with picking one of these.

## Active Work Items

_No active feature work. Documentation and workflow setup wraps the current session._

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

- **Scaffold Notes app prototype** — Vite + React + TS, in-memory store, full UI (sidebar / editor / color rail / modals). Commit `d504073` (#1).
- **Initialize project documentation + agent workflow** — `/init-project` ran, populated CLAUDE.md / spec.md / workflow.md / design-language.md / plan.md / roadmap.md, authored 5 skills (`/ship`, `/staff-review`, `/security-review`, `/accessibility-review`, `/link`). 2026-05-13.

## Backlog

Quick captures that haven't been promoted to roadmap.md yet. Promote when an idea sharpens or gets picked up.

- Decide on persistence model (localStorage / IndexedDB / FSA API)
- Decide on repo-sync model (local FS watcher vs GitHub API vs both)
- Search across drafts and repo files
- Dark mode (or explicit decision to skip for v1)
- Tags / frontmatter
- Keyboard-shortcut help overlay (`?`)
- Export / share view
