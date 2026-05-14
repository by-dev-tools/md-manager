---
name: accessibility-review
description: >
  Cold-reads the current workspace diff vs `origin/main` for accessibility
  issues relevant to a web markdown-notes app: semantic HTML, keyboard
  navigation, focus management, ARIA labels, color contrast (WCAG 2.1 AA),
  reduced-motion support, screen-reader announcements. Returns BLOCKER /
  NIT / FOLLOW-UP findings. Use during ship, on demand for any UI change,
  or whenever the user says "a11y", "accessibility review", or similar.
  This is one of two final-pass reviews the `ship` skill runs. Invokable
  directly by the user (`/accessibility-review`) or programmatically by
  `/ship` via the Skill tool.
allowed-tools: Read, Glob, Grep, Bash, Agent
---

# Accessibility review

Cold-read the workspace diff for accessibility issues. The target is **WCAG 2.1 AA** for a web app rendered in modern browsers. This skill is invoked by `ship` as a final pass, and can be invoked directly.

## When to invoke

- `ship` invokes this automatically as one of the two final-pass reviews.
- The user asks for an "accessibility review" or "a11y check".
- Any UI change ships — new component, new interaction, new modal/popover, new keyboard shortcut, new visual state.

Skip if the diff is non-UI (data layer, build config, doc-only).

## Workflow

1. **Save the diff** and untracked files:
   ```sh
   { git diff origin/main..HEAD; git diff HEAD; } > /tmp/a11y-diff.patch
   git ls-files --others --exclude-standard > /tmp/a11y-untracked.txt
   ```

2. **Run focused greps** for high-signal patterns:
   ```sh
   git diff origin/main..HEAD | grep -nE '<div[^>]*onClick|<span[^>]*onClick'
   git diff origin/main..HEAD | grep -nE 'tabIndex\s*=\s*\{?-?[2-9]'
   git diff origin/main..HEAD | grep -nE 'role=["'\'']button["'\'']'
   grep -rEn 'prefers-reduced-motion' --include='*.css' src/
   ```
   Treat survivors and absences as candidate findings.

3. **Launch the accessibility reviewer** as a single `Agent` call (`subagent_type: Explore`). Cap at ~1000 words. Prompt scaffold:

   > You are a staff accessibility engineer cold-reading a diff for a Vite + React + TypeScript markdown-notes app called md-manager. Target: WCAG 2.1 AA, modern web browsers.
   >
   > **Inputs:**
   > - Diff: `/tmp/a11y-diff.patch`
   > - Untracked files (Read in full): `/tmp/a11y-untracked.txt`
   > - Design language: `core-docs/design-language.md`
   > - Past feedback: `core-docs/feedback.md`
   >
   > **Hunt for:**
   > 1. **Semantic HTML** — `<div onClick>` / `<span onClick>` for interactive elements (should be `<button>` or `<a>`). Heading hierarchy gaps (h1 → h3 skipping h2). Lists not using `<ul>`/`<ol>`. Forms without labels.
   > 2. **Keyboard navigation** — Every interactive element reachable via Tab? Logical tab order? Custom keyboard shortcuts conflict with browser/AT defaults (e.g. blocking `/` or Cmd+F)? Escape closes modals/popovers? Enter/Space activate buttons?
   > 3. **Focus management** — Modal/popover traps focus on open and restores on close? Focus rings visible on all focusable elements (no `outline: none` without a replacement)? Newly mounted content receives focus when appropriate?
   > 4. **ARIA & screen reader** — Icon-only buttons have `aria-label`. Live regions for dynamic content (saves, errors). `aria-expanded` on disclosure controls. No redundant or wrong ARIA roles.
   > 5. **Color contrast** — Text vs background meets 4.5:1 (or 3:1 for large text / UI components). Especially check muted colors (`--sand-9`, `--page-text-quiet`, etc.) against `--page-tint` backgrounds. State indicators (focus, hover, selected) distinguishable without color alone.
   > 6. **Reduced motion** — Animations and transitions respect `prefers-reduced-motion: reduce`. Check `src/styles/globals.css` for media queries; absence is a finding for any new animation.
   > 7. **Markdown rendering accessibility** — Headings produce real heading tags. Images have alt text. Links describe their destination. Code blocks have a language label where useful.
   > 8. **Zoom & responsive** — Layout holds at 200% browser zoom and at a narrow window (< 600px). No overflow that hides interactive elements.
   > 9. **Form & input** — Inputs have associated `<label>` (visible or `aria-labelledby`). Placeholders are not labels. Error states are announced to AT, not just visually colored.
   >
   > **Output format**, grouped by severity:
   > ```
   > ## BLOCKER
   > - <description> — `path:line` — WCAG criterion if applicable — suggested fix
   >
   > ## NIT
   > - <description> — `path:line` — suggested fix
   >
   > ## FOLLOW-UP
   > - <description> — why deferred — proposed owner/horizon
   > ```
   >
   > Bar: WCAG 2.1 AA compliance is the floor, not the ceiling. Honesty over polish — if nothing of consequence in a category, say so.

4. **Triage and act** (when standalone — `ship` handles this itself when it invokes the skill):
   - **BLOCKER** — fix in workspace. Re-run `npm run typecheck`. Manually verify keyboard nav for the fix.
   - **NIT** — fix if cheap.
   - **FOLLOW-UP** — capture to `core-docs/roadmap.md` (or `core-docs/plan.md` if active-work-adjacent). Never **only** in the PR body.

5. **Report.** Same convention as `security-review`: standalone → user; via `ship` → returns findings to the ship flow.

## Gotchas

- **Contrast must include hover/focus states**, not just resting state. A muted resting color that becomes invisible on hover is still a finding.
- **Tab order follows DOM order**, not visual order. A grid-laid-out toolbar may tab in an unexpected sequence.
- **`prefers-reduced-motion` is not optional** — it's a user preference exposed by every modern OS. Any transition longer than ~150ms or any non-essential animation must check it.
- **Icon-only buttons need `aria-label`**, but the label should describe the **action**, not the icon ("Open menu", not "Three dots").
- **Reviewers can be confidently wrong.** Spot-check before fixing — especially contrast claims, which depend on the exact rendered color.
- **Don't add ARIA when semantic HTML works.** `<button>` beats `<div role="button" tabindex="0" onKeyDown=...>` every time.
