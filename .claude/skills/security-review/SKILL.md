---
name: security-review
description: >
  Cold-reads the current workspace diff vs `origin/main` for security
  issues relevant to a Vite + React + TypeScript markdown app: XSS via
  dangerouslySetInnerHTML or unsafe URL handling, secrets in committed
  files, localStorage/sessionStorage leakage of sensitive data, unsafe
  third-party deps, path traversal in file/repo handling, prototype
  pollution. Returns BLOCKER / NIT / FOLLOW-UP findings. Use during ship,
  on demand for any change touching markdown rendering, file I/O, or
  third-party data, or whenever the user says "security review", "audit
  this for security", or similar. This is one of two final-pass reviews
  the `ship` skill runs. Invokable directly by the user
  (`/security-review`) or programmatically by `/ship` via the Skill tool.
allowed-tools: Read, Glob, Grep, Bash, Agent
---

# Security review

Cold-read the workspace diff for security issues. This skill is invoked by `ship` as a final pass, and can be invoked directly when the user asks.

## When to invoke

- `ship` invokes this automatically as one of the two final-pass reviews.
- The user asks for a "security review" or "audit for security".
- A change touches markdown rendering, file I/O, repo connections, URL handling, persistence, or adds a third-party dependency.

Skip if the diff is doc-only or trivially safe (e.g. a copy tweak).

## Workflow

1. **Save the diff** (committed + uncommitted) and untracked files:
   ```sh
   { git diff origin/main..HEAD; git diff HEAD; } > /tmp/sec-diff.patch
   git ls-files --others --exclude-standard > /tmp/sec-untracked.txt
   ```

2. **Run focused greps** for high-signal patterns (these find things reviewers miss):
   ```sh
   git diff origin/main..HEAD | grep -nE 'dangerouslySetInnerHTML|innerHTML\s*=|eval\(|new Function\(|document\.write'
   git diff origin/main..HEAD | grep -nE 'http://[^/]|https?://\$\{|window\.open'
   grep -rEn '(api[_-]?key|secret|password|token|bearer)\s*[:=]\s*["'\''][^"'\'']{8,}' --include='*.{ts,tsx,js,json}' .
   ```
   Treat any survivors as findings.

3. **Launch the security reviewer** as a single `Agent` call (`subagent_type: Explore`). Cap at ~1000 words. Prompt scaffold:

   > You are a staff security engineer cold-reading a diff for a Vite + React + TypeScript markdown-notes app called md-manager.
   >
   > **Inputs:**
   > - Diff: `/tmp/sec-diff.patch`
   > - Untracked files (Read them in full): `/tmp/sec-untracked.txt`
   > - Spec: `core-docs/spec.md`
   > - Past feedback: `core-docs/feedback.md`
   >
   > **Hunt for:**
   > 1. **XSS in markdown rendering** — `dangerouslySetInnerHTML`, raw HTML pass-through, unsanitized `<a href>`/`<img src>` URLs. Markdown-to-HTML must sanitize. Check `src/lib/markdown.ts` and any preview component.
   > 2. **Unsafe URL handling** — `javascript:` URLs accepted; `window.open(userInput)`; user-controlled redirects.
   > 3. **Secrets in tree** — API keys, tokens, `.env` content, OAuth secrets in source files or committed configs. Check `package.json`, `vite.config.ts`, any new file.
   > 4. **Persistence leakage** — `localStorage` / `sessionStorage` / `IndexedDB` storing PII, tokens, repo credentials in cleartext. Note that `localStorage` is readable by any script on the origin.
   > 5. **Dependency risk** — any new dep in `package.json` with a known reputation issue, very low download count, or recent ownership change. Flag for human review; don't try to run an audit tool here.
   > 6. **Path traversal** — if file/repo paths come from user input and are joined to filesystem reads, check for `..` and absolute-path injection.
   > 7. **Prototype pollution** — `Object.assign({}, userInput)` patterns, `JSON.parse` of user data merged into shared objects.
   > 8. **CSP / iframe / postMessage** — if new iframes, check `sandbox` attrs. If `postMessage` is used, check `origin` validation.
   >
   > **Output format**, grouped by severity:
   > ```
   > ## BLOCKER
   > - <one-line description> — `path:line` — why it's a blocker — suggested fix
   >
   > ## NIT
   > - <one-line description> — `path:line` — suggested fix
   >
   > ## FOLLOW-UP
   > - <one-line description> — why it's deferred — proposed owner/horizon
   > ```
   >
   > If you find nothing of consequence in a category, say so. The bar is **honesty over polish.**

4. **Triage and act** (when invoked standalone — `ship` handles this itself when it invokes the skill):
   - **BLOCKER** — fix in workspace. Re-run `npm run typecheck`.
   - **NIT** — fix if cheap.
   - **FOLLOW-UP** — capture to `core-docs/roadmap.md` (or `core-docs/plan.md` if active-work-adjacent). Never **only** in the PR body.

5. **Report.** If invoked standalone: send the categorized findings + what you fixed to the user. If invoked by `ship`: return the findings to the `ship` flow so it can incorporate them into the Reviewer notes.

## Gotchas

- **Don't run `npm audit` automatically.** It's noisy. Mention dependency risk as a FOLLOW-UP for the user to investigate.
- **`localStorage` is not a vulnerability by itself** — only when it stores something sensitive. Don't flag generic UI state.
- **Markdown sanitization** depends on the renderer. If we use a library like `marked` or `markdown-it`, check its config for `html: false` / a sanitizer hook.
- **Reviewers can be confidently wrong.** Spot-check before fixing.
- **Built-in Claude Code `/security-review` exists** — its output is broader and more general; this skill is tuned for the md-manager stack. Use this one for in-flow ship reviews; the built-in is fine for an out-of-band deep audit.
