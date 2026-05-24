> **Superseded 2026-05-24 by the rename-host decision.** This brief targeted
> `byamron/project-template` as the plugin host. The actual architecture, after a
> follow-up planning session: **flow lives at `by-dev-tools/flow` (renamed in place
> from `by-dev-tools/llm-auditor` on 2026-05-23)**, not inside project-template.
> The PR 1 referenced in this brief was OPENED at `byamron/project-template#1`,
> sat for several days, then CLOSED without merge as part of PR 0 (operational
> rename). Most decisions captured here (plugin name "flow", 11-step loop content,
> `/simplify` is bundled native, the `/ship` 3a/3b port split, loud-warning for
> unset config slots, dev-docs/ pattern) all carry forward — they're locked in
> for flow's PR 1 in the new host repo. The content of the closed PR 1 will be
> re-applied to flow's first real PR (against `by-dev-tools/flow`) with
> adjustments for the new repo's existing structure (existing skills, agents,
> scripts at root → restructured into `plugins/flow/*`).
>
> See `core-docs/plan.md` "Flow plugin extraction" Active Work Item for the
> canonical architecture. See `core-docs/handoffs/flow-plugin-consolidation-2026-05-23.md`
> for the parallel-session decisions that drove this revision. See
> `core-docs/handoffs/{visuals,design-pipeline,spec-and-intake}-design-2026-05-23.md`
> for post-extraction (v1.x+) roadmap entries.

# Handoff: PR 1 — flow plugin init for byamron/project-template

Paste the section below ("Brief to paste") into the fresh agent in the `byamron/project-template` Conductor workspace on first turn. The brief is fully self-contained — the agent does not need access to md-manager.

This handoff doc is the permanent reference; if anything in the brief changes mid-execution (the user redirects in the project-template workspace), update this file with the resolution so the umbrella knows what landed.

---

## Brief to paste

