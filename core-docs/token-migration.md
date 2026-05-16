# Token migration plan (PR C)

Output of PR C Step 1 — the token name-collision audit. Read by PR C Step 3 (tokens migration), which executes the decisions captured here.

This doc is **scoped to PR C**. Once the migration ships, fold the durable parts into `design-language.md` (or leave a pointer) and archive the rest.

---

## Method

1. Build the project (`npm run build`) → produces the merged `dist/assets/*.css`.
2. Extract every `--<name>: <value>;` declaration from `src/styles/globals.css` and `packages/ui/styles/tokens.css`.
3. Compute the intersection by token name.
4. For each duplicate: check the bundled CSS to confirm which value the cascade resolves to. Within `:root` (same specificity), last declaration wins.
5. Categorize by value-equality and cascade-winner.

Load order in `src/main.tsx` (Mini first, ours last):

```
@mini-styles/tokens.css    →  Mini's token contract (axioms, color scales, motion)
@mini-styles/axioms.css    →  Mini-axiom-derived selectors (mostly neutralized today)
@mini-styles/primitives.css → primitive class hooks
@mini-styles/archetypes.css → archetype class hooks
./styles/globals.css       →  our project tokens + every component style
```

Confirmed in the build: for every collision, `dist/assets/*.css` contains both declarations in source order — Mini's first, ours second — so **our value wins by cascade for every collision**. No surprises in load order.

---

## Token surface — by source

### md-manager `src/styles/globals.css` defines (42 tokens)

Grouped by domain:

- **Layout/sizing:** `--editor-font` 15px, `--nav-section-gap` 24px, `--rail-width` 18px, `--sidebar-font` 13px, `--sidebar-width` 268px
- **Surface signature:** `--surface-gutter` 8px, `--surface-radius` 8px, `--surface-opacity` 0.6, `--surface-shadow` (composite), `--surface-shadow-alpha` 1
- **Page-tint signature:** `--page-tint`, `--page-tint-edge`, `--page-text`, `--page-text-muted`, `--page-text-quiet`
- **Sand neutrals:** `--sand-1, 2, 3, 4, 6, 9, 11, 12`
- **Black-alpha overlays (named `--gray-a*`):** `--gray-a5` 5%, `--gray-a6` 7.5%, `--gray-a7` 11%
- **Radius:** `--radius-badge` 3px, `--radius-button` 6px, `--radius-card` 10px, `--radius-modal` 12px, `--radius-surface` 24px
- **Space:** `--space-3` 8px, `--space-4` 16px, `--space-5` 24px, `--space-6` 32px
- **Type:** `--type-body` 15px, `--type-caption` 13px, `--type-h3` 18px, `--type-micro` 11px
- **Weight:** `--weight-regular` 400, `--weight-medium` 500, `--weight-semibold` 600

### Mini `packages/ui/styles/tokens.css` defines (~150 declared + ~120 imported from Radix)

`packages/ui/styles/tokens.css` *declares* ~150 tokens directly and `@import`s 14 Radix Colors stylesheets at the top (indigo, crimson, gray, green, amber, red, blue — plus their dark + alpha variants). The imports add ~120 token names per scale (12 light + 12 dark × ~5 scales × alpha + non-alpha). **These imported tokens are part of Mini's token surface** — they're available to consumer code as `var(--gray-a5)`, `var(--indigo-9)`, etc.

Collision-relevant subset (named-clash candidates):

- **Radius (declared):** `--radius-badge` 0.25rem, `--radius-button` 0.5rem, `--radius-card` 0.75rem, `--radius-modal` 1rem, plus `--radius-none` 0, `--radius-pill` 9999px
- **Space (declared):** `--space-1, 2, 3, 4, 5, 6, 7, 8` in rem (0.125 → 4 rem)
- **Weight (declared):** `--weight-regular` 400, `--weight-medium` 500, `--weight-semibold` 600, `--weight-bold` 700
- **`--gray-a1..12` (imported from `@radix-ui/colors/gray-alpha.css`):** Radix-scaled alpha black overlays. `--gray-a5` ≈ `#0000001f` (12% alpha), `--gray-a6` ≈ `#00000026` (15%), `--gray-a7` ≈ `#00000031` (19%). **Same names as ours, different values.**

