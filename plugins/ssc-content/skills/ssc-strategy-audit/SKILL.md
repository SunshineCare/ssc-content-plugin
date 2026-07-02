---
name: ssc-strategy-audit
description: Quarterly strategic health check for Cambridge Diet Vietnam brand strategy. Evaluates whether the documented brand strategy is still fit for purpose across positioning, audience, messaging architecture, channel allocation, and brand voice. Produces a structured strategic health report with prioritised findings and recommended next steps. Read-only — never writes to the KB.
metadata:
  type: skill
  stage: strategy
  brand: cambridge-diet-vn
  section: strategy
  capability: view
  tools: [get_knowledge, search_knowledge]
  depends-on: ssc-kb-review
---

# Brand Audit (`ssc-strategy-audit`) — BS-001

You perform a **strategic health check** of the Cambridge Diet Vietnam brand
strategy. This is not a KB document audit — it is an assessment of whether the
*strategy itself* is still sound. You load KB docs as evidence and evaluate them
against strategic criteria, not document quality criteria. You produce findings
and recommendations only — you NEVER call any write or proposal tools.

**Standalone, operator-invoked.** This is an ad-hoc skill the operator runs
directly between quarters when they want a strategic health check — it is **not**
a mode or step of `ssc-strategy-agent` (which is purely the quarterly
intelligence → KB-feedback cycle). Run it on its own; it has no agent dependency.

The distinction from `ssc-kb-review`: KB review checks document health
(contradictions, staleness, gaps at the doc level). Brand audit checks strategic
health (is our positioning still differentiated? are our angles still resonating?
is our audience definition still accurate?). Both can run in the same cycle; they
address different levels.

## Audit dimensions

Evaluate in this order:

1. **Positioning strength** — Is the brand's differentiation from competitors
   clear, specific, and still defensible? Does the positioning hold up against
   the current market (weight-loss category in Vietnam 2026)?

2. **Audience fit** — Do the documented personas still reflect the real audience?
   Are there demographic shifts, life-stage changes, or new audience segments the
   current strategy ignores or underserves?

3. **Messaging architecture** — Are the angles, proof points, and voice guidance
   internally coherent and ranked in a sensible hierarchy? Are the winning angles
   (from performance data) reflected in the KB, or has drift occurred?

4. **Channel strategy alignment** — Does the effort allocation across channels
   (Facebook 75%, YouTube 20%, other 5%) reflect actual results and 2026 platform
   realities? Are there channel opportunities the strategy is not capturing?

5. **Brand voice consistency** — Is the voice guidance consistent across all KB
   docs? Does the documented voice match what is actually produced and what
   resonates in practice?

## Inputs

- Optional `focus` — one or more dimensions to scope the audit:
  `positioning | audience | messaging | channels | voice | all` (default: `all`)
- Optional context note — any recent market development, performance signal, or
  strategic concern the operator wants the audit to factor in.

## KB Access Pattern

### Tier 1 — Load by category (always, deterministic)

Call `get_knowledge(categories=["brand", "voice", "content", "channels", "ad",
"winners", "losers", "programme", "rules"])` at the start of every run. This
returns ALL live docs across all strategic categories in one parallel call — new
docs are automatically included without requiring a path list update. Loading by
category auto-absorbs new *docs*, but a brand-new *category* must be listed
explicitly: `losers` = retired/dead angles (direct evidence of angle drift),
`programme` = product catalog / six-step / weight-loss-science / Kiều My founding
story (the substance positioning and audience fit rest on), and `rules` =
compliance + banned-words guardrails that bound messaging and voice.

### Tier 2 — Search for context-specific evidence

Use `search_knowledge` for two purposes:

- **Focus-scoped gaps** — when `focus` is set (e.g. `audience`), search for any
  docs outside Tier 1 that are directly relevant to that dimension.
- **Gap confirmation** — before flagging a strategic gap as absent, search to
  confirm no doc covers it.

## Procedure

1. Load all Tier 1 docs in parallel via `get_knowledge`.
2. If `focus` is set, use `search_knowledge` to surface any additional docs
   relevant to that specific dimension (Tier 2).
3. For each dimension in scope, synthesise what the KB says the strategy IS, then
   assess whether that strategy is still sound given:
   - Internal coherence across docs
   - Alignment with performance signals (winners docs)
   - Fit with 2026 market realities (Vietnamese health advertising landscape,
     platform algorithm behaviour, competitive weight-loss category)
4. Use `search_knowledge` to verify whether a suspected strategic gap is truly
   uncovered before flagging it.
5. For each finding, determine the correct next step:
   - **`ssc-strategy-eval`** — the finding suggests a specific strategic direction
     worth evaluating before committing to change
   - **`ssc-strategy-develop`** — the finding indicates a deeper strategic shift is
     needed; a full development process is warranted
   - **`ssc-kb-revise`** — the finding is a doc-level fix (evidence quote, outdated
     stat, minor inconsistency) that does not require strategic deliberation
   - **`maintain`** — monitor but no action needed now

## Output

One finding block per issue:

```
### [Dimension]: [Short title]
- status: strong | at_risk | needs_evolution
- severity: high | medium | low
- finding: <two to four sentences stating the strategic problem — not a doc problem>
- evidence: "<exact KB quote OR performance signal that triggered this finding>"
- implication: <one sentence on what this means for the brand if unaddressed>
- next_step: ssc-strategy-eval | ssc-strategy-develop | ssc-kb-revise | maintain
```

Order findings by severity (high first) within each dimension. After all
findings, emit a **strategic health summary table**:

```
| Dimension         | Status         | Highest-severity finding        |
|-------------------|----------------|---------------------------------|
| Positioning       | 🟢 Strong      | —                               |
| Audience          | 🔴 Needs work  | HIGH: core 45-55 segment fading |
| Messaging         | 🟡 At risk     | MEDIUM: angle fatigue on ...    |
| Channel strategy  | 🟢 Strong      | —                               |
| Brand voice       | 🟡 At risk     | MEDIUM: pronoun drift in ad/    |
```

Status icons: 🔴 = HIGH finding present. 🟡 = MEDIUM only. 🟢 = LOW or none.

End with a **recommended actions list** grouped by next-step type:
- Run `ssc-strategy-eval` on: [finding titles]
- Run `ssc-strategy-develop` on: [finding titles]
- Route to `ssc-kb-revise`: [finding titles]

End with a one-line count: **N dimensions evaluated — X with findings
(H high / M medium / L low), Y clean.**

## Output language

**Write the audit in Vietnamese.** The findings and the strategic-health summary are the operator-facing deliverable for the Vietnamese operator, so write all prose — `finding`, `implication`, the recommended-actions list, the summary table cells — in Vietnamese. Structural tokens stay as-is: `status` (`strong` / `at_risk` / `needs_evolution`), `severity` (`high` / `medium` / `low`), `next_step` skill names, the 🔴/🟡/🟢 icons, KB doc paths, and any verbatim KB quote in `evidence` (keep quotes in their original language). Your chat-side working notes can stay English.

## Governance

- Read-only. NEVER call `propose_knowledge_revision`, `edit_knowledge`,
  `save_knowledge`, `approve_*`, or any write tool.
- Assess strategy, not document formatting or style.
- Find strategic problems only — do not emit a finding block for a dimension
  with no concerns. Clean dimensions appear in the summary table with status
  🟢 and no finding block.
- Base all findings on evidence from the KB or named performance signals — no
  unsupported strategic opinions.
- Requires `view` capability.
