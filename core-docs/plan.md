# Plan

The living document for what's being worked on right now, what's queued, and what to pick up next session. Longer-range work goes in `roadmap.md`. Decision history goes in `history.md`.

---

## Current Focus

Init-project PR is shipping (`init-project` branch, PR #3). Next session picks the first real feature — likely **Mini design system adoption** (P0 in roadmap), with surface-posture decision and persistence following close behind.

## Handoff Notes

- Project init **shipped** in PR #3 (`6d2f0ad..d839127`). Workflow, skills, agents, rules, and core docs all in place. See `history.md` for the full record.
- **md-manager is a sister app to Designer.** Shared design DNA (sand, Geist, 3/4/5/6 rhythm, surface tier model); page tint color rail is the confirmed divergence. See `design-language.md` § "Family" for the full map.
- **Two open questions to honor — do not lock them shut without an explicit user call:**
  1. **Surface posture:** keep both floating + flat, drop one, or rethink. Currently both ship.
  2. **Mini adoption:** likely the next feature. Treat any new tokens or patterns added before then as bridge work that should port cleanly to Mini.
- New rules captured in `feedback.md` (FB-0001 through FB-0006) — read these before doing anything novel; they encode this session's directional moments.
- The `package.json` still says `"name": "mumbai"`. Rename when next touching it — low-priority cleanup in `roadmap.md`.
- Persistence, repo sync, and search remain unresolved; see "Open questions" in `spec.md`.

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