Mini-only tokens (no name collision):

- **Accents:** `--accent-1..12`, `--accent-a1..a12`, `--accent-contrast` — bound to `--indigo-*` via `data-accent="indigo"` at the root.
- **Semantic colors:** `--danger-*`, `--info-*`, plus their `*-contrast`.
- **Grayscale (non-alpha):** `--gray-1..12` and the dark-mode counterpart, via `@radix-ui/colors/gray.css`. We don't define `--gray-N` (only `--gray-aN`), so no collision on the non-alpha names.
- **Type roles:** `--type-{caption,body,lead,h4,h3,h2,h1,display}-{size,leading,weight,tracking}` — decomposed per role. We have flat `--type-body/caption/h3/micro` (different names), so no collision.
- **Motion:** `--motion-instant/quick/standard/emphasized`, `--ease-*`, `--motion-{enter,exit,interactive}`, spring variants.
- **Elevation:** `--elevation-{flat,raised,overlay,modal}`, `--layer-{flat,raised,overlay,modal}`.
- **Focus:** `--focus-outline-{color,offset,width}` — currently neutralized at the root.

---

## Collision table (14 token names)

| Token | md-manager | Mini | Equal? | Bucket |
|---|---|---|---|---|
| `--radius-badge` | `3px` | `0.25rem` (4px) | **No** — ours -1px | DIFFERENT, ours intentional |
| `--radius-button` | `6px` | `0.5rem` (8px) | **No** — ours -2px | DIFFERENT, ours intentional |
| `--radius-card` | `10px` | `0.75rem` (12px) | **No** — ours -2px | DIFFERENT, ours intentional |
| `--radius-modal` | `12px` | `1rem` (16px) | **No** — ours -4px | DIFFERENT, ours intentional |
| `--gray-a5` | `rgba(0,0,0,0.05)` (5%) | `#0000001f` (≈12%) | **No** — ours much lighter | DIFFERENT, names-clash, see below |
| `--gray-a6` | `rgba(0,0,0,0.075)` (7.5%) | `#00000026` (≈15%) | **No** — ours much lighter | DIFFERENT, names-clash, see below |
| `--gray-a7` | `rgba(0,0,0,0.11)` (11%) | `#00000031` (≈19%) | **No** — ours much lighter | DIFFERENT, names-clash, see below |
| `--space-3` | `8px` | `0.5rem` (8px) | Yes | IDENTICAL |
| `--space-4` | `16px` | `1rem` (16px) | Yes | IDENTICAL |
| `--space-5` | `24px` | `1.5rem` (24px) | Yes | IDENTICAL |
| `--space-6` | `32px` | `2rem` (32px) | Yes | IDENTICAL |
| `--weight-regular` | `400` | `400` | Yes | IDENTICAL |
| `--weight-medium` | `500` | `500` | Yes | IDENTICAL |
| `--weight-semibold` | `600` | `600` | Yes | IDENTICAL |

**Summary:** 7 identical, 7 different (4 radius + 3 gray-a, all ours-wins by cascade), 0 surprises (every Mini-vs-ours showdown resolves to ours via load order).

The `--gray-a*` row is special — our tokens happen to share names with Mini's Radix-imported alpha-black scale, but the **semantics are different**: Mini's `--gray-a*` is a 12-step Radix scale (full design-system primitive); ours is three specific overlay opacities (5/7.5/11%) used as page-tint washes. Same names, different intent. This calls for a rename, treated separately below.

---

## Decisions for PR C Step 3

### A. Identical-value collisions (space, weight)

**7 tokens:** `--space-3/4/5/6`, `--weight-regular/medium/semibold`.

**Decision:** delete the duplicates from `src/styles/globals.css`. Mini's `packages/ui/styles/tokens.css` becomes the single source of truth. Visual effect: zero (values are identical).

**Why Mini wins as source:**
- Mini's `tokens.css` is fork-and-own (per `packages/ui/MINI-VERSION.md`), so editing it is supported and stays project-owned.
- Centralizing space + weight in Mini's tokens.css matches the long-term Mini contract — `generate-ui` and `enforce-tokens` skills look up tokens there.
- Eliminating duplicates simplifies the cascade story: one declaration per token, no "which file wins" question for future readers.

