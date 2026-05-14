# Feedback Log

User feedback synthesized into actionable guidance. When the user gives feedback — corrections, preferences, reactions, direction changes — the relevant insight is captured here so it shapes all future work.

This is not a transcript. Each entry distills feedback into a rule or preference that applies going forward.

---

## How to Write an Entry

```
### FB-XXXX: [Short summary of the feedback]
**Date:** YYYY-MM-DD
**Source:** user correction | user preference | user direction | review feedback

**What was said:** Brief, factual summary of the feedback.

**Synthesized rule:** The actionable takeaway — what to do differently going forward.

**Applies to:** [areas this affects: ux, code, architecture, workflow, etc.]
```

### Numbering
Increment from the last entry. Use `FB-0001`, `FB-0002`, etc.

### Source types
- **user correction** — user fixed something you did wrong
- **user preference** — user expressed a stylistic or process preference
- **user direction** — user set strategic direction or priorities
- **review feedback** — issues found during code/design review

---

## Entries

### FB-0006: Audit docs against framework best practices, not intuition
**Date:** 2026-05-13
**Source:** user direction

**What was said:** "Review this against Anthropic's best practices for docs. Let's make sure they will be enforced correctly."

**Synthesized rule:** When standing up or revising docs, explicitly audit against the framework's own published best practices (Anthropic's Claude Code docs in this case). Common gotchas the audit caught here: CLAUDE.md needs a Commands section so the model doesn't grep `package.json`; rules without explicit `paths:` frontmatter aren't reliably auto-loaded; the rules-table in CLAUDE.md must match the actual frontmatter of each rule file, or the model trusts contradictory information; uncompliable rules (e.g. "history.md must include commit SHA" when /ship writes the entry before committing) erode trust in the entire rule system.

**Applies to:** workflow, docs, agent infrastructure.

### FB-0005: Don't lock open questions shut by documenting them as decisions
**Date:** 2026-05-13
**Source:** user correction

**What was said:** "I haven't decided if we want to do all flat vs flat + floating, and we will likely implement Mini shortly — don't make hard decisions on these."

**Synthesized rule:** When framing divergences between sister apps (or anywhere documenting product or design decisions), distinguish **confirmed divergences** from **open questions**. Use explicit "Status: undecided" language for open questions and route them to plan.md / roadmap.md so they aren't accidentally closed by future sessions. Default to "current behavior" framing, not "committed choice" framing, when the user hasn't explicitly committed.

**Applies to:** docs, design-language, workflow.

### FB-0004: Sister-app framing — shared DNA, distinct personality, open to divergence
**Date:** 2026-05-13
**Source:** user direction

**What was said:** "We are a sister app with Designer and share DNA of the design language, but that shouldn't limit creating new patterns if there is a good rationalization. They are sister apps, not copies. There should be some unique personality and variation, but they should be cohesive."

**Synthesized rule:** md-manager and Designer are siblings, not clones. New divergent patterns are welcome **with rationalization** — log the reasoning in history.md. The page tint color rail is the canonical example of intentional divergence from Designer's monochrome policy. Don't reinvent foundations (radius scale, spacing rhythm, type roles, sand palette, Geist) without an axiom-style entry. Cross-check Designer before committing to a new pattern that could benefit both apps.

**Applies to:** design-language, ux, architecture.

### FB-0003: Skills should compose with skills via the Skill tool, not embed each other's prompts
**Date:** 2026-05-13
**Source:** user preference

**What was said:** "I'd rather the security review and accessibility review skills exist on their own so that I can call them individually if needed. The ship skill should invoke them."

**Synthesized rule:** When one skill needs to use another's logic, the parent skill should invoke the child via the Skill tool — don't copy-paste the child's lens prompt into an Agent call inside the parent. Implication: child skills need `disable-model-invocation: true` removed so they're reachable from the Skill tool (with a description specific enough that auto-invocation doesn't fire when not wanted). Keeps each skill standalone-callable and avoids prompt duplication that drifts over time.

**Applies to:** workflow, skill architecture.

### FB-0002: Context-isolation agents are escape hatches, not workflow defaults
**Date:** 2026-05-13
**Source:** user direction

**What was said:** Discussion about whether to keep the template's planner/domain/ui/testing/docs agents. User asked: "Are the agents of any use alongside the skills? Can the agents run the skills? ... If they aren't useful, we can delete them, but make sure we're not getting rid of something that will accelerate our workflow."

**Synthesized rule:** Default to skills, not agents. Agents (`planner`, `docs`) are useful only for **context isolation** — when the main thread is full of unrelated code and a clean slate produces a better artifact. Their `description:` should actively discourage default invocation ("use only when..."). Don't delete blindly; understand the role first.

**Applies to:** workflow, agent infrastructure.

### FB-0001: Workflow shape and discipline (canonical session loop)
**Date:** 2026-05-13
**Source:** user direction

**What was said:** "This is the workflow I want to follow: I make a request → Claude asks clarifying questions → reviews necessary docs → creates a plan → I approve → Claude executes → commits → goes into staff-review → presents review + dev URL + PR (not merged) → I may iterate → I'll tell Claude to ship → security + a11y review → fixes → update roadmap/plan/spec → synthesize feedback from chat into feedback.md → PR opened (not merged)."

**Synthesized rule:** Canonical loop is `clarify → plan → user approves → execute → commit → /staff-review → present → iterate → /ship → STOP`. Hard rules: never code without an approved plan; never merge; follow-ups go to roadmap.md / plan.md, not only the PR body; `/ship` owns all doc updates (don't update history/plan/roadmap/spec/feedback piecemeal mid-feature). `/ship` includes a feedback-synthesis step that reviews the session for corrections, preferences, and solved challenges and writes them here.

**Applies to:** workflow (canonical).
