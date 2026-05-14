# Product Specification

## Vision

A markdown notes app that feels like a calm, single surface. Writing dominates; chrome recedes. The user owns the visual tone (page tint), the data is plain markdown, and connected repos turn the app into a lightweight read/write surface for any markdown content the user keeps in a folder or repository.

md-manager is a sister app to **Designer** (`~/dev/designer/`) — same product family, shared design DNA (sand neutrals, Geist, 3/4/5/6 rhythm, two-tier surface model), but distinct thesis and personality. Where Designer is a manager's cockpit (calm, uniform, monochrome), md-manager is a writing surface (warm, personal, user-tinted). The two should feel like siblings, not clones. See `core-docs/design-language.md` § "Family" for the shared-DNA / intentional-divergence map.

## Problem

Markdown notes apps tend to one of two failure modes:

1. **Bloat** — every feature, every plugin, every theme. The writing surface drowns in toolbars and panels.
2. **Sterility** — clean but cold. No warmth, no personality, no sense that the user can make it feel like theirs.

Existing tools also lock notes into proprietary formats or sync layers that make moving between machines (or between apps) painful.

## Solution

A two-pane app — sidebar + content surface — built on five constraints:

1. **Content over chrome.** Generous padding, a single-column writing area, no permanent toolbars cluttering the surface.
2. **Warm neutrals.** Radix-style sand palette with Geist + Geist Mono typography. Modern, not retro.
3. **User-controlled page tint.** A vertical color rail on the right edge lets the user pick the page's background hue. The entire surface reflows tone in 200ms.
4. **Surface posture is the user's call (open question).** The prototype ships two modes — *floating* (rounded card with shadow, gutter around it) and *flat* (full-bleed, no chrome) — toggleable per session. Whether we keep both, pick one, or rethink is undecided.
5. **Markdown-first persistence.** Notes are `.md` files. Drafts live in-app; once connected to a repo, files are read from / written to that repo's filesystem.

## Features

| Feature | Description | Status |
|---|---|---|
| Drafts (unattached) | Quick notes that live only in the app | Shipped (prototype) |
| Drafts (attached to repo) | Drafts associated with a connected repo for later promotion to a file | Shipped (prototype) |
| Repo connections | Connect a local path or GitHub URL; browse its markdown files | Shipped (prototype, UI only — actual filesystem/git integration TBD) |
| File tree | Folder + file navigation inside a connected repo | Shipped (prototype) |
| Markdown editor | Contenteditable surface, preview and markdown modes | Shipped (prototype) |
| Page-tint color rail | HSL gradient slider + presets + manual color picker on the right edge | Shipped (prototype) |
| Surface mode toggle | Floating vs flat | Prototype only — final answer undecided (keep both / drop one / rethink) |
| Attach popover | Attach a draft to a repo / detach | Shipped (prototype) |
| Overflow menu | Per-doc actions (delete, rename, etc.) | Shipped (prototype, scope TBD) |
| Keyboard shortcuts | ⌘N new draft; ⎋ closes modals | Shipped (prototype) |
| Persistence | Real save/load across reloads | **Planned** |
| Repo sync | Actual read/write to a local path or GitHub repo | **Planned** |
| Search | Across drafts and repo files | **Planned** |
| Tags / metadata | Frontmatter or in-app tagging | Open question |

## Tech stack

- **Platform:** Web app (modern browsers — Chrome / Safari / Firefox latest)
- **Frontend:** React 18 + TypeScript + Vite 5
- **Styling:** Vanilla CSS with CSS custom properties (no Tailwind, no UI lib)
- **State:** `src/store.tsx` — local React state via custom hook (`useStore`)
- **Data types:** `Draft`, `RepoFile`, `Repo` (see `src/types.ts`)
- **Markdown rendering:** `src/lib/markdown.ts` (custom — see file for current approach)
- **Persistence:** In-memory only as of the prototype. localStorage vs IndexedDB vs file-system access API is an open design question.

## Cost structure

None currently. If GitHub repo sync is implemented, OAuth + rate-limited API calls are a cost vector (free for personal use within GitHub's limits). No paid third-party services in scope.

## Out of scope (for now)

- Real-time collaboration / multi-user editing
- Mobile app (this is web-first; responsive-friendly is in scope, mobile-native is not)
- Plugin system
- Themes beyond page tint + light/dark
- Export to non-markdown formats

## Current status

- **Stage:** Prototype scaffold
- **Last updated:** 2026-05-13
- **Branch:** `seattle-v1`
- **Open questions:**
  - How does persistence work? (localStorage for drafts? IndexedDB? File System Access API?)
  - How does repo sync actually function — local file watcher? GitHub API? GitHub App?
  - Is there a "publish" concept (draft → repo-file promotion), or do drafts and repo-files always stay distinct?
  - **Surface posture:** keep both floating and flat? Drop one? Rethink entirely? (Currently both ship in the prototype.)
  - **Mini adoption:** when to swap vanilla CSS for the Mini design system. Likely soon.
  - Dark mode: needed in v1, or punt?
