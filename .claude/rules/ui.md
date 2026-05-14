---
paths:
  - "src/**/*.tsx"
  - "src/components/**"
  - "src/styles/**"
  - "src/App.tsx"
  - "**/*.css"
---

# UI Implementation Rules

This file loads automatically when you touch UI-related files in md-manager.

## Before making UI changes

1. Read `core-docs/design-language.md` — it is the source of truth for visual decisions. Tokens, typography, spacing, surface modes, component patterns all live there.
2. Skim `core-docs/feedback.md` for any UI-related rules captured from past corrections — avoid relearning the same lesson.
3. If the change is non-trivial, check `core-docs/plan.md` for the current work item and any UX goals associated with it.

## Design system enforcement

- Use CSS custom properties for all visual values: `--sand-*` for color, `--space-*` for spacing, `--radius-*` for corner radius, `--type-*` for font sizes, `--weight-*` for font weight, `--page-tint` for the user-controlled background.
- **No hardcoded hex codes, no hardcoded pixel values, no hardcoded font sizes** outside `src/styles/globals.css`.
- If a needed token doesn't exist, add it to `globals.css` (and document it in `design-language.md`) rather than hardcoding the value.
- Family fonts come from `body { font-family: 'Geist' ... }` and mono contexts use `'Geist Mono'` — don't introduce new typefaces.

## Accessibility (baseline — WCAG 2.1 AA)

- Use semantic HTML: `<button>` for actions, `<a>` for navigation, `<ul>`/`<ol>` for lists, heading tags in order. Never `<div onClick>` for interactive elements.
- Every icon-only button gets a descriptive `aria-label` (label the action, not the icon — "Open menu", not "Three dots").
- Focus must be visible on every focusable element. Don't `outline: none` without a clear replacement.
- Modals and popovers trap focus on open and restore focus on close. Escape closes them.
- Any animation > ~150ms respects `prefers-reduced-motion: reduce`.
- Color contrast: 4.5:1 for body text against the page tint; 3:1 for large text or UI components.

## Markdown rendering

- Markdown-to-HTML must sanitize. Never `dangerouslySetInnerHTML` raw user content.
- Code blocks render in `Geist Mono` with the `--gray-a5` wash background, `--radius-button` corners.
- Headings produce real heading tags (`<h1>`, `<h2>`, etc.) — never visual fakes via `<div class="h1">`.

## After making UI changes

- Run through the **Review checklist (visual)** and **Accessibility checklist** at the bottom of `core-docs/design-language.md`.
- If you discovered a pattern that should be reusable (or one that failed), document it in `design-language.md`.
- If a user correction during this work shifted your understanding of a UI rule, capture it in `core-docs/feedback.md`.
- Surface the dev URL (via `/link` if not running) so the user can verify in-browser.
