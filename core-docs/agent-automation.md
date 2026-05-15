# Agent Automation Research

Research compiled May 14, 2026 on the `research-claude-scheduling-automation` branch. The question driving this work: can the md-manager workflow (currently human-triggered, sequentially executed) be evolved into a delegated, async workflow where agents make progress throughout the day while the human stays in the loop only for ideation, design review, and merge?

This doc is the reference for that question — patterns from the field, tooling landscape, pricing reality, and a recommended migration sequence for md-manager specifically.

---

## 1. Strategic landscape

### 1.1 Five levels of agent autonomy (Swarmia)

| Level | Pattern | Human role | Review gate | Best for |
|---|---|---|---|---|
| L1 Assistive | Inline autocomplete | Approve every keystroke | Real-time | Single-file edits |
| L2 Conversational | Chat with repo access | Steer multi-step interactively | After each agent action | Ambiguous tasks |
| L3 Task agent | Async PR creation | Define objective, review PR | PR review | Well-scoped work |
| L4 Autonomous teammate | Scheduled/batch agent | Set objectives + schedule | Batch review | Recurring maintenance |
| L5 Orchestrator | Agents spawning agents | Oversee planners/judges | Trust boundaries | Large parallel problems |

Critical insight: **higher isn't better.** Match level to task definition clarity. Putting an L4 agent on a design-y task produces confidently wrong work. Most teams plateau at L2–L3 because the work doesn't merit more.

### 1.2 Humans in/on/out of the loop (Martin Fowler)

- **In the loop** (inspect every diff): doesn't scale; you become the bottleneck.
- **Out of the loop** ("vibe coding"): debt spirals; no quality signal.
- **On the loop** (recommended): humans engineer the **harness** — specs, evals, review pipelines, templates. Agents do the work. Humans review reports, not artifacts.

`workflow.md` *is* md-manager's harness. The role shift is from executing the harness to designing and maintaining it.

### 1.3 Conductor → orchestrator (O'Reilly framing)

- **Conductor**: tight real-time loop with one agent (current Conductor + Claude Code in terminal setup).
- **Orchestrator**: dispatches multiple agents in parallel; checks back on completed work.

Going async requires three muscles:
1. **Front-loaded spec quality** — agents need clearer specs than humans need.
2. **Mid-task monitoring** — dashboards, not babysitting.
3. **Back-loaded review** — PR reviews + plan reviews are the leverage points.

### 1.4 Anti-patterns the field has named

- **The ralph loop**: agent iterates on itself with no human gate, no eval, no scoped end state. The thing that makes L4+ survivable is the eval suite, not the agent.
- **Inspecting every diff at L3+**: defeats the purpose; back to L2 with extra steps.
- **Schedule-only triggers**: time-based agents waste compute. Event-based triggers (issue labeled, PR opened, test failed) produce real work.
- **Putting follow-ups in PR bodies only**: lost at merge. Persistent docs (roadmap, plan, history) are canonical. md-manager already enforces this in `general.md`.

### 1.5 Where human review is highest-leverage

Across the research, two checkpoints dominate:

1. **Plan/spec review** (before any code is written). Cosmos and a few other tools made this their core differentiator. This is where human design judgment compounds most.
2. **Final PR review** (before merge). Always.

Mid-execution review is rarely worth it for well-scoped tasks. For design-y tasks, stay at L2 — there is no mid-execution; everything is mid-execution.

---

## 2. Linear as agent infrastructure

### 2.1 Why Linear (vs. orchestrating in Conductor or a custom queue)

Linear is built for delegation — assignee + delegate model, agent sessions, automations, team-scoped membership. Conductor is great for parallel sessions actively managed by the human; Linear is the right surface for "agents make progress while away from the keyboard."

### 2.2 Delegation model

- **Assignee** stays the human; they remain responsible.
- **Delegate** is the agent; it acts on the issue.
- Triggered by either (a) assigning the issue to an agent or (b) `@mentioning` the agent in a comment.

Maps cleanly onto Fowler's "humans on the loop": human owns outcomes, agent does the work.

### 2.3 Agent Session API (developer platform)