> You're operating in a workspace anchored to the `byamron/project-template` GitHub repo. Default branch is `main`. The repo currently contains a stale earlier draft of a Claude Code workflow; your job is to convert it into a **Claude Code plugin marketplace + project template** per Anthropic's official pattern.
>
> This is PR 1 of a multi-PR effort. The umbrella plan lives in another repo (`by-dev-tools/md-manager`, `core-docs/plan.md` → "Flow plugin extraction") and was approved by the user. You don't need to read that file — everything you need is below. Per the cross-repo coordination decision (Option C hybrid), this repo gets its own `dev-docs/` for self-tracking starting in this PR.
>
> ### Locked decisions (don't re-litigate)
>
> 1. **Plugin name:** `flow`.
> 2. **Repo shape:** one repo hosts marketplace + plugin + (future) template. Anthropic's pattern is `.claude-plugin/marketplace.json` at root, plugins in `./plugins/<name>/` subdirectories.
> 3. **Git history preservation:** tag the last pre-conversion commit as `pre-flow-plugin` BEFORE making any new commits. Use explicit conversion commit messages. Reference the tag in the new README. Never force-push.
> 4. **Cross-repo tracking (Option C):** this repo gets a `dev-docs/` directory (separate from any future `template/` directory) containing this repo's own `plan.md` / `history.md` / `feedback.md` / `roadmap.md`. Per-PR plans live in `dev-docs/plan.md`. md-manager's plan.md only holds the cross-repo umbrella.
> 5. **PR 1 scope is limited:** marketplace skeleton + 2 skills (`/simplify`, `/ship` — minimal version) + canonical workflow doc + README + `dev-docs/` init. Everything else (other skills, agents, rules, schema, hooks, template directory) is PR 2 and PR 3.
>
> ### Workflow you must follow
>
> This project uses the same workflow your work is helping export. For PR 1 specifically:
>
> 1. **Plan first.** Before writing any code, write a PR 1 plan into `dev-docs/plan.md` as the first Active Work Item. Use the spec-walk-checkbox + confidence-verdict format described in this brief. **Surface the plan to the user and wait for explicit approval before executing.** Even though I (the brief-writer) approved the umbrella, the user is the actual gate-holder and may want to redirect on per-PR specifics.
> 2. **Execute against the checkboxes.** Stay in scope. New scope mid-execution → surface to the user, don't silently absorb.
> 3. **Commit per phase** with co-author trailer: `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`. Messages explain "why," not "what."
> 4. **Manual review pass before pushing.** The plugin's `/simplify`, `/staff-review`, `/security-review`, `/accessibility-review` don't exist yet (you're creating two of them in this PR), so do a manual cold-read of the diff with a security + simplification lens: look for hardcoded paths leaking user info, command-injection in any `` !`` `` blocks, secrets, duplication, dead content.
> 5. **Push, open PR against `main`, never merge.** The user merges.
>
> ### Bootstrap exception (no plugin loop ironically yet)
>
> Normally the workflow runs `/simplify` then `/staff-review` after each implementation phase. **You cannot here** — you're creating those skills in this PR; they don't exist in this workspace yet. Skip those skill invocations; do the manual cold-read described above instead. PR 2 onward can dogfood the plugin's own loop.
>
> ### Step-by-step execution
>
> #### Step A: Tag the old commit + branch
>
> ```sh
> git fetch origin --tags
> git tag pre-flow-plugin origin/main
> git push origin pre-flow-plugin
> git checkout -b flow-plugin-init origin/main
> ```
>
> Verify: `git tag` shows `pre-flow-plugin`; `gh api repos/byamron/project-template/git/refs/tags/pre-flow-plugin` returns the right SHA.
>
> #### Step B: Remove pre-conversion content
>
> Delete from the repo root: `CLAUDE.md`, the existing `.claude/` directory, the existing `core-docs/` directory. Keep `LICENSE` (MIT — license stays). Keep `README.md` for now; you'll rewrite it later in this PR.
>
> Commit: `Remove pre-conversion content (recoverable via 'git checkout pre-flow-plugin')`.
>
> #### Step C: Marketplace + plugin manifests
>
> Create `.claude-plugin/marketplace.json` at repo root:
>
> ```json
> {
>   "$schema": "https://json.schemastore.org/claude-code-marketplace.json",
>   "name": "byamron-plugins",
>   "owner": {
>     "name": "byamron",
>     "url": "https://github.com/byamron"
>   },
>   "metadata": {
>     "description": "Plugins for the managed-autonomy workflow",
>     "pluginRoot": "./plugins"
>   },
>   "plugins": [
>     {
>       "name": "flow",
>       "source": "flow",
>       "description": "Managed-autonomy 11-step workflow loop for any project",
>       "version": "0.1.0"
>     }
>   ]
> }
> ```
>
> (Verify the `$schema` URL against `https://code.claude.com/docs/en/plugin-marketplaces` — if it differs, use whatever Anthropic's current docs specify. Omit the field if there's no canonical schema URL.)
>
> Create `plugins/flow/.claude-plugin/plugin.json`:
>
> ```json
> {
>   "name": "flow",
>   "version": "0.1.0",
>   "description": "Managed-autonomy 11-step workflow loop: plan → execute → preflight → simplify → staff-review → ship. Adapts to any project via .claude/workflow.config.json.",
>   "author": {
>     "name": "byamron",
>     "url": "https://github.com/byamron"
>   },
>   "homepage": "https://github.com/byamron/project-template",
>   "license": "MIT"
> }
> ```
>
> Commit: `Add marketplace + flow plugin manifest (Anthropic plugin pattern)`.
>
> #### Step D: Port `/simplify` skill
>
> Fetch the source from md-manager (via GitHub API — no clone needed):
>
> ```sh
> gh api repos/by-dev-tools/md-manager/contents/.claude/skills/simplify/SKILL.md --jq '.content' | base64 -d > /tmp/simplify-source.md
> ```
>
> Read `/tmp/simplify-source.md`. Port it to `plugins/flow/skills/simplify/SKILL.md` with these adaptations:
>
> - **De-project:** remove any md-manager-specific path references (e.g., `src/store.tsx`, `src/components/`, etc.). Replace with generic "the changed code" or "files in the diff."
> - **Add dynamic context injection for project config.** At the top of the skill body, inject project context like:
>   ```
>   ## Project context
>   - Workflow config: !`cat .claude/workflow.config.json 2>/dev/null || echo "{}"`
>   - Changed files: !`git diff --name-only $(git merge-base HEAD origin/HEAD 2>/dev/null || echo HEAD~1)...HEAD`
>   ```
>   Use `2>/dev/null || echo` fallbacks so the skill degrades gracefully in projects without these files.
> - **Frontmatter:** ensure `description:` is specific enough that Claude auto-loads it after refactor commits (the doc says descriptions should put key use case first).
> - **Don't reference md-manager skills** like `/staff-review` by name; reference them as `flow:staff-review` (the plugin namespace) since that's what consumers will type.
>
> Commit: `Port /simplify skill (de-projected; dynamic context injection)`.
>
> #### Step E: Port `/ship` skill (minimal — PR 2 will fill placeholders)
>
> Fetch the source:
>
> ```sh
> gh api repos/by-dev-tools/md-manager/contents/.claude/skills/ship/SKILL.md --jq '.content' | base64 -d > /tmp/ship-source.md
> ```
>
> Port to `plugins/flow/skills/ship/SKILL.md` with the same adaptations as `/simplify`, PLUS:
>
> - **Replace hardcoded `gh pr create --base main`** with default-branch discovery:
>   ```
>   !`git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || cat .claude/workflow.config.json 2>/dev/null | jq -r '.defaultBranch // "main"' || echo "main"`
>   ```
>   First try git-discover, fall back to config-file slot, fall back to literal `main`.
> - **Wherever `/ship` would invoke `/security-review` or `/accessibility-review`,** insert a placeholder block:
>   ```
>   > **[PR 1 LIMITATION]** Security and accessibility final-pass reviews are not yet
>   > available in the flow plugin (they ship in PR 2). In the meantime, the user
>   > should run them manually or skip them for low-risk PRs. This placeholder
>   > will be replaced when PR 2 lands.
>   ```
> - **Wherever `/ship` references doc paths** (`core-docs/history.md`, `core-docs/plan.md`, etc.), read from the workflow config with documented fallbacks:
>   ```
>   - History: !`cat .claude/workflow.config.json 2>/dev/null | jq -r '.historyPath // "core-docs/history.md"'`
>   ```
>
> Commit: `Port /ship skill (minimal; placeholders for security+a11y reviews until PR 2)`.
>
> #### Step F: Port `core-docs/workflow.md` to `plugins/flow/docs/workflow.md`
>
> Fetch:
>
> ```sh
> gh api repos/by-dev-tools/md-manager/contents/core-docs/workflow.md --jq '.content' | base64 -d > /tmp/workflow-source.md
> ```
>
> Port to `plugins/flow/docs/workflow.md`. Adaptations:
>
> - **De-project all examples.** Remove md-manager-specific paths (`src/store.tsx`, `--sand-*`, etc.). Keep canonical 11-step loop intact.
> - **Add a "Project config slots" section** at the top documenting that the plugin reads from `.claude/workflow.config.json` for project-specific values, with the table of slots and defaults (paths, default branch, modes, etc.). PR 2 will formalize this as a JSON Schema; for now, document the slots in narrative form.
> - **Add a "Bootstrap status" section** noting that as of plugin v0.1.0, only `/flow:simplify` and `/flow:ship` ship — the full skill set comes in v0.2.0 (PR 2). Document the placeholder limitation in `/ship` explicitly.
>
> Commit: `Add canonical workflow.md (de-projected; documents project config slots)`.
>
> #### Step G: Rewrite `README.md`
>
> Replace the existing README with content covering:
>
> - **What this repo is:** a Claude Code plugin marketplace hosting the `flow` plugin + (eventually, PR 3) a project template.
> - **Install:** `/plugin marketplace add byamron/project-template && /plugin install flow` in any Claude Code session.
> - **What `flow` does:** brief summary of the 11-step loop (point at `plugins/flow/docs/workflow.md` for detail).
> - **Status:** v0.1.0 — `/flow:simplify` and `/flow:ship` (minimal) shipped. v0.2.0 will add the full skill set.
> - **History section:** "This repo previously held an earlier draft of a Claude Code workflow. It was converted to a plugin marketplace on YYYY-MM-DD; the pre-conversion content is recoverable via `git checkout pre-flow-plugin` or the tagged release `pre-flow-plugin`. See conversion commit `<sha>` for the cutover."
>
> Commit: `Rewrite README for plugin-marketplace shape; document history tag`.
>
> #### Step H: Initialize `dev-docs/`
>
> Create `dev-docs/plan.md` with the PR 1 plan as its first Active Work Item (the same plan you wrote in Step 1, copied here so this repo is self-tracking from day one). Update its status to "shipped" once this PR is open.
>
> Create `dev-docs/history.md`, `dev-docs/feedback.md`, `dev-docs/roadmap.md` with format headers + empty entries sections. Use the same formats md-manager uses (you can reference md-manager's via `gh api repos/by-dev-tools/md-manager/contents/core-docs/<file>` if you need to see the exact format).
>
> In `dev-docs/roadmap.md` "Now" section, list PRs 2 and 3 of the umbrella as the next work.
>
> Commit: `Initialize dev-docs/ for plugin self-tracking (per Option C hybrid)`.
>
> #### Step I: Manual review pass (replaces /simplify + /staff-review for this PR only)
>
> Cold-read the full diff (`git diff origin/main...HEAD`) with these lenses:
>
> - **Security:** any hardcoded paths that leak filesystem info? Any `` !`<command>` `` blocks with unsanitized substitution? Any secrets accidentally committed? Any unsafe shell patterns (unquoted variables, command injection)?
> - **Simplification:** any duplicated content between the two SKILL.md files that should DRY into a shared doc? Any dead text from the original md-manager versions you forgot to remove?
> - **Project-agnostic check:** grep your own diff for `md-manager`, `pattaya`, `sand-`, `--space-`, `Geist`, `Mini` — these are md-manager-specific tokens that shouldn't appear in the plugin.
>
> Fix any findings in-tree. Commit: `Manual review pass: <summary of findings fixed>`.
>
> #### Step J: Verification (local plugin smoke test)
>
> In a fresh temporary directory, NOT this workspace:
>
> ```sh
> mkdir -p /tmp/flow-smoke && cd /tmp/flow-smoke
> git init && echo "test" > file.md && git add . && git commit -m "init"
> echo "modified" >> file.md
> ```
>
> Then launch `claude` in `/tmp/flow-smoke`, run:
>
> ```
> /plugin marketplace add https://github.com/byamron/project-template
> /plugin install flow
> ```
>
> (If installing from your branch instead of merged main, pass `--ref flow-plugin-init`.)
>
> Confirm via `/help` that `flow:simplify` and `flow:ship` appear. Invoke `/flow:simplify` on the 1-line diff; confirm it produces output without crashing on the absent `core-docs/` and absent `workflow.config.json`. Capture any errors in a `dev-docs/feedback.md` entry to address in PR 2 — don't try to fix them in PR 1.
>
> #### Step K: Push + open PR
>
> ```sh
> git push -u origin flow-plugin-init
> gh pr create --base main --title "PR 1: Convert repo to flow plugin marketplace + initial skills" --body "$(cat <<'EOF'
> ## Summary
> Converts byamron/project-template from a stale workflow draft into a Claude Code plugin marketplace per Anthropic's official pattern. Adds the `flow` plugin v0.1.0 with two skills: `/flow:simplify` and `/flow:ship` (minimal — placeholders for security + a11y reviews land in PR 2).
>
> ## Decisions locked in this PR
> - Repo shape: marketplace at `.claude-plugin/marketplace.json`, plugin at `./plugins/flow/`.
> - Plugin name: `flow`. Initial version: `0.1.0`.
> - Old content preserved at tag `pre-flow-plugin` (recoverable via `git checkout pre-flow-plugin`).
> - Self-tracking via `dev-docs/` (separate from any future `template/` directory).
>
> ## PR 1 limitations (intentional — backfilled in PR 2)
> - `/flow:ship` has placeholder sections for the security + a11y final-pass reviews; those skills don't exist in the plugin yet.
> - No project-template directory yet — PR 3 adds it.
> - No JSON Schema for `workflow.config.json` yet — PR 2 adds it.
>
> ## Test plan
> - [x] Marketplace JSON validates with `jq`.
> - [x] Plugin manifest validates with `jq`.
> - [x] Local smoke test: `/plugin marketplace add` + `/plugin install flow` succeeds in a fresh dir.
> - [x] `/flow:simplify` invoked on a 1-line diff in a project without `core-docs/` — degrades gracefully.
> - [x] `git diff` cold-read with security + simplification + project-agnostic lenses.
>
> ## Next
> - PR 2: port `/staff-review`, `/security-review`, `/accessibility-review`, `/ship-spike`, agents, rules, tools/memory, hooks, schema. Backfill `/ship` placeholders.
> - PR 3: project-template directory + bootstrap docs.
>
> Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
> EOF
> )"
> ```
>
> Output the PR URL when done. **Do not merge.** The user merges.
>
> ### What you must NOT do
>
> - **Don't merge.** `gh pr merge` is never your action. Ever.
> - **Don't force-push.** History preservation is load-bearing for this conversion.
> - **Don't port skills that aren't named in this brief.** `/staff-review`, `/security-review`, etc. are PR 2 — leaving placeholders is deliberate.
> - **Don't add a `template/` directory.** That's PR 3.
> - **Don't expand scope.** New scope discovered → surface to the user, update the plan, get approval, then continue.
> - **Don't introduce md-manager-specific tokens or paths** in the plugin's content. Grep your own diff for `md-manager`, `sand-`, `space-`, `Geist`, `Mini`, `pattaya` before the manual review pass.
> - **Don't skip the plan-approval gate.** Even after this brief, you must write the per-PR plan in `dev-docs/plan.md` and wait for the user's explicit "approved" before executing steps A–K.
>
> ### Confidence verdicts to include in your plan
>
> Write these into the `dev-docs/plan.md` Active Work Item:
>
> - **`/simplify` ports cleanly with no behavior change: HIGH** (cold-read the source first to confirm).
> - **`/ship` partial port + placeholders satisfies PR 1 scope: MEDIUM** — surface clearly that PR 1's `/ship` cannot do security+a11y; the user must redirect if that's a blocker.
> - **Marketplace JSON shape works on first try: HIGH** (verified against Anthropic's docs in this conversation).
> - **`pre-flow-plugin` tag survives the conversion and is fetchable post-merge: HIGH** (standard git operation).
>
> ### Risks
>
> - **Plugin install across the workspace boundary.** Verification step J uses `/tmp/flow-smoke`; if that fails because Claude Code can't install from an unmerged branch, document the failure and proceed (smoke test can be re-run after merge). Don't block PR open on smoke test if the failure mode is "Claude Code can't see the branch."
> - **`gh api` may return non-base64 content for small files.** If `base64 -d` fails, use `gh api ... --jq '.content' --header 'Accept: application/vnd.github.raw'` instead.
> - **`description:` field for `/flow:simplify` may not auto-trigger on the right phrases.** This is a tuning issue; capture in `dev-docs/feedback.md` if observed during smoke test, fix in a follow-up rather than blocking PR 1.
>
> ### Reference: Anthropic plugin marketplace docs
>
> - Skills: `https://code.claude.com/docs/en/skills`
> - Plugins: `https://code.claude.com/docs/en/plugins`
> - Plugin marketplaces: `https://code.claude.com/docs/en/plugin-marketplaces`
>
> Key facts (so you don't need to re-derive):
> - Marketplace JSON lives at `.claude-plugin/marketplace.json` at repo root.
> - Plugin JSON lives at `<plugin-dir>/.claude-plugin/plugin.json`.
> - Skills inside a plugin go under `<plugin-dir>/skills/<skill-name>/SKILL.md`.
> - Plugin skills are namespaced as `plugin-name:skill-name` (so `flow:simplify`, not just `simplify`).
> - For plugins in the same repo as the marketplace, use a relative path (`"source": "flow"` resolves to `./plugins/flow` because `metadata.pluginRoot` is `"./plugins"`).
>
> ### Start
>
> Write the PR 1 plan into `dev-docs/plan.md` (after `git checkout -b flow-plugin-init` and creating the dev-docs/ directory if it doesn't exist — though you'll also create dev-docs/ as part of Step H, so for the plan-first step, just create `dev-docs/plan.md` as a standalone file first).
>
> Surface the plan. Wait for "approved." Then execute A through K.

---

## What happens after the brief is executed

- The fresh agent surfaces the PR URL.
- Bring the URL back to **this** md-manager workspace.
- I update md-manager's `core-docs/plan.md` "Active Work Items → Flow plugin extraction → PR 1 checkboxes" with the PR link + check off the verification line.
- I add a one-line breadcrumb to md-manager's `core-docs/history.md` at the next `/ship`: "Flow plugin v0.1.0 shipped at byamron/project-template@<sha>; see that repo's `dev-docs/history.md` for detail."
- Per the umbrella plan, PR 2 (more skills + schema + hooks) is next. Same handoff pattern: write the brief here, you paste it in the project-template workspace.
