# Design Language

Source of truth for visual and interaction rules in md-manager. Every UI change complies with this document. If a pattern isn't here and it should be, **add it as part of the change**, don't drift past it.

Tokens live in `src/styles/globals.css` as CSS custom properties on `:root`.

---

## Core principles

1. **Content over chrome.** The writing surface dominates. Toolbars hide; padding breathes.
2. **Warm neutrals.** Sand palette (approximated Radix sand) — never cool grays.
3. **User-controlled tone.** Page tint (`--page-tint`) is set by the user via the color rail. Components inherit from it; text remains legible across all tints.
4. **Quiet motion.** Transitions are short (120–200ms), eased, and never block input. Reduced-motion is respected.
5. **Depth through layering, not shadow weight.** Surfaces float with light shadows and rounded corners; modals stack with a touch more depth. No drop-shadow heroics.
6. **Typographic hierarchy.** Hierarchy comes from size, weight, and color — not boxes, lines, or icons.

## Typography

**Typefaces:** Geist (sans, body and headings) + Geist Mono (sidebar, file names, code blocks, captions). System fallback: `-apple-system, sans-serif`.

**Letter-spacing:** Global `-0.005em` on the body for optical correction. Tighter at large display sizes (h1 `-0.015em`, h2 `-0.01em`).

| Style | Size | Weight | Use |
|---|---|---|---|
| Editor h1 | 26px | 600 | Document title |
| Editor h2 (`--type-h3`) | 18px | 600 | Document section |
| Body (`--type-body`) | 15px | 400 | Editor body, modal subtitle, default UI text |
| Caption (`--type-caption`) | 13px | 400 | Breadcrumbs, metadata, secondary UI |
| Sidebar row | 13px | 400 (500 selected) | Top-level sidebar rows |
| Sidebar leaf | 12px | 400 (500 selected) | Drafts list, file tree rows |
| Sub-label | 10.5px | 400 | Sidebar section labels (mono) |
| MD badge | 8.5px | 600 | File-tree extension chip (mono, uppercase) |

**Weights available:** 400 (`--weight-regular`), 500 (`--weight-medium`), 600 (`--weight-semibold`). No bolder.

## Color system

The palette is Radix-sand-inspired, semantically tokenized. Use tokens; never raw hex outside `globals.css`.

| Token | Value | Use |
|---|---|---|
| `--sand-1` | `#fdfdfc` | App background for raised surfaces (modals, popovers) |
| `--sand-2` | `#f9f9f8` | Inputs, subtle wells |
| `--sand-3` | `#f1f0ee` | Hover states on raised surfaces |
| `--sand-4` | `#e9e8e4` | Borders on inputs |
| `--sand-6` | `#d9d8d2` | (Reserved; subtle dividers if needed) |
| `--sand-9` | `#908e83` | Secondary text, icons in resting state, placeholders |
| `--sand-11` | `#63615b` | Primary muted text, icons on hover |
| `--sand-12` | `#21201c` | Primary text, primary button background |
| `--gray-a5` / `a6` / `a7` | rgba(0,0,0, .05 / .075 / .11) | Subtle washes over the page tint |
| `--page-tint` | user-set hsl | Page background; the user controls this via the color rail |
| `--page-tint-edge` | rgba(0,0,0,.06) | Borders that need to feel "of" the tint |
| `--page-text` / `-muted` / `-quiet` | scaled tones | Text on tinted surfaces |

**Contrast:** All body text must hit WCAG 2.1 AA against the page tint at any user-chosen color. The `--sand-12` text on `--page-tint` combinations have been chosen to pass; if a new token is introduced, verify contrast across the preset rail.

**Dark mode:** Not yet defined. Either ship it deliberately or punt — `roadmap.md` has it as "Later". Don't add ad-hoc dark styles.

## Spacing

8px base scale. Use tokens.

| Token | Value | Use |
|---|---|---|
| `--space-3` | 8px | Tight gaps (icon row, button cluster, search internal padding) |
| `--space-4` | 16px | Default gaps between elements (editor header gaps) |
| `--space-5` | 24px | Section separators, modal padding |
| `--space-6` | 32px | Editor padding-right, large rhythm |

Editor body padding: `40px 32px 60px` — wider than the base scale because the writing surface is its own thing.

## Corner radius

| Token | Value | Use |
|---|---|---|
| `--radius-badge` | 3px | Small chips (MD badge, sidebar row-action) |
| `--radius-button` | 6px | Buttons, inputs, sidebar rows, search input |
| `--radius-card` | 10px | (Reserved; small floating cards if needed) |
| `--radius-modal` | 12px | Popovers, overflow menus, modals |
| `--radius-surface` | 24px | The main content surface in floating mode |