When an agent is delegated or mentioned, Linear creates an `AgentSession` and sends a webhook. The agent has **10 seconds** to emit a `thought` activity. State is tracked automatically; the agent posts progress, comments, and `externalUrls` (e.g., PR URL).

Webhook events:
- `AgentSessionEvent` (created, prompted)
- `PermissionChange` (admin revokes access)
- Inbox notifications

Agents don't count toward billable seats. They behave as workspace members for permissioning purposes.

### 2.4 Supported coding agents (out of the box)

| Agent | Notes |
|---|---|
| Claude Code | Anthropic official integration; OAuth to subscription |
| Cursor | Background agents; cloud-execution |
| OpenAI Codex | Cloud-only delegation, ChatGPT-plan-included |
| GitHub Copilot | Linear issue → GitHub PR |
| Devin | Scopes issues + drafts PRs; expensive |
| Factory | Codes/tests/PRs |
| Charlie | TypeScript-focused; plans + reviews |
| Warp | Investigates bugs |
| Cyrus | Claude Code-powered, Linear+GitHub+Slack |

Reported adoption: ~75% of Linear enterprise workspaces have at least one coding agent installed; agent-completed work has 5×'d in three months (Linear's own stat).

### 2.5 Automations (Business / Enterprise plan)

Rule-based triggers, all team-scoped:
- State change → auto-assign / auto-label
- Label applied → trigger workflow
- Template-based issue creation → set priority/assignee
- Triage entry → run agent for context summary

Built-in automations are deliberately simple. For richer routing, people bolt on Zapier-style tools or build custom agents on the developer API.

### 2.6 Workspace / Team structure

Recommended structure for the existing `yamron` workspace: side projects as **Teams**, not Linear Projects. Reasons:

- Agent membership is team-scoped (granting Claude Code access to specific teams; otherwise it can touch every project)
- Automations are team-scoped
- Workflows (state machines) are team-scoped
- Issue prefixes are per-team (`MD-123` reads better than `YAM-`)
- Linear "Projects" are designed for *time-bounded initiatives within a Team* with milestones and end dates — exactly what `roadmap.md` horizons describe

Caveat: Linear's free plan caps team count (~2). Standard ($8/seat/mo) removes the cap and unlocks automations. Upgrade is unavoidable for serious agent delegation.

---

## 3. Tooling landscape

### 3.1 Claude Code

- **Interactive terminal use**: subscription-included, unchanged.
- **Linear integration / Agent SDK / `claude -p` / Claude Code GHA**: moves to metered SDK credit June 15, 2026 (see § 4).
- **Sub-agents** (in-CLI mechanism): isolated context windows, custom system prompts, scoped tool access. Useful for routing tasks to cheaper models (Haiku) for cost control.
- **Strengths**: Opus 4.7 leads SWE-bench Verified at 87.6%; 1M context (Opus 4.7); strongest local-loop quality.
- **Weaknesses**: post-June-15 metered credit may not cover heavy programmatic use without overage; pricing churn (three changes in two months).

### 3.2 OpenAI Codex

- **Cloud agents**: plan-included on ChatGPT Plus/Pro/Business/Enterprise. No metered credit denominated in dollars.
- **Pro $200**: 20× Plus baseline; 5-hour rolling window with weekly caps. Cloud task allocation is 100-600 per 5-hour window on Pro $100 (Pro $200 scales up).
- **Strengths**: leads Terminal-Bench 2.0 at 77.3%; cleaner billing model for async work; most stable pricing in the field.
- **Weaknesses**: 400K context (Claude has 1M); less polished for complex multi-file refactors.

### 3.3 Cursor

- **Pro $20**: includes background agents and Linear delegation.
- **Catch**: $20 of dollar-denominated credit drains fast when using premium models (Claude, GPT-4-class). After that, usage-based billing.
- **Position**: cheapest entry, smallest ceiling. Good for dogfood, won't scale.

### 3.4 GitHub Agentic Workflows

