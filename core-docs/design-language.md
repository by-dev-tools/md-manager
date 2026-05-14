# Design Language

Source of truth for visual and interaction rules in md-manager. Every UI change complies with this document. If a pattern isn't here and it should be, **add it as part of the change**, don't drift past it.

Tokens live in `src/styles/globals.css` as CSS custom properties on `:root`.

---

## Family: sister app to Designer

md-manager and [Designer](/Users/benyamron/dev/designer/) are sister apps in the same product family. They share design DNA but are not copies of each other — each has its own thesis, scope, and personality. The cohesion is intentional; so is the variation.

**Shared DNA — keep these aligned with Designer unless there's a stated reason to diverge:**

- **Foundations:** Radix sand neutrals, Geist (sans) + Geist Mono (mono), no serifs.
- **Spacing rhythm:** `3/4/5/6` canonical steps (`--space-3` 8px, `--space-4` 16px, `--space-5` 24px, `--space-6` 32px). Other values are exceptions and should be justified.
- **Radius scale:** badge 3 / button 6 / card 10 / modal 12 / surface 24. Same shape language across both apps.
- **Type roles in chrome:** three sizes only — caption (13px), body (15px), h3 (18px). Hierarchy is carried by color → weight → size, not by stacking sizes.
- **Weight policy:** two-and-a-half weights in chrome — regular (400) for prose, medium (500) for labels/buttons/active items, semibold (600) reserved for h3 and numeric-as-signal callouts. No bold in chrome.
- **Surface tier model:** page + floating surface, not flat panes. The floating content surface sits on the page with `--surface-gutter` breathing room, `--radius-surface` (24px) corners, and a two-layer diffuse shadow stack. Sidebar lives on the page (no fill, no border).
- **Motion personality:** snappy, mostly functional. Short durations (120–250ms), eased. `prefers-reduced-motion` is required, not optional.

**Confirmed divergences (intentional, don't undo):**

| md-manager has… | Designer has… | Why we diverge |
|---|---|---|
| **User-controlled page tint** via the color rail (HSL gradient + presets, set per-doc) | **Monochrome accent policy** — black/white/sand only, no chromatic brand color | Notes are personal artifacts. Designer is a manager's cockpit — calm and uniform serves the user. md-manager is a writing surface — warmth and personalization serve the user. Inverse choices, both intentional. |

**Open questions (currently divergent in the prototype, not yet decided):**

| Area | Current state | Designer's choice | Decision status |
|---|---|---|---|
| **Surface posture** | Two modes shipped in the prototype: floating (rounded card on a gutter) and flat (full-bleed). Toggleable per session. | Floating only. | **Undecided.** Keep both, drop one, or rethink entirely is all on the table. Don't treat the current dual-mode as a finalized stance. |
| **Design system** | Vanilla CSS with custom-property tokens in `src/styles/globals.css`. | Mini (`packages/ui/`) with Radix Colors v3 + token layers. | **Likely adopting Mini soon.** The current vanilla setup is fine for the prototype; treat any new tokens or patterns as bridge work that should port cleanly to Mini when we move. Don't add elaborate token machinery here that Mini already provides. |
| **Dark mode** | Light only (currently). | Light + dark parity required. | **Punted for the prototype.** Captured in `roadmap.md`. Revisit when persistence + repo sync land, or sooner if Mini adoption forces it. |
| **Dev panel** | None. | Dev panels as the canonical design-exploration tool. | **Open.** Will adopt the pattern if surface tuning becomes ambiguous; not warranted at current scope. |

When working in any of the "Open questions" rows, treat them as undecided — don't write code or docs that lock the question shut without an explicit user call.

**When to add a new pattern that diverges from Designer:**

1. **Have a rationalization.** "It's different" isn't a rationale; "the user's primary activity here is X, and the Designer pattern serves Y" is.
2. **Capture the rationale in `history.md`** when the divergence ships — what was tried, why this won, what we'd revisit.
3. **Don't reinvent foundations.** Adding a new radius value, a new spacing step, or a new type role requires an axiom-style entry here; ad-hoc one-offs erode the family resemblance.
4. **Cross-check before committing.** A new pattern in md-manager that *could* benefit Designer is worth flagging in the PR (or a Designer-side issue) so the family stays cohesive.

The goal is sibling resemblance — anyone who knows Designer should recognize md-manager as part of the same family within seconds, but should also feel its distinct personality immediately.

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

> **Status: undecided.** The prototype currently ships both modes (toggleable via the segmented control or overflow menu). The final answer — flat only, floating only, or both — is an open question. See § "Family: sister app to Designer" for the open-question framing. The shapes below document **current behavior**, not a committed choice.

- **Floating** — `margin: var(--surface-gutter)` (12px), `border-radius: var(--radius-surface)` (24px), `box-shadow: var(--surface-shadow)`, `background: rgba(255,255,255,0.75)`. The surface looks like a card on the page tint.
- **Flat** — full-bleed, no margin, no radius, no shadow, surface background matches page tint. The page is the surface.

Transition between modes (while both exist): 200ms ease on margin / border-radius / box-shadow / background — simultaneously, in sync.

## Depth model

Three layers, in z-order:

1. **Page tint** — the user's chosen color fills the body.
2. **Content surface** — sits on the page tint (floating mode) or merges with it (flat mode).
3. **Float layer** — modals (z 50, with `rgba(20,20,18,0.18)` overlay + 2px backdrop blur), popovers and overflow menus (z 30), drag indicator (z 1000).

Shadow scale: light triple-stack for floating surface (`--surface-shadow`), heavier triple-stack for modals (`0 1px 2px / 0 16px 40px / 0 0 0 1px outline`). Never drop a single heavy shadow — always layer.

## Component guidelines

### False affordances are a bug

A button, input, link, menu item, or any other control visible on the surface must do its job today. Half-implementations get one of two paths:

- **Wire it** if the gap is < 1 day and uses existing primitives. This is the default — the user's mental model already expects the control to work.
- **Remove it** from the surface until it can ship complete. Capture the deferred work in `core-docs/roadmap.md` with the surface name, the gap, and the rough cost.

A control that produces invisible output, opens a broken state, or relies on the user not noticing is forbidden in the default build. Hide-behind-a-flag is an exception, not a default — use only when there's a legitimate dogfood reason to evaluate the rough version.

This rule is the design-system enforcement of CLAUDE.md § "Quality posture". Sister-app reference: Designer's `core-docs/design-language.md` "False affordances are a bug" line, and feedback entries FB-0036 / FB-0038.

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