`pill` (999px) is fine for tags/badges; declare it inline rather than tokenizing — it's its own thing.

## Surface modes

Two postures for the main content surface — set via the segmented control or overflow menu.

- **Floating** — `margin: var(--surface-gutter)` (12px), `border-radius: var(--radius-surface)` (24px), `box-shadow: var(--surface-shadow)`, `background: rgba(255,255,255,0.75)`. The surface looks like a card on the page tint.
- **Flat** — full-bleed, no margin, no radius, no shadow, surface background matches page tint. The page is the surface.

Transition between modes: 200ms ease on margin / border-radius / box-shadow / background — simultaneously, in sync.

## Depth model

Three layers, in z-order:

1. **Page tint** — the user's chosen color fills the body.
2. **Content surface** — sits on the page tint (floating mode) or merges with it (flat mode).
3. **Float layer** — modals (z 50, with `rgba(20,20,18,0.18)` overlay + 2px backdrop blur), popovers and overflow menus (z 30), drag indicator (z 1000).

Shadow scale: light triple-stack for floating surface (`--surface-shadow`), heavier triple-stack for modals (`0 1px 2px / 0 16px 40px / 0 0 0 1px outline`). Never drop a single heavy shadow — always layer.

## Component guidelines

### Buttons

- Default `.btn` — transparent background, sand-12 text, sand-3 hover. 7px × 14px padding, 13px medium.
- Primary `.btn-primary` — sand-12 background, sand-1 text. Hover: sand-11 background.
- Icon-only `.icon-btn` — 26×26, transparent, sand-11 → sand-12 on hover, `rgba(255,255,255,0.5)` hover bg (sits on page tint).
- **Always** include `aria-label` on icon-only buttons. Label the action, not the icon.

### Inputs

- Light well background (`--sand-2`), subtle border (`--sand-4`), focus border (`--sand-9`).
- Mono font for file paths and repo sources.
- Focus state is visible; never remove the focus ring without a clear replacement.

### Cards / surfaces

The main content surface is the only "card" by default. New floating surfaces (modals, popovers) follow the float-layer rules above.

### Empty states

To be defined as patterns emerge. Default: short, warm copy in `--sand-11`; no illustration unless deliberate.

### Loading states

To be defined. Default: skeleton blocks in `--gray-a5`, not spinners. Inline "Saving…" indicator for the editor uses `.saved` style (12px, `--sand-9`).

### Modals

- Overlay: `rgba(20,20,18,0.18)` with 2px backdrop-blur.
- Modal: `--sand-1` background, `--radius-modal`, triple-shadow stack, 420px max-width (clamped to viewport minus 40px).
- Always trap focus on open. Always restore focus on close. Always close on Escape.

### Popovers / menus

- `--sand-1` background, `--radius-modal`, light triple-shadow, z-30.
- Anchored absolutely to their trigger.
- Close on Escape, on outside click, and on item activation.

### Color rail (signature element)

- 12px-wide vertical strip on the right edge of the content surface.
- HSL gradient from warm orange (top) through yellow / green / blue / purple (bottom).
- Draggable marker reflects current `--page-tint`.
- Below the gradient: 8 preset swatches + a manual color picker (`<input type="color">` styled to disappear).
- Preset swatches scale 1.4× on hover; active swatch has an inset + outer ring.

## Animation

- **Duration:** 120ms (interactive feedback — hover, button states, chevron rotations), 200ms (surface mode transition, page-tint change), 60ms (color marker tracking the drag).
- **Easing:** `ease` for everything (no custom curves yet — add only if a motion requires it).
- **Reduced motion:** Any transition longer than ~150ms must respect `prefers-reduced-motion: reduce`. Currently the codebase does **not** enforce this universally — flagged as a P1 in `roadmap.md`.

## Accessibility checklist

Run through this before any UI ships:

- [ ] Every interactive element is a `<button>` or `<a>` (no `<div onClick>`)
- [ ] All icon-only buttons have a descriptive `aria-label`
- [ ] Keyboard Tab order is sensible; Escape closes modals/popovers; Enter/Space activate buttons
- [ ] Focus ring is visible on every focusable element
- [ ] Modals trap focus on open and restore on close
- [ ] Text contrast hits 4.5:1 (or 3:1 for large text / UI components) against the page tint
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Layout holds at 200% browser zoom
- [ ] Live-updating content (save indicator, errors) uses an `aria-live` region

## Review checklist (visual)

Before merging:

- [ ] Uses tokens for color / spacing / radius / font-size — no hardcoded hex or px
- [ ] Works against a representative range of page tints (light warm, light cool, mid-saturation)
- [ ] Transitions feel quiet (not bouncy, not slow)
- [ ] New surfaces match the existing chrome — same radii, same shadow scale, same hue family
