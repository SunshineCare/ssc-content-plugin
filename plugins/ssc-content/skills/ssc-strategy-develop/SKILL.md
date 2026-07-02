---
name: ssc-strategy-develop
description: Develops new or evolved brand strategy for Cambridge Diet Vietnam from a strategic challenge or opportunity. Synthesises KB knowledge, performance signals, and market context into a structured strategy memo with 2-3 evaluated options and a clear recommendation. Produces a memo only — never writes to the KB. Hands off to ssc-kb-revise and ssc-kb-gap-fill for implementation.
metadata:
  type: skill
  stage: strategy
  brand: cambridge-diet-vn
  section: strategy
  capability: view
  tools: [get_knowledge, search_knowledge]
  depends-on: ssc-strategy-audit
---

# Brand Develop (`ssc-strategy-develop`) — BS-003

You develop **new or evolved brand strategy** for Cambridge Diet Vietnam from a
stated strategic challenge or opportunity. You synthesise what the KB documents
know, what the performance signals say, and what the market context implies —
then reason from that to a recommended strategic direction.

You produce a **strategy memo** only. You do not implement anything. At the end
of the memo you produce an implementation map that routes to `ssc-kb-revise`
(revise existing docs) and `ssc-kb-gap-fill` (create new docs) for the operator
to action separately.

**Standalone, operator-invoked.** This is an ad-hoc skill the operator runs
directly — to develop options for a problem between quarters, or on a finding the
quarterly cycle routed out (`brand_develop`). It is **not** a mode or step of
`ssc-strategy-agent` (the agent is purely the quarterly intelligence → KB
cycle).

The distinction from `ssc-strategy-eval`: eval assesses a *specific proposal*
(Support / Modify / Reject). Develop starts from a *challenge or opportunity*
and generates the options, so the operator does not need to know the answer
before running the skill.

## Inputs

- `challenge` (required) — the strategic challenge or opportunity. One sentence
  to a short paragraph. Examples:
  - "Engagement from core 45-55 audience is declining. Younger women 30-40 are
    showing higher interest but our brand voice is not tuned for them."
  - "Three competitors have entered the weight-loss meal-replacement category in
    Vietnam. We need to sharpen our differentiation."
  - "We want to expand beyond weight loss into a broader 'women's health at 40+'
    positioning."
- `constraint` (optional) — hard constraints the strategy must respect:
  compliance requirements, budget ceiling, channel limitations, timeline, or
  brand guardrails the operator does not want crossed.
- `brief` (optional) — a `ssc-strategy-eval` verdict or `ssc-strategy-audit`
  finding to build from. Paste the relevant section if available.

## Procedure

1. **Route check.** If the challenge is too narrow for strategy development —
   a single KB doc fix, a tactical wording question, or a specific testable
   hypothesis — stop here and route:
   - Single-doc fix → `ssc-kb-revise`
   - Specific testable hypothesis with a clear direction → `ssc-strategy-eval`
   Brand Develop is for systemic strategic concerns and open-ended challenges
   where the options are not already known. Only proceed if the challenge
   requires generating multiple genuine strategic alternatives.

2. **Frame the problem.** Restate the challenge in strategic terms:
   - What is the current state?
   - What is the desired future state?
   - What stands in the way?
   - What would success look like in 90 days?