- Plain-markdown workflow files that **compile** into auditable GitHub Actions YAML via `gh aw`.
- `safe-outputs` declarations cap agent permissions ("create at most one PR, no direct pushes").
- PRs are never auto-merged. Humans gate.
- Compatible with multiple agents (Copilot, Claude Code, Codex) at the engine layer.
- Most production-ready harness pattern publicly documented. Templated version of what `.claude/skills/` already encode.

### 3.5 Stacked PRs + Merge Queue

- GitHub shipped native stacked PRs in 2026 (`gh-stack` CLI extension).
- Agent-mode integration: `gh skill install github/gh-stack` teaches AI agents how to create and manage stacks.
- Combined with GitHub's native merge queue: queue serializes merges, re-runs CI on the rebased commit, rejects PRs that break HEAD.
- Replaces hand-rolled "rebase-bot" for most use cases. Strictly better when available.

### 3.6 Conductor (where it fits)

- Wraps interactive `claude` CLI sessions in worktrees.
- From Anthropic's POV: interactive sessions. **Unaffected by June 15 change.**
- Strength: parallel local sessions with worktree isolation.
- Position in the stack: keep for *active* design/critique/interactive sessions; let Linear handle delegated/async work.

### 3.7 Other notable tools

- **Cyrus**: Claude Code wrapper specifically for Linear + GitHub + Slack delegation.
- **Composio agent-orchestrator**: multi-agent parallel orchestrator that handles CI fixes, merge conflicts, code reviews autonomously.
- **AsyncReview**: open-source agentic code review using recursive language models — gathers real codebase data instead of just diff lines.
- **Cosmos**: explicit spec-review checkpoint before any code is written. The pattern worth stealing.

---

## 4. The Anthropic June 15, 2026 change

### 4.1 What's changing

Programmatic Claude usage splits off the subscription's interactive pool into a separate **Agent SDK credit pool**, denominated in dollars and drained at API rates.

Affected surfaces:
- Agent SDK (Python/TypeScript)
- `claude -p` (headless mode)
- Claude Code GitHub Actions
- Third-party integrations: Linear, Conductor (cloud), OpenClaw, Zed ACP, Cyrus, etc.

Unaffected:
- Interactive Claude Code in terminal/IDE
- Web/desktop/mobile chat
- Claude Cowork
- Conductor running interactive `claude` in worktrees

### 4.2 Credit amounts

| Plan | Monthly credit | Equivalent agent tasks (est.) |
|---|---|---|
| Pro $20 | $20 | ~10-60 small tasks |
| Max 5× $100 | $100 | ~30-300 |
| Max 20× $200 | $200 | ~60-600 |

Range varies because token spend per task is $0.30–$5 depending on context size, output length, and model choice.

### 4.3 Mechanics

- Credit must be **claimed once** via account email instructions before June 15.
- Resets monthly. **No rollover.**
- Per-user; **not poolable** across teammates.
- Caching and batch discounts apply at standard API rates.
- Once exhausted: stops *or* rolls to API overage at full rates (user toggles).

### 4.4 The pre-existing model and the gap

Before this change, programmatic calls drew from the same pool as interactive — effectively unmetered. Heavy users were extracting:
- Zed's estimate: **15–30× subsidy** vs. API rates
- Theo Browne (T3 Code): **25–40×** for his customer base

A $200/mo Max 20× subscriber running heavy agents was extracting $3,000–$8,000/mo of API-rate inference. That's the gap being closed.

### 4.5 Timeline of recent Anthropic moves

| Date | Action |
|---|---|
| April 2026 | Banned third-party agents from drawing on subscription pool |
| Mid-April 2026 | Briefly removed Claude Code from $20 Pro plan; reversed after backlash |
| May 13, 2026 | Announced June 15 model — third-party access restored, but metered |
| June 15, 2026 | Change goes live |

The current settlement is probably not the last word. Anthropic has retreated twice already; expect further iteration.

### 4.6 Community reaction

Skewing negative. Representative HN complaint: "99% of my Max plan usage is non-interactive, and this post-June 15 pricing will far, far exceed what I can afford." Zed's official response advises users to either fall back to running the official `claude` CLI in their terminal (interactive, unaffected) or switch providers.

Anthropic's rationale: compute capacity constraints. Industry analysts back this — the previous economics were always temporary.