**One sub-question to resolve in Step 3:** unit. Mini uses rem (`0.5rem`), we use px (`8px`). At default 16px font-size they're equivalent. rem has the accessibility advantage of scaling with user font-size preference. Recommendation: **accept Mini's rem** when deleting our px duplicates. Visual change: none at default settings; behavior change: user font-size scaling now affects spacing (a feature). Document this shift in the design-language.md change log.

### B. Different-value collisions (radius)

**4 tokens:** `--radius-badge` 3px, `--radius-button` 6px, `--radius-card` 10px, `--radius-modal` 12px.

**Decision:** **rebind Mini's `tokens.css` with our values** (fork-and-own). Delete our duplicates from `globals.css`. Single source of truth in Mini's tokens.css with the values we want.

**Why our values, not Mini's:**
- Our radius scale is intentionally tighter than Mini's defaults (1-4px less across the chrome scale). This matches axiom #9 ("soft with one pillowy signature") in `design-language.md` — the chrome reads soft, and the 24px `--radius-surface` (which Mini doesn't define) stands out as the signature pillowy shape.
- Mini's softer defaults would make the chrome read closer to the surface, flattening the visual hierarchy between "buttons / inputs / modals" (now uniformly softer) and "the floating content card" (already pillowy). The current contrast — slightly-soft chrome under a clearly-pillowy surface — is load-bearing for the floating posture's visual identity.
- Adopting Mini's values would be a real design change without a design rationale; rejecting them with documentation is the cheaper move.

**Why fork Mini's tokens.css, not keep ours:**
- Same as bucket A — Mini's tokens.css is the contract surface for downstream Mini skills.
- Forking a token *value* doesn't break Mini's invariant checks (the names match the contract; only the values are project-tuned).

**Pattern-log entry to add at Step 3 ship:** "Radius scale rebound — md-manager's chrome radii are tighter than Mini's defaults to preserve the contrast between chrome and the 24px `--radius-surface`."

### C. md-manager-only tokens (no collision)

**29 tokens** in `globals.css` that have no counterpart in Mini's tokens.css:

- Page tint + page text family (5)
- Sand neutrals (8)
- Gray alpha overlays (3)
- Layout/sizing (5)
- Surface signature (4)
- `--radius-surface` (1)
- Flat type tokens (4) — `--type-body`, `--type-caption`, `--type-h3`, `--type-micro`

**Decision:** keep in `globals.css` for now. These are project-specific (page tint, surface signature) or our preferred naming pattern (flat `--type-body` vs Mini's decomposed `--type-body-size/leading/weight/tracking`).

**Open question for Step 3** — should the project-specific tokens move to Mini's `tokens.css` for consistency (single tokens file), or stay in `globals.css` (separation of "Mini contract" vs "project additions")? Both are defensible. Recommended: **move them into Mini's tokens.css** as a project-additions section at the bottom of that file. Reason: single source of truth, one grep finds everything. Cost: Mini's tokens.css grows from 169 to ~200 declarations. Acceptable.

### D. `--gray-a*` names-clash — split into its own pre-Step-3 PR

**3 tokens:** `--gray-a5/6/7`. Same names as Mini's Radix-imported alpha scale; different values and different intent (per the "Mini-only tokens" note above: Mini's `--gray-a*` is a 12-step Radix design primitive; ours is three specific page-tint overlay opacities).

**Decision:** **rename ours** to `--tint-overlay-{light,medium,strong}` (or similar — final name negotiated at the rename PR). Keep Mini's `--gray-a*` available untouched. The intent is preserved (page-tint wash overlays remain our pattern, just under a name that says what they are).

**This is its own PR — call it PR C / Step 3a — not bundled into Step 3.** Reasoning: the rename is a semantic-naming change touching every usage in `globals.css`; the migration in Step 3 is a mechanical duplicate-removal + radius-rebind. Bundling them makes the Step 3 diff harder to review and conflates two concerns. Step 3a lands first, Step 3 follows. Captured as a follow-up below.

### E. Mini-only tokens (we don't define)