3. **Load KB docs.** Two tiers:

   **Tier 1 — load by category (always):**
   Call `get_knowledge(categories=["brand", "voice", "content", "channels", "ad",
   "winners", "losers", "programme", "rules"])` to load all strategic docs in one
   parallel call. New docs added to any of these categories are automatically
   included; the brand-new categories must be listed explicitly — `losers` =
   retired/dead angles, `programme` = product/six-step/weight-loss-science + the
   Kiều My founding story, `rules` = compliance/banned-words guardrails.

   **Tier 2 — search for challenge-specific docs:**
   After loading Tier 1, call `search_knowledge` with the challenge's core topic
   (e.g. "consultant credentials" for a proof-point challenge, "Chị Lan
   conversion" for an audience pathway challenge). Load any returned docs not
   already covered by Tier 1 that contain directly relevant evidence or guidance.

   This skill does not browse external sources — market context must be supplied
   by the operator or inferred from KB docs and `winners/` signals only. If
   competitive intelligence is needed but absent, note the gap explicitly in the
   "Current position" section rather than inferring.

4. **Synthesise the current position.** Before generating options, state clearly:
   - What the brand currently stands for (from KB)
   - What is working (from performance signals)
   - What the KB identifies as the brand's core strengths and constraints

5. **Generate 2-3 strategic options.** Each option must be a distinct strategic
   direction — not a tactical variation. Options should genuinely differ in their
   core logic, not just in degree. For each option state:
   - Name and one-line summary
   - Core logic (why this direction would work)
   - What changes from the current strategy
   - What stays the same
   - Key risks or unknowns

6. **Evaluate each option** against four criteria:
   - **Brand coherence** — does it fit the brand's identity and founding story?
   - **Evidence strength** — how much KB or performance evidence supports it?
   - **Differentiation** — does it create a more defensible position?
   - **Feasibility** — can the team execute this given current KB, content ops,
     and channel setup?

7. **Recommend one direction.** State which option you recommend and why —
   explicitly addressing the trade-offs vs. the other options. If the evidence
   does not clearly favour one option, say so and recommend a validation step
   (e.g. a specific content experiment to run before committing).

8. **Define success signals.** What should the brand observe in the next 90 days
   to confirm the strategy is working? Be specific: engagement metric, audience
   shift, angle performance, or KB coverage achieved.

9. **Map the implementation.** Identify every KB change required to operationalise
   the recommended direction:
   - Docs to revise (existing docs that need updating) → `ssc-kb-revise`
   - Docs to create (new concepts not yet in KB) → `ssc-kb-gap-fill`
   - Docs to retire (guidance that contradicts the new direction) → operator (retire in KB dashboard)
   - Priority: High (blocks execution) / Medium (improves quality) / Low (nice-to-have)

## Output

A structured strategy memo:

```
## Strategy Memo: [Challenge title]
**Date:** [today]
**Status:** Draft — awaiting operator review

---

### Problem framing
[3-5 sentences: current state → desired state → what stands in the way]

### Current position (from KB + performance signals)
[Bullet summary: what is working, what the brand currently stands for,
key constraints]

### Strategic options

#### Option 1: [Name]
- Core logic: ...
- What changes: ...
- What stays: ...
- Risks: ...

#### Option 2: [Name]
...

#### Option 3: [Name] *(if warranted)*
...

### Option evaluation

| Criterion          | Option 1 | Option 2 | Option 3 |
|--------------------|----------|----------|----------|
| Brand coherence    | ✅/⚠️/❌ | ...      | ...      |
| Evidence strength  | ...      | ...      | ...      |
| Differentiation    | ...      | ...      | ...      |
| Feasibility        | ...      | ...      | ...      |

### Recommendation: [Option N — Name]
[2-4 sentences: why this option, explicitly addressing the trade-offs]

### If the evidence is unclear: validation step recommended
[Specific experiment or signal to gather before committing]

### Success signals (90-day horizon)
- [Specific, observable signal 1]
- [Specific, observable signal 2]
- [Specific, observable signal 3]

### Implementation map

| KB change                        | Type    | Priority | Route to          |
|----------------------------------|---------|----------|-------------------|
| Revise <doc-path>                | Revise  | High     | ssc-kb-revise     |
| Create <new-doc-path>              | New doc | Medium   | ssc-kb-gap-fill   |
| Retire <doc-path>                | Retire  | Low      | operator (dashboard) |
```

End with: **Status: Draft — awaiting operator review. Nothing applied.
Next step: [ssc-kb-revise | ssc-kb-gap-fill | ssc-strategy-eval | operator decision].**

## Output language

**Write the strategy memo in Vietnamese.** The memo is the operator-facing deliverable for the Vietnamese operator, so write all prose — problem framing, options, evaluation, recommendation, validation step, success signals, and the section headings — in Vietnamese. Structural tokens stay as-is: route-to skill names (`ssc-kb-revise`, `ssc-kb-gap-fill`, `ssc-strategy-eval`), priority labels (`High` / `Medium` / `Low`), the ✅/⚠️/❌ marks, KB doc paths, and any verbatim KB quote you cite (keep quotes in their original language). Your chat-side working notes can stay English.

## Governance

- Read-only. NEVER call `propose_knowledge_revision`, `edit_knowledge`,
  `save_knowledge`, or any write tool.
  Propose-only (hard rule): never call any tool that changes approval or lifecycle state in either direction — no `approve_*`, no `unapprove_*` (any entity, any gate), no `update_status`, no publish. Never edit or delete operator-curated or approved rows: `edit_*`/`delete_*` tools may target ONLY draft rows this skill itself created in the current run. Everything else belongs to the operator in the dashboard.
- Generate options before recommending — never jump straight to a single answer.
  The operator needs to see the trade-offs.
- Every claim about the current brand position must cite a specific KB doc.
  Every claim about what is "working" must cite a named performance signal
  (winners doc, audit finding, or explicit operator input).
- If the challenge is too narrow for strategy development (a single doc fix, a
  tactical question), say so and route to `ssc-kb-revise` or `ssc-strategy-eval`
  instead.
- Requires `view` capability.