### 4.7 Claude Max 20× vs. Codex ChatGPT Pro $200 — head-to-head

| | Claude Max 20× post-June-15 | Codex ChatGPT Pro $200 |
|---|---|---|
| Cost | $200/mo | $200/mo |
| Interactive | Subscription-pool, generous | Standard ChatGPT Pro limits |
| Cloud/delegated | $200 metered credit | Plan-included, throttle-only |
| Best at | SWE-bench Verified (87.6%) | Terminal-Bench 2.0 (77.3%) |
| Context | 1M (Opus 4.7) | 400K |
| Overshoot | Halt or pay API rates | Throttle until 5h window resets |
| Pricing stability | 3 changes in 2 months | Flat since launch |

### 4.8 Recommendation for solo dogfood

Stay on Max for now. The $200 SDK credit is sized for individual experimentation — enough for the gradual ramp planned in § 5.5. Re-evaluate after one month of real usage data. Triggers to add Codex (not replace):
- Consistently burning >$150 of SDK credit per month
- Wanting to run multiple parallel agents (Codex's plan-included model wins on volume)
- The split shape is: Max for plan/design/critique (Opus quality matters), Codex for async execution fleet (volume matters). ~$400/mo combined.

---

## 5. md-manager-specific recommendations

### 5.1 Current state

- `workflow.md` is already a strong harness (Fowler-level "humans on the loop")
- Pipeline: clarify → plan → execute → commit → /simplify → /staff-review → present → iterate → /ship
- Two human gates: **plan approval** and **merge approval**. Both are non-negotiable and well-placed.
- Conductor running interactive Claude Code in worktrees — unaffected by June 15
- `roadmap.md` has a rich cleanup backlog: well-scoped, low-risk first-delegation candidates

### 5.2 The gap

The harness only fires when the human triggers it. The human is currently the workflow's transport layer. Async work means giving the harness a non-human entry point.

### 5.3 Where each step in the workflow lives in the async model

| Workflow step | In async model |
|---|---|
| 1. Request | Linear issue created (by human, or by Linear Agent from a meeting note) |
| 2. Clarify | Agent posts clarifying questions to Linear comments; human responds async |
| 3. Plan | Agent drafts plan, posts to Linear comment, **pauses for approval** — this is the new "plan-only" gate |
| 4. Execute | Agent runs the implementation |
| 5. Commit | Same |
| 6. /simplify | Same |
| 7. /staff-review | Same; could also auto-fire on PR open via GHA |
| 8. Present | Agent posts PR URL to Linear `externalUrl`, summary as comment |
| 9. Iterate | Human reviews on phone/walk, comments with feedback or `approved` |
| 10. /ship | Agent runs ship pipeline; human only sees the result |

Architectural insight: existing skills already cover steps 4–10. The missing primitive is **step 3 pause + Linear-as-surface for steps 1, 2, 8, 9**.

### 5.4 Where design-review touchpoints fit

Human stays heavily involved in initial ideas and design reviews on request, sharing artifacts for direction/context. That maps to:

- **Initial idea**: human creates the Linear issue, pastes artifacts (screenshots, design tokens, references) into the description
- **Design review**: agent's *plan* (step 3) is the review surface for design-y issues; human redirects with critique + new artifacts
- **Direction/context**: pinned comments on Linear issues, or `core-docs/feedback.md` entries the agent reads at session start

For issues touching `design-language.md`, page tints, surface posture, Mini adoption — keep these at L2 (conversational, with the human). Don't push them to L3+ delegation. Use Linear for tracking, not for delegation.

### 5.5 Recommended migration sequence

| Phase | Action | Estimated effort |
|---|---|---|
| Now | Claim Max 20× SDK credit (before June 15); unset `ANTHROPIC_API_KEY`; turn off overage | 30 min |
| Week 1 | Migrate `md-manager` into its own Linear team within `yamron` workspace | 1–2 hours |
| Week 1 | Install Claude Code Linear integration, grant access to `md-manager` team only | 30 min |
| Week 1 | Add CLAUDE.md note: "if delegated via Linear, post plan as comment before executing, post PR URL as externalUrl when done" | 5 min |
| Week 1 | Delegate one cleanup-tier issue from roadmap (candidate: "URL-encoded scheme detection in safeUrl" or "z-index tokens") | Observe |
| Week 2 | Review the three-thing list: what felt right / where you wanted to intervene / what the agent did that you wouldn't have. Update harness based on findings | 1 hour |
| Week 3 | Build "plan-only" mode: same pipeline through step 3, then pause and post plan to Linear. Unlocks design-review delegation | 2–4 hours |
| Week 4 | First design-y delegation with plan-only mode. Review plan in Linear, respond with approval/redirect | Observe |
| Month 2 | Audit SDK credit burn. Decide: stay Max-only, add Codex, or split workload | 1 hour |
| Month 3+ | Migrate other side projects into their own Linear teams. Add GHA `/staff-review` on PR open as a floor for any branch not triggered personally. Consider stacked PRs + merge queue if volume warrants. | Ongoing |

### 5.6 Things to add to the harness over time

Harness investments that compound most:

- **Evals.** As work moves toward L3+ for cleanup, typecheck + build + tests + `/security-review` + `/accessibility-review` become the safety net. Invest here before adding orchestration.
- **Escalation channels.** When agents get stuck, where does that surface? Linear comment is fine for now; pick one and make it loud.
- **Cost telemetry.** Anthropic console shows credit burn. Look at it weekly during ramp.
- **Decision records.** The `history.md` discipline becomes *more* important async, not less. The synthesized doc updates `/ship` produces become the project's nervous system.
- **Branch hygiene.** When multiple agents work on multiple branches, rebase strategy + merge queue become real concerns. Currently single-agent so theoretical.

---

## 6. Open questions / decisions deferred

1. **Mini adoption posture for delegated work** — should agents touching UI run the full Mini procedure (manifest update, generation-log entry, pattern-log) autonomously, or pause at the plan and let the human confirm design-language coherence? Lean toward pause until proven.
2. **When to wire GHA `/staff-review`** — only needed when something other than the human (or a Linear-delegated agent) can push branches. Defer.
3. **Conductor's role post-async** — keep for interactive design sessions and exploratory work; cede execution-heavy work to Linear-delegated agents. The two coexist.
4. **Cost ceiling for "agents make progress all day" mode** — depends entirely on volume. Need real burn data to answer. Re-evaluate at month 2.
5. **Stacked PRs adoption** — useful when individual features split cleanly into reviewable layers. md-manager isn't there yet (small PRs already work). Revisit when a feature naturally wants 3+ stacked layers.
6. **Linear Standard plan** — the $8/seat/mo upgrade unlocks automations and removes the team cap. Required for serious agent automation work, but defer until the basic delegation loop is validated manually.

---

## 7. The single most important thing

The most valuable artifact reviewed going forward isn't code — it's **plans**. The plan-review gate is where design judgment compounds. Build the async workflow around protecting that gate.

Everything else is plumbing.

---

## Sources

- [Anthropic — Use the Claude Agent SDK with your Claude plan](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan)
- [Anthropic — Use Claude Code with your Pro or Max plan](https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan)
- [Anthropic — Manage costs effectively (Claude Code docs)](https://code.claude.com/docs/en/costs)
- [Linear — AI Agents docs](https://linear.app/docs/agents-in-linear)
- [Linear — for Agents (supported coding agents)](https://linear.app/agents)
- [Linear — Developers / Agents](https://linear.app/developers/agents)
- [Linear — Introducing Linear Agent (changelog, Mar 2026)](https://linear.app/changelog/2026-03-24-introducing-linear-agent)
- [Linear — Automations integrations](https://linear.app/integrations/automations)
- [Linear — Cursor background agents changelog](https://linear.app/changelog/2025-08-21-cursor-agent)
- [InfoWorld — Anthropic puts Claude agents on a meter across its subscriptions](https://www.infoworld.com/article/4171274/anthropic-puts-claude-agents-on-a-meter-across-its-subscriptions.html)
- [The New Stack — Anthropic splits billing again: Agent SDK credit pools](https://thenewstack.io/anthropic-agent-sdk-credits/)
- [SiliconANGLE — Anthropic announces programmatic credit pool](https://siliconangle.com/2026/05/14/anthropic-announces-programmatic-credit-pool-agentic-tool-use-rises/)
- [VentureBeat — Anthropic reinstates OpenClaw and third-party agent usage (with a catch)](https://venturebeat.com/technology/anthropic-reinstates-openclaw-and-third-party-agent-usage-on-claude-subscriptions-with-a-catch)
- [The Information — Anthropic flexes pricing power](https://www.theinformation.com/articles/anthropic-flexes-pricing-power-customers-willingly-eat-cost)
- [The Decoder — Claude subscriptions get separate budgets for programmatic use](https://the-decoder.com/claude-subscriptions-get-separate-budgets-for-programmatic-use-billed-at-full-api-prices/)
- [DevToolPicks — Anthropic splits Claude subscriptions June 15](https://devtoolpicks.com/blog/anthropic-splits-claude-subscriptions-agent-sdk-credit-june-2026)
- [Zed Blog — What Anthropic's new billing means for Zed users](https://zed.dev/blog/anthropic-subscription-changes)
- [BigGo Finance — Theo Browne: 40× reduction in third-party tool access](https://finance.biggo.com/news/382b1ef1c37acfb3)
- [xda-developers — Claude subscriptions no longer include Agent SDK and claude -p](https://www.xda-developers.com/anthropics-claude-subscriptions-no-longer-include-agent-sdk-and-claude-p-usage/)
- [Where's Your Ed At — Claude Code removed from Pro (briefly)](https://www.wheresyoured.at/news-anthropic-removes-pro-cc/)
- [claudefa.st — Agent SDK Credit: $200/mo Free for Max 20x Users](https://claudefa.st/blog/guide/development/agent-sdk-credit)
- [Hacker News — Claude subscription changes coverage of `claude -p`](https://news.ycombinator.com/item?id=48126281)
- [OpenAI Help — Using Codex with your ChatGPT plan](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan)
- [OpenAI Help — Codex rate card](https://help.openai.com/en/articles/20001106-codex-rate-card)
- [VentureBeat — ChatGPT Pro $100 tier with 5× Codex usage](https://venturebeat.com/orchestration/openai-introduces-chatgpt-pro-usd100-tier-with-5x-usage-limits-for-codex)
- [LaoZhang — Codex usage limits across plans](https://blog.laozhang.ai/en/posts/openai-codex-usage-limits)
- [GitHub — Codex usage limits discussion](https://github.com/openai/codex/discussions/2251)
- [MorphLLM — Codex vs Claude Code benchmarks](https://www.morphllm.com/comparisons/codex-vs-claude-code)
- [Developers Digest — Claude Code vs Codex App 2026](https://www.developersdigest.tech/blog/claude-code-vs-codex-app-2026)
- [Martin Fowler — Humans and Agents in Software Engineering Loops](https://martinfowler.com/articles/exploring-gen-ai/humans-and-agents.html)
- [Swarmia — Five levels of AI coding agent autonomy](https://www.swarmia.com/blog/five-levels-ai-agent-autonomy/)
- [O'Reilly Radar — Conductors to Orchestrators](https://www.oreilly.com/radar/conductors-to-orchestrators-the-future-of-agentic-coding/)
- [GitHub Next — Agentic Workflows](https://githubnext.com/projects/agentic-workflows/)
- [GitHub Blog — Agentic primitives and context engineering](https://github.blog/ai-and-ml/github-copilot/how-to-build-reliable-ai-workflows-with-agentic-primitives-and-context-engineering/)
- [InfoQ — GitHub stacked PRs with agent integration](https://www.infoq.com/news/2026/04/github-stacked-prs/)
- [Cotera — Linear's built-in automations aren't enough](https://cotera.co/articles/linear-automation-guide)
- [MindStudio — Issue trackers as AI agent infrastructure](https://www.mindstudio.ai/blog/issue-trackers-ai-agent-infrastructure-jira-linear)
- [Damian Galarza — Linear-driven Claude Code agent loop](https://www.damiangalarza.com/posts/2026-02-13-linear-agent-loop/)