**~150 Mini tokens + ~120 Radix-imported scales** with no md-manager counterpart by name. Currently inert — no app code consumes them — but available for PR C component migrations.

**Decision:** leave Mini's tokens.css unchanged for these. They become available as components migrate. Specifically:
- `--accent-*` — bound to indigo at the root, neutralized via the `:focus-visible { outline: revert }` block in `globals.css`. PR C Step 2 (contrast matrix) decides whether `--accent-8` clears contrast against every page-tint hue before any component starts using it for focus rings.
- `--weight-bold: 700` (Mini-only) — we explicitly do not use bold in chrome (design-language § Typography). The token exists in Mini's file; we don't use it. No action.
- `--type-{role}-*` decomposed — we keep our flat `--type-body/caption/h3/micro` for now. Could be migrated to Mini's decomposed pattern in a later PR if the readability or generative-UI use case justifies it. Out of scope for PR C.
- `--motion-*`, `--ease-*`, `--elevation-*`, `--layer-*` — usable from Mini's tokens.css as components migrate. No action at audit time.

---

## Work lists

### PR C Step 3a — `--gray-a*` rename (lands first)

Small, mechanical PR. Lands before Step 3 so that Step 3's diff is purely duplicate-removal + radius-rebind.

1. **Rename in `src/styles/globals.css`:** `--gray-a5/6/7` → `--tint-overlay-{light,medium,strong}` (or `--page-overlay-*` — final name decided at PR time). Touch the `:root` declarations and every selector that references them.
2. **Update `core-docs/component-manifest.json`:** the 3 components currently referencing `--gray-a*` (per Editor/Sidebar entries — verify list at PR time) get the new token names in `tokens_referenced`.
3. **Verify in `dist/assets/*.css`:** old `--gray-a*` declarations from globals.css are gone; Mini's Radix-imported `--gray-a*` remain. Our tint-overlay tokens declared cleanly.
4. **`npm run typecheck && npm run build`** clean.
5. **Pattern-log entry** at /ship time (synthesized by /ship, not inline).

### PR C Step 3 — tokens migration (lands after Step 3a)

The main migration. With the `--gray-a*` clash already resolved by Step 3a, this PR is mechanical duplicate-removal plus radius rebinding.

1. **Edit `packages/ui/styles/tokens.css`** — rebind `--radius-badge/button/card/modal` to our tighter values (3/6/10/12 px). Keep the rem-based `--space-*` and `--weight-*` declarations untouched. Add a comment block at the rebinding point explaining why (axiom #9, surface contrast).
2. **Append project-specific tokens to `packages/ui/styles/tokens.css`** — move the 29 md-manager-only token declarations from `globals.css`, grouped (page-tint, sand, surface, layout, type-flat, `--radius-surface`, tint-overlay tokens from Step 3a). One delimited section so the boundary between "Mini contract" and "project additions" is visible.
3. **Delete from `src/styles/globals.css`** — every `--*` declaration that now lives in `tokens.css`. The remaining `globals.css` is component selectors only, no `:root` token block.
4. **Verify `dist/assets/*.css`** — for each collision token, confirm only one declaration remains in the bundle and the value matches the table above.
5. **Run `node tools/invariants/check.mjs src/styles/globals.css`** — should pass cleanly with the `--*` token block removed.
6. **`npm run typecheck && npm run build`** — clean. Visual check: app should be byte-identical to current builds (all token values preserved).
7. **`design-language.md` change-log entry** at /ship time — synthesized by /ship, not inline. Reconcile the "Color system" / "Spacing" / "Corner radius" tables with the new single-source-of-truth location.

---

## Out of scope for this audit

- **Component migration** — Steps 4+ of PR C (Toast → Mini archetype, dialogs/popovers, layout primitives).
- **`--accent-8` contrast matrix** — Step 2 of PR C, prerequisite for components using `var(--accent-9)`.
- **Type-role decomposition** — moving from our flat `--type-body` to Mini's `--type-body-{size,leading,weight,tracking}`. Defer to a later PR or a design-language amendment.
- **Motion token adoption** — Mini's `--motion-*` and `--ease-*` are unused; introducing them requires a transition pass through `globals.css`. Defer.
