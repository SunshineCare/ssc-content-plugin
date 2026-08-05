# A rating comment is capped at 15 words

## Why

Every draft row a skill persists carries a Vietnamese `comment` — the rationale a
Vietnamese operator reads in the dashboard while curating. The only limit on it is the
phrase **"one-line"**, which counts nothing, and its *obligations* have accumulated one
change at a time: name the single biggest reason, name the rule or voice doc it traces
to, name the row of `brand/proof-points` the mechanism beat leans on, append the
out-of-family marker, name the formula, name the opening frame. Each of those was a
reasonable addition on its own; together they made the comment a paragraph.

That defeats what the comment is for. It is a **curation aid** — the operator scans a set
of drafts and decides which to approve. A rationale that takes as long to read as the
variation it describes is not scanned, so the signal it carries is not received. The
audit material inside it is also the wrong shape: axis terms are already persisted
structurally in `terms[]`, the opening frame is one of those terms, and the rule a
variation traces to is the run's business, not the row's.

## What Changes

- **A persisted `comment` is at most 15 Vietnamese words, counted.** How many sentences
  those words form is the skill's call — the count is the bound, and no skill imposes a
  one-line shape on top of it. It carries the reason the variation is strong or weak, and
  nothing else.
- **Exactly one thing may follow it: the mechanism's backing proof row**, as one compact
  trailing tag (with the out-of-family marker where it applies), outside the 15-word count
  and itself capped. It stays because the saved row is the only place it persists — the
  run report is chat, and nothing else records it. Where no mechanism beat exists, the tag
  is absent, not empty.
- **Every other naming obligation leaves the comment**: the rule / voice doc it traces to,
  the formula, the opening frame, the axis terms. They are already carried by `terms[]`,
  the coverage record, and the run's own report, and none of them needs restating in prose
  a human reads while curating.
- **The same cap binds the coverage `notes`** — the rationale on the set-level
  verdict, which drifted for the same reason.
- **The cap changes nothing about what is JUDGED.** A floor failure is still a REJECT, a
  score is still honest, a coverage verdict still decides whether a set ships. When a
  variation's faults exceed what 15 words can hold, the comment names the biggest one — it
  never becomes a reason to soften a verdict, skip a rejection, or merge two findings into
  a vague one.

## Capabilities

### New Capabilities

- `rating-comment-shape`: what a persisted rating comment is — its cap, the one tag that
  may follow it, what is no longer its job, and what the cap may never do to a judgement.

### Modified Capabilities

- `mechanism-proof-substantiation`: the backing proof row is named as a compact tag rather
  than as prose inside the comment; the chain itself is unchanged.
- `ads-brief-angles`: the angle brief's self-score comment carries the cap instead of the
  uncounted "one-line".
- `on-image-copy-authoring`: same, for the on-image candidate's comment.

## Impact

**Files (prose only — no code):** every skill that persists a `comment` or a coverage
`notes`.

- Content producers and judges: `ssc-ads-writer`, `ssc-post-authority`, `ssc-post-produce`,
  `ssc-image-prompt-text`, `ssc-ads-brief`.
- Idea, schedule and channel skills: `ssc-ads-ideate`, `ssc-post-ideate`,
  `ssc-post-schedule`, `ssc-youtube-ideate`, `ssc-youtube-seo`, `ssc-video-script`,
  `ssc-video-storyboard`.
- Strategy skills: `ssc-strategy-ad-intelligence`, `-audience-intelligence`,
  `-competitor-intelligence`, `-content-gap`, `-kol-discovery`,
  `-performance-retrospective`, `-territory-explorer`.
- `plugins/ssc/.claude-plugin/plugin.json` — version bump, same commit.
- `chatgpt/workflows.json` + the `content/` mirror — regenerated and republished.

**Explicitly untouched:**

- The BrandOS server. `comment` is a free-text column; no schema, tool or validation
  changes, and nothing enforces the cap server-side — it is a prose discipline, as the
  on-image word caps are.
- What is judged, and every consequence of a judgement: the floor as a REJECT, the
  set-level coverage verdict, the ≥3-distinct proof bar, the mechanism proof-backing cap
  at ≤3, the person-rule opening frame, the regenerate loop.
- `terms[]`, the `coverage` record, and the run report — they already carry the names the
  comment sheds, and gain nothing new.
- Persisted prose stays Vietnamese.
- The propose-only invariant.

**Accepted cost.** Fifteen words rarely hold two independent faults. That is deliberate —
the operator gets the biggest one, and the run report still carries the full picture for
anyone reading the session. The risk to watch is a skill quietly downgrading a rejection
because the reason would not fit; the spec forbids it explicitly, and it is the one thing
worth checking in review.
