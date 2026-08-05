# Design — a rating comment is capped at 15 words

## Context

`comment` is a free-text column on a persisted draft row (`content`, `briefs`, and the
strategy/video/youtube rows). Nineteen skills write one. The instruction is some variant of
*"a one-line Vietnamese `comment`"*, plus whatever that skill's own rules have added since.

Today's obligations, gathered from the live prose:

| Skill | What the comment must name today |
|---|---|
| `ssc-ads-writer` (l.523) | biggest reason · the rule / voice doc it traces to · the `brand/proof-points` row backing the mechanism · the out-of-family marker |
| `ssc-post-authority` (l.311) | biggest reason · the criterion it traces to · the same proof row + marker |
| `ssc-image-prompt-text` (l.334) | biggest reason · the formula · the opening frame · the proof row |
| `ssc-ads-brief` | biggest reason the angle is strong or weak |
| strategy / video / youtube skills | a rationale for the row's score |

Three of those are also `notes` on the set-level `coverage` record — same phrasing, same
drift.

`terms[]` already persists the axis terms structurally, and `opening_frame` is one of them.
So of everything the comment is asked to name, exactly one thing is persisted *nowhere else*:
the `brand/proof-points` row backing the mechanism beat.

## Goals

- The comment is scannable in a curation list — a couple of seconds, not a paragraph.
- Nothing auditable is lost that was not already recoverable.
- No judgement changes, and no judgement gets easier to dodge.

## Decisions

### D1 — Fifteen Vietnamese words, counted; shape left free

The cap is **counted, not eyeballed**, exactly as the on-image caps are. Fifteen words is
enough for *"CTA hơi mềm so với layer; còn lại bám đúng từ vựng của chị"* and not enough for
a paragraph of hedging — which is the point.

**The shape is deliberately not constrained.** A one-line or one-sentence rule is what the
current prose already has, and it bounds nothing: the count is the bound, so two short
clauses inside 15 words are as acceptable as one. No skill may add a sentence-count rule of
its own on top.

It is stated as a hard bar, not a target, because a soft cap is what the current
`one-line` phrasing already is.

### D2 — Exactly one tag may follow: the mechanism's backing proof row

Form: ` · proof: <row as the live doc names it>` plus `(ngoài nhóm bằng chứng của cơ chế)`
where the row sits outside the mechanism's own family. Outside the 15-word count, and
itself short — the row is named as the doc names it, never explained.

It survives the cull for one reason: it is the only obligation with no other persistent
home. The run report is chat and does not outlive the session; `terms[]` carries the proof
*family* (`proof_device`), never the row. Dropping it would make the
`mechanism-proof-substantiation` chain unauditable a day later.

**Where no mechanism beat exists** — a blank `brief.mechanism`, or a section that writes no
mechanism beat — the tag is **absent**. Not empty, not `NONE`, not a note about its absence:
absence is already reported in the run summary, which is where the "no mechanism on this
brief" fact belongs.

### D3 — Everything else stops being a comment obligation

The rule / voice doc it traces to, the formula, the opening frame, the axis terms: all
leave. Each is either already persisted structurally (`terms[]`, the `coverage` record) or
is the run's business rather than the row's. **Removing them from the comment does not
remove them from the judgement** — a variation is still judged against the floor, still
records its axis terms, still declares its opening frame. Only the prose obligation goes.

### D4 — The same cap binds the coverage `notes`

The set-level verdict's `notes` is the same artifact for a set instead of a row, drifted the
same way. Fifteen words: what the set is missing, or why it passes. The
`axes_missing` list is structured and carries the detail.

### D5 — The cap may never change a judgement (the load-bearing guard)

Stated in every edited skill, because it is the failure this change could cause: when a
variation's faults do not fit, the comment names **the single biggest one**. It never
becomes a reason to

- soften or withhold a REJECT (a floor failure is a rejection regardless of what the
  comment can hold),
- inflate or deflate a score so the reason gets shorter,
- merge two distinct findings into one vague phrase,
- or drop the coverage verdict's substance.

The reason that did not fit belongs in the run report, which has no cap.

### D6 — Applies to every skill that persists a comment

All nineteen, not just the heavy producers. A cap that binds five skills and not the rest
reproduces the drift somewhere else, and the strategy rows are read in exactly the same
scanning posture.

### D6b — The post channel gains `terms[]`, because its frame had nowhere else to live

D3 says the opening frame leaves the comment because it is already an axis term the row
carries. That is true on the ad and image paths and **false on the post path**:
`ssc-post-authority` passes no `terms[]` at all and holds no `list_taxonomies`, so the
comment was the frame's only durable home.

Rather than keep the frame in the post comment — where it would take the single tag slot the
mechanism's backing proof row needs — the post path persists its axis terms like the others:
`list_taxonomies` joins its `tools:`, and `save_content` carries `terms[]`. `save_content`
already accepts them with no channel gate, and the post channel already judges set coverage
over these axes every run, so this records what it was already deciding.

The server validates strictly: an unknown term id, or two terms of a single-cardinality
axis, refuses the whole write and persists nothing. The skill states that refusal rather
than discovering it.

### D7 — Not enforced by anything

`comment` is free text server-side; nothing validates length, and this change adds no
validator. It is a prose discipline of the same kind as the on-image word caps — which is
worth stating plainly in the skills rather than implying a gate exists.

## Risks

- **A skill silently ignores the cap.** Nothing enforces it. Mitigated by stating it as a
  counted bar in the same words everywhere, so a review can grep for it.
- **A rejection gets softened to fit** — the real risk. D5 is stated in every edited file
  and is the first thing to check in review.
- **Nineteen files, one rule.** The wording must be identical everywhere or the next change
  will re-drift one of them. Task 4.1 is a cross-read for exactly that.
