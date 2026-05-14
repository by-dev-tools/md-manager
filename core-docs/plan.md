# Plan

The living document for what's being worked on right now, what's queued, and what to pick up next session. Longer-range work goes in `roadmap.md`. Decision history goes in `history.md`.

---

## Current Focus

Documenting the project and standing up the agent workflow. Prototype scaffold (Vite + React + TS) is in place; next step is deciding what feature to build first against the open questions in `spec.md`.

## Handoff Notes

- Project initialized via `/init-project` on 2026-05-13. Skills (`/staff-review`, `/ship`, `/link`, `/security-review`, `/accessibility-review`) are wired up. Workflow is documented in `workflow.md`.
- **md-manager is a sister app to Designer.** Shared design DNA (sand, Geist, 3/4/5/6 rhythm, surface tier model); intentional divergence on page tint. See `design-language.md` § "Family" for the full map of confirmed vs. open-question divergences.
- **Two key things are still undecided** — do not lock them shut without an explicit user call:
  1. **Surface posture:** keep both floating + flat, drop one, or rethink. Currently both ship.
  2. **Mini adoption:** likely soon. Treat any new tokens or patterns added before then as bridge work that should port cleanly to Mini.
- The `package.json` still says `"name": "mumbai"` from the original scaffold. Rename when next touching it — flagged as low-priority cleanup in `roadmap.md`.
- Persistence, repo sync, and search are all unresolved; see "Open questions" in `spec.md`.

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
